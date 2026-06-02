"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  cancelBookingRequest,
  getActiveBookingInstitutions,
  getAllBookings,
  getBookingBlockMessage,
  isActiveBookingStatus,
  submitBookingRequest,
  subscribeToBookingChanges,
  type BookingInstitution,
  type BookingRequest,
  type LicenseCategory,
  type BookingStatus,
} from "@/services/booking.service";
import PaymentBadge from '@/components/PaymentBadge';
import PaymentHistory from '@/components/PaymentHistory';
import { getPaymentsForBooking, type Payment } from '@/services/payment.service';
import { useI18n } from "@/i18n/useI18n";
import { useAuthStore } from "@/store/authStore";
import { Alert, Button, ButtonLink, Card, CardHeader, EmptyState, Input, PageContainer, PageHeader, Select, Textarea, ui } from "@/app/components/ui";

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
  const searchParams = useSearchParams();
  const paymentSuccess = searchParams.get("payment") === "success";
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [showForm, setShowForm] = useState(true);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [institutionId, setInstitutionId] = useState("");
  const [licenseCategory, setLicenseCategory] = useState<LicenseCategory>("B");
  const [bloodType, setBloodType] = useState("A+");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredSession, setPreferredSession] = useState("Morning");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [message, setMessage] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [bookingLoadError, setBookingLoadError] = useState("");
  const [institutionLoadError, setInstitutionLoadError] = useState("");
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [loadingInstitutions, setLoadingInstitutions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [institutions, setInstitutions] = useState<BookingInstitution[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const { user } = useAuthStore();

  const loadBookings = async () => {
    setLoadingBookings(true);
    setBookingLoadError("");

    try {
      const all = await getAllBookings();
      const currentEmail = user?.email?.toLowerCase();
      const mine = currentEmail ? all.filter((booking) => booking.candidateDetails?.email?.toLowerCase() === currentEmail) : all;
      setBookings(mine);

      if (mine.length > 0) {
        const current = mine[0];
        const activeBooking = mine.find((booking) => isActiveBookingStatus(booking.status));
        setShowForm(!activeBooking);
        setLicenseCategory(current.licenseCategory);
        setBloodType(current.bloodType || "A+");
        setPreferredDate(current.preferredDate || "");
        setPreferredSession(current.preferredSession || "Morning");
        setAdditionalNotes(current.additionalNotes || "");
        setInstitutionId(activeBooking?.institutionId || current.institutionId || "");
      } else {
        setShowForm(true);
        setInstitutionId("");
      }
    } catch (err) {
      console.error("Failed to load bookings", err);
      setBookingLoadError("Unable to load your booking history.");
      setBookings([]);
      setShowForm(true);
      setInstitutionId("");
    } finally {
      setLoadingBookings(false);
    }
  };

  const loadInstitutions = async () => {
    setLoadingInstitutions(true);
    setInstitutionLoadError("");

    try {
      const activeInstitutions = await getActiveBookingInstitutions();
      setInstitutions(activeInstitutions);
    } catch (err) {
      console.error("Failed to load active institutes", err);
      setInstitutionLoadError("Unable to load active institutes.");
      setInstitutions([]);
    } finally {
      setLoadingInstitutions(false);
    }
  };

  useEffect(() => {
    loadBookings();
    const unsubscribe = subscribeToBookingChanges(() => {
      void loadBookings();
    });

    return unsubscribe;
  }, [user?.email]);

  useEffect(() => {
    void loadInstitutions();
  }, []);

  const selectedInstitution = useMemo(
    () => institutions.find((item) => item.id === institutionId) || null,
    [institutionId, institutions],
  );

  const canSubmit = useMemo(
    () => institutionId && licenseCategory && preferredDate && !isSubmitting && !loadingBookings,
    [institutionId, licenseCategory, preferredDate, isSubmitting, loadingBookings],
  );
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
    if (paymentSuccess) {
      setActionMessage("Payment completed. Your exam is scheduled.");
    }
  }, [paymentSuccess]);

  useEffect(() => {
    let mounted = true;

    const loadPayments = async () => {
      if (!currentBookingId || (currentBookingStatus !== 'Approved' && currentBookingStatus !== 'Payment Pending' && currentBookingStatus !== 'Scheduled')) {
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

    setInstitutionId("");
    setLicenseCategory("B");
    setBloodType("A+");
    setPreferredDate("");
    setPreferredSession("Morning");
    setAdditionalNotes("");
  };

  const handleCancelRequest = async () => {
    if (!currentBooking) return;
    setIsCancelling(true);

    try {
      await cancelBookingRequest(currentBooking.id);
      await loadBookings();
      setShowForm(true);
      setActionMessage("Booking request canceled.");
      setTimeout(() => setActionMessage(""), 5000);
      setShowCancelConfirm(false);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Unable to cancel booking.");
      setTimeout(() => setErrorMessage(""), 6000);
      console.error("Failed to cancel booking", err);
    } finally {
      setIsCancelling(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmit || !selectedInstitution) return;

    if (activeBooking) {
      setErrorMessage(bookingLockMessage);
      setTimeout(() => setErrorMessage(""), 6000);
      return;
    }

    try {
      setErrorMessage("");
      setIsSubmitting(true);
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

      await loadBookings();
      setShowForm(false);
      setActionMessage(`Booking #${nextBooking.id} created successfully.`);
      setMessage(t("bookingSuccess"));
      setTimeout(() => setMessage(""), 5000);
    } catch (err) {
      const nextMessage = err instanceof Error ? err.message : bookingLockMessage;
      setErrorMessage(nextMessage);
      setTimeout(() => setErrorMessage(""), 6000);
      console.error("Failed to submit booking", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const paymentPageUrl = currentBooking
    ? `/candidate/payments?bookingId=${encodeURIComponent(currentBooking.id)}`
    : "/candidate/payments";

  return (
    <PageContainer width="wide">
      <PageHeader
        eyebrow={t("bookingPageTitle")}
        title={t("bookingPageTitle")}
        description={t("bookingPageSubtitle")}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {(message || actionMessage) ? <Alert variant="success">{message || actionMessage}</Alert> : null}
          {errorMessage ? <Alert variant="error">{errorMessage}</Alert> : null}
          {bookingLoadError ? <Alert variant="error">{bookingLoadError}</Alert> : null}
          {institutionLoadError ? <Alert variant="error">{institutionLoadError}</Alert> : null}

          {showForm ? (
            <Card padding="lg">
              <CardHeader title={t("bookingPageTitle")} />
              {loadingBookings ? <p className="mb-4 text-sm text-slate-500">Loading booking data...</p> : null}
              <form onSubmit={handleSubmit} className="space-y-4">
                <Select
                  label={t("bookingInstitutionField")}
                  value={institutionId}
                  disabled={loadingInstitutions}
                  onChange={(event) => setInstitutionId(event.target.value)}
                  hint={loadingInstitutions ? "Loading active institutions..." : "Choose from active institutes."}
                  required
                >
                  <option value="" disabled>
                    Select institution
                  </option>
                  {loadingInstitutions ? (
                    <option key="loading" value="">
                      Loading...
                    </option>
                  ) : institutions.length > 0 ? (
                    institutions.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))
                  ) : (
                    <option key="empty" value="" disabled>
                      No active institutions found
                    </option>
                  )}
                </Select>

                <Select
                  label={t("bookingCategoryField")}
                  value={licenseCategory}
                  onChange={(event) => setLicenseCategory(event.target.value as LicenseCategory)}
                >
                  {LICENSE_CATEGORIES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </Select>

                <Select label={t("bloodTypeLabel")} value={bloodType} onChange={(event) => setBloodType(event.target.value)}>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </Select>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input
                    label={t("preferredDateLabel")}
                    type="date"
                    required
                    value={preferredDate}
                    onChange={(event) => setPreferredDate(event.target.value)}
                  />
                  <Select
                    label={t("preferredSessionLabel")}
                    value={preferredSession}
                    onChange={(event) => setPreferredSession(event.target.value)}
                  >
                    <option value="Morning">{t("morningSession")}</option>
                    <option value="Afternoon">{t("afternoonSession")}</option>
                  </Select>
                </div>

                <Textarea
                  label={t("additionalNotesLabel")}
                  value={additionalNotes}
                  onChange={(event) => setAdditionalNotes(event.target.value)}
                  placeholder={t("additionalNotesPlaceholder")}
                  rows={3}
                />

                <div className="flex gap-3 border-t border-slate-100 pt-4">
                  {bookings.length > 0 ? (
                    <Button type="button" variant="secondary" onClick={() => setShowForm(false)} className="w-1/3">
                      Back
                    </Button>
                  ) : null}
                  <Button
                    type="submit"
                    disabled={!canSubmit || loadingInstitutions}
                    fullWidth
                    className={bookings.length > 0 ? "flex-1" : ""}
                  >
                    {isSubmitting ? "Submitting..." : t("bookingSubmit")}
                  </Button>
                </div>
              </form>
            </Card>
          ) : bookings.length > 0 ? (
            <Card padding="lg">
              <CardHeader
                title={t("currentBooking") || "Current Booking"}
                action={getStatusBadge(bookings[0].status)}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <BookingSummaryRow label={t("bookingInstitutionLabel")} value={bookings[0].institutionName || bookings[0].institution} />
                <BookingSummaryRow label={t("bookingCategoryLabel")} value={bookings[0].licenseCategory} />
                <BookingSummaryRow label={t("preferredDateLabel")} value={bookings[0].preferredDate} />
                <BookingSummaryRow label={t("preferredSessionLabel")} value={bookings[0].preferredSession} />
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className={ui.statLabel}>Payment status</p>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-slate-800">{paymentStatusLabel}</p>
                  <span className={["inline-flex rounded-full px-2.5 py-1 text-xs font-medium", paymentStatusBadgeClass].join(" ")}>
                    {paymentStatusLabel}
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <h3 className="mb-3 text-sm font-semibold text-slate-800">Payment</h3>
                <div className="mb-3">
                  <PaymentBadge bookingId={bookings[0].id} required={bookings[0].status === "Approved"} />
                </div>
                <PaymentHistory bookingId={bookings[0].id} />
              </div>
              {isApprovedBooking || currentBooking?.status === "Payment Pending" ? (
                <div className="mt-4">
                  <ButtonLink href={paymentPageUrl} variant="primary">
                    Pay now
                  </ButtonLink>
                </div>
              ) : null}

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                {(isPendingBooking || isApprovedBooking) ? (
                  <Button
                    type="button"
                    variant="danger"
                    disabled={isCancelling}
                    onClick={() => setShowCancelConfirm(true)}
                    className="flex-1"
                  >
                    {isCancelling ? "Cancelling..." : "Cancel Booking"}
                  </Button>
                ) : null}
                {isPendingBooking ? (
                  <Button type="button" variant="secondary" onClick={() => openNewBookingForm(false)} className="flex-1">
                    Change Institution
                  </Button>
                ) : null}
                {!activeBooking ? (
                  <Button type="button" onClick={() => openNewBookingForm(true)} className="flex-1">
                    {isApprovedBooking ? "Book Again" : t("bookAnotherTest") || "Book Again"}
                  </Button>
                ) : null}
              </div>
            </Card>
          ) : null}
        </div>

        <Card padding="md" className="h-fit lg:col-span-1">
          <CardHeader title={t("bookingHistory") || "Booking History"} />
          {loadingBookings ? (
            <p className="px-4 py-6 text-sm text-slate-500">Loading booking history...</p>
          ) : bookings.length > 0 ? (
            <div className="space-y-3">
              {bookings.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 transition-colors hover:border-slate-300"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">{b.institutionName || b.institution}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{new Date(b.createdAt).toLocaleDateString()}</p>
                  </div>
                  {getStatusBadge(b.status)}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No bookings yet" description="Submitted requests will appear here." className="!py-8" />
          )}
        </Card>
      </div>

      {showCancelConfirm && currentBooking ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <Card padding="md" className="w-full max-w-md shadow-lg">
            <h3 className="text-lg font-semibold text-blue-950">Cancel booking?</h3>
            <p className="mt-2 text-sm text-slate-600">
              Your current booking will be marked as Cancelled. You can create a new booking after this.
            </p>
            <div className="mt-6 flex gap-3">
              <Button type="button" variant="secondary" fullWidth onClick={() => setShowCancelConfirm(false)}>
                Keep Booking
              </Button>
              <Button
                type="button"
                variant="danger"
                disabled={isCancelling}
                fullWidth
                onClick={() => void handleCancelRequest()}
              >
                {isCancelling ? "Cancelling..." : "Cancel Booking"}
              </Button>
            </div>
          </Card>
        </div>
      ) : null}
    </PageContainer>
  );
}

const BookingSummaryRow = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
    <p className={ui.statLabel}>{label}</p>
    <p className="mt-1 text-sm font-medium text-slate-900">{value}</p>
  </div>
);
