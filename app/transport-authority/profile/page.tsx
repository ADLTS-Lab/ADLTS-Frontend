"use client";

 "use client";

import { useI18n } from "@/i18n/useI18n";
import RoleProfileView from "@/components/RoleProfileView";
import { PageContainer, PageHeader } from "@/app/components/ui";

export default function TransportAuthorityProfilePage() {
  const { t } = useI18n();
  return (
    <PageContainer width="wide" className="space-y-6">
      <PageHeader
        eyebrow={t("transportAuthority") || "Transport Authority"}
        title={t("profile") || "Profile"}
        description={t("profileDescription") || "Review account identity and contact information."}
      />
      <RoleProfileView />
    </PageContainer>
  );
}
