import { z } from 'zod';

/**
 * Ghana phone number regex patterns
 */
const GHANA_PHONE_PATTERNS = {
  international: /^233\d{9}$/, // 233XXXXXXXXX
  local: /^0\d{9}$/,          // 0XXXXXXXXX
  short: /^\d{9}$/,           // XXXXXXXXX
};

/**
 * Phone number schema with normalization
 * Accepts various formats and normalizes to 233XXXXXXXXX
 */
export const phoneSchema = z.string()
  .transform(val => val.replace(/[\s\-\(\)\.]/g, '')) // Remove formatting
  .transform(val => val.replace(/^\+/, ''))           // Remove leading +
  .refine(val => {
    const digits = val.replace(/\D/g, '');
    return (
      GHANA_PHONE_PATTERNS.international.test(digits) ||
      GHANA_PHONE_PATTERNS.local.test(digits) ||
      GHANA_PHONE_PATTERNS.short.test(digits)
    );
  }, {
    message: 'Invalid Ghana phone number. Use format: 233XXXXXXXXX, 0XXXXXXXXX, or XXXXXXXXX',
  })
  .transform(val => {
    const digits = val.replace(/\D/g, '');
    if (digits.startsWith('233') && digits.length === 12) return digits;
    if (digits.startsWith('0') && digits.length === 10) return `233${digits.slice(1)}`;
    if (digits.length === 9) return `233${digits}`;
    return digits;
  });

/**
 * Ticket ID format: VBS-XXXXXX (6 hex characters)
 */
export const ticketIdSchema = z.string()
  .toUpperCase()
  .trim()
  .regex(/^VBS-[A-F0-9]{6}$/, 'Invalid ticket ID format. Expected: VBS-XXXXXX');

/**
 * Access code format: 5 alphanumeric characters
 */
export const accessCodeSchema = z.string()
  .toUpperCase()
  .trim()
  .length(5, 'Access code must be exactly 5 characters')
  .regex(/^[A-Z0-9]{5}$/, 'Access code must contain only letters and numbers');

/**
 * Ticket type enum
 */
export const ticketTypeSchema = z.enum(['REGULAR', 'VIP', 'EARLY_BIRD', 'COMPLIMENTARY']);

/**
 * Create ticket validation
 */
export const createTicketSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .trim(),
  phone: phoneSchema,
  ticketType: ticketTypeSchema.optional().default('REGULAR'),
  eventId: z.string().cuid('Invalid event ID').optional(),
  amount: z.number().positive('Amount must be positive').optional(),
  status: z.enum(['PENDING', 'PAID']).optional().default('PAID'),
});

/**
 * Bulk create tickets validation
 */
export const bulkCreateTicketSchema = z.object({
  tickets: z.array(createTicketSchema)
    .min(1, 'At least one ticket is required')
    .max(100, 'Maximum 100 tickets per batch'),
  eventId: z.string().cuid('Invalid event ID').optional(),
});

/**
 * Verify/check-in ticket validation
 */
export const verifyTicketSchema = z.object({
  ticketId: ticketIdSchema,
});

/**
 * Lookup ticket by phone and access code
 */
export const lookupTicketSchema = z.object({
  phone: phoneSchema,
  accessCode: accessCodeSchema,
});

/**
 * Search tickets query
 */
export const searchTicketsSchema = z.object({
  query: z.string().optional(),
  status: z.enum(['PENDING', 'PAID', 'USED', 'CANCELLED', 'REFUNDED', 'EXPIRED']).optional(),
  ticketType: ticketTypeSchema.optional(),
  eventId: z.string().optional(),
  checkedIn: z.string().transform(val => val === 'true').optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
});

/**
 * Update ticket validation
 */
export const updateTicketSchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  phone: phoneSchema.optional(),
  ticketType: ticketTypeSchema.optional(),
  status: z.enum(['PENDING', 'PAID', 'CANCELLED', 'REFUNDED']).optional(),
});

// Type exports
export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type BulkCreateTicketInput = z.infer<typeof bulkCreateTicketSchema>;
export type VerifyTicketInput = z.infer<typeof verifyTicketSchema>;
export type LookupTicketInput = z.infer<typeof lookupTicketSchema>;
export type SearchTicketsInput = z.infer<typeof searchTicketsSchema>;
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>;

