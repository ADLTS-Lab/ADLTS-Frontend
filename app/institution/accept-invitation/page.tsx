"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { Alert, Button, Card, CardHeader, Input, StatusBadge } from "@/app/components/ui";
import {
  acceptInstitutionInvitation,
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
  const [isActivated, setIsActivated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(token ? "" : "Invitation token is missing. Ask the sender to resend the institution invitation.");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const details: InstitutionInvitationDetails | null = token
    ? {
        token,
        institutionName: "",
        email: "",
        status: isActivated ? "Active" : "Invited",
        acceptedAt: isActivated ? new Date().toISOString() : null,
      }
    : null;

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
      setSuccess(result.message ?? "Institution account activated. Continue to login.");
      setIsActivated(true);
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
      isLoading={false}
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
    <main className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-4 py-10">
      <Card className="w-full max-w-[560px]">
        <div className="mb-6 flex items-start gap-3">
          <div className="rounded-[8px] bg-[var(--accent-subtle)] p-3 text-[var(--accent)]">
            <ShieldCheck size={24} />
          </div>
          <div className="min-w-0 flex-1">
            <CardHeader
              title="Accept institution invitation"
              description="Set a password to activate the institution account."
              action={details ? <StatusBadge status={details.status} /> : undefined}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <div className="h-12 animate-pulse rounded-[8px] bg-[var(--surface-2)]" />
            <div className="h-12 animate-pulse rounded-[8px] bg-[var(--surface-2)]" />
            <div className="h-12 animate-pulse rounded-[8px] bg-[var(--surface-2)]" />
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            {details?.institutionName ? (
              <Input label="Institution name" value={details.institutionName} readOnly disabled />
            ) : null}
            {details?.email ? (
              <Input label="Email" value={details.email} readOnly disabled />
            ) : null}
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
              label="Confirm password"
              type="password"
              value={form.confirmPassword}
              onChange={(event) => onFormChange?.({ ...form, confirmPassword: event.target.value })}
              minLength={8}
              required
              disabled={!details || details.status === "Active"}
            />

            {error ? <Alert variant="error">{error}</Alert> : null}
            {success ? (
              <Alert variant="success">
                <CheckCircle2 size={18} />
                {success}
              </Alert>
            ) : null}

            <Button type="submit" disabled={!details || details.status === "Active" || isSubmitting} fullWidth state={isSubmitting ? { loading: true } : undefined}>
              {details?.status === "Active" ? "Account activated" : isSubmitting ? "Activating..." : "Activate account"}
            </Button>

            {success ? (
              <Link href="/login" className="block text-center text-[14px] font-semibold text-[var(--accent)] transition-colors hover:text-[var(--accent-hover)]">
                Continue to login
              </Link>
            ) : null}
          </form>
        )}
      </Card>
    </main>
  );
}
