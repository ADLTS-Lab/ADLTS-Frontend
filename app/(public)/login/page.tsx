"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { login } from "@/services/auth.service";
import { useAuthStore } from "@/store/authStore";
import { useI18n } from "@/i18n/useI18n";
import { getHomeRouteForRole } from "@/config/routes";
import { extractApiError } from "@/services/api-utils";
import { Alert, AuthCard, AuthForm, AuthLink, Button, Input, LabelRow } from "@/app/components/ui";

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
      if (nextRoute === '/login') {
        setError('Login succeeded, but your account role is not recognized for portal routing. Contact support.');
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
    <AuthCard
      icon={<span className="text-xl leading-none">🚗</span>}
      title={t("loginTitle")}
      footer={
        <>
          <AuthLink href="/candidate/register">{t("registerPrompt")}</AuthLink>
        </>
      }
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
                <Link href="/forgot-password" className="text-xs font-medium text-blue-900 hover:text-blue-800">
                  {t("forgotPassword")}
                </Link>
              }
            />
            <Input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              suffix={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
            />
          </div>

          {error ? <Alert variant="error">{error}</Alert> : null}

          <Button type="submit" fullWidth disabled={isLoading}>
            {isLoading ? t("loginLoading") : t("loginButton")}
          </Button>
        </AuthForm>
      </form>
    </AuthCard>
  );
}
