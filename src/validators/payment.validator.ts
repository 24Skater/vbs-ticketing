import { z } from 'zod';
import { phoneSchema } from './ticket.validator.js';

/**
 * Currency code validation (ISO 4217)
 */
export const currencyCodeSchema = z.string()
  .toUpperCase()
  .length(3, 'Currency code must be 3 characters (e.g., USD, EUR, GBP)')
  .regex(/^[A-Z]{3}$/, 'Invalid currency code format');

/**
 * Payment provider validation
 */
export const paymentProviderSchema = z.enum([
  'STRIPE',
  'PAYPAL',
  'HUBTEL',
  'SQUARE',
  'PAYSTACK',
  'FLUTTERWAVE',
  'MANUAL',
  'COMPLIMENTARY',
]);

/**
 * Mobile money channel validation (for providers that support it)
 * These are provider-specific channel codes
 */
export const mobileMoneyChannelSchema = z.string()
  .min(1, 'Channel is required')
  .max(50, 'Invalid channel');

/**
 * Ghana mobile money channels (for Hubtel)
 * @deprecated Use generic mobileMoneyChannelSchema for new code
 */
export const hubtelChannelSchema = z.enum([
  'mtn-gh',
  'vodafone-gh',
  'tigo-gh',
  'airtel-gh',
], {
  errorMap: () => ({ message: 'Invalid mobile money channel' }),
});

/**
 * Initiate payment validation
 */
export const initiatePaymentSchema = z.object({
  amount: z.number()
    .positive('Amount must be positive')
    .min(1, 'Amount must be at least 1 (in smallest currency unit)'),
  currency: currencyCodeSchema.optional().default('USD'),
  ticketId: z.string().optional(),
  provider: paymentProviderSchema.optional(),
  description: z.string().max(200).optional(),
  returnUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Direct receive (mobile money/USSD) payment validation
 */
export const directReceiveSchema = z.object({
  amount: z.number()
    .positive('Amount must be positive')
    .min(1, 'Amount must be at least 1 (in smallest currency unit)'),
  currency: currencyCodeSchema.optional().default('USD'),
  channel: mobileMoneyChannelSchema,
  customerMsisdn: phoneSchema,
  customerName: z.string().max(100).optional(),
  description: z.string().max(200).optional(),
});

/**
 * Manual payment validation (cash, bank transfer, etc.)
 */
export const manualPaymentSchema = z.object({
  amount: z.number()
    .positive('Amount must be positive')
    .min(1, 'Amount must be at least 1 (in smallest currency unit)'),
  currency: currencyCodeSchema.optional().default('USD'),
  ticketId: z.string(),
  method: z.enum(['cash', 'bank_transfer', 'check', 'other']).optional().default('cash'),
  reference: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
});

/**
 * Verify payment validation
 */
export const verifyPaymentSchema = z.object({
  reference: z.string().min(1, 'Payment reference is required'),
  phone: phoneSchema.optional(),
});

/**
 * Generic webhook payload validation
 * Flexible to handle various payment providers
 */
export const webhookPayloadSchema = z.object({
  // Common fields across providers
  status: z.string().optional(),
  amount: z.number().optional(),
  currency: z.string().optional(),
  reference: z.string().optional(),
  transactionId: z.string().optional(),
  
  // Provider-specific fields (Hubtel uses PascalCase)
  Status: z.string().optional(),
  Amount: z.number().optional(),
  TransactionId: z.string().optional(),
  ClientReference: z.string().optional(),
  clientReference: z.string().optional(),
  CustomerMsisdn: z.string().optional(),
  customerMsisdn: z.string().optional(),
  CustomerName: z.string().optional(),
  customerName: z.string().optional(),
  
  // Allow additional fields from any provider
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
  reference: z.string().min(1, 'Transaction reference is required'),
  provider: paymentProviderSchema.optional(),
});

/**
 * Refund validation
 */
export const refundPaymentSchema = z.object({
  paymentId: z.string().min(1, 'Payment ID is required'),
  amount: z.number().positive().optional(), // Optional for full refund
  reason: z.string().max(500).optional(),
});

// Type exports
export type InitiatePaymentInput = z.infer<typeof initiatePaymentSchema>;
export type DirectReceiveInput = z.infer<typeof directReceiveSchema>;
export type ManualPaymentInput = z.infer<typeof manualPaymentSchema>;
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;
export type WebhookPayload = z.infer<typeof webhookPayloadSchema>;
export type ResolveTransactionInput = z.infer<typeof resolveTransactionSchema>;
export type TransactionStatusInput = z.infer<typeof transactionStatusSchema>;
export type RefundPaymentInput = z.infer<typeof refundPaymentSchema>;
