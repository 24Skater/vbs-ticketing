/**
 * Base Payment Adapter
 * Provides common functionality for all payment adapters
 */

import { PaymentStatus } from '@prisma/client';
import type { PaymentProvider } from './types.js';
import { logger } from '../utils/logger.js';
import {
  PaymentAdapter,
  PaymentRequest,
  PaymentInitResult,
  PaymentVerifyResult,
  RefundRequest,
  RefundResult,
  WebhookParseResult,
  AdapterConfig,
} from './types.js';

/**
 * Abstract base class for payment adapters
 * Provides common validation, logging, and error handling
 */
export abstract class BasePaymentAdapter implements PaymentAdapter {
  abstract readonly provider: PaymentProvider;
  abstract readonly displayName: string;
  
  protected config: AdapterConfig;
  protected logger = logger;
  
  constructor(config: AdapterConfig) {
    this.config = config;
  }
  
  // ============================================================================
  // COMMON METHODS
  // ============================================================================
  
  async isEnabled(): Promise<boolean> {
    return this.config.enabled;
  }
  
  getSupportedCurrencies(): string[] {
    return this.config.supportedCurrencies;
  }
  
  getSupportedCountries(): string[] {
    return this.config.supportedCountries;
  }
  
  // ============================================================================
  // VALIDATION HELPERS
  // ============================================================================
  
  /**
   * Validate payment request before processing
   */
  protected validateRequest(request: PaymentRequest): void {
    if (!request.amount || request.amount <= 0) {
      throw new Error('Invalid payment amount');
    }
    
    if (!request.currency) {
      throw new Error('Currency is required');
    }
    
    if (!this.getSupportedCurrencies().includes(request.currency.toUpperCase())) {
      throw new Error(`Currency ${request.currency} not supported by ${this.displayName}`);
    }
    
    if (!request.reference) {
      throw new Error('Payment reference is required');
    }
  }
  
  /**
   * Log payment operation
   */
  protected logOperation(operation: string, data: Record<string, unknown>): void {
    this.logger.info(`[${this.provider}] ${operation}`, {
      provider: this.provider,
      ...data,
    });
  }
  
  /**
   * Log payment error
   */
  protected logError(operation: string, error: unknown, data?: Record<string, unknown>): void {
    this.logger.error(`[${this.provider}] ${operation} failed`, {
      provider: this.provider,
      error: error instanceof Error ? error.message : String(error),
      ...data,
    });
  }
  
  // ============================================================================
  // ABSTRACT METHODS (must be implemented by subclasses)
  // ============================================================================
  
  abstract initializePayment(request: PaymentRequest): Promise<PaymentInitResult>;
  abstract verifyPayment(externalId: string): Promise<PaymentVerifyResult>;
  abstract refundPayment(request: RefundRequest): Promise<RefundResult>;
  abstract parseWebhook(payload: unknown, headers?: Record<string, string>): Promise<WebhookParseResult>;
  
  // ============================================================================
  // HELPER METHODS
  // ============================================================================
  
  /**
   * Create a failed result
   */
  protected failedInit(error: string): PaymentInitResult {
    return {
      success: false,
      status: 'FAILED' as PaymentStatus,
      error,
    };
  }
  
  /**
   * Create a failed verification result
   */
  protected failedVerify(error: string): PaymentVerifyResult {
    return {
      success: false,
      status: 'FAILED' as PaymentStatus,
      error,
    };
  }
  
  /**
   * Create a failed refund result
   */
  protected failedRefund(error: string): RefundResult {
    return {
      success: false,
      status: 'failed',
      error,
    };
  }
  
  /**
   * Create a failed webhook result
   */
  protected failedWebhook(error: string): WebhookParseResult {
    return {
      success: false,
      error,
    };
  }
}

