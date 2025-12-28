/**
 * Audit Log Service
 * Track all actions performed in the system
 */

import { prisma } from '../utils/prisma.js';
import { logger } from '../utils/logger.js';
import type { PaginatedResult } from '../types/index.js';

export interface AuditLogEntry {
  id: string;
  action: string;
  message: string;
  userId: string | null;
  userName: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
}

export interface CreateAuditLogData {
  action: string;
  message: string;
  userId?: string;
  userName?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

export interface AuditLogFilters {
  action?: string;
  userId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  limit?: number;
}

/**
 * Create an audit log entry
 */
export async function createAuditLog(data: CreateAuditLogData): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        action: data.action,
        entity: data.action.split('.')[0] || 'system',
        entityId: null,
        details: {
          message: data.message,
          userName: data.userName,
          ...data.metadata,
        },
        userId: data.userId || null,
        ipAddress: data.ipAddress || null,
        userAgent: data.userAgent || null,
      },
    });
  } catch (error) {
    logger.error('Failed to create audit log', { error, data });
  }
}

/**
 * Log ticket actions
 */
export async function logTicketAction(
  action: 'create' | 'verify' | 'cancel' | 'update' | 'delete',
  ticketId: string,
  userId?: string,
  userName?: string,
  metadata?: Record<string, unknown>,
  ip?: string
): Promise<void> {
  const messages = {
    create: `Ticket ${ticketId} created`,
    verify: `Ticket ${ticketId} checked in`,
    cancel: `Ticket ${ticketId} cancelled`,
    update: `Ticket ${ticketId} updated`,
    delete: `Ticket ${ticketId} deleted`,
  };

  await createAuditLog({
    action: `ticket.${action}`,
    message: messages[action],
    userId,
    userName,
    metadata: { ticketId, ...metadata },
    ipAddress: ip,
  });
}

/**
 * Log payment actions
 */
export async function logPaymentAction(
  action: 'success' | 'failed' | 'refund',
  reference: string,
  amount: number,
  userId?: string,
  metadata?: Record<string, unknown>,
  ip?: string
): Promise<void> {
  const messages = {
    success: `Payment ${reference} successful (${amount / 100})`,
    failed: `Payment ${reference} failed`,
    refund: `Payment ${reference} refunded`,
  };

  await createAuditLog({
    action: `payment.${action}`,
    message: messages[action],
    userId,
    metadata: { reference, amount, ...metadata },
    ipAddress: ip,
  });
}

/**
 * Log user actions
 */
export async function logUserAction(
  action: 'login' | 'logout' | 'create' | 'update' | 'delete' | 'password_change',
  targetUserId: string,
  userId?: string,
  userName?: string,
  metadata?: Record<string, unknown>,
  ip?: string
): Promise<void> {
  const messages = {
    login: `User logged in`,
    logout: `User logged out`,
    create: `User ${targetUserId} created`,
    update: `User ${targetUserId} updated`,
    delete: `User ${targetUserId} deleted`,
    password_change: `Password changed`,
  };

  await createAuditLog({
    action: `user.${action}`,
    message: messages[action],
    userId,
    userName,
    metadata: { targetUserId, ...metadata },
    ipAddress: ip,
  });
}

/**
 * Log config changes
 */
export async function logConfigChange(
  section: string,
  changes: Record<string, unknown>,
  userId?: string,
  userName?: string,
  ip?: string
): Promise<void> {
  await createAuditLog({
    action: 'config.update',
    message: `Configuration updated: ${section}`,
    userId,
    userName,
    metadata: { section, changes },
    ipAddress: ip,
  });
}

/**
 * Log event actions
 */
export async function logEventAction(
  action: 'create' | 'update' | 'delete',
  eventId: string,
  eventName: string,
  userId?: string,
  userName?: string,
  ip?: string
): Promise<void> {
  const messages = {
    create: `Event "${eventName}" created`,
    update: `Event "${eventName}" updated`,
    delete: `Event "${eventName}" deleted`,
  };

  await createAuditLog({
    action: `event.${action}`,
    message: messages[action],
    userId,
    userName,
    metadata: { eventId, eventName },
    ipAddress: ip,
  });
}

/**
 * Log export actions
 */
export async function logExportAction(
  type: 'tickets' | 'payments' | 'reports',
  format: string,
  count: number,
  userId?: string,
  userName?: string,
  ip?: string
): Promise<void> {
  await createAuditLog({
    action: `export.${type}`,
    message: `Exported ${count} ${type} as ${format}`,
    userId,
    userName,
    metadata: { type, format, count },
    ipAddress: ip,
  });
}

/**
 * Get audit logs with filters
 */
export async function getAuditLogs(
  filters: AuditLogFilters
): Promise<PaginatedResult<AuditLogEntry>> {
  const { action, userId, dateFrom, dateTo, page = 1, limit = 50 } = filters;
  const skip = (page - 1) * limit;

  // Build where clause
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};

  if (action) {
    where.action = { startsWith: action };
  }

  if (userId) {
    where.userId = userId;
  }

  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = dateFrom;
    if (dateTo) where.createdAt.lte = dateTo;
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.auditLog.count({ where }),
  ]);

  // Fetch user names separately if needed
  const userIds = [...new Set(logs.filter(l => l.userId).map(l => l.userId as string))];
  const users = userIds.length > 0 
    ? await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true },
      })
    : [];
  const userMap = new Map(users.map(u => [u.id, u.name]));

  const totalPages = Math.ceil(total / limit);

  return {
    data: logs.map((log) => {
      const details = log.details as Record<string, unknown> | null;
      return {
        id: log.id,
        action: log.action,
        message: (details?.message as string) || '',
        userId: log.userId,
        userName: log.userId ? userMap.get(log.userId) || null : null,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        metadata: details,
        createdAt: log.createdAt,
      };
    }),
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

/**
 * Get recent activity for dashboard
 */
export async function getRecentActivity(limit = 10): Promise<AuditLogEntry[]> {
  const logs = await prisma.auditLog.findMany({
    take: limit,
    orderBy: { createdAt: 'desc' },
  });

  // Fetch user names
  const userIds = [...new Set(logs.filter(l => l.userId).map(l => l.userId as string))];
  const users = userIds.length > 0
    ? await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true },
      })
    : [];
  const userMap = new Map(users.map(u => [u.id, u.name]));

  return logs.map((log) => {
    const details = log.details as Record<string, unknown> | null;
    return {
      id: log.id,
      action: log.action,
      message: (details?.message as string) || '',
      userId: log.userId,
      userName: log.userId ? userMap.get(log.userId) || null : null,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      metadata: details,
      createdAt: log.createdAt,
    };
  });
}
