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

  return (
    <div className="space-y-1.5">
      {label ? (
        <label htmlFor={inputId} className={ui.label}>
          {label}
        </label>
      ) : null}
      <div className="relative">
        <input
          id={inputId}
          className={`${ui.input} ${suffix ? "pr-10" : ""} ${error ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/20" : ""} ${className}`}
          {...props}
        />
        {suffix ? (
          <div className="absolute inset-y-0 right-0 flex items-center pr-2">{suffix}</div>
        ) : null}
      </div>
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
