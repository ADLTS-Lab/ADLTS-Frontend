"use client";

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
  type BookingStatus,
  type LicenseCategory,
} from "@/services/booking.service";
import PaymentBadge from "@/components/PaymentBadge";
import PaymentHistory from "@/components/PaymentHistory";
import { getPaymentsForBooking, type Payment } from "@/services/payment.service";
import { useAuthStore } from "@/store/authStore";
import {
  Alert,
  Button,
  ButtonLink,
  Card,
  CardHeader,
  ConfirmModal,
  EmptyState,
  Input,
  PageContainer,
  PageHeader,
  Select,
  StatBlock,
  StatusBadge,
  StepProgress,
  Textarea,
  ui,
} from "@/app/components/ui";

const LICENSE_CATEGORIES: LicenseCategory[] = ["A", "B", "C", "D"];

const PROCESS_STEPS = [
  { label: "Submit booking request" },
  { label: "Wait for institution review" },
  { label: "Complete payment after approval" },
  { label: "Attend scheduled practical exam" },
  { label: "Review result when published" },
];

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

export default function CandidateBookingPage() {
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
      setInstitutionLoadError("No active institutions found. Try again later or contact support.");
      setInstitutions([]);
    } finally {
      setLoadingInstitutions(false);
    }
  };

  useEffect(() => {
    void loadBookings();
    const unsubscribe = subscribeToBookingChanges(() => {
      void loadBookings();
    });

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email]);

  useEffect(() => {
    void loadInstitutions();
  }, []);

  const selectedInstitution = useMemo(
    () => institutions.find((item) => item.id === institutionId) || null,
    [institutionId, institutions],
  );

  const canSubmit = useMemo(
    () => Boolean(institutionId && licenseCategory && preferredDate && !isSubmitting && !loadingBookings),
    [institutionId, licenseCategory, preferredDate, isSubmitting, loadingBookings],
  );
  const currentBooking = bookings[0] || null;
  const currentBookingId = currentBooking?.id;
  const currentBookingStatus = currentBooking?.status;
  const activeBooking = useMemo(
    () => bookings.find((booking) => isActiveBookingStatus(booking.status)) || null,
    [bookings],
  );
  const isPendingBooking = currentBooking?.status === "Pending";
  const isApprovedBooking = currentBooking?.status === "Approved";
  const bookingLockMessage = activeBooking ? getBookingBlockMessage(activeBooking.status) : "";
  const latestPayment = payments[0] || null;
  const paymentStatusLabel = getPaymentStatusLabel(currentBooking?.status, latestPayment?.status);

  useEffect(() => {
    if (paymentSuccess) {
      setActionMessage("Payment is complete. Return to booking status for scheduling updates.");
    }
  }, [paymentSuccess]);

  useEffect(() => {
    let mounted = true;

    const loadPayments = async () => {
      if (!currentBookingId || (currentBookingStatus !== "Approved" && currentBookingStatus !== "Payment Pending" && currentBookingStatus !== "Scheduled")) {
        setPayments([]);
        return;
      }

      try {
        const bookingPayments = await getPaymentsForBooking(currentBookingId);
        if (mounted) {
          setPayments(bookingPayments);
        }
      } catch (error) {
        console.error("Failed to load booking payment status", error);
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
      setPreferredDate(resetDate ? "" : currentBooking.preferredDate || "");
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
          candidateId: user?.id || "",
          name: user?.name || `${user?.first_name || ""} ${user?.last_name || ""}`.trim() || "Candidate User",
          email: user?.email || "",
          phone: user?.phone || "",
          fayidaId: (user as { fayida_id?: string } | null)?.fayida_id || "",
          gender: user?.gender || "",
        },
      });

      await loadBookings();
      setShowForm(false);
      setActionMessage(`Booking ${nextBooking.id} created successfully.`);
      setMessage("Booking request submitted.");
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
    <PageContainer width="wide" className="space-y-6">
      <PageHeader
        title="Book your practical driving test"
        description="Select an active institution, license category, preferred date, and session. Your request will be reviewed before payment opens."
        action={
          <ButtonLink href="/candidate/exams" variant="outline">
            Exam history
          </ButtonLink>
        }
      />

      {(message || actionMessage) ? <Alert variant="success">{message || actionMessage}</Alert> : null}
      {errorMessage ? <Alert variant="error">{errorMessage}</Alert> : null}
      {bookingLoadError ? <Alert variant="error">{bookingLoadError}</Alert> : null}
      {institutionLoadError ? <Alert variant="error">{institutionLoadError}</Alert> : null}

      {activeBooking ? (
        <Alert variant="info">
          You already have an active booking. You can create a new request only after the current booking is rejected, cancelled, completed, or expired.
        </Alert>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_384px]">
        <div className="space-y-6">
          {showForm ? (
            <Card padding="lg" className="shadow-[var(--shadow-resting)]">
              <CardHeader
                title="Submit a booking request"
                description="If you already have an active booking, finish or close that workflow before creating another request."
              />

              {loadingBookings ? <p className="mb-4 text-[14px] text-[var(--text-secondary)]">Loading your booking history...</p> : null}

              <form onSubmit={handleSubmit} className="space-y-5">
                <Select
                  label="Institution"
                  value={institutionId}
                  disabled={loadingInstitutions}
                  onChange={(event) => setInstitutionId(event.target.value)}
                  hint={loadingInstitutions ? "Loading active institutions..." : "Choose an active institution."}
                  required
                >
                  <option value="" disabled>
                    Select institution
                  </option>
                  {loadingInstitutions ? (
                    <option key="loading" value="">
                      Loading active institutions...
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

                <div className="grid gap-4 md:grid-cols-2">
                  <Select
                    label="License category"
                    value={licenseCategory}
                    onChange={(event) => setLicenseCategory(event.target.value as LicenseCategory)}
                  >
                    {LICENSE_CATEGORIES.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </Select>
                  <Select label="Blood type" value={bloodType} onChange={(event) => setBloodType(event.target.value)}>
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

                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    label="Preferred date"
                    type="date"
                    required
                    value={preferredDate}
                    onChange={(event) => setPreferredDate(event.target.value)}
                  />
                  <Select
                    label="Preferred session"
                    value={preferredSession}
                    onChange={(event) => setPreferredSession(event.target.value)}
                  >
                    <option value="Morning">Morning</option>
                    <option value="Afternoon">Afternoon</option>
                  </Select>
                </div>

                <Textarea
                  label="Notes"
                  value={additionalNotes}
                  onChange={(event) => setAdditionalNotes(event.target.value)}
                  placeholder="Add notes to help the institution review the request."
                  rows={4}
                />

                <div className="flex flex-col gap-3 border-t border-[var(--border)] pt-5 sm:flex-row">
                  {bookings.length > 0 ? (
                    <Button type="button" variant="secondary" onClick={() => setShowForm(false)} className="sm:w-[160px]">
                      Back
                    </Button>
                  ) : null}
                  <Button
                    type="submit"
                    disabled={!canSubmit || loadingInstitutions}
                    state={isSubmitting ? { loading: true } : undefined}
                    fullWidth
                  >
                    {isSubmitting ? "Submitting..." : "Submit booking request"}
                  </Button>
                </div>
              </form>
            </Card>
          ) : currentBooking ? (
            <Card padding="lg" className="shadow-[var(--shadow-resting)]">
              <CardHeader
                title="Current booking summary"
                description={getStatusExplanation(currentBooking.status)}
                action={<StatusBadge status={currentBooking.status} tone={getStatusTone(currentBooking.status)} />}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <SummaryBlock label="Institution" value={currentBooking.institutionName || currentBooking.institution} />
                <SummaryBlock label="License category" value={currentBooking.licenseCategory} />
                <SummaryBlock label="Preferred date" value={currentBooking.preferredDate || "-"} />
                <SummaryBlock label="Preferred session" value={currentBooking.preferredSession || "-"} />
              </div>

              <div className="mt-6 rounded-[8px] border border-[var(--border)] bg-[var(--surface-2)] p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className={ui.statLabel}>Payment status</p>
                    <p className="mt-1 text-[14px] font-medium text-[var(--text-primary)]">{paymentStatusLabel}</p>
                    <p className="mt-1 text-[13px] leading-5 text-[var(--text-secondary)]">
                      {getPaymentExplanation(currentBooking.status, currentBooking.institutionName || currentBooking.institution)}
                    </p>
                  </div>
                  <StatusBadge status={latestPayment?.status || "required"} tone={latestPayment?.status === "Succeeded" ? "succeeded" : "warning"} />
                </div>
                <div className="mt-4">
                  <PaymentBadge bookingId={currentBooking.id} required={currentBooking.status === "Approved"} />
                </div>
                <div className="mt-4 border-t border-[var(--border)] pt-4">
                  <PaymentHistory bookingId={currentBooking.id} />
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                {isApprovedBooking || currentBooking.status === "Payment Pending" ? (
                  <ButtonLink href={paymentPageUrl} variant="primary" className="sm:flex-1">
                    Pay now
                  </ButtonLink>
                ) : null}
                {(isPendingBooking || isApprovedBooking) ? (
                  <Button
                    type="button"
                    variant="danger"
                    disabled={isCancelling}
                    onClick={() => setShowCancelConfirm(true)}
                    className="sm:flex-1"
                  >
                    {isCancelling ? "Cancelling..." : "Cancel booking"}
                  </Button>
                ) : null}
                {isPendingBooking ? (
                  <Button type="button" variant="secondary" onClick={() => openNewBookingForm(false)} className="sm:flex-1">
                    Change institution
                  </Button>
                ) : null}
                {!activeBooking ? (
                  <Button type="button" onClick={() => openNewBookingForm(true)} className="sm:flex-1">
                    Submit booking request
                  </Button>
                ) : null}
              </div>
            </Card>
          ) : null}
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <Card padding="md">
            <CardHeader title="Process guide" description="Track scheduling and exam progress from your portal." />
            <StepProgress steps={PROCESS_STEPS} activeIndex={getProcessIndex(currentBooking?.status)} className="md:block md:space-y-4" />
          </Card>

          <Card padding="md">
            <CardHeader title="Selected institution detail" />
            {selectedInstitution ? (
              <div className="space-y-3">
                <StatBlock label="Institution" value={selectedInstitution.name} />
                <p className="text-[13px] text-[var(--text-secondary)]">Reference ID: {selectedInstitution.id}</p>
              </div>
            ) : (
              <p className="text-[14px] leading-6 text-[var(--text-secondary)]">
                Choose an institution in the form to see selected office details.
              </p>
            )}
          </Card>

          <Card padding="md">
            <CardHeader title="Booking history" />
            {loadingBookings ? (
              <p className="py-4 text-[14px] text-[var(--text-secondary)]">Loading your booking history...</p>
            ) : bookings.length > 0 ? (
              <div className="space-y-3">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between gap-3 rounded-[8px] border border-[var(--border)] bg-[var(--surface-2)] p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-medium text-[var(--text-primary)]">{booking.institutionName || booking.institution}</p>
                      <p className="mt-1 text-[12px] text-[var(--text-tertiary)]">{new Date(booking.createdAt).toLocaleDateString()}</p>
                    </div>
                    <StatusBadge status={booking.status} tone={getStatusTone(booking.status)} />
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No bookings yet" description="Submitted requests will appear here." className="border-0 bg-transparent py-8" />
            )}
          </Card>
        </aside>
      </div>

      <ConfirmModal
        open={showCancelConfirm}
        title="Cancel booking?"
        description="Your current booking will be marked as cancelled. You can create a new booking after cancellation."
        cancelLabel="Keep booking"
        confirmLabel={isCancelling ? "Cancelling..." : "Cancel booking"}
        confirming={isCancelling}
        onCancel={() => setShowCancelConfirm(false)}
        onConfirm={() => void handleCancelRequest()}
      />
    </PageContainer>
  );
}

function SummaryBlock({ label, value }: { label: string; value: string }) {
  return (
    <Card padding="sm" variant="soft">
      <StatBlock label={label} value={value || "-"} />
    </Card>
  );
}

function getPaymentStatusLabel(status?: BookingStatus | null, paymentStatus?: string) {
  if (paymentStatus === "Succeeded") return "Payment complete";
  if (status === "Approved") return paymentStatus || "Payment required";
  if (status === "Pending") return "Waiting for approval";
  if (status === "Rejected") return "Unavailable";
  return "Not available";
}

function getPaymentExplanation(status?: BookingStatus | null, institutionName?: string) {
  switch (status) {
    case "Pending":
      return institutionName
        ? `Payment opens after ${institutionName} approves your booking request.`
        : "Payment opens after the institution approves your booking request.";
    case "Approved":
      return "Payment becomes available after approval. Complete payment to continue toward scheduling.";
    case "Payment Pending":
      return "Payment is required or in progress before scheduling can continue.";
    case "Scheduled":
      return "Payment is complete. Return to booking status for scheduling updates.";
    default:
      return status ? `Payment is not available for the current booking status: ${status}.` : "Submit and receive approval for a booking before payment is available.";
  }
}

function getStatusExplanation(status?: BookingStatus | null) {
  switch (status) {
    case "Pending":
      return "Your request is waiting for institution review.";
    case "Approved":
      return "Your request was accepted. Complete payment to continue.";
    case "Payment Pending":
      return "Payment is required or in progress.";
    case "Scheduled":
      return "Your test has been scheduled.";
    case "Rejected":
      return "Your request was not accepted by the institution.";
    case "Cancelled":
      return "Your booking was cancelled.";
    case "Completed":
      return "The booking cycle is complete.";
    case "Expired":
      return "The request is no longer active.";
    default:
      return "Submitted requests will appear here.";
  }
}

function getProcessIndex(status?: BookingStatus | null) {
  switch (status) {
    case "Pending":
      return 1;
    case "Approved":
    case "Payment Pending":
      return 2;
    case "Scheduled":
      return 3;
    case "Completed":
      return 4;
    default:
      return 0;
  }
}
