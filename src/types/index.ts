import { Request } from 'express';

/**
 * Ticket status enum
 */
export type TicketStatus = 'PENDING' | 'PAID' | 'USED' | 'CANCELLED' | 'REFUNDED' | 'EXPIRED';

/**
 * Payment status enum
 */
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'REFUNDED';

/**
 * User role enum
 */
export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'STAFF' | 'CHECKER';

/**
 * Payment provider enum
 */
export type PaymentProvider = 'STRIPE' | 'PAYPAL' | 'HUBTEL' | 'SQUARE' | 'PAYSTACK' | 'FLUTTERWAVE' | 'MANUAL' | 'COMPLIMENTARY';

/**
 * Ticket data for creation
 */
export interface CreateTicketData {
  name: string;
  phone: string;
  email?: string | null;
  eventId?: string;
  ticketTypeId?: string;
  amount?: number;
  status?: 'PENDING' | 'PAID';
  notes?: string;
}

/**
 * Ticket data returned from service
 */
export interface TicketData {
  id: string;
  ticketId: string;
  accessCode: string;
  name: string;
  phone: string;
  email?: string | null;
  eventId?: string | null;
  ticketTypeId?: string | null;
  ticketTypeName?: string;
  status: TicketStatus;
  amount: number;
  currency?: string;
  eventDate: string;
  eventTime: string;
  eventName?: string;
  used: boolean;
  verifiedAt: Date | null;
  verifiedBy: string | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Ticket search/filter options
 */
export interface TicketSearchOptions {
  query?: string;
  status?: TicketStatus;
  ticketTypeId?: string;
  eventId?: string;
  phone?: string;
  checkedIn?: boolean;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

/**
 * Paginated result
 */
export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * User data for auth
 */
export interface UserData {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
}

/**
 * Auth token response
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: UserData;
}

/**
 * Verified ticket result
 */
export interface VerifyTicketResult {
  success: boolean;
  ticket?: TicketData;
  message: string;
  alreadyUsed?: boolean;
  verifiedAt?: Date;
}

/**
 * Dashboard statistics
 */
export interface DashboardStats {
  totalTickets: number;
  soldToday: number;
  checkedIn: number;
  revenue: number;
  currency: string;
  pendingPayments: number;
  ticketsByStatus: Record<TicketStatus, number>;
  recentActivity: Array<{
    type: 'sale' | 'checkin' | 'refund' | 'payment';
    details: string;
    timestamp: Date;
  }>;
}

/**
 * Payment request (generic)
 */
export interface PaymentRequest {
  amount: number;
  currency?: string;
  provider?: PaymentProvider;
  ticketId?: string;
  customerPhone?: string;
  customerEmail?: string;
  customerName?: string;
  description?: string;
  returnUrl?: string;
  cancelUrl?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Payment result
 */
export interface PaymentResult {
  success: boolean;
  reference?: string;
  externalId?: string;
  redirectUrl?: string;
  status?: PaymentStatus;
  error?: string;
}

/**
 * Webhook payload (generic)
 */
export interface WebhookPayload {
  provider: string;
  status: string;
  amount?: number;
  currency?: string;
  reference?: string;
  transactionId?: string;
  customerPhone?: string;
  customerName?: string;
  metadata?: Record<string, unknown>;
  raw?: unknown;
}

/**
 * User payload in authenticated requests
 */
export interface AuthUser {
  userId: string;
  email: string;
  role: UserRole;
  type: 'access' | 'refresh';
  iat: number;
  exp: number;
}

/**
 * Extended Express Request with user info
 */
export interface AuthenticatedRequest extends Request {
  user: AuthUser;
  userId: string;
}

/**
 * API response wrapper
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  message?: string;
}

/**
 * Service result type for operations that can fail
 */
export type ServiceResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string; code?: string };
