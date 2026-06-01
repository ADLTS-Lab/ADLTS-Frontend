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

  return (
    <div className="space-y-1.5">
      {label ? (
        <label htmlFor={textareaId} className={ui.label}>
          {label}
        </label>
      ) : null}
      <textarea
        id={textareaId}
        className={`${ui.textarea} ${error ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/20" : ""} ${className}`}
        {...props}
      />
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
