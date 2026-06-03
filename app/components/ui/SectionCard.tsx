import { type ReactNode } from "react";

type SectionCardProps = {
  children: ReactNode;
  className?: string;
  as?: "section" | "div" | "article";
};

export function SectionCard({
  children,
  className = "",
  as: Component = "section",
}: SectionCardProps) {
  return (
    <Component
      className={`rounded-[8px] border border-[var(--border)] bg-[var(--surface)] p-6 ${className}`}
    >
      {children}
    </Component>
  );
}
