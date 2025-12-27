import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler.middleware.js';
import { hubtelService } from '../services/hubtel.service.js';
import { prisma } from '../utils/prisma.js';
import { logger, logPayment } from '../utils/logger.js';
import { env } from '../config/env.js';

/**
 * Handle Hubtel webhook callback
 * POST /api/webhooks/hubtel
 */
export const handleHubtelWebhook = asyncHandler(async (req: Request, res: Response) => {
  const payload = req.body;

  logger.debug('Hubtel webhook received', { payload });

  // Process the webhook
  const processed = hubtelService.processWebhook(payload);

  if (!processed.isValid || !processed.reference) {
    logger.warn('Invalid webhook payload', { payload });
    // Still return 200 to prevent retries
    res.json({ received: true, processed: false });
    return;
  }

  const { reference, status, amount, transactionId, phone, name } = processed;

  // Check if we already have this payment
  const existingPayment = await prisma.payment.findUnique({
    where: { reference },
    include: { ticket: true },
  });

  if (existingPayment) {
    // Update existing payment status
    if (existingPayment.status === 'PENDING' && status === 'success') {
      await prisma.payment.update({
        where: { reference },
        data: {
          status: 'SUCCESS',
          externalId: transactionId,
          paidAt: new Date(),
        },
      });

      // Update ticket status if exists
      if (existingPayment.ticket) {
        await prisma.ticket.update({
          where: { id: existingPayment.ticketId },
          data: { status: 'PAID' },
        });
      }

      logPayment('Payment confirmed via webhook', { reference, status: 'success' });
    } else if (status === 'failed') {
      await prisma.payment.update({
        where: { reference },
        data: { status: 'FAILED' },
      });

      logPayment('Payment failed via webhook', { reference });
    }

    res.json({ received: true, processed: true, existing: true });
    return;
  }

  // New payment - create ticket if successful
  if (status === 'success' && phone) {
    try {
      const { createTicket } = await import('../services/ticket.service.js');
      
      const ticketResult = await createTicket({
        name: name || 'VBS Attendee',
        phone,
        amount,
        status: 'PAID',
      });

      if (ticketResult.success) {
        // Create payment record
        await prisma.payment.create({
          data: {
            ticketId: ticketResult.data.id,
            amount,
            status: 'SUCCESS',
            provider: 'HUBTEL',
            reference,
            externalId: transactionId,
            customerMsisdn: phone,
            customerName: name,
            paidAt: new Date(),
          },
        });

        logPayment('Ticket created from webhook', {
          reference,
          ticketId: ticketResult.data.ticketId,
          amount,
        });
      }
    } catch (error) {
      logger.error('Failed to create ticket from webhook', { error, reference });
    }
  }

  // Always return success to prevent webhook retries
  res.json({ received: true, processed: true });
});

/**
 * Webhook status endpoint for health checks
 * GET /api/webhooks/status
 */
export const webhookStatus = asyncHandler(async (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    endpoints: {
      hubtel: '/api/webhooks/hubtel',
    },
    timestamp: new Date().toISOString(),
  });
});

/**
 * Test webhook endpoint (development only)
 * POST /api/webhooks/test
 */
export const testWebhook = asyncHandler(async (req: Request, res: Response) => {
  if (env.NODE_ENV === 'production') {
    res.status(404).json({ error: 'Not found' });
    return;
  }

  const payload = req.body;
  const processed = hubtelService.processWebhook(payload);

  res.json({
    received: true,
    processed,
    note: 'This is a test endpoint. No actual processing performed.',
  });
});

