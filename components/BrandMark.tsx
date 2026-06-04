import Link from "next/link";

type BrandMarkProps = {
  href?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
  variant?: "mark" | "wordmark";
  showSubtitle?: boolean;
  inverse?: boolean;
};

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-9 w-9",
  lg: "h-10 w-10",
};

const wordmarkSizeClasses = {
  sm: "text-[13px]",
  md: "text-[15px]",
  lg: "text-[17px]",
};

function AdltsEmblem({ size }: { size: BrandMarkProps["size"] }) {
  return (
    <span
      className={`inline-grid shrink-0 place-items-center rounded-[8px] border border-[#E2E8F0] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06)] ${sizeClasses[size ?? "md"]}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 40 40"
        role="img"
        className="h-[82%] w-[82%]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="5" y="7" width="30" height="24" rx="4" stroke="#1E3A8A" strokeWidth="2.2" />
        <path
          d="M20 11.5L28 14.4V20.1C28 25.1 24.6 28.4 20 30.2C15.4 28.4 12 25.1 12 20.1V14.4L20 11.5Z"
          stroke="#1E3A8A"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <path d="M20 14.8V26.4" stroke="#3B82F6" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M16.4 23.8L18.9 20.2" stroke="#3B82F6" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M23.6 23.8L21.1 20.2" stroke="#3B82F6" strokeWidth="1.7" strokeLinecap="round" />
        <path
          d="M16.4 18.8L19.1 21.4L24.1 16.5"
          stroke="#1E3A8A"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M9.8 12.5H14.5" stroke="#3B82F6" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M25.5 27.5H30.2" stroke="#3B82F6" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </span>
  );
}

export function BrandMark({
  href,
  size = "md",
  className = "",
  label = "ADLTS",
  variant = "mark",
  showSubtitle = false,
  inverse = false,
}: BrandMarkProps) {
  const textColor = inverse ? "text-white" : "text-[#0F172A]";
  const subtitleColor = inverse ? "text-slate-300" : "text-[#475569]";

  const content = (
    <span className={`inline-flex items-center gap-2.5 ${className}`.trim()}>
      <AdltsEmblem size={size} />
      {variant === "wordmark" ? (
        <span className="min-w-0 leading-none">
          <span className={`block font-semibold tracking-normal ${textColor} ${wordmarkSizeClasses[size]}`}>
            ADLTS
          </span>
          {showSubtitle ? (
            <span className={`mt-1 hidden max-w-[15rem] truncate text-[11px] font-medium leading-4 sm:block ${subtitleColor}`}>
              Automated Driving License Testing System
            </span>
          ) : null}
        </span>
      ) : null}
      {label ? <span className="sr-only">{label}</span> : null}
    </span>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
