"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { listActiveExamsSafe, type ActiveExam } from "@/services/exams.service";
import {
  Alert,
  Button,
  Card,
  CardHeader,
  EmptyState,
  PageContainer,
  PageHeader,
  ProgressBar,
  StatBlock,
  StatusBadge,
  ui,
} from "@/app/components/ui";

function getStatusTone(status: ActiveExam["status"] | string) {
  switch (status) {
    case "Warning":
      return "warning";
    case "Review":
      return "error";
    case "Excellent":
      return "success";
    default:
      return "info";
  }
}

export default function AdminActiveExamsPage() {
  const [activeExams, setActiveExams] = useState<ActiveExam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadActiveExams = async () => {
    setIsLoading(true);
    setError("");

    try {
      const { data, error: nextError } = await listActiveExamsSafe();
      setActiveExams(data);
      setError(nextError ?? "");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadActiveExams();
    const polling = setInterval(() => {
      void loadActiveExams();
    }, 30 * 1000);

    return () => clearInterval(polling);
  }, []);

  const metricValue = (value: number) => (isLoading ? "-" : value);

  return (
    <PageContainer width="wide" className="space-y-6">
      <PageHeader
        title="Active exams monitor"
        description="Review running exams, progress, live score, violations, and status indicators."
        action={
          <Button variant="outline" size="sm" onClick={() => void loadActiveExams()} disabled={isLoading} state={isLoading ? { loading: true } : undefined}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        }
      />

      {error ? <Alert variant="error">{error}</Alert> : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Active exams" value={metricValue(activeExams.length)} />
        <Kpi label="Warnings" value={metricValue(activeExams.filter((exam) => exam.status === "Warning").length)} />
        <Kpi label="Reviews" value={metricValue(activeExams.filter((exam) => exam.status === "Review").length)} />
        <Kpi label="Excellent" value={metricValue(activeExams.filter((exam) => exam.status === "Excellent").length)} />
      </section>

      <Card padding="md" variant="soft">
        <p className="text-[14px] leading-6 text-[var(--text-secondary)]">
          This monitor refreshes periodically and can be refreshed manually when operators need the latest connected backend state.
        </p>
      </Card>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} padding="md" className="animate-pulse space-y-4">
              <div className="h-5 w-32 rounded-[6px] bg-[var(--surface-2)]" />
              <div className="h-4 w-full rounded-[6px] bg-[var(--surface-2)]" />
              <div className="h-20 rounded-[8px] bg-[var(--surface-2)]" />
            </Card>
          ))}
        </div>
      ) : activeExams.length === 0 ? (
        <EmptyState title="No active exams" description="No active exams are currently running." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {activeExams.map((exam) => (
            <Card key={exam.id} className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className={ui.statLabel}>{exam.center}</p>
                  <h2 className="mt-1 text-[18px] font-semibold text-[var(--text-primary)]">{exam.candidateName}</h2>
                </div>
                <StatusBadge status={exam.status} tone={getStatusTone(exam.status)} />
              </div>

              <ProgressBar value={exam.progress} label="Progress" />

              <div className="grid grid-cols-2 gap-3 text-[14px]">
                <Metric label="Live score" value={`${exam.liveScore}%`} />
                <Metric label="Violations" value={exam.violations.toString()} />
              </div>
            </Card>
          ))}
        </div>
      )}

      <Card padding="md">
        <CardHeader title="Status glossary" />
        <div className="grid gap-3 md:grid-cols-4">
          <GlossaryItem status="Stable" description="Running without a current warning." />
          <GlossaryItem status="Warning" description="Requires operator attention." />
          <GlossaryItem status="Excellent" description="Running with strong indicators." />
          <GlossaryItem status="Review" description="Requires review before it is closed." />
        </div>
      </Card>
    </PageContainer>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] border border-[var(--border)] bg-[var(--surface-2)] p-3">
      <p className={`${ui.statLabel} mb-1`}>{label}</p>
      <p className="font-semibold text-[var(--text-primary)]">{value}</p>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string | number }) {
  return (
    <Card padding="md">
      <StatBlock label={label} value={value} />
    </Card>
  );
}

function GlossaryItem({ status, description }: { status: ActiveExam["status"]; description: string }) {
  return (
    <div className="rounded-[8px] border border-[var(--border)] bg-[var(--surface-2)] p-3">
      <StatusBadge status={status} tone={getStatusTone(status)} />
      <p className="mt-2 text-[13px] leading-5 text-[var(--text-secondary)]">{description}</p>
    </div>
  );
}
