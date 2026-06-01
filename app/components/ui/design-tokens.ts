/** Shared class fragments aligned with the landing page design language. */
export const ui = {
  eyebrow: "text-xs font-medium uppercase tracking-[0.12em] text-slate-500",
  pageTitle: "text-2xl font-semibold tracking-tight text-blue-950 sm:text-3xl",
  pageSubtitle: "mt-2 text-sm leading-relaxed text-slate-600 md:text-base",
  sectionTitle: "text-lg font-semibold tracking-tight text-blue-950",
  label: "block text-sm font-medium text-slate-700",
  hint: "mt-1.5 text-xs text-slate-500",
  input:
    "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500",
  select:
    "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 disabled:cursor-not-allowed disabled:bg-slate-50",
  textarea:
    "w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20",
  card: "rounded-xl border border-slate-200 bg-white",
  cardMuted: "rounded-xl border border-slate-200 bg-slate-50",
  statLabel: "text-xs font-medium uppercase tracking-wide text-slate-500",
  statValue: "text-sm font-semibold text-slate-900",
} as const;

export const spacing = {
  pageY: "space-y-6 md:space-y-8",
  sectionY: "space-y-4",
  formY: "space-y-4",
  stackSm: "space-y-2",
  stackMd: "space-y-4",
} as const;
