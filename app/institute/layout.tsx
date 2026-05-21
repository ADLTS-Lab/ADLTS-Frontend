"use client";

import { InstitutePortalShell } from "@/components/PortalShell";
import { useRequireAuth } from "@/hooks/useRequireAuth";

export default function InstitutePortalLayout({
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
