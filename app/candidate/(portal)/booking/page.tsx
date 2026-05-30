"use client";

import { useEffect, useMemo, useState } from "react";
import { getAllBookings, submitBookingRequest, MOCK_BOOKING_INSTITUTIONS, subscribeToBookingChanges, type BookingRequest, type LicenseCategory, type BookingStatus } from "@/services/booking.service";
import { useI18n } from "@/i18n/useI18n";
import { useAuthStore } from "@/store/authStore";

const getStatusBadge = (status: BookingStatus) => {
  switch (status) {
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
  const [institutionId, setInstitutionId] = useState("");
  const [licenseCategory, setLicenseCategory] = useState<LicenseCategory>("B");
  const [bloodType, setBloodType] = useState("A+");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredSession, setPreferredSession] = useState("Morning");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [message, setMessage] = useState("");
  const { user } = useAuthStore();

  useEffect(() => {
    async function loadBookings() {
      try {
        const all = await getAllBookings();
        const currentEmail = user?.email?.toLowerCase();
        const mine = currentEmail ? all.filter((booking) => booking.candidateDetails?.email?.toLowerCase() === currentEmail) : all;
        setBookings(mine);
        if (mine.length > 0) {
          setShowForm(false);
          const current = mine[0];
          setInstitutionId(current.institutionId || MOCK_BOOKING_INSTITUTIONS[0].id);
          setLicenseCategory(current.licenseCategory);
          setBloodType(current.bloodType || "A+");
          setPreferredDate(current.preferredDate || "");
          setPreferredSession(current.preferredSession || "Morning");
          setAdditionalNotes(current.additionalNotes || "");
        } else {
          setInstitutionId(MOCK_BOOKING_INSTITUTIONS[0].id);
        }
      } catch (err) {
        console.error("Failed to load bookings", err);
        setInstitutionId(MOCK_BOOKING_INSTITUTIONS[0].id);
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

  const canSubmit = useMemo(() => institutionId && licenseCategory && preferredDate, [institutionId, licenseCategory, preferredDate]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmit) return;

    try {
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
          fayidaId: (user as any)?.fayida_id || '',
          gender: user?.gender || '',
        }
      });

      setBookings((current) => [nextBooking, ...current]);
      setShowForm(false);
      setMessage(t("bookingSuccess"));
      setTimeout(() => setMessage(""), 5000);
    } catch (err) {
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
          {message && (
            <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 font-medium shadow-sm">
              {message}
            </div>
          )}

          {showForm ? (
            <section className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
              <h2 className="font-bold text-slate-800 text-lg mb-6">{t("bookingPageTitle")}</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-[#1F2937] mb-2">{t("bookingInstitutionField")}</label>
                  <select
                    value={institutionId}
                    onChange={(event) => setInstitutionId(event.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none transition bg-[#F9FAFB] text-black"
                  >
                    {MOCK_BOOKING_INSTITUTIONS.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
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
                      Cancel
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
              
              {["Pending", "Approved"].includes(bookings[0].status) ? (
                <div className="text-center p-3 rounded-xl bg-blue-50 text-blue-700 text-sm font-medium border border-blue-100">
                  You already have an active booking request.
                </div>
              ) : (
                <button
                  onClick={() => setShowForm(true)}
                  className="w-full bg-[#1E3A8A] text-white py-3.5 rounded-xl font-bold hover:bg-[#1E40AF] transition shadow-md"
                >
                  {t("bookAnotherTest") || "Book Another Test"}
                </button>
              )}
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
    </main>
  );
}

const BookingSummaryRow = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{label}</p>
    <p className="text-sm font-bold text-slate-800">{value}</p>
  </div>
);
