"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import PaymentHistory from "@/components/PaymentHistory";
import {
  DEFAULT_PAYMENT_AMOUNT_CENTS,
  DEFAULT_PAYMENT_CURRENCY,
  createPayment,
  getPaymentsForBooking,
  retryPayment,
  type Payment,
} from "@/services/payment.service";
import { getAllBookings, type BookingRequest } from "@/services/booking.service";
import { useAuthStore } from "@/store/authStore";
import { useI18n } from "@/i18n/useI18n";

const MAX_RETRIES = 3;

export default function CandidatePaymentsPage() {
  const { t } = useI18n();
  const { user } = useAuthStore();
  const [booking, setBooking] = useState<BookingRequest | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<"pay" | "retry" | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadBookingAndPayments = async () => {
      setLoading(true);
      try {
        const allBookings = await getAllBookings();
        if (!mounted) return;

        const currentEmail = user?.email?.toLowerCase();
        const currentBooking = allBookings.find((item) => item.candidateDetails?.email?.toLowerCase() === currentEmail) ?? null;
        setBooking(currentBooking);

        if (currentBooking) {
          setPaymentLoading(true);
          const bookingPayments = await getPaymentsForBooking(currentBooking.id);
          if (!mounted) return;
          setPayments(bookingPayments);
        } else {
          setPayments([]);
        }
      } catch (error) {
        if (!mounted) return;
        setMessage(error instanceof Error ? error.message : 'Unable to load payment information right now.');
      } finally {
        if (mounted) {
          setLoading(false);
          setPaymentLoading(false);
        }
      }
    };

    void loadBookingAndPayments();

    return () => {
      mounted = false;
    };
  }, [user?.email]);

  const latestPayment = payments[0] ?? null;
  const retryCount = Math.max(0, payments.length - 1);
  const isSuccessful = latestPayment?.status === 'Succeeded';

  const paymentState = useMemo(() => {
    if (!booking) {
      return {
        title: 'No approved booking yet',
        subtitle: 'Your payment area appears after the institution approves your booking request.',
        badgeClass: 'bg-slate-100 text-slate-700',
        statusLabel: 'No booking',
        action: null as null | 'pay' | 'retry' | 'continue',
      };
    }

    if (booking.status === 'Pending') {
      return {
        title: 'Waiting for institution approval',
        subtitle: 'Payment becomes available after approval.',
        badgeClass: 'bg-amber-100 text-amber-700',
        statusLabel: 'Waiting for institution approval',
        action: null as null | 'pay' | 'retry' | 'continue',
      };
    }

    if (booking.status === 'Scheduled') {
      return {
        title: 'Exam Scheduled',
        subtitle: 'Your workflow has moved to the scheduled exam stage.',
        badgeClass: 'bg-indigo-100 text-indigo-700',
        statusLabel: 'Exam Scheduled',
        action: null as null | 'pay' | 'retry' | 'continue',
      };
    }

    if (isSuccessful) {
      return {
        title: 'Payment Complete',
        subtitle: 'Payment is complete. Continue to exam scheduling when ready.',
        badgeClass: 'bg-emerald-100 text-emerald-700',
        statusLabel: 'Payment Complete',
        action: 'continue' as const,
      };
    }

    if (latestPayment && ['Failed', 'Cancelled'].includes(latestPayment.status)) {
      return {
        title: 'Payment Required',
        subtitle: `Your last attempt did not complete. You can retry up to ${MAX_RETRIES} times.`,
        badgeClass: 'bg-rose-100 text-rose-700',
        statusLabel: 'Payment Required',
        action: retryCount < MAX_RETRIES ? ('retry' as const) : null,
      };
    }

    if (booking.status === 'Approved') {
      return {
        title: 'Payment Required',
        subtitle: 'Complete payment to continue to exam scheduling.',
        badgeClass: 'bg-amber-100 text-amber-700',
        statusLabel: 'Payment Required',
        action: 'pay' as const,
      };
    }

    return {
      title: 'Payment Complete',
      subtitle: 'Your booking payment has already been completed.',
      badgeClass: 'bg-emerald-100 text-emerald-700',
      statusLabel: 'Payment Complete',
      action: null as null | 'pay' | 'retry' | 'continue',
    };
  }, [booking, isSuccessful, latestPayment, retryCount]);

  const amountLabel = formatPaymentAmount(DEFAULT_PAYMENT_AMOUNT_CENTS, DEFAULT_PAYMENT_CURRENCY);

  const handlePayNow = async () => {
    if (!booking || booking.status !== 'Approved') return;
    setActionLoading('pay');
    setMessage('');
    try {
      const response = await createPayment(booking.id, {
        amountCents: DEFAULT_PAYMENT_AMOUNT_CENTS,
        currency: DEFAULT_PAYMENT_CURRENCY,
      });
      const refreshed = await getPaymentsForBooking(booking.id);
      setPayments(refreshed);

      if (response.checkout_url && typeof window !== 'undefined') {
        window.location.href = response.checkout_url;
        return;
      }

      setMessage('Payment checkout is being prepared. Please refresh if the redirect is delayed.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to start payment right now.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRetryPayment = async () => {
    if (!booking || booking.status !== 'Approved') return;
    setActionLoading('retry');
    setMessage('');
    try {
      const response = await retryPayment(booking.id);
      const refreshed = await getPaymentsForBooking(booking.id);
      setPayments(refreshed);

      if (response.checkout_url && typeof window !== 'undefined') {
        window.location.href = response.checkout_url;
        return;
      }

      setMessage('Retry created. If checkout redirect is available, it will open automatically when the backend provides it.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to retry payment right now.');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <main className="space-y-6 md:space-y-8">
        <div className="rounded-3xl bg-white p-6 md:p-8 border border-slate-100 animate-pulse">
          <div className="h-5 w-44 rounded bg-slate-100 mb-4" />
          <div className="h-4 w-72 rounded bg-slate-100 mb-2" />
          <div className="h-4 w-56 rounded bg-slate-100" />
        </div>
      </main>
    );
  }

  return (
    <main className="space-y-6 md:space-y-8">
      <div className="max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600 mb-3">{t('payments')}</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1F2937]">Payment</h1>
      </div>

      {message && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 shadow-sm">
          {message}
        </div>
      )}

      {!booking ? (
        <Card>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600 mb-2">{paymentState.title}</p>
              <h2 className="text-2xl font-black text-blue-950">No approved booking yet</h2>
              <p className="mt-2 text-sm text-slate-500 max-w-2xl">
                Your payment area appears once your institution approves a booking request.
              </p>
            </div>
            <Link href="/candidate/booking" className="inline-flex w-fit rounded-full bg-blue-900 px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-blue-800">
              Back to Booking
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600 mb-2">{paymentState.title}</p>
                <h2 className="text-2xl font-black text-blue-950">{booking.institutionName || booking.institution}</h2>
                <p className="mt-2 text-sm text-slate-500 max-w-2xl">{paymentState.subtitle}</p>
              </div>
              <span className={["inline-flex items-center rounded-full px-3 py-1 text-xs font-bold", paymentState.badgeClass].join(" ")}>{paymentState.statusLabel}</span>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <InfoRow label="Institution" value={booking.institutionName || booking.institution} />
              <InfoRow label="Category" value={booking.licenseCategory} />
              <InfoRow label="Amount" value={amountLabel} />
              <InfoRow label="Status" value={paymentState.statusLabel} />
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              {paymentState.action === 'pay' && (
                <Button type="button" onClick={() => void handlePayNow()} disabled={actionLoading !== null || paymentLoading} className="sm:w-auto">
                  {actionLoading === 'pay' ? 'Opening checkout…' : 'Pay Now'}
                </Button>
              )}
              {paymentState.action === 'retry' && (
                <Button type="button" variant="secondary" onClick={() => void handleRetryPayment()} disabled={actionLoading !== null || paymentLoading} className="sm:w-auto">
                  {actionLoading === 'retry' ? 'Retrying…' : 'Retry Payment'}
                </Button>
              )}
              {paymentState.action === 'continue' && (
                <Link href="/candidate/exams" className="inline-flex items-center justify-center rounded-xl bg-blue-900 px-4 py-3 text-sm font-bold text-white shadow-md transition hover:bg-blue-800 sm:w-auto">
                  Continue to Exams
                </Link>
              )}
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600 mb-2">Payment History</p>
                <h3 className="text-lg font-bold text-slate-800">Attempts and receipts</h3>
              </div>
              {paymentLoading && <span className="text-xs font-semibold text-slate-400">Refreshing...</span>}
            </div>
            <PaymentHistory bookingId={booking.id} payments={payments} loading={paymentLoading} />
          </Card>
        </div>
      )}
    </main>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl bg-slate-50/70 p-4">
      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</span>
      <span className="text-sm font-bold text-slate-800 text-right">{value}</span>
    </div>
  );
}

function formatPaymentAmount(amountCents: number, currency: string) {
  return `${currency} ${(amountCents / 100).toFixed(2)}`;
}
