"use client";

import Layout from "@/components/Layout";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useI18n } from '@/i18n/useI18n';

export default function SuperAdminDashboard() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const { t } = useI18n();

  useEffect(() => {
    if (!isAuthenticated) router.push("/login");
    if (user?.role !== "super_admin") router.push("/login");
  }, [isAuthenticated, user, router]);

  return (
    <Layout variant="dashboard">
      <div className="py-8">
        <h1 className="text-2xl font-bold">{t('superAdmin_dashboard_title')}</h1>
        <p className="mt-4 text-slate-600">{t('superAdmin_dashboard_subtitle')}</p>
      </div>
    </Layout>
  );
}
