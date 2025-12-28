/**
 * Payment Provider Abstraction Layer
 * 
 * This module provides a unified interface for multiple payment providers:
 * - Stripe (credit/debit cards)
 * - Hubtel (Ghana mobile money)
 * - Manual (cash, bank transfer)
 * 
 * Usage:
 * ```typescript
 * import { getAdapter, getDefaultAdapter } from './payments';
 * 
 * // Get specific adapter
 * const stripeAdapter = await getAdapter('STRIPE');
 * 
 * // Get default enabled adapter
 * const adapter = await getDefaultAdapter();
 * 
 * // Initialize payment
 * const result = await adapter.initializePayment({
 *   amount: 5000, // in smallest unit (cents)
 *   currency: 'USD',
 *   reference: 'TICKET-123',
 *   customer: { email: 'customer@example.com' },
 *   returnUrl: 'https://example.com/success',
 * });
 * ```
 */

// Types
export * from './types.js';

// Base adapter
export { BasePaymentAdapter } from './base.adapter.js';

// Factory
export {
  getAdapter,
  getEnabledAdapters,
  getAdapterForCurrency,
  getAdaptersForCountry,
  getDefaultAdapter,
  clearAdapterCache,
  registerAdapter,
  getAvailableProviders,
} from './adapter.factory.js';

// Adapters
export { ManualPaymentAdapter, createManualAdapter } from './adapters/manual.adapter.js';
export { HubtelPaymentAdapter, createHubtelAdapter } from './adapters/hubtel.adapter.js';
export { StripePaymentAdapter, createStripeAdapter } from './adapters/stripe.adapter.js';

