/**
 * Audit Log Routes
 */

import { Router, Request, Response } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../middleware/errorHandler.middleware.js';
import * as auditLogService from '../services/auditLog.service.js';

const router = Router();

/**
 * GET /api/audit-logs
 * Get audit logs (admin only)
 */
router.get(
  '/',
  requireAuth,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  asyncHandler(async (req: Request, res: Response) => {
    const { action, userId, dateFrom, dateTo, page, limit } = req.query;

    const result = await auditLogService.getAuditLogs({
      action: action as string,
      userId: userId as string,
      dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
      dateTo: dateTo ? new Date(dateTo as string) : undefined,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 50,
    });

    res.json({
      success: true,
      ...result,
    });
  })
);

/**
 * GET /api/audit-logs/activity
 * Get recent activity for dashboard
 */
router.get(
  '/activity',
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const activity = await auditLogService.getRecentActivity(limit);

    res.json({
      success: true,
      data: activity,
    });
  })
);

export default router;

