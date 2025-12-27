import { Router } from 'express';
import * as paymentController from '../controllers/payment.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { lookupLimiter } from '../middleware/rateLimit.middleware.js';
import { directReceiveSchema, verifyPaymentSchema } from '../validators/payment.validator.js';

const router = Router();

/**
 * Public Routes (with rate limiting)
 */

// Initiate payment (USSD prompt)
router.post(
  '/initiate',
  lookupLimiter,
  validate(directReceiveSchema),
  paymentController.initiatePayment
);

// Check payment status
router.get(
  '/status/:reference',
  lookupLimiter,
  paymentController.checkStatus
);

// Verify payment and create ticket
router.post(
  '/verify',
  lookupLimiter,
  validate(verifyPaymentSchema),
  paymentController.verifyPayment
);

/**
 * Authenticated Routes
 */

// Get payment history for a phone (staff+)
router.get(
  '/history/:phone',
  requireAuth,
  paymentController.getPaymentHistory
);

export default router;

