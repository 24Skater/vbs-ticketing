/**
 * Payment Service
 * Unified payment processing using the adapter layer
 */

import { PaymentProviderType, PaymentStatus } from '@prisma/client';
import type { PaymentProvider } from '../payments/types.js';
import { prisma } from '../utils/prisma.js';
import { logger } from '../utils/logger.js';
import {
  getAdapter,
  getDefaultAdapter,
  getAdapterForCurrency,
  getAvailableProviders,
  type PaymentRequest,
  type PaymentVerifyResult,
  type RefundResult,
} from '../payments/index.js';

// ============================================================================
// TYPES
// ============================================================================

export interface InitiatePaymentInput {
  ticketId?: string;
  amount: number;
  currency?: string;
  provider?: PaymentProvider;
  customer: {
    phone?: string;
    email?: string;
    name?: string;
  };
  description?: string;
  returnUrl?: string;
  cancelUrl?: string;
}

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  externalId?: string;
  redirectUrl?: string;
  status?: PaymentStatus;
  error?: string;
}

// ============================================================================
// PAYMENT OPERATIONS
// ============================================================================

/**
 * Initiate a payment
 */
export async function initiatePayment(input: InitiatePaymentInput): Promise<PaymentResult> {
  try {
    // Get adapter
    let adapter;
    if (input.provider) {
      adapter = await getAdapter(input.provider);
    } else if (input.currency) {
      adapter = await getAdapterForCurrency(input.currency);
    } else {
      adapter = await getDefaultAdapter();
    }
    
    if (!adapter) {
      return {
        success: false,
        error: 'No payment provider available',
      };
    }
    
    // Check if adapter is enabled
    if (!(await adapter.isEnabled())) {
      return {
        success: false,
        error: `Payment provider ${adapter.displayName} is not enabled`,
      };
    }
    
    // Generate reference
    const reference = input.ticketId || `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    
    // Build payment request
    const paymentRequest: PaymentRequest = {
      amount: input.amount,
      currency: input.currency || 'USD',
      reference,
      customer: input.customer,
      description: input.description,
      returnUrl: input.returnUrl,
      cancelUrl: input.cancelUrl,
    };
    
    // Initialize payment with adapter
    const result = await adapter.initializePayment(paymentRequest);
    
    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Payment initialization failed',
      };
    }
    
    // Create payment record in database
    const ticketDbId = input.ticketId ? await getTicketDbId(input.ticketId) : null;
    
    if (!ticketDbId) {
      // Ticket is required for payment record
      return {
        success: false,
        error: 'Valid ticket ID is required for payment',
      };
    }
    
    const payment = await prisma.payment.create({
      data: {
        ticketId: ticketDbId,
        amount: input.amount,
        currency: input.currency || 'USD',
        status: result.status,
        provider: adapter.provider as PaymentProviderType,
        externalId: result.externalId || null,
        reference,
        customerMsisdn: input.customer.phone || null,
        customerName: input.customer.name || null,
        providerMessage: result.providerData ? JSON.stringify(result.providerData) : null,
      },
    });
    
    logger.info('Payment initiated', {
      paymentId: payment.id,
      provider: adapter.provider,
      reference,
      status: result.status,
    });
    
    return {
      success: true,
      paymentId: payment.id,
      externalId: result.externalId,
      redirectUrl: result.redirectUrl,
      status: result.status,
    };
  } catch (error) {
    logger.error('Failed to initiate payment', { error, input });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Payment failed',
    };
  }
}

/**
 * Verify payment status
 */
export async function verifyPayment(paymentId: string): Promise<PaymentVerifyResult> {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });
    
    if (!payment) {
      return {
        success: false,
        status: 'FAILED',
        error: 'Payment not found',
      };
    }
    
    // If already completed, return current status
    if (payment.status === 'SUCCESS' || payment.status === 'REFUNDED') {
      return {
        success: true,
        status: payment.status,
        externalId: payment.externalId || undefined,
        amount: payment.amount,
        currency: payment.currency,
        paidAt: payment.paidAt || undefined,
      };
    }
    
    // Get adapter and verify with provider
    const adapter = await getAdapter(payment.provider);
    if (!adapter || !payment.externalId) {
      return {
        success: true,
        status: payment.status,
        externalId: payment.externalId || undefined,
      };
    }
    
    const result = await adapter.verifyPayment(payment.externalId);
    
    // Update payment if status changed
    if (result.status !== payment.status) {
      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: result.status,
          paidAt: result.status === 'SUCCESS' ? new Date() : undefined,
        },
      });
      
      // Update ticket if payment succeeded
      if (result.status === 'SUCCESS' && payment.ticketId) {
        await prisma.ticket.update({
          where: { id: payment.ticketId },
          data: { status: 'PAID' },
        });
      }
    }
    
    return result;
  } catch (error) {
    logger.error('Failed to verify payment', { error, paymentId });
    return {
      success: false,
      status: 'FAILED',
      error: error instanceof Error ? error.message : 'Verification failed',
    };
  }
}

/**
 * Process refund
 */
export async function refundPayment(paymentId: string, amount?: number, reason?: string): Promise<RefundResult> {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });
    
    if (!payment) {
      return {
        success: false,
        status: 'failed',
        error: 'Payment not found',
      };
    }
    
    if (payment.status !== 'SUCCESS') {
      return {
        success: false,
        status: 'failed',
        error: 'Can only refund successful payments',
      };
    }
    
    const adapter = await getAdapter(payment.provider);
    if (!adapter || !payment.externalId) {
      // For manual payments without external ID
      await prisma.payment.update({
        where: { id: paymentId },
        data: { status: 'REFUNDED' },
      });
      
      if (payment.ticketId) {
        await prisma.ticket.update({
          where: { id: payment.ticketId },
          data: { status: 'REFUNDED' },
        });
      }
      
      return {
        success: true,
        status: 'succeeded',
        amount: amount || payment.amount,
      };
    }
    
    const result = await adapter.refundPayment({
      externalId: payment.externalId,
      amount,
      reason,
    });
    
    if (result.success) {
      await prisma.payment.update({
        where: { id: paymentId },
        data: { status: 'REFUNDED' },
      });
      
      if (payment.ticketId) {
        await prisma.ticket.update({
          where: { id: payment.ticketId },
          data: { status: 'REFUNDED' },
        });
      }
    }
    
    return result;
  } catch (error) {
    logger.error('Failed to process refund', { error, paymentId });
    return {
      success: false,
      status: 'failed',
      error: error instanceof Error ? error.message : 'Refund failed',
    };
  }
}

/**
 * Process webhook event
 */
export async function processWebhook(
  provider: PaymentProvider,
  payload: unknown,
  headers?: Record<string, string>
): Promise<{ success: boolean; error?: string }> {
  try {
    const adapter = await getAdapter(provider);
    if (!adapter) {
      return { success: false, error: 'Provider not found' };
    }
    
    const result = await adapter.parseWebhook(payload, headers);
    if (!result.success || !result.event) {
      return { success: false, error: result.error };
    }
    
    const event = result.event;
    
    // Find payment by reference or external ID
    const payment = await prisma.payment.findFirst({
      where: {
        OR: [
          { reference: event.reference },
          { externalId: event.externalId },
        ],
      },
    });
    
    if (!payment) {
      logger.warn('Webhook received for unknown payment', { event });
      return { success: true }; // Don't fail, might be test webhook
    }
    
    // Update payment status
    if (event.status !== payment.status) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: event.status,
          externalId: event.externalId || payment.externalId,
          paidAt: event.status === 'SUCCESS' ? event.timestamp : undefined,
          customerMsisdn: event.customer?.phone || payment.customerMsisdn,
          customerName: event.customer?.name || payment.customerName,
        },
      });
      
      // Update ticket if payment succeeded
      if (event.status === 'SUCCESS' && payment.ticketId) {
        await prisma.ticket.update({
          where: { id: payment.ticketId },
          data: { status: 'PAID' },
        });
      }
      
      logger.info('Payment updated via webhook', {
        paymentId: payment.id,
        status: event.status,
        provider,
      });
    }
    
    return { success: true };
  } catch (error) {
    logger.error('Failed to process webhook', { error, provider });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Webhook processing failed',
    };
  }
}

/**
 * Get available payment providers for frontend
 */
export async function getPaymentProviders(currency?: string, country?: string) {
  const providers = await getAvailableProviders();
  
  return providers.filter(p => {
    if (currency && !p.currencies.includes(currency.toUpperCase())) {
      return false;
    }
    if (country && p.countries.length > 0 && !p.countries.includes(country.toUpperCase())) {
      return false;
    }
    return true;
  });
}

/**
 * Mark manual payment as paid (admin action)
 */
export async function markAsPaid(paymentId: string, adminId: string): Promise<PaymentResult> {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });
    
    if (!payment) {
      return { success: false, error: 'Payment not found' };
    }
    
    if (payment.status !== 'PENDING') {
      return { success: false, error: 'Payment is not pending' };
    }
    
    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'SUCCESS',
        paidAt: new Date(),
        providerMessage: `Manually marked as paid by admin ${adminId}`,
      },
    });
    
    if (payment.ticketId) {
      await prisma.ticket.update({
        where: { id: payment.ticketId },
        data: { status: 'PAID' },
      });
    }
    
    logger.info('Payment manually marked as paid', { paymentId, adminId });
    
    return {
      success: true,
      paymentId,
      status: 'SUCCESS',
    };
  } catch (error) {
    logger.error('Failed to mark payment as paid', { error, paymentId });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Operation failed',
    };
  }
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Get ticket database ID from ticketId string
 */
async function getTicketDbId(ticketId: string): Promise<string | undefined> {
  const ticket = await prisma.ticket.findUnique({
    where: { ticketId },
    select: { id: true },
  });
  return ticket?.id;
}

