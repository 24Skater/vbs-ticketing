/**
 * Manual Payment Adapter
 * Handles offline payments: cash, bank transfer, check, etc.
 * Admin manually marks payments as complete
 */

import { PaymentStatus } from '@prisma/client';
import type { PaymentProvider } from '../types.js';
import { BasePaymentAdapter } from '../base.adapter.js';
import {
  PaymentRequest,
  PaymentInitResult,
  PaymentVerifyResult,
  RefundRequest,
  RefundResult,
  WebhookParseResult,
  AdapterConfig,
} from '../types.js';

export class ManualPaymentAdapter extends BasePaymentAdapter {
  readonly provider = 'MANUAL' as PaymentProvider;
  readonly displayName = 'Manual / Offline Payment';
  
  constructor(config: AdapterConfig) {
    super(config);
  }
  
  /**
   * Initialize a manual payment
   * Creates a pending payment that admin will mark as complete
   */
  async initializePayment(request: PaymentRequest): Promise<PaymentInitResult> {
    try {
      this.validateRequest(request);
      
      this.logOperation('initializePayment', {
        reference: request.reference,
        amount: request.amount,
        currency: request.currency,
      });
      
      // For manual payments, we just create a pending state
      // The payment will be completed when admin marks it as paid
      return {
        success: true,
        externalId: `MANUAL-${request.reference}-${Date.now()}`,
        status: 'PENDING' as PaymentStatus,
        providerData: {
          method: 'manual',
          instructions: 'Please complete payment via cash, bank transfer, or other offline method. Admin will verify and confirm.',
        },
      };
    } catch (error) {
      this.logError('initializePayment', error, { reference: request.reference });
      return this.failedInit(error instanceof Error ? error.message : 'Failed to initialize payment');
    }
  }
  
  /**
   * Verify manual payment status
   * For manual payments, this returns the current stored status
   */
  async verifyPayment(externalId: string): Promise<PaymentVerifyResult> {
    try {
      this.logOperation('verifyPayment', { externalId });
      
      // Manual payments are verified through the database
      // This just returns pending status - actual verification happens via admin action
      return {
        success: true,
        status: 'PENDING' as PaymentStatus,
        externalId,
        providerData: {
          message: 'Manual payments must be verified by an administrator',
        },
      };
    } catch (error) {
      this.logError('verifyPayment', error, { externalId });
      return this.failedVerify(error instanceof Error ? error.message : 'Failed to verify payment');
    }
  }
  
  /**
   * Process refund for manual payment
   * Creates a refund record - actual refund handled offline
   */
  async refundPayment(request: RefundRequest): Promise<RefundResult> {
    try {
      this.logOperation('refundPayment', {
        externalId: request.externalId,
        amount: request.amount,
        reason: request.reason,
      });
      
      // Manual refunds are processed offline
      return {
        success: true,
        refundId: `REFUND-${request.externalId}-${Date.now()}`,
        amount: request.amount,
        status: 'pending',
      };
    } catch (error) {
      this.logError('refundPayment', error, { externalId: request.externalId });
      return this.failedRefund(error instanceof Error ? error.message : 'Failed to process refund');
    }
  }
  
  /**
   * Parse webhook - not applicable for manual payments
   */
  async parseWebhook(_payload: unknown, _headers?: Record<string, string>): Promise<WebhookParseResult> {
    return {
      success: false,
      error: 'Manual payments do not support webhooks',
    };
  }
}

/**
 * Create manual adapter with default config
 */
export function createManualAdapter(config?: Partial<AdapterConfig>): ManualPaymentAdapter {
  return new ManualPaymentAdapter({
    provider: 'MANUAL' as PaymentProvider,
    enabled: true,
    isLiveMode: true,
    credentials: {},
    supportedCurrencies: ['USD', 'EUR', 'GBP', 'GHS', 'NGN', 'KES', 'ZAR', 'CAD', 'AUD'],
    supportedCountries: [], // All countries
    ...config,
  });
}

