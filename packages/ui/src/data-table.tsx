import type { ReactNode } from "react";
import { cn } from "./cn";

export interface DataTableColumn<Row> {
  id: string;
  header: ReactNode;
  /** Konten sel; menerima baris. */
  cell: (row: Row) => ReactNode;
  /** Kelas tambahan untuk kolom (mis. `text-right`). */
  className?: string;
  /** Kolom kunci: tetap terlihat di layar sempit. */
  primary?: boolean;
}

export interface DataTableProps<Row> {
  columns: DataTableColumn<Row>[];
  rows: Row[];
  rowKey: (row: Row) => string;
  caption: string;
  emptyMessage?: string;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  actions?: (row: Row) => ReactNode;
  className?: string;
}

/**
 * Tabel data dasar (versi ringkas; versi penuh = T-186).
 *
 * State: default | loading (aria-busy + skeleton baris) | empty (pesan dalam tbody)
 * | error (role=alert + Coba lagi).
 */
export function DataTable<Row>({
  columns,
  rows,
  rowKey,
  caption,
  emptyMessage = "Belum ada data.",
  loading = false,
  error,
  onRetry,
  actions,
  className,
}: DataTableProps<Row>) {
  const colSpan = columns.length + (actions ? 1 : 0);

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {error && (
        <div
          role="alert"
          className="flex flex-wrap items-center gap-3 rounded-md border border-danger bg-danger-subtle p-4 text-sm text-danger"
        >
          {error}
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            >
              Coba lagi
            </button>
          )}
        </div>
      )}

      <div className="w-full overflow-x-auto rounded-md border border-border">
        <table
          aria-busy={loading || undefined}
          className="w-full border-collapse text-left text-sm"
        >
          <caption className="sr-only">{caption}</caption>
          <thead className="bg-surface-raised">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.id}
                  scope="col"
                  className={cn("border-b border-border px-4 py-3 font-medium text-fg-muted", col.className)}
                >
                  {col.header}
                </th>
              ))}
              {actions && (
                <th scope="col" className="border-b border-border px-4 py-3 font-medium text-fg-muted">
                  Aksi
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: colSpan }).map((__, j) => (
                    <td key={j} className="border-b border-border px-4 py-3">
                      <span className="block h-4 w-3/4 animate-pulse rounded bg-surface-raised" />
                    </td>
                  ))}
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={colSpan} className="px-4 py-8 text-center text-fg-muted">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={rowKey(row)} className="text-fg">
                  {columns.map((col) => (
                    <td
                      key={col.id}
                      className={cn(
                        "border-b border-border px-4 py-3 align-top",
                        col.primary ? "font-medium" : "text-fg-muted",
                        col.className,
                      )}
                    >
                      {col.cell(row)}
                    </td>
                  ))}
                  {actions && (
                    <td className="border-b border-border px-4 py-3 align-top">{actions(row)}</td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {loading && (
        <p role="status" className="text-sm text-fg-muted">
          Memuat data&hellip;
        </p>
      )}
    </div>
  );
}
