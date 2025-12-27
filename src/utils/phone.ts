/**
 * Phone number utilities for Ghana mobile numbers
 * Supports MTN, Vodafone, AirtelTigo formats
 */

/**
 * Ghana phone number prefixes by carrier
 */
const GHANA_PREFIXES = {
  mtn: ['024', '054', '055', '059'],
  vodafone: ['020', '050'],
  airtelTigo: ['026', '027', '056', '057'],
} as const;

/**
 * All valid Ghana mobile prefixes
 */
const ALL_PREFIXES: string[] = [
  ...GHANA_PREFIXES.mtn,
  ...GHANA_PREFIXES.vodafone,
  ...GHANA_PREFIXES.airtelTigo,
];

/**
 * Phone validation result
 */
export interface PhoneValidation {
  valid: boolean;
  normalized: string | null;
  carrier: 'mtn' | 'vodafone' | 'airtelTigo' | null;
  error?: string;
}

/**
 * Normalize a Ghana phone number to international format (233XXXXXXXXX)
 * 
 * @param phone - Phone number in any format
 * @returns Normalized phone number or null if invalid
 */
export function normalizePhone(phone: string): string | null {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Handle different formats
  if (digits.length === 12 && digits.startsWith('233')) {
    // Already in international format: 233XXXXXXXXX
    return digits;
  }
  
  if (digits.length === 10 && digits.startsWith('0')) {
    // Local format: 0XXXXXXXXX -> 233XXXXXXXXX
    return `233${digits.slice(1)}`;
  }
  
  if (digits.length === 9) {
    // Short format: XXXXXXXXX -> 233XXXXXXXXX
    return `233${digits}`;
  }
  
  if (digits.length === 11 && digits.startsWith('233')) {
    // Missing leading zero case: 233XXXXXXXX (11 digits)
    return null; // Invalid
  }
  
  return null;
}

/**
 * Validate a Ghana phone number
 * 
 * @param phone - Phone number to validate
 * @returns Validation result with normalized number and carrier
 */
export function validatePhone(phone: string): PhoneValidation {
  const normalized = normalizePhone(phone);
  
  if (!normalized) {
    return {
      valid: false,
      normalized: null,
      carrier: null,
      error: 'Invalid phone number format. Use 0XXXXXXXXX or 233XXXXXXXXX',
    };
  }
  
  // Extract local prefix (e.g., 024 from 233XXXXXXXXX)
  const localNumber = `0${normalized.slice(3)}`;
  const prefix = localNumber.slice(0, 3);
  
  // Check if prefix is valid
  if (!ALL_PREFIXES.includes(prefix)) {
    return {
      valid: false,
      normalized: null,
      carrier: null,
      error: `Invalid carrier prefix: ${prefix}. Must be a valid Ghana mobile number`,
    };
  }
  
  // Determine carrier
  let carrier: 'mtn' | 'vodafone' | 'airtelTigo' | null = null;
  
  if ((GHANA_PREFIXES.mtn as readonly string[]).includes(prefix)) {
    carrier = 'mtn';
  } else if ((GHANA_PREFIXES.vodafone as readonly string[]).includes(prefix)) {
    carrier = 'vodafone';
  } else if ((GHANA_PREFIXES.airtelTigo as readonly string[]).includes(prefix)) {
    carrier = 'airtelTigo';
  }
  
  return {
    valid: true,
    normalized,
    carrier,
  };
}

/**
 * Format phone for display
 * 
 * @param phone - Normalized phone number (233XXXXXXXXX)
 * @param format - Display format
 * @returns Formatted phone string
 */
export function formatPhone(
  phone: string,
  format: 'local' | 'international' | 'spaced' = 'local'
): string {
  const normalized = normalizePhone(phone);
  if (!normalized) return phone;
  
  const localNumber = `0${normalized.slice(3)}`;
  
  switch (format) {
    case 'local':
      // 024 123 4567
      return localNumber;
      
    case 'international':
      // +233 24 123 4567
      return `+233 ${normalized.slice(3, 5)} ${normalized.slice(5, 8)} ${normalized.slice(8)}`;
      
    case 'spaced':
      // 024 123 4567
      return `${localNumber.slice(0, 3)} ${localNumber.slice(3, 6)} ${localNumber.slice(6)}`;
      
    default:
      return localNumber;
  }
}

/**
 * Get mobile money channel code for Hubtel
 * 
 * @param phone - Phone number
 * @returns Hubtel channel code or null
 */
export function getHubtelChannel(phone: string): string | null {
  const validation = validatePhone(phone);
  
  if (!validation.valid || !validation.carrier) {
    return null;
  }
  
  switch (validation.carrier) {
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

/**
 * Mask phone number for privacy
 * 
 * @param phone - Phone number to mask
 * @returns Masked phone (e.g., 024****567)
 */
export function maskPhone(phone: string): string {
  const normalized = normalizePhone(phone);
  if (!normalized) return '***';
  
  const localNumber = `0${normalized.slice(3)}`;
  return `${localNumber.slice(0, 3)}****${localNumber.slice(7)}`;
}

/**
 * Compare two phone numbers (handles different formats)
 * 
 * @param phone1 - First phone number
 * @param phone2 - Second phone number
 * @returns true if phones match
 */
export function phonesMatch(phone1: string, phone2: string): boolean {
  const norm1 = normalizePhone(phone1);
  const norm2 = normalizePhone(phone2);
  
  if (!norm1 || !norm2) return false;
  return norm1 === norm2;
}

/**
 * Extract all phone numbers from a text
 * 
 * @param text - Text to search
 * @returns Array of normalized phone numbers found
 */
export function extractPhones(text: string): string[] {
  // Match various phone formats
  const phonePattern = /(?:\+?233|0)\d{9}/g;
  const matches = text.match(phonePattern) || [];
  
  const phones: string[] = [];
  for (const match of matches) {
    const normalized = normalizePhone(match);
    if (normalized && !phones.includes(normalized)) {
      phones.push(normalized);
    }
  }
  
  return phones;
}
