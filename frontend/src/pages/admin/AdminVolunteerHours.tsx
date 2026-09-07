import { useCallback, useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
import type { ApiAdminVolunteerHourLog, ApiHourLogStatus } from '../../types';
import { AdminTable } from '../../components/admin/AdminTable';
import { Badge } from '../../components/ui/Badge';
import { SEO } from '../../components/SEO';
import { api, ApiError } from '../../lib/api';
import { formatDate } from '../../utils/date';

const STATUS_FILTERS: { value: ApiHourLogStatus | 'ALL'; label: string }[] = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'ALL', label: 'All' },
];

const STATUS_TONE = { PENDING: 'primary', APPROVED: 'success', REJECTED: 'neutral' } as const;

/**
 * Approval queue for volunteer-logged hours. Like contact messages, this has
 * no create/edit form — just a filtered list plus Approve/Reject actions per
 * row — so it uses AdminTable directly instead of AdminCrudPage.
 */
export function AdminVolunteerHours() {
  const [statusFilter, setStatusFilter] = useState<ApiHourLogStatus | 'ALL'>('PENDING');
  const [hourLogs, setHourLogs] = useState<ApiAdminVolunteerHourLog[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadHourLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const query = statusFilter === 'ALL' ? '' : `?status=${statusFilter}`;
      const result = await api.get<{ hourLogs: ApiAdminVolunteerHourLog[] }>(`/volunteer/hours/all${query}`);
      setHourLogs(result.hourLogs);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Couldn't load volunteer hour logs. The server may be unavailable.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadHourLogs();
  }, [loadHourLogs]);

  async function setStatus(id: string, status: 'APPROVED' | 'REJECTED') {
    setActionError(null);
    setActioningId(id);
    try {
      await api.post(`/volunteer/hours/${id}/approve`, { status });
      await loadHourLogs();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Couldn't update this hour log.");
    } finally {
      setActioningId(null);
    }
  }

  return (
    <div>
      <SEO title="Admin — Volunteer Hours" noindex />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary dark:text-white">Volunteer Hours</h2>
          <p className="mt-1 text-sm text-ink-soft dark:text-ink-onDarkSoft">
            Review and approve hours volunteers have logged.
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
              header: 'Volunteer',
              render: (row) =>
                row.user ? (
                  <div>
                    <p className="font-medium">
                      {row.user.firstName} {row.user.lastName}
                    </p>
                    <p className="text-xs text-ink-soft dark:text-ink-onDarkSoft">{row.user.email}</p>
                  </div>
                ) : (
                  <span className="text-ink-soft dark:text-ink-onDarkSoft">Account removed</span>
                ),
            },
            { header: 'Opportunity', render: (row) => row.opportunity.title },
            { header: 'Date', render: (row) => formatDate(row.date.slice(0, 10)) },
            { header: 'Hours', render: (row) => `${row.hours}h` },
            { header: 'Notes', render: (row) => row.notes ?? '—' },
            { header: 'Status', render: (row) => <Badge tone={STATUS_TONE[row.status]}>{row.status}</Badge> },
          ]}
          rows={hourLogs}
          keyFor={(row) => row.id}
          isLoading={isLoading}
          error={error}
          onRetry={loadHourLogs}
          emptyMessage="No volunteer hour logs match this filter."
          actions={(row) =>
            row.status === 'PENDING' ? (
              <div className="flex justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => setStatus(row.id, 'APPROVED')}
                  disabled={actioningId === row.id}
                  aria-label={`Approve hours logged by ${row.user ? `${row.user.firstName} ${row.user.lastName}` : 'this volunteer'}`}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-emerald-700 transition-colors hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-emerald-400 dark:hover:bg-emerald-900/20"
                >
                  <Check className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setStatus(row.id, 'REJECTED')}
                  disabled={actioningId === row.id}
                  aria-label={`Reject hours logged by ${row.user ? `${row.user.firstName} ${row.user.lastName}` : 'this volunteer'}`}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            ) : (
              <span className="text-xs text-ink-soft dark:text-ink-onDarkSoft">No actions</span>
            )
          }
        />
      </div>
    </div>
  );
}
