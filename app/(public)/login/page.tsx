"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LockKeyhole, Route, ShieldCheck, Users } from "lucide-react";
import { login } from "@/services/auth.service";
import { useAuthStore } from "@/store/authStore";
import { useI18n } from "@/i18n/useI18n";
import { getHomeRouteForRole } from "@/config/routes";
import { extractApiError } from "@/services/api-utils";
import { Alert, AuthCard, AuthForm, AuthLink, Button, Input, LabelRow, PublicCard } from "@/app/components/ui";

export default function UnifiedLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const setUser = useAuthStore((s) => s.setUser);
  const { t } = useI18n();

  const validateForm = () => {
    if (!email.trim() || !password.trim()) {
      return "Please enter both your email and password.";
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email.trim())) {
      return "Please enter a valid email address.";
    }

    return "";
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      const res = await login({ email, password });
      const { access_token, refresh_token, entity_type, user } = res.data;

      setUser(user, access_token, entity_type, refresh_token);

      const nextRoute = getHomeRouteForRole(entity_type ?? user.role);
      if (nextRoute === "/login") {
        setError("Login succeeded, but your account role is not recognized for portal routing. Contact support.");
        return;
      }

      router.push(nextRoute);
    } catch (err: unknown) {
      setError(extractApiError(err, "Login failed. Please check your email and password.", "auth-login"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="bg-[var(--bg)] px-6 py-20">
      <div className="mx-auto grid w-full max-w-container-public gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <AuthCard
          icon={<LockKeyhole size={20} />}
          title="Login to ADLTS"
          subtitle="Use the email and password connected to your ADLTS account. After login, you will be sent to the portal for your role."
          footer={<AuthLink href="/candidate/register">{t("registerPrompt")}</AuthLink>}
        >
          <form onSubmit={handleLogin}>
            <AuthForm>
              <Input
                label={t("emailLabel")}
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
              />

              <div>
                <LabelRow
                  label={t("passwordLabel")}
                  action={
                    <Link href="/forgot-password" className="text-xs font-medium text-[var(--accent)] hover:text-[var(--accent-hover)]">
                      {t("forgotPassword")}
                    </Link>
                  }
                />
                <Input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  autoComplete="current-password"
                  suffix={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="rounded-[6px] p-1.5 text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  }
                />
              </div>

              {error ? <Alert variant="error">{error}</Alert> : null}

              <Button type="submit" fullWidth disabled={isLoading} state={isLoading ? { loading: true } : undefined}>
                {isLoading ? t("loginLoading") : t("loginButton")}
              </Button>
            </AuthForm>
          </form>
        </AuthCard>

        <div className="grid gap-4">
          <PublicCard icon={Route} title="Role routing helper">
            Candidates, institutes, admins, experts, super admins, and transport authority users all use this login page. Your account role controls which portal opens after login.
          </PublicCard>
          <PublicCard icon={ShieldCheck} title="Security reminder">
            Keep your password private. ADLTS support will never ask for your password.
          </PublicCard>
          <PublicCard icon={Users} title="Help links">
            <div className="flex flex-wrap gap-3">
              <Link href="/forgot-password" className="text-[14px] font-medium text-[var(--accent)] hover:text-[var(--accent-hover)]">
                Reset your password
              </Link>
              <Link href="/candidate/register" className="text-[14px] font-medium text-[var(--accent)] hover:text-[var(--accent-hover)]">
                Create candidate account
              </Link>
              <Link href="/contact" className="text-[14px] font-medium text-[var(--accent)] hover:text-[var(--accent-hover)]">
                Contact ADLTS support
              </Link>
            </div>
          </PublicCard>
        </div>
      </div>
    </main>
  );
}
