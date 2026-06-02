"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getInstituteOverview, InstituteOverview } from "@/services/institute.service";
import { approveInstitutionRequest, getRecentInstitutionRequests, rejectInstitutionRequest } from "@/services/institution.service";
import { subscribeToBookingChanges, type BookingRequest } from "@/services/booking.service";
import { extractApiError } from "@/services/api-utils";
import { Card } from "@/app/components/ui/Card";
import { useI18n } from "@/i18n/useI18n";
import BookingRequestDetailsModal from "@/components/BookingRequestDetailsModal";
import { CheckCircle, ChevronDown, Eye, MoreVertical, XCircle } from "lucide-react";

export default function InstituteDashboard() {
  const { t } = useI18n();
  const [overview, setOverview] = useState<InstituteOverview | null>(null);
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionBanner, setActionBanner] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<BookingRequest | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const actionsMenuRef = useRef<HTMLDivElement | null>(null);
  const actionBannerTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showActionBanner = (banner: { type: 'success' | 'error'; message: string }) => {
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

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRequestAction = async (request: BookingRequest, action: 'approve' | 'reject') => {
    if (request.status !== 'Pending') {
      showActionBanner({
        type: 'error',
        message: 'Only pending bookings can be approved or rejected.',
      });
      return;
    }

    try {
      if (action === 'approve') {
        await approveInstitutionRequest(request.id);
      } else {
        await rejectInstitutionRequest(request.id);
      }

      setSelectedRequest(null);
      await loadAndRefresh();
      showActionBanner({
        type: 'success',
        message: `${action === 'approve' ? 'Approved' : 'Rejected'} request for ${request.candidateDetails?.name || 'candidate'}.`,
      });
    } catch (err) {
      showActionBanner({
        type: 'error',
        message: extractApiError(err, 'Failed to update booking status.'),
      });
    }
  };

  const openRequestDetails = (request: BookingRequest) => {
    setSelectedRequest(request);
    setOpenDropdownId(null);
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
      setError(extractApiError(err, 'Failed to refresh dashboard data'));
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {actionBanner && (
        <div
          className={[
            'rounded-xl border p-4 text-sm shadow-sm',
            actionBanner.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-rose-200 bg-rose-50 text-rose-700',
          ].join(' ')}
        >
          {actionBanner.message}
        </div>
      )}
      {error && (
        <div className="border border-rose-200 bg-rose-50 rounded-lg p-4">
          <p className="text-sm text-rose-700">{error}</p>
        </div>
      )}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Institute Portal</h1>
          <p className="text-slate-500 mt-1">Manage your driving school candidates and schedules.</p>
        </div>
        <Link
          href="/candidate/register"
          className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 font-semibold text-white transition hover:bg-primary-light"
        >
          Register Candidate
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: "Active Students", value: overview?.activeStudents ?? "—", color: "text-blue-600" },
          { label: "Upcoming Exams", value: overview?.upcomingExams ?? "—", color: "text-indigo-600" },
          { label: "Average Pass Rate", value: overview ? `${overview.passRate}%` : "—", color: "text-emerald-600" },
        ].map((stat, i) => (
          <Card key={i} className="p-6">
            <h3 className="text-sm font-medium text-slate-500">{stat.label}</h3>
            {loading ? (
              <div className="h-9 w-20 bg-slate-200 animate-pulse rounded mt-2"></div>
            ) : (
              <p className={`text-3xl font-bold mt-2 ${stat.color}`}>{stat.value}</p>
            )}
          </Card>
        ))}
      </div>

      {/* Table Section */}
      <Card className="overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
          <h2 className="text-lg font-semibold text-slate-900">Recent Enrollments</h2>
          <Link
            href="/institute/requests"
            className="inline-flex items-center justify-center rounded-xl border border-primary bg-white px-4 py-2 text-sm font-semibold text-primary transition hover:bg-slate-50"
          >
            View All
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-medium">Candidate Name</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Phone Number</th>
                <th className="px-6 py-4 font-medium">Booking Date</th>
                <th className="px-6 py-4 font-medium">Preferred Exam Date</th>
                <th className="px-6 py-4 font-medium">Preferred Session</th>
                <th className="px-6 py-4 font-medium">License Category</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><div className="h-5 w-32 bg-slate-100 animate-pulse rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-5 w-24 bg-slate-100 animate-pulse rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-5 w-24 bg-slate-100 animate-pulse rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-5 w-16 bg-slate-100 animate-pulse rounded"></div></td>
                  </tr>
                ))
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-slate-400">No recent requests.</td>
                </tr>
              ) : (
                requests.map((request) => (
                  <tr key={request.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      <button
                        type="button"
                        onClick={() => openRequestDetails(request)}
                        className="text-left font-semibold text-blue-700 hover:text-blue-900 transition"
                      >
                        {request.candidateDetails?.name || 'Unknown Candidate'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{request.candidateDetails?.email || '—'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{request.candidateDetails?.phone || '—'}</td>
                    <td className="px-6 py-4">
                      {new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(request.createdAt))}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{request.preferredDate || '—'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{request.preferredSession || '—'}</td>
                    <td className="px-6 py-4">{request.licenseCategory}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        request.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' : 
                        request.status === 'Pending' ? 'bg-amber-100 text-amber-800' : 
                        request.status === 'Expired' ? 'bg-slate-100 text-slate-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="relative inline-block text-left" ref={actionsMenuRef}>
                        <button
                          type="button"
                          onClick={() => setOpenDropdownId((current) => (current === request.id ? null : request.id))}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                          <MoreVertical className="h-4 w-4" />
                          Actions
                          <ChevronDown className="h-4 w-4 text-slate-400" />
                        </button>

                        {openDropdownId === request.id && (
                          <div className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                            <button
                              type="button"
                              onClick={() => openRequestDetails(request)}
                              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                            >
                              <Eye className="h-4 w-4 text-slate-400" />
                              {t('viewCandidate')}
                            </button>
                            {request.status === 'Pending' && (
                              <>
                                <button
                                  type="button"
                                  onClick={async () => {
                                    setOpenDropdownId(null);
                                    await handleRequestAction(request, 'approve');
                                  }}
                                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-emerald-700 transition hover:bg-emerald-50"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                  Approve Request
                                </button>
                                <button
                                  type="button"
                                  onClick={async () => {
                                    setOpenDropdownId(null);
                                    await handleRequestAction(request, 'reject');
                                  }}
                                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-rose-700 transition hover:bg-rose-50"
                                >
                                  <XCircle className="h-4 w-4" />
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
          onApprove={() => void handleRequestAction(selectedRequest, 'approve')}
          onReject={() => void handleRequestAction(selectedRequest, 'reject')}
          title="Candidate Details"
        />
      )}
    </div>
  );
}
