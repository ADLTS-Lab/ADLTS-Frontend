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
import { Alert, Button, ButtonLink, Card, CardHeader, EmptyState, Input, PageContainer, PageHeader, Select, StatusBadge, Textarea, ui } from "@/app/components/ui";

const getStatusTone = (status?: BookingStatus | null) => {
  switch (status) {
    case "Pending":
      return "pending";
    case "Payment Pending":
      return "warning";
    case "Approved":
      return "completed";
    case "Scheduled":
      return "info";
    case "Completed":
      return "completed";
    case "Rejected":
      return "error";
    case "Cancelled":
      return "aborted";
    case "Expired":
      return "inactive";
    default:
      return "warning";
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
        action={
          <ButtonLink href="/candidate/exams" variant="outline">
            My exams
          </ButtonLink>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {(message || actionMessage) ? <Alert variant="success">{message || actionMessage}</Alert> : null}
          {errorMessage ? <Alert variant="error">{errorMessage}</Alert> : null}
          {bookingLoadError ? <Alert variant="error">{bookingLoadError}</Alert> : null}
          {institutionLoadError ? <Alert variant="error">{institutionLoadError}</Alert> : null}

          {showForm ? (
            <Card padding="lg">
              <CardHeader
                title={bookings.length > 0 ? (t("currentBooking") || "Current Booking") : (t("bookingPageTitle") || "Book a Test")}
                description="Complete the form to submit a new request."
              />

              <div className="mb-4 rounded-lg border border-[var(--adlts-border)] bg-[var(--adlts-surface-soft)] p-4">
                <p className="text-sm text-[var(--adlts-ink-700)]">
                  If you already have an active request, update details through your current booking from this dashboard.
                </p>
              </div>

              {loadingBookings ? <p className="mb-4 text-sm text-[var(--adlts-ink-600)]">Loading booking data...</p> : null}
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

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                </div>

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
                  rows={4}
                />

                <div className="flex gap-3 border-t border-[var(--adlts-divider)] pt-4">
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
                action={<StatusBadge status={bookings[0].status} tone={getStatusTone(bookings[0].status)} />}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <BookingSummaryRow label={t("bookingInstitutionLabel")} value={bookings[0].institutionName || bookings[0].institution} />
                <BookingSummaryRow label={t("bookingCategoryLabel")} value={bookings[0].licenseCategory} />
                <BookingSummaryRow label={t("preferredDateLabel")} value={bookings[0].preferredDate} />
                <BookingSummaryRow label={t("preferredSessionLabel")} value={bookings[0].preferredSession} />
              </div>
              <div className="rounded-lg border border-[var(--adlts-border)] bg-[var(--adlts-surface-soft)] p-4">
                <p className={ui.statLabel}>Payment status</p>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-[var(--adlts-ink-800)]">{paymentStatusLabel}</p>
                  <StatusBadge status={latestPayment?.status || "required"} tone={latestPayment?.status === "Succeeded" ? "succeeded" : "warning"} />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="mb-3 text-sm font-semibold text-[var(--adlts-ink-800)]">Payment</h3>
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

        <div className="space-y-6 lg:col-span-1">
          <Card padding="md">
            <CardHeader title="Process guide" />
            <ol className="space-y-3 text-sm">
              <li className="rounded-md border border-[var(--adlts-border)] bg-[var(--adlts-surface-soft)] p-3">
                <p className="text-[12px] font-medium uppercase tracking-wide text-[var(--adlts-ink-500)]">Step 1</p>
                <p className="mt-1 font-medium text-[var(--adlts-ink-900)]">Submit booking request</p>
              </li>
              <li className="rounded-md border border-[var(--adlts-border)] bg-[var(--adlts-surface-soft)] p-3">
                <p className="text-[12px] font-medium uppercase tracking-wide text-[var(--adlts-ink-500)]">Step 2</p>
                <p className="mt-1 font-medium text-[var(--adlts-ink-900)]">Institution review and approval</p>
              </li>
              <li className="rounded-md border border-[var(--adlts-border)] bg-[var(--adlts-surface-soft)] p-3">
                <p className="text-[12px] font-medium uppercase tracking-wide text-[var(--adlts-ink-500)]">Step 3</p>
                <p className="mt-1 font-medium text-[var(--adlts-ink-900)]">Payment and scheduling</p>
              </li>
              <li className="rounded-md border border-[var(--adlts-border)] bg-[var(--adlts-surface-soft)] p-3">
                <p className="text-[12px] font-medium uppercase tracking-wide text-[var(--adlts-ink-500)]">Step 4</p>
                <p className="mt-1 font-medium text-[var(--adlts-ink-900)]">Take test and review result</p>
              </li>
            </ol>
          </Card>

          <Card padding="md">
            <CardHeader title={selectedInstitution ? "Selected institution" : (t("bookingHistory") || "Selected institution")} />
            {selectedInstitution ? (
              <div className="space-y-2">
                <p className="font-medium text-[var(--adlts-ink-900)]">{selectedInstitution.name}</p>
                <p className="text-sm text-[var(--adlts-ink-600)]">Address not provided.</p>
                <p className="text-xs text-[var(--adlts-ink-500)]">Reference id: {selectedInstitution.id}</p>
              </div>
            ) : (
              <p className="text-sm text-[var(--adlts-ink-600)]">
                Choose an institution in the form to see selected office details.
              </p>
            )}
          </Card>

          <Card padding="md" className="h-fit">
            <CardHeader title={t("bookingHistory") || "Booking History"} />
            {loadingBookings ? (
              <p className="px-4 py-6 text-sm text-[var(--adlts-ink-600)]">Loading booking history...</p>
            ) : bookings.length > 0 ? (
              <div className="space-y-3">
                {bookings.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-[var(--adlts-border)] bg-[var(--adlts-surface-soft)] p-3 transition-colors hover:border-[var(--adlts-border-strong)]"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[var(--adlts-ink-900)]">{b.institutionName || b.institution}</p>
                      <p className="mt-0.5 text-xs text-[var(--adlts-ink-500)]">{new Date(b.createdAt).toLocaleDateString()}</p>
                    </div>
                    <StatusBadge status={b.status} tone={getStatusTone(b.status)} />
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No bookings yet" description="Submitted requests will appear here." className="!py-8" />
            )}
          </Card>
        </div>
      </div>

      {showCancelConfirm && currentBooking ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--adlts-ink-950)]/40 p-4">
          <Card padding="md" className="w-full max-w-md shadow-lg">
            <h3 className="text-lg font-semibold text-[var(--adlts-ink-950)]">Cancel booking?</h3>
            <p className="mt-2 text-sm text-[var(--adlts-ink-600)]">
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
  <div className="rounded-lg border border-[var(--adlts-border)] bg-[var(--adlts-surface-soft)] p-4">
    <p className={ui.statLabel}>{label}</p>
    <p className="mt-1 text-sm font-medium text-[var(--adlts-ink-900)]">{value}</p>
  </div>
);
