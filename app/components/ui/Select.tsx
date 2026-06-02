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
  const errorId = `${selectId}-error`;
  const hintId = `${selectId}-hint`;

  return (
    <div className="space-y-1.5">
      {label ? <label htmlFor={selectId} className={ui.label}>{label}</label> : null}
      <select
        id={selectId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : hint ? hintId : undefined}
        className={`${ui.select} ${error ? "border-[var(--adlts-error-600)] focus:border-[var(--adlts-error-600)] focus:ring-[color:rgba(220,38,38,0.2)]" : ""} ${className}`}
        {...props}
      >
        {children}
      </select>
      {error ? (
        <p id={errorId} role="alert" className={ui.errorText}>
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className={ui.hint}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}
