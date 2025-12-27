import { Router } from 'express';
import ticketRoutes from './ticket.routes.js';
import authRoutes from './auth.routes.js';

const router = Router();

// Mount routes
router.use('/tickets', ticketRoutes);
router.use('/auth', authRoutes);

// Health check
router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

export default router;
