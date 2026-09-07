import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Eye } from 'lucide-react';
import type { ApiContactMessage } from '../../types';
import { AdminTable } from '../../components/admin/AdminTable';
import { Modal } from '../../components/admin/Modal';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { SEO } from '../../components/SEO';
import { api, ApiError } from '../../lib/api';
import { formatDate } from '../../utils/date';

function summarize(message: string, maxLength = 80): string {
  if (message.length <= maxLength) return message;
  return `${message.slice(0, maxLength).trimEnd()}…`;
}

/**
 * Contact messages have no create/edit form (they're submitted by visitors
 * via the public Contact page), so this page uses AdminTable directly rather
 * than AdminCrudPage — only a list, a "view full message" modal, and a
 * mark-as-read action.
 */
export function AdminContactMessages() {
  const [messages, setMessages] = useState<ApiContactMessage[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewing, setViewing] = useState<ApiContactMessage | null>(null);
  const [markingReadId, setMarkingReadId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadMessages = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await api.get<{ messages: ApiContactMessage[] }>('/contact');
      setMessages(result.messages);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Couldn't load contact messages. The server may be unavailable.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  async function markAsRead(id: string) {
    setActionError(null);
    setMarkingReadId(id);
    try {
      await api.post(`/contact/${id}/read`);
      setMessages((prev) => (prev ? prev.map((m) => (m.id === id ? { ...m, isRead: true } : m)) : prev));
      setViewing((prev) => (prev && prev.id === id ? { ...prev, isRead: true } : prev));
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Couldn't mark this message as read.");
    } finally {
      setMarkingReadId(null);
    }
  }

  return (
    <div>
      <SEO title="Admin — Contact Messages" noindex />
      <div>
        <h2 className="text-2xl font-bold text-primary dark:text-white">Contact Messages</h2>
        <p className="mt-1 text-sm text-ink-soft dark:text-ink-onDarkSoft">
          Messages submitted through the public Contact page.
        </p>
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
              header: 'From',
              render: (row) => (
                <div>
                  <p className="font-medium">{row.name}</p>
                  <p className="text-xs text-ink-soft dark:text-ink-onDarkSoft">{row.email}</p>
                </div>
              ),
            },
            { header: 'Subject', render: (row) => row.subject },
            { header: 'Message', render: (row) => summarize(row.message) },
            { header: 'Received', render: (row) => formatDate(row.submittedAt.slice(0, 10)) },
            {
              header: 'Status',
              render: (row) => <Badge tone={row.isRead ? 'success' : 'accent'}>{row.isRead ? 'Read' : 'Unread'}</Badge>,
            },
          ]}
          rows={messages}
          keyFor={(row) => row.id}
          isLoading={isLoading}
          error={error}
          onRetry={loadMessages}
          emptyMessage="No contact messages yet."
          actions={(row) => (
            <div className="flex justify-end gap-1.5">
              <button
                type="button"
                onClick={() => setViewing(row)}
                aria-label={`View message from ${row.name}`}
                className="flex h-8 w-8 items-center justify-center rounded-full text-primary transition-colors hover:bg-primary-50 dark:text-ink-onDark dark:hover:bg-surface-dark"
              >
                <Eye className="h-4 w-4" aria-hidden="true" />
              </button>
              {!row.isRead && (
                <button
                  type="button"
                  onClick={() => markAsRead(row.id)}
                  disabled={markingReadId === row.id}
                  aria-label={`Mark message from ${row.name} as read`}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-emerald-700 transition-colors hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-emerald-400 dark:hover:bg-emerald-900/20"
                >
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </div>
          )}
        />
      </div>

      {viewing && (
        <Modal title={viewing.subject} onClose={() => setViewing(null)}>
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium text-ink dark:text-ink-onDark">{viewing.name}</span>
              <span className="text-ink-soft dark:text-ink-onDarkSoft">&lt;{viewing.email}&gt;</span>
              <Badge tone={viewing.isRead ? 'success' : 'accent'}>{viewing.isRead ? 'Read' : 'Unread'}</Badge>
            </div>
            <p className="text-xs text-ink-soft dark:text-ink-onDarkSoft">
              Received {formatDate(viewing.submittedAt.slice(0, 10))}
            </p>
            <p className="whitespace-pre-wrap rounded-xl border border-primary-100 bg-surface-muted p-4 text-ink dark:border-primary-800 dark:bg-surface-dark dark:text-ink-onDark">
              {viewing.message}
            </p>
            <div className="mt-2 flex justify-end gap-3">
              {!viewing.isRead && (
                <Button
                  type="button"
                  variant="accent"
                  size="sm"
                  onClick={() => markAsRead(viewing.id)}
                  disabled={markingReadId === viewing.id}
                >
                  {markingReadId === viewing.id ? 'Marking…' : 'Mark as Read'}
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
