import { useCallback, useEffect, useState } from 'react';
import { Check, Trash2, X } from 'lucide-react';
import type { ApiStory, ApiStoryStatus } from '../../types';
import { AdminTable } from '../../components/admin/AdminTable';
import { Modal } from '../../components/admin/Modal';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { SEO } from '../../components/SEO';
import { api, ApiError } from '../../lib/api';
import { formatDate } from '../../utils/date';

const STATUS_FILTERS: { value: ApiStoryStatus | 'ALL'; label: string }[] = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'ALL', label: 'All' },
];

const STATUS_TONE = { PENDING: 'primary', APPROVED: 'success', REJECTED: 'neutral' } as const;

/**
 * Moderation queue for community-submitted stories. Like contact messages and
 * volunteer hours, this has no create/edit form — visitors submit stories via
 * the public Stories page — so it uses AdminTable directly with per-row
 * Approve / Reject / Delete actions rather than AdminCrudPage.
 */
export function AdminStories() {
  const [statusFilter, setStatusFilter] = useState<ApiStoryStatus | 'ALL'>('PENDING');
  const [stories, setStories] = useState<ApiStory[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ApiStory | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [viewing, setViewing] = useState<ApiStory | null>(null);

  const loadStories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const query = statusFilter === 'ALL' ? '' : `?status=${statusFilter}`;
      const result = await api.get<{ stories: ApiStory[] }>(`/stories/all${query}`);
      setStories(result.stories);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Couldn't load stories. The server may be unavailable.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadStories();
  }, [loadStories]);

  async function moderate(id: string, status: 'APPROVED' | 'REJECTED') {
    setActionError(null);
    setActioningId(id);
    try {
      await api.post(`/stories/${id}/moderate`, { status });
      await loadStories();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Couldn't update this story.");
    } finally {
      setActioningId(null);
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setIsDeleting(true);
    setActionError(null);
    try {
      await api.del(`/stories/${pendingDelete.id}`);
      setPendingDelete(null);
      await loadStories();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Couldn't delete this story.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div>
      <SEO title="Admin — Stories" noindex />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary dark:text-white">Stories</h2>
          <p className="mt-1 text-sm text-ink-soft dark:text-ink-onDarkSoft">
            Review community-submitted stories. Approved stories appear on the public Stories page.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setStatusFilter(f.value)}
              aria-pressed={statusFilter === f.value}
              className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                statusFilter === f.value
                  ? 'border-primary bg-primary text-white'
                  : 'border-primary-200 text-ink-soft hover:bg-primary-50 dark:border-primary-700 dark:text-ink-onDarkSoft dark:hover:bg-surface-dark-muted'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {actionError && (
        <p role="alert" className="mt-4 text-sm font-medium text-red-600 dark:text-red-400">
          {actionError}
        </p>
      )}

      <div className="mt-6">
        <AdminTable
          columns={[
            {
              header: 'Story',
              render: (row) => (
                <button
                  type="button"
                  onClick={() => setViewing(row)}
                  className="text-left font-medium text-primary underline-offset-2 hover:underline dark:text-ink-onDark"
                >
                  {row.title}
                </button>
              ),
            },
            {
              header: 'Author',
              render: (row) => (
                <div>
                  <p>{row.authorName}</p>
                  {row.authorEmail && (
                    <p className="text-xs text-ink-soft dark:text-ink-onDarkSoft">{row.authorEmail}</p>
                  )}
                </div>
              ),
            },
            { header: 'Submitted', render: (row) => formatDate(row.createdAt.slice(0, 10)) },
            { header: 'Status', render: (row) => <Badge tone={STATUS_TONE[row.status]}>{row.status}</Badge> },
          ]}
          rows={stories}
          keyFor={(row) => row.id}
          isLoading={isLoading}
          error={error}
          onRetry={loadStories}
          emptyMessage="No stories match this filter."
          actions={(row) => (
            <div className="flex justify-end gap-1.5">
              {row.status !== 'APPROVED' && (
                <button
                  type="button"
                  onClick={() => moderate(row.id, 'APPROVED')}
                  disabled={actioningId === row.id}
                  aria-label={`Approve story "${row.title}"`}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-emerald-700 transition-colors hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-emerald-400 dark:hover:bg-emerald-900/20"
                >
                  <Check className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
              {row.status !== 'REJECTED' && (
                <button
                  type="button"
                  onClick={() => moderate(row.id, 'REJECTED')}
                  disabled={actioningId === row.id}
                  aria-label={`Reject story "${row.title}"`}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-amber-600 transition-colors hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-amber-400 dark:hover:bg-amber-900/20"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setActionError(null);
                  setPendingDelete(row);
                }}
                aria-label={`Delete story "${row.title}"`}
                className="flex h-8 w-8 items-center justify-center rounded-full text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          )}
        />
      </div>

      {viewing && (
        <Modal title={viewing.title} onClose={() => setViewing(null)}>
          <p className="text-xs font-semibold uppercase tracking-wide text-accent-600 dark:text-accent-light">
            {viewing.authorName}
            {viewing.authorEmail && <span className="ml-2 font-normal normal-case">· {viewing.authorEmail}</span>}
          </p>
          <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-ink-soft dark:text-ink-onDarkSoft">
            {viewing.body}
          </p>
        </Modal>
      )}

      {pendingDelete && (
        <Modal title="Delete story" onClose={() => setPendingDelete(null)} maxWidthClassName="max-w-sm">
          <p className="text-sm text-ink-soft dark:text-ink-onDarkSoft">
            Are you sure you want to delete{' '}
            <strong className="text-ink dark:text-ink-onDark">{pendingDelete.title}</strong>? This cannot be
            undone.
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setPendingDelete(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={confirmDelete}
              disabled={isDeleting}
              className="!bg-red-600 hover:!bg-red-700 dark:!bg-red-600 dark:hover:!bg-red-700"
            >
              {isDeleting ? 'Deleting…' : 'Delete'}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
