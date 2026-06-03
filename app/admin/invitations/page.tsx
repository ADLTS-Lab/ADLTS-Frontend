"use client";

import { useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import {
  createInvitation,
  deleteInvitation,
  listInvitationsSafe,
  resendInvitation,
  type InvitationEntityType,
  type InvitationRecord,
} from "@/services/invitations.service";
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
  Select,
  StatBlock,
  StatusBadge,
  type DataTableColumn,
} from "@/app/components/ui";

const ENTITY_OPTIONS: InvitationEntityType[] = [
  "expert",
  "admin",
  "super_admin",
  "institute",
  "transport_authority",
];

function formatRole(value: string) {
  return value.replace(/_/g, " ");
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(date);
}

export default function AdminInvitationsPage() {
  const [invitations, setInvitations] = useState<InvitationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    first_name: "",
    last_name: "",
    entity_type: "expert" as InvitationEntityType,
  });

  const pendingCount = useMemo(
    () => invitations.filter((invitation) => (invitation.status ?? "pending") === "pending").length,
    [invitations],
  );
  const acceptedCount = useMemo(
    () => invitations.filter((invitation) => invitation.status === "accepted").length,
    [invitations],
  );
  const displayUnavailable = Boolean(error) && invitations.length === 0;

  const loadInvitations = async () => {
    setIsLoading(true);
    setError("");
    const { data, error: nextError } = await listInvitationsSafe();
    setInvitations(data);
    setError(nextError ?? "");
    setIsLoading(false);
  };

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError("");

    listInvitationsSafe()
      .then(({ data, error: nextError }) => {
        if (!isMounted) return;
        setInvitations(data);
        setError(nextError ?? "");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await createInvitation(formData);
      const createdInvitation = response.data;
      if (response.success && createdInvitation) {
        setInvitations((current) => [createdInvitation, ...current]);
        setFormData({ email: "", first_name: "", last_name: "", entity_type: "expert" });
      } else if (response.message) {
        setError(response.message);
      }
    } catch (err) {
      setError(extractApiError(err, "Unable to send invitation. Check the email address and role, then try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async (invitationId: string) => {
    setError("");
    try {
      const result = await resendInvitation(invitationId);
      if (!result) {
        setError("Invitation resend is not available yet.");
        return;
      }

      setInvitations((current) => current.map((item) => (item.id === invitationId ? { ...item, ...result } : item)));
    } catch (err) {
      setError(extractApiError(err, "Unable to resend invitation."));
    }
  };

  const handleDelete = async (invitationId: string) => {
    setError("");
    try {
      const deleted = await deleteInvitation(invitationId);
      if (!deleted) {
        setError("Invitation delete is not available yet.");
        return;
      }

      setInvitations((current) => current.filter((item) => item.id !== invitationId));
    } catch (err) {
      setError(extractApiError(err, "Unable to delete invitation."));
    }
  };

  const metricValue = (value: number) => (isLoading || displayUnavailable ? "-" : value);

  const columns: Array<DataTableColumn<InvitationRecord>> = [
    {
      key: "email",
      header: "Email",
      cell: (invitation) => invitation.email,
    },
    {
      key: "name",
      header: "Name",
      cell: (invitation) => `${invitation.first_name || ""} ${invitation.last_name || ""}`.trim() || "-",
    },
    {
      key: "role",
      header: "Role",
      cell: (invitation) => formatRole(invitation.entity_type),
    },
    {
      key: "status",
      header: "Status",
      cell: (invitation) => <StatusBadge status={invitation.status ?? "pending"} />,
    },
    {
      key: "invited",
      header: "Invited",
      cell: (invitation) => formatDate(invitation.invited_at),
    },
    {
      key: "actions",
      header: "Actions",
      cell: (invitation) => (
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={() => void handleResend(invitation.id)}>
            Resend
          </Button>
          <Button type="button" variant="danger" size="sm" onClick={() => void handleDelete(invitation.id)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageContainer width="wide" className="space-y-6">
      <PageHeader
        title="Invitation management"
        description="Create, resend, and track staff invitations from the backend."
        action={
          <Button type="button" variant="secondary" onClick={() => void loadInvitations()} disabled={isLoading} state={isLoading ? { loading: true } : undefined}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card padding="md" variant="metric">
          <StatBlock label="Total invitations" value={metricValue(invitations.length)} />
        </Card>
        <Card padding="md" variant="metric">
          <StatBlock label="Pending" value={metricValue(pendingCount)} />
        </Card>
        <Card padding="md" variant="metric">
          <StatBlock label="Accepted" value={metricValue(acceptedCount)} />
        </Card>
      </div>

      {error ? <Alert variant="error">{error}</Alert> : null}

      <div className="grid gap-6 lg:grid-cols-[380px,1fr]">
        <Card padding="lg">
          <CardHeader
            title="Create invitation"
            description="Choose the role that matches the user's responsibility. Staff roles should not be created through candidate registration."
          />

          <form onSubmit={handleCreate} className="space-y-5">
            <Input
              label="Email"
              value={formData.email}
              onChange={(event) => setFormData((current) => ({ ...current, email: event.target.value }))}
              type="email"
              required
            />
            <Input
              label="First name"
              value={formData.first_name}
              onChange={(event) => setFormData((current) => ({ ...current, first_name: event.target.value }))}
              required
            />
            <Input
              label="Last name"
              value={formData.last_name}
              onChange={(event) => setFormData((current) => ({ ...current, last_name: event.target.value }))}
              required
            />
            <Select
              label="Role"
              value={formData.entity_type}
              onChange={(event) => setFormData((current) => ({ ...current, entity_type: event.target.value as InvitationEntityType }))}
            >
              {ENTITY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {formatRole(option)}
                </option>
              ))}
            </Select>

            <Button
              type="submit"
              disabled={isSubmitting}
              state={isSubmitting ? { loading: true } : undefined}
              fullWidth
            >
              Send invitation
            </Button>
          </form>
        </Card>

        <Card padding="none" className="overflow-hidden">
          <CardHeader title="Staff invitations" description="Resend or delete pending staff invitations from the backend." />
          <DataTable
            columns={columns}
            data={invitations}
            getRowKey={(invitation) => invitation.id}
            loading={isLoading}
            emptyTitle="No invitations found"
            emptyDescription="No invitations found."
            className="rounded-none border-x-0 border-b-0"
          />
        </Card>
      </div>
    </PageContainer>
  );
}
