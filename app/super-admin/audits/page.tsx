"use client";

import { useEffect, useState } from "react";
import { getRecentAudits, type AuditLog } from "@/services/super-admin.service";
import { useI18n } from "@/i18n/useI18n";
import { extractApiError } from "@/services/api-utils";
import { Alert, Button, Card, CardHeader, PageContainer, PageHeader, StatusBadge } from "@/app/components/ui";

export default function SuperAdminAuditsPage() {
  const { t } = useI18n();
  const [audits, setAudits] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;

    const loadAudits = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await getRecentAudits();
        if (!alive) return;
        if (response.success) {
          setAudits(response.data ?? []);
        } else {
          setAudits([]);
          setError("Unable to load audit logs.");
        }
      } catch (err) {
        if (!alive) return;
        setError(extractApiError(err, "Unable to load audit logs."));
      } finally {
        if (alive) setLoading(false);
      }
    };

    void loadAudits();

    return () => {
      alive = false;
    };
  }, []);

  return (
    <PageContainer width="wide">
      <PageHeader
        eyebrow="Super Admin"
        title={t("superAdmin_audits_title")}
        description={t("superAdmin_audits_subtitle")}
        action={<Button variant="secondary" onClick={() => window.location.reload()}>Refresh</Button>}
      />

      {error ? <Alert variant="error">{error}</Alert> : null}

      <Card className="overflow-hidden p-0">
        <CardHeader title="Recent audit events" />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[60rem] text-left text-sm">
            <thead className="bg-[var(--adlts-surface-soft)] border-b border-[var(--adlts-divider)]">
              <tr>
                <th className="px-6 py-4 font-medium text-[var(--adlts-ink-700)]">Action</th>
                <th className="px-6 py-4 font-medium text-[var(--adlts-ink-700)]">User</th>
                <th className="px-6 py-4 font-medium text-[var(--adlts-ink-700)]">Timestamp</th>
                <th className="px-6 py-4 font-medium text-[var(--adlts-ink-700)]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--adlts-divider)]">
              {loading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4"><div className="h-5 w-56 animate-pulse rounded bg-[var(--adlts-surface-soft)]" /></td>
                    <td className="px-6 py-4"><div className="h-5 w-28 animate-pulse rounded bg-[var(--adlts-surface-soft)]" /></td>
                    <td className="px-6 py-4"><div className="h-5 w-36 animate-pulse rounded bg-[var(--adlts-surface-soft)]" /></td>
                    <td className="px-6 py-4"><div className="h-5 w-20 animate-pulse rounded bg-[var(--adlts-surface-soft)]" /></td>
                  </tr>
                ))
              ) : audits.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-[var(--adlts-ink-500)]">
                    {t("superAdmin_audits_empty")}
                  </td>
                </tr>
              ) : (
                audits.map((audit) => (
                  <tr key={audit.id} className="transition-colors hover:bg-[var(--adlts-surface-soft)]">
                    <td className="px-6 py-4 font-medium text-[var(--adlts-ink-900)]">{audit.action}</td>
                    <td className="px-6 py-4">{audit.user}</td>
                    <td className="px-6 py-4">{formatTimestamp(audit.timestamp)}</td>
                    <td className="px-6 py-4">
                      <StatusBadge
                        status={audit.status}
                        tone={
                          audit.status === "success"
                            ? "success"
                            : audit.status === "error"
                              ? "error"
                              : "warning"
                        }
                      />
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

function formatTimestamp(timestamp: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp));
}
