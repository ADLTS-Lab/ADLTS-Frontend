import Link from "next/link";
import { type ElementType, type ReactNode } from "react";

type PublicSectionProps = {
  children: ReactNode;
  tone?: "bg" | "surface" | "accent";
  className?: string;
};

const toneClass = {
  bg: "bg-[var(--bg)]",
  surface: "bg-[var(--surface)]",
  accent: "bg-[var(--accent)] text-[var(--surface)]",
};

export function PublicSection({
  children,
  tone = "bg",
  className = "",
}: PublicSectionProps) {
  return (
    <section className={`${toneClass[tone]} px-6 py-20 ${className}`}>
      <div className="mx-auto w-full max-w-container-public">{children}</div>
    </section>
  );
}

export function PublicWideSection({
  children,
  tone = "bg",
  className = "",
}: PublicSectionProps) {
  return (
    <section className={`${toneClass[tone]} px-4 py-20 sm:px-6 lg:px-8 ${className}`}>
      <div className="mx-auto w-full max-w-[88rem]">{children}</div>
    </section>
  );
}

export function PublicHeader({
  title,
  lead,
  align = "left",
  className = "",
  titleAs: Title = "h2",
}: {
  title: string;
  lead?: string;
  align?: "left" | "center";
  className?: string;
  titleAs?: ElementType;
}) {
  return (
    <div className={`${align === "center" ? "mx-auto text-center" : ""} max-w-3xl ${className}`}>
      <Title className="text-[32px] font-bold leading-tight text-[var(--text-primary)]">
        {title}
      </Title>
      {lead ? (
        <p className="mt-4 text-[16px] leading-7 text-[var(--text-secondary)]">{lead}</p>
      ) : null}
    </div>
  );
}

export function PublicCard({
  icon: Icon,
  title,
  children,
  className = "",
}: {
  icon?: ElementType;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <article className={`rounded-[8px] border border-[var(--border)] bg-[var(--surface)] p-6 ${className}`}>
      {Icon ? <Icon className="mb-4 h-5 w-5 text-[var(--accent)]" aria-hidden="true" /> : null}
      <h3 className="text-[15px] font-semibold text-[var(--text-primary)]">{title}</h3>
      <div className="mt-3 text-[14px] leading-6 text-[var(--text-secondary)]">{children}</div>
    </article>
  );
}

export function PublicButtonLink({
  href,
  children,
  variant = "primary",
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "inverse" | "inverse-outline";
  className?: string;
}) {
  const variants = {
    primary:
      "border-[var(--accent)] bg-[var(--accent)] text-[var(--surface)] hover:bg-[var(--accent-hover)] hover:border-[var(--accent-hover)]",
    secondary:
      "border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] hover:border-[var(--accent)] hover:text-[var(--accent)]",
    inverse:
      "border-[var(--surface)] bg-[var(--surface)] text-[var(--accent)] hover:bg-[var(--accent-subtle)]",
    "inverse-outline":
      "border-[var(--surface)] bg-transparent text-[var(--surface)] hover:bg-[var(--surface)] hover:text-[var(--accent)]",
  };

  return (
    <Link
      href={href}
      className={`inline-flex h-10 items-center justify-center rounded-[6px] border px-4 text-[14px] font-medium transition-colors duration-150 ${variants[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}

export function PublicList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3 text-[14px] leading-6 text-[var(--text-secondary)]">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-[50%] bg-[var(--accent)]" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function PublicFAQ({
  items,
}: {
  items: Array<{ question: string; answer: string }>;
}) {
  return (
    <div className="divide-y divide-[var(--border)] rounded-[8px] border border-[var(--border)] bg-[var(--surface)]">
      {items.map((item) => (
        <details key={item.question} className="group p-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-semibold text-[var(--text-primary)]">
            {item.question}
            <span className="text-[18px] text-[var(--text-secondary)] group-open:rotate-90">&gt;</span>
          </summary>
          <p className="mt-3 text-[14px] leading-6 text-[var(--text-secondary)]">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}

export function PublicTimeline({
  steps,
}: {
  steps: Array<{ title: string; body?: string }>;
}) {
  return (
    <ol className="border-l-2 border-[var(--border)] pl-6">
      {steps.map((step, index) => (
        <li key={step.title} className="relative pb-8 last:pb-0">
          <span className="absolute -left-[37px] flex h-6 w-6 items-center justify-center rounded-[50%] bg-[var(--accent-subtle)] text-[12px] font-semibold text-[var(--accent)]">
            {index + 1}
          </span>
          <h3 className="text-[15px] font-semibold text-[var(--text-primary)]">{step.title}</h3>
          {step.body ? (
            <p className="mt-2 text-[14px] leading-6 text-[var(--text-secondary)]">{step.body}</p>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
