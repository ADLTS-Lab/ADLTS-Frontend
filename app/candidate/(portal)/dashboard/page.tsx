"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Bell, CheckCircle2, Circle, Clock3 } from "lucide-react";

import { useAuthStore } from "@/store/authStore";
import { getCurrentUser, type User } from "@/services/auth.service";
import { extractApiError } from "@/services/api-utils";
import { getAllBookings, subscribeToBookingChanges, type BookingRequest } from "@/services/booking.service";
import { getPaymentsForBooking, type Payment } from "@/services/payment.service";
import { getNotificationsPage, subscribeToNotificationChanges, type AppNotification } from "@/services/notification.service";

type JourneyStepId = 'registration' | 'booking' | 'approval' | 'payment' | 'exam' | 'result' | 'pickup';
type JourneyStepState = 'complete' | 'current' | 'upcoming';

type NextAction = {
  eyebrow: string;
  title: string;
  subtitle: string;
  detail?: string;
  ctaLabel?: string;
  ctaHref?: string;
};

type ProgressStep = {
  id: JourneyStepId;
  label: string;
  state: JourneyStepState;
};

type TimelineStep = {
  label: string;
  state: JourneyStepState;
  detail?: string;
};

const JOURNEY_STEPS: Array<{ id: JourneyStepId; label: string }> = [
  { id: 'registration', label: 'Registration' },
  { id: 'booking', label: 'Booking' },
  { id: 'approval', label: 'Institution Approval' },
  { id: 'payment', label: 'Payment' },
  { id: 'exam', label: 'Exam' },
  { id: 'result', label: 'Result' },
  { id: 'pickup', label: 'License Pickup' },
];

const LICENSE_CARDS = [
  { code: 'A', title: 'Motorcycle', description: 'For motorcycle and two-wheel driving tests.' },
  { code: 'B', title: 'Light Vehicle', description: 'For passenger cars and light private vehicles.' },
  { code: 'C', title: 'Heavy Cargo', description: 'For cargo trucks and commercial hauling vehicles.' },
  { code: 'D', title: 'Passenger Bus', description: 'For large passenger and public transport vehicles.' },
] as const;

function formatTimestamp(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

function hasNotificationType(notifications: AppNotification[], type: AppNotification['type']) {
  return notifications.some((notification) => notification.type === type);
}

function stepIcon(state: JourneyStepState) {
  if (state === 'complete') return <CheckCircle2 className="h-4 w-4" />;
  if (state === 'current') return <Clock3 className="h-4 w-4" />;
  return <Circle className="h-4 w-4" />;
}

function stepClasses(state: JourneyStepState) {
  if (state === 'complete') return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  if (state === 'current') return 'border-blue-200 bg-blue-50 text-blue-700';
  return 'border-slate-200 bg-white text-slate-500';
}

function deriveWorkflow(
  booking: BookingRequest | null,
  latestPayment: Payment | null,
  notifications: AppNotification[],
): { nextAction: NextAction; progressSteps: ProgressStep[]; timelineSteps: TimelineStep[] } {
  const hasPaid = latestPayment?.status === 'Succeeded';
  const hasExamScheduled = Boolean(booking && booking.status === 'Scheduled') || hasNotificationType(notifications, 'exam_scheduled');
  const hasResult = hasNotificationType(notifications, 'test_passed');
  const hasPickup = hasNotificationType(notifications, 'license_pickup');

  let currentStep: JourneyStepId = 'booking';

  if (!booking) {
    currentStep = 'booking';
  } else if (booking.status === 'Pending') {
    currentStep = 'approval';
  } else if (booking.status === 'Approved' && !hasPaid) {
    currentStep = 'payment';
  } else if ((hasPaid || booking.status === 'Scheduled') && !hasExamScheduled && !hasResult && !hasPickup) {
    currentStep = 'exam';
  } else if ((hasExamScheduled || booking.status === 'Scheduled') && !hasResult && !hasPickup) {
    currentStep = 'exam';
  } else if (hasResult && !hasPickup) {
    currentStep = 'result';
  } else if (hasPickup) {
    currentStep = 'pickup';
  }

  const currentIndex = JOURNEY_STEPS.findIndex((step) => step.id === currentStep);
  const progressSteps: ProgressStep[] = JOURNEY_STEPS.map((step, index) => ({
    ...step,
    state: index < currentIndex ? 'complete' : index === currentIndex ? 'current' : 'upcoming',
  }));

  const timelineSteps: TimelineStep[] = booking
    ? [
        { label: 'Booking Submitted', state: 'complete' },
        { label: 'Institution Selected', state: 'complete', detail: booking.institutionName || booking.institution },
        {
          label: 'Pending Approval',
          state: booking.status === 'Pending' ? 'current' : 'complete',
          detail: booking.status === 'Pending' ? 'Waiting for the institution to review your booking.' : 'Approved or moved beyond review.',
        },
        {
          label: 'Payment',
          state: hasPaid ? 'complete' : booking.status === 'Approved' ? 'current' : 'upcoming',
          detail: hasPaid ? 'Payment received.' : booking.status === 'Approved' ? 'Proceed to payment when ready.' : 'Available after approval.',
        },
        {
          label: 'Exam Scheduling',
          state: hasExamScheduled ? 'complete' : hasPaid ? 'current' : 'upcoming',
          detail: hasExamScheduled ? 'Exam is scheduled.' : hasPaid ? 'Awaiting scheduling.' : 'Available after payment.',
        },
        {
          label: 'Result',
          state: hasResult ? 'complete' : hasExamScheduled ? 'current' : 'upcoming',
          detail: hasResult ? 'Your result has been issued.' : hasExamScheduled ? 'Pending exam outcome.' : 'Available after the exam.',
        },
        {
          label: 'License Pickup',
          state: hasPickup ? 'complete' : hasResult ? 'current' : 'upcoming',
          detail: hasPickup ? 'Pickup instructions are available.' : hasResult ? 'Awaiting pickup notice.' : 'Available after results are released.',
        },
      ]
    : [
        { label: 'Booking Submitted', state: 'upcoming', detail: 'Book your first driving test to start the journey.' },
        { label: 'Institution Selected', state: 'upcoming', detail: 'Choose an approved driving institute.' },
        { label: 'Pending Approval', state: 'upcoming', detail: 'The institution will review your request.' },
        { label: 'Payment', state: 'upcoming', detail: 'Payment appears after approval.' },
        { label: 'Exam Scheduling', state: 'upcoming', detail: 'Scheduling appears after payment.' },
        { label: 'Result', state: 'upcoming', detail: 'Results appear after the exam.' },
        { label: 'License Pickup', state: 'upcoming', detail: 'Pickup instructions appear after the result.' },
      ];

  const nextAction: NextAction = (() => {
    if (!booking) {
      return {
        eyebrow: 'Your Next Step',
        title: 'You have not booked a driving test yet.',
        subtitle: 'Start by selecting an institute and submitting a booking request.',
        ctaLabel: 'Book Test',
        ctaHref: '/candidate/booking',
      };
    }

    if (booking.status === 'Pending') {
      return {
        eyebrow: 'Your Next Step',
        title: 'Waiting for Institution Approval',
        subtitle: 'Your booking has been submitted and is under review.',
        detail: `Booking submitted to: ${booking.institutionName || booking.institution}\nStatus: Pending Verification\nExpected response: 1-2 business days`,
      };
    }

    if (booking.status === 'Approved' && !hasPaid) {
      return {
        eyebrow: 'Your Next Step',
        title: 'Your booking has been approved.',
        subtitle: 'Proceed to payment to continue the workflow.',
        ctaLabel: 'Proceed to Payment',
        ctaHref: '/candidate/payments',
      };
    }

    if ((hasPaid || booking.status === 'Scheduled') && !hasExamScheduled && !hasResult && !hasPickup) {
      return {
        eyebrow: 'Your Next Step',
        title: 'Await Exam Scheduling',
        subtitle: 'Your payment is complete. The exam schedule will appear next.',
        ctaLabel: 'View Notifications',
        ctaHref: '/candidate/notifications',
      };
    }

    if (booking.status === 'Scheduled' || hasExamScheduled) {
      return {
        eyebrow: 'Your Next Step',
        title: 'View Exam Details',
        subtitle: 'Your exam has been scheduled. Review the exam page for details.',
        ctaLabel: 'View Exam Details',
        ctaHref: '/candidate/exams',
      };
    }

    if (hasResult && !hasPickup) {
      return {
        eyebrow: 'Your Next Step',
        title: 'Review Your Result',
        subtitle: 'Your exam result is available.',
        ctaLabel: 'View Exam Details',
        ctaHref: '/candidate/exams',
      };
    }

    if (hasPickup) {
      return {
        eyebrow: 'Your Next Step',
        title: 'License Pickup Ready',
        subtitle: 'Check your notification for pickup location, date, and time.',
        ctaLabel: 'Open Notifications',
        ctaHref: '/candidate/notifications',
      };
    }

    return {
      eyebrow: 'Your Next Step',
      title: 'Track your current booking.',
      subtitle: 'Your next action will appear here as the workflow advances.',
    };
  })();

  return { nextAction, progressSteps, timelineSteps };
}

export default function CandidateDashboard() {
  const { user: storedUser, isAuthenticated, setUser } = useAuthStore();
  const [profile, setProfile] = useState<User | null>(storedUser);
  const [isProfileLoading, setIsProfileLoading] = useState(Boolean(!storedUser));
  const [isBookingLoading, setIsBookingLoading] = useState(true);
  const [isNotificationsLoading, setIsNotificationsLoading] = useState(true);
  const [isPaymentsLoading, setIsPaymentsLoading] = useState(false);
  const [booking, setBooking] = useState<BookingRequest | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState("");
  const didInitRef = useRef(false);

  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;

    let isMounted = true;

    const loadBooking = async (candidateEmail?: string) => {
      setIsBookingLoading(true);
      try {
        const bookings = await getAllBookings();
        if (!isMounted) return;

        const currentUserId = storedUser?.id;
        const currentEmail = String(candidateEmail || storedUser?.email || '').toLowerCase();
        const mine = bookings.filter((item) => {
          const bookingCandidateId = item.candidateId || item.candidateDetails?.candidateId;
          const bookingEmail = item.candidateDetails?.email?.toLowerCase();

          if (currentUserId && bookingCandidateId === currentUserId) return true;
          if (currentEmail && bookingEmail === currentEmail) return true;

          return false;
        });

        setBooking(mine[0] ?? null);
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) {
          setIsBookingLoading(false);
        }
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
          setError(extractApiError(err, 'Unable to load candidate dashboard right now.'));
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
    // Intentionally run once per mount; the effect calls setUser(), which would otherwise cause refetch churn.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadNotifications = async () => {
      setIsNotificationsLoading(true);
      try {
        const result = await getNotificationsPage({ page: 1, pageSize: 4 });
        if (!isMounted) return;

        setNotifications(result.items);
        setUnreadCount(result.unreadCount);
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unable to load notifications right now.');
        }
      } finally {
        if (isMounted) {
          setIsNotificationsLoading(false);
        }
      }
    };

    void loadNotifications();

    const unsubscribe = subscribeToNotificationChanges(() => {
      void loadNotifications();
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [storedUser?.id, storedUser?.role]);

  useEffect(() => {
    let isMounted = true;

    const loadPayments = async () => {
      if (!booking) {
        setPayments([]);
        return;
      }

      setIsPaymentsLoading(true);
      try {
        const bookingPayments = await getPaymentsForBooking(booking.id);
        if (!isMounted) return;
        setPayments(bookingPayments);
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load payment history', err);
          setPayments([]);
        }
      } finally {
        if (isMounted) {
          setIsPaymentsLoading(false);
        }
      }
    };

    void loadPayments();

    return () => {
      isMounted = false;
    };
  }, [booking]);

  const latestPayment = payments[0] ?? null;
  const workflow = useMemo(() => deriveWorkflow(booking, latestPayment, notifications), [booking, latestPayment, notifications]);
  const currentUser = profile ?? storedUser;
  const isLoading = isProfileLoading || isBookingLoading || isNotificationsLoading;

  if (!isAuthenticated && typeof window === 'undefined') {
    return null;
  }

  if (isLoading) {
    return (
      <main className="space-y-6 md:space-y-8">
        <div className="space-y-2">
          <div className="h-4 w-40 rounded bg-slate-100" />
          <div className="h-8 w-72 rounded bg-slate-100" />
          <div className="h-4 w-96 max-w-full rounded bg-slate-100" />
        </div>
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="h-56 rounded-3xl border border-slate-200 bg-white shadow-sm animate-pulse" />
          <div className="h-56 rounded-3xl border border-slate-200 bg-white shadow-sm animate-pulse" />
        </div>
      </main>
    );
  }

  return (
    <main className="space-y-6 md:space-y-8">
      <header className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Candidate Dashboard</p>
        <h1 className="text-3xl font-bold text-slate-900">Candidate Dashboard</h1>
        <p className="text-sm text-slate-500">Track your booking, payment, exam, and results.</p>
      </header>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 shadow-sm">
          {error}
        </div>
      )}

      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">{workflow.nextAction.eyebrow}</p>
              <h2 className="mt-3 text-2xl font-bold text-slate-900">{workflow.nextAction.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{workflow.nextAction.subtitle}</p>
            </div>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
              {booking ? booking.status : 'No booking'}
            </span>
          </div>

          {workflow.nextAction.detail && (
            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700 whitespace-pre-line">
              {workflow.nextAction.detail}
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {workflow.nextAction.ctaLabel && workflow.nextAction.ctaHref ? (
              <Link
                href={workflow.nextAction.ctaHref}
                className="inline-flex items-center justify-center rounded-full bg-blue-900 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-800"
              >
                {workflow.nextAction.ctaLabel}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            ) : (
              <span className="text-sm text-slate-500">
                {booking ? 'No action needed right now.' : 'Book your test to begin the workflow.'}
              </span>
            )}
          </div>

          {booking && booking.status === 'Pending' && (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Booking submitted to</p>
                  <p className="mt-1 font-semibold text-slate-900">{booking.institutionName || booking.institution}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Status</p>
                  <p className="mt-1 font-semibold text-slate-900">Pending Verification</p>
                </div>
              </div>
              <p className="mt-3 text-slate-600">Expected response: 1-2 business days</p>
            </div>
          )}

          {booking && booking.status === 'Approved' && !latestPayment?.status && (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              Your booking has been approved. Proceed to payment to continue.
            </div>
          )}

          {latestPayment?.status === 'Succeeded' && booking && booking.status === 'Approved' && (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              Payment received. Await exam scheduling.
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Progress Tracker</p>
              <h2 className="mt-3 text-xl font-bold text-slate-900">Journey status</h2>
            </div>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
              {currentUser?.name || 'Candidate'}
            </span>
          </div>

          <div className="mt-6 space-y-3">
            {workflow.progressSteps.map((step) => (
              <div key={step.id} className={['flex items-center gap-3 rounded-2xl border px-3 py-2 text-sm transition', stepClasses(step.state)].join(' ')}>
                <span className="shrink-0">{stepIcon(step.state)}</span>
                <span className={`font-semibold ${step.state === 'current' ? 'text-slate-900' : ''}`}>{step.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Booking Timeline</p>
              <h2 className="mt-2 text-xl font-bold text-slate-900">Current booking</h2>
            </div>
            {booking ? (
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                {booking.status}
              </span>
            ) : (
              <Link href="/candidate/booking" className="text-sm font-semibold text-blue-700 hover:text-blue-900 hover:underline">
                Book Test
              </Link>
            )}
          </div>

          <div className="mt-6 space-y-4">
            {workflow.timelineSteps.map((step) => (
              <div key={step.label} className="flex gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <div className={['mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs', stepClasses(step.state)].join(' ')}>
                  {stepIcon(step.state)}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900">{step.label}</p>
                  {step.detail && <p className="mt-1 text-sm leading-6 text-slate-600">{step.detail}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Recent Notifications</p>
              <h2 className="mt-2 text-xl font-bold text-slate-900">Latest updates</h2>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
              <Bell className="h-3.5 w-3.5" />
              {unreadCount} unread
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {notifications.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                No recent notifications.
              </div>
            ) : (
              notifications.map((notification) => (
                <div key={notification.id} className={['rounded-2xl border p-4', notification.read ? 'border-slate-200 bg-white' : 'border-blue-200 bg-blue-50/40'].join(' ')}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-900">{notification.title}</p>
                        {!notification.read && <span className="h-2 w-2 rounded-full bg-blue-600" />}
                      </div>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{notification.message}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-xs font-medium text-slate-400">{formatTimestamp(notification.createdAt)}</p>
                </div>
              ))
            )}
          </div>

          <div className="mt-6">
            <Link href="/candidate/notifications" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-900 hover:underline">
              View all notifications
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">License Categories</p>
          <h2 className="mt-2 text-xl font-bold text-slate-900">Book the correct test</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {LICENSE_CARDS.map((category) => (
            <div key={category.code} className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Category</p>
                  <h3 className="mt-2 text-3xl font-black text-slate-900">{category.code}</h3>
                  <p className="mt-1 text-sm font-semibold text-slate-700">{category.title}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500">
                  Test
                </div>
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-600">{category.description}</p>

              <div className="mt-5">
                <Link
                  href="/candidate/booking"
                  className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-900"
                >
                  Book This Test
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {isPaymentsLoading && <p className="text-sm text-slate-500">Refreshing payment status...</p>}
    </main>
  );
}
