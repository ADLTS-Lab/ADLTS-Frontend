"use client";

import { useEffect, useRef, useState } from "react";
import { Eye, RefreshCw } from "lucide-react";
import { getInstituteOverview, type InstituteOverview } from "@/services/institute.service";
import {
  approveInstitutionRequest,
  getRecentInstitutionRequests,
  rejectInstitutionRequest,
} from "@/services/institution.service";
import { subscribeToBookingChanges, type BookingRequest } from "@/services/booking.service";
import { extractApiError } from "@/services/api-utils";
import {
  Alert,
  Button,
  ButtonLink,
  Card,
  CardHeader,
  DataTable,
  PageContainer,
  PageHeader,
  StatBlock,
  StatusBadge,
  type DataTableColumn,
} from "@/app/components/ui";
import BookingRequestDetailsModal from "@/components/BookingRequestDetailsModal";

export default function InstituteDashboard() {
  const [overview, setOverview] = useState<InstituteOverview | null>(null);
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionBanner, setActionBanner] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<BookingRequest | null>(null);
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
      setOverview(null);
      setError(extractApiError(err, "Failed to load institute overview"));
    }

    try {
      const requestsRes = await getRecentInstitutionRequests(5);
      setRequests(requestsRes);
    } catch (err) {
      setError((prev) => prev ?? extractApiError(err, "Failed to load recent requests"));
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();

    const unsubscribe = subscribeToBookingChanges(() => {
      void loadData();
    });

    return () => {
      if (actionBannerTimeoutRef.current) {
        clearTimeout(actionBannerTimeoutRef.current);
      }
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      await loadData();
      showActionBanner({
        type: "success",
        message: `${action === "approve" ? "Approved" : "Rejected"} request for ${request.candidateDetails?.name || "candidate"}.`,
      });
    } catch (err) {
      showActionBanner({
        type: "error",
        message: extractApiError(err, "Failed to update booking status."),
      });
    }
  };

  const requestCount = {
    total: requests.length,
    pending: requests.filter((request) => request.status === "Pending").length,
    approved: requests.filter((request) => request.status === "Approved").length,
    rejected: requests.filter((request) => request.status === "Rejected").length,
  };

  const columns: Array<DataTableColumn<BookingRequest>> = [
    {
      key: "candidate",
      header: "Candidate",
      cell: (request) => (
        <button
          type="button"
          onClick={() => setSelectedRequest(request)}
          className="max-w-[16rem] truncate text-left font-medium text-[var(--accent)] transition-colors hover:text-[var(--accent-hover)]"
        >
          {request.candidateDetails?.name || "Unknown candidate"}
        </button>
      ),
    },
    {
      key: "email",
      header: "Email",
      cell: (request) => request.candidateDetails?.email || "-",
    },
    {
      key: "phone",
      header: "Phone",
      cell: (request) => request.candidateDetails?.phone || "-",
    },
    {
      key: "preferredDate",
      header: "Preferred date",
      cell: (request) => request.preferredDate || "-",
    },
    {
      key: "session",
      header: "Session",
      cell: (request) => request.preferredSession || "-",
    },
    {
      key: "category",
      header: "Category",
      cell: (request) => request.licenseCategory,
    },
    {
      key: "status",
      header: "Status",
      cell: (request) => <StatusBadge status={request.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      cell: (request) => (
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={() => setSelectedRequest(request)}>
            <Eye className="h-4 w-4" />
            Review
          </Button>
          {request.status === "Pending" ? (
            <>
              <Button type="button" variant="success" size="sm" onClick={() => void handleRequestAction(request, "approve")}>
                Approve
              </Button>
              <Button type="button" variant="danger" size="sm" onClick={() => void handleRequestAction(request, "reject")}>
                Reject
              </Button>
            </>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <PageContainer width="wide" className="space-y-6">
      {actionBanner ? (
        <Alert variant={actionBanner.type === "success" ? "success" : "error"}>
          {actionBanner.message}
        </Alert>
      ) : null}
      {error ? <Alert variant="error">{error}</Alert> : null}

      <PageHeader
        title="Institute dashboard"
        description="Review your driving school candidates, booking queue, and upcoming testing activity."
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => void loadData()} disabled={loading} state={loading ? { loading: true } : undefined}>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <ButtonLink variant="outline" href="/institute/requests">
              Booking requests
            </ButtonLink>
          </div>
        }
      />

      <Card padding="md" variant="soft">
        <p className="text-[14px] leading-6 text-[var(--text-secondary)]">
          Only pending bookings can be approved or rejected. Closed or advanced bookings cannot be changed from this queue.
        </p>
      </Card>

      <section className="grid gap-4 sm:grid-cols-3">
        <KpiCard label="Active students" value={overview ? overview.activeStudents : "-"} />
        <KpiCard label="Upcoming exams" value={overview ? overview.upcomingExams : "-"} />
        <KpiCard label="Pass rate" value={overview ? `${overview.passRate}%` : "-"} />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total requests" value={loading ? "-" : requestCount.total} />
        <KpiCard label="Pending" value={loading ? "-" : requestCount.pending} />
        <KpiCard label="Approved" value={loading ? "-" : requestCount.approved} />
        <KpiCard label="Rejected" value={loading ? "-" : requestCount.rejected} />
      </section>

      <Card padding="none" className="overflow-hidden">
        <CardHeader
          title="Recent enrollments"
          description="Review your driving school candidates, booking queue, and upcoming testing activity."
          action={
            <ButtonLink variant="secondary" size="sm" href="/institute/requests">
              View all requests
            </ButtonLink>
          }
        />
        <DataTable
          columns={columns}
          data={requests}
          getRowKey={(request) => request.id}
          loading={loading}
          emptyTitle="No recent requests"
          emptyDescription="New booking requests assigned to your institution will appear here."
          className="rounded-none border-x-0 border-b-0"
        />
      </Card>

      {selectedRequest ? (
        <BookingRequestDetailsModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onApprove={() => void handleRequestAction(selectedRequest, "approve")}
          onReject={() => void handleRequestAction(selectedRequest, "reject")}
          title="Candidate details"
        />
      ) : null}
    </PageContainer>
  );
}

function KpiCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card padding="md">
      <StatBlock label={label} value={value} />
    </Card>
  );
}
