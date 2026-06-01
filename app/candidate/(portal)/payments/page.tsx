"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
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

export default function CandidatePaymentsPage() {
  const { user } = useAuthStore();
  const [booking, setBooking] = useState<BookingRequest | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [amountEtb, setAmountEtb] = useState(String(DEFAULT_PAYMENT_AMOUNT_CENTS / 100));

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
          setAmountEtb(String(DEFAULT_PAYMENT_AMOUNT_CENTS / 100));
        }

        if (currentBooking) {
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
        }
      }
    };

    void loadBookingAndPayments();

    return () => {
      mounted = false;
    };
  }, [user?.email]);

  const latestPayment = payments[0] ?? null;
  const paymentSuccessful = latestPayment?.status === 'Succeeded';
  const isRetryFlow = latestPayment?.status === 'Failed' || latestPayment?.status === 'Cancelled';
  const paymentStatusLabel = !booking
    ? 'No booking yet'
    : paymentSuccessful
      ? 'Payment Successful'
      : latestPayment?.status === 'Failed' || latestPayment?.status === 'Cancelled'
        ? 'Payment Required'
        : booking.status === 'Approved'
          ? 'Payment Required'
          : booking.status === 'Pending'
            ? 'Waiting for institution approval'
            : booking.status === 'Scheduled'
              ? 'Exam Scheduled'
              : 'Not available';
  const paymentStatusBadgeClass = !booking
    ? 'bg-slate-100 text-slate-700'
    : paymentSuccessful
      ? 'bg-emerald-100 text-emerald-700'
      : booking.status === 'Approved' || isRetryFlow
        ? 'bg-amber-100 text-amber-700'
        : booking.status === 'Pending'
          ? 'bg-slate-100 text-slate-700'
          : 'bg-indigo-100 text-indigo-700';
  const amountCents = Math.max(0, Math.round(Number(amountEtb || 0) * 100));
  const amountLabel = formatPaymentAmount(amountCents || DEFAULT_PAYMENT_AMOUNT_CENTS, DEFAULT_PAYMENT_CURRENCY);

  const handlePayNow = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!booking || booking.status !== 'Approved') return;

    setIsSubmitting(true);
    setMessage('');

    try {
      const response = isRetryFlow
        ? await retryPayment(booking.id)
        : await createPayment(booking.id, {
            amountCents,
            currency: DEFAULT_PAYMENT_CURRENCY,
            provider: 'chapa',
            metadata: {
              bookingId: booking.id,
              institutionId: booking.institutionId,
            },
          });

      const refreshed = await getPaymentsForBooking(booking.id);
      setPayments(refreshed);

      if (response.checkout_url && typeof window !== 'undefined') {
        window.location.href = response.checkout_url;
        return;
      }

      setMessage('Chapa checkout is being prepared. If the redirect does not open automatically, refresh the page and try again.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to start payment right now.');
    } finally {
      setIsSubmitting(false);
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
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600 mb-3">Payment</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1F2937]">Payment</h1>
      </div>

      {message && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 shadow-sm">
          {message}
        </div>
      )}

      <Card>
        {!booking ? (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600 mb-2">Payment Summary</p>
              <h2 className="text-2xl font-black text-blue-950">No approved booking yet</h2>
              <p className="mt-2 text-sm text-slate-500 max-w-2xl">
                Your payment area appears once your institution approves a booking request.
              </p>
            </div>
            <Link href="/candidate/booking" className="inline-flex w-fit rounded-full bg-blue-900 px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-blue-800">
              Back to Booking
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600 mb-2">Payment Summary</p>
                <h2 className="text-2xl font-black text-blue-950">{booking.institutionName || booking.institution}</h2>
              </div>
              <span className={[
                'inline-flex items-center rounded-full px-3 py-1 text-xs font-bold',
                paymentStatusBadgeClass,
              ].join(' ')}>
                {paymentStatusLabel}
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <InfoRow label="Booking Reference" value={booking.id} />
              <InfoRow label="Institution" value={booking.institutionName || booking.institution} />
              <InfoRow label="Amount" value={amountLabel} />
              <InfoRow label="Payment Status" value={paymentStatusLabel} />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              {paymentSuccessful ? (
                <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
                  <span aria-hidden="true">✓</span>
                  Payment Successful
                </div>
                ) : booking.status === 'Approved' ? (
                  <form onSubmit={(event) => void handlePayNow(event)} className="w-full space-y-4">
                    <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
                      <label className="block">
                        <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Amount (ETB)</span>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={amountEtb}
                          onChange={(event) => setAmountEtb(event.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                        />
                      </label>

                      <Button type="submit" disabled={isSubmitting || amountCents <= 0} className="w-full justify-center sm:w-auto">
                        {isSubmitting ? 'Opening checkout…' : isRetryFlow ? 'Retry with Chapa' : 'Pay with Chapa'}
                      </Button>
                    </div>

                    <p className="text-xs text-slate-500">
                      This will open the Chapa checkout endpoint and return you with the payment result.
                    </p>
                  </form>
              ) : (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  Payment becomes available after the institution approves your booking.
                </div>
              )}
            </div>
          </div>
        )}
      </Card>
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
  return `${currency} ${(amountCents / 100).toFixed(0)}`;
}
