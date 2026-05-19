"use client";
const mockActiveExams = [
  {
    id: "live-001",
    candidateName: "Abebe Tesfaye",
    center: "Bole Test Center",
    progress: 72,
    liveScore: 84,
    violations: 1,
    status: "Stable",
  },
  {
    id: "live-002",
    candidateName: "Meklit Abate",
    center: "Adama Center",
    progress: 48,
    liveScore: 76,
    violations: 2,
    status: "Warning",
  },
  {
    id: "live-003",
    candidateName: "Samuel Desta",
    center: "Bahir Dar Center",
    progress: 91,
    liveScore: 93,
    violations: 0,
    status: "Excellent",
  },
  {
    id: "live-004",
    candidateName: "Hana Tadesse",
    center: "Hawassa Center",
    progress: 29,
    liveScore: 68,
    violations: 3,
    status: "Review",
  },
];

import { useI18n } from '@/i18n/useI18n';

export default function AdminActiveExamsPage() {
  const { t } = useI18n();
  return (
    <main className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">{t('adminPortal')}</p>
        <h1 className="text-2xl font-bold text-slate-900">{t('activeExams_monitor_title')}</h1>
        <p className="text-sm text-slate-500 mt-1">{t('activeExams_monitor_subtitle')}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {mockActiveExams.map((exam) => (
          <article key={exam.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{exam.center}</p>
                <h2 className="text-lg font-bold text-slate-900 mt-1">{exam.candidateName}</h2>
              </div>
              <span className={`rounded-full px-3 py-1 text-[10px] font-bold ${exam.status === "Warning" ? "bg-amber-100 text-amber-700" : exam.status === "Review" ? "bg-rose-100 text-rose-700" : exam.status === "Excellent" ? "bg-emerald-100 text-emerald-700" : "bg-sky-100 text-sky-700"}`}>
                {exam.status === 'Warning' ? t('status_warning') : exam.status === 'Review' ? t('status_review') : exam.status === 'Excellent' ? t('status_excellent') : t('status_stable')}
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                <span>{t('metric_progress')}</span>
                <span>{exam.progress}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full rounded-full bg-blue-600" style={{ width: `${exam.progress}%` }} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <Metric label={t('metric_liveScore')} value={`${exam.liveScore}%`} />
              <Metric label={t('metric_violations')} value={exam.violations.toString()} />
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}

const Metric = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-2xl bg-slate-50 p-3">
    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{label}</p>
    <p className="font-bold text-slate-900">{value}</p>
  </div>
);