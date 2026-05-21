"use client";

import { AdminPortalShell } from "@/components/PortalShell";
import { useRequireAuth } from "@/hooks/useRequireAuth";

export default function AdminPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { ready } = useRequireAuth(["admin", "super_admin"]);

  if (!ready) {
    return null;
  }

  return <AdminPortalShell>{children}</AdminPortalShell>;
}
