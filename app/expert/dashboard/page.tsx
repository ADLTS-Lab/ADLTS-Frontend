"use client";

import { useEffect, useState } from "react";
import { CircleX, RefreshCw, ShieldCheck } from "lucide-react";
import {
  getFlaggedCandidates,
  getReviewMetrics,
  resolveAppeal,
  type ExamReview,
  type ReviewMetrics,
} from "@/services/expert.service";
import { extractApiError } from "@/services/api-utils";
import {
  Alert,
  Button,
  Card,
  CardHeader,
  DataTable,
  PageContainer,
  PageHeader,
  StatBlock,
  StatusBadge,
  type DataTableColumn,
} from "@/app/components/ui";

function getTone(status: ExamReview["status"]) {
  if (status === "Resolved") return "success";
  if (status === "In Progress") return "warning";
  return "neutral";
}

function formatTimestamp(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export default function ExpertDashboard() {
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
      setMetrics(null);
      setReviews([]);
      setError(extractApiError(err, "Failed to load expert dashboard data"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
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
      label: "Pending reviews",
      value: metrics?.pendingReviews,
    },
    {
      label: "Completed today",
      value: metrics?.completedToday,
    },
    {
      label: "Flagged issues",
      value: metrics?.flaggedIssues,
    },
  ];

  const columns: Array<DataTableColumn<ExamReview>> = [
    {
      key: "candidate",
      header: "Candidate name",
      cell: (review) => review.candidateName,
    },
    {
      key: "examDate",
      header: "Exam date",
      cell: (review) => formatTimestamp(review.examDate),
    },
    {
      key: "issue",
      header: "Issue type",
      cell: (review) => review.issueType,
    },
    {
      key: "status",
      header: "Status",
      cell: (review) => <StatusBadge status={review.status} tone={getTone(review.status)} />,
    },
    {
      key: "action",
      header: "Action",
      cell: (review) => (
        <Button
          variant="secondary"
          size="sm"
          disabled={resolvingId === review.id}
          state={resolvingId === review.id ? { loading: true } : undefined}
          onClick={() => void resolveReview(review.id)}
        >
          Resolve
        </Button>
      ),
    },
  ];

  return (
    <PageContainer width="wide" className="space-y-6">
      <PageHeader
        title="Expert review portal"
        description="Monitor flagged test outcomes, review appeal context, and resolve exam concerns."
        action={
          <Button variant="secondary" onClick={() => void loadData()} disabled={loading} state={loading ? { loading: true } : undefined}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        }
      />

      {error ? (
        <Alert variant="error">
          <div className="flex items-center gap-3">
            <CircleX className="h-4 w-4 text-[var(--danger)]" />
            {error}
          </div>
        </Alert>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-3">
        {metricCards.map((card) => (
          <Card key={card.label} padding="md" variant="metric">
            <StatBlock label={card.label} value={loading ? "-" : card.value ?? "-"} />
          </Card>
        ))}
      </section>

      <Card padding="none" className="overflow-hidden">
        <CardHeader
          title="Review queue"
          description="Resolve only after reviewing the available exam context, issue type, and supporting evidence."
          action={<ShieldCheck className="h-5 w-5 text-[var(--accent)]" />}
        />
        <DataTable
          columns={columns}
          data={reviews}
          getRowKey={(review) => review.id}
          loading={loading}
          emptyTitle="All caught up"
          emptyDescription="No pending reviews."
          className="rounded-none border-x-0 border-b-0"
        />
      </Card>
    </PageContainer>
  );
}
