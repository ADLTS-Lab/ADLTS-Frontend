"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Button, ButtonLink, Card, CardHeader, Input, PageContainer, PageHeader } from "@/app/components/ui";
import { getAllBookings, getBookingById, type BookingRequest } from "@/services/booking.service";
import {
  completePaymentCheckout,
  createPayment,
  DEFAULT_PAYMENT_AMOUNT_CENTS,
  DEFAULT_PAYMENT_CURRENCY,
  getPaymentsForBooking,
  resolvePaymentAmountCents,
  retryPayment,
  type Payment,
} from "@/services/payment.service";
import { useAuthStore } from "@/store/authStore";

const ENABLE_LOCAL_DEBUG = process.env.NEXT_PUBLIC_ALLOW_LOCAL_FALLBACK === 'true';

const PAYABLE_BOOKING_STATUSES = new Set(["Approved", "Payment Pending"]);

function formatAmount(amountCents: number, currency: string) {
  return `${currency} ${(amountCents / 100).toLocaleString()}`;
}

function pickPayableBooking(bookings: BookingRequest[], email: string | undefined, bookingId?: string | null) {
  const mine = email
    ? bookings.filter((item) => item.candidateDetails?.email?.toLowerCase() === email.toLowerCase())
    : bookings;

  if (bookingId) {
    const match = mine.find((item) => item.id === bookingId);
    if (match) return match;
  }

  return (
    mine.find((item) => PAYABLE_BOOKING_STATUSES.has(item.status)) ??
    mine.find((item) => item.status === "Scheduled") ??
    mine[0] ??
    null
  );
}

export default function CandidatePaymentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingIdParam = searchParams.get("bookingId");
  const { user } = useAuthStore();

  const [booking, setBooking] = useState<BookingRequest | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      let resolvedBooking: BookingRequest | null = null;

      if (bookingIdParam) {
        resolvedBooking = await getBookingById(bookingIdParam);
      }

      if (!resolvedBooking) {
        const allBookings = await getAllBookings();
        resolvedBooking = pickPayableBooking(allBookings, user?.email, bookingIdParam);
      }

      setBooking(resolvedBooking);

      if (!resolvedBooking) {
        setPayments([]);
        return;
      }

      const bookingPayments = await getPaymentsForBooking(resolvedBooking.id);
      setPayments(bookingPayments);

      // #region agent log
      if (ENABLE_LOCAL_DEBUG) {
        fetch("http://127.0.0.1:7485/ingest/750002e8-fc34-4f4c-aec9-03b23cf457b3", {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "30f368" },
          body: JSON.stringify({
            sessionId: "30f368",
            runId: "payment-flow",
            hypothesisId: "H1",
            location: "payments/page.tsx:loadData",
            message: "payment page loaded",
            data: {
              bookingId: resolvedBooking.id,
              status: resolvedBooking.status,
              paymentCount: bookingPayments.length,
              amountCents: resolvePaymentAmountCents(bookingPayments),
            },
            timestamp: Date.now(),
          }),
        }).catch(() => {});
      }
      // #endregion
    } catch (loadError) {
      setBooking(null);
      setPayments([]);
      setError(loadError instanceof Error ? loadError.message : "Unable to load payment details.");
    } finally {
      setLoading(false);
    }
  }, [bookingIdParam, user?.email]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const latestPayment = payments[0] ?? null;
  const paymentSucceeded = latestPayment?.status === "Succeeded" || booking?.status === "Scheduled";
  const amountCents = useMemo(() => resolvePaymentAmountCents(payments), [payments]);
  const amountLabel = formatAmount(amountCents || DEFAULT_PAYMENT_AMOUNT_CENTS, DEFAULT_PAYMENT_CURRENCY);
  const canPay =
    Boolean(booking) &&
    PAYABLE_BOOKING_STATUSES.has(booking?.status ?? "") &&
    !paymentSucceeded &&
    !submitting;
  const isRetry = latestPayment?.status === "Failed" || latestPayment?.status === "Cancelled";

  const handlePay = async () => {
    if (!booking || !canPay) return;

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const initiated = isRetry
        ? await retryPayment(booking.id)
        : await createPayment(booking.id, {
            amountCents: amountCents || DEFAULT_PAYMENT_AMOUNT_CENTS,
            currency: DEFAULT_PAYMENT_CURRENCY,
            provider: "chapa",
            metadata: { bookingId: booking.id, institutionId: booking.institutionId },
          });

      // #region agent log
      if (ENABLE_LOCAL_DEBUG) {
        fetch("http://127.0.0.1:7485/ingest/750002e8-fc34-4f4c-aec9-03b23cf457b3", {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "30f368" },
          body: JSON.stringify({
            sessionId: "30f368",
            runId: "payment-flow",
            hypothesisId: "H2",
            location: "payments/page.tsx:handlePay",
            message: "payment initiated",
            data: {
              paymentId: initiated.id,
              providerRef: initiated.providerRef,
              checkoutUrl: initiated.checkout_url,
            },
            timestamp: Date.now(),
          }),
        }).catch(() => {});
      }
      // #endregion

      const completed = await completePaymentCheckout(booking.id, initiated);
      const refreshed = await getPaymentsForBooking(booking.id);
      setPayments(refreshed);

      if (completed.status === "Succeeded" || refreshed[0]?.status === "Succeeded") {
        // #region agent log
        if (ENABLE_LOCAL_DEBUG) {
          fetch("http://127.0.0.1:7485/ingest/750002e8-fc34-4f4c-aec9-03b23cf457b3", {
            method: "POST",
            headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "30f368" },
            body: JSON.stringify({
              sessionId: "30f368",
              runId: "payment-flow",
              hypothesisId: "H3",
              location: "payments/page.tsx:handlePay",
              message: "payment succeeded redirecting",
              data: { bookingId: booking.id },
              timestamp: Date.now(),
            }),
          }).catch(() => {});
        }
        // #endregion

        router.push(`/candidate/booking?payment=success&bookingId=${encodeURIComponent(booking.id)}`);
        return;
      }

      setSuccess("Checkout opened. Return here after you finish payment.");
    } catch (payError) {
      setError(payError instanceof Error ? payError.message : "Payment could not be completed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <Card padding="lg" className="animate-pulse space-y-4">
          <div className="h-4 w-32 rounded bg-slate-100" />
          <div className="h-8 w-64 rounded bg-slate-100" />
          <div className="h-24 rounded-lg bg-slate-100" />
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader eyebrow="Checkout" title="Payment" />

      {error ? <Alert variant="error">{error}</Alert> : null}
      {success ? <Alert variant="info">{success}</Alert> : null}

      {!booking ? (
        <Card padding="lg">
          <CardHeader title="No booking found" />
          <p className="text-sm text-slate-600">Submit and get a booking approved before paying.</p>
          <ButtonLink href="/candidate/booking" variant="primary" className="mt-4">
            Go to booking
          </ButtonLink>
        </Card>
      ) : paymentSucceeded ? (
        <Card padding="lg">
          <CardHeader title="Payment complete" />
          <p className="text-sm text-slate-600">
            {booking.institutionName || booking.institution} · {amountLabel}
          </p>
          <ButtonLink href={`/candidate/booking?bookingId=${encodeURIComponent(booking.id)}`} variant="primary" className="mt-4">
            View booking status
          </ButtonLink>
        </Card>
      ) : booking.status === "Pending" ? (
        <Card padding="lg">
          <CardHeader title="Awaiting approval" />
          <p className="text-sm text-slate-600">
            {booking.institutionName || booking.institution} must approve your request before payment opens.
          </p>
          <ButtonLink href="/candidate/booking" variant="secondary" className="mt-4">
            Back to booking
          </ButtonLink>
        </Card>
      ) : (
        <Card padding="lg">
          <CardHeader
            title={booking.institutionName || booking.institution}
            description={`Ref ${booking.id}`}
          />

          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            <SummaryItem label="Category" value={booking.licenseCategory} />
            <SummaryItem label="Exam date" value={booking.preferredDate || "—"} />
            <SummaryItem label="Session" value={booking.preferredSession || "—"} />
            <SummaryItem label="Amount due" value={amountLabel} />
          </dl>

          {canPay ? (
            <div className="mt-6 space-y-4 border-t border-slate-100 pt-6">
              <Input label="Amount" value={amountLabel} readOnly disabled />
              <Button type="button" onClick={() => void handlePay()} disabled={submitting} fullWidth>
                {submitting ? "Processing…" : isRetry ? "Retry payment" : "Pay now"}
              </Button>
            </div>
          ) : (
            <Alert variant="info" className="mt-6">
              Payment is not available for this booking status ({booking.status}).
            </Alert>
          )}

          <Link href="/candidate/booking" className="mt-4 inline-block text-sm font-medium text-blue-800 hover:text-blue-900">
            ← Back to booking
          </Link>
        </Card>
      )}
    </PageContainer>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-slate-900">{value}</dd>
    </div>
  );
}
