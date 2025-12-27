/**
 * Currency Utilities
 * Handles formatting, parsing, and conversion of monetary values
 * Supports any currency using Intl.NumberFormat
 */

// ============================================================================
// TYPES
// ============================================================================

/**
 * Currency information
 */
export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  decimals: number;
  symbolPosition: 'before' | 'after';
}

/**
 * Format options for currency display
 */
export interface FormatOptions {
  locale?: string;
  showSymbol?: boolean;
  showCode?: boolean;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Common currency configurations
 * Amounts are stored in smallest unit (cents/pesewas/etc)
 */
export const CURRENCIES: Record<string, CurrencyInfo> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', decimals: 2, symbolPosition: 'before' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', decimals: 2, symbolPosition: 'before' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', decimals: 2, symbolPosition: 'before' },
  GHS: { code: 'GHS', symbol: '₵', name: 'Ghana Cedi', decimals: 2, symbolPosition: 'before' },
  NGN: { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', decimals: 2, symbolPosition: 'before' },
  KES: { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', decimals: 2, symbolPosition: 'before' },
  ZAR: { code: 'ZAR', symbol: 'R', name: 'South African Rand', decimals: 2, symbolPosition: 'before' },
  CAD: { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', decimals: 2, symbolPosition: 'before' },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', decimals: 2, symbolPosition: 'before' },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', decimals: 0, symbolPosition: 'before' },
  CNY: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', decimals: 2, symbolPosition: 'before' },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', decimals: 2, symbolPosition: 'before' },
  BRL: { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', decimals: 2, symbolPosition: 'before' },
  MXN: { code: 'MXN', symbol: 'MX$', name: 'Mexican Peso', decimals: 2, symbolPosition: 'before' },
  CHF: { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', decimals: 2, symbolPosition: 'before' },
  SEK: { code: 'SEK', symbol: 'kr', name: 'Swedish Krona', decimals: 2, symbolPosition: 'after' },
  NOK: { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone', decimals: 2, symbolPosition: 'after' },
  DKK: { code: 'DKK', symbol: 'kr', name: 'Danish Krone', decimals: 2, symbolPosition: 'after' },
  PLN: { code: 'PLN', symbol: 'zł', name: 'Polish Zloty', decimals: 2, symbolPosition: 'after' },
  RUB: { code: 'RUB', symbol: '₽', name: 'Russian Ruble', decimals: 2, symbolPosition: 'after' },
  TRY: { code: 'TRY', symbol: '₺', name: 'Turkish Lira', decimals: 2, symbolPosition: 'before' },
  KRW: { code: 'KRW', symbol: '₩', name: 'South Korean Won', decimals: 0, symbolPosition: 'before' },
  SGD: { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', decimals: 2, symbolPosition: 'before' },
  HKD: { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar', decimals: 2, symbolPosition: 'before' },
  NZD: { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar', decimals: 2, symbolPosition: 'before' },
  PHP: { code: 'PHP', symbol: '₱', name: 'Philippine Peso', decimals: 2, symbolPosition: 'before' },
  THB: { code: 'THB', symbol: '฿', name: 'Thai Baht', decimals: 2, symbolPosition: 'before' },
  IDR: { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', decimals: 0, symbolPosition: 'before' },
  MYR: { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', decimals: 2, symbolPosition: 'before' },
  VND: { code: 'VND', symbol: '₫', name: 'Vietnamese Dong', decimals: 0, symbolPosition: 'after' },
  AED: { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', decimals: 2, symbolPosition: 'before' },
  SAR: { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal', decimals: 2, symbolPosition: 'before' },
  EGP: { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound', decimals: 2, symbolPosition: 'before' },
};

/**
 * Default locale for formatting
 */
const DEFAULT_LOCALE = 'en-US';

/**
 * Default currency
 */
const DEFAULT_CURRENCY = 'USD';

// ============================================================================
// FORMATTING
// ============================================================================

/**
 * Format an amount for display
 * Amount is in smallest unit (cents/pesewas)
 * 
 * @param amount - Amount in smallest unit (e.g., cents)
 * @param currency - Currency code (e.g., 'USD')
 * @param locale - Locale for formatting (e.g., 'en-US')
 * @returns Formatted string (e.g., '$10.00')
 */
export function formatCurrency(
  amount: number,
  currency: string = DEFAULT_CURRENCY,
  locale: string = DEFAULT_LOCALE
): string {
  const currencyInfo = CURRENCIES[currency.toUpperCase()] || CURRENCIES[DEFAULT_CURRENCY];
  const divisor = Math.pow(10, currencyInfo.decimals);
  const displayAmount = amount / divisor;

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: currencyInfo.decimals,
      maximumFractionDigits: currencyInfo.decimals,
    }).format(displayAmount);
  } catch {
    // Fallback for unsupported currencies
    return `${currencyInfo.symbol}${displayAmount.toFixed(currencyInfo.decimals)}`;
  }
}

/**
 * Format amount without currency symbol
 * 
 * @param amount - Amount in smallest unit
 * @param currency - Currency code
 * @param locale - Locale for formatting
 * @returns Formatted number string (e.g., '10.00')
 */
export function formatAmount(
  amount: number,
  currency: string = DEFAULT_CURRENCY,
  locale: string = DEFAULT_LOCALE
): string {
  const currencyInfo = CURRENCIES[currency.toUpperCase()] || CURRENCIES[DEFAULT_CURRENCY];
  const divisor = Math.pow(10, currencyInfo.decimals);
  const displayAmount = amount / divisor;

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: currencyInfo.decimals,
    maximumFractionDigits: currencyInfo.decimals,
  }).format(displayAmount);
}

/**
 * Format with custom options
 */
export function formatCurrencyCustom(
  amount: number,
  currency: string,
  options: FormatOptions = {}
): string {
  const {
    locale = DEFAULT_LOCALE,
    showSymbol = true,
    showCode = false,
    minimumFractionDigits,
    maximumFractionDigits,
  } = options;

  const currencyInfo = CURRENCIES[currency.toUpperCase()] || CURRENCIES[DEFAULT_CURRENCY];
  const divisor = Math.pow(10, currencyInfo.decimals);
  const displayAmount = amount / divisor;

  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: minimumFractionDigits ?? currencyInfo.decimals,
    maximumFractionDigits: maximumFractionDigits ?? currencyInfo.decimals,
  }).format(displayAmount);

  if (!showSymbol && !showCode) {
    return formatted;
  }

  if (showCode) {
    return `${formatted} ${currency.toUpperCase()}`;
  }

  // With symbol
  if (currencyInfo.symbolPosition === 'after') {
    return `${formatted}${currencyInfo.symbol}`;
  }
  return `${currencyInfo.symbol}${formatted}`;
}

// ============================================================================
// PARSING
// ============================================================================

/**
 * Parse a display amount to smallest unit (cents/pesewas)
 * 
 * @param displayAmount - Amount string (e.g., '10.00', '$10', '10,00')
 * @param currency - Currency code
 * @returns Amount in smallest unit
 */
export function parseCurrency(
  displayAmount: string | number,
  currency: string = DEFAULT_CURRENCY
): number {
  const currencyInfo = CURRENCIES[currency.toUpperCase()] || CURRENCIES[DEFAULT_CURRENCY];
  const multiplier = Math.pow(10, currencyInfo.decimals);

  if (typeof displayAmount === 'number') {
    return Math.round(displayAmount * multiplier);
  }

  // Remove currency symbols and thousands separators
  const cleaned = displayAmount
    .replace(/[^\d.,\-]/g, '') // Keep only digits, dots, commas, minus
    .replace(/,(?=\d{3})/g, '') // Remove thousands separators (comma before 3 digits)
    .replace(',', '.'); // Convert European decimal separator

  const parsed = parseFloat(cleaned);

  if (isNaN(parsed)) {
    return 0;
  }

  return Math.round(parsed * multiplier);
}

/**
 * Convert display amount to smallest unit
 * Alias for parseCurrency
 */
export function toSmallestUnit(
  displayAmount: number,
  currency: string = DEFAULT_CURRENCY
): number {
  const currencyInfo = CURRENCIES[currency.toUpperCase()] || CURRENCIES[DEFAULT_CURRENCY];
  return Math.round(displayAmount * Math.pow(10, currencyInfo.decimals));
}

/**
 * Convert from smallest unit to display amount
 */
export function fromSmallestUnit(
  amount: number,
  currency: string = DEFAULT_CURRENCY
): number {
  const currencyInfo = CURRENCIES[currency.toUpperCase()] || CURRENCIES[DEFAULT_CURRENCY];
  return amount / Math.pow(10, currencyInfo.decimals);
}

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Get currency symbol
 * 
 * @param currency - Currency code
 * @returns Currency symbol
 */
export function getCurrencySymbol(currency: string): string {
  const info = CURRENCIES[currency.toUpperCase()];
  if (info) return info.symbol;

  // Try to get from Intl
  try {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(0);
    // Extract symbol (usually at start or end)
    return formatted.replace(/[\d.,\s]/g, '') || currency;
  } catch {
    return currency;
  }
}

/**
 * Get currency info
 */
export function getCurrencyInfo(currency: string): CurrencyInfo | null {
  return CURRENCIES[currency.toUpperCase()] || null;
}

/**
 * Get decimal places for a currency
 */
export function getCurrencyDecimals(currency: string): number {
  const info = CURRENCIES[currency.toUpperCase()];
  return info?.decimals ?? 2;
}

/**
 * Check if a currency is supported
 */
export function isSupportedCurrency(currency: string): boolean {
  if (CURRENCIES[currency.toUpperCase()]) return true;

  // Try Intl
  try {
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get all supported currency codes
 */
export function getSupportedCurrencies(): string[] {
  return Object.keys(CURRENCIES);
}

/**
 * Add two amounts (avoids floating point issues)
 */
export function addAmounts(a: number, b: number): number {
  return Math.round(a + b);
}

/**
 * Subtract amounts (avoids floating point issues)
 */
export function subtractAmounts(a: number, b: number): number {
  return Math.round(a - b);
}

/**
 * Multiply amount by factor
 */
export function multiplyAmount(amount: number, factor: number): number {
  return Math.round(amount * factor);
}

/**
 * Calculate percentage of amount
 */
export function percentageOf(amount: number, percentage: number): number {
  return Math.round((amount * percentage) / 100);
}

/**
 * Format price range
 */
export function formatPriceRange(
  minAmount: number,
  maxAmount: number,
  currency: string = DEFAULT_CURRENCY,
  locale: string = DEFAULT_LOCALE
): string {
  if (minAmount === maxAmount) {
    return formatCurrency(minAmount, currency, locale);
  }
  
  const min = formatCurrency(minAmount, currency, locale);
  const max = formatCurrency(maxAmount, currency, locale);
  
  return `${min} - ${max}`;
}

/**
 * Format amount with abbreviation for large numbers
 * e.g., $1.2M, $500K
 */
export function formatCurrencyCompact(
  amount: number,
  currency: string = DEFAULT_CURRENCY,
  locale: string = DEFAULT_LOCALE
): string {
  const currencyInfo = CURRENCIES[currency.toUpperCase()] || CURRENCIES[DEFAULT_CURRENCY];
  const divisor = Math.pow(10, currencyInfo.decimals);
  const displayAmount = amount / divisor;

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency.toUpperCase(),
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(displayAmount);
  } catch {
    // Fallback
    const abs = Math.abs(displayAmount);
    let suffix = '';
    let value = displayAmount;

    if (abs >= 1e9) {
      suffix = 'B';
      value = displayAmount / 1e9;
    } else if (abs >= 1e6) {
      suffix = 'M';
      value = displayAmount / 1e6;
    } else if (abs >= 1e3) {
      suffix = 'K';
      value = displayAmount / 1e3;
    }

    return `${currencyInfo.symbol}${value.toFixed(1)}${suffix}`;
  }
}

