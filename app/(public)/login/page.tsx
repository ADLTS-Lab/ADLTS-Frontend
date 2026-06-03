"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { login } from "@/services/auth.service";
import { useAuthStore } from "@/store/authStore";
import { useI18n } from "@/i18n/useI18n";
import { getHomeRouteForRole, type AppRole } from "@/config/routes";
import { extractApiError } from "@/services/api-utils";
import { Alert, AuthCard, AuthForm, AuthLink, Button, Input, LabelRow } from "@/app/components/ui";

const isDevelopment = process.env.NODE_ENV === "development";

const devUsers: Array<{
  label: string;
  role: AppRole;
  user: {
    id: string;
    email: string;
    role: AppRole;
    first_name?: string;
    last_name?: string;
    name?: string;
    institutionId?: string;
    institutionName?: string;
  };
}> = [
  {
    label: "Continue as Candidate (Dev)",
    role: "candidate",
    user: {
      id: "dev-candidate-1",
      email: "candidate.dev@adlts.local",
      role: "candidate",
      first_name: "Dev",
      last_name: "Candidate",
      name: "Dev Candidate",
    },
  },
  {
    label: "Continue as Institution (Dev)",
    role: "institute",
    user: {
      id: "dev-institute-1",
      email: "institution.dev@adlts.local",
      role: "institute",
      name: "Dev Driving Institution",
      institutionId: "dev-institute-1",
      institutionName: "Dev Driving Institution",
    },
  },
  {
    label: "Continue as Expert (Dev)",
    role: "expert",
    user: {
      id: "dev-expert-1",
      email: "expert.dev@adlts.local",
      role: "expert",
      first_name: "Dev",
      last_name: "Expert",
      name: "Dev Expert",
    },
  },
  {
    label: "Continue as Transport Authority (Dev)",
    role: "transport_authority",
    user: {
      id: "dev-transport-authority-1",
      email: "authority.dev@adlts.local",
      role: "transport_authority",
      name: "Dev Transport Authority",
    },
  },
  {
    label: "Continue as Super Admin (Dev)",
    role: "super_admin",
    user: {
      id: "dev-super-admin-1",
      email: "superadmin.dev@adlts.local",
      role: "super_admin",
      name: "Dev Super Admin",
    },
  },
];

export default function UnifiedLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const setUser = useAuthStore((s) => s.setUser);
  const { t } = useI18n();

  // DEV ONLY AUTH BYPASS - REMOVE BEFORE PRODUCTION
  const handleDevLogin = (role: AppRole) => {
    const devAccount = devUsers.find((account) => account.role === role);
    if (!devAccount) return;

    const token = `dev-token-${role}`;
    setUser(devAccount.user, token, role, `dev-refresh-token-${role}`);
    router.push(getHomeRouteForRole(role));
  };

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
      <AuthCard
        icon={<LockKeyhole size={20} />}
        title="Login to ADLTS"
        subtitle="Use the email and password connected to your ADLTS account."
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

              {isDevelopment ? (
                <div className="border-t border-[var(--border)] pt-4">
                  <p className="mb-3 text-center text-[12px] font-semibold uppercase tracking-normal text-[var(--text-secondary)]">
                    DEV ONLY AUTH BYPASS - REMOVE BEFORE PRODUCTION
                  </p>
                  <div className="grid gap-2">
                    {devUsers.map((account) => (
                      <Button
                        key={account.role}
                        type="button"
                        variant="secondary"
                        fullWidth
                        onClick={() => handleDevLogin(account.role)}
                      >
                        {account.label}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : null}
            </AuthForm>
          </form>
      </AuthCard>
    </main>
  );
}
