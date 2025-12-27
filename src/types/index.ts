import { Request } from 'express';

/**
 * Ticket status enum
 */
export type TicketStatus = 'PENDING' | 'PAID' | 'USED' | 'CANCELLED' | 'REFUNDED' | 'EXPIRED';

/**
 * Ticket type enum
 */
export type TicketType = 'REGULAR' | 'VIP' | 'EARLY_BIRD' | 'COMPLIMENTARY';

/**
 * Payment status enum
 */
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'REFUNDED';

/**
 * User role enum
 */
export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'STAFF' | 'CHECKER';

/**
 * Mobile money channel
 */
export type MobileMoneyChannel = 'mtn-gh' | 'vodafone-gh' | 'tigo-gh' | 'airtel-gh';

/**
 * Ticket data for creation
 */
export interface CreateTicketData {
  name: string;
  phone: string;
  ticketType?: TicketType;
  amount?: number;
  eventId?: string;
  status?: 'PENDING' | 'PAID';
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
  ticketType: TicketType;
  status: TicketStatus;
  amount: number;
  eventDate: string;
  eventTime: string;
  used: boolean;
  verifiedAt: Date | null;
  verifiedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Ticket search/filter options
 */
export interface TicketSearchOptions {
  query?: string;
  status?: TicketStatus;
  ticketType?: TicketType;
  eventId?: string;
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
  pendingPayments: number;
  ticketsByType: Record<TicketType, number>;
  recentActivity: Array<{
    type: 'sale' | 'checkin' | 'refund';
    ticketId: string;
    timestamp: Date;
  }>;
}

/**
 * Hubtel payment request
 */
export interface HubtelPaymentRequest {
  amount: number;
  channel: MobileMoneyChannel;
  customerMsisdn: string;
  customerName?: string;
  description?: string;
  clientReference: string;
  callbackUrl?: string;
}

/**
 * Hubtel webhook payload
 */
export interface HubtelWebhookPayload {
  status: string;
  amount: number;
  transactionId: string;
  clientReference: string;
  customerMsisdn: string;
  customerName?: string;
  [key: string]: unknown;
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
