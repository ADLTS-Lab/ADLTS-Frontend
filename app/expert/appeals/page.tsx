"use client";

import { useEffect, useState } from "react";
import { CircleX, RefreshCw, ShieldCheck } from "lucide-react";
import {
  Alert,
  Button,
  Card,
  CardHeader,
  DataTable,
  PageContainer,
  PageHeader,
  StatusBadge,
  type DataTableColumn,
} from "@/app/components/ui";
import { extractApiError } from "@/services/api-utils";
import { getFlaggedCandidates, resolveAppeal, type ExamReview } from "@/services/expert.service";

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

export default function ExpertAppealsPage() {
  const [appeals, setAppeals] = useState<ExamReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [resolvingId, setResolvingId] = useState("");

  const loadAppeals = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getFlaggedCandidates();
      setAppeals(response.data ?? []);
    } catch (err) {
      setAppeals([]);
      setError(extractApiError(err, "Unable to load appeals."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAppeals();
  }, []);

  const resolveReview = async (reviewId: string) => {
    setError("");
    setResolvingId(reviewId);

    try {
      await resolveAppeal(reviewId);
      setAppeals((current) => current.filter((item) => item.id !== reviewId));
    } catch (err) {
      setError(extractApiError(err, "Unable to resolve appeal."));
    } finally {
      setResolvingId("");
    }
  };

  const columns: Array<DataTableColumn<ExamReview>> = [
    {
      key: "candidate",
      header: "Candidate",
      cell: (appeal) => appeal.candidateName,
    },
    {
      key: "examDate",
      header: "Submitted",
      cell: (appeal) => formatTimestamp(appeal.examDate),
    },
    {
      key: "issue",
      header: "Issue",
      cell: (appeal) => appeal.issueType,
    },
    {
      key: "status",
      header: "Status",
      cell: (appeal) => <StatusBadge status={appeal.status} tone={getTone(appeal.status)} />,
    },
    {
      key: "action",
      header: "Action",
      cell: (appeal) => (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={resolvingId === appeal.id}
          state={resolvingId === appeal.id ? { loading: true } : undefined}
          onClick={() => void resolveReview(appeal.id)}
        >
          Resolve
        </Button>
      ),
    },
  ];

  return (
    <PageContainer width="wide" className="space-y-6">
      <PageHeader
        title="Appeal review"
        description="Review pending candidate appeals and resolve them using the current expert appeal APIs."
        action={
          <Button variant="secondary" onClick={() => void loadAppeals()} disabled={loading} state={loading ? { loading: true } : undefined}>
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

      <Card padding="none" className="overflow-hidden">
        <CardHeader
          title="Pending appeals"
          description="Resolve only after reviewing the appeal context and any available exam report."
          action={<ShieldCheck className="h-5 w-5 text-[var(--accent)]" />}
        />
        <DataTable
          columns={columns}
          data={appeals}
          getRowKey={(appeal) => appeal.id}
          loading={loading}
          emptyTitle="No pending appeals"
          emptyDescription="There are no pending candidate appeals in the current queue."
          className="rounded-none border-x-0 border-b-0"
        />
      </Card>
    </PageContainer>
  );
}
