import { type ReactNode } from "react";

import { ui } from "./design-tokens";

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
  className = "",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between ${className}`}>
      <div className="space-y-2">
        {eyebrow ? <p className={ui.eyebrow}>{eyebrow}</p> : null}
        <h1 className={ui.pageTitle}>{title}</h1>
        {description ? <p className={ui.pageSubtitle}>{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
