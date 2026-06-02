import Link from "next/link";
import { type ButtonHTMLAttributes, type ReactNode } from "react";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "outline"
  | "danger"
  | "success"
  | "link";

type ButtonSize = "sm" | "md" | "lg";

type ButtonState = {
  loading?: boolean;
  iconOnly?: boolean;
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  state?: ButtonState;
  className?: string;
};

type ButtonLinkProps = {
  children: ReactNode;
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  state?: ButtonState;
  className?: string;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--adlts-blue-600)] text-white hover:bg-[var(--adlts-blue-700)]",
  secondary:
    "border border-[var(--adlts-border)] bg-[var(--adlts-surface)] text-[var(--adlts-ink-900)] hover:bg-[var(--adlts-surface-soft)]",
  ghost:
    "bg-transparent text-[var(--adlts-blue-700)] hover:bg-[var(--adlts-blue-50)]",
  outline:
    "border border-[var(--adlts-border-strong)] bg-[var(--adlts-surface)] text-[var(--adlts-ink-900)] hover:border-[var(--adlts-blue-600)] hover:text-[var(--adlts-blue-700)]",
  danger:
    "bg-[var(--adlts-error-600)] text-white hover:bg-[var(--adlts-error-700)]",
  success:
    "bg-[var(--adlts-success-600)] text-white hover:bg-[var(--adlts-success-700)]",
  link:
    "bg-transparent p-0 text-[var(--adlts-blue-700)] underline underline-offset-4 hover:underline",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

function buttonClassName(
  variant: ButtonVariant,
  size: ButtonSize,
  fullWidth: boolean,
  state?: ButtonState,
  className = ""
) {
  const loadingClass = state?.loading ? "pointer-events-none opacity-90" : "";
  const appliedSize = variant === "link" ? "md" : size;
  const iconOnlyClass = state?.iconOnly ? "h-9 w-9 p-0 rounded-pill" : "";
  const gapClass = state?.iconOnly ? "gap-0" : "gap-2";

  return [
    "inline-flex items-center justify-center rounded-sm font-medium transition-all duration-base ease-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--adlts-focus-ring)]",
    "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
    sizeClasses[appliedSize],
    variantClasses[variant],
    gapClass,
    iconOnlyClass,
    loadingClass,
    fullWidth ? "w-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

function Spinner() {
  return (
    <span
      aria-hidden="true"
      aria-label="loading"
      className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current/35 border-t-current"
    />
  );
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  state,
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClassName(variant, size, fullWidth, state, className)}
      aria-busy={state?.loading}
      disabled={props.disabled}
      {...props}
    >
      {state?.loading ? <Spinner /> : null}
      <span>{children}</span>
    </button>
  );
}

export function ButtonLink({
  children,
  href,
  variant = "primary",
  size = "md",
  fullWidth = false,
  state,
  className = "",
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={buttonClassName(variant, size, fullWidth, state, className)}
      aria-busy={state?.loading}
    >
      {state?.loading ? <Spinner /> : null}
      <span>{children}</span>
    </Link>
  );
}
