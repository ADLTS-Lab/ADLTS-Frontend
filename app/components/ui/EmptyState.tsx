import { type ReactNode } from "react";

import { ButtonLink } from "./Button";

type EmptyStateAction = {
  href: string;
  label: string;
};

function DefaultIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 32 32"
      className="h-8 w-8 text-[var(--text-tertiary)]"
      fill="none"
    >
      <rect x="6" y="8" width="20" height="16" rx="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 13h12M10 18h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function EmptyState({
  title,
  description,
  action,
  details,
  icon,
  className = "",
  actionLink,
}: {
  title: string;
  description?: string;
  details?: string;
  icon?: ReactNode;
  action?: ReactNode;
  actionLink?: EmptyStateAction;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center px-6 py-20 text-center ${className}`}
    >
      <div className="mb-3 flex h-8 w-8 items-center justify-center text-[var(--text-tertiary)]">
        {icon ?? <DefaultIcon />}
      </div>
      <p className="text-[15px] font-semibold text-[var(--text-primary)]">{title}</p>
      {description ? (
        <p className="mt-2 max-w-xs text-[13px] leading-5 text-[var(--text-secondary)]">
          {description}
        </p>
      ) : null}
      {details ? (
        <p className="mt-2 max-w-xs text-[12px] leading-5 text-[var(--text-tertiary)]">
          {details}
        </p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
      {actionLink ? (
        <ButtonLink href={actionLink.href} variant="secondary" className="mt-5">
          {actionLink.label}
        </ButtonLink>
      ) : null}
    </div>
  );
}
