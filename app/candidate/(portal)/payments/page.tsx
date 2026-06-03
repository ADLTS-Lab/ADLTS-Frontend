"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  ButtonLink,
  Card,
  CardHeader,
  DataTable,
  EmptyState,
  Input,
  PageContainer,
  PageHeader,
  StatBlock,
  StatusBadge,
  ui,
  type DataTableColumn,
} from "@/app/components/ui";
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

  const paymentColumns: Array<DataTableColumn<Payment>> = [
    {
      key: "provider",
      header: "Provider",
      cell: (payment) => payment.provider ?? "Local",
    },
    {
      key: "amount",
      header: "Amount",
      cell: (payment) => formatAmount(payment.amountCents, payment.currency),
    },
    {
      key: "status",
      header: "Status",
      cell: (payment) => <StatusBadge status={payment.status} />,
    },
    {
      key: "created",
      header: "Created",
      cell: (payment) => new Date(payment.createdAt).toLocaleString(),
    },
  ];

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

      const completed = await completePaymentCheckout(booking.id, initiated);
      const refreshed = await getPaymentsForBooking(booking.id);
      setPayments(refreshed);

      if (completed.status === "Succeeded" || refreshed[0]?.status === "Succeeded") {
        router.push(`/candidate/booking?payment=success&bookingId=${encodeURIComponent(booking.id)}`);
        return;
      }

      setSuccess("Checkout opened. Return here after you finish payment.");
    } catch (payError) {
      setError(payError instanceof Error ? payError.message : "Payment could not be completed. Retry payment or contact support with your booking reference.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <Card padding="lg" className="animate-pulse space-y-4">
          <div className="h-5 w-32 rounded-[6px] bg-[var(--surface-2)]" />
          <div className="h-9 w-64 rounded-[6px] bg-[var(--surface-2)]" />
          <div className="h-28 rounded-[8px] bg-[var(--surface-2)]" />
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer width="wide" className="space-y-6">
      <PageHeader
        title="Payment"
        description="Complete payment after your institution approves the booking request."
        action={
          <ButtonLink href="/candidate/booking" variant="outline">
            View booking status
          </ButtonLink>
        }
      />

      {error ? <Alert variant="error">{error}</Alert> : null}
      {success ? <Alert variant="info">{success}</Alert> : null}

      {!booking ? (
        <Card padding="lg">
          <EmptyState
            title="No booking found"
            description="Submit and receive approval for a booking before payment is available."
            action={
              <ButtonLink href="/candidate/booking" variant="primary">
                Submit booking request
              </ButtonLink>
            }
            className="border-0 bg-transparent"
          />
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <Card padding="lg">
              <CardHeader
                title="Booking summary"
                description={`Payment is tied to booking ${booking.id}.`}
                action={<StatusBadge status={booking.status} />}
              />
              <div className="grid gap-3 md:grid-cols-2">
                <SummaryItem label="Institution" value={booking.institutionName || booking.institution || "-"} />
                <SummaryItem label="License category" value={booking.licenseCategory} />
                <SummaryItem label="Exam date" value={booking.preferredDate || "-"} />
                <SummaryItem label="Session" value={booking.preferredSession || "-"} />
              </div>
            </Card>

            <Card padding="lg">
              <CardHeader title="Payment history" description="Payment history for this booking appears after the backend returns records." />
              <DataTable
                columns={paymentColumns}
                data={payments}
                getRowKey={(payment) => payment.id}
                emptyTitle="No payments"
                emptyDescription="No payment history for this booking yet."
              />
            </Card>
          </div>

          <aside className="space-y-6">
            <Card padding="md">
              <CardHeader title="Amount due" />
              <StatBlock label="Payment amount" value={amountLabel} />
            </Card>

            {paymentSucceeded ? (
              <Card padding="md">
                <CardHeader title="Payment complete" />
                <p className="text-[14px] leading-6 text-[var(--text-secondary)]">
                  Payment is complete for booking {booking.id}. Return to booking status for scheduling updates.
                </p>
                <ButtonLink href={`/candidate/booking?bookingId=${encodeURIComponent(booking.id)}`} variant="primary" fullWidth className="mt-4">
                  View booking status
                </ButtonLink>
              </Card>
            ) : booking.status === "Pending" ? (
              <Card padding="md">
                <CardHeader title="Awaiting approval" />
                <p className="text-[14px] leading-6 text-[var(--text-secondary)]">
                  Payment opens after {booking.institutionName || booking.institution} approves your booking request.
                </p>
                <ButtonLink href="/candidate/booking" variant="secondary" fullWidth className="mt-4">
                  Back to booking
                </ButtonLink>
              </Card>
            ) : (
              <Card padding="md">
                <CardHeader title="Payment action" description={getPaymentActionDescription(booking.status)} />
                {canPay ? (
                  <div className="space-y-4">
                    <Input label="Amount" value={amountLabel} readOnly disabled />
                    <Button type="button" onClick={() => void handlePay()} disabled={submitting} state={submitting ? { loading: true } : undefined} fullWidth>
                      {submitting ? "Processing..." : isRetry ? "Retry payment" : "Pay now"}
                    </Button>
                  </div>
                ) : (
                  <Alert variant="info">
                    Payment is not available for the current booking status: {booking.status}.
                  </Alert>
                )}
              </Card>
            )}

            <Card padding="md" variant="soft">
              <p className={`${ui.statLabel} mb-2`}>Help</p>
              <p className="text-[14px] leading-6 text-[var(--text-secondary)]">
                If the problem continues, contact support with your booking reference.
              </p>
              <ButtonLink href="/contact" variant="outline" fullWidth className="mt-4">
                Contact ADLTS support
              </ButtonLink>
            </Card>
          </aside>
        </div>
      )}
    </PageContainer>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <Card padding="sm" variant="soft">
      <StatBlock label={label} value={value || "-"} />
    </Card>
  );
}

function getPaymentActionDescription(status: string) {
  if (status === "Approved") return "Payment becomes available after approval.";
  if (status === "Payment Pending") return "Payment is required or in progress before scheduling can continue.";
  return "Payment is not available for the current booking status.";
}
