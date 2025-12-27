import { prisma } from '../utils/prisma.js';
import { logger } from '../utils/logger.js';
import type { Event, TicketType, Prisma } from '@prisma/client';
import type { ServiceResult } from '../types/index.js';

/**
 * Event with ticket types included
 */
export type EventWithTypes = Event & {
  ticketTypes: TicketType[];
  _count?: { tickets: number };
};

/**
 * Create a new event
 */
export async function createEvent(data: {
  name: string;
  slug: string;
  description?: string;
  venue?: string;
  eventDate: Date;
  eventTime?: string;
  endDate?: Date;
  imageUrl?: string;
}): Promise<ServiceResult<Event>> {
  try {
    // Check if slug already exists
    const existing = await prisma.event.findUnique({
      where: { slug: data.slug },
    });

    if (existing) {
      return { success: false, error: 'Event with this slug already exists' };
    }

    const event = await prisma.event.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        venue: data.venue,
        eventDate: data.eventDate,
        eventTime: data.eventTime || '09:00 AM',
        endDate: data.endDate,
        imageUrl: data.imageUrl,
      },
    });

    logger.info('Event created', { eventId: event.id, name: event.name });

    return { success: true, data: event };
  } catch (error) {
    logger.error('Failed to create event', { error });
    return { success: false, error: 'Failed to create event' };
  }
}

/**
 * Get event by ID or slug
 */
export async function getEvent(idOrSlug: string): Promise<EventWithTypes | null> {
  return prisma.event.findFirst({
    where: {
      OR: [{ id: idOrSlug }, { slug: idOrSlug }],
    },
    include: {
      ticketTypes: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      },
      _count: { select: { tickets: true } },
    },
  });
}

/**
 * List all events
 */
export async function listEvents(options: {
  activeOnly?: boolean;
  upcoming?: boolean;
  page?: number;
  limit?: number;
} = {}): Promise<{ events: EventWithTypes[]; total: number }> {
  const { activeOnly = true, upcoming = false, page = 1, limit = 20 } = options;

  const where: Prisma.EventWhereInput = {};
  
  if (activeOnly) {
    where.isActive = true;
  }
  
  if (upcoming) {
    where.eventDate = { gte: new Date() };
  }

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      include: {
        ticketTypes: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
        _count: { select: { tickets: true } },
      },
      orderBy: { eventDate: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.event.count({ where }),
  ]);

  return { events, total };
}

/**
 * Update an event
 */
export async function updateEvent(
  id: string,
  data: Partial<{
    name: string;
    slug: string;
    description: string;
    venue: string;
    eventDate: Date;
    eventTime: string;
    endDate: Date;
    imageUrl: string;
    isActive: boolean;
  }>
): Promise<ServiceResult<Event>> {
  try {
    // Check if slug is being changed and if it already exists
    if (data.slug) {
      const existing = await prisma.event.findFirst({
        where: { slug: data.slug, NOT: { id } },
      });

      if (existing) {
        return { success: false, error: 'Event with this slug already exists' };
      }
    }

    const event = await prisma.event.update({
      where: { id },
      data,
    });

    logger.info('Event updated', { eventId: event.id });

    return { success: true, data: event };
  } catch (error) {
    logger.error('Failed to update event', { error, eventId: id });
    return { success: false, error: 'Failed to update event' };
  }
}

/**
 * Delete (deactivate) an event
 */
export async function deleteEvent(id: string): Promise<ServiceResult<void>> {
  try {
    await prisma.event.update({
      where: { id },
      data: { isActive: false },
    });

    logger.info('Event deactivated', { eventId: id });

    return { success: true, data: undefined };
  } catch (error) {
    logger.error('Failed to delete event', { error, eventId: id });
    return { success: false, error: 'Failed to delete event' };
  }
}

/**
 * Create a ticket type for an event
 */
export async function createTicketType(data: {
  eventId: string;
  name: string;
  price: number;
  quantity: number;
  description?: string;
  sortOrder?: number;
}): Promise<ServiceResult<TicketType>> {
  try {
    // Check if ticket type name already exists for this event
    const existing = await prisma.ticketType.findUnique({
      where: {
        eventId_name: {
          eventId: data.eventId,
          name: data.name,
        },
      },
    });

    if (existing) {
      return { success: false, error: 'Ticket type with this name already exists for this event' };
    }

    const ticketType = await prisma.ticketType.create({
      data: {
        eventId: data.eventId,
        name: data.name,
        price: data.price,
        quantity: data.quantity,
        description: data.description,
        sortOrder: data.sortOrder || 0,
      },
    });

    logger.info('Ticket type created', { ticketTypeId: ticketType.id, eventId: data.eventId });

    return { success: true, data: ticketType };
  } catch (error) {
    logger.error('Failed to create ticket type', { error });
    return { success: false, error: 'Failed to create ticket type' };
  }
}

/**
 * Update a ticket type
 */
export async function updateTicketType(
  id: string,
  data: Partial<{
    name: string;
    price: number;
    quantity: number;
    description: string;
    sortOrder: number;
    isActive: boolean;
  }>
): Promise<ServiceResult<TicketType>> {
  try {
    const ticketType = await prisma.ticketType.update({
      where: { id },
      data,
    });

    return { success: true, data: ticketType };
  } catch (error) {
    logger.error('Failed to update ticket type', { error, ticketTypeId: id });
    return { success: false, error: 'Failed to update ticket type' };
  }
}

/**
 * Get event statistics
 */
export async function getEventStats(eventId: string): Promise<{
  totalTickets: number;
  soldTickets: number;
  usedTickets: number;
  revenue: number;
  byType: Array<{
    name: string;
    quantity: number;
    sold: number;
    revenue: number;
  }>;
}> {
  const [ticketTypes, ticketStats] = await Promise.all([
    prisma.ticketType.findMany({
      where: { eventId },
      include: {
        tickets: {
          where: { status: { in: ['PAID', 'USED'] } },
          select: { amount: true, status: true },
        },
      },
    }),
    prisma.ticket.groupBy({
      by: ['status'],
      where: { eventId },
      _count: true,
    }),
  ]);

  const statusCounts = Object.fromEntries(
    ticketStats.map((s) => [s.status, s._count])
  );

  const byType = ticketTypes.map((tt) => ({
    name: tt.name,
    quantity: tt.quantity,
    sold: tt.tickets.length,
    revenue: tt.tickets.reduce((sum, t) => sum + t.amount, 0),
  }));

  return {
    totalTickets: ticketTypes.reduce((sum, tt) => sum + tt.quantity, 0),
    soldTickets: (statusCounts['PAID'] || 0) + (statusCounts['USED'] || 0),
    usedTickets: statusCounts['USED'] || 0,
    revenue: byType.reduce((sum, t) => sum + t.revenue, 0),
    byType,
  };
}

