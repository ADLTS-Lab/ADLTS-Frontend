"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { registerCandidate } from "@/services/auth.service";
import { useAuthStore } from "@/store/authStore";

export default function CandidateRegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    fayida_id: "",
    birth_date: "",
    gender: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const setUser = useAuthStore((s) => s.setUser);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
    if (e.target.name === "email") setEmail(e.target.value);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Validation
    if (!formData.first_name || !formData.last_name || !formData.email || !formData.phone || !formData.password) {
      setError("ሁሉም አስፈላጊ መስኮች መሞላት አለባቸው / All required fields must be filled");
      setIsLoading(false);
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("የይለፍ ቃሎች አይዛመዱም / Passwords do not match");
      setIsLoading(false);
      return;
    }
    if (formData.password.length < 8) {
      setError("የይለፍ ቃል ቢያንስ 8 ቁምፊዎች መሆን አለበት / Password must be at least 8 characters");
      setIsLoading(false);
      return;
    }

    try {
      // Call register API (mock or real)
      const res = await registerCandidate({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        fayida_id: formData.fayida_id || undefined,
        birth_date: formData.birth_date || undefined,
        gender: formData.gender as any || undefined,
      });

      // If backend returned a token, auto-login and redirect to dashboard
      const token = res?.data?.access_token || res?.access_token || res?.data?.token || res?.token;
      const refreshToken = res?.data?.refresh_token || res?.refresh_token;
      const user = res?.data?.user || res?.user;
      if (token && user) {
        setUser(user, token, user.role, refreshToken);
        router.push("/candidate/dashboard");
        return;
      }

      router.push("/login?registered=true");
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 1: Registration form
  return (
    <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-[#E5E7EB] p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 bg-[#F5F7FA] rounded-full flex items-center justify-center mb-3">
            <span className="text-2xl">📝</span>
          </div>
          <h1 className="text-xl font-bold text-[#1F2937]">
            አዲስ መጠየቂያ ይፍጠሩ / Create an Account
          </h1>
        </div>

        <form onSubmit={handleRegister} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-[#1F2937] mb-1">ስም / First name</label>
              <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} required className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] text-black" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#1F2937] mb-1">አያት / Last name</label>
              <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} required className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] text-black" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1F2937] mb-1">ኢሜይል / Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] text-black" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1F2937] mb-1">ስልክ ቁጥር / Phone</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] text-black" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1F2937] mb-1">የይለፍ ቃል / Password</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} required className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] text-black" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280]">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1F2937] mb-1">የይለፍ ቃል አረጋግጥ / Confirm password</label>
            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] text-black" />
          </div>

          <details className="text-xs text-[#6B7280]">
            <summary>ተጨማሪ መረጃ (አማራጭ) / Additional info (optional)</summary>
            <div className="mt-2 space-y-3">
              <div>
                <label className="block text-xs font-semibold">ፋይዳ መታወቂያ / Fayda ID</label>
                <input type="text" name="fayida_id" value={formData.fayida_id} onChange={handleChange} className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] text-black" />
              </div>
              <div>
                <label className="block text-xs font-semibold">የትውልድ ቀን / Birth date</label>
                <input type="date" name="birth_date" value={formData.birth_date} onChange={handleChange} className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] text-black" />
              </div>
              <div>
                <label className="block text-xs font-semibold">ጾታ / Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] text-black">
                  <option value="">ምረጥ / Select</option>
                  <option value="male">ወንድ / Male</option>
                  <option value="female">ሴት / Female</option>
                  <option value="other">ሌላ / Other</option>
                </select>
              </div>
            </div>
          </details>

          {error && <div className="p-2 bg-red-50 text-[#DC2626] rounded-xl text-sm">{error}</div>}

          <button type="submit" disabled={isLoading} className="w-full bg-[#1E3A8A] text-white py-3 rounded-xl font-bold hover:bg-[#1E40AF] transition disabled:opacity-50">
            {isLoading ? "በምዝገባ ላይ..." : "ተመዝገብ / Register"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#6B7280]">
          አካውንት አለህ?{" "}
          <button onClick={() => router.push("/login")} className="text-[#1E3A8A] font-semibold hover:underline">
            ግባ / Login
          </button>
        </p>
        </div>
      </div>
    
  );
}