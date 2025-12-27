import { Request, Response } from 'express';
import * as ticketService from '../services/ticket.service.js';
import { generateTicketPDF } from '../services/pdf.service.js';
import { asyncHandler, Errors } from '../middleware/errorHandler.middleware.js';
import type { CreateTicketInput, SearchTicketsInput } from '../validators/ticket.validator.js';
import type { AuthenticatedRequest } from '../types/index.js';

/**
 * Create a new ticket
 * POST /api/tickets
 */
export const createTicket = asyncHandler(async (req: Request, res: Response) => {
  const data = req.body as CreateTicketInput;
  
  const result = await ticketService.createTicket({
    name: data.name,
    phone: data.phone,
    ticketType: data.ticketType,
    amount: data.amount,
    status: data.status,
  });

  if (!result.success) {
    throw Errors.badRequest(result.error);
  }

  res.status(201).json({
    success: true,
    data: result.data,
    message: 'Ticket created successfully',
  });
});

/**
 * Get ticket by ID
 * GET /api/tickets/:ticketId
 */
export const getTicket = asyncHandler(async (req: Request, res: Response) => {
  const { ticketId } = req.params;
  
  const ticket = await ticketService.getTicketById(ticketId);
  
  if (!ticket) {
    throw Errors.notFound('Ticket');
  }

  res.json({
    success: true,
    data: ticket,
  });
});

/**
 * Lookup ticket by phone and access code (public endpoint)
 * POST /api/tickets/lookup
 */
export const lookupTicket = asyncHandler(async (req: Request, res: Response) => {
  const { phone, accessCode } = req.body;
  
  const ticket = await ticketService.getTicketByPhoneAndCode(phone, accessCode);
  
  if (!ticket) {
    throw Errors.notFound('Ticket');
  }

  res.json({
    success: true,
    data: ticket,
  });
});

/**
 * Get tickets by phone number
 * GET /api/tickets/phone/:phone
 */
export const getTicketsByPhone = asyncHandler(async (req: Request, res: Response) => {
  const { phone } = req.params;
  
  const tickets = await ticketService.getTicketsByPhone(phone);

  res.json({
    success: true,
    data: tickets,
    count: tickets.length,
  });
});

/**
 * Search tickets with filters
 * GET /api/tickets
 */
export const searchTickets = asyncHandler(async (req: Request, res: Response) => {
  const options = req.query as unknown as SearchTicketsInput;
  
  const result = await ticketService.searchTickets({
    query: options.query,
    status: options.status,
    ticketType: options.ticketType,
    eventId: options.eventId,
    checkedIn: options.checkedIn,
    startDate: options.startDate ? new Date(options.startDate) : undefined,
    endDate: options.endDate ? new Date(options.endDate) : undefined,
    page: options.page,
    limit: options.limit,
  });

  res.json({
    success: true,
    ...result,
  });
});

/**
 * Verify/check-in a ticket
 * POST /api/tickets/:ticketId/verify
 */
export const verifyTicket = asyncHandler(async (req: Request, res: Response) => {
  const { ticketId } = req.params;
  const verifiedBy = req.userId || 'system';
  
  const result = await ticketService.verifyTicket(ticketId, verifiedBy);

  if (!result.success) {
    // Return 200 with error details for already-used tickets
    if (result.alreadyUsed) {
      res.status(200).json({
        success: false,
        alreadyUsed: true,
        message: result.message,
        verifiedAt: result.verifiedAt,
        ticket: result.ticket,
      });
      return;
    }
    
    throw Errors.badRequest(result.message);
  }

  res.json({
    success: true,
    message: result.message,
    data: result.ticket,
    verifiedAt: result.verifiedAt,
  });
});

/**
 * Update ticket status
 * PATCH /api/tickets/:ticketId/status
 */
export const updateStatus = asyncHandler(async (req: Request, res: Response) => {
  const { ticketId } = req.params;
  const { status } = req.body;
  
  const result = await ticketService.updateTicketStatus(ticketId, status);

  if (!result.success) {
    throw Errors.notFound('Ticket');
  }

  res.json({
    success: true,
    data: result.data,
    message: `Ticket status updated to ${status}`,
  });
});

/**
 * Delete (cancel) a ticket
 * DELETE /api/tickets/:ticketId
 */
export const deleteTicket = asyncHandler(async (req: Request, res: Response) => {
  const { ticketId } = req.params;
  
  const result = await ticketService.deleteTicket(ticketId);

  if (!result.success) {
    throw Errors.notFound('Ticket');
  }

  res.json({
    success: true,
    message: 'Ticket cancelled successfully',
  });
});

/**
 * Bulk create tickets
 * POST /api/tickets/bulk
 */
export const bulkCreate = asyncHandler(async (req: Request, res: Response) => {
  const { tickets } = req.body;
  
  const result = await ticketService.bulkCreateTickets(tickets);

  if (!result.success) {
    throw Errors.internal('Bulk creation failed');
  }

  res.status(201).json({
    success: true,
    data: result.data,
    message: `Created ${result.data.created} tickets, ${result.data.failed} failed`,
  });
});

/**
 * Get dashboard statistics
 * GET /api/tickets/stats
 */
export const getStats = asyncHandler(async (_req: Request, res: Response) => {
  const stats = await ticketService.getStats();

  res.json({
    success: true,
    data: stats,
  });
});

/**
 * Download ticket as PDF
 * GET /api/tickets/:ticketId/pdf
 */
export const downloadPDF = asyncHandler(async (req: Request, res: Response) => {
  const { ticketId } = req.params;
  
  const ticket = await ticketService.getTicketById(ticketId);
  
  if (!ticket) {
    throw Errors.notFound('Ticket');
  }

  const pdfBuffer = await generateTicketPDF(ticket);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="ticket-${ticket.ticketId}.pdf"`);
  res.setHeader('Content-Length', pdfBuffer.length);
  
  res.send(pdfBuffer);
});

/**
 * Bulk verify/check-in tickets
 * POST /api/tickets/bulk/verify
 */
export const bulkVerify = asyncHandler(async (req: Request, res: Response) => {
  const { ticketIds } = req.body;
  const authReq = req as AuthenticatedRequest;

  if (!Array.isArray(ticketIds) || ticketIds.length === 0) {
    throw Errors.badRequest('ticketIds must be a non-empty array');
  }

  const result = await ticketService.bulkVerifyTickets(ticketIds, authReq.userId);

  res.json({
    success: true,
    data: result,
    message: `Verified ${result.success} tickets, ${result.failed} failed, ${result.alreadyUsed} already used`,
  });
});

/**
 * Bulk cancel tickets
 * POST /api/tickets/bulk/cancel
 */
export const bulkCancel = asyncHandler(async (req: Request, res: Response) => {
  const { ticketIds } = req.body;

  if (!Array.isArray(ticketIds) || ticketIds.length === 0) {
    throw Errors.badRequest('ticketIds must be a non-empty array');
  }

  const result = await ticketService.bulkCancelTickets(ticketIds);

  res.json({
    success: true,
    data: result,
    message: `Cancelled ${result.success} tickets, ${result.failed} failed`,
  });
});

/**
 * Bulk update ticket status
 * POST /api/tickets/bulk/status
 */
export const bulkUpdateStatus = asyncHandler(async (req: Request, res: Response) => {
  const { ticketIds, status } = req.body;

  if (!Array.isArray(ticketIds) || ticketIds.length === 0) {
    throw Errors.badRequest('ticketIds must be a non-empty array');
  }

  if (!status) {
    throw Errors.badRequest('status is required');
  }

  const result = await ticketService.bulkUpdateStatus(ticketIds, status);

  res.json({
    success: true,
    data: result,
    message: `Updated ${result.success} tickets to ${status}`,
  });
});

/**
 * Preview bulk operation
 * POST /api/tickets/bulk/preview
 */
export const bulkPreview = asyncHandler(async (req: Request, res: Response) => {
  const { ticketIds } = req.body;

  if (!Array.isArray(ticketIds) || ticketIds.length === 0) {
    throw Errors.badRequest('ticketIds must be a non-empty array');
  }

  const tickets = await ticketService.getTicketsByIds(ticketIds);

  res.json({
    success: true,
    data: {
      found: tickets.length,
      notFound: ticketIds.length - tickets.length,
      tickets,
    },
  });
});
