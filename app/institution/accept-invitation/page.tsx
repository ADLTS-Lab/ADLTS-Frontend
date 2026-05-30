"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { Button } from "@/app/components/ui/Button";
import { Card } from "@/app/components/ui/Card";
import { Input } from "@/app/components/ui/Input";
import {
  acceptInstitutionInvitation,
  getInstitutionInvitationByToken,
  type InstitutionInvitationDetails,
} from "@/services/institution-invitation.service";
import { extractApiError } from "@/services/api-utils";

export default function AcceptInvitationPage() {
  return (
    <Suspense fallback={<AcceptInvitationShell isLoading />}>
      <AcceptInvitationContent />
    </Suspense>
  );
}

function AcceptInvitationContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [details, setDetails] = useState<InstitutionInvitationDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({ password: "", confirmPassword: "" });

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    setError("");

    if (!token) {
      setIsLoading(false);
      setError("Invitation token is missing.");
      return;
    }

    getInstitutionInvitationByToken(token)
      .then((result) => {
        if (!mounted) return;
        setDetails(result);
        if (!result) setError("Invitation link is invalid or expired.");
      })
      .catch((err) => {
        if (mounted) setError(extractApiError(err, "Unable to load invitation."));
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [token]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const result = await acceptInstitutionInvitation({
        token,
        password: form.password,
        confirmPassword: form.confirmPassword,
      });
      setSuccess(result.message ?? "Institution account activated.");
      setDetails((current) => current ? { ...current, status: "Active", acceptedAt: new Date().toISOString() } : current);
      setForm({ password: "", confirmPassword: "" });
    } catch (err) {
      setError(extractApiError(err, "Unable to accept invitation."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AcceptInvitationShell
      details={details}
      error={error}
      form={form}
      isLoading={isLoading}
      isSubmitting={isSubmitting}
      success={success}
      onFormChange={setForm}
      onSubmit={handleSubmit}
    />
  );
}

function AcceptInvitationShell({
  details = null,
  error = "",
  form = { password: "", confirmPassword: "" },
  isLoading = false,
  isSubmitting = false,
  success = "",
  onFormChange,
  onSubmit,
}: {
  details?: InstitutionInvitationDetails | null;
  error?: string;
  form?: { password: string; confirmPassword: string };
  isLoading?: boolean;
  isSubmitting?: boolean;
  success?: string;
  onFormChange?: (value: { password: string; confirmPassword: string }) => void;
  onSubmit?: (event: React.FormEvent) => void;
}) {
  return (
    <main className="min-h-screen bg-[#F8FAFC] px-4 py-10 flex items-center justify-center">
      <Card className="w-full max-w-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="rounded-2xl bg-blue-50 p-3 text-blue-900">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Accept Institution Invitation</h1>
            <p className="text-sm text-slate-500">Set a password to activate the institution account.</p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <div className="h-12 rounded-xl bg-slate-100 animate-pulse" />
            <div className="h-12 rounded-xl bg-slate-100 animate-pulse" />
            <div className="h-12 rounded-xl bg-slate-100 animate-pulse" />
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <Input label="Institution Name" value={details?.institutionName ?? ""} readOnly className="bg-slate-100" />
            <Input label="Email" value={details?.email ?? ""} readOnly className="bg-slate-100" />
            <Input
              label="Password"
              type="password"
              value={form.password}
              onChange={(event) => onFormChange?.({ ...form, password: event.target.value })}
              minLength={8}
              required
              disabled={!details || details.status === "Active"}
            />
            <Input
              label="Confirm Password"
              type="password"
              value={form.confirmPassword}
              onChange={(event) => onFormChange?.({ ...form, confirmPassword: event.target.value })}
              minLength={8}
              required
              disabled={!details || details.status === "Active"}
            />

            {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
            {success && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 flex items-center gap-2">
                <CheckCircle2 size={18} /> {success}
              </div>
            )}

            <Button type="submit" disabled={!details || details.status === "Active" || isSubmitting} className="w-full">
              {details?.status === "Active" ? "Account Activated" : isSubmitting ? "Activating..." : "Activate Account"}
            </Button>

            {success ? (
              <Link href="/login" className="block text-center text-sm font-semibold text-blue-900 hover:underline">
                Continue to login
              </Link>
            ) : null}
          </form>
        )}
      </Card>
    </main>
  );
}
