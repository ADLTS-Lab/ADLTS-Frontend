"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import {
  Alert,
  Button,
  Card,
  CardHeader,
  DataTable,
  Input,
  PageContainer,
  PageHeader,
  StatBlock,
  StatusBadge,
  type DataTableColumn,
} from "@/app/components/ui";
import { extractApiError } from "@/services/api-utils";
import { listExperts, updateExpertStatus, type ExpertRecord } from "@/services/experts.service";

function statusTone(status: string) {
  if (status === "active") return "success";
  if (status === "suspended" || status === "inactive") return "inactive";
  return "neutral";
}

function formatDate(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(date);
}

export default function SuperAdminExpertsPage() {
  const [search, setSearch] = useState("");
  const [experts, setExperts] = useState<ExpertRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState("");

  useEffect(() => {
    const loadExperts = async () => {
      setIsLoading(true);
      setError("");

      try {
        setExperts(await listExperts(search ? { search } : undefined));
      } catch (err: unknown) {
        setError(extractApiError(err, "Unable to load experts."));
        setExperts([]);
      } finally {
        setIsLoading(false);
      }
    };

    void loadExperts();
  }, [search]);

  const activeCount = useMemo(() => experts.filter((expert) => expert.status === "active").length, [experts]);
  const inactiveCount = experts.length - activeCount;
  const displayUnavailable = Boolean(error) && experts.length === 0;
  const metricValue = (value: number) => (isLoading || displayUnavailable ? "-" : value);

  const toggleStatus = async (expert: ExpertRecord) => {
    const nextStatus = expert.status === "active" ? "suspended" : "active";
    setUpdatingId(expert.id);
    setError("");

    try {
      await updateExpertStatus(expert.id, nextStatus);
      setExperts((current) => current.map((item) => (item.id === expert.id ? { ...item, status: nextStatus } : item)));
    } catch (err: unknown) {
      setError(extractApiError(err, "Unable to update expert status."));
    } finally {
      setUpdatingId("");
    }
  };

  const columns: Array<DataTableColumn<ExpertRecord>> = [
    {
      key: "name",
      header: "Name",
      cell: (expert) => expert.name || `${expert.first_name} ${expert.last_name}`.trim() || "-",
    },
    {
      key: "email",
      header: "Email",
      cell: (expert) => expert.email,
    },
    {
      key: "employee",
      header: "Employee ID",
      cell: (expert) => expert.employee_id || "-",
    },
    {
      key: "created",
      header: "Created",
      cell: (expert) => formatDate(expert.created_at),
    },
    {
      key: "status",
      header: "Status",
      cell: (expert) => <StatusBadge status={expert.status} tone={statusTone(expert.status)} />,
    },
    {
      key: "action",
      header: "Action",
      cell: (expert) => (
        <Button
          variant={expert.status === "active" ? "danger" : "secondary"}
          size="sm"
          disabled={updatingId === expert.id}
          state={updatingId === expert.id ? { loading: true } : undefined}
          onClick={() => void toggleStatus(expert)}
        >
          {expert.status === "active" ? "Suspend" : "Activate"}
        </Button>
      ),
    },
  ];

  return (
    <PageContainer width="wide" className="space-y-6">
      <PageHeader
        title="Expert management"
        description="Review expert reviewer accounts and manage active or suspended status."
      />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card padding="md" variant="metric">
          <StatBlock label="Active experts" value={metricValue(activeCount)} />
        </Card>
        <Card padding="md" variant="metric">
          <StatBlock label="Inactive or suspended" value={metricValue(inactiveCount)} />
        </Card>
        <Card padding="md" variant="metric">
          <StatBlock label="Total experts" value={metricValue(experts.length)} />
        </Card>
      </section>

      <Card padding="md">
        <CardHeader
          title="Expert search"
          description="Search reviewer accounts by supported backend fields."
        />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search experts"
          label="Search"
          suffix={<Search size={16} className="text-[var(--text-tertiary)]" />}
        />
      </Card>

      {error ? <Alert variant="error">{error}</Alert> : null}

      <Card padding="none" className="overflow-hidden">
        <CardHeader
          title="Expert records"
          description="Experts handle candidate appeals and review workflows after account activation."
        />
        <DataTable
          columns={columns}
          data={experts}
          getRowKey={(expert) => expert.id}
          loading={isLoading}
          emptyTitle="No experts found"
          emptyDescription="No experts found for this search."
          className="rounded-none border-x-0 border-b-0"
        />
      </Card>
    </PageContainer>
  );
}
