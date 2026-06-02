import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchCandidateExamById } from "@/services/exams.service";
import { useI18n } from "@/i18n/useI18n";
import { Card, PageContainer, PageHeader, ui } from "@/app/components/ui";

export default async function CandidateExamDetailPage({ params }: { params: Promise<{ examId: string }> }) {
  const { examId } = await params;
  const { t } = useI18n();
  const exam = await fetchCandidateExamById(examId);

  if (!exam) {
    notFound();
  }

  if (exam.visible === false) {
    return (
      <PageContainer width="wide">
        <div className="space-y-6">
          <PageHeader
            eyebrow={t("exams_portal_label")}
            title={`${exam.title} ${t("exam_breakdown_suffix")}`}
            description={t("resultUnavailable") || "Result is not available yet."}
          />
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <p className={ui.statLabel}>Current status</p>
            <span className="rounded-md border border-[var(--adlts-border)] bg-[var(--adlts-surface-soft)] px-3 py-1 text-xs font-medium uppercase tracking-wide text-[var(--adlts-ink-600)]">
              {exam.result}
            </span>
          </div>
          <Card padding="lg">
            <p className="text-sm text-[var(--adlts-ink-600)]">
              This result is being reviewed and will be published once approved.
            </p>
          </Card>
          <div>
            <Link href="/candidate/exams" className="text-[var(--adlts-blue-700)] font-medium hover:text-[var(--adlts-blue-800)]">
              ← {t("backToHistory")}
            </Link>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer width="wide">
      <PageHeader
        eyebrow={t("exams_portal_label")}
        title={`${exam.title} ${t("exam_breakdown_suffix")}`}
        description={`${exam.date} · ${t("exams_score")} ${exam.score}% · ${exam.result === "Pass" ? t("result_pass") : t("result_fail")}`}
      />

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DetailCard label={t("detail_speed")} value={exam.speed} />
        <DetailCard label={t("detail_lane")} value={exam.lane} />
        <DetailCard label={t("detail_braking")} value={exam.braking} />
        <DetailCard label={t("detail_trafficSigns")} value={exam.trafficSigns} />
      </section>

      <Card padding="lg">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h2 className="text-lg font-semibold text-[var(--adlts-ink-950)]">{t("notesTitle")}</h2>
          <Link href="/candidate/exams" className="text-sm font-medium text-[var(--adlts-blue-700)] hover:text-[var(--adlts-blue-800)]">
            {t("backToHistory")}
          </Link>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-[var(--adlts-ink-600)]">{exam.notes}</p>
      </Card>
    </PageContainer>
  );
}

const DetailCard = ({ label, value }: { label: string; value: string }) => (
  <Card>
    <p className="text-[12px] font-medium uppercase tracking-widest text-[var(--adlts-ink-500)] mb-2">{label}</p>
    <p className="text-xl font-semibold text-[var(--adlts-ink-950)]">{value}</p>
  </Card>
);
