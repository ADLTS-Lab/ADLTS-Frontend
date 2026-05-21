"use client";

import { useI18n } from '@/i18n/useI18n';

export default function SuperAdminDashboard() {
  const { t } = useI18n();

  return (
    <div className="py-6 md:py-8 max-w-4xl">
      <h1 className="text-2xl md:text-3xl font-extrabold text-blue-950">{t('superAdmin_dashboard_title')}</h1>
      <p className="mt-4 text-slate-500 leading-relaxed text-sm md:text-base">{t('superAdmin_dashboard_subtitle')}</p>
    </div>
  );
}
