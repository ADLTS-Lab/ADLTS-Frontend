"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import {
  listCandidates,
  updateCandidateStatus,
  type CandidateRecord,
} from "@/services/candidates.service";
import { extractApiError } from "@/services/api-utils";
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

export default function AdminCandidatesPage() {
  const [search, setSearch] = useState("");
  const [candidates, setCandidates] = useState<CandidateRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCandidates = async () => {
      setIsLoading(true);
      setError("");

      try {
        const data = await listCandidates(search ? { search } : undefined);
        setCandidates(data);
      } catch (err: unknown) {
        setError(extractApiError(err, "Unable to load candidates."));
        setCandidates([]);
      } finally {
        setIsLoading(false);
      }
    };

    void loadCandidates();
  }, [search]);

  const activeCount = useMemo(() => candidates.filter((candidate) => candidate.status === "active").length, [candidates]);
  const suspendedCount = candidates.length - activeCount;
  const displayUnavailable = Boolean(error) && candidates.length === 0;
  const metricValue = (value: number) => (isLoading || displayUnavailable ? "-" : value);

  const toggleStatus = async (candidate: CandidateRecord) => {
    const nextStatus = candidate.status === "active" ? "suspended" : "active";

    try {
      const { candidate: updated } = await updateCandidateStatus(candidate.id, nextStatus);
      setCandidates((current) => current.map((item) => (item.id === candidate.id ? updated : item)));
    } catch (err: unknown) {
      setError(extractApiError(err, "Unable to update candidate status."));
    }
  };

  const columns: Array<DataTableColumn<CandidateRecord>> = [
    {
      key: "name",
      header: "Name",
      cell: (candidate) => candidate.name || `${candidate.first_name} ${candidate.last_name}`.trim() || "-",
    },
    {
      key: "email",
      header: "Email",
      cell: (candidate) => candidate.email,
    },
    {
      key: "center",
      header: "Test center",
      cell: (candidate) => candidate.testCenter || "-",
    },
    {
      key: "category",
      header: "Category",
      cell: (candidate) => candidate.licenseCategory || "-",
    },
    {
      key: "status",
      header: "Status",
      cell: (candidate) => <StatusBadge status={candidate.status} tone={candidate.status === "active" ? "success" : "inactive"} />,
    },
    {
      key: "action",
      header: "Action",
      cell: (candidate) => (
        <Button
          variant={candidate.status === "active" ? "danger" : "secondary"}
          size="sm"
          onClick={() => void toggleStatus(candidate)}
        >
          {candidate.status === "active" ? "Suspend" : "Activate"}
        </Button>
      ),
    },
  ];

  return (
    <PageContainer width="wide" className="space-y-6">
      <PageHeader
        title="Candidate management"
        description="Search candidates, review account details, and manage active or suspended status."
      />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card padding="md" variant="metric">
          <StatBlock label="Active" value={metricValue(activeCount)} />
        </Card>
        <Card padding="md" variant="metric">
          <StatBlock label="Suspended" value={metricValue(suspendedCount)} />
        </Card>
        <Card padding="md" variant="metric">
          <StatBlock label="Total candidates" value={metricValue(candidates.length)} />
        </Card>
      </section>

      <Card padding="md">
        <CardHeader
          title="Candidate search"
          description="Search candidate records by supported backend fields before reviewing or changing status."
        />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search candidates"
          label="Search"
          suffix={<Search size={16} className="text-[var(--text-tertiary)]" />}
        />
      </Card>

      {error ? <Alert variant="error">{error}</Alert> : null}

      <Card padding="none" className="overflow-hidden">
        <CardHeader
          title="Candidate records"
          description="Use status changes carefully. Suspended candidates may be blocked from normal workflow actions."
        />
        <DataTable
          columns={columns}
          data={candidates}
          getRowKey={(candidate) => candidate.id}
          loading={isLoading}
          emptyTitle="No candidates found"
          emptyDescription="No candidates found for this search."
          className="rounded-none border-x-0 border-b-0"
        />
      </Card>
    </PageContainer>
  );
}
