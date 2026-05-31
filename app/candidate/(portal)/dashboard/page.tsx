"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Calendar } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { getCurrentUser, type User } from "@/services/auth.service";
import {
  getCandidateExamStats,
  getCandidateUpcomingExam,
  type CandidateExamStats,
  type UpcomingExam,
} from "@/services/exams.service";
import { useI18n } from "@/i18n/useI18n";
import { extractApiError } from "@/services/api-utils";
import { getAllBookings, subscribeToBookingChanges, type BookingRequest, type BookingStatus } from "@/services/booking.service";
import { DEFAULT_PAYMENT_AMOUNT_CENTS, DEFAULT_PAYMENT_CURRENCY, getPaymentsForBooking, type Payment } from "@/services/payment.service";

export default function CandidateDashboard() {
  const { user: storedUser, isAuthenticated, setUser } = useAuthStore();
  const [profile, setProfile] = useState<User | null>(storedUser);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState<CandidateExamStats>({
    totalExams: 0,
    averageScore: 0,
    passedExams: 0,
    incomplete: 0,
  });
  const [upcomingExam, setUpcomingExam] = useState<UpcomingExam | null>(null);
  const [booking, setBooking] = useState<BookingRequest | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isPaymentsLoading, setIsPaymentsLoading] = useState(false);
  const didInitRef = useRef(false);

  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;

    let isMounted = true;

    const loadBooking = async (candidateEmail?: string) => {
      try {
        const bookings = await getAllBookings();
        if (!isMounted) return;
        const currentUserId = storedUser?.id;
        const currentEmail = String(candidateEmail || storedUser?.email || '').toLowerCase();
        const mine = bookings.filter((booking) => {
          const bookingCandidateId = booking.candidateId || booking.candidateDetails?.candidateId;
          const bookingEmail = booking.candidateDetails?.email?.toLowerCase();

          if (currentUserId && bookingCandidateId === currentUserId) return true;
          if (currentEmail && bookingEmail === currentEmail) return true;

          return false;
        });
        setBooking(mine[0] ?? null);
      } catch (err) {
        console.error(err);
      }
    };

    const loadProfileOnce = async () => {
      // If we already have a user from the persisted store, skip the extra loading flicker.
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

    loadBooking();
    loadProfileOnce();

    const unsubscribeBookings = subscribeToBookingChanges(() => {
      void loadBooking();
    });

    Promise.allSettled([getCandidateExamStats(), getCandidateUpcomingExam()]).then(
      ([statsResult, upcomingExamResult]) => {
        if (!isMounted) return;

        if (statsResult.status === "fulfilled") {
          setStats(statsResult.value);
        } else {
          setError((current) => current || extractApiError(statsResult.reason, "Unable to load exam statistics right now."));
        }

        if (upcomingExamResult.status === "fulfilled") {
          setUpcomingExam(upcomingExamResult.value);
        } else {
          setError((current) => current || extractApiError(upcomingExamResult.reason, "Unable to load the upcoming exam right now."));
        }
      }
    );

    return () => {
      isMounted = false;
      unsubscribeBookings();
    };
    // Intentionally run once per mount; the effect calls setUser(), which would otherwise cause re-fetch + loading flicker.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadPayments = async () => {
      if (!booking || booking.status !== 'Approved') {
        setPayments([]);
        return;
      }

      setIsPaymentsLoading(true);
      try {
        const bookingPayments = await getPaymentsForBooking(booking.id);
        if (!isMounted) return;
        setPayments(bookingPayments);
      } catch (error) {
        if (isMounted) {
          console.error('Failed to load payment history', error);
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
  }, [booking?.id, booking?.status]);

  useEffect(() => {
    if (!profile && storedUser) setProfile(storedUser);
  }, [profile, storedUser]);

  const { t } = useI18n();
  const bookingState = getBookingStateMeta(booking?.status);
  const latestPayment = payments[0] ?? null;
  const paymentStatus = latestPayment?.status ?? (booking?.status === 'Approved' ? 'Required' : null);
  const paymentIsSuccessful = paymentStatus === 'Succeeded';
  const paymentCardTitle = paymentIsSuccessful ? 'Payment Successful' : 'Payment Required';
  const paymentCardSubtitle = paymentIsSuccessful
    ? 'Payment is complete. Continue to exam scheduling and the next steps in your journey.'
    : 'Complete payment to unlock exam scheduling and keep the workflow moving.';

  if ((!isAuthenticated && typeof window === "undefined") || isProfileLoading) {
    return (
      <main className="space-y-6 md:space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 md:p-8 border border-slate-100 animate-pulse">
            <div className="h-5 w-48 bg-slate-100 rounded mb-4" />
            <div className="h-4 w-full max-w-md bg-slate-100 rounded mb-3" />
            <div className="h-10 w-56 bg-slate-100 rounded-full" />
          </div>
          <div className="bg-white rounded-3xl p-6 border border-slate-100 animate-pulse">
            <div className="h-5 w-32 bg-slate-100 rounded mb-6" />
            <div className="space-y-4">
              <div className="h-10 bg-slate-100 rounded-xl" />
              <div className="h-10 bg-slate-100 rounded-xl" />
              <div className="h-10 bg-slate-100 rounded-xl" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="space-y-6 md:space-y-8">
      {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-[#283C86] rounded-3xl p-6 md:p-8 text-white relative overflow-hidden flex flex-col justify-center">
          <div className="max-w-md z-10">
            <p className="text-base md:text-lg mb-6 md:mb-8 leading-relaxed opacity-90">{t('dashboardHero')}</p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              {!booking ? (
                <Link href="/candidate/booking" className="bg-white text-blue-900 px-5 md:px-6 py-3 rounded-full font-bold flex items-center justify-center gap-2 text-sm md:text-base w-full sm:w-auto shadow-md hover:bg-slate-50 transition active:scale-95">
                  <span className="w-5 h-5 bg-blue-900 text-white rounded-full flex items-center justify-center text-xs">▶</span>
                  {t('bookYourTest')}
                </Link>
              ) : (
                <button
                  type="button"
                  disabled
                  className={[
                    "px-5 md:px-6 py-3 rounded-full font-bold flex items-center justify-center gap-2 text-sm md:text-base w-full sm:w-auto shadow-md border transition active:scale-95",
                    booking.status === "Approved"
                      ? "bg-green-100 text-green-800 border-green-200"
                      : booking.status === "Rejected"
                        ? "bg-rose-100 text-rose-800 border-rose-200"
                        : "bg-amber-100 text-amber-800 border-amber-200",
                  ].join(" ")}
                >
                  <span className={[
                    "w-5 h-5 rounded-full flex items-center justify-center text-xs",
                    booking.status === "Approved"
                      ? "bg-green-700 text-white"
                      : booking.status === "Rejected"
                        ? "bg-rose-700 text-white"
                        : "bg-amber-700 text-white",
                  ].join(" ")}>
                    !
                  </span>
                  {bookingState.title}
                </button>
              )}
              <Link href="/guidelines" className="bg-white/10 hover:bg-white/20 border border-white/20 px-5 md:px-6 py-3 rounded-full font-bold text-sm md:text-base w-full sm:w-auto transition active:scale-95 text-center">
                {t('readGuides')}
              </Link>
            </div>
          </div>
        </div>

        {booking?.status === 'Approved' && (
          <Link
            href="/candidate/payments"
            className="block rounded-3xl border border-blue-100 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600 mb-2">Payment status</p>
                <h3 className="text-2xl font-black text-blue-950">{paymentCardTitle}</h3>
                <p className="mt-2 text-sm text-slate-500 max-w-2xl">{paymentCardSubtitle}</p>
              </div>
              <div className="flex flex-col items-start gap-2 sm:items-end">
                <span className={[
                  "inline-flex items-center rounded-full px-3 py-1 text-xs font-bold",
                  paymentIsSuccessful ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700",
                ].join(" ")}>{paymentStatus}</span>
                <span className="inline-flex items-center justify-center rounded-full bg-blue-900 px-5 py-3 text-sm font-bold text-white shadow-md">
                  {paymentIsSuccessful ? 'View Payment' : 'Go to Payment'}
                </span>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
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
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Next step</p>
                <p className="text-sm font-bold text-slate-800">{paymentIsSuccessful ? 'Exam scheduling' : 'Payment completion'}</p>
                <p className="mt-1 text-xs text-slate-500">{paymentIsSuccessful ? 'Move forward to exam scheduling.' : 'Finish payment to continue.'}</p>
              </div>
            </div>

            {isPaymentsLoading && (
              <p className="mt-4 text-sm text-slate-500">Refreshing payment status...</p>
            )}
          </Link>
        )}

      </div>

      {!booking ? (
        <Link
          href="/candidate/booking"
          className="block rounded-3xl border border-blue-100 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600 mb-2">{t('bookingCardTitle')}</p>
              <h3 className="text-2xl font-black text-blue-950">{t('bookYourTest')}</h3>
              <p className="mt-2 text-sm text-slate-500 max-w-2xl">{t('bookingNoRequest')}</p>
            </div>
            <span className="inline-flex items-center justify-center rounded-full bg-blue-900 px-5 py-3 text-sm font-bold text-white shadow-md">
              {t('bookYourTest')}
            </span>
          </div>
        </Link>
      ) : (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
            <h3 className="font-bold text-slate-700">{t('bookingCardTitle')}</h3>
            <span className={[
              "inline-flex items-center rounded-full px-3 py-1 text-xs font-bold",
              bookingState.badgeClass,
            ].join(" ")}>
              {booking.status}
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-50/70 p-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{t('bookingStatusLabel')}</p>
              <p className="text-lg font-black text-slate-900">{bookingState.title}</p>
              <p className="mt-1 text-sm text-slate-500">{bookingState.subtitle}</p>
            </div>
            <div className="rounded-2xl bg-slate-50/70 p-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{t('bookingInstitutionLabel')}</p>
              <p className="text-sm font-bold text-slate-800">{booking.institution}</p>
            </div>
            <div className="rounded-2xl bg-slate-50/70 p-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{t('bookingCategoryLabel')}</p>
              <p className="text-sm font-bold text-slate-800">{booking.licenseCategory}</p>
            </div>
          </div>
        </div>
      )}

      {/* <div className="grid grid-cols-1 min-[340px]:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <StatCard label={t('stat_totalExams')} value={stats.totalExams.toString().padStart(2, "0")} />
        <StatCard label={t('stat_averageScore')} value={`${stats.averageScore}%`} />
        <StatCard label={t('stat_passedExams')} value={stats.passedExams.toString().padStart(2, "0")} />
        <StatCard label={t('stat_incomplete')} value={stats.incomplete.toString().padStart(2, "0")} />
      </div> */}

      <div className="pt-4">
        <h3 className="text-xl font-bold text-slate-800 mb-6">{t('examTypesTitle')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <div className="bg-white rounded-2xl md:rounded-3xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition">
            <h4 className="text-base font-bold text-slate-800 mb-1">{t('examCategoryAuto')}</h4>
            <p className="text-sm text-slate-500 leading-relaxed">
              {t('examCategoryAutoDesc')}
            </p>
          </div>
          <div className="bg-white rounded-2xl md:rounded-3xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition">
            <h4 className="text-base font-bold text-slate-800 mb-1">{t('examCategoryPublic')}</h4>
            <p className="text-sm text-slate-500 leading-relaxed">
              {t('examCategoryPublicDesc')}
            </p>
          </div>
          <div className="bg-white rounded-2xl md:rounded-3xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition">
            <h4 className="text-base font-bold text-slate-800 mb-1">{t('examCategoryCargo')}</h4>
            <p className="text-sm text-slate-500 leading-relaxed">
              {t('examCategoryCargoDesc')}
            </p>
          </div>
          <div className="bg-white rounded-2xl md:rounded-3xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition">
            <h4 className="text-base font-bold text-slate-800 mb-1">{t('examCategoryMotorcycle')}</h4>
            <p className="text-sm text-slate-500 leading-relaxed">
              {t('examCategoryMotorcycleDesc')}
            </p>
          </div>
        </div>
      </div>

    </main>
  );
}

const StatCard = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-white p-4 rounded-2xl md:rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
    <span className="text-xl md:text-3xl font-bold text-blue-900 mb-1">{value}</span>
    <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-wider line-clamp-2 leading-tight">{label}</span>
  </div>
);

function getBookingStateMeta(status?: BookingStatus | null) {
  switch (status) {
    case "Approved":
      return {
        title: "Approved",
        subtitle: "Ready to proceed to testing process",
        badgeClass: "bg-green-100 text-green-700",
      };
    case "Payment Pending":
      return {
        title: "Payment Pending",
        subtitle: "Your booking is approved and waiting for payment",
        badgeClass: "bg-sky-100 text-sky-700",
      };
    case "Scheduled":
      return {
        title: "Scheduled",
        subtitle: "Your exam or training slot has been scheduled",
        badgeClass: "bg-indigo-100 text-indigo-700",
      };
    case "Completed":
      return {
        title: "Completed",
        subtitle: "Your booking workflow is finished",
        badgeClass: "bg-emerald-100 text-emerald-700",
      };
    case "Cancelled":
      return {
        title: "Cancelled",
        subtitle: "This booking was cancelled and you can book again",
        badgeClass: "bg-slate-100 text-slate-700",
      };
    case "Rejected":
      return {
        title: "Rejected",
        subtitle: "Please submit a new booking request",
        badgeClass: "bg-rose-100 text-rose-700",
      };
    case "Pending":
    default:
      return {
        title: "Pending Verification",
        subtitle: "Your booking request is waiting for review",
        badgeClass: "bg-amber-100 text-amber-700",
      };
  }
}

function formatPaymentAmount(amountCents: number, currency: string) {
  return `${currency} ${(amountCents / 100).toFixed(2)}`;
}
