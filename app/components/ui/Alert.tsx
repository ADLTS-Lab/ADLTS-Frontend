import { type ReactNode } from "react";

type AlertVariant = "error" | "success" | "info" | "warning";

const variantClasses: Record<AlertVariant, string> = {
  error: "border-[var(--danger)] bg-[var(--danger-subtle)] text-[var(--danger)]",
  success: "border-[var(--success)] bg-[var(--success-subtle)] text-[var(--success)]",
  info: "border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--accent)]",
  warning: "border-[var(--warning)] bg-[var(--warning-subtle)] text-[var(--warning)]",
};

export function Alert({
  children,
  variant = "info",
  className = "",
}: {
  children: ReactNode;
  variant?: AlertVariant;
  className?: string;
}) {
  return (
    <div role="status" className={`rounded-[8px] border px-4 py-3 text-[14px] ${variantClasses[variant]} ${className}`}>
      {children}
    </div>
  );
}
