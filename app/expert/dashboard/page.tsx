"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  CircleDashed,
  CircleX,
} from "lucide-react";
import {
  getReviewMetrics,
  getFlaggedCandidates,
  resolveAppeal,
  ReviewMetrics,
  ExamReview,
} from "@/services/expert.service";
import { extractApiError } from "@/services/api-utils";
import { Alert, Button, Card, CardHeader, PageContainer, PageHeader, StatusBadge, ui } from "@/app/components/ui";
import { useI18n } from "@/i18n/useI18n";

function getTone(status: ExamReview["status"]) {
  if (status === "Resolved") return "success";
  if (status === "In Progress") return "warning";
  return "neutral";
}

function getIcon(status: ExamReview["status"]) {
  if (status === "Resolved") return CheckCircle2;
  if (status === "In Progress") return AlertTriangle;
  return CircleDashed;
}

function statusLabel(status: ExamReview["status"]) {
  return status.replace("_", " ");
}

export default function ExpertDashboard() {
  const { t } = useI18n();
  const [metrics, setMetrics] = useState<ReviewMetrics | null>(null);
  const [reviews, setReviews] = useState<ExamReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [metricsRes, reviewsRes] = await Promise.all([getReviewMetrics(), getFlaggedCandidates()]);
      if (metricsRes.success) {
        setMetrics(metricsRes.data ?? null);
      } else {
        setMetrics(null);
      }

      if (reviewsRes.success) {
        setReviews(reviewsRes.data ?? []);
      } else {
        setReviews([]);
      }
    } catch (err) {
      setError(extractApiError(err, "Failed to load expert dashboard data"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resolveReview = async (reviewId: string) => {
    setError(null);
    setResolvingId(reviewId);
    try {
      await resolveAppeal(reviewId);
      setReviews((current) => current.filter((item) => item.id !== reviewId));
    } catch (resolveError) {
      setError(extractApiError(resolveError, "Failed to resolve review."));
    } finally {
      setResolvingId(null);
    }
  };

  const metricCards = [
    {
      label: "Pending Reviews",
      value: metrics?.pendingReviews ?? "—",
      tone: "warning" as const,
    },
    {
      label: "Completed Today",
      value: metrics?.completedToday ?? "—",
      tone: "success" as const,
    },
    {
      label: "Flagged Issues",
      value: metrics?.flaggedIssues ?? "—",
      tone: "info" as const,
    },
  ];

  return (
    <PageContainer width="wide" className="space-y-7">
      <PageHeader
        eyebrow={t("expertPortal") || "Expert Portal"}
        title={t("expertReview") || "Expert Review Portal"}
        description={t("expertReviewDescription") || "Review flagged appeals and resolve exam concerns."}
        action={
          <Button variant="secondary" onClick={() => void loadData()} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
        }
      />

      {error ? (
        <Alert variant="error">
          <div className="flex items-center gap-3">
            <CircleX className="h-4 w-4 text-[var(--adlts-error-700)]" />
            {error}
          </div>
        </Alert>
      ) : null}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((card) => (
          <Card key={card.label} padding="md" className="space-y-2">
            <p className={ui.statLabel}>{card.label}</p>
            {loading ? (
              <div className="h-9 w-20 rounded bg-[var(--adlts-surface-soft)] animate-pulse" />
            ) : (
              <p className="text-3xl font-semibold text-[var(--adlts-ink-900)]">{card.value}</p>
            )}
          </Card>
        ))}
      </section>

      <Card className="overflow-hidden p-0">
        <CardHeader
          title="Exam Review Queue"
          description="Resolve open issues on flagged examinations."
        />
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[var(--adlts-surface-soft)] text-sm text-[var(--adlts-ink-500)] border-b border-[var(--adlts-divider)]">
              <tr>
                <th className="px-6 py-4">Candidate Name</th>
                <th className="px-6 py-4">Exam Date</th>
                <th className="px-6 py-4">Issue Type</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--adlts-divider)]">
              {loading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4"><div className="h-5 w-36 rounded bg-[var(--adlts-surface-soft)] animate-pulse" /></td>
                    <td className="px-6 py-4"><div className="h-5 w-28 rounded bg-[var(--adlts-surface-soft)] animate-pulse" /></td>
                    <td className="px-6 py-4"><div className="h-5 w-44 rounded bg-[var(--adlts-surface-soft)] animate-pulse" /></td>
                    <td className="px-6 py-4"><div className="h-5 w-20 rounded bg-[var(--adlts-surface-soft)] animate-pulse" /></td>
                    <td className="px-6 py-4"><div className="h-8 w-20 rounded bg-[var(--adlts-surface-soft)] animate-pulse" /></td>
                  </tr>
                ))
              ) : reviews.length === 0 ? (
                <tr>
                  <td className="px-6 py-12 text-center text-[var(--adlts-ink-500)]" colSpan={5}>
                    All caught up! No pending reviews.
                  </td>
                </tr>
              ) : (
                reviews.map((review) => {
                  const StatusIcon = getIcon(review.status);
                  return (
                    <tr key={review.id} className="hover:bg-[var(--adlts-surface-soft)]">
                      <td className="px-6 py-4 font-medium text-[var(--adlts-ink-900)]">{review.candidateName}</td>
                      <td className="px-6 py-4 text-[var(--adlts-ink-700)]">
                        {new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(
                          new Date(review.examDate),
                        )}
                      </td>
                      <td className="px-6 py-4 text-[var(--adlts-ink-700)]">{review.issueType}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5">
                          <StatusIcon className="h-3.5 w-3.5 text-[var(--adlts-ink-500)]" />
                          <StatusBadge status={statusLabel(review.status)} tone={getTone(review.status)} />
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={resolvingId === review.id}
                          onClick={() => {
                            void resolveReview(review.id);
                          }}
                        >
                          {resolvingId === review.id ? "Resolving..." : "Resolve"}
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </PageContainer>
  );
}
