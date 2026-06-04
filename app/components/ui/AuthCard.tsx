import { type ReactNode } from "react";

import { Card } from "./Card";
import { ui } from "./design-tokens";

export function AuthCard({
  icon,
  title,
  subtitle,
  children,
  footer,
}: {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-md py-6 md:py-10">
      <Card padding="lg">
        <div className="mb-6 space-y-3 text-center">
          {icon ? (
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-[8px] border border-[var(--border)] bg-[var(--surface-2)] text-[var(--accent)]">
              {icon}
            </div>
          ) : null}
          <div className="space-y-1">
            <h1 className="text-[24px] font-bold leading-tight text-[var(--text-primary)]">{title}</h1>
            {subtitle ? <p className="text-[14px] text-[var(--text-secondary)]">{subtitle}</p> : null}
          </div>
        </div>
        {children}
        {footer ? <div className="mt-6 border-t border-[var(--border)] pt-5 text-center text-[14px] text-[var(--text-secondary)]">{footer}</div> : null}
      </Card>
    </div>
  );
}

export function AuthForm({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`space-y-4 ${className}`}>{children}</div>;
}

export function AuthLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} className="font-medium text-[var(--accent)] transition-colors hover:text-[var(--accent-hover)]">
      {children}
    </a>
  );
}

export function LabelRow({ label, action, required = false }: { label: string; action?: ReactNode; required?: boolean }) {
  return (
    <div className="mb-1.5 flex items-center justify-between gap-2">
      <span className={ui.label}>
        {label}
        {required ? (
          <span className="ml-1 text-[var(--danger)]" aria-hidden="true">
            *
          </span>
        ) : null}
      </span>
      {action}
    </div>
  );
}
