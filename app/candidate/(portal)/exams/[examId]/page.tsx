import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchCandidateExamById } from "@/services/exams.service";
import { useI18n } from "@/i18n/useI18n";

export default async function CandidateExamDetailPage({ params }: { params: Promise<{ examId: string }> }) {
  const { examId } = await params;
  const { t } = useI18n();
  const exam = await fetchCandidateExamById(examId);

  if (!exam) {
    notFound();
  }

  return (
    <main className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">{t('exams_portal_label')}</p>
          <h1 className="text-2xl font-bold text-slate-900">{exam.title} {t('exam_breakdown_suffix')}</h1>
          <p className="text-sm text-slate-500 mt-1">{exam.date} · {t('exams_score')} {exam.score}% · {exam.result === 'Pass' ? t('result_pass') : t('result_fail')}</p>
        </div>
        <Link href="/candidate/exams" className="text-blue-700 font-semibold hover:underline">
          {t('backToHistory')}
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DetailCard label={t('detail_speed')} value={exam.speed} />
        <DetailCard label={t('detail_lane')} value={exam.lane} />
        <DetailCard label={t('detail_braking')} value={exam.braking} />
        <DetailCard label={t('detail_trafficSigns')} value={exam.trafficSigns} />
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-3">{t('notesTitle')}</h2>
        <p className="text-slate-600 leading-relaxed max-w-3xl">{exam.notes}</p>
      </div>
    </main>
  );
}

const DetailCard = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">{label}</p>
    <p className="text-2xl font-bold text-slate-900">{value}</p>
  </div>
);
