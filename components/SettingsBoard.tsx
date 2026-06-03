"use client";

import { type FormEvent, useEffect, useState } from "react";
import { CheckCircle, Globe } from "lucide-react";
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
} from "@/app/components/ui";

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
        description="Manage language preferences for ADLTS operations."
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

        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving} state={isSaving ? { loading: true } : undefined}>
            Save settings
          </Button>
        </div>
      </form>
    </PageContainer>
  );
}
