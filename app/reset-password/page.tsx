"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import api from "@/lib/api";
import { useI18n } from "@/i18n/useI18n";

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
      setError("Reset token is missing from the link.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!token) {
      setError("Reset token is missing from the link.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match / የይለፍ ቃሎች አይዛመዱም");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters / የይለፍ ቃል ቢያንስ 8 ቁምፊዎች መሆን አለበት");
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post("/auth/password/reset", {
        token,
        password,
        confirm_password: confirmPassword,
      });

      setSuccess(
        response.data?.message || "Password reset successfully. Redirecting to login..."
      );
      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        router.replace("/login");
      }, 1200);
    } catch (err: any) {
      const message = err.response?.data?.message ?? "";
      setError(
        message || "Unable to reset password. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-[#E5E7EB] p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 bg-[#F5F7FA] rounded-full flex items-center justify-center mb-3">
            <ShieldCheck className="text-[#1E3A8A]" size={22} />
          </div>
          <h1 className="text-xl font-bold text-[#1F2937]">{t('resetTitle')}</h1>
          <p className="mt-2 text-sm text-[#6B7280]">{t('resetSubtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-[#1F2937] mb-1">{t('newPasswordLabel')}</label>
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
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1F2937]"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1F2937] mb-1">{t('confirmPasswordLabel')}</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none transition bg-[#F9FAFB] text-black"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((value) => !value)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1F2937]"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-[#DC2626] rounded-xl text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl text-sm">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !token}
            className="w-full bg-[#1E3A8A] text-white py-3.5 rounded-xl font-bold text-lg hover:bg-[#1E40AF] transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            {isLoading ? t('sendResetSending') : t('resetButton')}
          </button>

          <p className="text-center text-sm text-[#6B7280]">
            {t('rememberPasswordPrompt')} {" "}
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="text-[#1E3A8A] font-semibold hover:underline"
            >
              {t('backToLogin')}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
