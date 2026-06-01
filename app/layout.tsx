import type { Metadata } from "next";
import AppProviders from "@/providers/AppProviders";
import "./globals.css";

export const metadata: Metadata = {
  title: "ADLTS",
  description: "Automated Driving License Testing System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
