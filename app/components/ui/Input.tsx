import { type InputHTMLAttributes, type ReactNode, useId } from "react";

import { ui } from "./design-tokens";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  hint?: string;
  suffix?: ReactNode;
};

export function Input({ label, error, hint, suffix, className = "", id, ...props }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;

  return (
    <div className="space-y-1.5">
      {label ? <label htmlFor={inputId} className={ui.label}>{label}</label> : null}
      <div className="relative">
        <input
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          className={`${ui.input} ${suffix ? "pr-10" : ""} ${error ? "border-[var(--adlts-error-600)] focus:border-[var(--adlts-error-600)] focus:ring-[color:rgba(220,38,38,0.2)]" : ""} ${className}`}
          {...props}
        />
        {suffix ? <div className="absolute inset-y-0 right-0 flex items-center pr-2">{suffix}</div> : null}
      </div>
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
