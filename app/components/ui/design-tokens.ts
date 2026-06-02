/** Shared class fragments aligned with the ADLTS Civic Precision system. */
export const ui = {
  eyebrow:
    "text-xs font-medium uppercase tracking-[0.14em] text-[var(--adlts-ink-500)]",
  pageTitle: "text-2xl font-semibold tracking-tight text-[var(--adlts-ink-950)] sm:text-3xl",
  pageSubtitle:
    "mt-2 text-sm leading-relaxed text-[var(--adlts-ink-600)] md:text-base",
  sectionTitle:
    "text-lg font-semibold tracking-tight text-[var(--adlts-ink-950)]",
  sectionLead:
    "text-sm leading-relaxed text-[var(--adlts-ink-600)] md:text-base",
  label:
    "block text-sm font-medium text-[var(--adlts-ink-700)]",
  hint: "mt-1.5 text-xs text-[var(--adlts-ink-500)]",
  errorText: "mt-1.5 text-xs font-medium text-[var(--adlts-error-600)]",
  input:
    "w-full rounded-lg border border-[var(--adlts-border)] bg-[var(--adlts-surface)] px-3 py-2.5 text-sm text-[var(--adlts-ink-900)] outline-none transition placeholder:text-[var(--adlts-ink-500)] focus:border-[var(--adlts-blue-600)] focus:ring-2 focus:ring-[color:var(--adlts-focus-ring)] disabled:cursor-not-allowed disabled:bg-[var(--adlts-surface-soft)] disabled:text-[var(--adlts-ink-500)]",
  select:
    "w-full rounded-lg border border-[var(--adlts-border)] bg-[var(--adlts-surface)] px-3 py-2.5 text-sm text-[var(--adlts-ink-900)] outline-none transition focus:border-[var(--adlts-blue-600)] focus:ring-2 focus:ring-[color:var(--adlts-focus-ring)] disabled:cursor-not-allowed disabled:bg-[var(--adlts-surface-soft)] disabled:text-[var(--adlts-ink-500)]",
  textarea:
    "w-full resize-none rounded-lg border border-[var(--adlts-border)] bg-[var(--adlts-surface)] px-3 py-2.5 text-sm text-[var(--adlts-ink-900)] outline-none transition placeholder:text-[var(--adlts-ink-500)] focus:border-[var(--adlts-blue-600)] focus:ring-2 focus:ring-[color:var(--adlts-focus-ring)] disabled:cursor-not-allowed disabled:bg-[var(--adlts-surface-soft)] disabled:text-[var(--adlts-ink-500)]",
  card:
    "rounded-xl border border-[var(--adlts-border)] bg-[var(--adlts-surface)]",
  cardMuted:
    "rounded-xl border border-[var(--adlts-border)] bg-[var(--adlts-surface-soft)]",
  cardSoft:
    "rounded-xl border border-[var(--adlts-border-strong)] bg-[var(--adlts-surface-soft)]",
  cardInteractive:
    "rounded-xl border border-[var(--adlts-border)] bg-[var(--adlts-surface)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--adlts-blue-300)] hover:shadow-sm",
  statLabel:
    "text-xs font-medium uppercase tracking-wide text-[var(--adlts-ink-500)]",
  statValue:
    "text-sm font-semibold text-[var(--adlts-ink-900)]",
  mono:
    "font-mono text-sm text-[var(--adlts-ink-700)]",
  roleTag:
    "inline-flex rounded-full bg-[var(--adlts-blue-100)] px-2.5 py-1 text-xs font-medium text-[var(--adlts-blue-700)]",
  sectionRule:
    "border-t border-[var(--adlts-divider)]",
} as const;

export const spacing = {
  pageY: "space-y-6 md:space-y-8",
  sectionY: "space-y-4",
  sectionYLarge: "space-y-6 md:space-y-8",
  formY: "space-y-4",
  stackSm: "space-y-2",
  stackMd: "space-y-4",
  stackLg: "space-y-6",
  pagePadding: "px-4 sm:px-6 lg:px-8",
  panel: "max-w-7xl mx-auto",
} as const;
