"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, RefreshCw, Search } from "lucide-react";
import {
  type BookingRequest,
  type BookingStatus,
  subscribeToBookingChanges,
} from "@/services/booking.service";
import {
  approveInstitutionRequest,
  getInstitutionRequests,
  rejectInstitutionRequest,
} from "@/services/institution.service";
import {
  Alert,
  Button,
  Card,
  CardHeader,
  DataTable,
  Input,
  PageContainer,
  PageHeader,
  Select,
  StatBlock,
  StatusBadge,
  type DataTableColumn,
  ui,
} from "@/app/components/ui";
import CandidateModal from "./CandidateModal";

const LICENSE_CATEGORY_OPTIONS = ["All", "A", "B", "C", "D"] as const;
const STATUS_OPTIONS = ["All", "Pending", "Approved", "Payment Pending", "Scheduled", "Rejected", "Cancelled", "Completed", "Expired"] as const;

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(date);
}

export default function InstituteRequestsPage() {
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<BookingRequest | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_OPTIONS)[number]>("All");
  const [licenseFilter, setLicenseFilter] = useState<(typeof LICENSE_CATEGORY_OPTIONS)[number]>("All");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchRequests = async (nextPage = page) => {
    setLoading(true);
    setError("");

    try {
      const result = await getInstitutionRequests({
        search: search.trim() || undefined,
        status: statusFilter === "All" ? undefined : (statusFilter as BookingStatus),
        licenseCategory: licenseFilter === "All" ? undefined : licenseFilter,
        page: nextPage,
        pageSize,
      });

      setRequests(result.items);
      setPage(result.page);
      setTotalPages(result.totalPages);
      setTotal(result.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load requests.");
      setRequests([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchRequests(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter, licenseFilter]);

  useEffect(() => {
    void fetchRequests(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    const unsubscribe = subscribeToBookingChanges(() => {
      void fetchRequests(page);
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, statusFilter, licenseFilter]);

  const handleStatusChange = async (id: string, newStatus: BookingStatus) => {
    try {
      if (newStatus === "Approved") {
        await approveInstitutionRequest(id);
      } else {
        await rejectInstitutionRequest(id);
      }
      await fetchRequests(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Only pending bookings can be approved or rejected.");
    }
  };

  const pendingOnPage = requests.filter((request) => request.status === "Pending").length;

  const columns: Array<DataTableColumn<BookingRequest>> = [
    {
      key: "candidate",
      header: "Candidate name",
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
      key: "category",
      header: "License category",
      cell: (request) => request.licenseCategory,
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
      key: "bookingDate",
      header: "Booking date",
      cell: (request) => formatDate(request.createdAt),
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
            Review
          </Button>
          {request.status === "Pending" ? (
            <>
              <Button type="button" variant="success" size="sm" onClick={() => void handleStatusChange(request.id, "Approved")}>
                Approve
              </Button>
              <Button type="button" variant="danger" size="sm" onClick={() => void handleStatusChange(request.id, "Rejected")}>
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
      <PageHeader
        title="Booking requests"
        description="Review booking requests assigned to your institution and act on pending requests."
        action={
          <Button variant="secondary" onClick={() => void fetchRequests(page)} disabled={loading} state={loading ? { loading: true } : undefined}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        }
      />

      <Card padding="md" variant="soft">
        <p className="text-[14px] leading-6 text-[var(--text-secondary)]">
          Institutes are responsible for reviewing booking requests assigned to them. Pending requests can be approved or rejected according to workflow rules.
        </p>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card padding="sm">
          <StatBlock label="Total requests" value={loading ? "-" : total} />
        </Card>
        <Card padding="sm">
          <StatBlock label="Requests on this page" value={loading ? "-" : requests.length} />
        </Card>
        <Card padding="sm">
          <StatBlock label="Pending on this page" value={loading ? "-" : pendingOnPage} />
        </Card>
      </div>

      <Card className="space-y-4">
        <CardHeader
          title="Filter panel"
          description="Filter requests by search term, status, and license category."
        />
        <div className="grid gap-3 md:grid-cols-3">
          <Input
            value={search}
            onChange={(event) => {
              setPage(1);
              setSearch(event.target.value);
            }}
            label="Search"
            placeholder="Search by candidate, email, or phone"
            suffix={<Search size={16} className="text-[var(--text-tertiary)]" />}
          />

          <Select
            value={statusFilter}
            onChange={(event) => {
              setPage(1);
              setStatusFilter(event.target.value as (typeof STATUS_OPTIONS)[number]);
            }}
            label="Status"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option === "All" ? "All statuses" : option}
              </option>
            ))}
          </Select>

          <Select
            value={licenseFilter}
            onChange={(event) => {
              setPage(1);
              setLicenseFilter(event.target.value as (typeof LICENSE_CATEGORY_OPTIONS)[number]);
            }}
            label="License category"
          >
            {LICENSE_CATEGORY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option === "All" ? "All license categories" : `License ${option}`}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      {error ? <Alert variant="error">{error}</Alert> : null}

      <DataTable
        columns={columns}
        data={requests}
        getRowKey={(request) => request.id}
        loading={loading}
        emptyTitle="No booking requests found"
        emptyDescription="Requests for your institution will appear here."
      />

      <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className={`${ui.statLabel} sm:mb-0`}>
          Showing page {page} of {totalPages} - {total} total requests
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={loading || page <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            disabled={loading || page >= totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      {selectedRequest ? (
        <CandidateModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onApprove={() => handleStatusChange(selectedRequest.id, "Approved")}
          onReject={() => handleStatusChange(selectedRequest.id, "Rejected")}
        />
      ) : null}
    </PageContainer>
  );
}
