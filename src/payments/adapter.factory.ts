/**
 * Payment Adapter Factory
 * Manages payment adapter instances and selection
 */

import type { PaymentProvider } from './types.js';
import { prisma } from '../utils/prisma.js';
import { logger } from '../utils/logger.js';
import { PaymentAdapter, AdapterConfig } from './types.js';
import { createManualAdapter } from './adapters/manual.adapter.js';
import { createHubtelAdapter } from './adapters/hubtel.adapter.js';
import { createStripeAdapter } from './adapters/stripe.adapter.js';

// ============================================================================
// ADAPTER REGISTRY
// ============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AdapterConstructor = (config?: any) => PaymentAdapter;

const adapterRegistry: Record<string, AdapterConstructor> = {
  MANUAL: createManualAdapter as AdapterConstructor,
  HUBTEL: createHubtelAdapter as AdapterConstructor,
  STRIPE: createStripeAdapter as AdapterConstructor,
};

// Cache for adapter instances
const adapterCache = new Map<PaymentProvider, PaymentAdapter>();

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Get a payment adapter by provider name
 * Creates adapter if not cached
 */
export async function getAdapter(provider: PaymentProvider): Promise<PaymentAdapter | null> {
  // Check cache first
  if (adapterCache.has(provider)) {
    return adapterCache.get(provider)!;
  }
  
  // Get config from database
  const config = await prisma.paymentProviderConfig.findUnique({
    where: { provider },
  });
  
  if (!config) {
    logger.warn(`Payment provider ${provider} not configured`);
    return null;
  }
  
  // Get constructor
  const createAdapter = adapterRegistry[provider];
  if (!createAdapter) {
    logger.warn(`No adapter registered for provider ${provider}`);
    return null;
  }
  
  // Build adapter config
  const adapterConfig: Partial<AdapterConfig> = {
    provider: config.provider,
    enabled: config.enabled,
    isLiveMode: process.env.NODE_ENV === 'production',
    credentials: (config.config as Record<string, string>) || {},
    supportedCurrencies: config.currencies,
    supportedCountries: config.countries,
    feePercent: config.feePercent || undefined,
    feeFixed: config.feeFixed || undefined,
  };
  
  // Create and cache adapter
  const adapter = createAdapter(adapterConfig);
  adapterCache.set(provider, adapter);
  
  return adapter;
}

/**
 * Get all enabled payment adapters
 */
export async function getEnabledAdapters(): Promise<PaymentAdapter[]> {
  const configs = await prisma.paymentProviderConfig.findMany({
    where: { enabled: true },
  });
  
  const adapters: PaymentAdapter[] = [];
  
  for (const config of configs) {
    const adapter = await getAdapter(config.provider);
    if (adapter) {
      adapters.push(adapter);
    }
  }
  
  return adapters;
}

/**
 * Get adapter for a specific currency
 * Returns first enabled adapter that supports the currency
 */
export async function getAdapterForCurrency(currency: string): Promise<PaymentAdapter | null> {
  const adapters = await getEnabledAdapters();
  
  for (const adapter of adapters) {
    if (adapter.getSupportedCurrencies().includes(currency.toUpperCase())) {
      return adapter;
    }
  }
  
  // Fallback to manual if no other adapter supports the currency
  const manualAdapter = await getAdapter('MANUAL' as PaymentProvider);
  return manualAdapter;
}

/**
 * Get adapters for a specific country
 */
export async function getAdaptersForCountry(country: string): Promise<PaymentAdapter[]> {
  const adapters = await getEnabledAdapters();
  
  return adapters.filter(adapter => {
    const countries = adapter.getSupportedCountries();
    // Empty array means all countries supported
    return countries.length === 0 || countries.includes(country.toUpperCase());
  });
}

/**
 * Get default payment adapter
 * Priority: Stripe > Hubtel > Manual
 */
export async function getDefaultAdapter(): Promise<PaymentAdapter | null> {
  const configs = await prisma.paymentProviderConfig.findMany({
    where: { enabled: true },
    orderBy: { provider: 'asc' },
  });
  
  // Priority order
  const priority: PaymentProvider[] = ['STRIPE', 'HUBTEL', 'PAYPAL', 'MANUAL'];
  
  for (const provider of priority) {
    const config = configs.find(c => c.provider === provider);
    if (config) {
      return getAdapter(provider);
    }
  }
  
  // Return first enabled adapter if no priority match
  if (configs.length > 0) {
    return getAdapter(configs[0].provider);
  }
  
  return null;
}

/**
 * Clear adapter cache
 * Call when provider config changes
 */
export function clearAdapterCache(provider?: PaymentProvider): void {
  if (provider) {
    adapterCache.delete(provider);
  } else {
    adapterCache.clear();
  }
}

/**
 * Register a custom adapter
 */
export function registerAdapter(provider: string, constructor: AdapterConstructor): void {
  adapterRegistry[provider] = constructor;
}

/**
 * Get available provider options for frontend
 */
export async function getAvailableProviders(): Promise<Array<{
  provider: PaymentProvider;
  displayName: string;
  currencies: string[];
  countries: string[];
}>> {
  const adapters = await getEnabledAdapters();
  
  return adapters.map(adapter => ({
    provider: adapter.provider,
    displayName: adapter.displayName,
    currencies: adapter.getSupportedCurrencies(),
    countries: adapter.getSupportedCountries(),
  }));
}

