/** Shared class fragments aligned with the ADLTS Phase 1 foundation. */
export const ui = {
  displayHero:
    "text-[48px] font-bold leading-[1.1] text-[var(--text-primary)]",
  displaySection:
    "text-[32px] font-bold leading-[1.2] text-[var(--text-primary)]",
  pageTitle:
    "text-[24px] font-bold leading-[1.2] text-[var(--text-primary)]",
  h1: "text-[24px] font-bold leading-[1.2] text-[var(--text-primary)]",
  sectionTitle:
    "text-[18px] font-semibold leading-[1.3] text-[var(--text-primary)]",
  cardTitle:
    "text-[15px] font-semibold leading-[1.35] text-[var(--text-primary)]",
  sectionLead:
    "text-[14px] leading-6 text-[var(--text-secondary)]",
  pageSubtitle:
    "mt-2 max-w-3xl text-[14px] leading-6 text-[var(--text-secondary)]",
  eyebrow:
    "text-[12px] font-medium leading-5 text-[var(--text-secondary)]",
  label:
    "block text-[12px] font-medium leading-5 text-[var(--text-secondary)]",
  hint: "mt-1 text-[12px] leading-5 text-[var(--text-secondary)]",
  errorText:
    "mt-1 text-[12px] font-medium leading-5 text-[var(--danger)]",
  input:
    "h-9 w-full rounded-[6px] border border-[var(--border)] bg-[var(--surface)] px-3 text-[14px] text-[var(--text-primary)] outline-none transition-[color,background-color,border-color,box-shadow] duration-150 ease-in placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent)] focus:ring-[3px] focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:bg-[var(--surface-2)] disabled:text-[var(--text-tertiary)]",
  select:
    "h-9 w-full rounded-[6px] border border-[var(--border)] bg-[var(--surface)] px-3 text-[14px] text-[var(--text-primary)] outline-none transition-[color,background-color,border-color,box-shadow] duration-150 ease-in focus:border-[var(--accent)] focus:ring-[3px] focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:bg-[var(--surface-2)] disabled:text-[var(--text-tertiary)]",
  textarea:
    "min-h-24 w-full resize-y rounded-[6px] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[14px] text-[var(--text-primary)] outline-none transition-[color,background-color,border-color,box-shadow] duration-150 ease-in placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent)] focus:ring-[3px] focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:bg-[var(--surface-2)] disabled:text-[var(--text-tertiary)]",
  card:
    "rounded-[8px] border border-[var(--border)] bg-[var(--surface)]",
  cardMuted:
    "rounded-[8px] border border-[var(--border)] bg-[var(--surface-2)]",
  cardSoft:
    "rounded-[8px] border border-[var(--border-strong)] bg-[var(--surface-2)]",
  cardInteractive:
    "rounded-[8px] border border-[var(--border)] bg-[var(--surface)] transition-[background-color,border-color,color] duration-150 ease-in hover:border-[var(--border-strong)] hover:bg-[var(--surface-2)]",
  statLabel:
    "text-[12px] font-medium leading-5 text-[var(--text-secondary)]",
  statValue:
    "text-[24px] font-bold leading-tight text-[var(--text-primary)]",
  statDeltaPositive:
    "text-[12px] font-medium leading-5 text-[var(--success)]",
  statDeltaNegative:
    "text-[12px] font-medium leading-5 text-[var(--danger)]",
  statDeltaNeutral:
    "text-[12px] font-medium leading-5 text-[var(--text-secondary)]",
  mono:
    "font-mono text-[13px] leading-5 text-[var(--text-secondary)]",
  roleTag:
    "inline-flex rounded-[6px] bg-[var(--accent-subtle)] px-2 py-1 text-[12px] font-medium text-[var(--accent)]",
  statusTag:
    "inline-flex rounded-[6px] border px-2 py-1 text-[12px] font-medium",
  sectionRule: "border-t border-[var(--border)]",
  shellPanel:
    "mx-auto flex w-full max-w-container-wide px-4 sm:px-6 lg:px-8",
  shellPanelPublic:
    "mx-auto flex w-full max-w-container-public px-4 sm:px-6 lg:px-8",
  shellPanelReading:
    "mx-auto flex w-full max-w-container-reading px-4 sm:px-6 lg:px-8",
  shellPanelForm:
    "mx-auto flex w-full max-w-container-form px-4 sm:px-6 lg:px-8",
  metricCard:
    "rounded-[8px] border border-[var(--border)] bg-[var(--surface)] p-6",
} as const;

export const spacing = {
  pageY: "space-y-6",
  sectionY: "space-y-4",
  sectionYLarge: "space-y-6",
  formY: "space-y-4",
  stackXs: "space-y-2",
  stackSm: "space-y-2",
  stackMd: "space-y-4",
  stackLg: "space-y-6",
  formGap: "gap-4",
  rowGapSm: "gap-2",
  pagePadding: "px-4 sm:px-6 lg:px-8",
  panel: "mx-auto max-w-container-wide",
} as const;
