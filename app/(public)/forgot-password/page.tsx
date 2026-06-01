"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Mail } from "lucide-react";
import { useI18n } from "@/i18n/useI18n";
import { requestPasswordReset } from "@/services/password.service";
import { extractApiError } from "@/services/api-utils";
import { Alert, AuthCard, AuthForm, Button, Input } from "@/app/components/ui";

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
      setSuccessMessage(message);
      setEmail("");
    } catch (err: unknown) {
      setError(extractApiError(err, "Unable to send reset link. Please try again."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard icon={<Mail size={20} />} title={t("forgotPassword")} subtitle={t("forgotSubtitle")}>
      {successMessage ? (
        <div className="space-y-5 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50">
            <CheckCircle2 className="text-emerald-600" size={24} />
          </div>
          <Alert variant="success">{successMessage}</Alert>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm font-medium text-blue-900 hover:text-blue-800"
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

            <Button type="submit" fullWidth disabled={isLoading}>
              {isLoading ? t("sendResetSending") : t("sendResetLink")}
            </Button>

            <p className="text-center text-sm text-slate-600">
              {t("rememberPasswordPrompt")}{" "}
              <Link href="/login" className="font-medium text-blue-900 hover:text-blue-800">
                {t("backToLogin")}
              </Link>
            </p>
          </AuthForm>
        </form>
      )}
    </AuthCard>
  );
}
