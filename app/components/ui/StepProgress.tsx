type StepProgressStep = {
  label: string;
  description?: string;
};

type StepProgressProps = {
  steps: StepProgressStep[];
  activeIndex: number;
  className?: string;
};

export function StepProgress({ steps, activeIndex, className = "" }: StepProgressProps) {
  return (
    <ol className={`grid gap-4 md:grid-flow-col md:auto-cols-fr ${className}`}>
      {steps.map((step, index) => {
        const isActive = index === activeIndex;
        const isComplete = index < activeIndex;
        const toneClass = isActive || isComplete
          ? "border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--accent)]"
          : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-tertiary)]";

        return (
          <li key={`${step.label}-${index}`} className="relative">
            <div className="flex items-start gap-3">
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-[50%] border text-[12px] font-medium ${toneClass}`}
              >
                {index + 1}
              </span>
              <span className="min-w-0">
                <span className="block text-[14px] font-medium text-[var(--text-primary)]">
                  {step.label}
                </span>
                {step.description ? (
                  <span className="mt-1 block text-[12px] leading-5 text-[var(--text-secondary)]">
                    {step.description}
                  </span>
                ) : null}
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
