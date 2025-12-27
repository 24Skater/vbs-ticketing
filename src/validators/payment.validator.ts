import { z } from 'zod';
import { phoneSchema } from './ticket.validator.js';

/**
 * Mobile money channel validation
 */
export const mobileMoneyChannelSchema = z.enum([
  'mtn-gh',
  'vodafone-gh',
  'tigo-gh',
  'airtel-gh',
], {
  errorMap: () => ({ message: 'Invalid mobile money channel. Use: mtn-gh, vodafone-gh, tigo-gh, or airtel-gh' }),
});

/**
 * Initiate payment validation
 */
export const initiatePaymentSchema = z.object({
  amount: z.number()
    .positive('Amount must be positive')
    .min(1, 'Minimum amount is 1 GHS'),
  ticketId: z.string()
    .regex(/^VBS-[A-F0-9]{6}$/, 'Invalid ticket ID format')
    .optional(),
  description: z.string().max(200).optional(),
});

/**
 * Direct receive (USSD) payment validation
 */
export const directReceiveSchema = z.object({
  amount: z.number()
    .positive('Amount must be positive')
    .min(1, 'Minimum amount is 1 GHS'),
  channel: mobileMoneyChannelSchema,
  customerMsisdn: phoneSchema,
  customerName: z.string().max(100).optional(),
  description: z.string().max(200).optional(),
});

/**
 * Verify payment validation
 */
export const verifyPaymentSchema = z.object({
  reference: z.string().min(1, 'Payment reference is required'),
  phone: phoneSchema.optional(),
});

/**
 * Webhook payload validation (flexible to handle various Hubtel formats)
 */
export const webhookPayloadSchema = z.object({
  // These can come in various casings from Hubtel
  Status: z.string().optional(),
  status: z.string().optional(),
  Amount: z.number().optional(),
  amount: z.number().optional(),
  TransactionId: z.string().optional(),
  transactionId: z.string().optional(),
  ClientReference: z.string().optional(),
  clientReference: z.string().optional(),
  CustomerMsisdn: z.string().optional(),
  customerMsisdn: z.string().optional(),
  CustomerName: z.string().optional(),
  customerName: z.string().optional(),
  // Allow additional fields
}).passthrough();

/**
 * Resolve transaction validation
 */
export const resolveTransactionSchema = z.object({
  clientReference: z.string().min(1, 'Client reference is required'),
  phone: phoneSchema,
  name: z.string().max(100).optional(),
});

/**
 * Transaction status check validation
 */
export const transactionStatusSchema = z.object({
  clientReference: z.string().min(1, 'Client reference is required'),
});

// Type exports
export type InitiatePaymentInput = z.infer<typeof initiatePaymentSchema>;
export type DirectReceiveInput = z.infer<typeof directReceiveSchema>;
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;
export type WebhookPayload = z.infer<typeof webhookPayloadSchema>;
export type ResolveTransactionInput = z.infer<typeof resolveTransactionSchema>;
export type TransactionStatusInput = z.infer<typeof transactionStatusSchema>;

