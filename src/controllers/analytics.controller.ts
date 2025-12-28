import { Request, Response } from 'express';
import * as analyticsService from '../services/analytics.service.js';
import { getSiteConfig } from '../services/config.service.js';
import { asyncHandler } from '../middleware/errorHandler.middleware.js';

/**
 * Get dashboard statistics
 * GET /api/analytics/dashboard
 */
export const getDashboardStats = asyncHandler(async (_req: Request, res: Response) => {
  const stats = await analyticsService.getDashboardStats();

  res.json({
    success: true,
    data: stats,
  });
});

/**
 * Get sales report
 * GET /api/analytics/sales
 */
export const getSalesReport = asyncHandler(async (req: Request, res: Response) => {
  const { startDate, endDate, eventId, groupBy } = req.query;

  const report = await analyticsService.getSalesReport({
    startDate: startDate ? new Date(startDate as string) : undefined,
    endDate: endDate ? new Date(endDate as string) : undefined,
    eventId: eventId as string,
    groupBy: groupBy as 'day' | 'week' | 'month',
  });

  res.json({
    success: true,
    data: report,
  });
});

/**
 * Get check-in statistics
 * GET /api/analytics/check-ins
 */
export const getCheckInStats = asyncHandler(async (req: Request, res: Response) => {
  const { eventId } = req.query;

  const stats = await analyticsService.getCheckInStats(eventId as string);

  res.json({
    success: true,
    data: stats,
  });
});

/**
 * Export ticket data
 * GET /api/analytics/export/tickets
 */
export const exportTickets = asyncHandler(async (req: Request, res: Response) => {
  const { eventId, status, startDate, endDate, format } = req.query;

  const data = await analyticsService.exportTicketData({
    eventId: eventId as string,
    status: status as any,
    startDate: startDate ? new Date(startDate as string) : undefined,
    endDate: endDate ? new Date(endDate as string) : undefined,
  });

  // Return as JSON or CSV based on format
  if (format === 'csv') {
    const config = await getSiteConfig();
    const currencyCode = config.currency || 'USD';
    
    const headers = [
      'Ticket ID',
      'Name',
      'Phone',
      'Email',
      'Type',
      'Status',
      `Amount (${currencyCode})`,
      'Event',
      'Event Date',
      'Created',
      'Verified',
    ];

    const rows = data.map((t) => [
      t.ticketId,
      t.name,
      t.phone,
      t.email || '',
      t.ticketType,
      t.status,
      (t.amount / 100).toFixed(2),
      t.eventName,
      t.eventDate.toISOString().split('T')[0],
      t.createdAt.toISOString(),
      t.verifiedAt?.toISOString() || '',
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="tickets-export.csv"');
    res.send(csv);
  } else {
    res.json({
      success: true,
      data,
      count: data.length,
    });
  }
});

