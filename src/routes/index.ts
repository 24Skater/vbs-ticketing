import { Router } from 'express';
import ticketRoutes from './ticket.routes.js';
import authRoutes from './auth.routes.js';
import eventRoutes from './event.routes.js';
import analyticsRoutes from './analytics.routes.js';
import paymentRoutes from './payment.routes.js';
import webhookRoutes from './webhook.routes.js';

const router = Router();

// Mount routes
router.use('/tickets', ticketRoutes);
router.use('/auth', authRoutes);
router.use('/events', eventRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/payments', paymentRoutes);
router.use('/webhooks', webhookRoutes);

// Health check
router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '2.0.0',
  });
});

export default router;
