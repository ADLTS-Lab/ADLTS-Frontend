"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { login } from "@/services/auth.service";
import { useAuthStore } from "@/store/authStore";
import { useI18n } from "@/i18n/useI18n";
import { getHomeRouteForRole } from "@/config/routes";

export default function UnifiedLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const setUser = useAuthStore((s) => s.setUser);
  const { t } = useI18n();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await login({ email, password });
      const { access_token, refresh_token, entity_type, user } = res.data;

      setUser(user, access_token, entity_type, refresh_token);

      const nextRoute = getHomeRouteForRole(entity_type ?? user.role);
      router.push(nextRoute);
    } catch (err: unknown) {
      const responseMessage =
        typeof err === "object" && err !== null && "response" in err
          ? ((err as { response?: { data?: { message?: string } } }).response?.data?.message ?? "")
          : "";
      setError(responseMessage || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-[#E5E7EB] p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 bg-[#F5F7FA] rounded-full flex items-center justify-center mb-3">
            <span className="text-2xl">🚗</span>
          </div>
          <h1 className="text-xl font-bold text-[#1F2937]">{t("loginTitle")}</h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-[#1F2937] mb-1">{t("emailLabel")}</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none transition bg-[#F9FAFB] text-black"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-semibold text-[#1F2937]">{t("passwordLabel")}</label>
              <button
                type="button"
                onClick={() => router.push("/forgot-password")}
                className="text-xs text-[#3B82F6] hover:underline"
              >
                {t("forgotPassword")}
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none transition bg-[#F9FAFB] text-black"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1F2937]"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-[#DC2626] rounded-xl text-sm">{error}</div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#1E3A8A] text-white py-3.5 rounded-xl font-bold text-lg hover:bg-[#1E40AF] transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            {isLoading ? t("loginLoading") : t("loginButton")}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#6B7280]">
          <a href="/candidate/register" className="text-[#1E3A8A] font-semibold hover:underline">
            {t("registerPrompt")}
          </a>
        </p>
      </div>
    </div>
  );
}
