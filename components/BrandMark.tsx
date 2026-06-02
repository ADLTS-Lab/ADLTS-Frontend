import { Circle, CircleCheck, MapPinned, ShieldCheck } from "lucide-react";
import Link from "next/link";

type BrandMarkProps = {
  href?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
};

export function BrandMark({ href, size = "md", className = "", label }: BrandMarkProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-9 w-9",
    lg: "h-10 w-10",
  };

  const content = (
    <span className={`inline-grid place-items-center ${sizeClasses[size]} rounded-lg bg-[var(--adlts-surface)] border border-[var(--adlts-border)] ${className}`.trim()}>
      <span className="relative block h-4/5 w-4/5">
        <span className="absolute left-1/2 top-[18%] h-[0.5rem] w-7 -translate-x-1/2 rounded-full bg-[var(--adlts-blue-700)]/16" />
        <ShieldCheck className="absolute left-1/2 top-0 h-4 w-4 -translate-x-1/2 text-[var(--adlts-blue-700)]" strokeWidth={2.3} />
        <span className="absolute left-1/2 top-3 h-4 w-6 -translate-x-1/2 rounded-full border border-dashed border-[var(--adlts-ink-300)]" />
        <MapPinned className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 text-[var(--adlts-civic-green)]" strokeWidth={2} />
        <Circle
          className="absolute left-[4%] top-[58%] h-1.5 w-1.5 text-[var(--adlts-civic-red)]"
          strokeWidth={2}
          fill="currentColor"
        />
        <CircleCheck className="absolute right-[0] top-[58%] h-2 w-2 text-[var(--adlts-civic-green)]" strokeWidth={2.8} />
      </span>
      {label ? <span className="sr-only">{label}</span> : null}
    </span>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
