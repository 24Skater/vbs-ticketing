/**
 * Payment Provider Types
 * Defines interfaces for the payment abstraction layer
 */

import { PaymentProviderType, PaymentStatus } from '@prisma/client';

// Re-export as PaymentProvider for cleaner API
export type PaymentProvider = PaymentProviderType;

// ============================================================================
// CORE TYPES
// ============================================================================

/**
 * Customer information for payment
 */
export interface PaymentCustomer {
  phone?: string;
  email?: string;
  name?: string;
}

/**
 * Payment request input
 */
export interface PaymentRequest {
  /** Amount in smallest currency unit (e.g., cents) */
  amount: number;
  /** ISO 4217 currency code */
  currency: string;
  /** Internal reference/ticket ID */
  reference: string;
  /** Customer information */
  customer: PaymentCustomer;
  /** Description shown to customer */
  description?: string;
  /** URL to redirect after payment */
  returnUrl?: string;
  /** URL to redirect on cancel */
  cancelUrl?: string;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Result from initiating a payment
 */
export interface PaymentInitResult {
  success: boolean;
  /** External provider transaction ID */
  externalId?: string;
  /** URL to redirect customer for payment */
  redirectUrl?: string;
  /** For providers that return payment intent/session */
  clientSecret?: string;
  /** Status of the payment */
  status: PaymentStatus;
  /** Error message if failed */
  error?: string;
  /** Provider-specific data */
  providerData?: Record<string, unknown>;
}

/**
 * Result from verifying a payment
 */
export interface PaymentVerifyResult {
  success: boolean;
  status: PaymentStatus;
  /** Amount confirmed (in smallest unit) */
  amount?: number;
  currency?: string;
  /** External provider transaction ID */
  externalId?: string;
  /** When payment was completed */
  paidAt?: Date;
  /** Error message if failed */
  error?: string;
  /** Provider-specific data */
  providerData?: Record<string, unknown>;
}

/**
 * Refund request input
 */
export interface RefundRequest {
  /** Original payment external ID */
  externalId: string;
  /** Amount to refund (optional, full refund if not specified) */
  amount?: number;
  /** Reason for refund */
  reason?: string;
}

/**
 * Result from processing a refund
 */
export interface RefundResult {
  success: boolean;
  /** Refund transaction ID */
  refundId?: string;
  /** Amount refunded */
  amount?: number;
  status: 'pending' | 'succeeded' | 'failed';
  error?: string;
}

/**
 * Webhook event from provider
 */
export interface WebhookEvent {
  /** Event type (e.g., 'payment.success', 'payment.failed') */
  type: string;
  /** Our internal reference */
  reference?: string;
  /** Provider's transaction ID */
  externalId?: string;
  /** Payment status */
  status: PaymentStatus;
  /** Amount in smallest unit */
  amount?: number;
  currency?: string;
  /** Customer info from provider */
  customer?: PaymentCustomer;
  /** When the event occurred */
  timestamp: Date;
  /** Raw payload from provider */
  rawPayload: unknown;
}

/**
 * Result from parsing webhook
 */
export interface WebhookParseResult {
  success: boolean;
  event?: WebhookEvent;
  error?: string;
}

// ============================================================================
// ADAPTER INTERFACE
// ============================================================================

/**
 * Payment Adapter Interface
 * All payment providers must implement this interface
 */
export interface PaymentAdapter {
  /** Provider identifier */
  readonly provider: PaymentProvider;
  
  /** Human-readable provider name */
  readonly displayName: string;
  
  /** Whether this provider is currently enabled */
  isEnabled(): Promise<boolean>;
  
  /** Supported currencies for this provider */
  getSupportedCurrencies(): string[];
  
  /** Supported countries (ISO 3166-1 alpha-2) */
  getSupportedCountries(): string[];
  
  /**
   * Initialize a payment
   * Returns redirect URL or client secret for frontend
   */
  initializePayment(request: PaymentRequest): Promise<PaymentInitResult>;
  
  /**
   * Verify/check status of a payment
   */
  verifyPayment(externalId: string): Promise<PaymentVerifyResult>;
  
  /**
   * Process a refund
   */
  refundPayment(request: RefundRequest): Promise<RefundResult>;
  
  /**
   * Parse incoming webhook payload
   */
  parseWebhook(payload: unknown, headers?: Record<string, string>): Promise<WebhookParseResult>;
  
  /**
   * Verify webhook signature (if applicable)
   */
  verifyWebhookSignature?(payload: unknown, signature: string): boolean;
}

// ============================================================================
// ADAPTER CONFIG
// ============================================================================

/**
 * Configuration for a payment adapter
 */
export interface AdapterConfig {
  provider: PaymentProvider;
  enabled: boolean;
  isLiveMode: boolean;
  credentials: Record<string, string>;
  supportedCurrencies: string[];
  supportedCountries: string[];
  feePercent?: number;
  feeFixed?: number;
}

/**
 * Constructor type for payment adapters
 */
export type PaymentAdapterConstructor = new (config: AdapterConfig) => PaymentAdapter;

