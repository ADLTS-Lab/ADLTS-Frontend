"use client";

import { useEffect, useState } from "react";
import { getInstituteOverview, InstituteOverview } from "@/services/institute.service";
import { approveInstitutionRequest, getRecentInstitutionRequests, rejectInstitutionRequest } from "@/services/institution.service";
import { subscribeToBookingChanges, type BookingRequest } from "@/services/booking.service";
import { extractApiError } from "@/services/api-utils";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { useI18n } from "@/i18n/useI18n";
import BookingRequestDetailsModal from "@/components/BookingRequestDetailsModal";

export default function InstituteDashboard() {
  const { t } = useI18n();
  const [overview, setOverview] = useState<InstituteOverview | null>(null);
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<BookingRequest | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const overviewRes = await getInstituteOverview();
        if (overviewRes.success) setOverview(overviewRes.data);
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

  const handleRequestAction = async (request: BookingRequest, action: 'approve' | 'reject') => {
    try {
      if (action === 'approve') {
        await approveInstitutionRequest(request.id);
      } else {
        await rejectInstitutionRequest(request.id);
      }

      setSelectedRequest(null);
      await loadAndRefresh();
    } catch (err) {
      setError(extractApiError(err, 'Failed to update booking status.'));
    }
  };

  const loadAndRefresh = async () => {
    try {
      const overviewRes = await getInstituteOverview();
      if (overviewRes.success) setOverview(overviewRes.data);
      const requestsRes = await getRecentInstitutionRequests(5);
      setRequests(requestsRes);
    } catch (err) {
      setError(extractApiError(err, 'Failed to refresh dashboard data'));
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
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
        <Button variant="primary">Register Candidate</Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: "Active Students", value: overview?.activeStudents, color: "text-blue-600" },
          { label: "Upcoming Exams", value: overview?.upcomingExams, color: "text-indigo-600" },
          { label: "Average Pass Rate", value: overview ? `${overview.passRate}%` : undefined, color: "text-emerald-600" },
        ].map((stat, i) => (
          <Card key={i} className="p-6">
            <h3 className="text-sm font-medium text-slate-500">{stat.label}</h3>
            {loading ? (
              <div className="h-9 w-20 bg-slate-200 animate-pulse rounded mt-2"></div>
            ) : (
              <p className={`text-3xl font-bold mt-2 ${stat.color}`}>{stat.value || "—"}</p>
            )}
          </Card>
        ))}
      </div>

      {/* Table Section */}
      <Card className="overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
          <h2 className="text-lg font-semibold text-slate-900">Recent Enrollments</h2>
          <Button variant="secondary" className="text-sm">View All</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-medium">Candidate Name</th>
                <th className="px-6 py-4 font-medium">Booking Date</th>
                <th className="px-6 py-4 font-medium">License Category</th>
                <th className="px-6 py-4 font-medium">Status</th>
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
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">No recent requests.</td>
                </tr>
              ) : (
                requests.map((request) => (
                  <tr key={request.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      <button
                        type="button"
                        onClick={() => setSelectedRequest(request)}
                        className="text-left font-semibold text-blue-700 hover:text-blue-900 transition"
                      >
                        {request.candidateDetails?.name || 'Unknown Candidate'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      {new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(request.createdAt))}
                    </td>
                    <td className="px-6 py-4">{request.licenseCategory}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        request.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' : 
                        request.status === 'Pending' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {request.status}
                      </span>
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
