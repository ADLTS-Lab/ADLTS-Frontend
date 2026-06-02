"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { listCandidateExams, type ExamSummary } from "@/services/exams.service";
import { useI18n } from "@/i18n/useI18n";
import { extractApiError } from "@/services/api-utils";
import { Alert, Card, EmptyState, PageContainer, PageHeader, StatusBadge, ui } from "@/app/components/ui";

export default function CandidateExamHistoryPage() {
  const { t } = useI18n();
  const [exams, setExams] = useState<ExamSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError("");

    listCandidateExams()
      .then((data) => {
        if (isMounted) setExams(data);
      })
      .catch((err) => {
        if (isMounted) setError(extractApiError(err, "Unable to load exam history right now."));
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const metrics = {
    total: exams.length,
    passed: exams.filter((exam) => exam.result === "Pass").length,
    failed: exams.filter((exam) => exam.result === "Fail").length,
    latestScore: exams[0]?.score,
  };
  const passRate = metrics.total === 0 ? 0 : Math.round((metrics.passed / metrics.total) * 100);

  return (
    <PageContainer width="wide">
      <PageHeader
        eyebrow={t("exams_portal_label")}
        title={t("exams_title")}
        description={t("exams_description")}
      />

      {error ? <Alert variant="error">{error}</Alert> : null}

      {isLoading ? (
        <p className="text-sm text-[var(--adlts-ink-600)]">{t("loadingCandidates")}</p>
      ) : exams.length === 0 ? (
        <EmptyState
          action={
            <Link
              href="/candidate/booking"
              className="mt-3 inline-flex text-sm font-medium text-[var(--adlts-blue-700)] hover:text-[var(--adlts-blue-800)]"
            >
              Start a booking first →
            </Link>
          }
          title={t("exams_title")}
          description="Your exam results will appear here after you complete a test."
        />
      ) : (
        <div className="space-y-6">
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Card padding="sm">
              <p className={ui.statLabel}>Total exams</p>
              <p className={ui.statValue}>{metrics.total}</p>
            </Card>
            <Card padding="sm">
              <p className={ui.statLabel}>Passes</p>
              <p className={ui.statValue}>{metrics.passed}</p>
            </Card>
            <Card padding="sm">
              <p className={ui.statLabel}>Failed</p>
              <p className={ui.statValue}>{metrics.failed}</p>
            </Card>
            <Card padding="sm">
              <p className={ui.statLabel}>Pass rate</p>
              <p className={ui.statValue}>{passRate}%</p>
            </Card>
            <Card padding="sm">
              <p className={ui.statLabel}>Latest score</p>
              <p className={ui.statValue}>{metrics.latestScore ?? "—"}%</p>
            </Card>
          </section>

          <div className="space-y-4 md:hidden">
            {exams.map((exam) => {
              return (
                <Card key={exam.id} padding="md" className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className={ui.statLabel}>{exam.date}</p>
                      <h3 className="mt-1 text-base font-semibold text-[var(--adlts-ink-950)]">{exam.examType}</h3>
                    </div>
                    <ResultBadge result={exam.result} />
                  </div>
                  <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-[var(--adlts-divider)] pt-4 text-sm">
                    <div>
                      <dt className={ui.statLabel}>{t("exams_center")}</dt>
                      <dd className="mt-1 font-medium text-[var(--adlts-ink-800)]">{exam.center}</dd>
                    </div>
                    <div className="text-right">
                      <dt className={ui.statLabel}>{t("exams_score")}</dt>
                      <dd className="mt-1 font-semibold text-[var(--adlts-ink-900)]">{exam.score}%</dd>
                    </div>
                  </dl>
                  <div className="mt-4 flex justify-end">
                    <Link
                      href={`/candidate/exams/${exam.id}`}
                      className="text-sm font-medium text-[var(--adlts-blue-700)] hover:text-[var(--adlts-blue-800)]"
                    >
                      {t("exams_viewBreakdown")} →
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>

          <Card padding="none" className="hidden overflow-hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[44rem] text-left text-sm">
                <thead className="border-b border-[var(--adlts-border)] bg-[var(--adlts-surface-soft)]">
                  <tr>
                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-[var(--adlts-ink-500)]">
                      {t("exams_date")}
                    </th>
                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-[var(--adlts-ink-500)]">
                      {t("exams_type")}
                    </th>
                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-[var(--adlts-ink-500)]">
                      {t("exams_score")}
                    </th>
                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-[var(--adlts-ink-500)]">
                      {t("exams_result")}
                    </th>
                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-[var(--adlts-ink-500)]">
                      {t("exams_center")}
                    </th>
                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-[var(--adlts-ink-500)]">
                      {t("exams_details")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--adlts-divider)]">
                  {exams.map((exam) => (
                    <tr key={exam.id} className="transition-colors hover:bg-[var(--adlts-surface-soft)]">
                      <td className="px-6 py-4 font-medium text-[var(--adlts-ink-700)]">{exam.date}</td>
                      <td className="px-6 py-4 font-medium text-[var(--adlts-ink-900)]">{exam.examType}</td>
                      <td className="px-6 py-4 font-semibold text-[var(--adlts-ink-900)]">{exam.score}%</td>
                      <td className="px-6 py-4">
                        <ResultBadge result={exam.result} />
                      </td>
                      <td className="px-6 py-4 text-[var(--adlts-ink-600)]">{exam.center}</td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/candidate/exams/${exam.id}`}
                          className="font-medium text-[var(--adlts-blue-700)] hover:text-[var(--adlts-blue-800)]"
                        >
                          {t("exams_viewBreakdown")}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </PageContainer>
  );
}

function ResultBadge({ result }: { result: string }) {
  const normalized = result?.toLowerCase();
  const tone = normalized === "pass" ? "passed" : normalized === "fail" ? "failed" : "neutral";

  return (
    <StatusBadge status={result} tone={tone} />
  );
}
