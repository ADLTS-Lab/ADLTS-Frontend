"use client";
import Link from "next/link";
import { useI18n } from "@/i18n/useI18n";

type ExamSummary = {
  id: string;
  date: string;
  examType: string;
  score: number;
  result: "Pass" | "Fail";
  center: string;
};

const mockExams: ExamSummary[] = [
  { id: "exam-001", date: "2026-05-02", examType: "Theory", score: 88, result: "Pass", center: "Bole Test Center" },
  { id: "exam-002", date: "2026-05-09", examType: "Road Signs", score: 94, result: "Pass", center: "Bole Test Center" },
  { id: "exam-003", date: "2026-05-14", examType: "Practical", score: 61, result: "Fail", center: "Bole Test Center" },
  { id: "exam-004", date: "2026-05-18", examType: "Theory Retake", score: 83, result: "Pass", center: "Bole Test Center" },
];

export default function CandidateExamHistoryPage() {
  const { t } = useI18n();
  return (
    <main className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">{t('exams_portal_label')}</p>
        <h1 className="text-2xl font-bold text-slate-900">{t('exams_title')}</h1>
        <p className="text-sm text-slate-500 mt-1">{t('exams_description')}</p>
      </div>

      {/* Mobile Card List (visible on mobile, hidden on md screens and up) */}
      <div className="space-y-4 md:hidden">
        {mockExams.map((exam) => {
          const isPass = exam.result === "Pass";
          return (
            <div key={exam.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold text-slate-400">{exam.date}</p>
                  <h3 className="font-bold text-slate-900 text-base mt-1">{exam.examType}</h3>
                </div>
                <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${isPass ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                  {isPass ? t('result_pass') || 'Pass' : t('result_fail') || 'Fail'} ({exam.result})
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-slate-50">
                <div>
                  <p className="text-slate-400 uppercase text-[9px] font-bold tracking-wider">{t('exams_center')}</p>
                  <p className="text-slate-700 font-semibold mt-0.5">{exam.center}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 uppercase text-[9px] font-bold tracking-wider">{t('exams_score')}</p>
                  <p className="text-slate-900 font-black mt-0.5 text-sm">{exam.score}%</p>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Link href={`/candidate/exams/${exam.id}`} className="text-blue-700 font-bold text-xs hover:underline flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-lg active:scale-95 transition">
                  {t('exams_viewBreakdown')} →
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Table (hidden on mobile) */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead className="bg-slate-50 text-xs uppercase tracking-widest text-slate-400">
              <tr>
                <th className="px-6 py-4">{t('exams_date')}</th>
                <th className="px-6 py-4">{t('exams_type')}</th>
                <th className="px-6 py-4">{t('exams_score')}</th>
                <th className="px-6 py-4">{t('exams_result')}</th>
                <th className="px-6 py-4">{t('exams_center')}</th>
                <th className="px-6 py-4">{t('exams_details')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockExams.map((exam) => (
                <tr key={exam.id} className="hover:bg-slate-50/60 transition-colors text-sm">
                  <td className="px-6 py-4 font-medium text-slate-700">{exam.date}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">{exam.examType}</td>
                  <td className="px-6 py-4 font-bold text-slate-900">{exam.score}%</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${exam.result === "Pass" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                      {exam.result}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{exam.center}</td>
                  <td className="px-6 py-4">
                    <Link href={`/candidate/exams/${exam.id}`} className="text-blue-700 font-semibold hover:underline">
                      {t('exams_viewBreakdown')}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}