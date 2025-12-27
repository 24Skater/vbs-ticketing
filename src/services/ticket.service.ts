import { prisma } from '../utils/prisma.js';
import { generateUniqueTicketId, generateUniqueAccessCode } from '../utils/generators.js';
import { normalizePhone } from '../utils/phone.js';
import { logger } from '../utils/logger.js';
import { TicketStatus } from '@prisma/client';
import type {
  CreateTicketData,
  TicketData,
  TicketSearchOptions,
  PaginatedResult,
  VerifyTicketResult,
  ServiceResult,
} from '../types/index.js';

/**
 * Convert Prisma Ticket to TicketData
 */
function toTicketData(ticket: {
  id: string;
  ticketId: string;
  accessCode: string;
  name: string;
  phone: string;
  email: string | null;
  eventId: string | null;
  ticketTypeId: string | null;
  status: TicketStatus;
  amount: number;
  used: boolean;
  verifiedAt: Date | null;
  verifiedById: string | null;
  createdAt: Date;
  updatedAt: Date;
  event?: { eventDate: Date; eventTime: string } | null;
}): TicketData {
  return {
    id: ticket.id,
    ticketId: ticket.ticketId,
    accessCode: ticket.accessCode,
    name: ticket.name,
    phone: ticket.phone,
    ticketType: 'REGULAR' as TicketData['ticketType'], // TODO: get from ticketType relation
    status: ticket.status as TicketData['status'],
    amount: ticket.amount,
    eventDate: ticket.event?.eventDate?.toISOString().split('T')[0] || 'TBD',
    eventTime: ticket.event?.eventTime || '09:00 AM',
    used: ticket.used,
    verifiedAt: ticket.verifiedAt,
    verifiedBy: ticket.verifiedById,
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
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
      const existing = await prisma.ticket.findUnique({ where: { ticketId: id } });
      return !!existing;
    });

    const accessCode = await generateUniqueAccessCode(async (code) => {
      const existing = await prisma.ticket.findUnique({ where: { accessCode: code } });
      return !!existing;
    });

    const ticket = await prisma.ticket.create({
      data: {
        name: data.name,
        phone: normalizedPhone,
        ticketId,
        accessCode,
        amount: data.amount || 0,
        status: data.status === 'PENDING' ? 'PENDING' : 'PAID',
        eventId: data.eventId,
      },
      include: {
        event: true,
      },
    });

    logger.info('Ticket created', { ticketId, phone: normalizedPhone });
    return { success: true, data: toTicketData(ticket) };
  } catch (error) {
    logger.error('Failed to create ticket', { error, data });
    return { success: false, error: 'Failed to create ticket', code: 'CREATE_FAILED' };
  }
}

/**
 * Get ticket by ID
 */
export async function getTicketById(ticketId: string): Promise<TicketData | null> {
  const ticket = await prisma.ticket.findUnique({
    where: { ticketId: ticketId.toUpperCase() },
    include: { event: true },
  });
  
  return ticket ? toTicketData(ticket) : null;
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

  const ticket = await prisma.ticket.findFirst({
    where: {
      phone: normalizedPhone,
      accessCode: accessCode.toUpperCase(),
    },
    include: { event: true },
  });

  return ticket ? toTicketData(ticket) : null;
}

/**
 * Get all tickets for a phone number
 */
export async function getTicketsByPhone(phone: string): Promise<TicketData[]> {
  const normalizedPhone = normalizePhone(phone);
  if (!normalizedPhone) return [];

  const tickets = await prisma.ticket.findMany({
    where: { phone: normalizedPhone },
    orderBy: { createdAt: 'desc' },
    include: { event: true },
  });

  return tickets.map(toTicketData);
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
    where.ticketType = { name: ticketType };
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
  const [tickets, total] = await Promise.all([
    prisma.ticket.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { event: true },
    }),
    prisma.ticket.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    data: tickets.map(toTicketData),
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
  const ticket = await prisma.ticket.findUnique({
    where: { ticketId: ticketId.toUpperCase() },
    include: { event: true },
  });

  if (!ticket) {
    return {
      success: false,
      message: 'Ticket not found',
    };
  }

  if (ticket.status !== 'PAID') {
    return {
      success: false,
      message: `Ticket status is ${ticket.status}. Only paid tickets can be verified.`,
      ticket: toTicketData(ticket),
    };
  }

  if (ticket.used) {
    return {
      success: false,
      message: 'Ticket has already been used',
      alreadyUsed: true,
      verifiedAt: ticket.verifiedAt || undefined,
      ticket: toTicketData(ticket),
    };
  }

  // Mark as used
  const updated = await prisma.ticket.update({
    where: { ticketId: ticketId.toUpperCase() },
    data: {
      used: true,
      status: 'USED',
      verifiedAt: new Date(),
      verifiedById: verifiedBy,
    },
    include: { event: true },
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
  status: TicketData['status']
): Promise<ServiceResult<TicketData>> {
  try {
    const ticket = await prisma.ticket.update({
      where: { ticketId: ticketId.toUpperCase() },
      data: { status: status as TicketStatus },
      include: { event: true },
    });

    logger.info('Ticket status updated', { ticketId, status });
    return { success: true, data: toTicketData(ticket) };
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
    prisma.ticket.count(),
    prisma.ticket.count({ where: { status: 'PAID' } }),
    prisma.ticket.count({ where: { status: 'PENDING' } }),
    prisma.ticket.count({ where: { used: true } }),
    prisma.ticket.aggregate({
      _sum: { amount: true },
      where: { status: 'PAID' },
    }),
  ]);

  return {
    total,
    paid,
    pending,
    checkedIn,
    revenue: revenueResult._sum?.amount || 0,
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
    await prisma.ticket.update({
      where: { ticketId: ticketId.toUpperCase() },
      data: { status: 'CANCELLED' },
    });

    logger.info('Ticket cancelled', { ticketId });
    return { success: true, data: undefined };
  } catch (error) {
    logger.error('Failed to delete ticket', { ticketId, error });
    return { success: false, error: 'Ticket not found', code: 'NOT_FOUND' };
  }
}

/**
 * Bulk verify/check-in tickets
 */
export async function bulkVerifyTickets(
  ticketIds: string[],
  verifiedBy: string
): Promise<{
  success: number;
  failed: number;
  alreadyUsed: number;
  results: Array<{ ticketId: string; status: 'verified' | 'failed' | 'already_used' }>;
}> {
  const results: Array<{ ticketId: string; status: 'verified' | 'failed' | 'already_used' }> = [];
  let success = 0;
  let failed = 0;
  let alreadyUsed = 0;

  for (const ticketId of ticketIds) {
    const result = await verifyTicket(ticketId, verifiedBy);
    
    if (result.success) {
      success++;
      results.push({ ticketId, status: 'verified' });
    } else if (result.alreadyUsed) {
      alreadyUsed++;
      results.push({ ticketId, status: 'already_used' });
    } else {
      failed++;
      results.push({ ticketId, status: 'failed' });
    }
  }

  logger.info('Bulk verification completed', { total: ticketIds.length, success, failed, alreadyUsed });

  return { success, failed, alreadyUsed, results };
}

/**
 * Bulk cancel tickets
 */
export async function bulkCancelTickets(
  ticketIds: string[]
): Promise<{
  success: number;
  failed: number;
  results: Array<{ ticketId: string; status: 'cancelled' | 'failed' }>;
}> {
  const results: Array<{ ticketId: string; status: 'cancelled' | 'failed' }> = [];
  let success = 0;
  let failed = 0;

  for (const ticketId of ticketIds) {
    try {
      await prisma.ticket.update({
        where: { ticketId: ticketId.toUpperCase() },
        data: { status: 'CANCELLED' },
      });
      success++;
      results.push({ ticketId, status: 'cancelled' });
    } catch {
      failed++;
      results.push({ ticketId, status: 'failed' });
    }
  }

  logger.info('Bulk cancellation completed', { total: ticketIds.length, success, failed });

  return { success, failed, results };
}

/**
 * Bulk update ticket status
 */
export async function bulkUpdateStatus(
  ticketIds: string[],
  status: TicketStatus
): Promise<{
  success: number;
  failed: number;
}> {
  try {
    const result = await prisma.ticket.updateMany({
      where: { ticketId: { in: ticketIds.map(id => id.toUpperCase()) } },
      data: { status },
    });

    logger.info('Bulk status update completed', { 
      total: ticketIds.length, 
      updated: result.count, 
      status 
    });

    return { success: result.count, failed: ticketIds.length - result.count };
  } catch (error) {
    logger.error('Bulk status update failed', { error });
    return { success: 0, failed: ticketIds.length };
  }
}

/**
 * Get tickets by IDs (for bulk operations preview)
 */
export async function getTicketsByIds(ticketIds: string[]): Promise<TicketData[]> {
  const tickets = await prisma.ticket.findMany({
    where: { ticketId: { in: ticketIds.map(id => id.toUpperCase()) } },
    include: { event: true },
  });

  return tickets.map(toTicketData);
}
