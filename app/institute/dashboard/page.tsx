"use client";

import { useEffect, useRef, useState } from "react";
import {
  CalendarClock,
  ChevronDown,
  Eye,
  MoreVertical,
} from "lucide-react";
import { getInstituteOverview, InstituteOverview } from "@/services/institute.service";
import {
  approveInstitutionRequest,
  getRecentInstitutionRequests,
  rejectInstitutionRequest,
} from "@/services/institution.service";
import { subscribeToBookingChanges, type BookingRequest } from "@/services/booking.service";
import { extractApiError } from "@/services/api-utils";
import { Button, ButtonLink, Card, PageContainer, PageHeader, CardHeader, Alert, StatusBadge, ui } from "@/app/components/ui";
import BookingRequestDetailsModal from "@/components/BookingRequestDetailsModal";

export default function InstituteDashboard() {
  const [overview, setOverview] = useState<InstituteOverview | null>(null);
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionBanner, setActionBanner] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<BookingRequest | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const actionsMenuRef = useRef<HTMLDivElement | null>(null);
  const actionBannerTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showActionBanner = (banner: { type: "success" | "error"; message: string }) => {
    setActionBanner(banner);
    if (actionBannerTimeoutRef.current) {
      clearTimeout(actionBannerTimeoutRef.current);
    }
    actionBannerTimeoutRef.current = setTimeout(() => {
      setActionBanner(null);
      actionBannerTimeoutRef.current = null;
    }, 4000);
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const overviewRes = await getInstituteOverview();
        if (overviewRes.success) {
          setOverview(overviewRes.data ?? null);
        } else {
          setOverview(null);
        }
      } catch (err) {
        setError(extractApiError(err, "Failed to load institute overview"));
      }

      try {
        const requestsRes = await getRecentInstitutionRequests(5);
        setRequests(requestsRes);
      } catch (err) {
        setError((prev) => prev ?? extractApiError(err, "Failed to load recent requests"));
      } finally {
        setLoading(false);
      }
    };
    loadData();

    const unsubscribe = subscribeToBookingChanges(() => {
      void loadData();
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleRequestAction = async (request: BookingRequest, action: "approve" | "reject") => {
    if (request.status !== "Pending") {
      showActionBanner({
        type: "error",
        message: "Only pending bookings can be approved or rejected.",
      });
      return;
    }

    try {
      if (action === "approve") {
        await approveInstitutionRequest(request.id);
      } else {
        await rejectInstitutionRequest(request.id);
      }

      setSelectedRequest(null);
      await loadAndRefresh();
      showActionBanner({
        type: "success",
        message: `${action === "approve" ? "Approved" : "Rejected"} request for ${
          request.candidateDetails?.name || "candidate"
        }.`,
      });
    } catch (err) {
      showActionBanner({
        type: "error",
        message: extractApiError(err, "Failed to update booking status."),
      });
    }
  };

  const loadAndRefresh = async () => {
    try {
      const overviewRes = await getInstituteOverview();
      if (overviewRes.success) {
        setOverview(overviewRes.data ?? null);
      } else {
        setOverview(null);
      }
      const requestsRes = await getRecentInstitutionRequests(5);
      setRequests(requestsRes);
    } catch (err) {
      setError(extractApiError(err, "Failed to refresh dashboard data"));
    }
  };

  const openRequestDetails = (request: BookingRequest) => {
    setSelectedRequest(request);
    setOpenDropdownId(null);
  };

  const requestCount = {
    total: requests.length,
    pending: requests.filter((request) => request.status === "Pending").length,
    approved: requests.filter((request) => request.status === "Approved").length,
    rejected: requests.filter((request) => request.status === "Rejected").length,
  };

  return (
    <PageContainer width="wide" className="space-y-8">
      {actionBanner ? (
        <Alert variant={actionBanner.type === "success" ? "success" : "error"}>
          {actionBanner.message}
        </Alert>
      ) : null}
      {error && <Alert variant="error">{error}</Alert>}

      <PageHeader
        eyebrow="Institute Portal"
        title="Institute Dashboard"
        description="Manage your driving school candidates and schedules."
        action={
          <ButtonLink variant="secondary" href="/candidate/register">
            Register Candidate
          </ButtonLink>
        }
      />

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <KpiCard label="Active Students" value={overview?.activeStudents ?? 0} tone="info" />
        <KpiCard label="Upcoming Exams" value={overview?.upcomingExams ?? 0} tone="success" />
        <KpiCard
          label="Average Pass Rate"
          value={overview ? `${overview.passRate}%` : "—"}
          tone="success"
        />
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <KpiCard label="Total Requests" value={requestCount.total} tone="info" />
        <KpiCard label="Pending" value={requestCount.pending} tone="warning" />
        <KpiCard label="Approved" value={requestCount.approved} tone="success" />
      </section>

      <Card className="overflow-hidden p-0">
        <CardHeader
          title="Recent enrollments"
          description="Review and act on the latest booking queue for your institution."
          action={
            <ButtonLink variant="secondary" size="sm" href="/institute/requests">
              View all requests
            </ButtonLink>
          }
        />
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[var(--adlts-surface-soft)] text-sm text-[var(--adlts-ink-500)] border-b border-[var(--adlts-divider)]">
              <tr>
                <th className="px-6 py-4 font-medium">Candidate Name</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Phone Number</th>
                <th className="px-6 py-4 font-medium">Booking Date</th>
                <th className="px-6 py-4 font-medium">Preferred Exam Date</th>
                <th className="px-6 py-4 font-medium">Session</th>
                <th className="px-6 py-4 font-medium">License Category</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--adlts-divider)]">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><div className="h-5 w-32 animate-pulse rounded bg-[var(--adlts-surface-soft)]" /></td>
                    <td className="px-6 py-4"><div className="h-5 w-24 animate-pulse rounded bg-[var(--adlts-surface-soft)]" /></td>
                    <td className="px-6 py-4"><div className="h-5 w-24 animate-pulse rounded bg-[var(--adlts-surface-soft)]" /></td>
                    <td className="px-6 py-4"><div className="h-5 w-16 animate-pulse rounded bg-[var(--adlts-surface-soft)]" /></td>
                  </tr>
                ))
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-[var(--adlts-ink-500)]">No recent requests.</td>
                </tr>
              ) : (
                requests.map((request) => (
                  <tr key={request.id} className="transition-colors hover:bg-[var(--adlts-surface-soft)]">
                    <td className="px-6 py-4 font-medium text-[var(--adlts-ink-900)]">
                      <button
                        type="button"
                        onClick={() => openRequestDetails(request)}
                        className="text-left text-[var(--adlts-blue-700)] hover:text-[var(--adlts-blue-800)]"
                      >
                        {request.candidateDetails?.name || "Unknown Candidate"}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-[var(--adlts-ink-600)]">{request.candidateDetails?.email || "—"}</td>
                    <td className="px-6 py-4 text-[var(--adlts-ink-600)]">{request.candidateDetails?.phone || "—"}</td>
                    <td className="px-6 py-4 text-[var(--adlts-ink-600)]">{new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(request.createdAt))}</td>
                    <td className="px-6 py-4 text-[var(--adlts-ink-600)]">{request.preferredDate || "—"}</td>
                    <td className="px-6 py-4 text-[var(--adlts-ink-600)]">{request.preferredSession || "—"}</td>
                    <td className="px-6 py-4 text-[var(--adlts-ink-600)]">{request.licenseCategory}</td>
                    <td className="px-6 py-4">
                      <StatusBadge
                        status={request.status}
                        tone={
                          request.status === "Approved"
                            ? "success"
                            : request.status === "Pending"
                              ? "warning"
                              : request.status === "Rejected"
                                ? "error"
                                : "neutral"
                        }
                      />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="relative inline-block text-left" ref={actionsMenuRef}>
                        <button
                          type="button"
                          onClick={() => setOpenDropdownId((current) => (current === request.id ? null : request.id))}
                          className="inline-flex items-center gap-1.5 rounded-md border border-[var(--adlts-border)] px-3 py-2 text-sm font-medium text-[var(--adlts-ink-700)] transition hover:bg-[var(--adlts-surface-soft)]"
                        >
                          <MoreVertical className="h-4 w-4" />
                          Actions
                          <ChevronDown className="h-4 w-4 text-[var(--adlts-ink-500)]" />
                        </button>

                        {openDropdownId === request.id && (
                          <div className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-md border border-[var(--adlts-border)] bg-[var(--adlts-surface)] shadow-popover">
                            <button
                              type="button"
                              onClick={() => openRequestDetails(request)}
                              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium transition hover:bg-[var(--adlts-surface-soft)]"
                            >
                              <Eye className="h-4 w-4 text-[var(--adlts-ink-400)]" />
                              {"View details"}
                            </button>
                            {request.status === "Pending" && (
                              <>
                                <button
                                  type="button"
                                  onClick={async () => {
                                    setOpenDropdownId(null);
                                    await handleRequestAction(request, "approve");
                                  }}
                                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-emerald-700 transition hover:bg-emerald-50"
                                >
                                  <CalendarClock className="h-4 w-4" />
                                  Approve Request
                                </button>
                                <button
                                  type="button"
                                  onClick={async () => {
                                    setOpenDropdownId(null);
                                    await handleRequestAction(request, "reject");
                                  }}
                                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-rose-700 transition hover:bg-rose-50"
                                >
                                  <CalendarClock className="h-4 w-4" />
                                  Reject Request
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {selectedRequest && (
        <BookingRequestDetailsModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onApprove={() => void handleRequestAction(selectedRequest, "approve")}
          onReject={() => void handleRequestAction(selectedRequest, "reject")}
          title="Candidate Details"
        />
      )}
    </PageContainer>
  );
}

function KpiCard({ label, value, tone }: { label: string; value: string | number; tone: "info" | "success" | "warning" | "error" }) {
  return (
    <Card padding="md" className="space-y-2">
      <p className={ui.statLabel}>{label}</p>
      <p className="text-3xl font-semibold text-[var(--adlts-ink-900)]">{value}</p>
      <StatusBadge status={label} tone={tone} />
    </Card>
  );
}
