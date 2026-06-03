"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Mail, ShieldCheck } from "lucide-react";
import { useI18n } from "@/i18n/useI18n";
import { requestPasswordReset } from "@/services/password.service";
import { extractApiError } from "@/services/api-utils";
import { Alert, AuthCard, AuthForm, Button, Input, PublicCard } from "@/app/components/ui";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const { t } = useI18n();

  const validateEmail = () => {
    if (!email.trim()) {
      return "Please enter the email address tied to your account.";
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email.trim())) {
      return "Please enter a valid email address.";
    }

    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    const validationError = validateEmail();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      const message = await requestPasswordReset(email);
      setSuccessMessage(message || "Password reset instructions have been sent. Check your email and follow the link before it expires.");
      setEmail("");
    } catch (err: unknown) {
      setError(extractApiError(err, "Unable to send reset link. Please try again."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="bg-[var(--bg)] px-6 py-20">
      <div className="mx-auto grid w-full max-w-container-public gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <AuthCard
          icon={<Mail size={20} />}
          title="Reset your ADLTS password"
          subtitle="Enter the email connected to your account. If the address is recognized, ADLTS will send reset instructions."
        >
          {successMessage ? (
            <div className="space-y-5 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[8px] border border-[var(--success)] bg-[var(--success-subtle)]">
                <CheckCircle2 className="text-[var(--success)]" size={24} />
              </div>
              <Alert variant="success">{successMessage}</Alert>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm font-medium text-[var(--accent)] hover:text-[var(--accent-hover)]"
              >
                <ArrowLeft size={16} />
                {t("backToLogin")}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <AuthForm>
                <Input
                  label={t("emailLabel")}
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="candidate@adlts.et"
                  autoComplete="email"
                />

                {error ? <Alert variant="error">{error}</Alert> : null}

                <Button type="submit" fullWidth disabled={isLoading} state={isLoading ? { loading: true } : undefined}>
                  {isLoading ? t("sendResetSending") : t("sendResetLink")}
                </Button>

                <p className="text-center text-sm text-[var(--text-secondary)]">
                  {t("rememberPasswordPrompt")}{" "}
                  <Link href="/login" className="font-medium text-[var(--accent)] hover:text-[var(--accent-hover)]">
                    {t("backToLogin")}
                  </Link>
                </p>
              </AuthForm>
            </form>
          )}
        </AuthCard>

        <div className="grid gap-4">
          <PublicCard icon={ShieldCheck} title="Support fallback">
            If you no longer have access to your email, contact support with your name, role, and institution if applicable.
          </PublicCard>
          <PublicCard icon={Mail} title="Success message">
            Password reset instructions have been sent. Check your email and follow the link before it expires.
          </PublicCard>
        </div>
      </div>
    </main>
  );
}
