import { type ReactNode } from "react";

type AlertVariant = "error" | "success" | "info" | "warning";

const variantClasses: Record<AlertVariant, string> = {
  error: "border-[var(--adlts-error-600)]/40 bg-[var(--adlts-error-50)] text-[var(--adlts-error-700)]",
  success: "border-[var(--adlts-success-600)]/40 bg-[var(--adlts-success-50)] text-[var(--adlts-success-700)]",
  info: "border-[var(--adlts-blue-200)] bg-[var(--adlts-blue-50)] text-[var(--adlts-blue-700)]",
  warning: "border-[var(--adlts-warning-700)]/40 bg-[var(--adlts-warning-50)] text-[var(--adlts-warning-700)]",
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
    <div role="status" className={`rounded-md border px-4 py-3 text-sm ${variantClasses[variant]} ${className}`}>
      {children}
    </div>
  );
}
