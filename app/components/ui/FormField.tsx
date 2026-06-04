import { type ReactNode, useId } from "react";

import { ui } from "./design-tokens";

type FormFieldProps = {
  label: string;
  children:
    | ReactNode
    | ((fieldProps: {
        id: string;
        "aria-invalid": boolean;
        "aria-describedby"?: string;
      }) => ReactNode);
  id?: string;
  error?: string;
  hint?: string;
  className?: string;
  required?: boolean;
};

export const formControlClassName = ui.input;
export const formSelectClassName = ui.select;
export const formTextareaClassName = ui.textarea;

export function FormField({
  label,
  children,
  id,
  error,
  hint,
  className = "",
  required = false,
}: FormFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const errorId = `${fieldId}-error`;
  const hintId = `${fieldId}-hint`;
  const describedBy = error ? errorId : hint ? hintId : undefined;
  const control =
    typeof children === "function"
      ? children({
          id: fieldId,
          "aria-invalid": Boolean(error),
          "aria-describedby": describedBy,
        })
      : children;

  return (
    <div className={`space-y-1 ${className}`}>
      <label htmlFor={fieldId} className={ui.label}>
        {label}
        {required ? (
          <span className="ml-1 text-[var(--danger)]" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>
      {control}
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
