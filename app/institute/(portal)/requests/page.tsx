"use client";

import React, { useEffect, useState } from "react";
import { AlertCircle, FileText, RefreshCw, Search, ChevronLeft, ChevronRight, CheckCircle, XCircle } from "lucide-react";

import { useI18n } from "@/i18n/useI18n";
import { BookingRequest, BookingStatus, getStoredBookingSnapshot, subscribeToBookingChanges } from "@/services/booking.service";
import { approveInstitutionRequest, getInstitutionRequests, rejectInstitutionRequest } from "@/services/institution.service";

import CandidateModal from "./CandidateModal";

const LICENSE_CATEGORY_OPTIONS = ["All", "A", "B", "C", "D"] as const;
const STATUS_OPTIONS = ["All", "Pending", "Approved", "Rejected"] as const;

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
      const message = err instanceof Error ? err.message : "Failed to load requests.";
      setError(message);
      setRequests(fallbackBookings);
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
      const updated = newStatus === "Approved"
        ? await approveInstitutionRequest(id)
        : await rejectInstitutionRequest(id);

      if (updated) {
        await fetchRequests(page);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status.");
    }
  };

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case "Approved":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
            <CheckCircle className="h-3 w-3" />
            {t("approved") || "Approved"}
          </span>
        );
      case "Rejected":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-medium text-rose-800">
            <XCircle className="h-3 w-3" />
            {t("rejected") || "Rejected"}
          </span>
        );
      case "Expired":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800">
            <AlertCircle className="h-3 w-3" />
            Expired
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
            <AlertCircle className="h-3 w-3" />
            {t("pending") || "Pending"}
          </span>
        );
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t("requests") || "Booking Requests"}</h1>
          <p className="mt-1 text-sm text-slate-500">Manage candidate booking requests for your institution.</p>
        </div>
        <button
          onClick={() => void fetchRequests(page)}
          disabled={loading}
          className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {t("refresh") || "Refresh"}
        </button>
      </div>

      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-3">
        <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={(event) => {
              setPage(1);
              setSearch(event.target.value);
            }}
            placeholder="Search by candidate, email, or phone"
            className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
          />
        </label>

        <select
          value={statusFilter}
          onChange={(event) => {
            setPage(1);
            setStatusFilter(event.target.value as (typeof STATUS_OPTIONS)[number]);
          }}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-500"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option === 'All' ? 'All Statuses' : option}
            </option>
          ))}
        </select>

        <select
          value={licenseFilter}
          onChange={(event) => {
            setPage(1);
            setLicenseFilter(event.target.value as (typeof LICENSE_CATEGORY_OPTIONS)[number]);
          }}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-500"
        >
          {LICENSE_CATEGORY_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option === 'All' ? 'All License Categories' : `License ${option}`}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="flex items-center rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <AlertCircle className="mr-2 h-5 w-5 shrink-0" />
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading && requests.length === 0 ? (
          <div className="p-10 text-center text-slate-500">Loading requests...</div>
        ) : requests.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50">
              <FileText className="h-8 w-8 text-slate-300" />
            </div>
            <p className="font-medium text-slate-500">No booking requests found.</p>
            <p className="mt-1 text-sm text-slate-400">Requests assigned to your institution will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto lg:overflow-visible">
            <table className="w-full table-fixed divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="w-[17%] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Candidate Name</th>
                  <th className="w-[18%] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Email</th>
                  <th className="w-[13%] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Phone Number</th>
                  <th className="w-[10%] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">License Category</th>
                  <th className="w-[14%] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Preferred Exam Date</th>
                  <th className="w-[11%] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Preferred Session</th>
                  <th className="w-[12%] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Booking Date</th>
                  <th className="w-[8%] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {requests.map((request) => (
                  <tr key={request.id} className="transition hover:bg-slate-50">
                    <td className="truncate px-4 py-3 font-medium text-slate-900">
                      <button
                        onClick={() => setSelectedRequest(request)}
                        className="max-w-full truncate text-left text-blue-700 hover:text-blue-900 hover:underline transition font-semibold"
                      >
                        {request.candidateDetails?.name || 'Unknown Candidate'}
                      </button>
                    </td>
                    <td className="truncate px-4 py-3 text-sm text-slate-600">{request.candidateDetails?.email || '—'}</td>
                    <td className="truncate px-4 py-3 text-sm text-slate-600">{request.candidateDetails?.phone || '—'}</td>
                    <td className="truncate px-4 py-3 text-sm text-slate-600">{request.licenseCategory}</td>
                    <td className="truncate px-4 py-3 text-sm text-slate-600">{request.preferredDate}</td>
                    <td className="truncate px-4 py-3 text-sm text-slate-600">{request.preferredSession}</td>
                    <td className="truncate px-4 py-3 text-sm text-slate-600">{new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(request.createdAt))}</td>
                    <td className="px-4 py-3">{getStatusBadge(request.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm sm:flex-row">
        <div>
          Showing page {page} of {totalPages} · {total} total requests
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={loading || page <= 1}
            className="inline-flex items-center rounded-lg border border-slate-200 px-3 py-2 font-medium transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Previous
          </button>
          <button
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            disabled={loading || page >= totalPages}
            className="inline-flex items-center rounded-lg border border-slate-200 px-3 py-2 font-medium transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </button>
        </div>
      </div>

      {selectedRequest && (
        <CandidateModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onApprove={() => void handleStatusChange(selectedRequest.id, 'Approved')}
          onReject={() => {
            const confirmed = window.confirm('Are you sure you want to reject this request?');
            if (!confirmed) return;
            void handleStatusChange(selectedRequest.id, 'Rejected');
          }}
        />
      )}
    </div>
  );
}
