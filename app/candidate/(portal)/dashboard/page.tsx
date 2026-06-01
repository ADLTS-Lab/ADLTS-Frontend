"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { getCurrentUser, type User } from "@/services/auth.service";
import { extractApiError } from "@/services/api-utils";
import { getAllBookings, getStoredBookingSnapshot, isActiveBookingStatus, subscribeToBookingChanges, type BookingRequest, type BookingStatus } from "@/services/booking.service";
import { DEFAULT_PAYMENT_AMOUNT_CENTS, DEFAULT_PAYMENT_CURRENCY, getPaymentsForBooking, type Payment } from "@/services/payment.service";

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
          setError(extractApiError(err, 'Unable to load candidate profile and exam data right now.'));
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
  const nextAction = getPrimaryNextAction(booking?.status, paymentSuccessful);
  const progressSteps = getBookingProgressSteps(booking?.status, paymentSuccessful);

  if ((!isAuthenticated && typeof window === 'undefined') || isProfileLoading) {
    return (
      <main className="space-y-6 md:space-y-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 animate-pulse">
          <div className="h-4 w-44 rounded bg-slate-100 mb-3" />
          <div className="h-7 w-72 rounded bg-slate-100 mb-4" />
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="h-20 rounded-2xl bg-slate-100" />
            <div className="h-20 rounded-2xl bg-slate-100" />
            <div className="h-20 rounded-2xl bg-slate-100" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="space-y-6 md:space-y-8">
      {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600 mb-2">Candidate Status</p>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{candidateName}</h1>
            </div>

            {!hasBooking ? (
              <div className="max-w-2xl rounded-2xl border border-blue-100 bg-blue-50/60 p-5 md:p-6">
                <p className="text-lg font-bold text-slate-900">Welcome back, Candidate</p>
                <p className="mt-2 text-sm font-medium text-slate-700">You do not currently have an active booking.</p>
                <p className="mt-3 text-sm text-slate-600">To begin your driving license application, select a license category and submit a booking request.</p>
                <Link href="/candidate/booking" className="mt-5 inline-flex rounded-xl bg-blue-900 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-800">
                  Book a Test
                </Link>
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Booking Status</p>
                  <p className="text-sm font-bold text-slate-900">{bookingStatusLabel}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Institution</p>
                  <p className="text-sm font-bold text-slate-900">{booking?.institutionName || booking?.institution}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Booking Reference</p>
                  <p className="text-sm font-bold text-slate-900">{booking?.id}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Next Action</p>
                  <p className="text-sm font-bold text-slate-900">{nextAction.label}</p>
                  <Link href={nextAction.href} className="mt-3 inline-flex text-sm font-bold text-blue-700 hover:text-blue-800">
                    {nextAction.buttonLabel}
                  </Link>
                </div>
              </div>
            )}
          </div>

        </div>
      </section>

      {hasBooking && (
        <>
          <section className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600 mb-2">Booking Progress</p>
                <h2 className="text-lg font-bold text-slate-900">Where you are in the process</h2>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              {progressSteps.map((step) => (
                <div
                  key={step.label}
                  className={[
                    'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium',
                    step.state === 'complete'
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                      : step.state === 'current'
                        ? 'border-blue-200 bg-blue-50 text-blue-800'
                        : 'border-slate-200 bg-white text-slate-500',
                  ].join(' ')}
                >
                  <span className="text-base leading-none">{step.symbol}</span>
                  <span>{step.label}</span>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      <section className="space-y-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600 mb-2">Available License Categories</p>
          <h2 className="text-lg font-bold text-slate-900">Choose the category that matches your test</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {LICENSE_CATEGORIES.map((category) => (
            <article key={category.code} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600 mb-2">Category {category.code}</p>
                  <h3 className="text-lg font-black text-slate-900">{category.name}</h3>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">{category.code}</span>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-slate-600">{category.description}</p>

              <Link href="/candidate/booking" className="mt-5 inline-flex w-full items-center justify-center rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-900 transition hover:bg-blue-100">
                Book This Test
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
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

function getPrimaryNextAction(status?: BookingStatus | null, paymentSuccessful = false) {
  if (!status) {
    return {
      label: 'Book a new test',
      description: 'Start a fresh booking request to continue with your application.',
      buttonLabel: 'Book a New Test',
      href: '/candidate/booking',
      badgeClass: 'bg-blue-100 text-blue-700',
    };
  }

  switch (status) {
    case 'Pending':
      return {
        label: 'Waiting for institution approval',
        description: 'The institution must review your request before payment becomes available.',
        buttonLabel: 'View Booking',
        href: '/candidate/booking',
        badgeClass: 'bg-amber-100 text-amber-700',
      };
    case 'Approved':
      return paymentSuccessful
        ? {
            label: 'Payment successful',
            description: 'Your payment is complete. Review the payment page for details.',
            buttonLabel: 'View Payment',
            href: '/candidate/payments',
            badgeClass: 'bg-emerald-100 text-emerald-700',
          }
        : {
            label: 'Payment required',
            description: `You owe ${formatPaymentAmount(DEFAULT_PAYMENT_AMOUNT_CENTS, DEFAULT_PAYMENT_CURRENCY)} for this booking.`,
            buttonLabel: 'Pay Now',
            href: '/candidate/payments',
            badgeClass: 'bg-amber-100 text-amber-700',
          };
    case 'Payment Pending':
      return {
        label: 'Payment required',
        description: `You owe ${formatPaymentAmount(DEFAULT_PAYMENT_AMOUNT_CENTS, DEFAULT_PAYMENT_CURRENCY)} for this booking.`,
        buttonLabel: 'Pay Now',
        href: '/candidate/payments',
        badgeClass: 'bg-amber-100 text-amber-700',
      };
    case 'Scheduled':
      return {
        label: 'Your exam is scheduled',
        description: 'Review your booking details while you wait for the test date.',
        buttonLabel: 'View Booking',
        href: '/candidate/booking',
        badgeClass: 'bg-indigo-100 text-indigo-700',
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
        badgeClass: 'bg-slate-100 text-slate-700',
      };
  }
}

function getBookingProgressSteps(status?: BookingStatus | null, paymentSuccessful = false) {
  const steps = [
    { label: 'Booking Submitted', state: 'upcoming' as const, symbol: '○' },
    { label: 'Institution Approval', state: 'upcoming' as const, symbol: '○' },
    { label: 'Payment', state: 'upcoming' as const, symbol: '○' },
    { label: 'Scheduling', state: 'upcoming' as const, symbol: '○' },
    { label: 'Test', state: 'upcoming' as const, symbol: '○' },
    { label: 'Results', state: 'upcoming' as const, symbol: '○' },
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

