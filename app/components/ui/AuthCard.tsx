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
      <Card padding="lg" className="shadow-sm">
        <div className="mb-6 space-y-3 text-center">
          {icon ? (
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-blue-900">
              {icon}
            </div>
          ) : null}
          <div className="space-y-1">
            <h1 className="text-xl font-semibold tracking-tight text-blue-950">{title}</h1>
            {subtitle ? <p className="text-sm text-slate-600">{subtitle}</p> : null}
          </div>
        </div>
        {children}
        {footer ? <div className="mt-6 border-t border-slate-100 pt-5 text-center text-sm text-slate-600">{footer}</div> : null}
      </Card>
    </div>
  );
}

export function AuthForm({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`space-y-4 ${className}`}>{children}</div>;
}

export function AuthLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} className="font-medium text-blue-900 transition-colors hover:text-blue-800">
      {children}
    </a>
  );
}

export function LabelRow({ label, action }: { label: string; action?: ReactNode }) {
  return (
    <div className="mb-1.5 flex items-center justify-between gap-2">
      <span className={ui.label}>{label}</span>
      {action}
    </div>
  );
}
