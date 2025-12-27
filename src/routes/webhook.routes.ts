import { Router } from 'express';
import * as webhookController from '../controllers/webhook.controller.js';
import { webhookLimiter } from '../middleware/rateLimit.middleware.js';

const router = Router();

/**
 * Webhook Routes
 * These are called by external services (Hubtel)
 */

// Webhook status/health check
router.get('/status', webhookController.webhookStatus);

// Hubtel payment callback
router.post(
  '/hubtel',
  webhookLimiter,
  webhookController.handleHubtelWebhook
);

// Test webhook (development only)
router.post(
  '/test',
  webhookController.testWebhook
);

export default router;

