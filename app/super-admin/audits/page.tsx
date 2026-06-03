"use client";

import { useEffect, useState } from "react";
import { getRecentAudits, type AuditLog } from "@/services/super-admin.service";
import { extractApiError } from "@/services/api-utils";
import {
  Alert,
  Button,
  Card,
  CardHeader,
  DataTable,
  PageContainer,
  PageHeader,
  StatusBadge,
  type DataTableColumn,
} from "@/app/components/ui";

function formatTimestamp(timestamp: string) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function statusTone(status: AuditLog["status"]) {
  if (status === "success") return "success";
  if (status === "error") return "error";
  return "warning";
}

export default function SuperAdminAuditsPage() {
  const [audits, setAudits] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAudits = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getRecentAudits();
      if (response.success) {
        setAudits(response.data ?? []);
      } else {
        setAudits([]);
        setError("Unable to load audit logs.");
      }
    } catch (err) {
      setError(extractApiError(err, "Unable to load audit logs."));
      setAudits([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAudits();
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
      cell: (audit) => <StatusBadge status={audit.status} tone={statusTone(audit.status)} />,
    },
  ];

  return (
    <PageContainer width="wide" className="space-y-6">
      <PageHeader
        title="System audit logs"
        description="Review recent system events captured during platform operations."
        action={
          <Button variant="secondary" onClick={() => void loadAudits()} disabled={loading} state={loading ? { loading: true } : undefined}>
            Refresh
          </Button>
        }
      />

      {error ? <Alert variant="error">{error}</Alert> : null}

      <Card padding="none" className="overflow-hidden">
        <CardHeader title="Audit table" description="Review recent system events captured during platform operations." />
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
