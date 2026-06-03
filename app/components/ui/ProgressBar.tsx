type ProgressBarProps = {
  value: number;
  label?: string;
  className?: string;
};

function clamp(value: number) {
  return Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0));
}

export function ProgressBar({ value, label, className = "" }: ProgressBarProps) {
  const safeValue = clamp(value);

  return (
    <div className={className}>
      {label ? (
        <div className="mb-1 flex items-center justify-between text-[12px] font-medium text-[var(--text-secondary)]">
          <span>{label}</span>
          <span>{safeValue}%</span>
        </div>
      ) : null}
      <div
        className="h-1 overflow-hidden rounded-[4px] bg-[var(--border)]"
        role="progressbar"
        aria-valuenow={safeValue}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-[4px] bg-[var(--accent)]"
          style={{ width: `${safeValue}%` }}
        />
      </div>
    </div>
  );
}
