"use client";

import React, { useEffect, useState } from "react";
import { Save, RefreshCw, CheckCircle, Globe, Palette, Bell } from "lucide-react";
import { useI18n } from "@/i18n/useI18n";
import { InstituteSettings, getInstituteSettings, updateInstituteSettings } from "@/services/settings.service";

export default function InstituteSettingsPage() {
  const { t } = useI18n();
  const [settings, setSettings] = useState<InstituteSettings | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getInstituteSettings().then((data) => {
      if (isMounted) {
        setSettings(data);
        setIsLoading(false);
      }
    });
    return () => { isMounted = false; };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    
    setSuccessMessage("");
    setIsSaving(true);
    
    try {
      const updated = await updateInstituteSettings(settings);
      setSettings(updated);
      setSuccessMessage("Settings saved successfully.");
      
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const updateNestedSetting = (key: keyof InstituteSettings['notifications'], value: boolean) => {
    setSettings((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        notifications: {
          ...prev.notifications,
          [key]: value
        }
      };
    });
  };

  if (isLoading || !settings) {
    return (
      <main className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-3xl p-8 border border-slate-100 animate-pulse">
          <div className="h-6 w-48 bg-slate-100 rounded mb-8" />
          <div className="space-y-4">
            <div className="h-12 bg-slate-100 rounded-xl" />
            <div className="h-12 bg-slate-100 rounded-xl" />
            <div className="h-24 bg-slate-100 rounded-xl" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-slate-800">{t("settings")}</h1>
        <p className="text-slate-500 text-sm">Manage your institution portal preferences and notifications.</p>
      </div>

      {successMessage && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl shadow-sm animate-in fade-in slide-in-from-top-4">
          <CheckCircle className="text-emerald-600 shrink-0" size={20} />
          <p className="text-sm font-semibold">{successMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Language Preference */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
            <Globe className="text-blue-900" size={22} />
            <h2 className="text-lg font-bold text-slate-800">{t("languagePreference")}</h2>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">{t("selectLanguage")}</label>
            <select
              value={settings.language}
              onChange={(e) => setSettings({ ...settings, language: e.target.value as "en" | "am" })}
              className="w-full sm:max-w-md px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-slate-50/50 text-slate-800 font-medium appearance-none"
            >
              <option value="en">English</option>
              <option value="am">አማርኛ (Amharic)</option>
            </select>
          </div>
        </div>

        {/* Theme Preference */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
            <Palette className="text-blue-900" size={22} />
            <h2 className="text-lg font-bold text-slate-800">{t("themePreference")}</h2>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-4">{t("selectTheme")}</label>
            <div className="flex flex-wrap gap-4">
              {["light", "dark", "system"].map((theme) => (
                <label key={theme} className="flex items-center gap-3 cursor-pointer p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition w-full sm:w-auto">
                  <input
                    type="radio"
                    name="theme"
                    value={theme}
                    checked={settings.theme === theme}
                    onChange={(e) => setSettings({ ...settings, theme: e.target.value as InstituteSettings["theme"] })}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300"
                  />
                  <span className="text-sm font-medium text-slate-700 capitalize">{theme}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
            <Bell className="text-blue-900" size={22} />
            <h2 className="text-lg font-bold text-slate-800">{t("notifications")}</h2>
          </div>
          <div className="space-y-4">
            <label className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg cursor-pointer transition">
              <input
                type="checkbox"
                checked={settings.notifications.bookingUpdates}
                onChange={(e) => updateNestedSetting('bookingUpdates', e.target.checked)}
                className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
              />
              <span className="text-sm font-medium text-slate-700">Booking Updates</span>
            </label>
            <label className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg cursor-pointer transition">
              <input
                type="checkbox"
                checked={settings.notifications.examResults}
                onChange={(e) => updateNestedSetting('examResults', e.target.checked)}
                className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
              />
              <span className="text-sm font-medium text-slate-700">Exam Results</span>
            </label>
            <label className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg cursor-pointer transition">
              <input
                type="checkbox"
                checked={settings.notifications.institutionMessages}
                onChange={(e) => updateNestedSetting('institutionMessages', e.target.checked)}
                className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
              />
              <span className="text-sm font-medium text-slate-700">Institution Messages</span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSaving}
            className="bg-blue-900 hover:bg-blue-800 text-white font-bold py-3 px-8 rounded-xl transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <RefreshCw className="animate-spin" size={18} />
                <span>{t("saving")}</span>
              </>
            ) : (
              <>
                <Save size={18} />
                <span>{t("saveSettings")}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </main>
  );
}
