"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Layout from "./Layout";

type Props = {
  children: React.ReactNode;
};

export default function AutoLayout({ children }: Props) {
  const pathname = usePathname() || "/";

  // decide variant based on path
  const isDashboard = pathname.startsWith("/candidate") || pathname.startsWith("/admin") || pathname.startsWith("/super-admin");

  return <Layout variant={isDashboard ? "dashboard" : "public"}>{children}</Layout>;
}
