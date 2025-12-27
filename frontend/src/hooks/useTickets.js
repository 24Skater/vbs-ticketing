import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketsApi, paymentsApi } from '../lib/api';

/**
 * Hook for looking up tickets by phone
 */
export function useTicketsByPhone(phone, options = {}) {
  return useQuery({
    queryKey: ['tickets', 'phone', phone],
    queryFn: () => ticketsApi.getByPhone(phone),
    enabled: !!phone && phone.length >= 9,
    ...options,
  });
}

/**
 * Hook for looking up ticket by phone and access code
 */
export function useTicketLookup(phone, accessCode, options = {}) {
  return useQuery({
    queryKey: ['tickets', 'lookup', phone, accessCode],
    queryFn: () => ticketsApi.lookup(phone, accessCode),
    enabled: !!phone && !!accessCode,
    ...options,
  });
}

/**
 * Hook for getting a single ticket
 */
export function useTicket(ticketId, options = {}) {
  return useQuery({
    queryKey: ['tickets', ticketId],
    queryFn: () => ticketsApi.getById(ticketId),
    enabled: !!ticketId,
    ...options,
  });
}

/**
 * Hook for listing tickets (admin)
 */
export function useTicketsList(params = {}, options = {}) {
  return useQuery({
    queryKey: ['tickets', 'list', params],
    queryFn: () => ticketsApi.list(params),
    ...options,
  });
}

/**
 * Hook for ticket stats (admin)
 */
export function useTicketStats(options = {}) {
  return useQuery({
    queryKey: ['tickets', 'stats'],
    queryFn: () => ticketsApi.getStats(),
    ...options,
  });
}

/**
 * Hook for verifying a ticket
 */
export function useVerifyTicket() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (ticketId) => ticketsApi.verify(ticketId),
    onSuccess: (data, ticketId) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['tickets', ticketId] });
      queryClient.invalidateQueries({ queryKey: ['tickets', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['tickets', 'list'] });
    },
  });
}

/**
 * Hook for creating a ticket
 */
export function useCreateTicket() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => ticketsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['tickets', 'stats'] });
    },
  });
}

/**
 * Hook for initiating payment
 */
export function useInitiatePayment() {
  return useMutation({
    mutationFn: (data) => paymentsApi.initiate(data),
  });
}

/**
 * Hook for checking payment status
 */
export function usePaymentStatus(reference, options = {}) {
  return useQuery({
    queryKey: ['payments', 'status', reference],
    queryFn: () => paymentsApi.checkStatus(reference),
    enabled: !!reference,
    refetchInterval: 5000, // Poll every 5 seconds
    ...options,
  });
}

/**
 * Hook for verifying payment
 */
export function useVerifyPayment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => paymentsApi.verify(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
}

export default {
  useTicketsByPhone,
  useTicketLookup,
  useTicket,
  useTicketsList,
  useTicketStats,
  useVerifyTicket,
  useCreateTicket,
  useInitiatePayment,
  usePaymentStatus,
  useVerifyPayment,
};

