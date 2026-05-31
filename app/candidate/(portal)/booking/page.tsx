"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { cancelBookingRequest, getAllBookings, getBookingBlockMessage, isActiveBookingStatus, submitBookingRequest, MOCK_BOOKING_INSTITUTIONS, subscribeToBookingChanges, type BookingRequest, type LicenseCategory, type BookingStatus } from "@/services/booking.service";
import PaymentBadge from '@/components/PaymentBadge';
import PaymentHistory from '@/components/PaymentHistory';
import { getPaymentsForBooking, type Payment } from '@/services/payment.service';
import { useI18n } from "@/i18n/useI18n";
import { useAuthStore } from "@/store/authStore";

const getStatusBadge = (status: BookingStatus) => {
  switch (status) {
    case "Payment Pending": return <span className="bg-sky-100 text-sky-700 px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>Payment Pending</span>;
    case "Scheduled": return <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>Scheduled</span>;
    case "Completed": return <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Completed</span>;
    case "Expired": return <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>Expired</span>;
    case "Cancelled": return <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>Cancelled</span>;
    case "Approved": return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>Approved</span>;
    case "Rejected": return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>Rejected</span>;
    default: return <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>Pending</span>;
  }
};

const LICENSE_CATEGORIES: LicenseCategory[] = ["A", "B", "C", "D"];

export default function CandidateBookingPage() {
  const { t } = useI18n();
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [showForm, setShowForm] = useState(true);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [institutionSearch, setInstitutionSearch] = useState("");
  const [institutionId, setInstitutionId] = useState("");
  const [licenseCategory, setLicenseCategory] = useState<LicenseCategory>("B");
  const [bloodType, setBloodType] = useState("A+");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredSession, setPreferredSession] = useState("Morning");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [message, setMessage] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [payments, setPayments] = useState<Payment[]>([]);
  const { user } = useAuthStore();

  useEffect(() => {
    async function loadBookings() {
      try {
        const all = await getAllBookings();
        const currentEmail = user?.email?.toLowerCase();
        const mine = currentEmail ? all.filter((booking) => booking.candidateDetails?.email?.toLowerCase() === currentEmail) : all;
        setBookings(mine);
        if (mine.length > 0) {
          const current = mine[0];
          setShowForm(!isActiveBookingStatus(current.status));
          setInstitutionId(current.institutionId || MOCK_BOOKING_INSTITUTIONS[0].id);
          setInstitutionSearch(current.institutionName || current.institution || MOCK_BOOKING_INSTITUTIONS[0].name);
          setLicenseCategory(current.licenseCategory);
          setBloodType(current.bloodType || "A+");
          setPreferredDate(current.preferredDate || "");
          setPreferredSession(current.preferredSession || "Morning");
          setAdditionalNotes(current.additionalNotes || "");
        } else {
          setInstitutionId(MOCK_BOOKING_INSTITUTIONS[0].id);
          setInstitutionSearch(MOCK_BOOKING_INSTITUTIONS[0].name);
        }
      } catch (err) {
        console.error("Failed to load bookings", err);
        setInstitutionId(MOCK_BOOKING_INSTITUTIONS[0].id);
        setInstitutionSearch(MOCK_BOOKING_INSTITUTIONS[0].name);
      }
    }
    loadBookings();
    const unsubscribe = subscribeToBookingChanges(() => {
      void loadBookings();
    });

    return unsubscribe;
  }, [user?.email]);

  const selectedInstitution = useMemo(
    () => MOCK_BOOKING_INSTITUTIONS.find((item) => item.id === institutionId) || MOCK_BOOKING_INSTITUTIONS[0],
    [institutionId]
  );
  const visibleInstitutions = useMemo(() => {
    const query = institutionSearch.trim().toLowerCase();
    if (!query) return MOCK_BOOKING_INSTITUTIONS;

    return MOCK_BOOKING_INSTITUTIONS.filter((institution) => {
      return institution.name.toLowerCase().includes(query) || institution.id.toLowerCase().includes(query);
    });
  }, [institutionSearch]);

  const canSubmit = useMemo(() => institutionId && licenseCategory && preferredDate, [institutionId, licenseCategory, preferredDate]);
  const currentBooking = bookings[0] || null;
  const currentBookingId = currentBooking?.id;
  const currentBookingStatus = currentBooking?.status;
  const activeBooking = useMemo(
    () => bookings.find((booking) => isActiveBookingStatus(booking.status)) || null,
    [bookings]
  );
  const isPendingBooking = currentBooking?.status === "Pending";
  const isApprovedBooking = currentBooking?.status === "Approved";
  const bookingLockMessage = activeBooking ? getBookingBlockMessage(activeBooking.status) : "";
  const latestPayment = payments[0] || null;
  const paymentStatusLabel = currentBooking?.status === 'Approved'
    ? (latestPayment?.status || 'Required')
    : currentBooking?.status === 'Pending'
      ? 'Waiting for approval'
      : currentBooking?.status === 'Rejected'
        ? 'Unavailable'
        : 'Not available';
  const paymentStatusBadgeClass = latestPayment?.status === 'Succeeded'
    ? 'bg-emerald-100 text-emerald-700'
    : latestPayment?.status === 'Failed' || latestPayment?.status === 'Cancelled'
      ? 'bg-rose-100 text-rose-700'
      : currentBooking?.status === 'Approved'
        ? 'bg-amber-100 text-amber-700'
        : 'bg-slate-100 text-slate-700';

  useEffect(() => {
    let mounted = true;

    const loadPayments = async () => {
      if (!currentBookingId || currentBookingStatus !== 'Approved') {
        setPayments([]);
        return;
      }

      try {
        const bookingPayments = await getPaymentsForBooking(currentBookingId);
        if (mounted) {
          setPayments(bookingPayments);
        }
      } catch (error) {
        console.error('Failed to load booking payment status', error);
        if (mounted) {
          setPayments([]);
        }
      }
    };

    void loadPayments();

    return () => {
      mounted = false;
    };
  }, [currentBookingId, currentBookingStatus]);

  const openNewBookingForm = (resetDate = false) => {
    setShowForm(true);
    if (currentBooking) {
      setInstitutionId(currentBooking.institutionId || MOCK_BOOKING_INSTITUTIONS[0].id);
      setInstitutionSearch(currentBooking.institutionName || currentBooking.institution || MOCK_BOOKING_INSTITUTIONS[0].name);
      setLicenseCategory(currentBooking.licenseCategory);
      setBloodType(currentBooking.bloodType || "A+");
      setPreferredSession(currentBooking.preferredSession || "Morning");
      setAdditionalNotes(currentBooking.additionalNotes || "");
      if (resetDate) {
        setPreferredDate("");
      } else {
        setPreferredDate(currentBooking.preferredDate || "");
      }
      return;
    }

    setInstitutionId(MOCK_BOOKING_INSTITUTIONS[0].id);
    setInstitutionSearch(MOCK_BOOKING_INSTITUTIONS[0].name);
    setLicenseCategory("B");
    setBloodType("A+");
    setPreferredDate("");
    setPreferredSession("Morning");
    setAdditionalNotes("");
  };

  const handleCancelRequest = async () => {
    if (!currentBooking) return;

    try {
      const updatedBooking = await cancelBookingRequest(currentBooking.id);
      if (updatedBooking) {
        setBookings((current) => current.map((booking) => (booking.id === updatedBooking.id ? updatedBooking : booking)));
      }
      setShowForm(true);
      setActionMessage("Booking request canceled.");
      setTimeout(() => setActionMessage(""), 5000);
      setShowCancelConfirm(false);
    } catch (err) {
      console.error("Failed to cancel booking", err);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmit) return;

    if (activeBooking) {
      setErrorMessage(bookingLockMessage);
      setTimeout(() => setErrorMessage(""), 6000);
      return;
    }

    try {
      setErrorMessage("");
      const nextBooking = await submitBookingRequest({
        institutionId: selectedInstitution.id,
        institutionName: selectedInstitution.name,
        licenseCategory,
        bloodType,
        preferredDate,
        preferredSession,
        additionalNotes,
        candidateDetails: {
          candidateId: user?.id || '',
          name: user?.name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Candidate User',
          email: user?.email || '',
          phone: user?.phone || '',
          fayidaId: (user as { fayida_id?: string } | null)?.fayida_id || '',
          gender: user?.gender || '',
        }
      });

      setBookings((current) => [nextBooking, ...current]);
      setShowForm(false);
      setMessage(t("bookingSuccess"));
      setTimeout(() => setMessage(""), 5000);
    } catch (err) {
      const nextMessage = err instanceof Error ? err.message : bookingLockMessage;
      setErrorMessage(nextMessage);
      setTimeout(() => setErrorMessage(""), 6000);
      console.error("Failed to submit booking", err);
    }
  };

  return (
    <main className="space-y-6 md:space-y-8">
      <div className="max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600 mb-3">{t("bookingPageTitle")}</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1F2937]">{t("bookingPageTitle")}</h1>
        <p className="mt-3 text-[#4B5563] leading-relaxed">{t("bookingPageSubtitle")}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {(message || actionMessage) && (
            <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 font-medium shadow-sm">
              {message || actionMessage}
            </div>
          )}

          {errorMessage && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 shadow-sm">
              {errorMessage}
            </div>
          )}

          {showForm ? (
            <section className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
              <h2 className="font-bold text-slate-800 text-lg mb-6">{t("bookingPageTitle")}</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-[#1F2937] mb-2">{t("bookingInstitutionField")}</label>
                  <div className="relative">
                    <input
                      list="booking-institutions"
                      value={institutionSearch}
                      onChange={(event) => {
                        const value = event.target.value;
                        setInstitutionSearch(value);
                        const exactMatch = MOCK_BOOKING_INSTITUTIONS.find(
                          (institution) => institution.name.toLowerCase() === value.trim().toLowerCase() || institution.id.toLowerCase() === value.trim().toLowerCase(),
                        );
                        if (exactMatch) {
                          setInstitutionId(exactMatch.id);
                        }
                      }}
                      placeholder="Search institution"
                      className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none transition bg-[#F9FAFB] text-black"
                    />
                    <datalist id="booking-institutions">
                      {MOCK_BOOKING_INSTITUTIONS.map((item) => (
                        <option key={item.id} value={item.name} />
                      ))}
                    </datalist>
                    {institutionSearch.trim() && visibleInstitutions.length > 0 && (
                      <div className="absolute z-20 mt-2 max-h-56 w-full overflow-auto rounded-2xl border border-slate-200 bg-white shadow-lg">
                        {visibleInstitutions.map((institution) => (
                          <button
                            key={institution.id}
                            type="button"
                            onMouseDown={(event) => {
                              event.preventDefault();
                              setInstitutionId(institution.id);
                              setInstitutionSearch(institution.name);
                            }}
                            className="flex w-full items-center justify-between px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                          >
                            <span className="font-medium text-slate-800">{institution.name}</span>
                            <span className="text-xs text-slate-400">{institution.id}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-slate-500">Start typing to find your institution quickly.</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#1F2937] mb-2">{t("bookingCategoryField")}</label>
                  <select
                    value={licenseCategory}
                    onChange={(event) => setLicenseCategory(event.target.value as LicenseCategory)}
                    className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none transition bg-[#F9FAFB] text-black"
                  >
                    {LICENSE_CATEGORIES.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#1F2937] mb-2">{t("bloodTypeLabel")}</label>
                  <select
                    value={bloodType}
                    onChange={(event) => setBloodType(event.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none transition bg-[#F9FAFB] text-black"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-[#1F2937] mb-2">{t("preferredDateLabel")}</label>
                    <input
                      type="date"
                      required
                      value={preferredDate}
                      onChange={(event) => setPreferredDate(event.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none transition bg-[#F9FAFB] text-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#1F2937] mb-2">{t("preferredSessionLabel")}</label>
                    <select
                      value={preferredSession}
                      onChange={(event) => setPreferredSession(event.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none transition bg-[#F9FAFB] text-black"
                    >
                      <option value="Morning">{t("morningSession")}</option>
                      <option value="Afternoon">{t("afternoonSession")}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#1F2937] mb-2">{t("additionalNotesLabel")}</label>
                  <textarea
                    value={additionalNotes}
                    onChange={(event) => setAdditionalNotes(event.target.value)}
                    placeholder={t("additionalNotesPlaceholder")}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none transition bg-[#F9FAFB] text-black resize-none"
                  />
                </div>

                <div className="pt-4 flex gap-4">
                  {bookings.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="w-1/3 bg-slate-100 text-slate-700 py-3.5 rounded-xl font-bold hover:bg-slate-200 transition"
                    >
                      Back
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className="flex-1 bg-[#1E3A8A] text-white py-3.5 rounded-xl font-bold text-lg hover:bg-[#1E40AF] transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                  >
                    {t("bookingSubmit")}
                  </button>
                </div>

              </form>
            </section>
          ) : bookings.length > 0 ? (
            <section className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                <h2 className="font-bold text-slate-800 text-lg">{t("currentBooking") || "Current Booking"}</h2>
                {getStatusBadge(bookings[0].status)}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <BookingSummaryRow label={t("bookingInstitutionLabel")} value={bookings[0].institutionName || bookings[0].institution} />
                <BookingSummaryRow label={t("bookingCategoryLabel")} value={bookings[0].licenseCategory} />
                <BookingSummaryRow label={t("preferredDateLabel")} value={bookings[0].preferredDate} />
                <BookingSummaryRow label={t("preferredSessionLabel")} value={bookings[0].preferredSession} />
              </div>
              <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Payment status</p>
                  <p className="text-sm font-bold text-slate-800">{paymentStatusLabel}</p>
                </div>
                <span className={["inline-flex items-center rounded-full px-3 py-1 text-xs font-bold", paymentStatusBadgeClass].join(' ')}>
                  {paymentStatusLabel}
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Payment</h3>
                <div className="mb-3"><PaymentBadge bookingId={bookings[0].id} required={bookings[0].status === 'Approved'} /></div>
                <PaymentHistory bookingId={bookings[0].id} />
              </div>
              {isApprovedBooking && (
                <div className="mt-4 flex items-center gap-3">
                  <Link href="/candidate/payments" className="inline-flex items-center rounded-xl bg-blue-900 px-4 py-3 text-sm font-bold text-white shadow-md transition hover:bg-blue-800">
                    Open Payment Page
                  </Link>
                  <p className="text-sm text-slate-500">Use the payment page for checkout, retries, and history.</p>
                </div>
              )}
              
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                {(isPendingBooking || isApprovedBooking) && (
                  <button
                    onClick={() => setShowCancelConfirm(true)}
                    className="flex-1 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 font-bold text-rose-700 transition hover:bg-rose-100"
                  >
                    Cancel Booking
                  </button>
                )}
                {isPendingBooking && (
                  <button
                    onClick={() => openNewBookingForm(false)}
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    Change Institution
                  </button>
                )}
                {!activeBooking && (
                  <button
                    onClick={() => openNewBookingForm(true)}
                    className="flex-1 bg-[#1E3A8A] text-white py-3.5 rounded-xl font-bold hover:bg-[#1E40AF] transition shadow-md"
                  >
                    {isApprovedBooking ? "Book Again" : t("bookAnotherTest") || "Book Again"}
                  </button>
                )}
              </div>
            </section>
          ) : null}
        </div>

        <div className="lg:col-span-1">
          <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <h2 className="font-bold text-slate-800 text-lg mb-6">{t("bookingHistory") || "Booking History"}</h2>
            {bookings.length > 0 ? (
              <div className="space-y-4">
                {bookings.map((b) => (
                  <div key={b.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex justify-between items-center group hover:bg-slate-100 transition">
                    <div>
                      <p className="text-sm font-bold text-slate-800">{b.institutionName || b.institution}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{new Date(b.createdAt).toLocaleDateString()}</p>
                    </div>
                    {getStatusBadge(b.status)}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No previous bookings found.</p>
            )}
          </section>
        </div>
      </div>

      {showCancelConfirm && currentBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-800">Cancel booking?</h3>
            <p className="mt-2 text-sm text-slate-600">
              Your current booking will be marked as Cancelled. You can create a new booking after this.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Keep Booking
              </button>
              <button
                type="button"
                onClick={() => void handleCancelRequest()}
                className="flex-1 rounded-xl bg-rose-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-rose-700"
              >
                Cancel Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

const BookingSummaryRow = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{label}</p>
    <p className="text-sm font-bold text-slate-800">{value}</p>
  </div>
);
