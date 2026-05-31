import api from '@/lib/api';
import { extractApiError, shouldUseLocalFallback } from './api-utils';
import type { Payment, PaymentInitiateRequest } from '@/types/payment';

const PAYMENTS_STORAGE_KEY = 'adlts-payments';
export const DEFAULT_PAYMENT_AMOUNT_CENTS = 50000;
export const DEFAULT_PAYMENT_CURRENCY = 'ETB';
const ALLOW_LOCAL_FALLBACK =
  typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_ALLOW_LOCAL_FALLBACK !== 'false' : true;

function normalizePayment(raw: unknown): Payment | null {
  if (!raw || typeof raw !== 'object') return null;
  const data = raw as Record<string, unknown>;
  const now = new Date().toISOString();

  const id = typeof data.id === 'string' ? data.id : `payment-${Date.now()}`;
  const bookingId = typeof data.booking_id === 'string' ? data.booking_id : typeof data.bookingId === 'string' ? data.bookingId : '';
  const amountCents = typeof data.amount_cents === 'number' ? data.amount_cents : typeof data.amountCents === 'number' ? data.amountCents : 0;
  const currency = typeof data.currency === 'string' ? data.currency : 'ETB';
  const status = typeof data.status === 'string' ? (data.status as Payment['status']) : 'Pending';

  return {
    id,
    bookingId,
    provider: typeof data.provider === 'string' ? data.provider : undefined,
    providerRef: typeof data.provider_ref === 'string' ? data.provider_ref : undefined,
    checkout_url: typeof data.checkout_url === 'string' ? data.checkout_url : undefined,
    amountCents,
    currency,
    status,
    metadata: typeof data.metadata === 'object' && data.metadata ? (data.metadata as Record<string, unknown>) : undefined,
    createdAt: typeof data.created_at === 'string' ? data.created_at : now,
    updatedAt: typeof data.updated_at === 'string' ? data.updated_at : undefined,
  };
}

function readStoredPayments(): Payment[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(PAYMENTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map((p) => normalizePayment(p)).filter((p): p is Payment => !!p);
    return [];
  } catch {
    return [];
  }
}

function writeStoredPayments(payments: Payment[]) {
  if (typeof window === 'undefined') return payments;
  try {
    localStorage.setItem(PAYMENTS_STORAGE_KEY, JSON.stringify(payments));
  } catch {
    // ignore
  }
  return payments;
}

export async function initiatePayment(bookingId: string, payload: PaymentInitiateRequest): Promise<Payment> {
  try {
    const body = {
      amount_cents: payload.amountCents,
      currency: payload.currency || DEFAULT_PAYMENT_CURRENCY,
      provider: payload.provider,
      metadata: payload.metadata,
    };

    const response = await api.post(`/bookings/${bookingId}/payments`, body);
    const payment = normalizePayment(response.data?.data ?? response.data ?? response.data?.payment);
    if (payment) return payment;

    // Fallback: construct a local payment object
    const local: Payment = {
      id: `payment-local-${Date.now()}`,
      bookingId,
      amountCents: payload.amountCents,
      currency: payload.currency || DEFAULT_PAYMENT_CURRENCY,
      status: 'Initiated',
      createdAt: new Date().toISOString(),
    };

    return local;
  } catch (error) {
    const status = (error as { response?: { status?: number } } | undefined)?.response?.status;

    // Do not silently create payments when auth/permission errors occur
    if (status === 401 || status === 403) {
      throw new Error(extractApiError(error, 'Failed to initiate payment.'));
    }

    if (ALLOW_LOCAL_FALLBACK && shouldUseLocalFallback(error)) {
      const payments = readStoredPayments();
      const local: Payment = {
        id: `payment-local-${Date.now()}`,
        bookingId,
        amountCents: payload.amountCents,
        currency: payload.currency || DEFAULT_PAYMENT_CURRENCY,
        status: 'Initiated',
        createdAt: new Date().toISOString(),
      };
      payments.push(local);
      writeStoredPayments(payments);
      return local;
    }

    throw new Error(extractApiError(error, 'Failed to initiate payment.'));
  }
}

export async function createPayment(bookingId: string, payload: PaymentInitiateRequest): Promise<Payment> {
  return initiatePayment(bookingId, payload);
}

export async function retryPayment(bookingId: string): Promise<Payment> {
  try {
    const response = await api.post(`/bookings/${bookingId}/payments/retry`);
    const payment = normalizePayment(response.data?.data ?? response.data ?? response.data?.payment);
    if (payment) return payment;

    throw new Error('Failed to retry payment.');
  } catch (error) {
    const status = (error as { response?: { status?: number } } | undefined)?.response?.status;
    if (status === 401 || status === 403) {
      throw new Error(extractApiError(error, 'Failed to retry payment.'));
    }

    if (ALLOW_LOCAL_FALLBACK && shouldUseLocalFallback(error)) {
      const payments = readStoredPayments();
      const index = payments.findIndex((p) => p.bookingId === bookingId);
      if (index !== -1) {
        payments[index] = { ...payments[index], status: 'Initiated', updatedAt: new Date().toISOString() };
        writeStoredPayments(payments);
        return payments[index];
      }
    }

    throw new Error(extractApiError(error, 'Failed to retry payment.'));
  }
}

export async function getPaymentsForBooking(bookingId: string): Promise<Payment[]> {
  try {
    const response = await api.get(`/bookings/${bookingId}/payments`);
    const collection = Array.isArray(response.data?.data)
      ? response.data.data
      : Array.isArray(response.data?.payments)
      ? response.data.payments
      : Array.isArray(response.data)
      ? response.data
      : [];

    return collection.map(normalizePayment).filter((p): p is Payment => !!p);
  } catch (error) {
    if (ALLOW_LOCAL_FALLBACK && shouldUseLocalFallback(error)) {
      return readStoredPayments().filter((p) => p.bookingId === bookingId);
    }

    throw new Error(extractApiError(error, 'Failed to fetch payments.'));
  }
}

export function getStoredPaymentsSnapshot(): Payment[] {
  return readStoredPayments();
}

const paymentService = {
  initiatePayment,
  createPayment,
  retryPayment,
  getPaymentsForBooking,
  getStoredPaymentsSnapshot,
};

export default paymentService;
