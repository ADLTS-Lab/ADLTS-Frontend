"use client";

import Link from "next/link";
import { useI18n } from '@/i18n/useI18n';

export default function NotFound() {
  const { t } = useI18n();
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-xl bg-[var(--surface)] rounded-[8px] border border-[var(--border)] shadow-card p-8 text-center">
        <p className="text-sm font-semibold text-[var(--text-secondary)] mb-2">{t('notfound_code')}</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-3">{t('notfound_title')}</h1>
        <p className="text-[var(--text-secondary)] mb-6">{t('notfound_subtitle')}</p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-[6px] bg-[var(--accent)] text-[var(--surface)] px-5 py-3 font-semibold hover:bg-[var(--accent-hover)] transition-colors"
        >
          {t('notfound_back')}
        </Link>
      </div>
    </div>
  );
}
