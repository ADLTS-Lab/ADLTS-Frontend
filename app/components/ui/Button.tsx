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
    "border border-[var(--accent)] bg-[var(--accent)] text-[var(--surface)] hover:bg-[var(--accent-hover)] hover:border-[var(--accent-hover)]",
  secondary:
    "border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] hover:bg-[var(--surface-2)]",
  ghost:
    "border border-transparent bg-transparent text-[var(--accent)] hover:bg-[var(--accent-subtle)]",
  outline:
    "border border-[var(--border-strong)] bg-[var(--surface)] text-[var(--text-primary)] hover:border-[var(--accent)] hover:text-[var(--accent)]",
  danger:
    "border border-[var(--danger)] bg-[var(--surface)] text-[var(--danger)] hover:bg-[var(--danger-subtle)]",
  success:
    "border border-[var(--success)] bg-[var(--surface)] text-[var(--success)] hover:bg-[var(--success-subtle)]",
  link:
    "border border-transparent bg-transparent p-0 text-[var(--accent)] underline-offset-4 hover:underline",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-[13px]",
  md: "h-9 px-4 text-[14px]",
  lg: "h-10 px-4 text-[14px]",
};

function buttonClassName(
  variant: ButtonVariant,
  size: ButtonSize,
  fullWidth: boolean,
  state?: ButtonState,
  className = ""
) {
  const loadingClass = state?.loading ? "pointer-events-none opacity-80" : "";
  const appliedSize = variant === "link" ? "md" : size;
  const iconOnlyClass = state?.iconOnly ? "h-9 w-9 p-0" : "";
  const gapClass = state?.iconOnly ? "gap-0" : "gap-2";

  return [
    "inline-flex items-center justify-center rounded-[6px] font-medium transition-[background-color,border-color,color,opacity] duration-150 ease-in focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--focus-ring)] active:scale-[0.98]",
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
      className="inline-block h-4 w-4 animate-spin rounded-[50%] border-2 border-current/35 border-t-current"
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
