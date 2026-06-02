"use client";

import { InstitutePortalShell } from "@/components/PortalShell";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { usePathname } from "next/navigation";

export default function InstitutionPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAcceptInvitation = pathname?.startsWith("/institution/accept-invitation");

  if (isAcceptInvitation) {
    return <>{children}</>;
  }

  return <AuthenticatedInstitutionLayout>{children}</AuthenticatedInstitutionLayout>;
}

function AuthenticatedInstitutionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { ready } = useRequireAuth(["institute", "super_admin"]);

  if (!ready) {
    return null;
  }

  return <InstitutePortalShell>{children}</InstitutePortalShell>;
}
