"use client";

import { useEffect, useMemo, useState } from "react";
import { getSystemMetrics, type SystemMetrics } from "@/services/super-admin.service";
import { extractApiError } from "@/services/api-utils";
import {
  Alert,
  Button,
  ButtonLink,
  Card,
  PageContainer,
  PageHeader,
  StatBlock,
} from "@/app/components/ui";

export default function SuperAdminDashboard() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
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
      const metricsRes = await getSystemMetrics();
      if (metricsRes.success) {
        setMetrics(metricsRes.data ?? null);
      } else {
        setMetrics(null);
      }
    } catch (err) {
      setMetrics(null);
      setError(extractApiError(err, "Unable to load dashboard data."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  return (
    <PageContainer width="wide" className="space-y-6">
      <PageHeader
        title="Super admin portal"
        description="Monitor platform ownership workflows, institution onboarding, people management, invitations, and reports."
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => void loadData()} disabled={loading} state={loading ? { loading: true } : undefined}>
              Refresh
            </Button>
            <ButtonLink href="/super-admin/invitations" variant="outline">
              Invitations
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

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ActionCard href="/super-admin/candidates" title="Candidates" description="Review candidate accounts and platform access." />
        <ActionCard href="/super-admin/experts" title="Experts" description="Manage expert reviewer accounts." />
        <ActionCard href="/super-admin/institutions" title="Institutions" description="Manage institution onboarding and status." />
        <ActionCard href="/super-admin/reports" title="Reports" description="Generate and download test reports." />
      </section>
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

function ActionCard({ href, title, description }: { href: string; title: string; description: string }) {
  return (
    <Card padding="md" className="space-y-3">
      <div>
        <h2 className="text-[15px] font-semibold text-[var(--text-primary)]">{title}</h2>
        <p className="mt-1 text-[13px] leading-5 text-[var(--text-secondary)]">{description}</p>
      </div>
      <ButtonLink href={href} variant="secondary" size="sm">
        Open
      </ButtonLink>
    </Card>
  );
}
