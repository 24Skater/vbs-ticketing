/**
 * Configuration Service
 * Handles site-wide configuration and payment provider settings
 */

import { Prisma, SiteConfig, PaymentProviderConfig, PaymentProviderType } from '@prisma/client';
import { prisma } from '../utils/prisma.js';
import { logger } from '../utils/logger.js';
import { AppError } from '../middleware/errorHandler.middleware.js';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Public config (no sensitive data)
 */
export interface PublicSiteConfig {
  // Organization
  orgName: string;
  orgSlug: string;
  orgDescription: string | null;
  orgWebsite: string | null;
  orgEmail: string | null;
  orgPhone: string | null;
  
  // Localization
  timezone: string;
  locale: string;
  language: string;
  currency: string;
  currencySymbol: string;
  dateFormat: string;
  timeFormat: string;
  
  // Branding
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  textMutedColor: string;
  headingFont: string;
  bodyFont: string;
  borderRadius: string;
  logoUrl: string | null;
  logoDarkUrl: string | null;
  faviconUrl: string | null;
  heroImageUrl: string | null;
  
  // Content
  homePageTitle: string;
  homePageSubtitle: string | null;
  footerText: string;
  
  // Features
  enablePayments: boolean;
  enableQrCodes: boolean;
  enablePdfTickets: boolean;
  enablePublicEventList: boolean;
  enableTicketLookup: boolean;
  maintenanceMode: boolean;
  
  // SEO
  metaTitle: string | null;
  metaDescription: string | null;
  socialImageUrl: string | null;
  
  // Custom
  customCss: string | null;
}

export interface PublicPaymentProvider {
  provider: PaymentProviderType;
  displayName: string;
  supportsCreditCard: boolean;
  supportsDebitCard: boolean;
  supportsMobileMoney: boolean;
  supportsBankTransfer: boolean;
  supportsWallet: boolean;
  currencies: string[];
  countries: string[];
  feePercent: number | null;
  feeFixed: number | null;
}

// Cache for config to reduce DB queries
let configCache: SiteConfig | null = null;
let configCacheTime: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// ============================================================================
// SITE CONFIG
// ============================================================================

/**
 * Get site configuration
 * Creates default config if none exists
 */
export async function getSiteConfig(): Promise<SiteConfig> {
  // Check cache
  if (configCache && (Date.now() - configCacheTime) < CACHE_TTL) {
    return configCache;
  }
  
  let config = await prisma.siteConfig.findUnique({
    where: { id: 'default' }
  });
  
  // Create default if not exists
  if (!config) {
    config = await prisma.siteConfig.create({
      data: { id: 'default' }
    });
    logger.info('Created default site configuration');
  }
  
  // Update cache
  configCache = config;
  configCacheTime = Date.now();
  
  return config;
}

/**
 * Get public site configuration (no sensitive data)
 */
export async function getPublicSiteConfig(): Promise<PublicSiteConfig> {
  const config = await getSiteConfig();
  
  return {
    // Organization
    orgName: config.orgName,
    orgSlug: config.orgSlug,
    orgDescription: config.orgDescription,
    orgWebsite: config.orgWebsite,
    orgEmail: config.orgEmail,
    orgPhone: config.orgPhone,
    
    // Localization
    timezone: config.timezone,
    locale: config.locale,
    language: config.language,
    currency: config.currency,
    currencySymbol: config.currencySymbol,
    dateFormat: config.dateFormat,
    timeFormat: config.timeFormat,
    
    // Branding
    primaryColor: config.primaryColor,
    secondaryColor: config.secondaryColor,
    accentColor: config.accentColor,
    backgroundColor: config.backgroundColor,
    surfaceColor: config.surfaceColor,
    textColor: config.textColor,
    textMutedColor: config.textMutedColor,
    headingFont: config.headingFont,
    bodyFont: config.bodyFont,
    borderRadius: config.borderRadius,
    logoUrl: config.logoUrl,
    logoDarkUrl: config.logoDarkUrl,
    faviconUrl: config.faviconUrl,
    heroImageUrl: config.heroImageUrl,
    
    // Content
    homePageTitle: config.homePageTitle,
    homePageSubtitle: config.homePageSubtitle,
    footerText: config.footerText,
    
    // Features
    enablePayments: config.enablePayments,
    enableQrCodes: config.enableQrCodes,
    enablePdfTickets: config.enablePdfTickets,
    enablePublicEventList: config.enablePublicEventList,
    enableTicketLookup: config.enableTicketLookup,
    maintenanceMode: config.maintenanceMode,
    
    // SEO
    metaTitle: config.metaTitle,
    metaDescription: config.metaDescription,
    socialImageUrl: config.socialImageUrl,
    
    // Custom
    customCss: config.customCss,
  };
}

/**
 * Update site configuration
 */
export async function updateSiteConfig(
  data: Prisma.SiteConfigUpdateInput
): Promise<SiteConfig> {
  // First ensure config exists
  await getSiteConfig();
  
  const config = await prisma.siteConfig.update({
    where: { id: 'default' },
    data,
  });
  
  // Invalidate cache
  configCache = null;
  
  logger.info('Site configuration updated', { 
    updatedFields: Object.keys(data as object) 
  });
  
  return config;
}

/**
 * Clear config cache (useful after updates)
 */
export function clearConfigCache(): void {
  configCache = null;
  configCacheTime = 0;
}

// ============================================================================
// PAYMENT PROVIDERS
// ============================================================================

/**
 * Get all payment provider configs
 */
export async function getPaymentProviders(): Promise<PaymentProviderConfig[]> {
  return prisma.paymentProviderConfig.findMany({
    orderBy: { sortOrder: 'asc' }
  });
}

/**
 * Get enabled payment providers (public, no secrets)
 */
export async function getEnabledPaymentProviders(): Promise<PublicPaymentProvider[]> {
  const providers = await prisma.paymentProviderConfig.findMany({
    where: { enabled: true },
    orderBy: { sortOrder: 'asc' }
  });
  
  return providers.map(p => ({
    provider: p.provider,
    displayName: p.displayName,
    supportsCreditCard: p.supportsCreditCard,
    supportsDebitCard: p.supportsDebitCard,
    supportsMobileMoney: p.supportsMobileMoney,
    supportsBankTransfer: p.supportsBankTransfer,
    supportsWallet: p.supportsWallet,
    currencies: p.currencies,
    countries: p.countries,
    feePercent: p.feePercent,
    feeFixed: p.feeFixed,
  }));
}

/**
 * Get default payment provider
 */
export async function getDefaultPaymentProvider(): Promise<PaymentProviderConfig | null> {
  return prisma.paymentProviderConfig.findFirst({
    where: { enabled: true, isDefault: true }
  });
}

/**
 * Get payment provider by type
 */
export async function getPaymentProvider(
  provider: PaymentProviderType
): Promise<PaymentProviderConfig | null> {
  return prisma.paymentProviderConfig.findUnique({
    where: { provider }
  });
}

/**
 * Create or update payment provider config
 */
export async function upsertPaymentProvider(
  provider: PaymentProviderType,
  data: Omit<Prisma.PaymentProviderConfigCreateInput, 'provider'>
): Promise<PaymentProviderConfig> {
  // If setting as default, unset other defaults
  if (data.isDefault) {
    await prisma.paymentProviderConfig.updateMany({
      where: { isDefault: true, provider: { not: provider } },
      data: { isDefault: false }
    });
  }
  
  const result = await prisma.paymentProviderConfig.upsert({
    where: { provider },
    create: { provider, ...data },
    update: data,
  });
  
  logger.info('Payment provider updated', { provider, enabled: data.enabled });
  
  return result;
}

/**
 * Delete payment provider config
 */
export async function deletePaymentProvider(
  provider: PaymentProviderType
): Promise<void> {
  // Prevent deleting if it's the only enabled provider
  const enabledCount = await prisma.paymentProviderConfig.count({
    where: { enabled: true }
  });
  
  const providerConfig = await prisma.paymentProviderConfig.findUnique({
    where: { provider }
  });
  
  if (providerConfig?.enabled && enabledCount <= 1) {
    throw new AppError(400, 'Cannot delete the only enabled payment provider', 'LAST_PROVIDER');
  }
  
  await prisma.paymentProviderConfig.delete({
    where: { provider }
  });
  
  logger.info('Payment provider deleted', { provider });
}

/**
 * Initialize default payment providers
 * Called during seeding
 */
export async function initializeDefaultProviders(): Promise<void> {
  const existing = await prisma.paymentProviderConfig.count();
  
  if (existing > 0) {
    logger.info('Payment providers already configured');
    return;
  }
  
  // Create Manual provider as default
  await prisma.paymentProviderConfig.create({
    data: {
      provider: 'MANUAL',
      displayName: 'Manual / Cash',
      enabled: true,
      isDefault: true,
      sortOrder: 0,
      supportsBankTransfer: true,
      currencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
      countries: [],
    }
  });
  
  // Create Stripe (disabled by default)
  await prisma.paymentProviderConfig.create({
    data: {
      provider: 'STRIPE',
      displayName: 'Credit/Debit Card',
      enabled: false,
      isDefault: false,
      sortOrder: 1,
      supportsCreditCard: true,
      supportsDebitCard: true,
      currencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'],
      countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'JP'],
      feePercent: 2.9,
      feeFixed: 30,
    }
  });
  
  // Create PayPal (disabled by default)
  await prisma.paymentProviderConfig.create({
    data: {
      provider: 'PAYPAL',
      displayName: 'PayPal',
      enabled: false,
      isDefault: false,
      sortOrder: 2,
      supportsWallet: true,
      currencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
      countries: [],
      feePercent: 3.49,
      feeFixed: 49,
    }
  });
  
  // Create Hubtel (disabled by default, Ghana only)
  await prisma.paymentProviderConfig.create({
    data: {
      provider: 'HUBTEL',
      displayName: 'Mobile Money',
      enabled: false,
      isDefault: false,
      sortOrder: 3,
      supportsMobileMoney: true,
      currencies: ['GHS'],
      countries: ['GH'],
      feePercent: 1.75,
    }
  });
  
  logger.info('Default payment providers initialized');
}

// ============================================================================
// BRANDING HELPERS
// ============================================================================

/**
 * Branding-specific fields for easier updates
 */
export interface BrandingConfig {
  // Colors
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  textMutedColor: string;
  
  // Typography
  headingFont: string;
  bodyFont: string;
  borderRadius: string;
  
  // Assets
  logoUrl: string | null;
  logoDarkUrl: string | null;
  faviconUrl: string | null;
  heroImageUrl: string | null;
  
  // Custom CSS
  customCss: string | null;
}

/**
 * Get branding configuration
 */
export async function getBranding(): Promise<BrandingConfig> {
  const config = await getSiteConfig();
  
  return {
    primaryColor: config.primaryColor,
    secondaryColor: config.secondaryColor,
    accentColor: config.accentColor,
    backgroundColor: config.backgroundColor,
    surfaceColor: config.surfaceColor,
    textColor: config.textColor,
    textMutedColor: config.textMutedColor,
    headingFont: config.headingFont,
    bodyFont: config.bodyFont,
    borderRadius: config.borderRadius,
    logoUrl: config.logoUrl,
    logoDarkUrl: config.logoDarkUrl,
    faviconUrl: config.faviconUrl,
    heroImageUrl: config.heroImageUrl,
    customCss: config.customCss,
  };
}

/**
 * Update branding configuration
 */
export async function updateBranding(
  data: Partial<BrandingConfig>
): Promise<BrandingConfig> {
  await updateSiteConfig(data);
  return getBranding();
}

/**
 * Preset themes
 */
export const THEME_PRESETS = {
  dark: {
    primaryColor: '#3b82f6',
    secondaryColor: '#1e293b',
    accentColor: '#10b981',
    backgroundColor: '#0f172a',
    surfaceColor: '#1e293b',
    textColor: '#f8fafc',
    textMutedColor: '#94a3b8',
  },
  light: {
    primaryColor: '#2563eb',
    secondaryColor: '#f1f5f9',
    accentColor: '#059669',
    backgroundColor: '#ffffff',
    surfaceColor: '#f8fafc',
    textColor: '#0f172a',
    textMutedColor: '#64748b',
  },
  midnight: {
    primaryColor: '#8b5cf6',
    secondaryColor: '#1e1b4b',
    accentColor: '#f472b6',
    backgroundColor: '#0c0a1d',
    surfaceColor: '#1e1b4b',
    textColor: '#e2e8f0',
    textMutedColor: '#a78bfa',
  },
  forest: {
    primaryColor: '#22c55e',
    secondaryColor: '#14532d',
    accentColor: '#84cc16',
    backgroundColor: '#052e16',
    surfaceColor: '#14532d',
    textColor: '#f0fdf4',
    textMutedColor: '#86efac',
  },
  ocean: {
    primaryColor: '#06b6d4',
    secondaryColor: '#164e63',
    accentColor: '#0ea5e9',
    backgroundColor: '#0c4a6e',
    surfaceColor: '#155e75',
    textColor: '#ecfeff',
    textMutedColor: '#67e8f9',
  },
  sunset: {
    primaryColor: '#f97316',
    secondaryColor: '#7c2d12',
    accentColor: '#fbbf24',
    backgroundColor: '#431407',
    surfaceColor: '#7c2d12',
    textColor: '#fff7ed',
    textMutedColor: '#fdba74',
  },
} as const;

/**
 * Apply a theme preset
 */
export async function applyThemePreset(
  presetName: keyof typeof THEME_PRESETS
): Promise<BrandingConfig> {
  const preset = THEME_PRESETS[presetName];
  if (!preset) {
    throw new AppError(400, 'Invalid theme preset', 'INVALID_PRESET');
  }
  
  await updateSiteConfig(preset);
  logger.info('Theme preset applied', { preset: presetName });
  
  return getBranding();
}

// ============================================================================
// THEME HELPERS
// ============================================================================

/**
 * Generate CSS variables from config
 */
export function generateThemeCss(config: PublicSiteConfig): string {
  return `
:root {
  --color-primary: ${config.primaryColor};
  --color-secondary: ${config.secondaryColor};
  --color-accent: ${config.accentColor};
  --color-background: ${config.backgroundColor};
  --color-surface: ${config.surfaceColor};
  --color-text: ${config.textColor};
  --color-text-muted: ${config.textMutedColor};
  --font-heading: "${config.headingFont}", system-ui, sans-serif;
  --font-body: "${config.bodyFont}", system-ui, sans-serif;
  --radius: ${getBorderRadiusValue(config.borderRadius)};
}
`.trim();
}

function getBorderRadiusValue(radius: string): string {
  const values: Record<string, string> = {
    'none': '0px',
    'sm': '0.25rem',
    'md': '0.5rem',
    'lg': '1rem',
    'full': '9999px',
  };
  return values[radius] || '0.5rem';
}

