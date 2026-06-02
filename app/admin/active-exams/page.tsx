"use client";

import { useEffect, useState } from "react";
import { listActiveExamsSafe, type ActiveExam } from "@/services/exams.service";
import { useI18n } from "@/i18n/useI18n";
import {
  Alert,
  Button,
  Card,
  CardHeader,
  PageContainer,
  PageHeader,
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
  const { t } = useI18n();
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

  return (
    <PageContainer width="wide">
      <PageHeader
        eyebrow={t("adminPortal")}
        title={t("activeExams_monitor_title") || "Active Exams"}
        description={t("activeExams_monitor_subtitle") || "Live exam monitoring and progress insights."}
        action={
          <Button variant="outline" size="sm" onClick={() => void loadActiveExams()}>
            Refresh
          </Button>
        }
      />

      {error ? <Alert variant="error">{error}</Alert> : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label={t("active") || "Active exams"} value={activeExams.length} />
        <Kpi label={t("warnings") || "Warnings"} value={activeExams.filter((exam) => exam.status === "Warning").length} />
        <Kpi label={t("reviews") || "Reviews"} value={activeExams.filter((exam) => exam.status === "Review").length} />
        <Kpi
          label={t("excellent") || "Excellent"}
          value={activeExams.filter((exam) => exam.status === "Excellent").length}
        />
      </section>

      {isLoading ? <Alert variant="info">{t("loadingCandidates") || "Loading active exams…"}</Alert> : activeExams.length === 0 ? (
        <Card padding="lg" className="text-center">
          <p className="text-sm text-[var(--adlts-ink-600)]">No active exams are currently running.</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {activeExams.map((exam) => (
            <Card key={exam.id} className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className={ui.statLabel}>{exam.center}</p>
                  <h2 className="mt-1 text-lg font-semibold text-[var(--adlts-ink-900)]">{exam.candidateName}</h2>
                </div>
                <StatusBadge status={exam.status} tone={getStatusTone(exam.status)} />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-[var(--adlts-ink-500)]">
                  <span>{t("metric_progress")}</span>
                  <span>{exam.progress}%</span>
                </div>
                <div className="h-2 rounded-full bg-[var(--adlts-surface-soft)] overflow-hidden">
                  <div className="h-full rounded-full bg-[var(--adlts-blue-600)]" style={{ width: `${exam.progress}%` }} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <Metric label={t("metric_liveScore")} value={`${exam.liveScore}%`} />
                <Metric label={t("metric_violations")} value={exam.violations.toString()} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  );
}

const Metric = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-md border border-[var(--adlts-border)] bg-[var(--adlts-surface-soft)] p-3">
    <p className={`${ui.statLabel} mb-1`}>{label}</p>
    <p className="font-semibold text-[var(--adlts-ink-900)]">{value}</p>
  </div>
);

const Kpi = ({ label, value }: { label: string; value: number }) => (
  <Card padding="md" className="space-y-1">
    <p className={ui.statLabel}>{label}</p>
    <p className="text-2xl font-semibold text-[var(--adlts-ink-900)]">{value}</p>
  </Card>
);
