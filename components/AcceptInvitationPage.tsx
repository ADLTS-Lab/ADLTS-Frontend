"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { Alert, Button, Card, CardHeader, Input, Select } from "@/app/components/ui";
import { extractApiError } from "@/services/api-utils";
import { acceptInvitation } from "@/services/invitations.service";

type InvitationKind = "expert" | "institute";
type InvitationForm = {
  invitationKind: InvitationKind;
  firstName: string;
  middleName: string;
  lastName: string;
  institutionName: string;
  phone: string;
  employeeId: string;
  fayidaId: string;
  password: string;
  confirmPassword: string;
};
type InvitationFieldErrors = Partial<Record<keyof InvitationForm, string>>;

const emptyInvitationForm: InvitationForm = {
  invitationKind: "expert",
  firstName: "",
  middleName: "",
  lastName: "",
  institutionName: "",
  phone: "",
  employeeId: "",
  fayidaId: "",
  password: "",
  confirmPassword: "",
};

export function AcceptInvitationPage() {
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
  const [error, setError] = useState(token ? "" : "Invitation token is missing. Ask the sender to resend the invitation.");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState<InvitationFieldErrors>({});
  const [form, setForm] = useState<InvitationForm>(emptyInvitationForm);

  const validateForm = () => {
    const nextErrors: InvitationFieldErrors = {};

    if (!token) {
      nextErrors.password = "Use a valid invitation link before setting a password.";
    }

    if (form.invitationKind === "expert") {
      if (!form.firstName.trim()) nextErrors.firstName = "Enter your first name.";
      if (!form.lastName.trim()) nextErrors.lastName = "Enter your last name.";
      if (!form.fayidaId.trim()) nextErrors.fayidaId = "Enter your Fayida ID.";
      if (!form.employeeId.trim()) nextErrors.employeeId = "Enter your employee ID.";
    } else if (!form.institutionName.trim()) {
      nextErrors.institutionName = "Enter the institution name.";
    }

    if (!form.password) {
      nextErrors.password = "Create a password.";
    } else if (form.password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters long.";
    }

    if (!form.confirmPassword) {
      nextErrors.confirmPassword = "Confirm your password.";
    } else if (form.password !== form.confirmPassword) {
      nextErrors.confirmPassword = "Passwords must match.";
    }

    return nextErrors;
  };

  const updateForm = (nextForm: InvitationForm) => {
    setForm(nextForm);
    setFieldErrors({});
    setError(token ? "" : "Invitation token is missing. Ask the sender to resend the invitation.");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    const validationErrors = validateForm();
    setFieldErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      setError("Please fix the highlighted fields and try again.");
      setIsSubmitting(false);
      return;
    }

    try {
      await acceptInvitation({
        token,
        password: form.password,
        first_name: form.firstName.trim(),
        middle_name: form.middleName.trim(),
        last_name: form.lastName.trim(),
        name: form.institutionName.trim(),
        phone: form.phone.trim(),
        employee_id: form.employeeId.trim(),
        fayida_id: form.fayidaId.trim(),
      });
      setSuccess("Invitation accepted. Continue to login.");
      setIsActivated(true);
      setForm((current) => ({ ...current, password: "", confirmPassword: "" }));
    } catch (err) {
      setError(extractApiError(err, "Unable to accept invitation."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AcceptInvitationShell
      error={error}
      form={form}
      isActivated={isActivated}
      isLoading={false}
      isSubmitting={isSubmitting}
      success={success}
      fieldErrors={fieldErrors}
      token={token}
      onFormChange={updateForm}
      onSubmit={handleSubmit}
    />
  );
}

function AcceptInvitationShell({
  error = "",
  form,
  isActivated = false,
  isLoading = false,
  isSubmitting = false,
  success = "",
  fieldErrors = {},
  token = "",
  onFormChange,
  onSubmit,
}: {
  error?: string;
  form?: InvitationForm;
  isActivated?: boolean;
  isLoading?: boolean;
  isSubmitting?: boolean;
  success?: string;
  fieldErrors?: InvitationFieldErrors;
  token?: string;
  onFormChange?: (value: NonNullable<typeof form>) => void;
  onSubmit?: (event: React.FormEvent) => void;
}) {
  const currentForm = form ?? emptyInvitationForm;
  const isExpert = currentForm.invitationKind === "expert";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-4 py-10">
      <Card className="w-full max-w-[640px]">
        <div className="mb-6 flex items-start gap-3">
          <div className="rounded-[8px] bg-[var(--accent-subtle)] p-3 text-[var(--accent)]">
            <ShieldCheck size={24} />
          </div>
          <div className="min-w-0 flex-1">
            <CardHeader
              title="Accept invitation"
              description="Set your password and complete the profile details required by your invitation type."
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
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <Alert variant="info">
              The backend validates the token and determines the actual account type. Choose the type shown in your invitation email so the correct profile fields are submitted.
            </Alert>

            <Select
              label="Invitation type"
              value={currentForm.invitationKind}
              onChange={(event) => onFormChange?.({ ...currentForm, invitationKind: event.target.value as InvitationKind })}
              disabled={!token || isActivated}
            >
              <option value="expert">Expert</option>
              <option value="institute">Institution</option>
            </Select>

            {isExpert ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="First name"
                  value={currentForm.firstName}
                  onChange={(event) => onFormChange?.({ ...currentForm, firstName: event.target.value })}
                  required
                  error={fieldErrors.firstName}
                  disabled={!token || isActivated}
                />
                <Input
                  label="Last name"
                  value={currentForm.lastName}
                  onChange={(event) => onFormChange?.({ ...currentForm, lastName: event.target.value })}
                  required
                  error={fieldErrors.lastName}
                  disabled={!token || isActivated}
                />
                <Input
                  label="Middle name"
                  value={currentForm.middleName}
                  onChange={(event) => onFormChange?.({ ...currentForm, middleName: event.target.value })}
                  disabled={!token || isActivated}
                />
                <Input
                  label="Employee ID"
                  value={currentForm.employeeId}
                  onChange={(event) => onFormChange?.({ ...currentForm, employeeId: event.target.value })}
                  required
                  error={fieldErrors.employeeId}
                  disabled={!token || isActivated}
                />
              </div>
            ) : (
              <Input
                label="Institution name"
                value={currentForm.institutionName}
                onChange={(event) => onFormChange?.({ ...currentForm, institutionName: event.target.value })}
                required
                error={fieldErrors.institutionName}
                disabled={!token || isActivated}
              />
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Phone"
                value={currentForm.phone}
                onChange={(event) => onFormChange?.({ ...currentForm, phone: event.target.value })}
                disabled={!token || isActivated}
              />
              <Input
                label="Fayida ID"
                value={currentForm.fayidaId}
                onChange={(event) => onFormChange?.({ ...currentForm, fayidaId: event.target.value })}
                required={isExpert}
                error={fieldErrors.fayidaId}
                disabled={!token || isActivated || !isExpert}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Password"
                type="password"
                value={currentForm.password}
                onChange={(event) => onFormChange?.({ ...currentForm, password: event.target.value })}
                minLength={8}
                required
                hint="Use at least 8 characters."
                error={fieldErrors.password}
                disabled={!token || isActivated}
              />
              <Input
                label="Confirm password"
                type="password"
                value={currentForm.confirmPassword}
                onChange={(event) => onFormChange?.({ ...currentForm, confirmPassword: event.target.value })}
                minLength={8}
                required
                error={fieldErrors.confirmPassword}
                disabled={!token || isActivated}
              />
            </div>

            {error ? <Alert variant="error">{error}</Alert> : null}
            {success ? (
              <Alert variant="success">
                <CheckCircle2 size={18} />
                {success}
              </Alert>
            ) : null}

            <Button type="submit" disabled={!token || isActivated || isSubmitting} fullWidth state={isSubmitting ? { loading: true } : undefined}>
              {isActivated ? "Invitation accepted" : isSubmitting ? "Accepting..." : "Accept invitation"}
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
