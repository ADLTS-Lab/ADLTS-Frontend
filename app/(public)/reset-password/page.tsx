"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, LockKeyhole, ShieldCheck } from "lucide-react";
import { resetPassword } from "@/services/password.service";
import { useI18n } from "@/i18n/useI18n";
import { extractApiError } from "@/services/api-utils";
import { Alert, AuthCard, AuthForm, Button, Input, PublicCard } from "@/app/components/ui";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    if (!token) {
      setError("This reset link is missing a valid token. Request a new password reset link.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!token) {
      setError("This reset link is missing a valid token. Request a new password reset link.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please enter the same password in both fields.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setIsLoading(true);

    try {
      const message = await resetPassword({
        token,
        password,
        confirm_password: confirmPassword,
      });

      setSuccess(message || "Your password has been updated. Redirecting you to login.");
      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        router.replace("/login");
      }, 1200);
    } catch (err: unknown) {
      setError(extractApiError(err, "Unable to reset password. Please try again."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="bg-[var(--bg)] px-6 py-20">
      <div className="mx-auto grid w-full max-w-container-public gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <AuthCard
          icon={<LockKeyhole size={20} />}
          title="Create a new password"
          subtitle="Choose a password with at least 8 characters. Use a password you do not use on shared or public systems."
        >
          <form onSubmit={handleSubmit}>
            <AuthForm>
              <Input
                label={t("newPasswordLabel")}
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                autoComplete="new-password"
                suffix={
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="rounded-[6px] p-1.5 text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
              />

              <Input
                label={t("confirmPasswordLabel")}
                type={showConfirmPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                autoComplete="new-password"
                suffix={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((value) => !value)}
                    className="rounded-[6px] p-1.5 text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
              />

              {error ? <Alert variant="error">{error}</Alert> : null}
              {success ? <Alert variant="success">{success}</Alert> : null}

              <Button type="submit" fullWidth disabled={isLoading || !token} state={isLoading ? { loading: true } : undefined}>
                {isLoading ? t("sendResetSending") : t("resetButton")}
              </Button>

              <p className="text-center text-sm text-[var(--text-secondary)]">
                {t("rememberPasswordPrompt")}{" "}
                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="font-medium text-[var(--accent)] hover:text-[var(--accent-hover)]"
                >
                  {t("backToLogin")}
                </button>
              </p>
            </AuthForm>
          </form>
        </AuthCard>

        <div className="grid gap-4">
          <PublicCard icon={ShieldCheck} title="Password guidance">
            Choose a password with at least 8 characters. Use a password you do not use on shared or public systems.
          </PublicCard>
          <PublicCard icon={LockKeyhole} title="Missing token error">
            This reset link is missing a valid token. Request a new password reset link.
          </PublicCard>
        </div>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="px-6 py-20 text-[14px] text-[var(--text-secondary)]">Loading latest data...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
