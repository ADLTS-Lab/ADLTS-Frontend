"use client";

import RoleProfileView from "@/components/RoleProfileView";
import { PageContainer, PageHeader } from "@/app/components/ui";

export default function SuperAdminProfilePage() {
  return (
    <PageContainer width="wide" className="space-y-6">
      <PageHeader
        title="Super admin profile"
        description="Profile details help ADLTS show the correct identity and contact information across role-based workflows."
      />
      <RoleProfileView />
    </PageContainer>
  );
}
