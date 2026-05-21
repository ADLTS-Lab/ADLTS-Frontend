"use client";

import { TransportAuthorityPortalShell } from "@/components/PortalShell";
import { useRequireAuth } from "@/hooks/useRequireAuth";

export default function TransportAuthorityPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { ready } = useRequireAuth(["transport_authority", "super_admin"]);

  if (!ready) {
    return null;
  }

  return <TransportAuthorityPortalShell>{children}</TransportAuthorityPortalShell>;
}
