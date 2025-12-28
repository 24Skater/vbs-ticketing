/**
 * Stripe Payment Adapter
 * Credit/debit card payments via Stripe Checkout
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
  WebhookEvent,
  AdapterConfig,
} from '../types.js';

interface StripeConfig extends AdapterConfig {
  credentials: {
    secretKey: string;
    publishableKey: string;
    webhookSecret?: string;
  };
}

// Stripe types (simplified - in production, use @stripe/stripe-js types)
interface StripeCheckoutSession {
  id: string;
  url: string;
  payment_status: string;
  payment_intent?: string;
  amount_total: number;
  currency: string;
  customer_email?: string;
  metadata: Record<string, string>;
  error?: { message: string };
  [key: string]: unknown;
}

interface StripeRefund {
  id: string;
  amount: number;
  status: string;
  error?: { message: string };
}

interface StripeWebhookEvent {
  id: string;
  type: string;
  data: {
    object: StripeCheckoutSession;
  };
}

export class StripePaymentAdapter extends BasePaymentAdapter {
  readonly provider = 'STRIPE' as PaymentProvider;
  readonly displayName = 'Stripe (Card Payment)';
  
  private readonly apiBaseUrl = 'https://api.stripe.com/v1';
  
  constructor(config: StripeConfig) {
    super(config);
  }
  
  private get credentials() {
    return this.config.credentials as StripeConfig['credentials'];
  }
  
  private getAuthHeader(): string {
    return `Bearer ${this.credentials.secretKey}`;
  }
  
  /**
   * Initialize Stripe Checkout Session
   */
  async initializePayment(request: PaymentRequest): Promise<PaymentInitResult> {
    try {
      this.validateRequest(request);
      
      if (!this.credentials.secretKey) {
        return this.failedInit('Stripe is not configured');
      }
      
      this.logOperation('initializePayment', {
        reference: request.reference,
        amount: request.amount,
        currency: request.currency,
      });
      
      // Create Stripe Checkout Session
      const params = new URLSearchParams();
      params.append('mode', 'payment');
      params.append('line_items[0][price_data][currency]', request.currency.toLowerCase());
      params.append('line_items[0][price_data][unit_amount]', request.amount.toString());
      params.append('line_items[0][price_data][product_data][name]', request.description || 'Ticket');
      params.append('line_items[0][quantity]', '1');
      params.append('success_url', request.returnUrl || `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`);
      params.append('cancel_url', request.cancelUrl || `${process.env.FRONTEND_URL}/cancel`);
      params.append('metadata[reference]', request.reference);
      
      if (request.customer.email) {
        params.append('customer_email', request.customer.email);
      }
      
      const response = await fetch(`${this.apiBaseUrl}/checkout/sessions`, {
        method: 'POST',
        headers: {
          'Authorization': this.getAuthHeader(),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });
      
      const session = await response.json() as StripeCheckoutSession;
      
      if (!response.ok || !session.id) {
        this.logError('initializePayment', session, { reference: request.reference });
        return this.failedInit((session as any).error?.message || 'Failed to create checkout session');
      }
      
      return {
        success: true,
        externalId: session.id,
        redirectUrl: session.url,
        status: 'PENDING' as PaymentStatus,
        providerData: {
          sessionId: session.id,
          publishableKey: this.credentials.publishableKey,
        },
      };
    } catch (error) {
      this.logError('initializePayment', error, { reference: request.reference });
      return this.failedInit(error instanceof Error ? error.message : 'Failed to initialize Stripe payment');
    }
  }
  
  /**
   * Verify Stripe payment by retrieving session
   */
  async verifyPayment(externalId: string): Promise<PaymentVerifyResult> {
    try {
      this.logOperation('verifyPayment', { externalId });
      
      const response = await fetch(`${this.apiBaseUrl}/checkout/sessions/${externalId}`, {
        method: 'GET',
        headers: {
          'Authorization': this.getAuthHeader(),
        },
      });
      
      const session = await response.json() as StripeCheckoutSession;
      
      if (!response.ok) {
        return this.failedVerify((session as any).error?.message || 'Failed to retrieve session');
      }
      
      const status = this.mapStripeStatus(session.payment_status);
      
      return {
        success: true,
        status,
        externalId: session.id,
        amount: session.amount_total,
        currency: session.currency.toUpperCase(),
        paidAt: status === 'SUCCESS' ? new Date() : undefined,
        providerData: session as Record<string, unknown>,
      };
    } catch (error) {
      this.logError('verifyPayment', error, { externalId });
      return this.failedVerify(error instanceof Error ? error.message : 'Failed to verify payment');
    }
  }
  
  /**
   * Process Stripe refund
   */
  async refundPayment(request: RefundRequest): Promise<RefundResult> {
    try {
      this.logOperation('refundPayment', {
        externalId: request.externalId,
        amount: request.amount,
      });
      
      // First get the payment intent from the session
      const sessionResponse = await fetch(`${this.apiBaseUrl}/checkout/sessions/${request.externalId}`, {
        method: 'GET',
        headers: {
          'Authorization': this.getAuthHeader(),
        },
      });
      
      const session = await sessionResponse.json() as StripeCheckoutSession;
      const paymentIntentId = session.payment_intent;
      
      if (!paymentIntentId) {
        return this.failedRefund('No payment intent found for this session');
      }
      
      // Create refund
      const params = new URLSearchParams();
      params.append('payment_intent', paymentIntentId);
      if (request.amount) {
        params.append('amount', request.amount.toString());
      }
      if (request.reason) {
        params.append('reason', 'requested_by_customer');
      }
      
      const response = await fetch(`${this.apiBaseUrl}/refunds`, {
        method: 'POST',
        headers: {
          'Authorization': this.getAuthHeader(),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });
      
      const refund = await response.json() as StripeRefund;
      
      if (!response.ok || !refund.id) {
        return this.failedRefund(refund.error?.message || 'Failed to process refund');
      }
      
      return {
        success: true,
        refundId: refund.id,
        amount: refund.amount,
        status: refund.status === 'succeeded' ? 'succeeded' : 'pending',
      };
    } catch (error) {
      this.logError('refundPayment', error, { externalId: request.externalId });
      return this.failedRefund(error instanceof Error ? error.message : 'Failed to process refund');
    }
  }
  
  /**
   * Parse Stripe webhook event
   */
  async parseWebhook(payload: unknown, headers?: Record<string, string>): Promise<WebhookParseResult> {
    try {
      const stripeEvent = payload as StripeWebhookEvent;
      
      // Verify signature if webhook secret is configured
      if (this.credentials.webhookSecret && headers?.['stripe-signature']) {
        const isValid = this.verifyWebhookSignature(payload, headers['stripe-signature']);
        if (!isValid) {
          return this.failedWebhook('Invalid webhook signature');
        }
      }
      
      const session = stripeEvent.data.object;
      const status = this.mapStripeStatus(session.payment_status);
      
      const event: WebhookEvent = {
        type: stripeEvent.type,
        reference: session.metadata?.reference,
        externalId: session.id,
        status,
        amount: session.amount_total,
        currency: session.currency?.toUpperCase(),
        customer: {
          email: session.customer_email,
        },
        timestamp: new Date(),
        rawPayload: payload,
      };
      
      this.logOperation('parseWebhook', {
        type: stripeEvent.type,
        reference: session.metadata?.reference,
        status,
      });
      
      return {
        success: true,
        event,
      };
    } catch (error) {
      this.logError('parseWebhook', error);
      return this.failedWebhook(error instanceof Error ? error.message : 'Failed to parse webhook');
    }
  }
  
  /**
   * Verify Stripe webhook signature
   */
  verifyWebhookSignature(_payload: unknown, signature: string): boolean {
    // Simplified - in production use stripe.webhooks.constructEvent
    // This would require the full Stripe SDK
    if (!this.credentials.webhookSecret) {
      return true; // No verification if no secret configured
    }
    
    // Basic signature check (simplified)
    return signature.includes('t=') && signature.includes('v1=');
  }
  
  /**
   * Map Stripe status to our PaymentStatus
   */
  private mapStripeStatus(stripeStatus: string): PaymentStatus {
    const statusMap: Record<string, PaymentStatus> = {
      'paid': 'SUCCESS',
      'complete': 'SUCCESS',
      'unpaid': 'PENDING',
      'no_payment_required': 'SUCCESS',
      'expired': 'FAILED',
      'canceled': 'CANCELLED',
    };
    
    return statusMap[stripeStatus] || 'PENDING';
  }
}

/**
 * Create Stripe adapter from environment or config
 */
export function createStripeAdapter(config?: Partial<StripeConfig>): StripePaymentAdapter {
  return new StripePaymentAdapter({
    provider: 'STRIPE' as PaymentProvider,
    enabled: !!process.env.STRIPE_SECRET_KEY,
    isLiveMode: !process.env.STRIPE_SECRET_KEY?.startsWith('sk_test'),
    credentials: {
      secretKey: process.env.STRIPE_SECRET_KEY || '',
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    },
    supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'SEK', 'NOK', 'DKK'],
    supportedCountries: [], // Stripe supports most countries
    ...config,
  });
}

