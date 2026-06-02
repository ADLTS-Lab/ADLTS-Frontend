"use client";

import { type FormEvent, useState, useEffect } from "react";
import { CheckCircle, Globe, RefreshCw } from "lucide-react";
import { useI18n } from "@/i18n/useI18n";
import { getAppSettings, updateAppSettings, type CandidateSettings } from "@/services/settings.service";
import {
  Alert,
  Button,
  Card,
  CardContent,
  CardHeader,
  Input,
  PageContainer,
  PageHeader,
  Select,
  ui,
} from "@/app/components/ui";

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
      <PageContainer width="wide">
        <Card padding="lg" className="animate-pulse space-y-5">
          <div className="h-5 w-24 bg-[var(--adlts-surface-soft)] rounded" />
          <div className="h-11 w-full bg-[var(--adlts-surface-soft)] rounded-md" />
          <div className="h-11 w-full bg-[var(--adlts-surface-soft)] rounded-md" />
          <div className="h-24 w-full bg-[var(--adlts-surface-soft)] rounded-md" />
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer width="wide" className="space-y-6">
      <PageHeader
        eyebrow={t("settings") || "Settings"}
        title={t("settings") || "Settings"}
        description={t("settingsDescription") || "Manage language and notification preferences."}
      />

      {successMessage && (
        <Alert variant="success">
          <div className="flex items-center gap-3">
            <CheckCircle className="shrink-0 text-[var(--adlts-success-700)]" size={18} />
            <p className="text-sm font-semibold">{successMessage}</p>
          </div>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader
            title={t("languagePreference") || "Language Preference"}
            description={t("selectLanguage") || "Select your preferred interface language."}
            action={<Globe className="h-5 w-5 text-[var(--adlts-blue-700)]" />}
          />

          <CardContent>
            <Select
              value={settings.language}
              onChange={(event) =>
                setSettings((current) =>
                  current ? { ...current, language: event.target.value as CandidateSettings["language"] } : current
                )
              }
            >
              <option value="en">English</option>
              <option value="am">አማርኛ (Amharic)</option>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            title={t("notifications") || "Notification Preferences"}
            description={
              t("notificationSettingsDescription") ||
              "Choose the account alerts you want to receive from this portal."
            }
            action={<Globe className="h-5 w-5 text-[var(--adlts-blue-700)]" />}
          />

          <CardContent>
            <fieldset className="space-y-3">
              <legend className="sr-only">{t("notificationSettingsDescription") || "Notification settings"}</legend>
              <label className="flex items-center justify-between gap-3 rounded-md border border-[var(--adlts-border)] bg-[var(--adlts-surface)] p-3 transition hover:bg-[var(--adlts-surface-soft)]">
                <span className={ui.statLabel}>{t("bookingUpdates") || "Booking updates"}</span>
                <input
                  type="checkbox"
                  checked={settings.notifications.bookingUpdates}
                  onChange={(event) => updateNotification("bookingUpdates", event.target.checked)}
                  className="h-4 w-4 rounded border border-[var(--adlts-border)] text-[var(--adlts-blue-600)] focus:ring-2 focus:ring-[var(--adlts-focus-ring)]"
                />
              </label>
              <label className="flex items-center justify-between gap-3 rounded-md border border-[var(--adlts-border)] bg-[var(--adlts-surface)] p-3 transition hover:bg-[var(--adlts-surface-soft)]">
                <span className={ui.statLabel}>{t("examUpdates") || "Exam updates"}</span>
                <input
                  type="checkbox"
                  checked={settings.notifications.examUpdates}
                  onChange={(event) => updateNotification("examUpdates", event.target.checked)}
                  className="h-4 w-4 rounded border border-[var(--adlts-border)] text-[var(--adlts-blue-600)] focus:ring-2 focus:ring-[var(--adlts-focus-ring)]"
                />
              </label>
              <label className="flex items-center justify-between gap-3 rounded-md border border-[var(--adlts-border)] bg-[var(--adlts-surface)] p-3 transition hover:bg-[var(--adlts-surface-soft)]">
                <span className={ui.statLabel}>{t("resultNotifications") || "Result notifications"}</span>
                <input
                  type="checkbox"
                  checked={settings.notifications.resultNotifications}
                  onChange={(event) => updateNotification("resultNotifications", event.target.checked)}
                  className="h-4 w-4 rounded border border-[var(--adlts-border)] text-[var(--adlts-blue-600)] focus:ring-2 focus:ring-[var(--adlts-focus-ring)]"
                />
              </label>
              <label className="flex items-center justify-between gap-3 rounded-md border border-[var(--adlts-border)] bg-[var(--adlts-surface)] p-3 transition hover:bg-[var(--adlts-surface-soft)]">
                <span className={ui.statLabel}>{t("licensePickupNotifications") || "License pickup notifications"}</span>
                <input
                  type="checkbox"
                  checked={settings.notifications.licensePickupNotifications}
                  onChange={(event) => updateNotification("licensePickupNotifications", event.target.checked)}
                  className="h-4 w-4 rounded border border-[var(--adlts-border)] text-[var(--adlts-blue-600)] focus:ring-2 focus:ring-[var(--adlts-focus-ring)]"
                />
              </label>
            </fieldset>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving} state={isSaving ? { loading: true } : undefined}>
            {t("saveSettings") || "Save settings"}
          </Button>
        </div>
      </form>
    </PageContainer>
  );
}
