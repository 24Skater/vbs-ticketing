import { prisma } from '../utils/prisma.js';
import type { TicketStatus } from '@prisma/client';

/**
 * Dashboard statistics
 */
export interface DashboardStats {
  tickets: {
    total: number;
    paid: number;
    used: number;
    pending: number;
    cancelled: number;
  };
  revenue: {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  events: {
    total: number;
    active: number;
    upcoming: number;
  };
  recentActivity: Array<{
    type: 'ticket' | 'payment';
    action: string;
    details: string;
    timestamp: Date;
  }>;
}

/**
 * Get dashboard statistics
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfDay);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Ticket counts by status
  const ticketCounts = await prisma.ticket.groupBy({
    by: ['status'],
    _count: true,
  });

  const ticketsByStatus = Object.fromEntries(
    ticketCounts.map((t) => [t.status, t._count])
  ) as Record<TicketStatus, number>;

  // Revenue calculations
  const [totalRevenue, todayRevenue, weekRevenue, monthRevenue] = await Promise.all([
    prisma.payment.aggregate({
      where: { status: 'SUCCESS' },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: { status: 'SUCCESS', paidAt: { gte: startOfDay } },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: { status: 'SUCCESS', paidAt: { gte: startOfWeek } },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: { status: 'SUCCESS', paidAt: { gte: startOfMonth } },
      _sum: { amount: true },
    }),
  ]);

  // Event counts
  const [totalEvents, activeEvents, upcomingEvents] = await Promise.all([
    prisma.event.count(),
    prisma.event.count({ where: { isActive: true } }),
    prisma.event.count({ where: { isActive: true, eventDate: { gte: now } } }),
  ]);

  // Recent activity
  const [recentTickets, recentPayments] = await Promise.all([
    prisma.ticket.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        ticketId: true,
        name: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.payment.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      where: { status: 'SUCCESS' },
      select: {
        reference: true,
        amount: true,
        customerName: true,
        paidAt: true,
      },
    }),
  ]);

  const recentActivity = [
    ...recentTickets.map((t) => ({
      type: 'ticket' as const,
      action: t.status === 'PAID' ? 'created' : t.status.toLowerCase(),
      details: `${t.name} - ${t.ticketId}`,
      timestamp: t.createdAt,
    })),
    ...recentPayments.map((p) => ({
      type: 'payment' as const,
      action: 'received',
      details: `GHS ${(p.amount / 100).toFixed(2)} from ${p.customerName || 'Customer'}`,
      timestamp: p.paidAt || new Date(),
    })),
  ]
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 10);

  return {
    tickets: {
      total: Object.values(ticketsByStatus).reduce((a, b) => a + b, 0),
      paid: ticketsByStatus.PAID || 0,
      used: ticketsByStatus.USED || 0,
      pending: ticketsByStatus.PENDING || 0,
      cancelled: (ticketsByStatus.CANCELLED || 0) + (ticketsByStatus.REFUNDED || 0),
    },
    revenue: {
      total: totalRevenue._sum.amount || 0,
      today: todayRevenue._sum.amount || 0,
      thisWeek: weekRevenue._sum.amount || 0,
      thisMonth: monthRevenue._sum.amount || 0,
    },
    events: {
      total: totalEvents,
      active: activeEvents,
      upcoming: upcomingEvents,
    },
    recentActivity,
  };
}

/**
 * Get sales report
 */
export async function getSalesReport(options: {
  startDate?: Date;
  endDate?: Date;
  eventId?: string;
  groupBy?: 'day' | 'week' | 'month';
}): Promise<{
  summary: {
    totalSales: number;
    totalRevenue: number;
    averageTicketPrice: number;
  };
  byDate: Array<{
    date: string;
    count: number;
    revenue: number;
  }>;
  byPaymentMethod: Array<{
    method: string;
    count: number;
    revenue: number;
  }>;
}> {
  const { startDate, endDate, eventId } = options;

  const where: any = { status: 'SUCCESS' };
  if (startDate) where.paidAt = { gte: startDate };
  if (endDate) where.paidAt = { ...where.paidAt, lte: endDate };
  if (eventId) where.ticket = { eventId };

  const payments = await prisma.payment.findMany({
    where,
    select: {
      amount: true,
      channel: true,
      paidAt: true,
    },
  });

  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalSales = payments.length;

  // Group by date
  const byDateMap = new Map<string, { count: number; revenue: number }>();
  payments.forEach((p) => {
    if (p.paidAt) {
      const dateKey = p.paidAt.toISOString().split('T')[0];
      const existing = byDateMap.get(dateKey) || { count: 0, revenue: 0 };
      byDateMap.set(dateKey, {
        count: existing.count + 1,
        revenue: existing.revenue + p.amount,
      });
    }
  });

  // Group by payment method
  const byMethodMap = new Map<string, { count: number; revenue: number }>();
  payments.forEach((p) => {
    const method = p.channel || 'unknown';
    const existing = byMethodMap.get(method) || { count: 0, revenue: 0 };
    byMethodMap.set(method, {
      count: existing.count + 1,
      revenue: existing.revenue + p.amount,
    });
  });

  return {
    summary: {
      totalSales,
      totalRevenue,
      averageTicketPrice: totalSales > 0 ? Math.round(totalRevenue / totalSales) : 0,
    },
    byDate: Array.from(byDateMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date)),
    byPaymentMethod: Array.from(byMethodMap.entries())
      .map(([method, data]) => ({ method, ...data }))
      .sort((a, b) => b.revenue - a.revenue),
  };
}

/**
 * Get check-in statistics
 */
export async function getCheckInStats(eventId?: string): Promise<{
  total: number;
  checkedIn: number;
  pending: number;
  percentage: number;
  byHour: Array<{ hour: string; count: number }>;
}> {
  const where: any = { status: { in: ['PAID', 'USED'] } };
  if (eventId) where.eventId = eventId;

  const [tickets, usedTickets] = await Promise.all([
    prisma.ticket.count({ where }),
    prisma.ticket.findMany({
      where: { ...where, status: 'USED', verifiedAt: { not: null } },
      select: { verifiedAt: true },
    }),
  ]);

  // Group by hour
  const byHourMap = new Map<string, number>();
  usedTickets.forEach((t) => {
    if (t.verifiedAt) {
      const hour = t.verifiedAt.getHours().toString().padStart(2, '0') + ':00';
      byHourMap.set(hour, (byHourMap.get(hour) || 0) + 1);
    }
  });

  return {
    total: tickets,
    checkedIn: usedTickets.length,
    pending: tickets - usedTickets.length,
    percentage: tickets > 0 ? Math.round((usedTickets.length / tickets) * 100) : 0,
    byHour: Array.from(byHourMap.entries())
      .map(([hour, count]) => ({ hour, count }))
      .sort((a, b) => a.hour.localeCompare(b.hour)),
  };
}

/**
 * Export ticket data for reporting
 */
export async function exportTicketData(options: {
  eventId?: string;
  status?: TicketStatus;
  startDate?: Date;
  endDate?: Date;
}): Promise<Array<{
  ticketId: string;
  name: string;
  phone: string;
  email: string | null;
  ticketType: string;
  status: string;
  amount: number;
  eventName: string;
  eventDate: Date;
  createdAt: Date;
  verifiedAt: Date | null;
}>> {
  const { eventId, status, startDate, endDate } = options;

  const where: any = {};
  if (eventId) where.eventId = eventId;
  if (status) where.status = status;
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = startDate;
    if (endDate) where.createdAt.lte = endDate;
  }

  const tickets = await prisma.ticket.findMany({
    where,
    include: {
      event: { select: { name: true, eventDate: true } },
      ticketType: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return tickets.map((t) => ({
    ticketId: t.ticketId,
    name: t.name,
    phone: t.phone,
    email: t.email,
    ticketType: t.ticketType?.name || 'Standard',
    status: t.status,
    amount: t.amount,
    eventName: t.event?.name || 'VBS 2025',
    eventDate: t.event?.eventDate || new Date(),
    createdAt: t.createdAt,
    verifiedAt: t.verifiedAt,
  }));
}

