import { type ReactNode, type SelectHTMLAttributes, useId } from "react";

import { ui } from "./design-tokens";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
  hint?: string;
  children: ReactNode;
};

export function Select({ label, error, hint, className = "", id, children, ...props }: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;

  return (
    <div className="space-y-1.5">
      {label ? (
        <label htmlFor={selectId} className={ui.label}>
          {label}
        </label>
      ) : null}
      <select
        id={selectId}
        className={`${ui.select} ${error ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/20" : ""} ${className}`}
        {...props}
      >
        {children}
      </select>
      {error ? (
        <p role="alert" className="text-xs text-rose-600">
          {error}
        </p>
      ) : hint ? (
        <p className={ui.hint}>{hint}</p>
      ) : null}
    </div>
  );
}
