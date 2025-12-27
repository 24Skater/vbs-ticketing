import { z } from 'zod';
import { isValidPhone, normalizePhoneForStorage } from '../utils/phone.js';

/**
 * International phone number schema with normalization
 * Accepts phone numbers from any country
 */
export const phoneSchema = z.string()
  .min(7, 'Phone number must have at least 7 digits')
  .transform(val => val.replace(/[\s\-\(\)\.]/g, '')) // Remove formatting
  .transform(val => val.replace(/^\+/, ''))           // Remove leading +
  .refine(val => {
    const digits = val.replace(/\D/g, '');
    return digits.length >= 7 && digits.length <= 15;
  }, {
    message: 'Phone number must have between 7 and 15 digits',
  })
  .transform(val => normalizePhoneForStorage(val));

/**
 * Optional phone schema for cases where phone is not required
 */
export const optionalPhoneSchema = z.string()
  .optional()
  .nullable()
  .transform(val => {
    if (!val) return null;
    const cleaned = val.replace(/[\s\-\(\)\.+]/g, '');
    if (cleaned.length < 7) return null;
    return normalizePhoneForStorage(val);
  });

/**
 * Strict phone schema that validates the number is real
 * Uses libphonenumber for validation
 */
export const strictPhoneSchema = z.string()
  .refine(val => isValidPhone(val), {
    message: 'Please enter a valid phone number',
  })
  .transform(val => normalizePhoneForStorage(val));

/**
 * Ticket ID format: Configurable prefix + unique identifier
 * Default: VBS-XXXXXX (6 hex characters)
 */
export const ticketIdSchema = z.string()
  .toUpperCase()
  .trim()
  .min(6, 'Ticket ID too short')
  .max(20, 'Ticket ID too long')
  .regex(/^[A-Z0-9\-]+$/, 'Invalid ticket ID format');

/**
 * Access code format: 5 alphanumeric characters
 */
export const accessCodeSchema = z.string()
  .toUpperCase()
  .trim()
  .length(5, 'Access code must be exactly 5 characters')
  .regex(/^[A-Z0-9]{5}$/, 'Access code must contain only letters and numbers');

/**
 * Ticket status enum
 */
export const ticketStatusSchema = z.enum([
  'PENDING',
  'PAID',
  'USED',
  'CANCELLED',
  'REFUNDED',
  'EXPIRED'
]);

/**
 * Email validation
 */
export const emailSchema = z.string()
  .email('Invalid email address')
  .toLowerCase()
  .trim()
  .optional()
  .nullable();

/**
 * Create ticket validation
 */
export const createTicketSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .trim(),
  phone: phoneSchema,
  email: emailSchema,
  eventId: z.string().cuid('Invalid event ID').optional(),
  ticketTypeId: z.string().cuid('Invalid ticket type ID').optional(),
  amount: z.number().min(0, 'Amount cannot be negative').optional(),
  status: z.enum(['PENDING', 'PAID']).optional().default('PAID'),
  notes: z.string().max(500).optional(),
});

/**
 * Bulk create tickets validation
 */
export const bulkCreateTicketSchema = z.object({
  tickets: z.array(createTicketSchema)
    .min(1, 'At least one ticket is required')
    .max(100, 'Maximum 100 tickets per batch'),
  eventId: z.string().cuid('Invalid event ID').optional(),
  ticketTypeId: z.string().cuid('Invalid ticket type ID').optional(),
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
  status: ticketStatusSchema.optional(),
  eventId: z.string().optional(),
  ticketTypeId: z.string().optional(),
  checkedIn: z.string().transform(val => val === 'true').optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  phone: z.string().optional(),
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
});

/**
 * Update ticket validation
 */
export const updateTicketSchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  phone: phoneSchema.optional(),
  email: emailSchema,
  eventId: z.string().cuid().optional().nullable(),
  ticketTypeId: z.string().cuid().optional().nullable(),
  status: z.enum(['PENDING', 'PAID', 'CANCELLED', 'REFUNDED']).optional(),
  notes: z.string().max(500).optional(),
});

// Type exports
export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type BulkCreateTicketInput = z.infer<typeof bulkCreateTicketSchema>;
export type VerifyTicketInput = z.infer<typeof verifyTicketSchema>;
export type LookupTicketInput = z.infer<typeof lookupTicketSchema>;
export type SearchTicketsInput = z.infer<typeof searchTicketsSchema>;
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>;
