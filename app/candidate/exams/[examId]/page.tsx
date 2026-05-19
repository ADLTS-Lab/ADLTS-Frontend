import Link from "next/link";
import { notFound } from "next/navigation";
import { useI18n } from "@/i18n/useI18n";

type ExamDetail = {
  id: string;
  title: string;
  date: string;
  score: number;
  result: "Pass" | "Fail";
  speed: string;
  lane: string;
  braking: string;
  trafficSigns: string;
  notes: string;
};

const mockExamDetails: ExamDetail[] = [
  {
    id: "exam-001",
    title: "Theory Exam",
    date: "2026-05-02",
    score: 88,
    result: "Pass",
    speed: "N/A",
    lane: "N/A",
    braking: "N/A",
    trafficSigns: "92%",
    notes: "Strong understanding of road rules and safe driving principles.",
  },
  {
    id: "exam-002",
    title: "Road Signs Exam",
    date: "2026-05-09",
    score: 94,
    result: "Pass",
    speed: "N/A",
    lane: "N/A",
    braking: "N/A",
    trafficSigns: "98%",
    notes: "Excellent recognition of signs and signals.",
  },
  {
    id: "exam-003",
    title: "Practical Exam",
    date: "2026-05-14",
    score: 61,
    result: "Fail",
    speed: "72%",
    lane: "58%",
    braking: "61%",
    trafficSigns: "64%",
    notes: "Needs improvement in lane discipline and smoother braking.",
  },
  {
    id: "exam-004",
    title: "Theory Retake",
    date: "2026-05-18",
    score: 83,
    result: "Pass",
    speed: "N/A",
    lane: "N/A",
    braking: "N/A",
    trafficSigns: "89%",
    notes: "Passed with a stronger grasp of the updated question set.",
  },
];

export default async function CandidateExamDetailPage({ params }: { params: Promise<{ examId: string }> }) {
  const { examId } = await params;
  const { t } = useI18n();
  const exam = mockExamDetails.find((item) => item.id === examId);

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