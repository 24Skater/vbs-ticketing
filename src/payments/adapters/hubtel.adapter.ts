/**
 * Hubtel Payment Adapter
 * Mobile money payments for Ghana (MTN, Vodafone, AirtelTigo)
 */

import { PaymentStatus } from '@prisma/client';
import type { PaymentProvider } from '../types.js';
import { BasePaymentAdapter } from '../base.adapter.js';
import { getHubtelChannel } from '../../utils/phone.js';
import {
  PaymentRequest,
  PaymentInitResult,
  PaymentVerifyResult,
  RefundRequest,
  RefundResult,
  WebhookParseResult,
  WebhookEvent,
  AdapterConfig,
} from '../types.js';

interface HubtelConfig extends AdapterConfig {
  credentials: {
    clientId: string;
    clientSecret: string;
    merchantAccountNumber: string;
    posSalesId?: string;
  };
}

interface HubtelApiResponse {
  Status?: string;
  status?: string;
  Amount?: number;
  amount?: number;
  TransactionId?: string;
  transactionId?: string;
  ClientReference?: string;
  clientReference?: string;
  CustomerMsisdn?: string;
  customerMsisdn?: string;
  CustomerName?: string;
  customerName?: string;
  message?: string;
  [key: string]: unknown;
}

interface HubtelWebhookPayload extends HubtelApiResponse {}

export class HubtelPaymentAdapter extends BasePaymentAdapter {
  readonly provider = 'HUBTEL' as PaymentProvider;
  readonly displayName = 'Hubtel Mobile Money';
  
  private readonly apiBaseUrl = 'https://payproxyapi.hubtel.com/items';
  private readonly ussdBaseUrl = 'https://cs.hubtel.com/commissionservices/2016884/directreceive';
  
  constructor(config: HubtelConfig) {
    super(config);
  }
  
  private get credentials() {
    return this.config.credentials as HubtelConfig['credentials'];
  }
  
  private getAuthHeader(): string {
    const { clientId, clientSecret } = this.credentials;
    return `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`;
  }
  
  /**
   * Initialize payment via Hubtel
   * Uses USSD/direct receive for mobile money
   */
  async initializePayment(request: PaymentRequest): Promise<PaymentInitResult> {
    try {
      this.validateRequest(request);
      
      if (!request.customer.phone) {
        return this.failedInit('Phone number is required for mobile money payment');
      }
      
      const channel = getHubtelChannel(request.customer.phone);
      if (!channel) {
        return this.failedInit('Invalid Ghana mobile number. Supported: MTN, Vodafone, AirtelTigo');
      }
      
      this.logOperation('initializePayment', {
        reference: request.reference,
        amount: request.amount,
        phone: request.customer.phone,
        channel,
      });
      
      // Build USSD/Direct Receive request
      const posSalesId = this.credentials.posSalesId || 
        process.env.HUBTEL_POS_SALES_ID || 
        'DEFAULT_POS';
      
      const payload = {
        Amount: request.amount / 100, // Hubtel expects amount in GHS, not pesewas
        Channel: channel,
        CustomerMsisdn: request.customer.phone,
        CustomerName: request.customer.name || 'Customer',
        Description: request.description || 'Ticket Payment',
        ClientReference: request.reference,
        PrimaryCallbackUrl: request.returnUrl || process.env.HUBTEL_CALLBACK_URL,
      };
      
      const response = await fetch(this.ussdBaseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.getAuthHeader(),
          'POS-SALES-ID': posSalesId,
        },
        body: JSON.stringify(payload),
      });
      
      const data = await response.json() as HubtelApiResponse & { responseCode?: string; data?: { hubtelPreapprovalId?: string } };
      
      if (!response.ok || data.responseCode !== '0000') {
        this.logError('initializePayment', data as Record<string, unknown>, { reference: request.reference });
        return this.failedInit(data.message || 'Hubtel payment initiation failed');
      }
      
      return {
        success: true,
        externalId: data.data?.hubtelPreapprovalId || request.reference,
        status: 'PENDING' as PaymentStatus,
        providerData: {
          hubtelResponse: data,
          message: 'USSD prompt sent to customer phone. Awaiting approval.',
        },
      };
    } catch (error) {
      this.logError('initializePayment', error, { reference: request.reference });
      return this.failedInit(error instanceof Error ? error.message : 'Failed to initialize Hubtel payment');
    }
  }
  
  /**
   * Verify payment status with Hubtel
   */
  async verifyPayment(externalId: string): Promise<PaymentVerifyResult> {
    try {
      this.logOperation('verifyPayment', { externalId });
      
      const { merchantAccountNumber } = this.credentials;
      const url = `${this.apiBaseUrl}/${merchantAccountNumber}/transactions/status?clientReference=${externalId}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': this.getAuthHeader(),
        },
      });
      
      const data = await response.json() as HubtelApiResponse;
      
      if (!response.ok) {
        return this.failedVerify(data.message || 'Failed to verify payment');
      }
      
      const status = this.mapHubtelStatus(data.status || data.Status || '');
      
      return {
        success: true,
        status,
        externalId: data.transactionId || data.TransactionId || externalId,
        amount: Math.round((data.amount || data.Amount || 0) * 100),
        currency: 'GHS',
        paidAt: status === 'SUCCESS' ? new Date() : undefined,
        providerData: data as Record<string, unknown>,
      };
    } catch (error) {
      this.logError('verifyPayment', error, { externalId });
      return this.failedVerify(error instanceof Error ? error.message : 'Failed to verify payment');
    }
  }
  
  /**
   * Process refund - Hubtel doesn't support automated refunds
   */
  async refundPayment(request: RefundRequest): Promise<RefundResult> {
    this.logOperation('refundPayment', {
      externalId: request.externalId,
      amount: request.amount,
    });
    
    // Hubtel mobile money refunds must be processed manually
    return {
      success: false,
      status: 'failed',
      error: 'Hubtel mobile money refunds must be processed manually',
    };
  }
  
  /**
   * Parse Hubtel webhook payload
   */
  async parseWebhook(payload: unknown, _headers?: Record<string, string>): Promise<WebhookParseResult> {
    try {
      const data = payload as HubtelWebhookPayload;
      
      // Hubtel sends fields in various casings
      const status = data.Status || data.status || '';
      const amount = data.Amount || data.amount || 0;
      const transactionId = data.TransactionId || data.transactionId || '';
      const clientReference = data.ClientReference || data.clientReference || '';
      const customerMsisdn = data.CustomerMsisdn || data.customerMsisdn || '';
      const customerName = data.CustomerName || data.customerName || '';
      
      const mappedStatus = this.mapHubtelStatus(status);
      
      const event: WebhookEvent = {
        type: `payment.${mappedStatus.toLowerCase()}`,
        reference: clientReference,
        externalId: transactionId,
        status: mappedStatus,
        amount: Math.round(amount * 100), // Convert to pesewas
        currency: 'GHS',
        customer: {
          phone: customerMsisdn,
          name: customerName,
        },
        timestamp: new Date(),
        rawPayload: payload,
      };
      
      this.logOperation('parseWebhook', {
        reference: clientReference,
        status: mappedStatus,
        amount,
      });
      
      return {
        success: true,
        event,
      };
    } catch (error) {
      this.logError('parseWebhook', error);
      return this.failedWebhook(error instanceof Error ? error.message : 'Failed to parse webhook');
    }
  }
  
  /**
   * Map Hubtel status to our PaymentStatus
   */
  private mapHubtelStatus(hubtelStatus: string): PaymentStatus {
    const statusMap: Record<string, PaymentStatus> = {
      'Success': 'SUCCESS',
      'SUCCESS': 'SUCCESS',
      'Successful': 'SUCCESS',
      'SUCCESSFUL': 'SUCCESS',
      'Paid': 'SUCCESS',
      'PAID': 'SUCCESS',
      'Pending': 'PENDING',
      'PENDING': 'PENDING',
      'Failed': 'FAILED',
      'FAILED': 'FAILED',
      'Cancelled': 'CANCELLED',
      'CANCELLED': 'CANCELLED',
      'Expired': 'FAILED',
      'EXPIRED': 'FAILED',
    };
    
    return statusMap[hubtelStatus] || 'PENDING';
  }
}

/**
 * Create Hubtel adapter from environment or config
 */
export function createHubtelAdapter(config?: Partial<HubtelConfig>): HubtelPaymentAdapter {
  return new HubtelPaymentAdapter({
    provider: 'HUBTEL' as PaymentProvider,
    enabled: !!process.env.HUBTEL_CLIENT_ID,
    isLiveMode: process.env.NODE_ENV === 'production',
    credentials: {
      clientId: process.env.HUBTEL_CLIENT_ID || '',
      clientSecret: process.env.HUBTEL_CLIENT_SECRET || '',
      merchantAccountNumber: process.env.HUBTEL_MERCHANT_ACCOUNT || '',
      posSalesId: process.env.HUBTEL_POS_SALES_ID,
    },
    supportedCurrencies: ['GHS'],
    supportedCountries: ['GH'],
    ...config,
  });
}

