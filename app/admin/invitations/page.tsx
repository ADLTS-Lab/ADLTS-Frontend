"use client";

import { useEffect, useMemo, useState } from "react";
import {
  createInvitation,
  deleteInvitation,
  listInvitationsSafe,
  resendInvitation,
  type InvitationEntityType,
  type InvitationRecord,
} from "@/services/invitations.service";
import { useI18n } from "@/i18n/useI18n";
import { extractApiError } from "@/services/api-utils";

const ENTITY_OPTIONS: InvitationEntityType[] = [
  "expert",
  "admin",
  "super_admin",
  "institute",
  "transport_authority",
];

export default function AdminInvitationsPage() {
  const { t } = useI18n();
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
    [invitations]
  );

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
      if (response.success && response.data?.id) {
        setInvitations((current) => [response.data, ...current]);
        setFormData({ email: "", first_name: "", last_name: "", entity_type: "expert" });
      } else if (response.message) {
        setError(response.message);
      }
    } catch (err) {
      setError(extractApiError(err, "Unable to send invitation."));
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

  return (
    <main className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">{t("adminPortal")}</p>
          <h1 className="text-2xl font-bold text-slate-900">{t("invitations_title")}</h1>
          <p className="text-sm text-slate-500 mt-1">{t("invitations_subtitle")}</p>
        </div>
        <div className="rounded-3xl bg-white border border-slate-100 shadow-sm px-4 py-3 text-sm text-slate-600">
          {pendingCount} pending · {invitations.length} total
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[380px,1fr]">
        <form onSubmit={handleCreate} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 md:p-6 space-y-4">
          <div>
            <h2 className="font-bold text-slate-900">{t("invitations_create_title")}</h2>
            <p className="text-sm text-slate-500 mt-1">Use the backend invitation endpoint to onboard staff accounts.</p>
          </div>

          <div className="space-y-3">
            <Field
              label={t("invitations_email")}
              value={formData.email}
              onChange={(value) => setFormData((current) => ({ ...current, email: value }))}
              type="email"
              required
            />
            <Field
              label={t("invitations_firstName")}
              value={formData.first_name}
              onChange={(value) => setFormData((current) => ({ ...current, first_name: value }))}
              required
            />
            <Field
              label={t("invitations_lastName")}
              value={formData.last_name}
              onChange={(value) => setFormData((current) => ({ ...current, last_name: value }))}
              required
            />
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-slate-700">{t("invitations_entityType")}</span>
              <select
                value={formData.entity_type}
                onChange={(event) => setFormData((current) => ({ ...current, entity_type: event.target.value as InvitationEntityType }))}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
              >
                {ENTITY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-blue-900 px-4 py-3 text-sm font-bold text-white hover:bg-blue-800 disabled:opacity-50"
          >
            {isSubmitting ? t("loadingCandidates") : t("invitations_send")}
          </button>
        </form>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 px-4 md:px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-900">Invitations</h2>
              <p className="text-sm text-slate-500">Resend or remove staff invitations from the backend.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-190 text-left">
              <thead className="bg-slate-50 text-xs uppercase tracking-widest text-slate-400">
                <tr>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td className="px-6 py-8 text-slate-500" colSpan={4}>{t("invitations_loading")}</td>
                  </tr>
                ) : invitations.length === 0 ? (
                  <tr>
                    <td className="px-6 py-8 text-slate-500" colSpan={4}>{t("invitations_empty")}</td>
                  </tr>
                ) : (
                  invitations.map((invitation) => (
                    <tr key={invitation.id} className="text-sm hover:bg-slate-50/70">
                      <td className="px-6 py-4 font-medium text-slate-900">{invitation.email}</td>
                      <td className="px-6 py-4 text-slate-600">{invitation.entity_type}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                          {invitation.status ?? "pending"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button onClick={() => handleResend(invitation.id)} className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50">
                            {t("invitations_resend")}
                          </button>
                          <button onClick={() => handleDelete(invitation.id)} className="rounded-full border border-rose-200 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-50">
                            {t("invitations_delete")}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-slate-700">{label}</span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
      />
    </label>
  );
}
