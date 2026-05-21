"use client";

import { useEffect, useMemo, useState } from "react";
import {
  listCandidates,
  updateCandidateStatus,
  type CandidateRecord,
} from "@/services/candidates.service";
import { useI18n } from '@/i18n/useI18n';

export default function AdminCandidatesPage() {
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const [candidates, setCandidates] = useState<CandidateRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCandidates = async () => {
      setIsLoading(true);
      setError("");

      try {
        const data = await listCandidates(search ? { search } : undefined);
        setCandidates(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Unable to load candidates.");
      } finally {
        setIsLoading(false);
      }
    };

    loadCandidates();
  }, [search]);

  const activeCount = useMemo(() => candidates.filter((candidate) => candidate.status === "active").length, [candidates]);

  const toggleStatus = async (candidate: CandidateRecord) => {
    const nextStatus = candidate.status === "active" ? "suspended" : "active";

    try {
      const { candidate: updated } = await updateCandidateStatus(candidate.id, nextStatus);
      setCandidates((current) => current.map((item) => (item.id === candidate.id ? updated : item)));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unable to update candidate status.");
    }
  };

  return (
    <main className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">{t('adminPortal')}</p>
          <h1 className="text-2xl font-bold text-slate-900">{t('candidates_title')}</h1>
          <p className="text-sm text-slate-500 mt-1">{t('candidates_subtitle')}</p>
        </div>
        <div className="rounded-3xl bg-white border border-slate-100 shadow-sm px-4 py-3 text-sm text-slate-600">
          {activeCount} {t('status_active')} · {candidates.length - activeCount} {t('status_suspended')}
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 md:p-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('search_placeholder_candidates')}
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-black"
        />
      </div>

      {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-240 text-left">
            <thead className="bg-slate-50 text-xs uppercase tracking-widest text-slate-400">
              <tr>
                <th className="px-6 py-4">{t('table_name')}</th>
                <th className="px-6 py-4">{t('table_email')}</th>
                <th className="px-6 py-4">{t('table_center')}</th>
                <th className="px-6 py-4">{t('table_category')}</th>
                <th className="px-6 py-4">{t('table_status')}</th>
                <th className="px-6 py-4">{t('table_action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td className="px-6 py-8 text-slate-500" colSpan={6}>{t('loadingCandidates')}</td>
                </tr>
              ) : candidates.length === 0 ? (
                <tr>
                  <td className="px-6 py-8 text-slate-500" colSpan={6}>{t('noCandidatesFound')}</td>
                </tr>
              ) : (
                candidates.map((candidate) => (
                  <tr key={candidate.id} className="text-sm hover:bg-slate-50/70">
                    <td className="px-6 py-4 font-medium text-slate-900">{candidate.name || `${candidate.first_name} ${candidate.last_name}`}</td>
                    <td className="px-6 py-4 text-slate-600">{candidate.email}</td>
                    <td className="px-6 py-4 text-slate-600">{candidate.testCenter}</td>
                    <td className="px-6 py-4 text-slate-600">{candidate.licenseCategory}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${candidate.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                        {candidate.status === 'active' ? t('status_active') : t('status_suspended')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleStatus(candidate)}
                        className="rounded-full bg-blue-900 px-4 py-2 text-xs font-bold text-white hover:bg-blue-800"
                      >
                        {candidate.status === "active" ? t('action_suspend') : t('action_activate')}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
