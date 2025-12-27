import { prisma } from '../utils/prisma.js';
import { generateUniqueTicketId, generateUniqueAccessCode } from '../utils/generators.js';
import { normalizePhone } from '../utils/phone.js';
import { logger } from '../utils/logger.js';
import type {
  CreateTicketData,
  TicketData,
  TicketSearchOptions,
  PaginatedResult,
  VerifyTicketResult,
  TicketStatus,
  ServiceResult,
} from '../types/index.js';

/**
 * Convert Prisma Payment to TicketData
 */
function toTicketData(payment: {
  id: number;
  ticketId: string;
  accessCode: string | null;
  name: string;
  phone: string;
  ticketType: string;
  status: string;
  amount: number;
  eventDate: string;
  eventTime: string;
  used: boolean;
  verifiedAt: Date | null;
  verifiedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}): TicketData {
  return {
    id: payment.id.toString(),
    ticketId: payment.ticketId,
    accessCode: payment.accessCode || '',
    name: payment.name,
    phone: payment.phone,
    ticketType: payment.ticketType as TicketData['ticketType'],
    status: payment.status as TicketStatus,
    amount: payment.amount,
    eventDate: payment.eventDate,
    eventTime: payment.eventTime,
    used: payment.used,
    verifiedAt: payment.verifiedAt,
    verifiedBy: payment.verifiedBy,
    createdAt: payment.createdAt,
    updatedAt: payment.updatedAt,
  };
}

/**
 * Create a new ticket
 */
export async function createTicket(data: CreateTicketData): Promise<ServiceResult<TicketData>> {
  try {
    const normalizedPhone = normalizePhone(data.phone);
    if (!normalizedPhone) {
      return { success: false, error: 'Invalid phone number', code: 'INVALID_PHONE' };
    }

    // Generate unique IDs
    const ticketId = await generateUniqueTicketId(async (id) => {
      const existing = await prisma.payment.findUnique({ where: { ticketId: id } });
      return !!existing;
    });

    const accessCode = await generateUniqueAccessCode(async (code) => {
      const existing = await prisma.payment.findUnique({ where: { accessCode: code } });
      return !!existing;
    });

    const payment = await prisma.payment.create({
      data: {
        name: data.name,
        phone: normalizedPhone,
        ticketId,
        accessCode,
        ticketType: data.ticketType || 'Regular',
        amount: data.amount || 0,
        status: data.status || 'Paid',
        eventDate: 'Dec 27, 2025', // TODO: Make dynamic
        eventTime: '09:00 AM',
      },
    });

    logger.info('Ticket created', { ticketId, phone: normalizedPhone });
    return { success: true, data: toTicketData(payment) };
  } catch (error) {
    logger.error('Failed to create ticket', { error, data });
    return { success: false, error: 'Failed to create ticket', code: 'CREATE_FAILED' };
  }
}

/**
 * Get ticket by ID
 */
export async function getTicketById(ticketId: string): Promise<TicketData | null> {
  const payment = await prisma.payment.findUnique({
    where: { ticketId: ticketId.toUpperCase() },
  });
  
  return payment ? toTicketData(payment) : null;
}

/**
 * Get ticket by phone and access code
 */
export async function getTicketByPhoneAndCode(
  phone: string,
  accessCode: string
): Promise<TicketData | null> {
  const normalizedPhone = normalizePhone(phone);
  if (!normalizedPhone) return null;

  const payment = await prisma.payment.findFirst({
    where: {
      phone: normalizedPhone,
      accessCode: accessCode.toUpperCase(),
    },
  });

  return payment ? toTicketData(payment) : null;
}

/**
 * Get all tickets for a phone number
 */
export async function getTicketsByPhone(phone: string): Promise<TicketData[]> {
  const normalizedPhone = normalizePhone(phone);
  if (!normalizedPhone) return [];

  const payments = await prisma.payment.findMany({
    where: { phone: normalizedPhone },
    orderBy: { createdAt: 'desc' },
  });

  return payments.map(toTicketData);
}

/**
 * Search tickets with pagination
 */
export async function searchTickets(
  options: TicketSearchOptions
): Promise<PaginatedResult<TicketData>> {
  const {
    query,
    status,
    ticketType,
    checkedIn,
    startDate,
    endDate,
    page = 1,
    limit = 50,
  } = options;

  const skip = (page - 1) * limit;

  // Build where clause
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};

  if (query) {
    where.OR = [
      { name: { contains: query, mode: 'insensitive' } },
      { phone: { contains: query } },
      { ticketId: { contains: query.toUpperCase() } },
    ];
  }

  if (status) {
    where.status = status;
  }

  if (ticketType) {
    where.ticketType = ticketType;
  }

  if (checkedIn !== undefined) {
    where.used = checkedIn;
  }

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = startDate;
    if (endDate) where.createdAt.lte = endDate;
  }

  // Execute query
  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.payment.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    data: payments.map(toTicketData),
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
 * Verify/check-in a ticket
 */
export async function verifyTicket(
  ticketId: string,
  verifiedBy: string
): Promise<VerifyTicketResult> {
  const payment = await prisma.payment.findUnique({
    where: { ticketId: ticketId.toUpperCase() },
  });

  if (!payment) {
    return {
      success: false,
      message: 'Ticket not found',
    };
  }

  if (payment.status !== 'Paid') {
    return {
      success: false,
      message: `Ticket status is ${payment.status}. Only paid tickets can be verified.`,
      ticket: toTicketData(payment),
    };
  }

  if (payment.used) {
    return {
      success: false,
      message: 'Ticket has already been used',
      alreadyUsed: true,
      verifiedAt: payment.verifiedAt || undefined,
      ticket: toTicketData(payment),
    };
  }

  // Mark as used
  const updated = await prisma.payment.update({
    where: { ticketId: ticketId.toUpperCase() },
    data: {
      used: true,
      verifiedAt: new Date(),
      verifiedBy,
    },
  });

  logger.info('Ticket verified', { ticketId, verifiedBy });

  return {
    success: true,
    message: 'Ticket verified successfully',
    ticket: toTicketData(updated),
    verifiedAt: updated.verifiedAt || undefined,
  };
}

/**
 * Update ticket status
 */
export async function updateTicketStatus(
  ticketId: string,
  status: TicketStatus
): Promise<ServiceResult<TicketData>> {
  try {
    const payment = await prisma.payment.update({
      where: { ticketId: ticketId.toUpperCase() },
      data: { status },
    });

    logger.info('Ticket status updated', { ticketId, status });
    return { success: true, data: toTicketData(payment) };
  } catch (error) {
    logger.error('Failed to update ticket status', { ticketId, status, error });
    return { success: false, error: 'Ticket not found', code: 'NOT_FOUND' };
  }
}

/**
 * Get dashboard statistics
 */
export async function getStats(): Promise<{
  total: number;
  paid: number;
  pending: number;
  checkedIn: number;
  revenue: number;
}> {
  const [total, paid, pending, checkedIn, revenueResult] = await Promise.all([
    prisma.payment.count(),
    prisma.payment.count({ where: { status: 'Paid' } }),
    prisma.payment.count({ where: { status: 'Pending' } }),
    prisma.payment.count({ where: { used: true } }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: 'Paid' },
    }),
  ]);

  return {
    total,
    paid,
    pending,
    checkedIn,
    revenue: revenueResult._sum.amount || 0,
  };
}

/**
 * Bulk create tickets
 */
export async function bulkCreateTickets(
  tickets: CreateTicketData[]
): Promise<ServiceResult<{ created: number; failed: number; results: TicketData[] }>> {
  const results: TicketData[] = [];
  let failed = 0;

  for (const ticketData of tickets) {
    const result = await createTicket(ticketData);
    if (result.success) {
      results.push(result.data);
    } else {
      failed++;
    }
  }

  logger.info('Bulk ticket creation completed', {
    total: tickets.length,
    created: results.length,
    failed,
  });

  return {
    success: true,
    data: {
      created: results.length,
      failed,
      results,
    },
  };
}

/**
 * Delete a ticket (soft delete - mark as cancelled)
 */
export async function deleteTicket(ticketId: string): Promise<ServiceResult<void>> {
  try {
    await prisma.payment.update({
      where: { ticketId: ticketId.toUpperCase() },
      data: { status: 'Cancelled' },
    });

    logger.info('Ticket cancelled', { ticketId });
    return { success: true, data: undefined };
  } catch (error) {
    logger.error('Failed to delete ticket', { ticketId, error });
    return { success: false, error: 'Ticket not found', code: 'NOT_FOUND' };
  }
}
