import { type ReactNode } from "react";

import { spacing, ui } from "./design-tokens";

type CardVariant =
  | "default"
  | "surface"
  | "muted"
  | "soft"
  | "metric"
  | "interactive"
  | "outline"
  | "warning"
  | "success"
  | "danger"
  | "info";

type CardProps = {
  children: ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  variant?: CardVariant;
};

type CardSectionProps = {
  children: ReactNode;
  className?: string;
};

type CardHeaderProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

const paddingClasses = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-6 md:p-8",
};

const variantClasses: Record<CardVariant, string> = {
  default: ui.card,
  surface: ui.card,
  muted: ui.cardMuted,
  soft: ui.cardSoft,
  metric: `${ui.card} grid gap-1`,
  interactive: ui.cardInteractive,
  outline: "rounded-[8px] border border-[var(--border-strong)] bg-transparent",
  warning:
    "rounded-[8px] border border-[var(--warning)] bg-[var(--warning-subtle)] text-[var(--text-primary)]",
  success:
    "rounded-[8px] border border-[var(--success)] bg-[var(--success-subtle)] text-[var(--text-primary)]",
  danger:
    "rounded-[8px] border border-[var(--danger)] bg-[var(--danger-subtle)] text-[var(--text-primary)]",
  info:
    "rounded-[8px] border border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--text-primary)]",
};

export function Card({
  children,
  className = "",
  padding = "md",
  variant = "surface",
}: CardProps) {
  return (
    <div className={`${variantClasses[variant]} ${paddingClasses[padding]} ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  description,
  action,
  className = "",
}: CardHeaderProps) {
  return (
    <div
      className={`mb-5 flex flex-col gap-3 border-b border-[var(--border)] pb-4 sm:flex-row sm:items-start sm:justify-between ${className}`}
    >
      <div className="space-y-1">
        <h2 className={ui.sectionTitle}>{title}</h2>
        {description ? <p className={ui.sectionLead}>{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function CardTitle({ children, className = "" }: CardSectionProps) {
  return <h3 className={`${ui.cardTitle} ${className}`}>{children}</h3>;
}

export function CardDescription({ children, className = "" }: CardSectionProps) {
  return <p className={`mt-1 text-[14px] text-[var(--text-secondary)] ${className}`}>{children}</p>;
}

export function CardContent({ children, className = "" }: CardSectionProps) {
  return <div className={`${spacing.formY} ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = "" }: CardSectionProps) {
  return <div className={`mt-5 border-t border-[var(--border)] pt-5 ${className}`}>{children}</div>;
}
