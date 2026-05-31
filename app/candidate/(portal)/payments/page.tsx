"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import PaymentHistory from "@/components/PaymentHistory";
import {
  DEFAULT_PAYMENT_AMOUNT_CENTS,
  DEFAULT_PAYMENT_CURRENCY,
  getPaymentsForBooking,
  initiatePayment,
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
  const latestStatus = latestPayment?.status ?? (booking?.status === 'Approved' ? 'Required' : 'Unavailable');
  const retryCount = Math.max(0, payments.length - 1);
  const canPayNow = Boolean(booking && booking.status === 'Approved' && (!latestPayment || ['Failed', 'Cancelled'].includes(latestPayment.status)));
  const canRetry = Boolean(
    booking &&
      booking.status === 'Approved' &&
      latestPayment &&
      ['Failed', 'Cancelled'].includes(latestPayment.status) &&
      retryCount < MAX_RETRIES
  );
  const isSuccessful = latestStatus === 'Succeeded';

  const paymentSummary = useMemo(() => {
    if (!booking) {
      return {
        title: 'No approved booking yet',
        subtitle: 'Your payment workspace appears after the institution approves your booking request.',
        badgeClass: 'bg-slate-100 text-slate-700',
      };
    }

    if (booking.status !== 'Approved') {
      return {
        title: 'Waiting for approval',
        subtitle: 'The institution must approve your booking before payment can begin.',
        badgeClass: booking.status === 'Rejected' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700',
      };
    }

    if (isSuccessful) {
      return {
        title: 'Payment Successful',
        subtitle: 'Payment is complete. Continue to exam scheduling and the rest of the workflow.',
        badgeClass: 'bg-emerald-100 text-emerald-700',
      };
    }

    if (latestStatus === 'Failed' || latestStatus === 'Cancelled') {
      return {
        title: 'Payment Needs Retry',
        subtitle: `Your last attempt did not complete. You can retry up to ${MAX_RETRIES} times.`,
        badgeClass: 'bg-rose-100 text-rose-700',
      };
    }

    if (latestStatus === 'Pending' || latestStatus === 'Initiated') {
      return {
        title: 'Payment Pending',
        subtitle: 'Your checkout is in progress. Finish the payment to continue.',
        badgeClass: 'bg-sky-100 text-sky-700',
      };
    }

    return {
      title: 'Payment Required',
      subtitle: 'Complete payment to unlock exam scheduling and the next steps.',
      badgeClass: 'bg-amber-100 text-amber-700',
    };
  }, [booking, isSuccessful, latestStatus]);

  const handlePayNow = async () => {
    if (!booking || booking.status !== 'Approved') return;
    setActionLoading('pay');
    setMessage('');
    try {
      const response = await initiatePayment(booking.id, {
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
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1F2937]">Payment workspace</h1>
        <p className="mt-3 text-[#4B5563] leading-relaxed">
          Complete payment after booking approval, then continue toward exam scheduling, test results, and license pickup.
        </p>
      </div>

      <div className="rounded-2xl border border-blue-100 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
        Book Test → Institution Approval → Payment Required → Payment Successful → Exam Scheduling → Test Result → License Pickup Notification
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
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600 mb-2">Payment Required</p>
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
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600 mb-2">Payment Status</p>
                  <h2 className="text-2xl font-black text-blue-950">{paymentSummary.title}</h2>
                  <p className="mt-2 text-sm text-slate-500 max-w-2xl">{paymentSummary.subtitle}</p>
                </div>
                <span className={["inline-flex items-center rounded-full px-3 py-1 text-xs font-bold", paymentSummary.badgeClass].join(" ")}>{latestStatus}</span>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl bg-slate-50/70 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Booking information</p>
                  <p className="text-sm font-bold text-slate-800">{booking.institutionName || booking.institution}</p>
                  <p className="mt-1 text-xs text-slate-500">{booking.licenseCategory} • {booking.preferredDate}</p>
                </div>
                <div className="rounded-2xl bg-slate-50/70 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Amount</p>
                  <p className="text-sm font-bold text-slate-800">{formatPaymentAmount(DEFAULT_PAYMENT_AMOUNT_CENTS, DEFAULT_PAYMENT_CURRENCY)}</p>
                  <p className="mt-1 text-xs text-slate-500">Registration + exam fee</p>
                </div>
                <div className="rounded-2xl bg-slate-50/70 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Payment status</p>
                  <p className="text-sm font-bold text-slate-800">{latestPayment ? latestPayment.status : 'Required'}</p>
                  <p className="mt-1 text-xs text-slate-500">Retry count: {retryCount}/{MAX_RETRIES}</p>
                </div>
                <div className="rounded-2xl bg-slate-50/70 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Next step</p>
                  <p className="text-sm font-bold text-slate-800">
                    {isSuccessful ? 'Exam scheduling' : 'Complete payment'}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{isSuccessful ? 'You can continue to exam scheduling.' : 'Finish payment to unlock the next stage.'}</p>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                {canPayNow && (
                  <Button type="button" onClick={() => void handlePayNow()} disabled={actionLoading !== null || paymentLoading} className="sm:w-auto">
                    {actionLoading === 'pay' ? 'Processing...' : 'Pay Now'}
                  </Button>
                )}
                {canRetry && (
                  <Button type="button" variant="secondary" onClick={() => void handleRetryPayment()} disabled={actionLoading !== null || paymentLoading} className="sm:w-auto">
                    {actionLoading === 'retry' ? 'Retrying...' : 'Retry Payment'}
                  </Button>
                )}
                {!canPayNow && !canRetry && booking.status === 'Approved' && !isSuccessful && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    Payment is currently pending or already completed. Refresh to see the latest status.
                  </div>
                )}
                {isSuccessful && (
                  <Link href="/candidate/exams" className="inline-flex items-center justify-center rounded-xl bg-blue-900 px-4 py-3 text-sm font-bold text-white shadow-md transition hover:bg-blue-800">
                    Continue to Exams
                  </Link>
                )}
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between gap-4 mb-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600 mb-2">Payment History</p>
                  <h3 className="text-lg font-bold text-slate-800">History and attempts</h3>
                </div>
                {paymentLoading && <span className="text-xs font-semibold text-slate-400">Refreshing...</span>}
              </div>
              <PaymentHistory bookingId={booking.id} payments={payments} loading={paymentLoading} />
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600 mb-3">Booking information</p>
              <div className="space-y-3 text-sm">
                <InfoRow label="Institution" value={booking.institutionName || booking.institution} />
                <InfoRow label="License category" value={booking.licenseCategory} />
                <InfoRow label="Preferred date" value={booking.preferredDate} />
                <InfoRow label="Preferred session" value={booking.preferredSession} />
                <InfoRow label="Booking status" value={booking.status} />
              </div>
            </Card>

            <Card>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600 mb-3">Payment rules</p>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>• Retry is available only when the latest attempt failed or was cancelled.</li>
                <li>• Retry stops after {MAX_RETRIES} attempts.</li>
                <li>• Checkout uses the URL returned by the payment service.</li>
                <li>• Payment success moves the workflow to exam scheduling.</li>
              </ul>
            </Card>
          </div>
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
