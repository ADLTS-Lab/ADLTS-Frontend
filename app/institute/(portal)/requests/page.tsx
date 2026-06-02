 "use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  FileText,
  Search,
  XCircle,
} from "lucide-react";
import { useI18n } from "@/i18n/useI18n";
import {
  BookingRequest,
  BookingStatus,
  getStoredBookingSnapshot,
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
  Input,
  PageContainer,
  PageHeader,
  Select,
  StatusBadge,
  ui,
} from "@/app/components/ui";
import CandidateModal from "./CandidateModal";

const LICENSE_CATEGORY_OPTIONS = ["All", "A", "B", "C", "D"] as const;
const STATUS_OPTIONS = ["All", "Pending", "Approved", "Rejected"] as const;

function getStatusTone(
  status: BookingStatus | string,
): "success" | "warning" | "error" | "neutral" | "pending" {
  if (status === "Approved") return "success";
  if (status === "Rejected") return "error";
  if (status === "Expired") return "warning";
  return "pending";
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(date);
}

export default function InstituteRequestsPage() {
  const { t } = useI18n();
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
      const fallbackBookings = getStoredBookingSnapshot();
      setError(err instanceof Error ? err.message : "Failed to load requests.");
      setRequests(fallbackBookings);
      setTotal(fallbackBookings.length);
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
      setError(err instanceof Error ? err.message : "Failed to update status.");
    }
  };

  return (
    <PageContainer width="wide" className="space-y-6">
      <PageHeader
        eyebrow={t("institutePortal") || "Institute Portal"}
        title={t("requests") || "Booking Requests"}
        description={t("requestsDesc") || "Review booking requests assigned to your institution."}
        action={
          <Button variant="secondary" onClick={() => void fetchRequests(page)} disabled={loading}>
            <Search className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            {t("refresh") || "Refresh"}
          </Button>
        }
      />

      <Card className="space-y-4">
        <CardHeader
          title={t("filterRequests") || "Filter requests"}
          description={t("filterHint") || "Narrow the list by keyword, status, and license category."}
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Input
            value={search}
            onChange={(event) => {
              setPage(1);
              setSearch(event.target.value);
            }}
            label={t("search") || "Search"}
            placeholder="Search by candidate, email, or phone"
            suffix={<Search size={16} className="text-[var(--adlts-ink-400)]" />}
          />

          <Select
            value={statusFilter}
            onChange={(event) => {
              setPage(1);
              setStatusFilter(event.target.value as (typeof STATUS_OPTIONS)[number]);
            }}
            label={t("status") || "Status"}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option === "All" ? t("allStatuses") || "All Statuses" : option}
              </option>
            ))}
          </Select>

          <Select
            value={licenseFilter}
            onChange={(event) => {
              setPage(1);
              setLicenseFilter(event.target.value as (typeof LICENSE_CATEGORY_OPTIONS)[number]);
            }}
            label={t("licenseCategory") || "License Category"}
          >
            {LICENSE_CATEGORY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option === "All" ? t("allLicenseCategories") || "All License Categories" : `License ${option}`}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      {error ? (
        <Alert variant="error">
          <AlertCircle className="h-4 w-4 text-[var(--adlts-error-700)]" />
          {error}
        </Alert>
      ) : null}

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[var(--adlts-surface-soft)] text-[var(--adlts-ink-500)] border-b border-[var(--adlts-divider)]">
              <tr>
                <th className="px-6 py-4 text-sm font-medium">Candidate Name</th>
                <th className="px-6 py-4 text-sm font-medium">Email</th>
                <th className="px-6 py-4 text-sm font-medium">Phone Number</th>
                <th className="px-6 py-4 text-sm font-medium">License Category</th>
                <th className="px-6 py-4 text-sm font-medium">Preferred Exam Date</th>
                <th className="px-6 py-4 text-sm font-medium">Preferred Session</th>
                <th className="px-6 py-4 text-sm font-medium">Booking Date</th>
                <th className="px-6 py-4 text-sm font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--adlts-divider)]">
              {loading && requests.length === 0 ? (
                <tr>
                  <td className="px-6 py-12" colSpan={8}>
                    <div className="flex items-center justify-center text-[var(--adlts-ink-500)]">
                      {t("loading") || "Loading requests..."}
                    </div>
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td className="px-6 py-12" colSpan={8}>
                    <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-3 text-center">
                      <FileText className="h-8 w-8 text-[var(--adlts-ink-400)]" />
                      <p className="font-medium text-[var(--adlts-ink-600)]">No booking requests found.</p>
                      <p className="text-sm text-[var(--adlts-ink-500)]">
                        Requests for your institution will appear here.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                requests.map((request) => (
                  <tr key={request.id} className="transition-colors hover:bg-[var(--adlts-surface-soft)]">
                    <td className="px-6 py-4 text-sm">
                      <button
                        type="button"
                        onClick={() => setSelectedRequest(request)}
                        className="max-w-[16rem] truncate text-left font-medium text-[var(--adlts-blue-700)] hover:text-[var(--adlts-blue-800)]"
                      >
                        {request.candidateDetails?.name || "Unknown Candidate"}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--adlts-ink-600)]">
                      {request.candidateDetails?.email || "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--adlts-ink-600)]">
                      {request.candidateDetails?.phone || "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--adlts-ink-600)]">
                      {request.licenseCategory}
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--adlts-ink-600)]">
                      {request.preferredDate || "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--adlts-ink-600)]">
                      {request.preferredSession || "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--adlts-ink-600)]">{formatDate(request.createdAt)}</td>
                    <td className="px-6 py-4 text-sm">
                      <StatusBadge status={request.status} tone={getStatusTone(request.status)} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className={`${ui.statLabel} sm:mb-0`}>
          Showing page {page} of {totalPages} · {total} total requests
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={loading || page <= 1}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Previous
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            disabled={loading || page >= totalPages}
          >
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
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
