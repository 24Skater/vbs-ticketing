import { Request, Response } from 'express';
import * as eventService from '../services/event.service.js';
import { asyncHandler, Errors } from '../middleware/errorHandler.middleware.js';

/**
 * Create a new event
 * POST /api/events
 */
export const createEvent = asyncHandler(async (req: Request, res: Response) => {
  const { name, slug, description, venue, eventDate, eventTime, endDate, imageUrl } = req.body;

  const result = await eventService.createEvent({
    name,
    slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
    description,
    venue,
    eventDate: new Date(eventDate),
    eventTime,
    endDate: endDate ? new Date(endDate) : undefined,
    imageUrl,
  });

  if (!result.success) {
    throw Errors.badRequest(result.error);
  }

  res.status(201).json({
    success: true,
    data: result.data,
    message: 'Event created successfully',
  });
});

/**
 * Get all events
 * GET /api/events
 */
export const listEvents = asyncHandler(async (req: Request, res: Response) => {
  const { activeOnly, upcoming, page, limit } = req.query;

  const result = await eventService.listEvents({
    activeOnly: activeOnly !== 'false',
    upcoming: upcoming === 'true',
    page: page ? parseInt(page as string) : 1,
    limit: limit ? parseInt(limit as string) : 20,
  });

  res.json({
    success: true,
    data: result.events,
    total: result.total,
  });
});

/**
 * Get event by ID or slug
 * GET /api/events/:idOrSlug
 */
export const getEvent = asyncHandler(async (req: Request, res: Response) => {
  const { idOrSlug } = req.params;

  const event = await eventService.getEvent(idOrSlug);

  if (!event) {
    throw Errors.notFound('Event');
  }

  res.json({
    success: true,
    data: event,
  });
});

/**
 * Update an event
 * PATCH /api/events/:id
 */
export const updateEvent = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;

  // Convert date strings to Date objects
  if (updates.eventDate) {
    updates.eventDate = new Date(updates.eventDate);
  }
  if (updates.endDate) {
    updates.endDate = new Date(updates.endDate);
  }

  const result = await eventService.updateEvent(id, updates);

  if (!result.success) {
    throw Errors.badRequest(result.error);
  }

  res.json({
    success: true,
    data: result.data,
    message: 'Event updated successfully',
  });
});

/**
 * Delete (deactivate) an event
 * DELETE /api/events/:id
 */
export const deleteEvent = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await eventService.deleteEvent(id);

  if (!result.success) {
    throw Errors.notFound('Event');
  }

  res.json({
    success: true,
    message: 'Event deleted successfully',
  });
});

/**
 * Get event statistics
 * GET /api/events/:id/stats
 */
export const getEventStats = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const stats = await eventService.getEventStats(id);

  res.json({
    success: true,
    data: stats,
  });
});

/**
 * Create a ticket type for an event
 * POST /api/events/:eventId/ticket-types
 */
export const createTicketType = asyncHandler(async (req: Request, res: Response) => {
  const { eventId } = req.params;
  const { name, price, quantity, description, sortOrder } = req.body;

  const result = await eventService.createTicketType({
    eventId,
    name,
    price,
    quantity,
    description,
    sortOrder,
  });

  if (!result.success) {
    throw Errors.badRequest(result.error);
  }

  res.status(201).json({
    success: true,
    data: result.data,
    message: 'Ticket type created successfully',
  });
});

/**
 * Update a ticket type
 * PATCH /api/events/:eventId/ticket-types/:id
 */
export const updateTicketType = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;

  const result = await eventService.updateTicketType(id, updates);

  if (!result.success) {
    throw Errors.badRequest(result.error);
  }

  res.json({
    success: true,
    data: result.data,
    message: 'Ticket type updated successfully',
  });
});

