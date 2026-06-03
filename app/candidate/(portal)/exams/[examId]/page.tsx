"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { createCandidateAppeal } from "@/services/appeals.service";
import { fetchCandidateExamById, type ExamDetail } from "@/services/exams.service";
import { downloadExamReportPdf } from "@/services/reports.service";
import {
  Alert,
  Button,
  ButtonLink,
  Card,
  CardHeader,
  EmptyState,
  PageContainer,
  PageHeader,
  ProgressBar,
  StatBlock,
  StatusBadge,
  Textarea,
} from "@/app/components/ui";

export default function CandidateExamDetailPage() {
  const params = useParams<{ examId: string }>();
  const examId = params.examId;
  const [exam, setExam] = useState<ExamDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [reportError, setReportError] = useState("");
  const [appealError, setAppealError] = useState("");
  const [appealSuccess, setAppealSuccess] = useState("");
  const [reason, setReason] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isAppealing, setIsAppealing] = useState(false);

  useEffect(() => {
    let isMounted = true;

    fetchCandidateExamById(examId)
      .then((result) => {
        if (isMounted) setExam(result);
      })
      .catch((err) => {
        if (isMounted) setError(err instanceof Error ? err.message : "Unable to load exam result.");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [examId]);

  const canSubmitAppeal = Boolean(exam?.sessionId);
  const appealGap = useMemo(() => {
    if (!exam || exam.sessionId) return "";
    return "The current candidate result API does not expose session_id. The backend appeal endpoint requires session_id, so appeal submission cannot be completed for this result yet.";
  }, [exam]);

  async function loadReportBlob() {
    const response = await downloadExamReportPdf(examId);
    if (!response) {
      throw new Error("PDF report is not available for this test yet.");
    }
    return response;
  }

  async function handleDownloadReport() {
    setReportError("");
    setIsDownloading(true);

    try {
      const response = await loadReportBlob();
      const url = URL.createObjectURL(response.blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = response.filename ?? `report-${examId}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setReportError(err instanceof Error ? err.message : "Unable to download report PDF.");
    } finally {
      setIsDownloading(false);
    }
  }

  async function handlePrintReport() {
    setReportError("");
    setIsPrinting(true);

    try {
      const response = await loadReportBlob();
      const url = URL.createObjectURL(response.blob);
      const printWindow = window.open(url, "_blank", "noopener,noreferrer");
      if (!printWindow) {
        throw new Error("Popup blocked. Allow popups for this site, then try printing again.");
      }
      printWindow.addEventListener("load", () => {
        printWindow.focus();
        printWindow.print();
      });
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err) {
      setReportError(err instanceof Error ? err.message : "Unable to print report PDF.");
    } finally {
      setIsPrinting(false);
    }
  }

  async function handleSubmitAppeal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!exam) return;

    const cleanReason = reason.trim();
    if (!cleanReason) {
      setAppealError("Enter the reason for your appeal before submitting.");
      return;
    }

    if (!exam.sessionId) {
      setAppealError(appealGap || "This result cannot be appealed because the backend did not provide a session ID.");
      return;
    }

    setAppealError("");
    setAppealSuccess("");
    setIsAppealing(true);

    try {
      const appeal = await createCandidateAppeal({
        testId: exam.id,
        sessionId: exam.sessionId,
        reason: cleanReason,
      });
      setAppealSuccess(appeal.id ? `Appeal submitted. Reference: ${appeal.id}` : "Appeal submitted.");
      setReason("");
    } catch (err) {
      setAppealError(err instanceof Error ? err.message : "Unable to submit appeal.");
    } finally {
      setIsAppealing(false);
    }
  }

  if (isLoading) {
    return (
      <PageContainer width="wide">
        <Card padding="lg" className="animate-pulse space-y-5">
          <div className="h-6 w-56 rounded-[6px] bg-[var(--surface-2)]" />
          <div className="grid gap-4 md:grid-cols-4">
            <div className="h-24 rounded-[8px] bg-[var(--surface-2)]" />
            <div className="h-24 rounded-[8px] bg-[var(--surface-2)]" />
            <div className="h-24 rounded-[8px] bg-[var(--surface-2)]" />
            <div className="h-24 rounded-[8px] bg-[var(--surface-2)]" />
          </div>
        </Card>
      </PageContainer>
    );
  }

  if (error || !exam) {
    return (
      <PageContainer width="wide" className="space-y-6">
        <PageHeader
          title="Result unavailable"
          description="The requested result could not be loaded from the backend."
          action={
            <ButtonLink href="/candidate/exams" variant="outline">
              Back to exam history
            </ButtonLink>
          }
        />
        <Card padding="lg">
          <EmptyState
            title="No result found"
            description={error || "This result may not exist or may not be visible to your candidate account yet."}
            action={
              <ButtonLink href="/candidate/exams" variant="primary">
                Back to exam history
              </ButtonLink>
            }
          />
        </Card>
      </PageContainer>
    );
  }

  if (exam.visible === false) {
    return (
      <PageContainer width="wide" className="space-y-6">
        <PageHeader
          title="Result under review"
          description="This result is being reviewed and will be published once approved."
          action={
            <ButtonLink href="/candidate/exams" variant="outline">
              Back to exam history
            </ButtonLink>
          }
        />

        <Card padding="lg">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[12px] font-medium text-[var(--text-secondary)]">Current status</p>
              <h2 className="mt-1 text-[20px] font-semibold text-[var(--text-primary)]">{exam.title}</h2>
            </div>
            <StatusBadge status={exam.result} tone="warning" />
          </div>
          <p className="mt-4 text-[14px] leading-6 text-[var(--text-secondary)]">
            Some results require review before they are shown. If your result is not visible, wait for the official update or contact support with your booking reference.
          </p>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer width="wide" className="space-y-6">
      <PageHeader
        title={`${exam.title} result`}
        description="Review completed driving tests, scores, results, centers, and available result actions."
        action={
          <ButtonLink href="/candidate/exams" variant="outline">
            Back to exam history
          </ButtonLink>
        }
      />

      {reportError ? <Alert variant="error">{reportError}</Alert> : null}

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card padding="sm">
          <StatBlock label="Date" value={exam.date} />
        </Card>
        <Card padding="sm">
          <StatBlock label="Score" value={`${Math.round(exam.score)}%`} />
        </Card>
        <Card padding="sm">
          <p className="text-[12px] font-medium text-[var(--text-secondary)]">Result</p>
          <div className="mt-2">
            <StatusBadge status={exam.result} tone={exam.result === "Pass" ? "passed" : "failed"} />
          </div>
        </Card>
        <Card padding="sm">
          <StatBlock label="Exam ID" value={exam.id} />
        </Card>
      </section>

      <Card padding="lg">
        <CardHeader
          title="Result actions"
          description="Download or print the official PDF report when it is available from the reporting service."
        />
        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="primary" state={{ loading: isDownloading }} disabled={isDownloading || isPrinting} onClick={handleDownloadReport}>
            Download PDF
          </Button>
          <Button type="button" variant="outline" state={{ loading: isPrinting }} disabled={isDownloading || isPrinting} onClick={handlePrintReport}>
            Print PDF
          </Button>
        </div>
      </Card>

      <Card padding="lg">
        <h2 className="text-[18px] font-semibold text-[var(--text-primary)]">Performance breakdown</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <BreakdownItem label="Speed control" value={exam.speed} />
          <BreakdownItem label="Lane discipline" value={exam.lane} />
          <BreakdownItem label="Braking" value={exam.braking} />
          <BreakdownItem label="Traffic signs" value={exam.trafficSigns} />
        </div>
      </Card>

      <Card padding="lg">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-[18px] font-semibold text-[var(--text-primary)]">Notes</h2>
            <p className="mt-2 text-[14px] leading-6 text-[var(--text-secondary)]">{exam.notes}</p>
            {exam.recommendedFocus ? (
              <p className="mt-3 text-[14px] leading-6 text-[var(--text-secondary)]">
                <span className="font-medium text-[var(--text-primary)]">Recommended focus: </span>
                {exam.recommendedFocus}
              </p>
            ) : null}
          </div>
          <Link href="/contact" className="text-[14px] font-medium text-[var(--accent)] transition-colors hover:text-[var(--accent-hover)]">
            Contact support
          </Link>
        </div>
      </Card>

      <Card padding="lg">
        <CardHeader
          title="File an appeal"
          description="Submit an appeal if you believe the published result needs official review."
        />
        {appealSuccess ? <Alert variant="success" className="mb-4">{appealSuccess}</Alert> : null}
        {appealError ? <Alert variant="error" className="mb-4">{appealError}</Alert> : null}
        {!canSubmitAppeal ? <Alert variant="warning" className="mb-4">{appealGap}</Alert> : null}
        <form onSubmit={handleSubmitAppeal} className="space-y-4">
          <Textarea
            label="Reason for appeal"
            hint="Include the specific concern and any context that helps the reviewer understand the issue."
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            rows={5}
            disabled={!canSubmitAppeal || isAppealing}
            placeholder="Explain why you are appealing this result."
          />
          <Button type="submit" variant="danger" state={{ loading: isAppealing }} disabled={!canSubmitAppeal || isAppealing}>
            Submit appeal
          </Button>
        </form>
      </Card>
    </PageContainer>
  );
}

function BreakdownItem({ label, value }: { label: string; value: string }) {
  const numericValue = Number.parseInt(value, 10);
  const progress = Number.isNaN(numericValue) ? 0 : Math.max(0, Math.min(100, numericValue));

  return (
    <div className="rounded-[8px] border border-[var(--border)] bg-[var(--surface-2)] p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[14px] font-medium text-[var(--text-primary)]">{label}</p>
        <p className="text-[14px] font-semibold text-[var(--text-primary)]">{value}</p>
      </div>
      <ProgressBar value={progress} className="mt-3" />
    </div>
  );
}
