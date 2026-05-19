import { InputHTMLAttributes, useId } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}
export const Input = ({ label, error, className = "", id, ...props }: InputProps) => {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-semibold text-text-dark">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-light focus:border-transparent outline-none bg-slate-50 ${className}`}
        {...props}
      />
      {error && (
        <p role="alert" className="text-xs text-error">
          {error}
        </p>
      )}
    </div>
  );
};
