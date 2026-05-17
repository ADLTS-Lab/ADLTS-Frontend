"use client";

import Layout from "@/components/Layout";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function SuperAdminDashboard() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) router.push("/login");
    if (user?.role !== "super_admin") router.push("/login");
  }, [isAuthenticated, user, router]);

  return (
    <Layout variant="dashboard">
      <div className="py-8">
        <h1 className="text-2xl font-bold">Super Admin Dashboard (Placeholder)</h1>
        <p className="mt-4 text-slate-600">This is a placeholder page for super_admin routes.</p>
      </div>
    </Layout>
  );
}
