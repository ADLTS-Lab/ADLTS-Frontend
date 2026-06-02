"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Building2, CheckCircle2, Copy, Mail, PowerOff, RefreshCcw } from "lucide-react";
import { Button } from "@/app/components/ui/Button";
import { Card } from "@/app/components/ui/Card";
import { Input } from "@/app/components/ui/Input";
import {
  disableInstitution,
  inviteInstitution,
  listInstitutions,
  resendInstitutionInvitation,
  type InstitutionAccount,
} from "@/services/institution-invitation.service";
import { extractApiError } from "@/services/api-utils";

const statusStyles: Record<InstitutionAccount["status"], string> = {
  Invited: "bg-amber-50 text-amber-700 border-amber-200",
  Active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Disabled: "bg-slate-100 text-slate-600 border-slate-200",
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
    <main className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Super Admin</p>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Institutions</h1>
          <p className="text-slate-500 mt-1">Invite institutions, resend onboarding emails, and manage account status.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <Summary label="Total" value={counts.total} />
          <Summary label="Invited" value={counts.invited} />
          <Summary label="Active" value={counts.active} />
          <Summary label="Disabled" value={counts.disabled} />
        </div>
      </div>

      {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
      {success && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 flex items-start gap-2">
          <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
          <div>
              <p>{success}</p>
              {latestInviteLink ? (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Link className="font-semibold underline" href={latestInviteLink}>
                  Open invitation link
                  </Link>
                  <button
                  type="button"
                  onClick={copyInviteLink}
                  className="inline-flex items-center gap-1 rounded-full border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700"
                >
                  <Copy size={12} /> Copy
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[380px,1fr]">
        <Card>
          <form onSubmit={handleInvite} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-blue-50 p-3 text-blue-900">
                <Mail size={22} />
              </div>
              <div>
                <h2 className="font-bold text-slate-900">Invite Institution</h2>
                <p className="text-sm text-slate-500">Invite links are generated from the connected backend service.</p>
              </div>
            </div>

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

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Sending..." : "Invite Institution"}
            </Button>
          </form>
        </Card>

        <Card className="overflow-hidden p-0">
          <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-900">Institution Accounts</h2>
              <p className="text-sm text-slate-500">Status is synchronized from backend endpoints.</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-widest text-slate-400">
                <tr>
                  <th className="px-6 py-4">Institution Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td className="px-6 py-8 text-slate-500" colSpan={4}>Loading institutions...</td>
                  </tr>
                ) : institutions.length === 0 ? (
                  <tr>
                    <td className="px-6 py-12 text-center text-slate-500" colSpan={4}>
                      <Building2 size={28} className="mx-auto mb-3 text-slate-300" />
                      No institutions have been invited yet.
                    </td>
                  </tr>
                ) : (
                  institutions.map((institution) => (
                    <tr key={institution.id} className="hover:bg-slate-50/70">
                      <td className="px-6 py-4 font-semibold text-slate-900">{institution.name}</td>
                      <td className="px-6 py-4 text-slate-600">{institution.email}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${statusStyles[institution.status]}`}>
                          {institution.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleResend(institution)}
                            disabled={institution.status === "Disabled"}
                            className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                          >
                            <RefreshCcw size={12} /> Resend Invitation
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDisable(institution)}
                            disabled={institution.status === "Disabled"}
                            className="inline-flex items-center gap-1 rounded-full border border-rose-200 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-50 disabled:opacity-50"
                          >
                            <PowerOff size={12} /> Disable
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
    </main>
  );
}

function Summary({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
      <div className="text-xs text-slate-400">{label}</div>
      <div className="text-xl font-bold text-slate-900">{value}</div>
    </div>
  );
}
