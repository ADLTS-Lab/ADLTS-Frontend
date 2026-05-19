"use client";

import Link from "next/link";
import { useI18n } from '@/i18n/useI18n';

export default function NotFound() {
  const { t } = useI18n();
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-xl bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-8 text-center">
        <p className="text-sm font-semibold text-[#6B7280] mb-2">{t('notfound_code')}</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1F2937] mb-3">{t('notfound_title')}</h1>
        <p className="text-[#4B5563] mb-6">{t('notfound_subtitle')}</p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-xl bg-[#1E3A8A] text-white px-5 py-3 font-semibold hover:bg-[#1E40AF] transition"
        >
          {t('notfound_back')}
        </Link>
      </div>
    </div>
  );
}
