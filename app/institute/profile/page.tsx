"use client";

import React, { useEffect, useState } from "react";
import { User as UserIcon, Mail, Phone, MapPin, Save, RefreshCw, CheckCircle, AlertCircle, Building, Lock, FileText } from "lucide-react";
import { useI18n } from "@/i18n/useI18n";
import { changePassword } from "@/services/auth.service";
import { getInstituteProfile, updateInstituteProfile, type InstituteProfile } from "@/services/institute.service";

export default function InstituteProfilePage() {
  const { t } = useI18n();
  const [profile, setProfile] = useState<InstituteProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [institutionName, setInstitutionName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [institutionId, setInstitutionId] = useState("");

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

  useEffect(() => {
    let isMounted = true;
    
    getInstituteProfile().then((res) => {
      if (!isMounted) return;
      if (res.success && res.data) {
        setProfile(res.data);
        setInstitutionName(res.data.institutionName);
        setContactPerson(res.data.contactPerson);
        setPhone(res.data.phone);
        setAddress(res.data.address);
        setDescription(res.data.description);
        setEmail(res.data.email);
        setInstitutionId(res.data.institutionId);
      }
      setIsLoading(false);
    }).catch(() => {
      if (isMounted) setIsLoading(false);
    });

    return () => { isMounted = false; };
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");
    setIsSaving(true);

    try {
      const res = await updateInstituteProfile({
        institutionName,
        contactPerson,
        phone,
        address,
        description,
      });

      if (res.success && res.data) {
        setProfile(res.data);
        setSuccessMessage("Profile updated successfully.");
        setTimeout(() => setSuccessMessage(""), 5000);
      } else {
        setErrorMessage("Failed to update profile.");
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess("");
    setPasswordError("");

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setIsChangingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPasswordSuccess("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(""), 5000);
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : "Unable to change password.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <main className="max-w-4xl mx-auto space-y-6">
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

  const initials = institutionName.substring(0, 2).toUpperCase() || "IN";

  return (
    <main className="max-w-4xl mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-500">
      {/* Header Profile Section */}
      <div className="bg-linear-to-r from-blue-900 via-blue-800 to-indigo-900 rounded-3xl p-6 md:p-8 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
        <div className="absolute left-0 bottom-0 -translate-x-10 translate-y-10 w-40 h-40 bg-white/5 rounded-full blur-2xl" />

        <div className="flex flex-col sm:flex-row items-center gap-6 z-10 relative">
          <div className="w-24 h-24 rounded-full bg-white text-blue-900 flex items-center justify-center text-3xl font-black shadow-inner border-4 border-white/20 shrink-0">
            {initials}
          </div>
          <div className="text-center sm:text-left flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                {institutionName}
              </h1>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-full border border-emerald-500/30 w-fit mx-auto sm:mx-0">
                {t("active")}
              </span>
            </div>
            <p className="text-sm md:text-base text-blue-200/90 flex items-center justify-center sm:justify-start gap-2 mb-1">
              <Mail size={16} />
              {email}
            </p>
            <p className="text-sm text-blue-200/90 flex items-center justify-center sm:justify-start gap-2">
              <Building size={16} />
              ID: {institutionId}
            </p>
          </div>
        </div>
      </div>

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
        <form onSubmit={handleUpdate} className="space-y-8">
          
          {/* Personal Information */}
          <section>
            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
              <Building className="text-blue-900" size={22} />
              <h2 className="text-lg font-bold text-slate-800">{t("personalInfo")}</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Institution Name</label>
                <input
                  type="text"
                  required
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-slate-50/50 text-slate-800 font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Contact Person</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="w-full px-4 py-3 pl-11 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-slate-50/50 text-slate-800 font-medium"
                  />
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-slate-50/50 text-slate-800 font-medium resize-none"
              />
            </div>
          </section>

          {/* Contact Information */}
          <section>
            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4 mt-8">
              <Phone className="text-blue-900" size={22} />
              <h2 className="text-lg font-bold text-slate-800">Contact Information</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Phone Number</label>
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
                <label className="block text-sm font-bold text-slate-700 mb-2">Email Address (Read-Only)</label>
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
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Address</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-4 py-3 pl-11 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-slate-50/50 text-slate-800 font-medium"
                  />
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Institution ID (Read-Only)</label>
                <div className="relative">
                  <input
                    type="text"
                    disabled
                    value={institutionId}
                    className="w-full px-4 py-3 pl-11 rounded-xl border border-slate-200 outline-none bg-slate-100 text-slate-500 font-medium cursor-not-allowed"
                  />
                  <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                </div>
              </div>
            </div>
          </section>

          <div className="flex gap-4 pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={isSaving}
              className="bg-blue-900 hover:bg-blue-800 text-white font-bold py-3 px-6 rounded-xl transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="animate-spin" size={18} />
                  <span>{t("saving")}</span>
                </>
              ) : (
                <>
                  <Save size={18} />
                  <span>{t("updateProfileButton")}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Security Section */}
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
                  <span>Updating...</span>
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
