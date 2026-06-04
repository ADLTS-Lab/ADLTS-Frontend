"use client";

import { useEffect, useMemo, useState } from "react";
import { Copy, RefreshCw } from "lucide-react";
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
import { extractApiError } from "@/services/api-utils";
import {
  createInvitation,
  deleteInvitation,
  listInvitationsSafe,
  resendInvitation,
  type InvitationEntityType,
  type InvitationRecord,
} from "@/services/invitations.service";

type InvitationManagementPageProps = {
  title: string;
  description: string;
  createDescription: string;
  entityOptions: InvitationEntityType[];
};

const isDevelopment = process.env.NODE_ENV === "development";

function formatRole(value: string) {
  return value.replace(/_/g, " ");
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(date);
}

function getDisplayDate(invitation: InvitationRecord) {
  return invitation.invited_at ?? invitation.created_at;
}

function buildAcceptLink(token?: string) {
  if (!token || typeof window === "undefined") return "";
  return `${window.location.origin}/accept-invitation?token=${encodeURIComponent(token)}`;
}

export function InvitationManagementPage({
  title,
  description,
  createDescription,
  entityOptions,
}: InvitationManagementPageProps) {
  const [invitations, setInvitations] = useState<InvitationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [devInviteLink, setDevInviteLink] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    entity_type: entityOptions[0] ?? "expert",
  });

  const pendingCount = useMemo(
    () => invitations.filter((invitation) => (invitation.status ?? "pending") === "pending" && !invitation.used_at).length,
    [invitations],
  );
  const acceptedCount = useMemo(
    () => invitations.filter((invitation) => invitation.status === "accepted" || Boolean(invitation.accepted_at ?? invitation.used_at)).length,
    [invitations],
  );
  const displayUnavailable = Boolean(error) && invitations.length === 0;
  const metricValue = (value: number) => (isLoading || displayUnavailable ? "-" : value);

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
    setSuccess("");
    setDevInviteLink("");

    try {
      const response = await createInvitation(formData);
      const createdInvitation = response.data;
      if (response.success && createdInvitation) {
        setInvitations((current) => [createdInvitation, ...current]);
        setFormData({ email: "", entity_type: entityOptions[0] ?? "expert" });
        setSuccess(response.message ?? "Invitation created.");
        if (isDevelopment && createdInvitation.token) {
          setDevInviteLink(buildAcceptLink(createdInvitation.token));
        }
      } else {
        setError(response.message ?? "Unable to create invitation.");
      }
    } catch (err) {
      setError(extractApiError(err, "Unable to send invitation. Check the email address and role, then try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async (invitationId: string) => {
    setError("");
    setSuccess("");
    setDevInviteLink("");
    try {
      const result = await resendInvitation(invitationId);
      if (!result) {
        setError("Invitation resend did not return an invitation record.");
        return;
      }

      setInvitations((current) => current.map((item) => (item.id === invitationId ? { ...item, ...result } : item)));
      setSuccess("Invitation resent.");
      if (isDevelopment && result.token) {
        setDevInviteLink(buildAcceptLink(result.token));
      }
    } catch (err) {
      setError(extractApiError(err, "Unable to resend invitation."));
    }
  };

  const handleDelete = async (invitationId: string) => {
    setError("");
    setSuccess("");
    try {
      const deleted = await deleteInvitation(invitationId);
      if (!deleted) {
        setError("Invitation delete did not complete.");
        return;
      }

      setInvitations((current) => current.filter((item) => item.id !== invitationId));
      setSuccess("Invitation deleted.");
    } catch (err) {
      setError(extractApiError(err, "Unable to delete invitation."));
    }
  };

  const copyDevLink = async () => {
    if (!devInviteLink) return;
    await navigator.clipboard?.writeText(devInviteLink);
    setSuccess("Invitation link copied.");
  };

  const columns: Array<DataTableColumn<InvitationRecord>> = [
    {
      key: "email",
      header: "Email",
      cell: (invitation) => invitation.email,
    },
    {
      key: "role",
      header: "Role",
      cell: (invitation) => formatRole(invitation.entity_type),
    },
    {
      key: "status",
      header: "Status",
      cell: (invitation) => <StatusBadge status={invitation.used_at ? "accepted" : invitation.status ?? "pending"} />,
    },
    {
      key: "expires",
      header: "Expires",
      cell: (invitation) => formatDate(invitation.expires_at),
    },
    {
      key: "created",
      header: "Created",
      cell: (invitation) => formatDate(getDisplayDate(invitation)),
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
        title={title}
        description={description}
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
      {success ? <Alert variant="success">{success}</Alert> : null}
      {devInviteLink ? (
        <Alert variant="info">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="break-all">Development invite link: {devInviteLink}</span>
            <Button type="button" variant="secondary" size="sm" onClick={() => void copyDevLink()}>
              <Copy className="h-4 w-4" />
              Copy
            </Button>
          </div>
        </Alert>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[380px,1fr]">
        <Card padding="lg">
          <CardHeader title="Create invitation" description={createDescription} />

          <form onSubmit={handleCreate} className="space-y-5">
            <Input
              label="Email"
              value={formData.email}
              onChange={(event) => setFormData((current) => ({ ...current, email: event.target.value }))}
              type="email"
              required
            />
            <Select
              label="Invitation type"
              value={formData.entity_type}
              onChange={(event) => setFormData((current) => ({ ...current, entity_type: event.target.value as InvitationEntityType }))}
            >
              {entityOptions.map((option) => (
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
          <CardHeader title="Invitation records" description="Resend or delete pending invitations returned by the backend." />
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
