import { AlertCircle, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { type ReactNode } from "react";

type AlertBandVariant = "warning" | "danger" | "success" | "info";

type AlertBandProps = {
  title?: string;
  children: ReactNode;
  variant?: AlertBandVariant;
  className?: string;
};

const variantStyles: Record<
  AlertBandVariant,
  { className: string; icon: typeof Info }
> = {
  warning: {
    className: "border-[var(--warning)] bg-[var(--warning-subtle)] text-[var(--warning)]",
    icon: AlertTriangle,
  },
  danger: {
    className: "border-[var(--danger)] bg-[var(--danger-subtle)] text-[var(--danger)]",
    icon: AlertCircle,
  },
  success: {
    className: "border-[var(--success)] bg-[var(--success-subtle)] text-[var(--success)]",
    icon: CheckCircle2,
  },
  info: {
    className: "border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--accent)]",
    icon: Info,
  },
};

export function AlertBand({
  title,
  children,
  variant = "warning",
  className = "",
}: AlertBandProps) {
  const style = variantStyles[variant];
  const Icon = style.icon;

  return (
    <div
      role="status"
      className={`flex gap-3 rounded-[8px] border px-4 py-3 ${style.className} ${className}`}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div className="min-w-0 text-[14px] leading-6">
        {title ? <p className="font-semibold text-[var(--text-primary)]">{title}</p> : null}
        <div className={title ? "mt-1 text-[var(--text-secondary)]" : ""}>{children}</div>
      </div>
    </div>
  );
}
