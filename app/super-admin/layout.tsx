"use client";

import { SuperAdminPortalShell } from "@/components/PortalShell";
import { useRequireAuth } from "@/hooks/useRequireAuth";

export default function SuperAdminPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { ready } = useRequireAuth(["super_admin"]);

  if (!ready) {
    return null;
  }

  return <SuperAdminPortalShell>{children}</SuperAdminPortalShell>;
}
