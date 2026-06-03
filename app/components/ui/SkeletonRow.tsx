type SkeletonRowProps = {
  columns?: number;
  cellClassName?: string;
};

export function SkeletonRow({ columns = 4, cellClassName = "" }: SkeletonRowProps) {
  return (
    <tr className="h-12 border-b border-[var(--border)]">
      {Array.from({ length: columns }).map((_, index) => (
        <td key={index} className={`px-4 py-3 ${cellClassName}`}>
          <div className="h-4 w-full animate-pulse rounded-[4px] bg-[var(--surface-2)]" />
        </td>
      ))}
    </tr>
  );
}
