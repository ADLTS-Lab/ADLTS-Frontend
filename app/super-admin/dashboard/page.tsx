"use client";

import { useEffect, useState } from "react";
import { getSystemMetrics, getRecentAudits, SystemMetrics, AuditLog } from "@/services/super-admin.service";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { useI18n } from "@/i18n/useI18n";
import { extractApiError } from "@/services/api-utils";

export default function SuperAdminDashboard() {
  const { t } = useI18n();
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [audits, setAudits] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError("");
      try {
        const [metricsRes, auditsRes] = await Promise.all([getSystemMetrics(), getRecentAudits()]);
        if (metricsRes.success) setMetrics(metricsRes.data);
        if (auditsRes.success) setAudits(auditsRes.data);
      } catch (err) {
        setError(extractApiError(err, "Unable to load dashboard data."));
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Super Admin Portal</h1>
          <p className="text-slate-500 mt-1">System oversight and configuration management.</p>
        </div>
        <Button variant="primary">Generate System Report</Button>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      ) : null}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Active Candidates", value: metrics?.totalActiveCandidates.toLocaleString(), color: "text-blue-600" },
          { label: "Registered Institutes", value: metrics?.registeredInstitutes, color: "text-indigo-600" },
          { label: "Active Biometric Devices", value: metrics?.activeDevices, color: "text-emerald-600" },
          { label: "System Health", value: metrics ? `${metrics.systemHealth}%` : undefined, color: "text-slate-700" },
        ].map((stat, i) => (
          <Card key={i} className="p-6">
            <h3 className="text-sm font-medium text-slate-500">{stat.label}</h3>
            {loading ? (
              <div className="h-9 w-24 bg-slate-200 animate-pulse rounded mt-2"></div>
            ) : (
              <p className={`text-3xl font-bold mt-2 ${stat.color}`}>{stat.value || "—"}</p>
            )}
          </Card>
        ))}
      </div>

      {/* Table Section */}
      <Card className="overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
          <h2 className="text-lg font-semibold text-slate-900">Recent System Audits</h2>
          <Button variant="secondary" className="text-sm">View All Logs</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-medium">Action</th>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Timestamp</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><div className="h-5 w-48 bg-slate-100 animate-pulse rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-5 w-24 bg-slate-100 animate-pulse rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-5 w-32 bg-slate-100 animate-pulse rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-5 w-16 bg-slate-100 animate-pulse rounded"></div></td>
                  </tr>
                ))
              ) : audits.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">No recent audits found.</td>
                </tr>
              ) : (
                audits.map((audit) => (
                  <tr key={audit.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{audit.action}</td>
                    <td className="px-6 py-4">{audit.user}</td>
                    <td className="px-6 py-4">
                      {new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(audit.timestamp))}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        audit.status === 'success' ? 'bg-emerald-100 text-emerald-800' :
                        audit.status === 'error' ? 'bg-rose-100 text-rose-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {audit.status.charAt(0).toUpperCase() + audit.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
