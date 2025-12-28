import { vi } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import type { TicketStatus, UserRole } from '@prisma/client';

/**
 * Create a mock Express request
 */
export function createMockRequest(overrides: Partial<Request> = {}): Request {
  return {
    body: {},
    params: {},
    query: {},
    headers: {},
    cookies: {},
    ip: '127.0.0.1',
    get: vi.fn((name: string) => {
      if (name === 'authorization') return overrides.headers?.authorization;
      return undefined;
    }),
    ...overrides,
  } as Request;
}

/**
 * Create a mock Express response
 */
export function createMockResponse(): Response {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
    setHeader: vi.fn().mockReturnThis(),
    cookie: vi.fn().mockReturnThis(),
    clearCookie: vi.fn().mockReturnThis(),
    end: vi.fn().mockReturnThis(),
  };
  return res as unknown as Response;
}

/**
 * Create a mock next function
 */
export function createMockNext(): NextFunction {
  return vi.fn() as NextFunction;
}

/**
 * Sample user data for tests
 */
export const sampleUser = {
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  passwordHash: '$2a$10$abcdefghijklmnopqrstuvwxyz123456789012345678901234',
  role: 'ADMIN' as UserRole,
  isActive: true,
  lastLoginAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
};

/**
 * Sample ticket data for tests
 */
export const sampleTicket = {
  id: 'ticket-123',
  ticketId: 'VBS-ABC123',
  accessCode: 'XY12Z',
  eventId: 'event-123',
  ticketTypeId: 'type-123',
  name: 'John Doe',
  phone: '+12125551234', // International E.164 format
  email: 'john@example.com',
  status: 'PAID' as TicketStatus,
  amount: 5000, // $50.00 in cents
  currency: 'USD',
  used: false,
  verifiedAt: null,
  verifiedById: null,
  notes: null,
  createdById: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

/**
 * Sample event data for tests
 */
export const sampleEvent = {
  id: 'event-123',
  name: 'Sample Event 2025',
  slug: 'sample-event-2025',
  description: 'A sample event for testing',
  venue: 'Main Convention Center',
  eventDate: new Date('2025-12-27'),
  eventTime: '09:00 AM',
  endDate: null,
  imageUrl: null,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

/**
 * Sample payment data for tests
 */
export const samplePayment = {
  id: 'payment-123',
  ticketId: 'ticket-123',
  amount: 5000, // $50.00 in cents
  currency: 'USD',
  status: 'SUCCESS',
  provider: 'MANUAL',
  reference: 'REF-123456',
  externalId: 'PAY-789',
  channel: null,
  customerMsisdn: '+12125551234',
  customerName: 'John Doe',
  providerMessage: 'Payment successful',
  metadata: null,
  paidAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
};

/**
 * Generate a JWT token for testing
 */
export function generateTestToken(userId: string, role: UserRole = 'ADMIN'): string {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1h' }
  );
}

/**
 * Wait for a specified time
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

