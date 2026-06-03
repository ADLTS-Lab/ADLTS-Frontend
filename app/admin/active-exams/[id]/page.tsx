"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { useParams } from "next/navigation";
import {
  abortActiveExam,
  getActiveExamLiveMetrics,
  getActiveExamMonitorStatus,
  type ActiveExamLiveMetrics,
  type ActiveExamMonitorStatus,
} from "@/services/exams.service";
import {
  Alert,
  Button,
  ButtonLink,
  Card,
  CardHeader,
  PageContainer,
  PageHeader,
  ProgressBar,
  StatBlock,
  StatusBadge,
} from "@/app/components/ui";

function formatDate(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export default function AdminActiveExamDetailPage() {
  const params = useParams<{ id: string }>();
  const testId = params.id;
  const [status, setStatus] = useState<ActiveExamMonitorStatus | null>(null);
  const [live, setLive] = useState<ActiveExamLiveMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAborting, setIsAborting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadMonitor() {
    setError("");
    setIsLoading(true);
    try {
      const [statusResult, liveResult] = await Promise.all([
        getActiveExamMonitorStatus(testId),
        getActiveExamLiveMetrics(testId),
      ]);
      setStatus(statusResult);
      setLive(liveResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load active exam monitor.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadMonitor();
    const polling = setInterval(() => void loadMonitor(), 15_000);
    return () => clearInterval(polling);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testId]);

  async function handleAbort() {
    const confirmed = window.confirm("Abort this active exam? This is an operational emergency action.");
    if (!confirmed) return;

    setError("");
    setSuccess("");
    setIsAborting(true);
    try {
      await abortActiveExam(testId);
      setSuccess("Exam aborted.");
      await loadMonitor();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to abort exam.");
    } finally {
      setIsAborting(false);
    }
  }

  return (
    <PageContainer width="wide" className="space-y-6">
      <PageHeader
        title="Active exam detail"
        description="Poll backend monitor status and live scoring metrics for a running test."
        action={
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" onClick={() => void loadMonitor()} disabled={isLoading} state={isLoading ? { loading: true } : undefined}>
              <RefreshCw size={16} />
              Refresh
            </Button>
            <ButtonLink href="/admin/active-exams" variant="outline">Back to monitor</ButtonLink>
          </div>
        }
      />

      {error ? <Alert variant="error">{error}</Alert> : null}
      {success ? <Alert variant="success">{success}</Alert> : null}

      <section className="grid gap-4 md:grid-cols-4">
        <Card padding="md" variant="metric"><StatBlock label="Test ID" value={testId} /></Card>
        <Card padding="md" variant="metric"><StatBlock label="Device ID" value={isLoading ? "-" : status?.deviceId || "-"} /></Card>
        <Card padding="md" variant="metric"><StatBlock label="Frame count" value={isLoading ? "-" : live?.frameCount ?? 0} /></Card>
        <Card padding="md" variant="metric">
          <p className="text-[12px] font-medium text-[var(--text-secondary)]">Status</p>
          <div className="mt-2"><StatusBadge status={status?.status || live?.status || "-"} /></div>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Card padding="lg">
          <CardHeader title="Live metrics" description="The current backend live endpoint returns polling metrics, not a video stream." />
          <div className="grid gap-4 md:grid-cols-2">
            <Card padding="sm" variant="soft"><StatBlock label="Current session" value={isLoading ? "-" : live?.currentSession ?? "-"} /></Card>
            <Card padding="sm" variant="soft"><StatBlock label="Running average IoU" value={isLoading ? "-" : live ? live.runningAvgIoU.toFixed(2) : "-"} /></Card>
            <Card padding="sm" variant="soft"><StatBlock label="Device health" value={isLoading ? "-" : live?.deviceHealthOK ? "Healthy" : "Not confirmed"} /></Card>
            <Card padding="sm" variant="soft"><StatBlock label="Started" value={isLoading ? "-" : formatDate(status?.startedAt)} /></Card>
          </div>
          <div className="mt-5">
            <ProgressBar value={Math.min(100, Math.round((live?.runningAvgIoU ?? 0) * 100))} label="IoU signal" />
          </div>
        </Card>

        <Card padding="lg" variant="danger">
          <CardHeader title="Emergency action" description="Abort is supported by the backend and releases the device when possible." />
          <div className="space-y-4">
            <div className="rounded-[8px] border border-[var(--danger)] bg-[var(--surface)] p-4 text-[14px] leading-6 text-[var(--text-primary)]">
              Use only when the test must be terminated by an authorized operator.
            </div>
            {status?.abortReason ? <Alert variant="warning">Abort reason: {status.abortReason}</Alert> : null}
            <Button type="button" variant="danger" fullWidth disabled={isAborting} state={{ loading: isAborting }} onClick={() => void handleAbort()}>
              <AlertTriangle size={16} />
              Abort exam
            </Button>
          </div>
        </Card>
      </section>
    </PageContainer>
  );
}
