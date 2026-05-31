export type PaymentStatus = 'Initiated' | 'Pending' | 'Succeeded' | 'Failed' | 'Cancelled';

export interface Payment {
  id: string;
  bookingId: string;
  provider?: string;
  providerRef?: string;
  checkout_url?: string;
  amountCents: number;
  currency: string;
  status: PaymentStatus;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt?: string;
}

export interface PaymentInitiateRequest {
  amountCents: number;
  currency?: string;
  provider?: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentListResponse {
  items: Payment[];
}
