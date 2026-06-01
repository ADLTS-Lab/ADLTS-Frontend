import { type ReactNode } from "react";

type AlertVariant = "error" | "success" | "info";

const variantClasses: Record<AlertVariant, string> = {
  error: "border-rose-200 bg-rose-50 text-rose-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  info: "border-blue-200 bg-blue-50 text-blue-800",
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
    <div className={`rounded-lg border px-4 py-3 text-sm ${variantClasses[variant]} ${className}`}>
      {children}
    </div>
  );
}
