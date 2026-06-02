/** Shared class fragments aligned with the ADLTS Civic Precision system. */
export const ui = {
  displayHero:
    "text-[clamp(2.5rem,6.5vw,4rem)] font-semibold leading-[1.04] tracking-tight text-[var(--adlts-ink-950)]",
  displaySection:
    "text-[clamp(2rem,4.7vw,3rem)] font-semibold leading-[1.12] tracking-tight text-[var(--adlts-ink-950)]",
  pageTitle: "text-3xl font-semibold leading-[1.15] tracking-tight text-[var(--adlts-ink-950)] sm:text-[2.25rem]",
  h1: "text-[2rem] font-semibold leading-[1.15] tracking-tight text-[var(--adlts-ink-950)]",
  sectionTitle:
    "text-[1.625rem] font-semibold leading-[1.25] tracking-tight text-[var(--adlts-ink-950)]",
  cardTitle:
    "text-[1.375rem] font-semibold leading-[1.30] text-[var(--adlts-ink-950)]",
  sectionLead:
    "text-[0.975rem] leading-relaxed text-[var(--adlts-ink-600)] md:text-base",
  pageSubtitle:
    "mt-2 text-[0.95rem] leading-relaxed text-[var(--adlts-ink-600)] md:text-[1rem]",
  eyebrow:
    "text-[12px] font-medium uppercase tracking-[0.14em] text-[var(--adlts-ink-500)]",
  label:
    "block text-sm font-medium text-[var(--adlts-ink-700)]",
  hint: "mt-1.5 text-[12px] leading-relaxed text-[var(--adlts-ink-500)]",
  errorText: "mt-1.5 text-[12px] font-medium text-[var(--adlts-error-600)]",
  input:
    "w-full rounded-sm border border-[var(--adlts-border)] bg-[var(--adlts-surface)] px-3 py-2.5 text-sm text-[var(--adlts-ink-900)] outline-none transition-[color,background-color,border-color,box-shadow] duration-base ease-standard placeholder:text-[var(--adlts-ink-500)] focus:border-[var(--adlts-blue-600)] focus:ring-2 focus:ring-[var(--adlts-focus-ring)] disabled:cursor-not-allowed disabled:bg-[var(--adlts-surface-soft)] disabled:text-[var(--adlts-ink-500)]",
  select:
    "w-full rounded-sm border border-[var(--adlts-border)] bg-[var(--adlts-surface)] px-3 py-2.5 text-sm text-[var(--adlts-ink-900)] outline-none transition-[color,background-color,border-color,box-shadow] duration-base ease-standard focus:border-[var(--adlts-blue-600)] focus:ring-2 focus:ring-[var(--adlts-focus-ring)] disabled:cursor-not-allowed disabled:bg-[var(--adlts-surface-soft)] disabled:text-[var(--adlts-ink-500)]",
  textarea:
    "w-full resize-none rounded-sm border border-[var(--adlts-border)] bg-[var(--adlts-surface)] px-3 py-2.5 text-sm text-[var(--adlts-ink-900)] outline-none transition-[color,background-color,border-color,box-shadow] duration-base ease-standard placeholder:text-[var(--adlts-ink-500)] focus:border-[var(--adlts-blue-600)] focus:ring-2 focus:ring-[var(--adlts-focus-ring)] disabled:cursor-not-allowed disabled:bg-[var(--adlts-surface-soft)] disabled:text-[var(--adlts-ink-500)]",
  card:
    "rounded-md border border-[var(--adlts-border)] bg-[var(--adlts-surface)] shadow-card",
  cardMuted:
    "rounded-md border border-[var(--adlts-border)] bg-[var(--adlts-surface-soft)]",
  cardSoft:
    "rounded-md border border-[var(--adlts-border-strong)] bg-[var(--adlts-surface-soft)]",
  cardInteractive:
    "rounded-md border border-[var(--adlts-border)] bg-[var(--adlts-surface)] transition-all duration-smooth ease-emphasized hover:-translate-y-0.5 hover:border-[var(--adlts-blue-300)] hover:shadow-card-hover",
  statLabel:
    "text-[11px] font-medium uppercase tracking-wide text-[var(--adlts-ink-500)]",
  statValue:
    "text-sm font-semibold text-[var(--adlts-ink-900)]",
  statDeltaPositive:
    "text-sm font-semibold text-[var(--adlts-success-700)]",
  statDeltaNegative:
    "text-sm font-semibold text-[var(--adlts-error-700)]",
  statDeltaNeutral:
    "text-sm font-medium text-[var(--adlts-ink-500)]",
  mono:
    "font-mono text-[12px] leading-relaxed text-[var(--adlts-ink-700)]",
  roleTag:
    "inline-flex rounded-pill bg-[var(--adlts-blue-50)] px-2.5 py-1 text-[12px] font-medium text-[var(--adlts-blue-700)]",
  statusTag:
    "inline-flex rounded-pill border px-2 py-1 text-[12px] font-medium",
  sectionRule:
    "border-t border-[var(--adlts-divider)]",
  shellPanel:
    "mx-auto flex w-full max-w-container-wide px-4 sm:px-6 lg:px-8",
  shellPanelPublic:
    "mx-auto flex w-full max-w-container-public px-4 sm:px-6 lg:px-8",
  shellPanelReading:
    "mx-auto flex w-full max-w-container-reading px-4 sm:px-6 lg:px-8",
  shellPanelForm:
    "mx-auto flex w-full max-w-container-form px-4 sm:px-6 lg:px-8",
  metricCard:
    "rounded-md border border-[var(--adlts-border)] bg-[var(--adlts-surface)] p-6 shadow-card",
} as const;

export const spacing = {
  pageY: "space-y-8 md:space-y-10",
  sectionY: "space-y-4",
  sectionYLarge: "space-y-6 md:space-y-8",
  formY: "space-y-4",
  stackXs: "space-y-2",
  stackSm: "space-y-2",
  stackMd: "space-y-4",
  stackLg: "space-y-6",
  formGap: "gap-4",
  rowGapSm: "gap-2",
  pagePadding: "px-4 sm:px-6 lg:px-8",
  panel: "max-w-container-wide mx-auto",
} as const;
