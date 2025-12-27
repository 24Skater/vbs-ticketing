/**
 * International Phone Number Utilities
 * Uses libphonenumber-js for validation and formatting
 * Supports any country's phone numbers
 */

import {
  parsePhoneNumber,
  isValidPhoneNumber,
  CountryCode,
  PhoneNumber,
  getCountryCallingCode,
} from 'libphonenumber-js';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Phone validation result
 */
export interface PhoneValidation {
  valid: boolean;
  normalized: string | null;
  country: string | null;
  countryCode: string | null;
  nationalNumber: string | null;
  error?: string;
}

/**
 * Phone format options
 */
export type PhoneFormat = 'E164' | 'INTERNATIONAL' | 'NATIONAL' | 'RFC3966';

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validate a phone number
 * Works with any country's phone numbers
 * 
 * @param phone - Phone number in any format
 * @param defaultCountry - Default country code if not in international format
 * @returns Validation result
 */
export function validatePhone(
  phone: string,
  defaultCountry?: string
): PhoneValidation {
  if (!phone || typeof phone !== 'string') {
    return {
      valid: false,
      normalized: null,
      country: null,
      countryCode: null,
      nationalNumber: null,
      error: 'Phone number is required',
    };
  }

  // Clean the input
  const cleaned = phone.trim();

  try {
    // Try to parse with default country
    const countryCode = defaultCountry?.toUpperCase() as CountryCode | undefined;
    
    // First check if it's valid
    if (!isValidPhoneNumber(cleaned, countryCode)) {
      return {
        valid: false,
        normalized: null,
        country: null,
        countryCode: null,
        nationalNumber: null,
        error: 'Invalid phone number format',
      };
    }

    // Parse to get details
    const parsed = parsePhoneNumber(cleaned, countryCode);
    
    if (!parsed) {
      return {
        valid: false,
        normalized: null,
        country: null,
        countryCode: null,
        nationalNumber: null,
        error: 'Could not parse phone number',
      };
    }

    return {
      valid: true,
      normalized: parsed.format('E.164').replace('+', ''), // Store without + prefix
      country: parsed.country || null,
      countryCode: parsed.countryCallingCode || null,
      nationalNumber: parsed.nationalNumber || null,
    };
  } catch (error) {
    // Fallback: if it's at least 7 digits, consider it potentially valid
    const digits = cleaned.replace(/\D/g, '');
    
    if (digits.length >= 7 && digits.length <= 15) {
      return {
        valid: true,
        normalized: digits,
        country: null,
        countryCode: null,
        nationalNumber: digits,
      };
    }

    return {
      valid: false,
      normalized: null,
      country: null,
      countryCode: null,
      nationalNumber: null,
      error: 'Invalid phone number',
    };
  }
}

/**
 * Check if a phone number is valid
 * 
 * @param phone - Phone number to check
 * @param defaultCountry - Default country code
 * @returns true if valid
 */
export function isValidPhone(phone: string, defaultCountry?: string): boolean {
  return validatePhone(phone, defaultCountry).valid;
}

// ============================================================================
// NORMALIZATION
// ============================================================================

/**
 * Normalize a phone number to E.164 format (without + prefix)
 * 
 * @param phone - Phone number in any format
 * @param defaultCountry - Default country if not in international format
 * @returns Normalized number or null if invalid
 */
export function normalizePhone(phone: string, defaultCountry?: string): string | null {
  const result = validatePhone(phone, defaultCountry);
  return result.normalized;
}

/**
 * Normalize phone for storage (E.164 without +)
 * More lenient - stores whatever digits we can extract
 * 
 * @param phone - Phone number
 * @param defaultCountry - Default country
 * @returns Normalized phone or original digits
 */
export function normalizePhoneForStorage(phone: string, defaultCountry?: string): string {
  const result = validatePhone(phone, defaultCountry);
  
  if (result.normalized) {
    return result.normalized;
  }
  
  // Fallback: just store cleaned digits
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 7 ? digits : phone;
}

// ============================================================================
// FORMATTING
// ============================================================================

/**
 * Format a phone number for display
 * 
 * @param phone - Phone number (normalized or raw)
 * @param format - Output format
 * @param defaultCountry - Default country for parsing
 * @returns Formatted phone string
 */
export function formatPhone(
  phone: string,
  format: PhoneFormat = 'INTERNATIONAL',
  defaultCountry?: string
): string {
  if (!phone) return '';

  try {
    // Add + prefix if it looks like E.164 without it
    let input = phone;
    if (/^\d{10,15}$/.test(phone) && !phone.startsWith('+')) {
      input = `+${phone}`;
    }

    const countryCode = defaultCountry?.toUpperCase() as CountryCode | undefined;
    const parsed = parsePhoneNumber(input, countryCode);

    if (!parsed) return phone;

    switch (format) {
      case 'E164':
        return parsed.format('E.164');
      case 'INTERNATIONAL':
        return parsed.formatInternational();
      case 'NATIONAL':
        return parsed.formatNational();
      case 'RFC3966':
        return parsed.format('RFC3966');
      default:
        return parsed.formatInternational();
    }
  } catch {
    return phone;
  }
}

/**
 * Format phone for user display (international format)
 */
export function formatPhoneDisplay(phone: string, defaultCountry?: string): string {
  return formatPhone(phone, 'INTERNATIONAL', defaultCountry);
}

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Mask phone number for privacy
 * Shows first 3 and last 2 digits only
 * 
 * @param phone - Phone number to mask
 * @returns Masked phone (e.g., +1 234 ***-**56)
 */
export function maskPhone(phone: string): string {
  if (!phone) return '***';

  const digits = phone.replace(/\D/g, '');
  
  if (digits.length < 6) return '***';

  // Show first 3 and last 2 digits
  const start = digits.slice(0, 3);
  const end = digits.slice(-2);
  const masked = '*'.repeat(digits.length - 5);
  
  return `${start}${masked}${end}`;
}

/**
 * Compare two phone numbers (handles different formats)
 * 
 * @param phone1 - First phone number
 * @param phone2 - Second phone number
 * @param defaultCountry - Default country for both
 * @returns true if phones match
 */
export function phonesMatch(
  phone1: string,
  phone2: string,
  defaultCountry?: string
): boolean {
  const norm1 = normalizePhone(phone1, defaultCountry);
  const norm2 = normalizePhone(phone2, defaultCountry);

  if (!norm1 || !norm2) {
    // Fallback: compare digits directly
    const digits1 = phone1.replace(/\D/g, '');
    const digits2 = phone2.replace(/\D/g, '');
    
    // Check if one ends with the other (handles country code differences)
    return digits1.endsWith(digits2) || digits2.endsWith(digits1);
  }

  return norm1 === norm2;
}

/**
 * Get country calling code
 * 
 * @param countryCode - ISO 3166-1 alpha-2 country code
 * @returns Calling code (e.g., "1" for US) or null
 */
export function getCallingCode(countryCode: string): string | null {
  try {
    return getCountryCallingCode(countryCode.toUpperCase() as CountryCode);
  } catch {
    return null;
  }
}

/**
 * Parse phone number to get details
 * 
 * @param phone - Phone number
 * @param defaultCountry - Default country
 * @returns Parsed phone number or null
 */
export function parsePhone(phone: string, defaultCountry?: string): PhoneNumber | null {
  try {
    const countryCode = defaultCountry?.toUpperCase() as CountryCode | undefined;
    return parsePhoneNumber(phone, countryCode) || null;
  } catch {
    return null;
  }
}

// ============================================================================
// LEGACY SUPPORT (Ghana-specific, for backwards compatibility)
// ============================================================================

/**
 * Ghana phone number prefixes by carrier
 * @deprecated Use validatePhone with country='GH' instead
 */
export const GHANA_PREFIXES = {
  mtn: ['024', '054', '055', '059'],
  vodafone: ['020', '050'],
  airtelTigo: ['026', '027', '056', '057'],
} as const;

/**
 * Get Ghana carrier from phone number
 * @deprecated Use for Hubtel integration only
 */
export function getGhanaCarrier(phone: string): 'mtn' | 'vodafone' | 'airtelTigo' | null {
  const normalized = normalizePhone(phone, 'GH');
  if (!normalized) return null;

  // Extract local prefix (e.g., 024 from 233XXXXXXXXX)
  let localNumber: string;
  if (normalized.startsWith('233')) {
    localNumber = `0${normalized.slice(3)}`;
  } else {
    localNumber = normalized.startsWith('0') ? normalized : `0${normalized}`;
  }
  
  const prefix = localNumber.slice(0, 3);

  if ((GHANA_PREFIXES.mtn as readonly string[]).includes(prefix)) return 'mtn';
  if ((GHANA_PREFIXES.vodafone as readonly string[]).includes(prefix)) return 'vodafone';
  if ((GHANA_PREFIXES.airtelTigo as readonly string[]).includes(prefix)) return 'airtelTigo';

  return null;
}

/**
 * Get Hubtel mobile money channel code
 * @deprecated Keep for Hubtel payment integration
 */
export function getHubtelChannel(phone: string): string | null {
  const carrier = getGhanaCarrier(phone);

  switch (carrier) {
    case 'mtn':
      return 'mtn-gh';
    case 'vodafone':
      return 'vodafone-gh';
    case 'airtelTigo':
      return 'tigo-gh';
    default:
      return null;
  }
}
