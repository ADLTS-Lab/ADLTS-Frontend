"use client";

import { useEffect, useMemo, useState } from "react";
import { getSystemMetrics, getRecentAudits, SystemMetrics, AuditLog } from "@/services/super-admin.service";
import { useI18n } from "@/i18n/useI18n";
import { extractApiError } from "@/services/api-utils";
import {
  Alert,
  Button,
  Card,
  CardHeader,
  PageContainer,
  PageHeader,
  StatusBadge,
  ui,
} from "@/app/components/ui";

export default function SuperAdminDashboard() {
  const { t } = useI18n();
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [audits, setAudits] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const metricCards = useMemo(
    () => [
      {
        label: "Total Active Candidates",
        value: metrics?.totalActiveCandidates,
      },
      {
        label: "Registered Institutes",
        value: metrics?.registeredInstitutes,
      },
      {
        label: "Active Biometric Devices",
        value: metrics?.activeDevices,
      },
      {
        label: "System Health",
        value: metrics ? `${metrics.systemHealth}%` : undefined,
      },
    ],
    [metrics]
  );

  const formatAuditStatus = (status: string) => {
    switch (status) {
      case "success":
        return "success";
      case "error":
        return "error";
      default:
        return "warning";
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError("");
      try {
        const [metricsRes, auditsRes] = await Promise.all([getSystemMetrics(), getRecentAudits()]);
        if (metricsRes.success) {
          setMetrics(metricsRes.data ?? null);
        } else {
          setMetrics(null);
        }
        if (auditsRes.success) {
          setAudits(auditsRes.data ?? []);
        } else {
          setAudits([]);
        }
      } catch (err) {
        setError(extractApiError(err, "Unable to load dashboard data."));
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <PageContainer width="wide">
      <PageHeader
        eyebrow={t("superAdmin") || "Super Admin"}
        title={t("superAdminDashboardTitle") || "Super Admin Portal"}
        description={t("superAdminDashboardDescription") || "System oversight and configuration management."}
        action={<Button variant="primary">Generate System Report</Button>}
      />

      {error ? <Alert variant="error">{error}</Alert> : null}
      {!error && !loading && !metrics ? (
        <Alert variant="warning">Super-admin metrics endpoint did not return data.</Alert>
      ) : null}

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((stat) => (
          <MetricCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            loading={loading}
          />
        ))}
      </section>

      <Card className="overflow-hidden p-0">
        <CardHeader
          title={t("superAdmin_audits_title") || "Recent System Audits"}
          description={t("superAdmin_audits_subtitle") || "System events captured during recent operations."}
          action={<Button variant="secondary" className="text-sm">View All Logs</Button>}
        />
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[var(--adlts-surface-soft)] text-[var(--adlts-ink-500)] border-b border-[var(--adlts-divider)]">
              <tr>
                <th className="px-6 py-4 font-medium">Action</th>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Timestamp</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--adlts-divider)]">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><div className="h-5 w-48 animate-pulse rounded bg-[var(--adlts-surface-soft)]" /></td>
                    <td className="px-6 py-4"><div className="h-5 w-24 animate-pulse rounded bg-[var(--adlts-surface-soft)]" /></td>
                    <td className="px-6 py-4"><div className="h-5 w-32 animate-pulse rounded bg-[var(--adlts-surface-soft)]" /></td>
                    <td className="px-6 py-4"><div className="h-5 w-16 animate-pulse rounded bg-[var(--adlts-surface-soft)]" /></td>
                  </tr>
                ))
              ) : audits.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-[var(--adlts-ink-400)]">No recent audits found.</td>
                </tr>
              ) : (
                audits.map((audit) => (
                  <tr key={audit.id} className="transition-colors hover:bg-[var(--adlts-surface-soft)]">
                    <td className="px-6 py-4 font-medium text-[var(--adlts-ink-900)]">{audit.action}</td>
                    <td className="px-6 py-4">{audit.user}</td>
                    <td className="px-6 py-4">{new Intl.DateTimeFormat("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(new Date(audit.timestamp))}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={audit.status} tone={formatAuditStatus(audit.status)} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </PageContainer>
  );
}

function MetricCard({ label, value, loading, delta }: { label: string; value?: number | string; loading: boolean; delta?: string }) {
  return (
    <Card padding="md" className="space-y-2">
      <p className={ui.statLabel}>{label}</p>
      {loading ? (
        <div className="h-9 w-24 rounded bg-[var(--adlts-surface-soft)] animate-pulse" />
      ) : (
        <p className="text-3xl font-semibold text-[var(--adlts-ink-900)]">{value?.toLocaleString?.() ?? "—"}</p>
      )}
      {delta ? <p className="text-sm text-[var(--adlts-ink-500)]">{delta}</p> : null}
    </Card>
  );
}
