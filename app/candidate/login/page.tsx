"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useI18n } from '@/i18n/useI18n';
import { login } from "@/services/auth.service";
import { useAuthStore } from "@/store/authStore";

export default function CandidateLoginPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    router.replace("/login");
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await login({ email, password });
      const { access_token, entity_type, user } = res.data;
      setUser(user, access_token, entity_type);
      router.push(
        entity_type === "admin"
          ? "/admin/devices"
          : entity_type === "super_admin"
            ? "/super-admin/dashboard"
            : "/candidate/dashboard"
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed. Check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-[#E5E7EB] p-6 sm:p-8">
          <div className="text-center mb-6">
            <div className="mx-auto w-12 h-12 bg-[#F5F7FA] rounded-full flex items-center justify-center mb-3">
              <span className="text-2xl">🚗</span>
            </div>
            <h1 className="text-xl font-bold text-[#1F2937]">
              ወደ ስርዓቱ ግባ / Login to ADLTS
            </h1>
          </div>

          {/* Role tabs (only candidate for now, but kept for consistency) */}
          <div className="flex border-b border-[#E5E7EB] mb-6">
            <div className="flex-1 pb-3 text-center text-sm font-semibold text-[#1E3A8A] border-b-2 border-[#1E3A8A]">
              እጩዎች (Candidate)
            </div>
            <div className="flex-1 pb-3 text-center text-sm font-semibold text-[#6B7280]">
              አስተዳዳሪ (Admin)
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-[#1F2937] mb-1">
                Email / Phone (ኢሜይል ወይም ስልክ)
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-3 text-black rounded-xl border border-[#E5E7EB] focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none transition bg-[#F9FAFB]"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-sm font-semibold text-[#1F2937]">
                  Password (የይለፍ ቃል)
                </label>
                <button
                  type="button"
                  onClick={() => router.push("/forgot-password")}
                  className="text-xs text-[#3B82F6] hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4  text-black py-3 rounded-xl border border-[#E5E7EB] focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none transition bg-[#F9FAFB]"
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
              <div className="p-3 bg-red-50 text-[#DC2626] rounded-xl text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#1E3A8A] text-white py-3.5 rounded-xl font-bold text-lg hover:bg-[#1E40AF] transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {isLoading ? "በመግባት ላይ..." : "ግባ"}
            </button>

            <div className="relative flex items-center">
              <div className="grow border-t border-[#E5E7EB]"></div>
              <span className="mx-4 text-xs text-[#6B7280] uppercase">{t('or')}</span>
              <div className="grow border-t border-[#E5E7EB]"></div>
            </div>

            <button
              type="button"
              className="w-full border-2 border-[#E5E7EB] text-[#1E3A8A] py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#F5F7FA] transition"
            >
              <span className="text-xl">🧬</span>
              በፋይዳ አይዲ ግባ
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#6B7280]">
            አዲስ አመልካች ነዎት?{" "}
            <a href="/candidate/register" className="text-[#1E3A8A] font-semibold hover:underline">
              መመዝገቢያ (Register)
            </a>
          </p>
      </div>
    </div>
  );
}