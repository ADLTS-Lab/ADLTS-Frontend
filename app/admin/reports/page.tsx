"use client";

import { useMemo, useState } from "react";
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
    <main className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">{t("adminPortal")}</p>
          <h1 className="text-2xl font-bold text-slate-900">{t("reports_title")}</h1>
          <p className="text-sm text-slate-500 mt-1">{t("reports_subtitle")}</p>
        </div>
        <div className="rounded-3xl bg-white border border-slate-100 shadow-sm px-4 py-3 text-sm text-slate-600">
          {t("reports_backendBlocked")}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[380px,1fr]">
        <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 md:p-6 space-y-4">
          <div>
            <h2 className="font-bold text-slate-900">Generate exam report</h2>
            <p className="text-sm text-slate-500 mt-1">Provide a test ID to generate or download the report from the backend.</p>
          </div>

          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">{t("reports_testId")}</span>
            <input
              value={testId}
              onChange={(event) => setTestId(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="test-123"
            />
          </label>

          {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              disabled={isGenerating}
              onClick={handleGenerate}
              className="flex-1 rounded-2xl bg-blue-900 px-4 py-3 text-sm font-bold text-white hover:bg-blue-800 disabled:opacity-50"
            >
              {isGenerating ? t("loadingCandidates") : t("reports_generate")}
            </button>
            <button
              type="button"
              disabled={isDownloading}
              onClick={handleDownload}
              className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              {isDownloading ? t("loadingCandidates") : t("reports_download")}
            </button>
          </div>

          <p className="text-xs text-slate-500">{reportUrl ? `${t("reports_ready")}: ${reportUrl}` : t("reports_pending")}</p>
        </section>

        <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 md:p-6 space-y-4">
          <div>
            <h2 className="font-bold text-slate-900">Analytics status</h2>
            <p className="text-sm text-slate-500 mt-1">There is no backend analytics endpoint in the supplied collection yet, so this page focuses on report generation.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[
              { label: "Analytics endpoint", value: "Backend-blocked" },
              { label: "Report generation", value: reportUrl ? "Ready" : "Pending" },
              { label: "PDF download", value: canRun ? "Available" : "Requires Test ID" },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl bg-slate-50 p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{item.label}</p>
                <p className="text-sm font-bold text-slate-900">{item.value}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
