"use client";

import { FormEvent, useEffect, useState } from "react";
import { RefreshCw, CheckCircle, Globe, Palette, Bell, Save } from "lucide-react";
import { useI18n } from "@/i18n/useI18n";
import { getAppSettings, updateAppSettings, type CandidateSettings } from "@/services/settings.service";

type ThemeOption = CandidateSettings["theme"];
type NotificationKey = keyof CandidateSettings["notifications"];

export function SettingsBoard() {
  const { t } = useI18n();
  const [settings, setSettings] = useState<CandidateSettings | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let mounted = true;
    getAppSettings().then((data) => {
      if (mounted) {
        setSettings(data);
        setIsLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!settings) return;

    setSuccessMessage("");
    setIsSaving(true);

    try {
      const updated = await updateAppSettings(settings);
      setSettings(updated);
      setSuccessMessage(t("settingsSaved") || "Settings saved successfully.");
      setTimeout(() => setSuccessMessage(""), 3500);
    } finally {
      setIsSaving(false);
    }
  };

  const updateNotification = (key: NotificationKey, value: boolean) => {
    setSettings((current) => {
      if (!current) return current;
      return {
        ...current,
        notifications: {
          ...current.notifications,
          [key]: value,
        },
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
        <h1 className="text-2xl font-bold text-slate-800">{t("settings") || "Settings"}</h1>
        <p className="text-slate-500 text-sm">
          {t("settingsDescription") || "Manage your appearance, language, and notification preferences."}
        </p>
      </div>

      {successMessage && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl shadow-sm">
          <CheckCircle className="text-emerald-600 shrink-0" size={20} />
          <p className="text-sm font-semibold">{successMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
            <Globe className="text-blue-900" size={22} />
            <h2 className="text-lg font-bold text-slate-800">{t("languagePreference") || "Language Preference"}</h2>
          </div>
          <label className="block text-sm font-bold text-slate-700 mb-2">
            {t("selectLanguage") || "Select Language"}
          </label>
          <select
            value={settings.language}
            onChange={(event) =>
              setSettings((current) =>
                current ? { ...current, language: event.target.value as CandidateSettings["language"] } : current
              )
            }
            className="w-full sm:max-w-md px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-slate-50/50 text-slate-800 font-medium appearance-none"
          >
            <option value="en">English</option>
            <option value="am">አማርኛ (Amharic)</option>
          </select>
        </section>

        <section className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
            <Palette className="text-blue-900" size={22} />
            <h2 className="text-lg font-bold text-slate-800">{t("themePreference") || "Theme Preference"}</h2>
          </div>
          <label className="block text-sm font-bold text-slate-700 mb-4">{t("selectTheme") || "Select Interface Theme"}</label>
          <div className="flex flex-wrap gap-4">
            {(["light", "dark", "system"] as ThemeOption[]).map((themeOption) => (
              <label
                key={themeOption}
                className="flex items-center gap-3 cursor-pointer p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition w-full sm:w-auto"
              >
                <input
                  type="radio"
                  name="theme"
                  value={themeOption}
                  checked={settings.theme === themeOption}
                  onChange={(event) =>
                    setSettings((current) =>
                      current
                        ? {
                            ...current,
                            theme: event.target.value as CandidateSettings["theme"],
                          }
                        : current
                    )
                  }
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <span className="text-sm font-medium text-slate-700 capitalize">
                  {themeOption === "light"
                    ? t("themeLight")
                    : themeOption === "dark"
                    ? t("themeDark")
                    : t("themeSystem")}
                </span>
              </label>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
            <Bell className="text-blue-900" size={22} />
            <h2 className="text-lg font-bold text-slate-800">{t("notifications") || "Notification Preferences"}</h2>
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg cursor-pointer transition">
              <input
                type="checkbox"
                checked={settings.notifications.bookingUpdates}
                onChange={(event) => updateNotification("bookingUpdates", event.target.checked)}
                className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
              />
              <span className="text-sm font-medium text-slate-700">{t("bookingUpdates") || "Booking updates"}</span>
            </label>
            <label className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg cursor-pointer transition">
              <input
                type="checkbox"
                checked={settings.notifications.examUpdates}
                onChange={(event) => updateNotification("examUpdates", event.target.checked)}
                className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
              />
              <span className="text-sm font-medium text-slate-700">{t("examUpdates") || "Exam updates"}</span>
            </label>
            <label className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg cursor-pointer transition">
              <input
                type="checkbox"
                checked={settings.notifications.resultNotifications}
                onChange={(event) =>
                  updateNotification("resultNotifications", event.target.checked)
                }
                className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
              />
              <span className="text-sm font-medium text-slate-700">{t("resultNotifications") || "Result notifications"}</span>
            </label>
            <label className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg cursor-pointer transition">
              <input
                type="checkbox"
                checked={settings.notifications.licensePickupNotifications}
                onChange={(event) =>
                  updateNotification("licensePickupNotifications", event.target.checked)
                }
                className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
              />
              <span className="text-sm font-medium text-slate-700">
                {t("licensePickupNotifications") || "License pickup notifications"}
              </span>
            </label>
          </div>
        </section>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSaving}
            className="bg-blue-900 hover:bg-blue-800 text-white font-bold py-3 px-8 rounded-xl transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <RefreshCw className="animate-spin" size={18} />
                <span>{t("saving") || "Saving..."}</span>
              </>
            ) : (
              <>
                <Save size={18} />
                <span>{t("saveSettings") || "Save Settings"}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </main>
  );
}
