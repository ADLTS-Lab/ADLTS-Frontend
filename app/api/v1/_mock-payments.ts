import { randomUUID } from 'crypto';
import type { NextRequest } from 'next/server';

import { markBookingAwaitingPayment, markBookingPaid } from './_mock-bookings';

export type MockPaymentStatus = 'Initiated' | 'Pending' | 'Succeeded' | 'Failed' | 'Cancelled';

export type MockPayment = {
  id: string;
  bookingId: string;
  provider?: string;
  providerRef?: string;
  checkout_url?: string;
  amountCents: number;
  currency: string;
  status: MockPaymentStatus;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt?: string;
};

type MockPaymentState = {
  payments: Map<string, MockPayment>;
  retryCounts: Map<string, number>;
};

declare global {
  // eslint-disable-next-line no-var
  var __adltsMockPaymentState: MockPaymentState | undefined;
}

function seedPayments(): MockPayment[] {
  const now = Date.now();
  return [
    {
      id: 'mock-payment-1',
      bookingId: 'mock-booking-2',
      provider: 'chapa',
      providerRef: 'chapa-ref-123',
      amountCents: 50000,
      currency: 'ETB',
      status: 'Succeeded',
      createdAt: new Date(now - 1000 * 60 * 60 * 24).toISOString(),
    },
  ];
}

const state: MockPaymentState = globalThis.__adltsMockPaymentState ?? {
  payments: new Map<string, MockPayment>(seedPayments().map((p) => [p.id, p])),
  retryCounts: new Map<string, number>(),
};
globalThis.__adltsMockPaymentState = state;

if (!state.retryCounts) {
  state.retryCounts = new Map<string, number>();
}

export function listPaymentsForBooking(bookingId: string) {
  const items = Array.from(state.payments.values()).filter((p) => p.bookingId === bookingId);
  items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return items;
}

export function createPaymentForBooking(bookingId: string, body: Record<string, unknown>) {
  const now = new Date().toISOString();
  const amountCents = typeof body.amount_cents === 'number' ? body.amount_cents : typeof body.amountCents === 'number' ? body.amountCents : 0;
  const currency = String(body.currency ?? 'ETB');
  const provider = typeof body.provider === 'string' ? body.provider : 'chapa';

  const payment: MockPayment = {
    id: `payment-${randomUUID()}`,
    bookingId,
    provider,
    amountCents,
    currency,
    status: 'Pending',
    providerRef: `tx-${randomUUID()}`,
    checkout_url: `https://checkout.chapa.co/mock/${randomUUID()}`,
    createdAt: now,
  };

  state.payments.set(payment.id, payment);
  markBookingAwaitingPayment(bookingId);
  return payment;
}

export function retryPaymentForBooking(bookingId: string) {
  const currentRetryCount = state.retryCounts.get(bookingId) ?? 0;
  if (currentRetryCount >= 3) {
    return { error: 'Retry limit exceeded.', status: 429 as const };
  }

  const existing = listPaymentsForBooking(bookingId)[0] ?? null;
  if (!existing) return { error: 'Payment not found.', status: 404 as const };

  // Create a new retry payment record
  const now = new Date().toISOString();
  const retry: MockPayment = {
    id: `payment-${randomUUID()}`,
    bookingId,
    provider: existing.provider,
    providerRef: `tx-${randomUUID()}`,
    amountCents: existing.amountCents,
    currency: existing.currency,
    status: 'Pending',
    checkout_url: `https://checkout.chapa.co/mock/${randomUUID()}`,
    createdAt: now,
  };

  state.payments.set(retry.id, retry);
  state.retryCounts.set(bookingId, currentRetryCount + 1);
  return { data: retry };
}

export function handleProviderCallback(body: Record<string, unknown>, headers: Headers) {
  const tx_ref = String(body.tx_ref ?? body.transaction_ref ?? '');
  const status = String(body.status ?? '').toLowerCase();

  // Try to find payment by providerRef or tx_ref
  const found = Array.from(state.payments.values()).find((p) => p.providerRef === tx_ref || p.providerRef === String(body.provider_ref ?? ''));

  if (!found) {
    // If not found, no-op but return null for caller to decide
    return null;
  }

  const now = new Date().toISOString();
  const updated: MockPayment = {
    ...found,
    status: status === 'success' ? 'Succeeded' : 'Failed',
    updatedAt: now,
  };

  state.payments.set(found.id, updated);
  if (updated.status === 'Succeeded') {
    markBookingPaid(updated.bookingId);
    state.retryCounts.set(updated.bookingId, state.retryCounts.get(updated.bookingId) ?? 0);
  }
  return updated;
}

export function getPaymentById(id: string) {
  return state.payments.get(id) ?? null;
}
