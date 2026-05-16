"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 650));
      setSuccessMessage("Check your email for reset link");
      setEmail("");
    } catch {
      setError("Unable to send reset link. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-[#E5E7EB] p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 bg-[#F5F7FA] rounded-full flex items-center justify-center mb-3">
            <Mail className="text-[#1E3A8A]" size={22} />
          </div>
          <h1 className="text-xl font-bold text-[#1F2937]">
            Forgot password / የይለፍ ቃል ረሳኸው?
          </h1>
          <p className="mt-2 text-sm text-[#6B7280]">
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>

        {successMessage ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center">
            <CheckCircle2 className="mx-auto mb-3 text-emerald-600" size={32} />
            <p className="text-sm font-semibold text-emerald-900">{successMessage}</p>
            <p className="mt-2 text-sm text-emerald-800">
              If your email exists in our system, you should receive a reset link shortly.
            </p>
            <Link
              href="/login"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#1E3A8A] hover:underline"
            >
              <ArrowLeft size={16} />
              Back to login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-[#1F2937] mb-1">
                Email / ኢሜይል
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="candidate@adlts.et"
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
              {isLoading ? "Sending..." : "Send reset link"}
            </button>

            <p className="text-center text-sm text-[#6B7280]">
              Remembered your password?{" "}
              <Link href="/login" className="text-[#1E3A8A] font-semibold hover:underline">
                Back to login
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}