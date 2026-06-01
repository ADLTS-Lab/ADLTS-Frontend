import { type ReactNode } from "react";

export function EmptyState({
  title,
  description,
  action,
  className = "",
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center ${className}`}
    >
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      {description ? <p className="mt-2 max-w-sm text-sm text-slate-600">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
