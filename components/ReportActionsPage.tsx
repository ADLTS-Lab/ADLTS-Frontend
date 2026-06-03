"use client";

import { useMemo, useState } from "react";
import { Alert, Button, Card, CardHeader, Input, PageContainer, PageHeader, StatBlock } from "@/app/components/ui";
import { extractApiError } from "@/services/api-utils";
import { downloadExamReportPdf, generateExamReport } from "@/services/reports.service";

type ReportActionsPageProps = {
  title: string;
  description: string;
  panelTitle?: string;
  panelDescription?: string;
};

export function ReportActionsPage({
  title,
  description,
  panelTitle = "Report generation",
  panelDescription = "Generate or download exam reports by test ID when report endpoints are available.",
}: ReportActionsPageProps) {
  const [testId, setTestId] = useState("");
  const [reportUrl, setReportUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState("");

  const canRun = useMemo(() => testId.trim().length > 0, [testId]);

  const handleGenerate = async () => {
    if (!canRun) {
      setError("Enter a valid test ID before generating a report.");
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
        setError("Report generation is not available for this test ID right now.");
      }
    } catch (err) {
      setError(extractApiError(err, "Unable to generate report."));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!canRun) {
      setError("Enter a valid test ID before downloading a report.");
      return;
    }

    setIsDownloading(true);
    setError("");

    try {
      const response = await downloadExamReportPdf(testId.trim());
      if (!response) {
        setError("Report generation is not available for this test ID right now.");
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
    <PageContainer width="wide" className="space-y-6">
      <PageHeader title={title} description={description} />

      {error ? <Alert variant="error">{error}</Alert> : null}
      {reportUrl ? <Alert variant="success">Report ready: {reportUrl}</Alert> : null}

      <div className="grid gap-6 lg:grid-cols-[380px,1fr]">
        <Card padding="lg" className="space-y-4">
          <CardHeader title={panelTitle} description={panelDescription} />

          <Input
            value={testId}
            onChange={(event) => setTestId(event.target.value)}
            placeholder="test-123"
            label="Test ID"
          />

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              disabled={isGenerating}
              onClick={handleGenerate}
              state={isGenerating ? { loading: true } : undefined}
              fullWidth
            >
              Generate report
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={isDownloading}
              onClick={handleDownload}
              state={isDownloading ? { loading: true } : undefined}
              fullWidth
            >
              Download PDF
            </Button>
          </div>
        </Card>

        <Card padding="lg" className="space-y-4">
          <CardHeader
            title="Backend-supported actions"
            description="This page uses only the current report endpoints. Broader analytics dashboards remain future scope until backend APIs are available."
          />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <MetricItem label="Report endpoint" value={reportUrl ? "Report returned" : "Waiting for test ID"} />
            <MetricItem label="PDF download" value={canRun ? "Available by test ID" : "Requires test ID"} />
            <MetricItem label="Analytics dashboard" value="Future scope" />
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}

function MetricItem({ label, value }: { label: string; value: string }) {
  return (
    <Card padding="md" variant="metric">
      <StatBlock label={label} value={value} />
    </Card>
  );
}
