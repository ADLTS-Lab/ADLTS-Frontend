"use client";

import { useI18n } from "@/i18n/useI18n";

type RolePlaceholderDashboardProps = {
  welcomeKey: string;
};

export default function RolePlaceholderDashboard({ welcomeKey }: RolePlaceholderDashboardProps) {
  const { t } = useI18n();

  return (
    <div className="flex items-center justify-center min-h-[50vh] py-8">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 md:p-12 text-center max-w-lg w-full">
        <p className="text-xl md:text-2xl font-bold text-blue-950">{t(welcomeKey)}</p>
      </div>
    </div>
  );
}
