import { type TextareaHTMLAttributes, useId } from "react";

import { ui } from "./design-tokens";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
  hint?: string;
};

export function Textarea({ label, error, hint, className = "", id, ...props }: TextareaProps) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  const errorId = `${textareaId}-error`;
  const hintId = `${textareaId}-hint`;

  return (
    <div className="space-y-1.5">
      {label ? (
        <label htmlFor={textareaId} className={ui.label}>
          {label}
        </label>
      ) : null}
      <textarea
        id={textareaId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : hint ? hintId : undefined}
        className={`${ui.textarea} ${error ? "border-[var(--adlts-error-600)] focus:border-[var(--adlts-error-600)] focus:ring-[color:rgba(220,38,38,0.2)]" : ""} ${className}`}
        {...props}
      />
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
