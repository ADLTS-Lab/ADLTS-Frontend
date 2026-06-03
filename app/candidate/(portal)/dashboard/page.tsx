"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { getCurrentUser, type User } from "@/services/auth.service";
import { extractApiError } from "@/services/api-utils";
import {
  getAllBookings,
  getStoredBookingSnapshot,
  isActiveBookingStatus,
  subscribeToBookingChanges,
  type BookingRequest,
  type BookingStatus,
} from "@/services/booking.service";
import {
  DEFAULT_PAYMENT_AMOUNT_CENTS,
  DEFAULT_PAYMENT_CURRENCY,
  getPaymentsForBooking,
  type Payment,
} from "@/services/payment.service";
import {
  Alert,
  ButtonLink,
  Card,
  CardHeader,
  EmptyState,
  PageContainer,
  PageHeader,
  StatBlock,
  StatusBadge,
  StepProgress,
  ui,
} from "@/app/components/ui";

const LICENSE_CATEGORIES = [
  { code: "A", name: "Motorcycle", description: "Motorcycle and two-wheel motorized vehicle testing." },
  { code: "B", name: "Light vehicle", description: "Light vehicle testing for standard private vehicles and everyday driving." },
  { code: "C", name: "Public service vehicle", description: "Public service or passenger vehicle testing, depending on local classification." },
  { code: "D", name: "Heavy vehicle", description: "Heavy vehicle testing requiring advanced control." },
] as const;

const JOURNEY_STEPS = [
  { label: "Submit booking request", description: "Select an active institute, category, date, and session." },
  { label: "Wait for institution review", description: "A pending booking means the institution is reviewing it." },
  { label: "Complete payment", description: "Payment becomes available after approval." },
  { label: "Prepare for the test", description: "Review booking details and wait for exam instructions." },
  { label: "Review results", description: "Exam history shows results when visibility is enabled." },
];

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
      if (!booking || booking.status !== "Approved") {
        setPayments([]);
        return;
      }

      try {
        const bookingPayments = await getPaymentsForBooking(booking.id);
        if (!isMounted) return;
        setPayments(bookingPayments);
      } catch (paymentError) {
        if (isMounted) {
          console.error("Failed to load payment history", paymentError);
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

  const candidateName = profile?.name || storedUser?.name || "Candidate";
  const latestPayment = payments[0] ?? null;
  const paymentSuccessful = latestPayment?.status === "Succeeded";
  const nextAction = getPrimaryNextAction(booking?.status, paymentSuccessful, booking?.id);
  const progressIndex = getProgressIndex(booking?.status, paymentSuccessful);

  if ((!isAuthenticated && typeof window === "undefined") || isProfileLoading) {
    return (
      <PageContainer width="wide">
        <Card padding="lg" className="animate-pulse space-y-5">
          <div className="h-5 w-48 rounded-[6px] bg-[var(--surface-2)]" />
          <div className="h-9 w-full max-w-[520px] rounded-[6px] bg-[var(--surface-2)]" />
          <div className="grid gap-3 md:grid-cols-3">
            <div className="h-24 rounded-[8px] bg-[var(--surface-2)]" />
            <div className="h-24 rounded-[8px] bg-[var(--surface-2)]" />
            <div className="h-24 rounded-[8px] bg-[var(--surface-2)]" />
          </div>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer width="wide" className="space-y-6">
      {error ? <Alert variant="error">{error}</Alert> : null}

      <PageHeader
        title={`Welcome, ${candidateName}`}
        description="Track your booking lifecycle, payments, and exam progress in one place."
        action={
          <ButtonLink href="/candidate/booking" size="lg">
            Start booking request
          </ButtonLink>
        }
      />

      <Card padding="lg" className="shadow-[var(--shadow-resting)]">
        <CardHeader
          title="Current journey state"
          description={booking ? "Your latest booking status and next required action." : "No active request is currently attached to this account."}
        />

        {!booking ? (
          <EmptyState
            title="No active booking"
            description="Submit a booking request to begin your testing journey. You will be able to track each stage from institution review to result publication."
            action={
              <ButtonLink href="/candidate/booking" variant="primary">
                Start booking request
              </ButtonLink>
            }
            className="items-start text-left"
          />
        ) : (
          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Card padding="sm" variant="soft">
                <p className={ui.statLabel}>Booking status</p>
                <div className="mt-2">
                  <StatusBadge status={booking.status} />
                </div>
              </Card>
              <Card padding="sm" variant="soft">
                <StatBlock label="Institution" value={booking.institutionName || booking.institution || "-"} />
              </Card>
              <Card padding="sm" variant="soft">
                <StatBlock label="Booking reference" value={booking.id || "-"} />
              </Card>
              <Card padding="sm" variant="soft">
                <p className={ui.statLabel}>Next action</p>
                <p className="mt-1 text-[16px] font-semibold text-[var(--text-primary)]">{nextAction.label}</p>
                <p className="mt-1 text-[13px] leading-5 text-[var(--text-secondary)]">{nextAction.description}</p>
                <Link
                  href={nextAction.href}
                  className="mt-3 inline-flex text-[14px] font-medium text-[var(--accent)] transition-colors hover:text-[var(--accent-hover)]"
                >
                  {nextAction.buttonLabel}
                </Link>
              </Card>
            </div>
          </div>
        )}
      </Card>

      {booking ? (
        <Card padding="lg">
          <CardHeader title="Booking progress timeline" description="Every candidate journey follows a visible path." />
          <StepProgress steps={JOURNEY_STEPS} activeIndex={progressIndex} />
        </Card>
      ) : null}

      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className={ui.sectionTitle}>License categories</h2>
          <p className={ui.sectionLead}>Use the category provided by your training institution or transport authority instructions.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {LICENSE_CATEGORIES.map((category) => (
            <Card key={category.code} padding="md" className="flex h-full flex-col">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className={ui.statLabel}>Category {category.code}</p>
                  <h3 className="mt-2 text-[16px] font-semibold text-[var(--text-primary)]">{category.name}</h3>
                </div>
                <span className="rounded-[6px] border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-[12px] font-medium text-[var(--text-secondary)]">
                  {category.code}
                </span>
              </div>
              <p className="mt-3 flex-1 text-[14px] leading-6 text-[var(--text-secondary)]">{category.description}</p>
              <ButtonLink href="/candidate/booking" variant="secondary" fullWidth className="mt-5">
                Submit booking request
              </ButtonLink>
            </Card>
          ))}
        </div>
      </section>

      <Card padding="md">
        <CardHeader title="Quick actions" description="Use these links to move between major steps quickly." />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <ButtonLink href="/candidate/booking" variant="outline" className="justify-start">
            View booking status
          </ButtonLink>
          <ButtonLink href="/candidate/payments" variant="outline" className="justify-start">
            Pay now
          </ButtonLink>
          <ButtonLink href="/candidate/exams/check-in" variant="outline" className="justify-start">
            Exam check-in
          </ButtonLink>
          <ButtonLink href="/candidate/exams" variant="outline" className="justify-start">
            View exam results
          </ButtonLink>
        </div>
      </Card>
    </PageContainer>
  );
}

function formatPaymentAmount(amountCents: number, currency: string) {
  return `${currency} ${(amountCents / 100).toFixed(0)}`;
}

function paymentPageHref(bookingId?: string) {
  return bookingId ? `/candidate/payments?bookingId=${encodeURIComponent(bookingId)}` : "/candidate/payments";
}

function getPrimaryNextAction(status?: BookingStatus | null, paymentSuccessful = false, bookingId?: string) {
  if (!status) {
    return {
      label: "No active booking",
      description: "Submit a booking request to begin your testing journey.",
      buttonLabel: "Start booking request",
      href: "/candidate/booking",
    };
  }

  switch (status) {
    case "Pending":
      return {
        label: "Waiting for institution approval",
        description: "Your request is waiting for institution approval. Check this page for updates before starting any new request.",
        buttonLabel: "View booking status",
        href: "/candidate/booking",
      };
    case "Approved":
      return paymentSuccessful
        ? {
            label: "Payment complete",
            description: "Payment is complete. Return to booking status for scheduling updates.",
            buttonLabel: "View payment",
            href: paymentPageHref(bookingId),
          }
        : {
            label: "Payment required",
            description: `Your request has been approved. Complete payment to continue toward scheduling. Amount due: ${formatPaymentAmount(DEFAULT_PAYMENT_AMOUNT_CENTS, DEFAULT_PAYMENT_CURRENCY)}.`,
            buttonLabel: "Pay now",
            href: paymentPageHref(bookingId),
          };
    case "Payment Pending":
      return {
        label: "Payment required",
        description: "Payment is required before scheduling can continue.",
        buttonLabel: "Pay now",
        href: paymentPageHref(bookingId),
      };
    case "Scheduled":
      return {
        label: "Exam scheduled",
        description: "Your exam is scheduled. Use check-in when the assigned test vehicle is ready.",
        buttonLabel: "Start check-in",
        href: "/candidate/exams/check-in",
      };
    case "Completed":
      return {
        label: "Booking cycle complete",
        description: "Your booking cycle is complete. Review your exam history when results are available.",
        buttonLabel: "View exam results",
        href: "/candidate/exams",
      };
    case "Rejected":
    case "Cancelled":
    case "Expired":
    default:
      return {
        label: "Booking closed",
        description: "This booking is closed. Start a new request when you are ready.",
        buttonLabel: "Start booking request",
        href: "/candidate/booking",
      };
  }
}

function getProgressIndex(status?: BookingStatus | null, paymentSuccessful = false) {
  switch (status) {
    case "Pending":
      return 1;
    case "Approved":
    case "Payment Pending":
      return paymentSuccessful ? 3 : 2;
    case "Scheduled":
      return 3;
    case "Completed":
      return 4;
    case "Rejected":
    case "Cancelled":
    case "Expired":
    default:
      return 0;
  }
}
