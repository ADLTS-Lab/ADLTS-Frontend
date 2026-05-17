"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { login } from "@/services/auth.service";
import { useAuthStore } from "@/store/authStore";

type Role = "candidate" | "admin";

export default function UnifiedLoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("candidate");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const setUser = useAuthStore((s) => s.setUser);

  const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setIsLoading(true);

  try {
    const res = await login({ email, password });
    const payload = res?.data || res || {};
    const token = payload?.access_token || payload?.token || payload?.data?.access_token || payload?.data?.token;
    const user = payload?.user || payload?.data?.user || payload?.data?.user;
    const entity_type = payload?.entity_type || payload?.role || payload?.data?.entity_type || payload?.data?.role || user?.role || role;

    setUser(user, token, entity_type);

    // Redirect based on entity_type
    if (entity_type === "candidate") {
      router.push("/candidate/dashboard");
    } else if (entity_type === "admin") {
      router.push("/admin/devices");
    } else if (entity_type === "super_admin") {
      router.push("/super-admin/dashboard");
    } else {
      router.push("/");
    }
  } catch (err: any) {
    setError(err.response?.data?.message || 'Login failed');
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
          <h1 className="text-xl font-bold text-[#1F2937]">
            ወደ ስርዓቱ ግባ / Login to ADLTS
          </h1>
        </div>

        {/* Role Tabs */}
        <div className="flex border-b border-[#E5E7EB] mb-6">
          <button
            onClick={() => setRole("candidate")}
            className={`flex-1 pb-3 text-sm font-semibold transition-colors ${
              role === "candidate"
                ? "border-b-2 border-[#1E3A8A] text-[#1E3A8A]"
                : "text-[#6B7280]"
            }`}
          >
            እጩዎች (Candidate)
          </button>
          <button
            onClick={() => setRole("admin")}
            className={`flex-1 pb-3 text-sm font-semibold transition-colors ${
              role === "admin"
                ? "border-b-2 border-[#1E3A8A] text-[#1E3A8A]"
                : "text-[#6B7280]"
            }`}
          >
            አስተዳዳሪ (Admin)
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-[#1F2937] mb-1">
              Email / ኢሜይል
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={role === "candidate" ? "candidate@adlts.et" : "admin@adlts.gov.et"}
              className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none transition bg-[#F9FAFB]"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-semibold text-[#1F2937]">
                Password / የይለፍ ቃል
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
                className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none transition bg-[#F9FAFB]"
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
        </form>

        <p className="mt-6 text-center text-sm text-[#6B7280]">
          አዲስ አመልካች ነዎት?{" "}
          <a href="/candidate/register" className="text-[#1E3A8A] font-semibold hover:underline">
            መመዝገቢያ (Register)
          </a>
        </p>

        <p className="mt-4 text-center text-xs text-[#6B7280]">
          Demo candidate: candidate@adlts.et / password123<br />
          Demo admin: admin@adlts.gov.et / admin123
        </p>
        </div>
      </div>
    
  );
}