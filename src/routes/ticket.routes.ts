import { Router } from 'express';
import * as ticketController from '../controllers/ticket.controller.js';
import { requireAuth, requireRole, optionalAuth } from '../middleware/auth.middleware.js';
import { validate, validateQuery } from '../middleware/validate.middleware.js';
import { lookupLimiter, createTicketLimiter } from '../middleware/rateLimit.middleware.js';
import {
  createTicketSchema,
  lookupTicketSchema,
  searchTicketsSchema,
  verifyTicketSchema,
  bulkCreateTicketSchema,
} from '../validators/ticket.validator.js';
import { z } from 'zod';

const router = Router();

/**
 * Public Routes (rate limited)
 */

// Lookup ticket by phone + access code (public)
router.post(
  '/lookup',
  lookupLimiter,
  validate(lookupTicketSchema),
  ticketController.lookupTicket
);

// Get tickets by phone number (public, but limited)
router.get(
  '/phone/:phone',
  lookupLimiter,
  ticketController.getTicketsByPhone
);

/**
 * Authenticated Routes
 */

// Get all tickets with search/filter
router.get(
  '/',
  requireAuth,
  requireRole('STAFF', 'ADMIN', 'SUPER_ADMIN'),
  validateQuery(searchTicketsSchema),
  ticketController.searchTickets
);

// Get dashboard stats
router.get(
  '/stats',
  requireAuth,
  requireRole('STAFF', 'ADMIN', 'SUPER_ADMIN'),
  ticketController.getStats
);

// Create single ticket
router.post(
  '/',
  requireAuth,
  requireRole('STAFF', 'ADMIN', 'SUPER_ADMIN'),
  createTicketLimiter,
  validate(createTicketSchema),
  ticketController.createTicket
);

// Bulk create tickets
router.post(
  '/bulk',
  requireAuth,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  validate(bulkCreateTicketSchema),
  ticketController.bulkCreate
);

// Get single ticket by ID
router.get(
  '/:ticketId',
  optionalAuth,
  ticketController.getTicket
);

// Verify/check-in ticket
router.post(
  '/:ticketId/verify',
  requireAuth,
  requireRole('CHECKER', 'STAFF', 'ADMIN', 'SUPER_ADMIN'),
  validate(verifyTicketSchema, 'params'),
  ticketController.verifyTicket
);

// Update ticket status
router.patch(
  '/:ticketId/status',
  requireAuth,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  validate(
    z.object({
      status: z.enum(['PENDING', 'PAID', 'CANCELLED', 'REFUNDED']),
    })
  ),
  ticketController.updateStatus
);

// Delete (cancel) ticket
router.delete(
  '/:ticketId',
  requireAuth,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  ticketController.deleteTicket
);

export default router;
