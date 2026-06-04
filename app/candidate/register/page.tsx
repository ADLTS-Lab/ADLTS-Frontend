"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, MailCheck, UserPlus } from "lucide-react";
import { registerCandidate, verifyOtp } from "@/services/auth.service";
import { useAuthStore } from "@/store/authStore";
import { extractApiError } from "@/services/api-utils";
import { Alert, AuthCard, AuthForm, AuthLink, Button, Input, Select } from "@/app/components/ui";
import { getHomeRouteForRole } from "@/config/routes";

export default function CandidateRegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
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
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const setUser = useAuthStore((s) => s.setUser);

  const splitFullName = () => {
    const nameParts = formData.fullName.trim().split(/\s+/).filter(Boolean);
    return {
      nameParts,
      firstName: nameParts[0] ?? "",
      lastName: nameParts.slice(1).join(" "),
    };
  };

  const validateForm = () => {
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.password.trim()) {
      return "Please fill in all required fields before continuing.";
    }

    const { nameParts } = splitFullName();
    if (nameParts.length < 2) {
      return "Enter your full name with at least first and last name.";
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

    if (!formData.fayida_id.trim() || !formData.birth_date || !formData.gender) {
      return "Please complete the required identity details before continuing.";
    }

    if (formData.gender === "other") {
      return "Please select male or female. The backend currently accepts only those values.";
    }

    return "";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      const { firstName, lastName } = splitFullName();
      const res = await registerCandidate({
        first_name: firstName,
        last_name: lastName,
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
        router.push(getHomeRouteForRole(user.role));
        return;
      }

      const dataMessage = (res?.data as { message?: string } | undefined)?.message;
      setPendingEmail(formData.email.trim());
      setSuccess(dataMessage || res?.message || "Registration submitted. Enter the one-time code sent to your email to finish account setup.");
    } catch (err: unknown) {
      setError(extractApiError(err, "Registration failed. Please try again.", "auth-register"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!pendingEmail || !otpCode.trim()) {
      setError("Enter the OTP sent to your email.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await verifyOtp({ email: pendingEmail, code: otpCode.trim() });
      const { access_token, refresh_token, entity_type, user } = res.data;
      setUser(user, access_token, entity_type, refresh_token);
      router.push(getHomeRouteForRole(entity_type ?? user.role));
    } catch (err: unknown) {
      setError(extractApiError(err, "Unable to verify OTP. Please try again.", "auth-session"));
    } finally {
      setIsLoading(false);
    }
  };

  if (pendingEmail) {
    return (
      <main className="bg-[var(--bg)] px-6 py-20">
        <AuthCard
          icon={<MailCheck size={20} />}
          title="Verify your email"
          subtitle="Enter the one-time code sent to your email to finish account setup."
          footer={
            <>
              Wrong email?{" "}
              <button
                type="button"
                className="font-semibold text-[var(--accent)] hover:text-[var(--accent-hover)]"
                onClick={() => {
                  setPendingEmail("");
                  setOtpCode("");
                  setError("");
                  setSuccess("");
                }}
              >
                Edit registration
              </button>
            </>
          }
        >
            <form onSubmit={handleVerifyOtp}>
              <AuthForm>
                <Input label="Email" type="email" value={pendingEmail} readOnly className="bg-[var(--surface-2)]" />
                <Input
                  label="OTP code"
                  type="text"
                  value={otpCode}
                  onChange={(event) => {
                    setOtpCode(event.target.value);
                    setError("");
                  }}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  required
                />

                {success ? <Alert variant="success">{success}</Alert> : null}
                {error ? <Alert variant="error">{error}</Alert> : null}

                <Button type="submit" fullWidth disabled={isLoading} state={isLoading ? { loading: true } : undefined}>
                  {isLoading ? "Verifying..." : "Verify OTP"}
                </Button>
              </AuthForm>
            </form>
        </AuthCard>
      </main>
    );
  }

  return (
    <main className="bg-[var(--bg)] px-6 py-20">
      <AuthCard
        icon={<UserPlus size={20} />}
        title="Create your candidate account"
        subtitle="Register once, verify your account, and use the candidate portal to submit booking requests, track payment, and view exam results."
        footer={
          <>
            Already have an account? <AuthLink href="/login">Login</AuthLink>
          </>
        }
      >
          <form onSubmit={handleRegister}>
            <AuthForm>
              <Input
                label="Full name"
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Example: Abebe Kebede"
                autoComplete="name"
                required
              />

              <Input
                label="Email address"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />

              <Input
                label="Phone number"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />

              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
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

              <Input
                label="Confirmed password"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />

              <details open className="rounded-[8px] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm text-[var(--text-secondary)]">
                <summary className="cursor-pointer font-medium text-[var(--text-primary)]">
                  Required identity details
                </summary>
                <div className="mt-4 space-y-4">
                  <Input
                    label="Fayda ID"
                    type="text"
                    name="fayida_id"
                    value={formData.fayida_id}
                    onChange={handleChange}
                    required
                  />
                  <Input
                    label="Birth date"
                    type="date"
                    name="birth_date"
                    value={formData.birth_date}
                    onChange={handleChange}
                    required
                  />
                  <Select label="Gender" name="gender" value={formData.gender} onChange={handleChange} required>
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </Select>
                </div>
              </details>

              {error ? <Alert variant="error">{error}</Alert> : null}
              {success ? <Alert variant="success">{success}</Alert> : null}

              <Button type="submit" fullWidth disabled={isLoading} state={isLoading ? { loading: true } : undefined}>
                {isLoading ? "Registering..." : "Create candidate account"}
              </Button>
            </AuthForm>
          </form>
      </AuthCard>
    </main>
  );
}
