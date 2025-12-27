import axios, { AxiosInstance } from 'axios';
import { env } from '../config/env.js';
import { logger, logPayment } from '../utils/logger.js';
import { generatePaymentReference } from '../utils/generators.js';
import type { ServiceResult } from '../types/index.js';

/**
 * Hubtel API Response structure
 */
interface HubtelResponse {
  ResponseCode: string;
  Status?: string;
  Data?: {
    TransactionId?: string;
    ClientReference?: string;
    Status?: string;
    Amount?: number;
    Description?: string;
    [key: string]: unknown;
  };
  Message?: string;
}

/**
 * Payment initiation result
 */
export interface PaymentInitResult {
  reference: string;
  transactionId?: string;
  status: string;
  message: string;
}

/**
 * Transaction status result
 */
export interface TransactionStatus {
  reference: string;
  transactionId?: string;
  status: 'pending' | 'success' | 'failed' | 'cancelled';
  amount?: number;
  message: string;
  raw?: unknown;
}

/**
 * Hubtel Service for Mobile Money payments
 */
class HubtelService {
  private client: AxiosInstance;
  private posClient: AxiosInstance;

  constructor() {
    // Standard API client
    this.client = axios.create({
      baseURL: 'https://api.hubtel.com/v2',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
      auth: {
        username: env.HUBTEL_API_ID,
        password: env.HUBTEL_API_KEY,
      },
    });

    // POS/Receive Money client
    this.posClient = axios.create({
      baseURL: 'https://rmp.hubtel.com/merchantaccount/merchants',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
      auth: {
        username: env.HUBTEL_API_ID,
        password: env.HUBTEL_API_KEY,
      },
    });

    // Request interceptor for logging
    this.client.interceptors.request.use((config) => {
      logger.debug('Hubtel API request', {
        method: config.method,
        url: config.url,
      });
      return config;
    });

    // Response interceptor for logging
    this.client.interceptors.response.use(
      (response) => {
        logger.debug('Hubtel API response', {
          status: response.status,
          data: response.data,
        });
        return response;
      },
      (error) => {
        logger.error('Hubtel API error', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
        throw error;
      }
    );
  }

  /**
   * Initiate a receive money request (customer pays via USSD prompt)
   */
  async receiveMoneyDirect(params: {
    amount: number;
    phone: string;
    channel: string;
    customerName?: string;
    description?: string;
    callbackUrl?: string;
  }): Promise<ServiceResult<PaymentInitResult>> {
    try {
      const reference = generatePaymentReference();
      
      const payload = {
        Amount: params.amount,
        Title: 'VBS Ticket Purchase',
        Description: params.description || 'VBS Ticket Payment',
        ClientReference: reference,
        CallbackUrl: params.callbackUrl || env.HUBTEL_CALLBACK_URL,
        CustomerMsisdn: params.phone,
        CustomerName: params.customerName || 'VBS Customer',
        Channel: params.channel,
        PrimaryCallbackUrl: params.callbackUrl || env.HUBTEL_CALLBACK_URL,
      };

      logPayment('Initiating receive money', { reference, amount: params.amount, phone: params.phone });

      const response = await this.posClient.post<HubtelResponse>(
        `/${env.HUBTEL_POS_SALES_ID}/receive/mobilemoney`,
        payload
      );

      if (response.data.ResponseCode === '0000' || response.data.ResponseCode === '0001') {
        logPayment('Receive money initiated', { reference, status: 'pending' });
        
        return {
          success: true,
          data: {
            reference,
            transactionId: response.data.Data?.TransactionId,
            status: 'pending',
            message: response.data.Message || 'Payment initiated. Customer will receive a prompt.',
          },
        };
      }

      logPayment('Receive money failed', { reference, response: response.data });
      
      return {
        success: false,
        error: response.data.Message || 'Payment initiation failed',
        code: response.data.ResponseCode,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Hubtel receive money error', { error: message });
      
      return {
        success: false,
        error: `Payment service error: ${message}`,
        code: 'HUBTEL_ERROR',
      };
    }
  }

  /**
   * Check transaction status
   */
  async getTransactionStatus(clientReference: string): Promise<ServiceResult<TransactionStatus>> {
    try {
      const response = await this.posClient.get<HubtelResponse>(
        `/${env.HUBTEL_POS_SALES_ID}/transactions/status`,
        {
          params: { clientReference },
        }
      );

      const data = response.data.Data;
      let status: TransactionStatus['status'] = 'pending';
      
      if (data?.Status) {
        const statusLower = data.Status.toLowerCase();
        if (statusLower === 'success' || statusLower === 'successful') {
          status = 'success';
        } else if (statusLower === 'failed') {
          status = 'failed';
        } else if (statusLower === 'cancelled') {
          status = 'cancelled';
        }
      }

      return {
        success: true,
        data: {
          reference: clientReference,
          transactionId: data?.TransactionId,
          status,
          amount: data?.Amount,
          message: response.data.Message || 'Status retrieved',
          raw: response.data,
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Hubtel status check error', { error: message, clientReference });
      
      return {
        success: false,
        error: `Failed to check status: ${message}`,
        code: 'HUBTEL_ERROR',
      };
    }
  }

  /**
   * Process webhook callback from Hubtel
   */
  processWebhook(payload: Record<string, unknown>): {
    isValid: boolean;
    reference: string | null;
    status: 'success' | 'failed' | 'pending';
    amount: number;
    transactionId: string | null;
    phone: string | null;
    name: string | null;
  } {
    try {
      // Hubtel sends data in various formats, normalize it
      const data = (payload.Data || {}) as Record<string, unknown>;
      const status = (payload.Status || payload.status || '') as string;
      const reference = (payload.ClientReference || payload.clientReference || data.ClientReference || '') as string;
      const transactionId = (payload.TransactionId || payload.transactionId || data.TransactionId || '') as string;
      const amount = Number(payload.Amount || payload.amount || data.Amount || 0);
      const phone = (payload.CustomerMsisdn || payload.customerMsisdn || data.CustomerMsisdn || '') as string;
      const name = (payload.CustomerName || payload.customerName || data.CustomerName || '') as string;

      let normalizedStatus: 'success' | 'failed' | 'pending' = 'pending';
      const statusLower = status.toLowerCase();
      
      if (statusLower === 'success' || statusLower === 'successful' || statusLower === 'paid') {
        normalizedStatus = 'success';
      } else if (statusLower === 'failed' || statusLower === 'failure') {
        normalizedStatus = 'failed';
      }

      logPayment('Webhook processed', {
        reference,
        status: normalizedStatus,
        amount,
        transactionId,
      });

      return {
        isValid: !!reference,
        reference: reference || null,
        status: normalizedStatus,
        amount,
        transactionId: transactionId || null,
        phone: phone || null,
        name: name || null,
      };
    } catch (error) {
      logger.error('Webhook processing error', { error, payload });
      
      return {
        isValid: false,
        reference: null,
        status: 'pending',
        amount: 0,
        transactionId: null,
        phone: null,
        name: null,
      };
    }
  }

  /**
   * Get supported channels based on phone prefix
   */
  getChannelFromPhone(phone: string): string | null {
    const normalizedPhone = phone.replace(/\D/g, '');
    const prefix = normalizedPhone.slice(-9, -6); // Get the network prefix
    
    const channelMap: Record<string, string> = {
      '24': 'mtn-gh',
      '54': 'mtn-gh',
      '55': 'mtn-gh',
      '59': 'mtn-gh',
      '20': 'vodafone-gh',
      '50': 'vodafone-gh',
      '26': 'tigo-gh',
      '27': 'tigo-gh',
      '56': 'tigo-gh',
      '57': 'tigo-gh',
    };

    return channelMap[prefix] || null;
  }
}

// Export singleton instance
export const hubtelService = new HubtelService();
export default hubtelService;

