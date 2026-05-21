"use client";

import { CandidatePortalShell } from "@/components/PortalShell";
import { useRequireAuth } from "@/hooks/useRequireAuth";

export default function CandidatePortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { ready } = useRequireAuth(["candidate"]);

  if (!ready) {
    return null;
  }

  return <CandidatePortalShell>{children}</CandidatePortalShell>;
}
