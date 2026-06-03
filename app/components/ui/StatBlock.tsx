type StatBlockProps = {
  label: string;
  value: string | number;
  delta?: string;
  deltaTone?: "positive" | "negative" | "neutral";
  className?: string;
};

const deltaColor = {
  positive: "text-[var(--success)]",
  negative: "text-[var(--danger)]",
  neutral: "text-[var(--text-secondary)]",
};

export function StatBlock({
  label,
  value,
  delta,
  deltaTone = "positive",
  className = "",
}: StatBlockProps) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <span className="text-[12px] font-medium text-[var(--text-secondary)]">{label}</span>
      <span className="text-[24px] font-bold leading-tight text-[var(--text-primary)]">{value}</span>
      {delta ? (
        <span className={`text-[12px] font-medium ${deltaColor[deltaTone]}`}>
          {delta}
        </span>
      ) : null}
    </div>
  );
}
