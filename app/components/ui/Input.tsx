import { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}
export const Input = ({ label, error, className = "", ...props }: InputProps) => (
  <div className="space-y-1">
    {label && <label className="block text-sm font-semibold text-text-dark">{label}</label>}
    <input
      className={`w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-light focus:border-transparent outline-none bg-slate-50 ${className}`}
      {...props}
    />
    {error && <p className="text-xs text-error">{error}</p>}
  </div>
);