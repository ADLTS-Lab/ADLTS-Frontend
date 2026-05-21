"use client";

import { ExpertPortalShell } from "@/components/PortalShell";
import { useRequireAuth } from "@/hooks/useRequireAuth";

export default function ExpertPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { ready } = useRequireAuth(["expert", "super_admin"]);

  if (!ready) {
    return null;
  }

  return <ExpertPortalShell>{children}</ExpertPortalShell>;
}
