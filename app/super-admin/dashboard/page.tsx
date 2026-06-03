"use client";

import { useEffect, useMemo, useState } from "react";
import { getRecentAudits, getSystemMetrics, type AuditLog, type SystemMetrics } from "@/services/super-admin.service";
import { extractApiError } from "@/services/api-utils";
import {
  Alert,
  Button,
  ButtonLink,
  Card,
  CardHeader,
  DataTable,
  PageContainer,
  PageHeader,
  StatBlock,
  StatusBadge,
  type DataTableColumn,
} from "@/app/components/ui";

function formatAuditStatus(status: string) {
  if (status === "success") return "success";
  if (status === "error") return "error";
  return "warning";
}

function formatTimestamp(timestamp: string) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function SuperAdminDashboard() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [audits, setAudits] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const metricCards = useMemo(
    () => [
      {
        label: "Total active candidates",
        value: metrics?.totalActiveCandidates,
      },
      {
        label: "Registered institutes",
        value: metrics?.registeredInstitutes,
      },
      {
        label: "Active devices",
        value: metrics?.activeDevices,
      },
      {
        label: "System health",
        value: metrics ? `${metrics.systemHealth}%` : undefined,
      },
    ],
    [metrics],
  );

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
      setMetrics(null);
      setAudits([]);
      setError(extractApiError(err, "Unable to load dashboard data."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const columns: Array<DataTableColumn<AuditLog>> = [
    {
      key: "action",
      header: "Action",
      cell: (audit) => audit.action,
    },
    {
      key: "user",
      header: "User",
      cell: (audit) => audit.user,
    },
    {
      key: "timestamp",
      header: "Timestamp",
      cell: (audit) => formatTimestamp(audit.timestamp),
    },
    {
      key: "status",
      header: "Status",
      cell: (audit) => <StatusBadge status={audit.status} tone={formatAuditStatus(audit.status)} />,
    },
  ];

  return (
    <PageContainer width="wide" className="space-y-6">
      <PageHeader
        title="Super admin portal"
        description="Monitor system-level activity, institution onboarding, audit events, and operational health."
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => void loadData()} disabled={loading} state={loading ? { loading: true } : undefined}>
              Refresh
            </Button>
            <ButtonLink href="/super-admin/audits" variant="outline">
              Audit logs
            </ButtonLink>
          </div>
        }
      />

      {error ? <Alert variant="error">{error}</Alert> : null}
      {!error && !loading && !metrics ? (
        <Alert variant="warning">Super admin metrics endpoint did not return data. Check backend availability before assuming zero activity.</Alert>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metricCards.map((stat) => (
          <MetricCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            loading={loading}
          />
        ))}
      </section>

      <Card padding="none" className="overflow-hidden">
        <CardHeader
          title="Recent audits"
          description="Review recent system events, actors, timestamps, and outcomes."
          action={
            <ButtonLink variant="secondary" size="sm" href="/super-admin/audits">
              View audit logs
            </ButtonLink>
          }
        />
        <DataTable
          columns={columns}
          data={audits}
          getRowKey={(audit) => audit.id}
          loading={loading}
          emptyTitle="No audit events found"
          emptyDescription="No audit events found."
          className="rounded-none border-x-0 border-b-0"
        />
      </Card>
    </PageContainer>
  );
}

function MetricCard({ label, value, loading }: { label: string; value?: number | string; loading: boolean }) {
  return (
    <Card padding="md" variant="metric">
      <StatBlock label={label} value={loading ? "-" : value ?? "-"} />
    </Card>
  );
}
