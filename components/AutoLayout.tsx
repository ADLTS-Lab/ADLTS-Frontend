"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Layout from "./Layout";

type Props = {
  children: React.ReactNode;
};

export default function AutoLayout({ children }: Props) {
  const pathname = usePathname() || "/";

  const isDashboard =
    (pathname.startsWith("/candidate/") && !pathname.startsWith("/candidate/login") && !pathname.startsWith("/candidate/register")) ||
    pathname.startsWith("/admin/") ||
    pathname.startsWith("/super-admin/");

  return <Layout variant={isDashboard ? "dashboard" : "public"}>{children}</Layout>;
}