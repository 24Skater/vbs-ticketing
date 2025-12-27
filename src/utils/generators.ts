import crypto from 'crypto';

/**
 * Generate a unique ticket ID
 * Format: VBS-XXXXXX (6 hex characters)
 * 
 * @returns Unique ticket ID string
 */
export function generateTicketId(): string {
  const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `VBS-${randomHex}`;
}

/**
 * Generate a unique access code for ticket lookup
 * Format: 5 alphanumeric characters (uppercase)
 * 
 * @returns Access code string
 */
export function generateAccessCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed ambiguous: 0, O, I, 1
  let code = '';
  const randomBytes = crypto.randomBytes(5);
  
  for (let i = 0; i < 5; i++) {
    code += chars[randomBytes[i] % chars.length];
  }
  
  return code;
}

/**
 * Generate a unique payment reference
 * Format: PAY-YYYYMMDD-XXXXXXXX (8 hex characters)
 * 
 * @returns Payment reference string
 */
export function generatePaymentReference(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const randomHex = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `PAY-${dateStr}-${randomHex}`;
}

/**
 * Generate a secure random token
 * Used for password reset tokens, verification links, etc.
 * 
 * @param length - Length of the token in bytes (default: 32)
 * @returns Hex-encoded token string
 */
export function generateSecureToken(length = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Generate a short numeric OTP
 * 
 * @param length - Number of digits (default: 6)
 * @returns Numeric OTP string
 */
export function generateOTP(length = 6): string {
  const max = Math.pow(10, length) - 1;
  const min = Math.pow(10, length - 1);
  const randomNum = crypto.randomInt(min, max + 1);
  return randomNum.toString();
}

/**
 * Generate a CUID-like ID for database records
 * More readable than UUID, still collision-resistant
 * 
 * @returns CUID string
 */
export function generateId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = crypto.randomBytes(8).toString('hex');
  return `${timestamp}${randomPart}`;
}

/**
 * Generate a slug from a string
 * 
 * @param text - Text to slugify
 * @param maxLength - Maximum length of slug (default: 50)
 * @returns URL-safe slug
 */
export function generateSlug(text: string, maxLength = 50): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special chars
    .replace(/[\s_-]+/g, '-') // Replace spaces/underscores with hyphens
    .replace(/^-+|-+$/g, '')  // Remove leading/trailing hyphens
    .slice(0, maxLength);
}

/**
 * Generate a unique session ID
 * 
 * @returns Session ID string
 */
export function generateSessionId(): string {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(16).toString('base64url');
  return `sess_${timestamp}_${random}`;
}

/**
 * Check if a string matches ticket ID format
 * 
 * @param id - String to check
 * @returns true if valid ticket ID format
 */
export function isValidTicketIdFormat(id: string): boolean {
  return /^VBS-[A-F0-9]{6}$/.test(id.toUpperCase());
}

/**
 * Check if a string matches access code format
 * 
 * @param code - String to check
 * @returns true if valid access code format
 */
export function isValidAccessCodeFormat(code: string): boolean {
  return /^[A-Z0-9]{5}$/.test(code.toUpperCase());
}

/**
 * Generate unique ticket ID ensuring no collision
 * Uses callback to check for existing IDs
 * 
 * @param checkExists - Async function to check if ID exists
 * @param maxAttempts - Maximum attempts before giving up
 * @returns Unique ticket ID
 */
export async function generateUniqueTicketId(
  checkExists: (id: string) => Promise<boolean>,
  maxAttempts = 10
): Promise<string> {
  for (let i = 0; i < maxAttempts; i++) {
    const id = generateTicketId();
    const exists = await checkExists(id);
    if (!exists) return id;
  }
  throw new Error('Failed to generate unique ticket ID after max attempts');
}

/**
 * Generate unique access code ensuring no collision
 * 
 * @param checkExists - Async function to check if code exists
 * @param maxAttempts - Maximum attempts before giving up
 * @returns Unique access code
 */
export async function generateUniqueAccessCode(
  checkExists: (code: string) => Promise<boolean>,
  maxAttempts = 10
): Promise<string> {
  for (let i = 0; i < maxAttempts; i++) {
    const code = generateAccessCode();
    const exists = await checkExists(code);
    if (!exists) return code;
  }
  throw new Error('Failed to generate unique access code after max attempts');
}
