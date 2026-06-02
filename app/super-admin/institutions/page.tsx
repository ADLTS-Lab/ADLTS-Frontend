"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Building2, CheckCircle2, Copy, Mail, PowerOff, RefreshCcw } from "lucide-react";
import { Button } from "@/app/components/ui/Button";
import { Card } from "@/app/components/ui/Card";
import { CardHeader } from "@/app/components/ui/Card";
import { Input } from "@/app/components/ui/Input";
import { PageContainer, PageHeader, StatusBadge, ui, Alert } from "@/app/components/ui";
import {
  disableInstitution,
  inviteInstitution,
  listInstitutions,
  resendInstitutionInvitation,
  type InstitutionAccount,
} from "@/services/institution-invitation.service";
import { extractApiError } from "@/services/api-utils";

const statusStyles: Record<string, "success" | "inactive" | "warning" | "neutral"> = {
  Invited: "success",
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
    [institutions]
  );

  const loadInstitutions = async () => {
    setIsLoading(true);
    setError("");
    try {
      setInstitutions(await listInstitutions());
    } catch (err) {
      setError(extractApiError(err, "Unable to load institutions."));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInstitutions();
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
      setLatestInviteLink(result.mockEmailLink);
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
      setLatestInviteLink(result.mockEmailLink);
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

  return (
    <PageContainer width="wide">
      <PageHeader
        eyebrow="Super Admin"
        title="Institutions"
        description="Invite institutions, resend onboarding emails, and manage account status."
      />

      <section className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        <Summary label="Total" value={counts.total} />
        <Summary label="Invited" value={counts.invited} />
        <Summary label="Active" value={counts.active} />
        <Summary label="Disabled" value={counts.disabled} />
      </section>

      {error ? <Alert variant="error">{error}</Alert> : null}
      {success ? (
        <Alert variant="success">
          <div className="space-y-1">
            <p>{success}</p>
            {latestInviteLink ? (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Link className="font-medium underline" href={latestInviteLink}>
                  Open invitation link
                </Link>
                <button
                  type="button"
                  onClick={copyInviteLink}
                  className="inline-flex items-center gap-1 rounded-md border border-[var(--adlts-border)] px-3 py-1 text-xs font-semibold text-[var(--adlts-success-700)]"
                >
                  <Copy size={12} /> Copy
                </button>
              </div>
            ) : null}
          </div>
        </Alert>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[380px,1fr]">
        <Card className="space-y-4">
          <CardHeader
            title="Invite Institution"
            description="Invite links are generated from the connected backend service."
          />
          <form onSubmit={handleInvite} className="space-y-4">
            <Input
              label="Institution Name"
              value={form.institutionName}
              onChange={(event) => setForm((current) => ({ ...current, institutionName: event.target.value }))}
              required
              placeholder="Abyssinia Driving School"
            />
            <Input
              label="Email Address"
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              required
              placeholder="admin@institution.et"
            />

            <Button type="submit" disabled={isSubmitting} className="w-full" state={isSubmitting ? { loading: true } : undefined}>
              Invite Institution
            </Button>
          </form>
        </Card>

        <Card className="overflow-hidden p-0">
          <CardHeader
            title="Institution Accounts"
            description="Status is synchronized from backend endpoints."
          />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-[var(--adlts-surface-soft)] text-xs uppercase tracking-wide text-[var(--adlts-ink-500)]">
                <tr>
                  <th className="px-6 py-4">Institution Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--adlts-divider)] bg-[var(--adlts-surface)]">
                {isLoading ? (
                  <tr>
                    <td className="px-6 py-8 text-[var(--adlts-ink-500)]" colSpan={4}>
                      Loading institutions...
                    </td>
                  </tr>
                ) : institutions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-[var(--adlts-ink-500)]">
                      <Building2 size={28} className="mx-auto mb-3 text-[var(--adlts-ink-400)]" />
                      No institutions have been invited yet.
                    </td>
                  </tr>
                ) : (
                  institutions.map((institution) => (
                    <tr key={institution.id} className="transition-colors hover:bg-[var(--adlts-surface-soft)]">
                      <td className="px-6 py-4 font-semibold text-[var(--adlts-ink-900)]">{institution.name}</td>
                      <td className="px-6 py-4 text-[var(--adlts-ink-600)]">{institution.email}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={institution.status} tone={statusStyles[institution.status] ?? "neutral"} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleResend(institution)}
                            disabled={institution.status === "Disabled"}
                            className="inline-flex items-center gap-1 rounded-md border border-[var(--adlts-border)] px-3 py-1.5 text-xs font-semibold text-[var(--adlts-ink-700)] hover:bg-[var(--adlts-surface-soft)] disabled:opacity-50"
                          >
                            <RefreshCcw size={12} />
                            Resend Invitation
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDisable(institution)}
                            disabled={institution.status === "Disabled"}
                            className="inline-flex items-center gap-1 rounded-md border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50"
                          >
                            <PowerOff size={12} />
                            Disable
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}

function Summary({ label, value }: { label: string; value: number }) {
  return (
    <Card padding="md" className="space-y-1">
      <p className={`${ui.statLabel} text-[var(--adlts-ink-500)]`}>{label}</p>
      <p className="text-2xl font-semibold text-[var(--adlts-ink-900)]">{value}</p>
      <p className="flex items-center gap-2 text-xs text-[var(--adlts-ink-500)]">
        <CheckCircle2 size={12} /> Updated
      </p>
    </Card>
  );
}
