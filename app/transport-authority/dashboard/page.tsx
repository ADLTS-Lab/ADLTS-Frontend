"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CircleAlert, CheckCircle2, ShieldAlert, ShieldCheck } from "lucide-react";
import { useI18n } from "@/i18n/useI18n";
import { extractApiError } from "@/services/api-utils";
import {
  getRegionalAnalytics,
  getComplianceAlerts,
  RegionalAnalytics,
  ComplianceAlert,
} from "@/services/transport-authority.service";
import { Alert, Button, Card, CardHeader, PageContainer, PageHeader, StatusBadge, ui } from "@/app/components/ui";

function severityTone(severity: ComplianceAlert["severity"]) {
  if (severity === "High") return "error";
  if (severity === "Medium") return "warning";
  return "neutral";
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(date);
}

export default function TransportAuthorityDashboard() {
  const { t } = useI18n();
  const [analytics, setAnalytics] = useState<RegionalAnalytics | null>(null);
  const [alerts, setAlerts] = useState<ComplianceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unavailableReason, setUnavailableReason] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    setUnavailableReason(null);

    try {
      const [analyticsRes, alertsRes] = await Promise.all([getRegionalAnalytics(), getComplianceAlerts()]);

      if (analyticsRes.success && analyticsRes.data) {
        setAnalytics(analyticsRes.data);
      } else {
        setAnalytics(null);
        setUnavailableReason(analyticsRes.message || t("transport_authority_data_unavailable"));
      }

      if (alertsRes.success && alertsRes.data) {
        setAlerts(alertsRes.data);
      } else {
        setAlerts([]);
      }
    } catch (err) {
      setError(extractApiError(err, "Failed to load authority dashboard data"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const statCards = [
    {
      label: "Licensed Drivers",
      value: analytics?.licensedDrivers ?? "—",
      tone: "info" as const,
      icon: ShieldCheck,
    },
    {
      label: "Regional Pass Rate",
      value: analytics ? `${analytics.regionalPassRate}%` : "—",
      tone: "success" as const,
      icon: CheckCircle2,
    },
    {
      label: "Active Test Centers",
      value: analytics?.activeCenters ?? "—",
      tone: "info" as const,
      icon: ShieldCheck,
    },
    {
      label: "Pending Violations",
      value: analytics?.pendingViolations ?? "—",
      tone: "warning" as const,
      icon: AlertTriangle,
    },
  ];

  return (
    <PageContainer width="wide" className="space-y-7">
      <PageHeader
        eyebrow={t("transportAuthority") || "Transport Authority"}
        title={t("regionalAuthorityPortal") || "Regional Authority Portal"}
        description={t("authorityOverview") || "Monitor regional compliance and performance indicators."}
        action={
          <Button variant="outline" onClick={() => void loadData()} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
        }
      />

      {error ? <Alert variant="error">{error}</Alert> : null}
      {unavailableReason ? <Alert variant="warning">{unavailableReason}</Alert> : null}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} padding="md" className="space-y-3">
              <div className="mb-1 inline-flex h-9 w-9 items-center justify-center rounded-md bg-[var(--adlts-surface-soft)] text-[var(--adlts-blue-700)]">
                <Icon className="h-4 w-4" />
              </div>
              <p className={ui.statLabel}>{card.label}</p>
              {loading ? (
                <div className="h-9 w-20 rounded bg-[var(--adlts-surface-soft)] animate-pulse" />
              ) : (
                <p className="text-3xl font-semibold text-[var(--adlts-ink-900)]">{card.value}</p>
              )}
              <p className="text-xs text-[var(--adlts-ink-500)]">Updated from authority endpoint</p>
            </Card>
          );
        })}
      </section>

      <Card className="overflow-hidden p-0">
        <CardHeader
          title={t("complianceAlerts") || "Compliance Alerts"}
          description={t("complianceAlertsDescription") || "Review active safety or process issues for test centers."}
        />
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[var(--adlts-surface-soft)] text-sm text-[var(--adlts-ink-500)] border-b border-[var(--adlts-divider)]">
              <tr>
                <th className="px-6 py-4">Test Center</th>
                <th className="px-6 py-4">Issue Description</th>
                <th className="px-6 py-4">Date Reported</th>
                <th className="px-6 py-4">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--adlts-divider)]">
              {loading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4"><div className="h-5 w-36 rounded bg-[var(--adlts-surface-soft)] animate-pulse" /></td>
                    <td className="px-6 py-4"><div className="h-5 w-64 rounded bg-[var(--adlts-surface-soft)] animate-pulse" /></td>
                    <td className="px-6 py-4"><div className="h-5 w-24 rounded bg-[var(--adlts-surface-soft)] animate-pulse" /></td>
                    <td className="px-6 py-4"><div className="h-5 w-20 rounded bg-[var(--adlts-surface-soft)] animate-pulse" /></td>
                  </tr>
                ))
              ) : alerts.length === 0 ? (
                <tr>
                  <td className="px-6 py-12 text-center text-[var(--adlts-ink-500)]" colSpan={4}>
                    No active compliance issues.
                  </td>
                </tr>
              ) : (
                alerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-[var(--adlts-surface-soft)]">
                    <td className="px-6 py-4 font-medium text-[var(--adlts-ink-900)]">{alert.centerName}</td>
                    <td className="px-6 py-4 text-[var(--adlts-ink-700)]">
                      <span className="inline-flex items-center gap-2">
                        <CircleAlert className="h-3.5 w-3.5 text-[var(--adlts-ink-500)]" />
                        {alert.issue}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[var(--adlts-ink-700)]">{formatDate(alert.dateReported)}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={alert.severity} tone={severityTone(alert.severity)} />
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
