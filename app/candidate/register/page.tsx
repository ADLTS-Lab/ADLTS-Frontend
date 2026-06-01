"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { registerCandidate } from "@/services/auth.service";
import { useAuthStore } from "@/store/authStore";
import { extractApiError } from "@/services/api-utils";
import { Alert, AuthCard, AuthForm, AuthLink, Button, Input, Select } from "@/app/components/ui";

export default function CandidateRegisterPage() {
  const router = useRouter();
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

  const validateForm = () => {
    if (!formData.first_name.trim() || !formData.last_name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.password.trim()) {
      return "Please fill in all required fields before continuing.";
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(formData.email.trim())) {
      return "Please enter a valid email address.";
    }

    if (formData.password !== formData.confirmPassword) {
      return "Passwords do not match.";
    }

    if (formData.password.length < 8) {
      return "Password must be at least 8 characters long.";
    }

    return "";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      const res = await registerCandidate({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        fayida_id: formData.fayida_id || undefined,
        birth_date: formData.birth_date || undefined,
        gender: (formData.gender as "male" | "female" | "other") || undefined,
      });

      const token = res?.data?.access_token || res?.access_token || res?.data?.token || res?.token;
      const refreshToken = res?.data?.refresh_token || res?.refresh_token;
      const user = res?.data?.user || res?.user;
      if (token && user) {
        setUser(user, token, user.role, refreshToken);
        router.push("/candidate/dashboard");
        return;
      }

      router.push("/login?registered=true");
    } catch (err: unknown) {
      setError(extractApiError(err, "Registration failed. Please try again.", "auth-register"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard
      icon={<span className="text-xl leading-none">📝</span>}
      title="አዲስ መጠየቂያ ይፍጠሩ / Create an Account"
      footer={
        <>
          አካውንት አለህ? <AuthLink href="/login">ግባ / Login</AuthLink>
        </>
      }
    >
      <form onSubmit={handleRegister}>
        <AuthForm>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="ስም / First name"
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              required
            />
            <Input
              label="አያት / Last name"
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              required
            />
          </div>

          <Input
            label="ኢሜይል / Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <Input
            label="ስልክ ቁጥር / Phone"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />

          <Input
            label="የይለፍ ቃል / Password"
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
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

          <Input
            label="የይለፍ ቃል አረጋግጥ / Confirm password"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />

          <details className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <summary className="cursor-pointer font-medium text-slate-700">
              ተጨማሪ መረጃ (አማራጭ) / Additional info (optional)
            </summary>
            <div className="mt-4 space-y-4">
              <Input
                label="ፋይዳ መታወቂያ / Fayda ID"
                type="text"
                name="fayida_id"
                value={formData.fayida_id}
                onChange={handleChange}
              />
              <Input
                label="የትውልድ ቀን / Birth date"
                type="date"
                name="birth_date"
                value={formData.birth_date}
                onChange={handleChange}
              />
              <Select label="ጾታ / Gender" name="gender" value={formData.gender} onChange={handleChange}>
                <option value="">ምረጥ / Select</option>
                <option value="male">ወንድ / Male</option>
                <option value="female">ሴት / Female</option>
                <option value="other">ሌላ / Other</option>
              </Select>
            </div>
          </details>

          {error ? <Alert variant="error">{error}</Alert> : null}

          <Button type="submit" fullWidth disabled={isLoading}>
            {isLoading ? "በምዝገባ ላይ..." : "ተመዝገብ / Register"}
          </Button>
        </AuthForm>
      </form>
    </AuthCard>
  );
}
