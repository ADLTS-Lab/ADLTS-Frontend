 "use client";

import { SettingsBoard } from "@/components/SettingsBoard";
import { useI18n } from "@/i18n/useI18n";
import { PageContainer, PageHeader } from "@/app/components/ui";

export default function ExpertSettingsPage() {
  const { t } = useI18n();
  return (
    <PageContainer width="wide" className="space-y-6">
      <PageHeader
        eyebrow={t("expertPortal") || "Expert Portal"}
        title={t("settings") || "Settings"}
        description={t("settingsDescription") || "Notification and application preferences."}
      />
      <SettingsBoard />
    </PageContainer>
  );
}
