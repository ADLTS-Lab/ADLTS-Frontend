 "use client";

import { useI18n } from "@/i18n/useI18n";
import { SettingsBoard } from "@/components/SettingsBoard";
import { PageContainer, PageHeader } from "@/app/components/ui";

export default function TransportAuthoritySettingsPage() {
  const { t } = useI18n();
  return (
    <PageContainer width="wide" className="space-y-6">
      <PageHeader
        eyebrow={t("transportAuthority") || "Transport Authority"}
        title={t("settings") || "Settings"}
        description={t("settingsDescription") || "Manage notification preferences and account preferences."}
      />
      <SettingsBoard />
    </PageContainer>
  );
}
