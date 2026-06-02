"use client";

import { useMemo, useState } from "react";
import { Alert, Button, Card, Input, PageContainer, PageHeader, ui } from "@/app/components/ui";
import { downloadExamReportPdf, generateExamReport } from "@/services/reports.service";
import { useI18n } from "@/i18n/useI18n";
import { extractApiError } from "@/services/api-utils";

export default function AdminReportsPage() {
  const { t } = useI18n();
  const [testId, setTestId] = useState("");
  const [reportUrl, setReportUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState("");

  const canRun = useMemo(() => testId.trim().length > 0, [testId]);

  const handleGenerate = async () => {
    if (!canRun) {
      setError(t("reports_pending"));
      return;
    }

    setIsGenerating(true);
    setError("");

    try {
      const response = await generateExamReport(testId.trim());
      if (response?.success && response.data?.report_url) {
        setReportUrl(response.data.report_url);
      } else if (response?.message) {
        setError(response.message);
      } else {
        setError("Report generation is not available yet.");
      }
    } catch (err) {
      setError(extractApiError(err, "Unable to generate report."));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!canRun) {
      setError(t("reports_pending"));
      return;
    }

    setIsDownloading(true);
    setError("");

    try {
      const response = await downloadExamReportPdf(testId.trim());
      if (!response) {
        setError("PDF download is not available yet.");
        return;
      }

      const objectUrl = URL.createObjectURL(response.blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = response.filename ?? `report-${testId.trim()}.pdf`;
      anchor.click();
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      setError(extractApiError(err, "Unable to download report."));
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <PageContainer width="wide">
      <PageHeader
        eyebrow={t("adminPortal")}
        title={t("reports_title") || "Reports"}
        description={t("reports_subtitle") || "Generate and download exam reports directly from the service."}
      />

      {error ? <Alert variant="error">{error}</Alert> : null}
      {reportUrl ? <Alert variant="success">{`${t("reports_ready") || "Ready"}: ${reportUrl}`}</Alert> : null}

      <div className="grid gap-6 lg:grid-cols-[380px,1fr]">
        <Card padding="lg" className="space-y-4">
          <h2 className="text-base font-semibold text-[var(--adlts-ink-950)]">Generate exam report</h2>
          <p className="text-sm text-[var(--adlts-ink-600)]">Provide a test id to generate or download from the backend service.</p>

          <Input
            value={testId}
            onChange={(event) => setTestId(event.target.value)}
            placeholder="test-123"
            label={t("reports_testId")}
          />

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              disabled={isGenerating}
              onClick={handleGenerate}
              state={isGenerating ? { loading: true } : undefined}
              fullWidth
            >
              {t("reports_generate")}
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={isDownloading}
              onClick={handleDownload}
              state={isDownloading ? { loading: true } : undefined}
              fullWidth
            >
              {t("reports_download")}
            </Button>
          </div>
        </Card>

        <Card padding="lg" className="space-y-4">
          <h2 className="text-base font-semibold text-[var(--adlts-ink-950)]">Analytics status</h2>
          <p className="text-sm text-[var(--adlts-ink-600)]">
            Shows report availability without adding synthetic data values.
          </p>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <MetricItem label="Analytics endpoint" value="Backend-blocked" />
            <MetricItem label="Report generation" value={reportUrl ? "Ready" : "Pending"} />
            <MetricItem label="PDF download" value={canRun ? "Available" : "Requires Test ID"} />
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}

function MetricItem({ label, value }: { label: string; value: string }) {
  return (
    <Card padding="md" className="space-y-1">
      <p className={`${ui.statLabel} mb-1`}>{label}</p>
      <p className="font-semibold text-[var(--adlts-ink-900)]">{value}</p>
    </Card>
  );
}
