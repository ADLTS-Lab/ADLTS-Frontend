"use client";

import { type FormEvent, useEffect, useState } from "react";
import { Bell, CheckCircle, Globe } from "lucide-react";
import { getAppSettings, updateAppSettings, type CandidateSettings } from "@/services/settings.service";
import {
  Alert,
  Button,
  Card,
  CardContent,
  CardHeader,
  PageContainer,
  PageHeader,
  Select,
  ui,
} from "@/app/components/ui";

type NotificationKey = keyof CandidateSettings["notifications"];

const notificationOptions: Array<{ key: NotificationKey; label: string }> = [
  { key: "bookingUpdates", label: "Booking updates" },
  { key: "examUpdates", label: "Exam updates" },
  { key: "resultNotifications", label: "Result notifications" },
  { key: "licensePickupNotifications", label: "License pickup notifications" },
];

export function SettingsBoard() {
  const [settings, setSettings] = useState<CandidateSettings | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let mounted = true;
    getAppSettings()
      .then((data) => {
        if (mounted) {
          setSettings(data);
          setIsLoading(false);
        }
      })
      .catch((error) => {
        if (mounted) {
          setErrorMessage(error instanceof Error ? error.message : "Unable to load this data right now. Refresh the page or contact support if the issue continues.");
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
    setErrorMessage("");
    setIsSaving(true);

    try {
      const updated = await updateAppSettings(settings);
      setSettings(updated);
      setSuccessMessage("Settings saved successfully.");
      setTimeout(() => setSuccessMessage(""), 3500);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to save settings.");
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
          <div className="h-5 w-32 rounded-[6px] bg-[var(--surface-2)]" />
          <div className="h-11 w-full rounded-[6px] bg-[var(--surface-2)]" />
          <div className="h-11 w-full rounded-[6px] bg-[var(--surface-2)]" />
          <div className="h-24 w-full rounded-[8px] bg-[var(--surface-2)]" />
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer width="wide" className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage language and notification preferences for ADLTS operations."
      />

      {successMessage ? (
        <Alert variant="success">
          <div className="flex items-center gap-3">
            <CheckCircle className="shrink-0 text-[var(--success)]" size={18} />
            <p className="text-[14px] font-semibold">{successMessage}</p>
          </div>
        </Alert>
      ) : null}
      {errorMessage ? <Alert variant="error">{errorMessage}</Alert> : null}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6">
          <Card>
            <CardHeader
              title="Language"
              description="Choose the preferences that make daily ADLTS work easier to follow."
              action={<Globe className="h-5 w-5 text-[var(--accent)]" />}
            />
            <CardContent>
              <Select
                label="Language preference"
                value={settings.language}
                onChange={(event) =>
                  setSettings((current) =>
                    current ? { ...current, language: event.target.value as CandidateSettings["language"] } : current
                  )
                }
              >
                <option value="en">English</option>
                <option value="am">Amharic</option>
              </Select>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader
            title="Notification preferences"
            description="Important account, booking, payment, exam, and review updates will appear in notifications."
            action={<Bell className="h-5 w-5 text-[var(--accent)]" />}
          />

          <CardContent>
            <fieldset className="grid gap-3 md:grid-cols-2">
              <legend className="sr-only">Notification preferences</legend>
              {notificationOptions.map((option) => (
                <label
                  key={option.key}
                  className="flex items-center justify-between gap-3 rounded-[8px] border border-[var(--border)] bg-[var(--surface)] p-3 transition-colors hover:bg-[var(--surface-2)]"
                >
                  <span className={ui.statLabel}>{option.label}</span>
                  <input
                    type="checkbox"
                    checked={settings.notifications[option.key]}
                    onChange={(event) => updateNotification(option.key, event.target.checked)}
                    className="h-4 w-4 rounded-[4px] border border-[var(--border)] text-[var(--accent)] focus:ring-2 focus:ring-[var(--focus-ring)]"
                  />
                </label>
              ))}
            </fieldset>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving} state={isSaving ? { loading: true } : undefined}>
            Save settings
          </Button>
        </div>
      </form>
    </PageContainer>
  );
}
