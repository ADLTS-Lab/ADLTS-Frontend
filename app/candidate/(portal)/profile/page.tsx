"use client";

import { useEffect, useRef, useState } from "react";
import { User as UserIcon, Mail, Phone, MapPin, Award, CreditCard as CardIcon, Save, RefreshCw, CheckCircle, AlertCircle, Lock } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { getCurrentUser, changePassword, type User } from "@/services/auth.service";
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
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("");
  const [address, setAddress] = useState("");
  
  // Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");
  
  // UI feedback states
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const { t, lang } = useI18n();

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
        setBirthDate(storedUser.birth_date || "");
        setGender(storedUser.gender || "");
        setAddress(storedUser.address || "");
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
          setBirthDate(currentUser.birth_date || "");
          setGender(currentUser.gender || "");
          setAddress(currentUser.address || "");
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
      setBirthDate(storedUser.birth_date || "");
      setGender(storedUser.gender || "");
      setAddress(storedUser.address || "");
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
        birth_date: birthDate,
        gender: gender,
        address: address,
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
          birth_date: updated.birth_date,
          gender: updated.gender,
          address: updated.address,
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

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess("");
    setPasswordError("");

    if (newPassword !== confirmPassword) {
      setPasswordError(t("passwordMismatch"));
      return;
    }

    setIsChangingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPasswordSuccess(t("passwordChangedSuccessfully"));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(""), 5000);
    } catch (err) {
      setPasswordError(extractApiError(err, "Unable to change password."));
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleReset = () => {
    if (profile) {
      setFirstName(profile.first_name || "");
      setLastName(profile.last_name || "");
      setPhone(profile.phone || "");
      setBirthDate(profile.birth_date || "");
      setGender(profile.gender || "");
      setAddress(profile.address || "");
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
                {lang === "en" ? "Active" : "ንቁ"}
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

        {/* Profile Edit Form */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
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
              <label className="block text-sm font-bold text-slate-700 mb-2">{t("emailLabel")} ({t("readOnly")})</label>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">{t("dateOfBirthLabel")}</label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-slate-50/50 text-slate-800 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">{t("genderLabel")}</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-slate-50/50 text-slate-800 font-medium appearance-none"
                >
                  <option value="">{t("selectGender")}</option>
                  <option value="male">{t("male")}</option>
                  <option value="female">{t("female")}</option>
                  <option value="other">{t("other")}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">{t("addressLabel")}</label>
                <div className="relative">
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-4 py-3 pl-11 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-slate-50/50 text-slate-800 font-medium"
                  />
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                </div>
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
                {t("reset")}
              </button>
            </div>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
            <Lock className="text-blue-900" size={22} />
            <h2 className="text-lg font-bold text-slate-800">{t("changePassword")}</h2>
          </div>

          {passwordSuccess && (
            <div className="flex items-center gap-3 p-4 mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl shadow-sm">
              <CheckCircle className="text-emerald-600 shrink-0" size={20} />
              <p className="text-sm font-semibold">{passwordSuccess}</p>
            </div>
          )}

          {passwordError && (
            <div className="flex items-center gap-3 p-4 mb-6 bg-red-50 border border-red-200 text-red-800 rounded-2xl shadow-sm">
              <AlertCircle className="text-red-600 shrink-0" size={20} />
              <p className="text-sm font-semibold">{passwordError}</p>
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">{t("currentPassword")}</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-slate-50/50 text-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">{t("newPassword")}</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-slate-50/50 text-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">{t("confirmPassword")}</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-slate-50/50 text-slate-800 font-medium"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
                className="bg-blue-900 hover:bg-blue-800 text-white font-bold py-3 px-6 rounded-xl transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isChangingPassword ? (
                  <>
                    <RefreshCw className="animate-spin" size={18} />
                    <span>{t("updating")}</span>
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    <span>{t("updatePassword")}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
    </main>
  );
}
