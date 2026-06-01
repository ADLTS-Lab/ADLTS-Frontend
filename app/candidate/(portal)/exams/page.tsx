"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { listCandidateExams, type ExamSummary } from "@/services/exams.service";
import { useI18n } from "@/i18n/useI18n";
import { extractApiError } from "@/services/api-utils";
import { Alert, Card, EmptyState, PageContainer, PageHeader, ui } from "@/app/components/ui";

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

  return (
    <PageContainer width="wide">
      <PageHeader
        eyebrow={t("exams_portal_label")}
        title={t("exams_title")}
        description={t("exams_description")}
      />

      {error ? <Alert variant="error">{error}</Alert> : null}

      {isLoading ? (
        <p className="text-sm text-slate-500">{t("loadingCandidates")}</p>
      ) : exams.length === 0 ? (
        <EmptyState
          title={t("exams_title")}
          description="Your exam results will appear here after you complete a test."
        />
      ) : (
        <>
          <div className="space-y-4 md:hidden">
            {exams.map((exam) => {
              const isPass = exam.result === "Pass";
              return (
                <Card key={exam.id} padding="md">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium text-slate-500">{exam.date}</p>
                      <h3 className="mt-1 text-base font-semibold text-blue-950">{exam.examType}</h3>
                    </div>
                    <ResultBadge pass={isPass} label={exam.result} />
                  </div>
                  <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 text-sm">
                    <div>
                      <dt className={ui.statLabel}>{t("exams_center")}</dt>
                      <dd className="mt-1 font-medium text-slate-800">{exam.center}</dd>
                    </div>
                    <div className="text-right">
                      <dt className={ui.statLabel}>{t("exams_score")}</dt>
                      <dd className="mt-1 font-semibold text-slate-900">{exam.score}%</dd>
                    </div>
                  </dl>
                  <div className="mt-4 flex justify-end">
                    <Link
                      href={`/candidate/exams/${exam.id}`}
                      className="text-sm font-medium text-blue-900 hover:text-blue-800"
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
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                      {t("exams_date")}
                    </th>
                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                      {t("exams_type")}
                    </th>
                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                      {t("exams_score")}
                    </th>
                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                      {t("exams_result")}
                    </th>
                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                      {t("exams_center")}
                    </th>
                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                      {t("exams_details")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {exams.map((exam) => (
                    <tr key={exam.id} className="transition-colors hover:bg-slate-50/80">
                      <td className="px-6 py-4 font-medium text-slate-700">{exam.date}</td>
                      <td className="px-6 py-4 font-medium text-slate-900">{exam.examType}</td>
                      <td className="px-6 py-4 font-semibold text-slate-900">{exam.score}%</td>
                      <td className="px-6 py-4">
                        <ResultBadge pass={exam.result === "Pass"} label={exam.result} />
                      </td>
                      <td className="px-6 py-4 text-slate-600">{exam.center}</td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/candidate/exams/${exam.id}`}
                          className="font-medium text-blue-900 hover:text-blue-800"
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
        </>
      )}
    </PageContainer>
  );
}

function ResultBadge({ pass, label }: { pass: boolean; label: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
        pass ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200" : "bg-rose-50 text-rose-800 ring-1 ring-rose-200"
      }`}
    >
      {label}
    </span>
  );
}
