import { type ReactNode } from "react";

import { ui } from "./design-tokens";
import { ButtonLink } from "./Button";

type EmptyStateAction = {
  href: string;
  label: string;
};

export function EmptyState({
  title,
  description,
  action,
  details,
  className = "",
  actionLink,
}: {
  title: string;
  description?: string;
  details?: string;
  action?: ReactNode;
  actionLink?: EmptyStateAction;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-md border border-[var(--adlts-border)] bg-[var(--adlts-surface-soft)] px-6 py-12 text-center ${className}`}
    >
      <p className={ui.sectionTitle}>{title}</p>
      {description ? <p className="mt-2 max-w-sm text-sm text-[var(--adlts-ink-600)]">{description}</p> : null}
      {details ? <p className="mt-2 max-w-sm text-xs text-[var(--adlts-ink-500)]">{details}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
      {actionLink ? (
        <ButtonLink href={actionLink.href} variant="primary" className="mt-5">
          {actionLink.label}
        </ButtonLink>
      ) : null}
    </div>
  );
}
