import type { ReactNode } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';

export interface AdminColumn<TRow> {
  header: string;
  render: (row: TRow) => ReactNode;
  className?: string;
}

interface AdminTableProps<TRow> {
  columns: AdminColumn<TRow>[];
  rows: TRow[] | null;
  keyFor: (row: TRow) => string;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  emptyMessage: string;
  actions?: (row: TRow) => ReactNode;
}

/**
 * Generic admin list table with the same loading/error/empty state pattern
 * used across the public-facing list pages (see pages/Innovations.tsx). The
 * table itself sits inside an `overflow-x-auto` wrapper rather than
 * collapsing to a card layout on small screens — the simpler of the two
 * options the Phase E brief allowed, and consistent with how wide content
 * (the testimonials rail, etc.) already scrolls horizontally elsewhere in
 * this app rather than reflowing.
 */
export function AdminTable<TRow>({
  columns,
  rows,
  keyFor,
  isLoading,
  error,
  onRetry,
  emptyMessage,
  actions,
}: AdminTableProps<TRow>) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-ink-soft dark:text-ink-onDarkSoft">
        <Loader2 className="h-6 w-6 animate-spin text-accent" aria-hidden="true" />
        <p className="text-sm">Loading…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-900 dark:bg-red-900/20">
        <AlertTriangle className="h-8 w-8 text-red-500 dark:text-red-400" aria-hidden="true" />
        <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      </div>
    );
  }

  if (!rows || rows.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-primary-200 py-12 text-center text-sm text-ink-soft dark:border-primary-700 dark:text-ink-onDarkSoft">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-primary-100 dark:border-primary-800">
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        <thead className="bg-surface-muted dark:bg-surface-dark-muted">
          <tr>
            {columns.map((col) => (
              <th
                key={col.header}
                scope="col"
                className={`px-4 py-3 font-semibold text-primary dark:text-white ${col.className ?? ''}`}
              >
                {col.header}
              </th>
            ))}
            {actions && (
              <th scope="col" className="px-4 py-3 text-right font-semibold text-primary dark:text-white">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-primary-100 bg-surface dark:divide-primary-800 dark:bg-surface-dark-muted">
          {rows.map((row) => (
            <tr key={keyFor(row)} className="align-top hover:bg-primary-50/50 dark:hover:bg-surface-dark/60">
              {columns.map((col) => (
                <td key={col.header} className={`px-4 py-3 text-ink dark:text-ink-onDark ${col.className ?? ''}`}>
                  {col.render(row)}
                </td>
              ))}
              {actions && <td className="px-4 py-3 text-right">{actions(row)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
