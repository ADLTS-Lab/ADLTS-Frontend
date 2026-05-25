"use client";

import { useEffect, useRef, useState } from "react";
import { User as UserIcon, Mail, Phone, MapPin, Award, CreditCard as CardIcon, Save, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { getCurrentUser, type User } from "@/services/auth.service";
import { updateMyCandidateProfile } from "@/services/candidates.service";
import { useI18n } from "@/i18n/useI18n";
import { extractApiError } from "@/services/api-utils";

export default function CandidateProfile() {
  const { user: storedUser, token: storedToken, role: storedRole, isAuthenticated, setUser } = useAuthStore();
  const [profile, setProfile] = useState<User | null>(storedUser);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const didInitRef = useRef(false);

  // Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  
  // UI feedback states
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const { t } = useI18n();

  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;

    let isMounted = true;

    const loadProfileOnce = async () => {
      if (storedUser) {
        setProfile(storedUser);
        setFirstName(storedUser.first_name || "");
        setLastName(storedUser.last_name || "");
        setPhone(storedUser.phone || "");
        setEmail(storedUser.email || "");
        setIsProfileLoading(false);
        return;
      }

      setIsProfileLoading(true);
      try {
        const currentUser = await getCurrentUser();
        if (!isMounted) return;

        if (currentUser) {
          setProfile(currentUser);
          setUser(currentUser);
          setFirstName(currentUser.first_name || "");
          setLastName(currentUser.last_name || "");
          setPhone(currentUser.phone || "");
          setEmail(currentUser.email || "");
        }
      } catch (err) {
        if (isMounted) {
          setErrorMessage(extractApiError(err, t("profileUpdateError")));
        }
      } finally {
        if (isMounted) {
          setIsProfileLoading(false);
        }
      }
    };

    loadProfileOnce();

    return () => {
      isMounted = false;
    };
  }, [storedUser, setUser]);

  // Sync state if storedUser updates from outside
  useEffect(() => {
    if (storedUser && !isSaving) {
      setProfile(storedUser);
      setFirstName(storedUser.first_name || "");
      setLastName(storedUser.last_name || "");
      setPhone(storedUser.phone || "");
      setEmail(storedUser.email || "");
    }
  }, [storedUser, isSaving]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");
    setIsSaving(true);

    try {
      const updated = await updateMyCandidateProfile({
        first_name: firstName,
        last_name: lastName,
        phone: phone,
      });

      if (updated) {
        const updatedUser: User = {
          id: updated.id,
          email: updated.email,
          role: 'candidate',
          first_name: updated.first_name,
          last_name: updated.last_name,
          phone: updated.phone,
          licenseCategory: updated.licenseCategory,
          testCenter: updated.testCenter,
        };
        setProfile(updatedUser);
        setUser(updatedUser, storedToken || undefined, storedRole || undefined);
        setSuccessMessage(t("profileUpdatedSuccess"));
        
        // Auto clear success message after 5 seconds
        setTimeout(() => {
          setSuccessMessage("");
        }, 5000);
      } else {
        setErrorMessage(t("profileUpdateError"));
      }
    } catch (err) {
      setErrorMessage(extractApiError(err, t("profileUpdateError")));
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (profile) {
      setFirstName(profile.first_name || "");
      setLastName(profile.last_name || "");
      setPhone(profile.phone || "");
      setSuccessMessage("");
      setErrorMessage("");
    }
  };

  if ((!isAuthenticated && typeof window === "undefined") || isProfileLoading) {
    return (
      <main className="space-y-6 md:space-y-8 max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 animate-pulse">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 bg-slate-100 rounded-full" />
            <div className="space-y-2">
              <div className="h-6 w-48 bg-slate-100 rounded" />
              <div className="h-4 w-32 bg-slate-100 rounded" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="h-10 bg-slate-100 rounded-xl" />
              <div className="h-10 bg-slate-100 rounded-xl" />
            </div>
            <div className="space-y-4">
              <div className="h-10 bg-slate-100 rounded-xl" />
              <div className="h-10 bg-slate-100 rounded-xl" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Initials for avatar
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "C";

  return (
    <main className="max-w-4xl mx-auto space-y-6 md:space-y-8">
      {/* Header Profile Section */}
      <div className="bg-linear-to-r from-blue-900 via-blue-800 to-indigo-900 rounded-3xl p-6 md:p-8 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
        <div className="absolute left-0 bottom-0 -translate-x-10 translate-y-10 w-40 h-40 bg-white/5 rounded-full blur-2xl" />

        <div className="flex flex-col sm:flex-row items-center gap-6 z-10 relative">
          <div className="w-24 h-24 rounded-full bg-white text-blue-900 flex items-center justify-center text-3xl font-black shadow-inner border-4 border-white/20">
            {initials}
          </div>
          <div className="text-center sm:text-left flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                {firstName} {lastName}
              </h1>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-full border border-emerald-500/30 w-fit mx-auto sm:mx-0">
                {t("status_active") === "active" ? "Active" : "ንቁ"}
              </span>
            </div>
            <p className="text-sm md:text-base text-blue-200/90 flex items-center justify-center sm:justify-start gap-2">
              <Mail size={16} />
              {email}
            </p>
          </div>
        </div>
      </div>

      {/* Alert Messages */}
      {successMessage && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl shadow-sm">
          <CheckCircle className="text-emerald-600 shrink-0" size={20} />
          <p className="text-sm font-semibold">{successMessage}</p>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl shadow-sm">
          <AlertCircle className="text-red-600 shrink-0" size={20} />
          <p className="text-sm font-semibold">{errorMessage}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Edit Form */}
        <div className="md:col-span-2 bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
            <UserIcon className="text-blue-900" size={22} />
            <h2 className="text-lg font-bold text-slate-800">{t("personalInfo")}</h2>
          </div>

          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">{t("firstNameLabel")}</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-slate-50/50 text-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">{t("lastNameLabel")}</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-slate-50/50 text-slate-800 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">{t("emailLabel")} ({t("yourStatus") === "Your status" ? "Read-Only" : "ለእይታ ብቻ"})</label>
              <div className="relative">
                <input
                  type="email"
                  disabled
                  value={email}
                  className="w-full px-4 py-3 pl-11 rounded-xl border border-slate-200 outline-none bg-slate-100 text-slate-500 font-medium cursor-not-allowed"
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">{t("phoneNumberLabel")}</label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 pl-11 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-slate-50/50 text-slate-800 font-medium"
                />
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={isSaving}
                className="bg-blue-900 hover:bg-blue-800 text-white font-bold py-3 px-6 rounded-xl transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="animate-spin" size={18} />
                    <span>{t("updatingProfile")}</span>
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    <span>{t("updateProfileButton")}</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleReset}
                disabled={isSaving}
                className="border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-3 px-6 rounded-xl transition disabled:opacity-50"
              >
                {t("yourStatus") === "Your status" ? "Reset" : "ዳግም አስጀምር"}
              </button>
            </div>
          </form>
        </div>

        {/* License & Exam Registration Details Info Column */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-6 border-b border-slate-50 pb-3">
              {t("yourStatus")}
            </h3>
            
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-900 shrink-0">
                  <Award size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                    {t("licenseCategoryLabel")}
                  </p>
                  <p className="text-sm font-extrabold text-slate-800">
                    {profile?.licenseCategory || "Category B"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-900 shrink-0">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                    {t("testCenterLabel")}
                  </p>
                  <p className="text-sm font-extrabold text-slate-800">
                    {profile?.testCenter || "Addis Ababa Center"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-900 shrink-0">
                  <CardIcon size={20} className="stroke-[1.5]" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                    {t("fayidaIdLabel")}
                  </p>
                  <p className="text-sm font-extrabold text-slate-800 font-mono">
                    {(profile as any)?.fayida_id || "ET-09247183-C"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400">{t("registrationStatusLabel")}</span>
              <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] rounded-md font-extrabold">
                {t("status_active") === "active" ? "Active" : "ንቁ"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
