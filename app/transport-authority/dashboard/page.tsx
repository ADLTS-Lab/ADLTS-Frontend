"use client";

import { useEffect, useState } from "react";
import { getRegionalAnalytics, getComplianceAlerts, RegionalAnalytics, ComplianceAlert } from "@/services/transport-authority.service";
import { extractApiError } from "@/services/api-utils";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { useI18n } from "@/i18n/useI18n";

export default function TransportAuthorityDashboard() {
  const { t } = useI18n();
  const [analytics, setAnalytics] = useState<RegionalAnalytics | null>(null);
  const [alerts, setAlerts] = useState<ComplianceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [analyticsRes, alertsRes] = await Promise.all([getRegionalAnalytics(), getComplianceAlerts()]);
        if (analyticsRes.success) setAnalytics(analyticsRes.data);
        if (alertsRes.success) setAlerts(alertsRes.data);
      } catch (err) {
        setError(extractApiError(err, "Failed to load authority data"));
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {error && (
        <div className="border border-rose-200 bg-rose-50 rounded-lg p-4">
          <p className="text-sm text-rose-700">{error}</p>
        </div>
      )}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Regional Authority Portal</h1>
          <p className="text-slate-500 mt-1">Monitor compliance and regional performance metrics.</p>
        </div>
        <Button variant="primary">Download Regional Report</Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Licensed Drivers", value: analytics?.licensedDrivers.toLocaleString(), color: "text-blue-600" },
          { label: "Regional Pass Rate", value: analytics ? `${analytics.regionalPassRate}%` : undefined, color: "text-emerald-600" },
          { label: "Active Test Centers", value: analytics?.activeCenters, color: "text-indigo-600" },
          { label: "Pending Violations", value: analytics?.pendingViolations, color: "text-rose-600" },
        ].map((stat, i) => (
          <Card key={i} className="p-6">
            <h3 className="text-sm font-medium text-slate-500">{stat.label}</h3>
            {loading ? (
              <div className="h-9 w-20 bg-slate-200 animate-pulse rounded mt-2"></div>
            ) : (
              <p className={`text-3xl font-bold mt-2 ${stat.color}`}>{stat.value || "—"}</p>
            )}
          </Card>
        ))}
      </div>

      {/* Table Section */}
      <Card className="overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
          <h2 className="text-lg font-semibold text-slate-900">Compliance & Alerts</h2>
          <Button variant="secondary" className="text-sm">Filter Alerts</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-medium">Test Center</th>
                <th className="px-6 py-4 font-medium">Issue Description</th>
                <th className="px-6 py-4 font-medium">Date Reported</th>
                <th className="px-6 py-4 font-medium">Severity</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><div className="h-5 w-32 bg-slate-100 animate-pulse rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-5 w-64 bg-slate-100 animate-pulse rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-5 w-24 bg-slate-100 animate-pulse rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-5 w-16 bg-slate-100 animate-pulse rounded"></div></td>
                    <td className="px-6 py-4 text-right"><div className="h-8 w-16 bg-slate-100 animate-pulse rounded inline-block"></div></td>
                  </tr>
                ))
              ) : alerts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">No active compliance issues.</td>
                </tr>
              ) : (
                alerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{alert.centerName}</td>
                    <td className="px-6 py-4 text-slate-700">{alert.issue}</td>
                    <td className="px-6 py-4">
                      {new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(alert.dateReported))}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        alert.severity === 'High' ? 'bg-rose-100 text-rose-800' : 
                        alert.severity === 'Medium' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'
                      }`}>
                        {alert.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="secondary" className="py-1 px-3 text-xs">Review</Button>
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
