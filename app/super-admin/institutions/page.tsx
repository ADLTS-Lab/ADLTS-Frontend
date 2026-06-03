"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Copy, PowerOff, RefreshCcw } from "lucide-react";
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
import {
  disableInstitution,
  inviteInstitution,
  listInstitutions,
  resendInstitutionInvitation,
  type InstitutionAccount,
} from "@/services/institution-invitation.service";
import { extractApiError } from "@/services/api-utils";

const statusStyles: Record<string, "success" | "inactive" | "warning" | "neutral"> = {
  Invited: "warning",
  Active: "success",
  Disabled: "inactive",
};

export default function SuperAdminInstitutionsPage() {
  const [institutions, setInstitutions] = useState<InstitutionAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [latestInviteLink, setLatestInviteLink] = useState("");
  const [form, setForm] = useState({ institutionName: "", email: "" });

  const counts = useMemo(
    () => ({
      total: institutions.length,
      invited: institutions.filter((institution) => institution.status === "Invited").length,
      active: institutions.filter((institution) => institution.status === "Active").length,
      disabled: institutions.filter((institution) => institution.status === "Disabled").length,
    }),
    [institutions],
  );
  const displayUnavailable = Boolean(error) && institutions.length === 0;
  const metricValue = (value: number) => (isLoading || displayUnavailable ? "-" : value);

  const loadInstitutions = async () => {
    setIsLoading(true);
    setError("");
    try {
      setInstitutions(await listInstitutions());
    } catch (err) {
      setInstitutions([]);
      setError(extractApiError(err, "Unable to load institutions."));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadInstitutions();
  }, []);

  const handleInvite = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess("");
    setLatestInviteLink("");

    try {
      const result = await inviteInstitution(form);
      setInstitutions((current) => [result.institution, ...current.filter((item) => item.id !== result.institution.id)]);
      setSuccess(result.message);
      setLatestInviteLink(result.invitationLink ?? "");
      setForm({ institutionName: "", email: "" });
    } catch (err) {
      setError(extractApiError(err, "Unable to invite institution."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async (institution: InstitutionAccount) => {
    setError("");
    setSuccess("");
    try {
      const result = await resendInstitutionInvitation(institution.id);
      setInstitutions((current) => current.map((item) => (item.id === institution.id ? result.institution : item)));
      setSuccess(result.message);
      setLatestInviteLink(result.invitationLink ?? "");
    } catch (err) {
      setError(extractApiError(err, "Unable to resend invitation."));
    }
  };

  const handleDisable = async (institution: InstitutionAccount) => {
    setError("");
    setSuccess("");
    try {
      const disabled = await disableInstitution(institution.id);
      setInstitutions((current) => current.map((item) => (item.id === institution.id ? { ...item, ...disabled } : item)));
      setSuccess(`${institution.name} has been disabled.`);
    } catch (err) {
      setError(extractApiError(err, "Unable to disable institution."));
    }
  };

  const copyInviteLink = async () => {
    if (!latestInviteLink) return;
    const absoluteLink = `${window.location.origin}${latestInviteLink}`;
    await navigator.clipboard?.writeText(absoluteLink);
    setSuccess("Invitation link copied.");
  };

  const columns: Array<DataTableColumn<InstitutionAccount>> = [
    {
      key: "name",
      header: "Institution",
      cell: (institution) => institution.name,
    },
    {
      key: "email",
      header: "Email",
      cell: (institution) => institution.email,
    },
    {
      key: "status",
      header: "Status",
      cell: (institution) => <StatusBadge status={institution.status} tone={statusStyles[institution.status] ?? "neutral"} />,
    },
    {
      key: "actions",
      header: "Actions",
      cell: (institution) => (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => void handleResend(institution)}
            disabled={institution.status === "Disabled"}
          >
            <RefreshCcw size={12} />
            Resend
          </Button>
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={() => void handleDisable(institution)}
            disabled={institution.status === "Disabled"}
          >
            <PowerOff size={12} />
            Disable
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageContainer width="wide" className="space-y-6">
      <PageHeader
        title="Institutions"
        description="Invite institutions, manage onboarding links, and monitor institution account status."
      />

      <section className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        <Summary label="Total" value={metricValue(counts.total)} />
        <Summary label="Invited" value={metricValue(counts.invited)} />
        <Summary label="Active" value={metricValue(counts.active)} />
        <Summary label="Disabled" value={metricValue(counts.disabled)} />
      </section>

      <Alert variant="warning">
        Disabling an institution may prevent account access and operational actions. Confirm this action with the responsible authority before proceeding.
      </Alert>

      {error ? <Alert variant="error">{error}</Alert> : null}
      {success ? (
        <Alert variant="success">
          <div className="space-y-2">
            <p>{success}</p>
            {latestInviteLink ? (
              <div className="flex flex-wrap items-center gap-2">
                <Link className="font-medium text-[var(--accent)] underline-offset-4 hover:underline" href={latestInviteLink}>
                  Open invitation link
                </Link>
                <Button type="button" variant="secondary" size="sm" onClick={() => void copyInviteLink()}>
                  <Copy size={12} />
                  Copy
                </Button>
              </div>
            ) : null}
          </div>
        </Alert>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[380px,1fr]">
        <Card className="space-y-4">
          <CardHeader
            title="Invite institution"
            description="Create a secure onboarding link for an institution administrator."
          />
          <form onSubmit={handleInvite} className="space-y-4">
            <Input
              label="Institution name"
              value={form.institutionName}
              onChange={(event) => setForm((current) => ({ ...current, institutionName: event.target.value }))}
              required
              placeholder="Driving school"
            />
            <Input
              label="Email address"
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              required
              placeholder="admin@institution.et"
            />

            <Button type="submit" disabled={isSubmitting} fullWidth state={isSubmitting ? { loading: true } : undefined}>
              Invite institution
            </Button>
          </form>
        </Card>

        <Card padding="none" className="overflow-hidden">
          <CardHeader
            title="Institution accounts"
            description="Review onboarding status, resend invitation links, or disable institution access."
          />
          <DataTable
            columns={columns}
            data={institutions}
            getRowKey={(institution) => institution.id}
            loading={isLoading}
            emptyTitle="No institutions found"
            emptyDescription="No institutions have been invited yet."
            className="rounded-none border-x-0 border-b-0"
          />
        </Card>
      </div>
    </PageContainer>
  );
}

function Summary({ label, value }: { label: string; value: string | number }) {
  return (
    <Card padding="md" variant="metric">
      <StatBlock label={label} value={value} />
    </Card>
  );
}
