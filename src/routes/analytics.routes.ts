import { Router } from 'express';
import * as analyticsController from '../controllers/analytics.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

// All analytics routes require authentication and staff+ role
router.use(requireAuth);
router.use(requireRole('STAFF', 'ADMIN', 'SUPER_ADMIN'));

// Dashboard statistics
router.get('/dashboard', analyticsController.getDashboardStats);

// Sales report
router.get('/sales', analyticsController.getSalesReport);

// Check-in statistics
router.get('/check-ins', analyticsController.getCheckInStats);

// Export ticket data
router.get('/export/tickets', analyticsController.exportTickets);

export default router;

