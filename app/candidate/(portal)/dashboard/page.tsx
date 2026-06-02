"use client";

import Link from "next/link";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { getCurrentUser, type User } from "@/services/auth.service";
import { extractApiError } from "@/services/api-utils";
import { getAllBookings, getStoredBookingSnapshot, isActiveBookingStatus, subscribeToBookingChanges, type BookingRequest, type BookingStatus } from "@/services/booking.service";
import { DEFAULT_PAYMENT_AMOUNT_CENTS, DEFAULT_PAYMENT_CURRENCY, getPaymentsForBooking, type Payment } from "@/services/payment.service";
import { Alert, ButtonLink, Card, CardHeader, EmptyState, PageContainer, PageHeader, StatusBadge, ui } from "@/app/components/ui";

const LICENSE_CATEGORIES = [
  { code: "A", name: "Motorcycle", description: "For two-wheel motorbikes and light motorcycle test candidates." },
  { code: "B", name: "Light Vehicle", description: "For standard private vehicles and everyday driving tests." },
  { code: "C", name: "Public Service Vehicle", description: "For passenger transport and service vehicle categories." },
  { code: "D", name: "Heavy Vehicle", description: "For larger vehicles that require advanced control." },
] as const;

export default function CandidateDashboard() {
  const { user: storedUser, isAuthenticated, setUser } = useAuthStore();
  const [profile, setProfile] = useState<User | null>(storedUser);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [error, setError] = useState("");
  const [payments, setPayments] = useState<Payment[]>([]);
  const didInitRef = useRef(false);

  function selectCurrentBooking(items: BookingRequest[]) {
    const sortedItems = [...items].sort((left, right) => {
      const leftUpdated = new Date(left.updatedAt || left.createdAt).getTime();
      const rightUpdated = new Date(right.updatedAt || right.createdAt).getTime();
      return rightUpdated - leftUpdated;
    });

    return sortedItems.find((item) => isActiveBookingStatus(item.status)) ?? sortedItems[0] ?? null;
  }

  const [booking, setBooking] = useState<BookingRequest | null>(() => {
    const currentEmail = String(storedUser?.email || "").toLowerCase();
    const currentUserId = storedUser?.id;
    const snapshot = getStoredBookingSnapshot();
    const initialBookings = snapshot.filter((item) => {
      const bookingCandidateId = item.candidateId || item.candidateDetails?.candidateId;
      const bookingEmail = item.candidateDetails?.email?.toLowerCase();

      if (currentUserId && bookingCandidateId === currentUserId) return true;
      if (currentEmail && bookingEmail === currentEmail) return true;
      return false;
    });

    return selectCurrentBooking(initialBookings);
  });

  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;

    let isMounted = true;

    const loadBooking = async (candidateEmail?: string) => {
      try {
        const currentUserId = storedUser?.id;
        const currentEmail = String(candidateEmail || storedUser?.email || "").toLowerCase();

        const snapshot = getStoredBookingSnapshot();
        const snapshotBooking = snapshot.find((item) => {
          const bookingCandidateId = item.candidateId || item.candidateDetails?.candidateId;
          const bookingEmail = item.candidateDetails?.email?.toLowerCase();

          if (currentUserId && bookingCandidateId === currentUserId) return true;
          if (currentEmail && bookingEmail === currentEmail) return true;
          return false;
        });

        const bookings = await getAllBookings();
        if (!isMounted) return;

        const mine = bookings.filter((item) => {
          const bookingCandidateId = item.candidateId || item.candidateDetails?.candidateId;
          const bookingEmail = item.candidateDetails?.email?.toLowerCase();

          if (currentUserId && bookingCandidateId === currentUserId) return true;
          if (currentEmail && bookingEmail === currentEmail) return true;
          return false;
        });

        const currentBooking = selectCurrentBooking(mine);
        setBooking((current) => currentBooking ?? snapshotBooking ?? current ?? null);
      } catch (err) {
        console.error(err);
      }
    };

    const loadProfileOnce = async () => {
      if (storedUser) {
        setIsProfileLoading(false);
        return;
      }

      setIsProfileLoading(true);
      try {
        const currentUser = await getCurrentUser();
        if (!isMounted) return;

        if (currentUser) {
          setProfile(currentUser);
          setUser(currentUser);
          await loadBooking(currentUser.email);
        }
      } catch (err) {
        if (isMounted) {
          setError(extractApiError(err, "Unable to load candidate profile and exam data right now."));
        }
      } finally {
        if (isMounted) {
          setIsProfileLoading(false);
        }
      }
    };

    void loadBooking();
    void loadProfileOnce();

    const unsubscribeBookings = subscribeToBookingChanges(() => {
      void loadBooking();
    });

    return () => {
      isMounted = false;
      unsubscribeBookings();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadPayments = async () => {
      if (!booking || booking.status !== 'Approved') {
        setPayments([]);
        return;
      }

      try {
        const bookingPayments = await getPaymentsForBooking(booking.id);
        if (!isMounted) return;
        setPayments(bookingPayments);
      } catch (error) {
        if (isMounted) {
          console.error('Failed to load payment history', error);
          setPayments([]);
        }
      }
    };

    void loadPayments();

    return () => {
      isMounted = false;
    };
  }, [booking]);

  useEffect(() => {
    if (!profile && storedUser) setProfile(storedUser);
  }, [profile, storedUser]);

  const candidateName = profile?.name || storedUser?.name || 'Candidate';
  const latestPayment = payments[0] ?? null;
  const paymentSuccessful = latestPayment?.status === 'Succeeded';
  const hasBooking = Boolean(booking);
  const bookingStatusLabel = getBookingStatusLabel(booking?.status, paymentSuccessful);
  const nextAction = getPrimaryNextAction(booking?.status, paymentSuccessful, booking?.id);
  const progressSteps = getBookingProgressSteps(booking?.status, paymentSuccessful);

  if ((!isAuthenticated && typeof window === 'undefined') || isProfileLoading) {
    return (
      <PageContainer width="wide">
        <Card padding="lg" className="animate-pulse rounded-md">
          <div className="mb-6 h-4 w-44 rounded bg-[var(--adlts-surface-soft)]" />
          <div className="mb-4 h-8 w-72 max-w-full rounded bg-[var(--adlts-surface-soft)]" />
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="h-20 rounded-md bg-[var(--adlts-surface-soft)]" />
            <div className="h-20 rounded-md bg-[var(--adlts-surface-soft)]" />
            <div className="h-20 rounded-md bg-[var(--adlts-surface-soft)]" />
          </div>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer width="wide">
      {error ? <Alert variant="error">{error}</Alert> : null}

      <Card padding="lg" variant="surface">
        <PageHeader
          eyebrow="Candidate portal"
          title={`Welcome, ${candidateName}`}
          description="Track your booking lifecycle, payments, and exam progress in one place."
        />

        <div className="mt-6 space-y-5">
          {!hasBooking ? (
            <EmptyState
              title="No active booking"
              description="Submit a booking request to begin your application journey. You can track each stage from approval to result publication."
              action={
                <ButtonLink href="/candidate/booking" variant="primary">
                  Start booking request
                </ButtonLink>
              }
              className="!items-start !text-left"
            />
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-md border border-[var(--adlts-border)] bg-[var(--adlts-surface-soft)] p-4">
                <p className={ui.statLabel}>Booking status</p>
                <div className="mt-2">
                  <StatusBadge status={booking?.status ?? undefined} />
                </div>
              </div>
              <StatCell label="Institution" value={booking?.institutionName || booking?.institution || "—"} />
              <StatCell label="Booking reference" value={<span className={ui.mono}>{booking?.id || "—"}</span>} />
              <div className="rounded-md border border-[var(--adlts-border)] bg-[var(--adlts-surface-soft)] p-4">
                <p className={ui.statLabel}>Next action</p>
                <p className={`${ui.statValue} mt-1`}>{nextAction.label}</p>
                <p className="mt-1 text-sm text-[var(--adlts-ink-600)]">{nextAction.description}</p>
                <Link
                  href={nextAction.href}
                  className="mt-2 inline-flex text-sm font-medium text-[var(--adlts-blue-700)] transition-colors hover:text-[var(--adlts-blue-800)]"
                >
                  {nextAction.buttonLabel} →
                </Link>
              </div>
            </div>
          )}
        </div>
      </Card>

      {hasBooking ? (
        <Card padding="lg">
          <CardHeader title="Where you are in the journey" description="Live status across this application cycle." />
          <div className="flex flex-wrap gap-2">
            {progressSteps.map((step) => (
              <span
                key={step.label}
                className={[
                  "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors",
                  step.state === "complete"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : step.state === "current"
                      ? "border-blue-200 bg-blue-50 text-blue-800"
                      : "border-[var(--adlts-border)] bg-[var(--adlts-surface)] text-[var(--adlts-ink-500)]",
                ].join(" ")}
              >
                <span className="text-xs leading-none" aria-hidden="true">{step.symbol}</span>
                <span>{step.label}</span>
              </span>
            ))}
          </div>
        </Card>
      ) : null}

      <section className="space-y-4">
        <PageHeader
          eyebrow="Available License Categories"
          title="Choose the category that matches your test"
          description="Choose from existing categories and begin your booking from a single place."
          className="!flex-col !items-start"
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {LICENSE_CATEGORIES.map((category) => (
            <Card
              key={category.code}
              padding="md"
              variant="soft"
              className="flex h-full flex-col transition-colors hover:border-[var(--adlts-blue-300)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className={ui.eyebrow}>Category {category.code}</p>
                  <h3 className="mt-2 text-base font-semibold text-[var(--adlts-ink-950)]">{category.name}</h3>
                </div>
                <span className="rounded-md border border-[var(--adlts-border)] bg-[var(--adlts-surface)] px-2 py-0.5 text-xs font-medium text-[var(--adlts-ink-700)]">
                  {category.code}
                </span>
              </div>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-[var(--adlts-ink-600)]">{category.description}</p>
              <ButtonLink href="/candidate/booking" variant="secondary" fullWidth className="mt-5">
                Book This Test
              </ButtonLink>
            </Card>
          ))}
        </div>
      </section>

      <Card padding="md">
        <CardHeader
          title="Quick actions"
          description="Use these links to move between major steps quickly."
        />
        <div className="grid gap-3 sm:grid-cols-3">
          <ButtonLink href="/candidate/booking" variant="outline" className="justify-start">
            Review booking
          </ButtonLink>
          <ButtonLink href="/candidate/exams" variant="outline" className="justify-start">
            View exam results
          </ButtonLink>
          <ButtonLink href="/candidate/profile" variant="outline" className="justify-start">
            Update profile
          </ButtonLink>
        </div>
      </Card>
    </PageContainer>
  );
}

function StatCell({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-md border border-[var(--adlts-border)] bg-[var(--adlts-surface-soft)] p-4">
      <p className={ui.statLabel}>{label}</p>
      <p className={`${ui.statValue} mt-1`}>{value}</p>
    </div>
  );
}

function formatPaymentAmount(amountCents: number, currency: string) {
  return `${currency} ${(amountCents / 100).toFixed(0)}`;
}

function getBookingStatusLabel(status?: BookingStatus | null, paymentSuccessful = false) {
  switch (status) {
    case 'Pending':
      return 'Waiting for institution approval';
    case 'Approved':
      return paymentSuccessful ? 'Payment successful' : 'Payment required';
    case 'Payment Pending':
      return 'Payment required';
    case 'Scheduled':
      return 'Your exam is scheduled';
    case 'Rejected':
    case 'Cancelled':
      return 'Book a new test';
    case 'Completed':
      return 'Results available';
    default:
      return 'No booking yet';
  }
}

function paymentPageHref(bookingId?: string) {
  return bookingId ? `/candidate/payments?bookingId=${encodeURIComponent(bookingId)}` : '/candidate/payments';
}

function getPrimaryNextAction(status?: BookingStatus | null, paymentSuccessful = false, bookingId?: string) {
  if (!status) {
    return {
      label: 'Book a new test',
      description: 'Start a fresh booking request to continue with your application.',
      buttonLabel: 'Book a New Test',
      href: '/candidate/booking',
    };
  }

  switch (status) {
    case 'Pending':
        return {
          label: 'Waiting for institution approval',
          description: 'The institution must review your request before payment becomes available.',
          buttonLabel: 'View Booking',
          href: '/candidate/booking',
        };
    case 'Approved':
      return paymentSuccessful
        ? {
            label: 'Payment successful',
            description: 'Your payment is complete. Review the payment page for details.',
            buttonLabel: 'View Payment',
            href: paymentPageHref(bookingId),
            badgeClass: 'bg-emerald-100 text-emerald-700',
          }
        : {
            label: 'Payment required',
            description: `You owe ${formatPaymentAmount(DEFAULT_PAYMENT_AMOUNT_CENTS, DEFAULT_PAYMENT_CURRENCY)} for this booking.`,
            buttonLabel: 'Pay Now',
            href: paymentPageHref(bookingId),
          };
    case 'Payment Pending':
      return {
        label: 'Payment required',
        description: `You owe ${formatPaymentAmount(DEFAULT_PAYMENT_AMOUNT_CENTS, DEFAULT_PAYMENT_CURRENCY)} for this booking.`,
        buttonLabel: 'Pay Now',
        href: paymentPageHref(bookingId),
      };
    case 'Scheduled':
      return {
        label: 'Your exam is scheduled',
        description: 'Review your booking details while you wait for the test date.',
        buttonLabel: 'View Booking',
        href: '/candidate/booking',
      };
    case 'Completed':
    case 'Rejected':
    case 'Cancelled':
    case 'Expired':
    default:
      return {
        label: 'Book a new test',
        description: 'Your last booking is closed. Start a new request when you are ready.',
        buttonLabel: 'Book a New Test',
        href: '/candidate/booking',
      };
  }
}

function getBookingProgressSteps(status?: BookingStatus | null, paymentSuccessful = false) {
  type StepState = "upcoming" | "current" | "complete";
  type ProgressStep = { label: string; state: StepState; symbol: string };

  const steps: ProgressStep[] = [
    { label: 'Booking Submitted', state: 'upcoming', symbol: '○' },
    { label: 'Institution Approval', state: 'upcoming', symbol: '○' },
    { label: 'Payment', state: 'upcoming', symbol: '○' },
    { label: 'Scheduling', state: 'upcoming', symbol: '○' },
    { label: 'Test', state: 'upcoming', symbol: '○' },
    { label: 'Results', state: 'upcoming', symbol: '○' },
  ];

  if (!status) {
    steps[0] = { label: 'Book a New Test', state: 'current', symbol: '⏳' };
    return steps;
  }

  const setCompleteThrough = (index: number) => {
    for (let i = 0; i <= index; i += 1) {
      steps[i] = { ...steps[i], state: 'complete', symbol: '✓' };
    }
  };

  switch (status) {
    case 'Pending':
      setCompleteThrough(0);
      steps[1] = { ...steps[1], state: 'current', symbol: '⏳' };
      return steps;
    case 'Approved':
    case 'Payment Pending':
      setCompleteThrough(1);
      if (paymentSuccessful) {
        steps[2] = { ...steps[2], state: 'complete', symbol: '✓' };
        steps[3] = { ...steps[3], state: 'current', symbol: '⏳' };
      } else {
        steps[2] = { ...steps[2], state: 'current', symbol: '⏳' };
      }
      return steps;
    case 'Scheduled':
      setCompleteThrough(3);
      steps[4] = { ...steps[4], state: 'current', symbol: '⏳' };
      return steps;
    case 'Completed':
      steps.forEach((step, index) => {
        steps[index] = { ...step, state: 'complete', symbol: '✓' };
      });
      return steps;
    case 'Rejected':
    case 'Cancelled':
    case 'Expired':
      setCompleteThrough(0);
      steps[1] = { ...steps[1], state: 'current', symbol: '⏳' };
      return steps;
    default:
      return steps;
  }
}
