import { Request, Response } from 'express';
import { asyncHandler, Errors } from '../middleware/errorHandler.middleware.js';
import { hubtelService } from '../services/hubtel.service.js';
import { prisma } from '../utils/prisma.js';
import { normalizePhone, getHubtelChannel } from '../utils/phone.js';
import { logPayment } from '../utils/logger.js';
import type { DirectReceiveInput } from '../validators/payment.validator.js';

/**
 * Initiate payment (USSD prompt to customer)
 * POST /api/payments/initiate
 */
export const initiatePayment = asyncHandler(async (req: Request, res: Response) => {
  const { amount, channel, customerMsisdn, customerName, description } = req.body as DirectReceiveInput;

  const normalizedPhone = normalizePhone(customerMsisdn);
  if (!normalizedPhone) {
    throw Errors.badRequest('Invalid phone number');
  }

  // Detect channel from phone if not provided
  const paymentChannel = channel || getHubtelChannel(normalizedPhone);
  if (!paymentChannel) {
    throw Errors.badRequest('Could not determine mobile money channel. Please specify.');
  }

  const result = await hubtelService.receiveMoneyDirect({
    amount,
    phone: normalizedPhone,
    channel: paymentChannel,
    customerName,
    description,
  });

  if (!result.success) {
    throw Errors.badRequest(result.error);
  }

  // Store pending payment
  // Note: We'll link to ticket when webhook confirms
  logPayment('Payment initiated', {
    reference: result.data.reference,
    amount,
    phone: normalizedPhone,
  });

  res.json({
    success: true,
    data: {
      reference: result.data.reference,
      status: 'pending',
      message: result.data.message,
    },
  });
});

/**
 * Check payment status
 * GET /api/payments/status/:reference
 */
export const checkStatus = asyncHandler(async (req: Request, res: Response) => {
  const { reference } = req.params;

  // First check our database
  const payment = await prisma.payment.findUnique({
    where: { reference },
    include: { ticket: true },
  });

  if (payment) {
    res.json({
      success: true,
      data: {
        reference: payment.reference,
        status: payment.status.toLowerCase(),
        amount: payment.amount,
        ticketId: payment.ticket?.ticketId,
        paidAt: payment.paidAt,
      },
    });
    return;
  }

  // If not in DB, check with Hubtel
  const result = await hubtelService.getTransactionStatus(reference);

  if (!result.success) {
    throw Errors.notFound('Payment');
  }

  res.json({
    success: true,
    data: result.data,
  });
});

/**
 * Verify payment and link to ticket
 * POST /api/payments/verify
 */
export const verifyPayment = asyncHandler(async (req: Request, res: Response) => {
  const { reference, phone, name } = req.body;

  if (!reference) {
    throw Errors.badRequest('Payment reference is required');
  }

  // Check payment status with Hubtel
  const statusResult = await hubtelService.getTransactionStatus(reference);

  if (!statusResult.success) {
    throw Errors.badRequest(statusResult.error);
  }

  if (statusResult.data.status !== 'success') {
    res.json({
      success: false,
      status: statusResult.data.status,
      message: 'Payment not yet confirmed',
    });
    return;
  }

  // Check if already processed
  const existingPayment = await prisma.payment.findUnique({
    where: { reference },
    include: { ticket: true },
  });

  if (existingPayment?.ticket) {
    res.json({
      success: true,
      data: {
        ticketId: existingPayment.ticket.ticketId,
        accessCode: existingPayment.ticket.accessCode,
        already_processed: true,
      },
    });
    return;
  }

  // Create ticket and payment in transaction
  const rawData = statusResult.data.raw as Record<string, unknown> | undefined;
  const normalizedPhone = normalizePhone(phone || (rawData?.CustomerMsisdn as string) || '');
  
  if (!normalizedPhone) {
    throw Errors.badRequest('Phone number required to create ticket');
  }

  const ticketName = name || (rawData?.CustomerName as string) || 'VBS Attendee';
  const amount = statusResult.data.amount || 0;

  // Import ticket service
  const { createTicket } = await import('../services/ticket.service.js');
  
  const ticketResult = await createTicket({
    name: ticketName,
    phone: normalizedPhone,
    amount,
    status: 'PAID',
  });

  if (!ticketResult.success) {
    throw Errors.internal('Failed to create ticket');
  }

  // Create payment record
  await prisma.payment.create({
    data: {
      ticketId: ticketResult.data.id,
      amount,
      status: 'SUCCESS',
      provider: 'HUBTEL',
      reference,
      externalId: statusResult.data.transactionId,
      customerMsisdn: normalizedPhone,
      customerName: ticketName,
      paidAt: new Date(),
    },
  });

  logPayment('Payment verified and ticket created', {
    reference,
    ticketId: ticketResult.data.ticketId,
    amount,
  });

  res.json({
    success: true,
    data: {
      ticketId: ticketResult.data.ticketId,
      accessCode: ticketResult.data.accessCode,
      name: ticketResult.data.name,
      phone: ticketResult.data.phone,
      amount,
    },
  });
});

/**
 * Get payment history for a phone number
 * GET /api/payments/history/:phone
 */
export const getPaymentHistory = asyncHandler(async (req: Request, res: Response) => {
  const { phone } = req.params;

  const normalizedPhone = normalizePhone(phone);
  if (!normalizedPhone) {
    throw Errors.badRequest('Invalid phone number');
  }

  const payments = await prisma.payment.findMany({
    where: { customerMsisdn: normalizedPhone },
    include: {
      ticket: {
        select: {
          ticketId: true,
          accessCode: true,
          name: true,
          status: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({
    success: true,
    data: payments,
    count: payments.length,
  });
});

