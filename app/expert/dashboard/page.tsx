"use client";

import { useEffect, useState } from "react";
import { getReviewMetrics, getFlaggedCandidates, resolveAppeal, ReviewMetrics, ExamReview } from "@/services/expert.service";
import { extractApiError } from "@/services/api-utils";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { useI18n } from "@/i18n/useI18n";

export default function ExpertDashboard() {
  const { t } = useI18n();
  const [metrics, setMetrics] = useState<ReviewMetrics | null>(null);
  const [reviews, setReviews] = useState<ExamReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [metricsRes, reviewsRes] = await Promise.all([getReviewMetrics(), getFlaggedCandidates()]);
        if (metricsRes.success) setMetrics(metricsRes.data);
        if (reviewsRes.success) setReviews(reviewsRes.data);
      } catch (err) {
        setError(extractApiError(err, "Failed to load expert data"));
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {error && (
        <div className="border border-rose-200 bg-rose-50 rounded-lg p-4">
          <p className="text-sm text-rose-700">{error}</p>
        </div>
      )}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Expert Review Portal</h1>
          <p className="text-slate-500 mt-1">Review flagged exams and ensure assessment integrity.</p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: "Pending Reviews", value: metrics?.pendingReviews, color: "text-amber-600" },
          { label: "Completed Today", value: metrics?.completedToday, color: "text-emerald-600" },
          { label: "Flagged Issues", value: metrics?.flaggedIssues, color: "text-rose-600" },
        ].map((stat, i) => (
          <Card key={i} className="p-6 border-l-4 border-l-slate-200 hover:border-l-blue-500 transition-all">
            <h3 className="text-sm font-medium text-slate-500">{stat.label}</h3>
            {loading ? (
              <div className="h-9 w-16 bg-slate-200 animate-pulse rounded mt-2"></div>
            ) : (
              <p className={`text-3xl font-bold mt-2 ${stat.color}`}>{stat.value || "0"}</p>
            )}
          </Card>
        ))}
      </div>

      {/* Table Section */}
      <Card className="overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
          <h2 className="text-lg font-semibold text-slate-900">Exam Review Queue</h2>
          <Button variant="secondary" className="text-sm">Filter</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-medium">Candidate Name</th>
                <th className="px-6 py-4 font-medium">Exam Date</th>
                <th className="px-6 py-4 font-medium">Issue Type</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><div className="h-5 w-32 bg-slate-100 animate-pulse rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-5 w-24 bg-slate-100 animate-pulse rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-5 w-40 bg-slate-100 animate-pulse rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-5 w-16 bg-slate-100 animate-pulse rounded"></div></td>
                    <td className="px-6 py-4 text-right"><div className="h-8 w-20 bg-slate-100 animate-pulse rounded inline-block"></div></td>
                  </tr>
                ))
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">All caught up! No pending reviews.</td>
                </tr>
              ) : (
                reviews.map((review) => (
                  <tr key={review.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{review.candidateName}</td>
                    <td className="px-6 py-4">
                      {new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(review.examDate))}
                    </td>
                    <td className="px-6 py-4 text-rose-600 font-medium">{review.issueType}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        review.status === 'In Progress' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'
                      }`}>
                        {review.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="primary"
                        className="py-1 px-3 text-xs"
                        disabled={resolvingId === review.id}
                        onClick={async () => {
                          setError(null);
                          setResolvingId(review.id);
                          try {
                            await resolveAppeal(review.id);
                            setReviews((current) => current.filter((item) => item.id !== review.id));
                          } catch (resolveError) {
                            setError(extractApiError(resolveError, "Failed to resolve review."));
                          } finally {
                            setResolvingId(null);
                          }
                        }}
                      >
                        {resolvingId === review.id ? "Resolving..." : "Resolve"}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
