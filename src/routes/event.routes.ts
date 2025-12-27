import { Router } from 'express';
import * as eventController from '../controllers/event.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

/**
 * Public Routes
 */

// List events (public)
router.get('/', eventController.listEvents);

// Get event by ID or slug (public)
router.get('/:idOrSlug', eventController.getEvent);

/**
 * Admin Routes
 */

// Create event (admin only)
router.post(
  '/',
  requireAuth,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  eventController.createEvent
);

// Update event (admin only)
router.patch(
  '/:id',
  requireAuth,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  eventController.updateEvent
);

// Delete event (admin only)
router.delete(
  '/:id',
  requireAuth,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  eventController.deleteEvent
);

// Get event statistics (staff+)
router.get(
  '/:id/stats',
  requireAuth,
  requireRole('STAFF', 'ADMIN', 'SUPER_ADMIN'),
  eventController.getEventStats
);

// Create ticket type (admin only)
router.post(
  '/:eventId/ticket-types',
  requireAuth,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  eventController.createTicketType
);

// Update ticket type (admin only)
router.patch(
  '/:eventId/ticket-types/:id',
  requireAuth,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  eventController.updateTicketType
);

export default router;

