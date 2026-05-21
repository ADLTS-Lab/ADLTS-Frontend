"use client";

import { CandidatePortalShell } from "@/components/PortalShell";
import { useRequireAuth } from "@/hooks/useRequireAuth";

/** Super admin keeps the same sidebar chrome as before (candidate-style nav). */
export default function SuperAdminPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { ready } = useRequireAuth(["super_admin"]);

  if (!ready) {
    return null;
  }

  return <CandidatePortalShell>{children}</CandidatePortalShell>;
}
