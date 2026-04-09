"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function CandidateRegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(""); // clear error on new input
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Basic validation
    if (!formData.fullName || !formData.email || !formData.phone || !formData.password) {
      setError("ሁሉም መስኮች መሞላት አለባቸው / All fields are required");
      setIsLoading(false);
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("የይለፍ ቃሎች አይዛመዱም / Passwords do not match");
      setIsLoading(false);
      return;
    }
    if (formData.password.length < 6) {
      setError("የይለፍ ቃል ቢያንስ 6 ቁምፊዎች መሆን አለበት / Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    // Mock registration – replace with real API later
    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      // In a real app, you'd POST to /api/register
      // For now, just redirect to login page on "success"
      console.log("Registration attempt:", formData);
      router.push("/login?registered=true");
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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

        {/* Role tabs (only candidate for now) */}
        <div className="flex border-b border-[#E5E7EB] mb-6">
          <div className="flex-1 pb-3 text-center text-sm font-semibold text-[#1E3A8A] border-b-2 border-[#1E3A8A]">
            እጩዎች (Candidate)
          </div>
          <div className="flex-1 pb-3 text-center text-sm font-semibold text-[#6B7280]">
            አስተዳዳሪ (Admin)
          </div>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[#1F2937] mb-1">
              ሙሉ ስም / Full Name
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none transition bg-[#F9FAFB]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1F2937] mb-1">
              ኢሜይል / Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none transition bg-[#F9FAFB]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1F2937] mb-1">
              ስልክ ቁጥር / Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none transition bg-[#F9FAFB]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1F2937] mb-1">
              የይለፍ ቃል / Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
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

          <div>
            <label className="block text-sm font-semibold text-[#1F2937] mb-1">
              የይለፍ ቃል አረጋግጥ / Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none transition bg-[#F9FAFB]"
            />
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
            {isLoading ? "በምዝገባ ላይ..." : "ተመዝገብ"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#6B7280]">
          አካውንት አለህ?{" "}
          <button
            onClick={() => router.push("/login")}
            className="text-[#1E3A8A] font-semibold hover:underline"
          >
            ግባ (Login)
          </button>
        </p>
      </div>
    </div>
  );
}