import { type ReactNode } from "react";

import { EmptyState } from "./EmptyState";
import { SkeletonRow } from "./SkeletonRow";

export type DataTableColumn<T> = {
  key: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  className?: string;
  headerClassName?: string;
  sortable?: boolean;
  sortDirection?: "asc" | "desc";
  onSort?: () => void;
};

type DataTableProps<T> = {
  columns: Array<DataTableColumn<T>>;
  data: T[];
  getRowKey: (row: T, index: number) => string;
  loading?: boolean;
  skeletonRows?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  className?: string;
};

export function DataTable<T>({
  columns,
  data,
  getRowKey,
  loading = false,
  skeletonRows = 5,
  emptyTitle = "No records found",
  emptyDescription,
  emptyAction,
  className = "",
}: DataTableProps<T>) {
  const hasRows = data.length > 0;

  return (
    <div className={`overflow-hidden rounded-[8px] border border-[var(--border)] bg-[var(--surface)] ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead className="bg-[var(--surface-2)] text-[12px] font-medium text-[var(--text-secondary)]">
            <tr className="h-10">
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={`px-4 text-left align-middle font-medium ${column.headerClassName ?? ""}`}
                >
                  {column.sortable ? (
                    <button
                      type="button"
                      onClick={column.onSort}
                      className="inline-flex items-center gap-1 rounded-[6px] text-[12px] font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
                    >
                      <span>{column.header}</span>
                      {column.sortDirection ? (
                        <span aria-hidden="true">{column.sortDirection}</span>
                      ) : null}
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-[14px] text-[var(--text-primary)]">
            {loading
              ? Array.from({ length: skeletonRows }).map((_, index) => (
                  <SkeletonRow key={index} columns={columns.length} />
                ))
              : null}

            {!loading && hasRows
              ? data.map((row, index) => (
                  <tr
                    key={getRowKey(row, index)}
                    className="h-12 border-b border-[var(--border)] transition-colors hover:bg-[var(--surface-2)]"
                  >
                    {columns.map((column) => (
                      <td key={column.key} className={`px-4 align-middle ${column.className ?? ""}`}>
                        {column.cell(row)}
                      </td>
                    ))}
                  </tr>
                ))
              : null}

            {!loading && !hasRows ? (
              <tr>
                <td colSpan={columns.length}>
                  <EmptyState
                    title={emptyTitle}
                    description={emptyDescription}
                    action={emptyAction}
                    className="border-0 bg-transparent"
                  />
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
