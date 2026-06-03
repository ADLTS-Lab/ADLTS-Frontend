"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { extractApiError } from "@/services/api-utils";
import {
  getComplianceAlerts,
  getRegionalAnalytics,
  type ComplianceAlert,
  type RegionalAnalytics,
} from "@/services/transport-authority.service";
import {
  Alert,
  Button,
  Card,
  CardHeader,
  DataTable,
  PageContainer,
  PageHeader,
  StatBlock,
  StatusBadge,
  type DataTableColumn,
} from "@/app/components/ui";

function severityTone(severity: ComplianceAlert["severity"]) {
  if (severity === "High") return "error";
  if (severity === "Medium") return "warning";
  return "neutral";
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(date);
}

export default function TransportAuthorityDashboard() {
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
        setUnavailableReason(analyticsRes.message || "Transport authority analytics endpoint is unavailable. Refresh later or confirm backend access.");
      }

      if (alertsRes.success && alertsRes.data) {
        setAlerts(alertsRes.data);
      } else {
        setAlerts([]);
      }
    } catch (err) {
      setAnalytics(null);
      setAlerts([]);
      setError(extractApiError(err, "Failed to load authority dashboard data"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const statCards = [
    {
      label: "Licensed drivers",
      value: analytics?.licensedDrivers,
    },
    {
      label: "Regional pass rate",
      value: analytics ? `${analytics.regionalPassRate}%` : undefined,
    },
    {
      label: "Active centers",
      value: analytics?.activeCenters,
    },
    {
      label: "Pending violations",
      value: analytics?.pendingViolations,
    },
  ];

  const columns: Array<DataTableColumn<ComplianceAlert>> = [
    {
      key: "center",
      header: "Test center",
      cell: (alert) => alert.centerName,
    },
    {
      key: "issue",
      header: "Issue description",
      cell: (alert) => alert.issue,
    },
    {
      key: "date",
      header: "Date reported",
      cell: (alert) => formatDate(alert.dateReported),
    },
    {
      key: "severity",
      header: "Severity",
      cell: (alert) => <StatusBadge status={alert.severity} tone={severityTone(alert.severity)} />,
    },
  ];

  return (
    <PageContainer width="wide" className="space-y-6">
      <PageHeader
        title="Regional authority portal"
        description="Monitor regional compliance and performance indicators."
        action={
          <Button variant="outline" onClick={() => void loadData()} disabled={loading} state={loading ? { loading: true } : undefined}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        }
      />

      {error ? <Alert variant="error">{error}</Alert> : null}
      {unavailableReason ? <Alert variant="warning">{unavailableReason}</Alert> : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.label} padding="md">
            <StatBlock label={card.label} value={loading ? "-" : card.value ?? "-"} />
          </Card>
        ))}
      </section>

      <Card padding="none" className="overflow-hidden">
        <CardHeader
          title="Compliance alert table"
          description="Authority users review licensed driver counts, regional pass rates, active centers, pending violations, and compliance alerts when the endpoints provide data."
        />
        <DataTable
          columns={columns}
          data={alerts}
          getRowKey={(alert) => alert.id}
          loading={loading}
          emptyTitle="No active compliance issues"
          emptyDescription="No active compliance issues."
          className="rounded-none border-x-0 border-b-0"
        />
      </Card>

      <Card padding="md">
        <CardHeader title="Severity glossary" />
        <div className="grid gap-3 md:grid-cols-3">
          <SeverityItem severity="High" description="Requires urgent operational review." />
          <SeverityItem severity="Medium" description="Requires follow-up and monitoring." />
          <SeverityItem severity="Low" description="Informational or low-risk issue." />
        </div>
      </Card>
    </PageContainer>
  );
}

function SeverityItem({ severity, description }: { severity: ComplianceAlert["severity"]; description: string }) {
  return (
    <div className="rounded-[8px] border border-[var(--border)] bg-[var(--surface-2)] p-3">
      <StatusBadge status={severity} tone={severityTone(severity)} />
      <p className="mt-2 text-[13px] leading-5 text-[var(--text-secondary)]">{description}</p>
    </div>
  );
}
