import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { AdminTable } from './AdminTable';
import type { AdminColumn } from './AdminTable';
import { Modal } from './Modal';
import { Button } from '../ui/Button';
import { FormField, inputClasses } from '../ui/FormField';
import { api, ApiError } from '../../lib/api';

export type AdminFieldType = 'text' | 'textarea' | 'number' | 'checkbox' | 'select' | 'date' | 'tags' | 'url';

export interface AdminFieldOption {
  value: string;
  label: string;
}

export interface AdminFieldConfig {
  name: string;
  label: string;
  type: AdminFieldType;
  required?: boolean;
  hint?: string;
  options?: AdminFieldOption[];
  placeholder?: string;
  rows?: number;
}

export type AdminFormValues = Record<string, string | boolean>;

interface AdminCrudPageProps<TRow extends { id: string }> {
  title: string;
  description: string;
  addButtonLabel: string;
  /** GET/POST endpoint, e.g. '/innovations'. */
  listEndpoint: string;
  /** Key in the GET response holding the array, e.g. 'innovations'. */
  listKey: string;
  /** PUT/DELETE endpoint for a single row, e.g. (id) => `/innovations/${id}`. */
  itemPath: (id: string) => string;
  columns: AdminColumn<TRow>[];
  fields: AdminFieldConfig[];
  getInitialValues: (row?: TRow) => AdminFormValues;
  toPayload: (values: AdminFormValues) => unknown;
  emptyMessage: string;
  formTitleFor: (isEdit: boolean) => string;
  /** Human-readable label for a row, used in the delete confirmation and edit/delete aria-labels. */
  rowLabel: (row: TRow) => string;
}

function AdminFieldInput({
  field,
  value,
  onChange,
}: {
  field: AdminFieldConfig;
  value: string | boolean | undefined;
  onChange: (value: string | boolean) => void;
}) {
  const id = `admin-field-${field.name}`;

  if (field.type === 'checkbox') {
    return (
      <label htmlFor={id} className="flex items-center gap-2.5 text-sm font-medium text-ink dark:text-ink-onDark">
        <input
          id={id}
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 rounded border-primary-300 text-accent focus:outline-none focus:ring-2 focus:ring-accent/30 dark:border-primary-600"
        />
        {field.label}
      </label>
    );
  }

  const stringValue = typeof value === 'string' ? value : '';

  return (
    <FormField label={field.label} htmlFor={id} required={field.required} hint={field.hint}>
      {field.type === 'textarea' ? (
        <textarea
          id={id}
          required={field.required}
          rows={field.rows ?? 4}
          value={stringValue}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={inputClasses}
        />
      ) : field.type === 'select' ? (
        <select
          id={id}
          required={field.required}
          value={stringValue}
          onChange={(e) => onChange(e.target.value)}
          className={inputClasses}
        >
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          type={field.type === 'tags' ? 'text' : field.type}
          required={field.required}
          value={stringValue}
          placeholder={field.placeholder}
          step={field.type === 'number' ? 'any' : undefined}
          onChange={(e) => onChange(e.target.value)}
          className={inputClasses}
        />
      )}
    </FormField>
  );
}

/**
 * Generic list + create/edit-modal + delete-confirm-modal page, shared by
 * every admin content-type screen (innovations, early interventions,
 * news/events, team, testimonials, volunteer opportunities). A modal form
 * was chosen over separate create/edit routes because every entity's data is
 * already in memory after the list fetch — a modal can prefill instantly
 * from the row, where a route-based form would need its own fetch-by-id
 * round trip for edits, for no real UX benefit here. Contact messages and
 * volunteer hour approvals don't use this component since neither has a
 * create/edit form, just row actions — see AdminContactMessages/
 * AdminVolunteerHours for those.
 */
export function AdminCrudPage<TRow extends { id: string }>({
  title,
  description,
  addButtonLabel,
  listEndpoint,
  listKey,
  itemPath,
  columns,
  fields,
  getInitialValues,
  toPayload,
  emptyMessage,
  formTitleFor,
  rowLabel,
}: AdminCrudPageProps<TRow>) {
  const [rows, setRows] = useState<TRow[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editingRow, setEditingRow] = useState<TRow | 'new' | null>(null);
  const [formValues, setFormValues] = useState<AdminFormValues>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [pendingDelete, setPendingDelete] = useState<TRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const loadRows = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await api.get<Record<string, TRow[]>>(listEndpoint);
      setRows(result[listKey] ?? []);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Couldn't load this data. Please try again.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [listEndpoint, listKey]);

  useEffect(() => {
    loadRows();
  }, [loadRows]);

  function openCreate() {
    setFormValues(getInitialValues());
    setFormError(null);
    setEditingRow('new');
  }

  function openEdit(row: TRow) {
    setFormValues(getInitialValues(row));
    setFormError(null);
    setEditingRow(row);
  }

  function closeForm() {
    setEditingRow(null);
    setFormError(null);
  }

  function setFieldValue(name: string, value: string | boolean) {
    setFormValues((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);

    for (const field of fields) {
      if (field.required && field.type !== 'checkbox') {
        const value = formValues[field.name];
        if (typeof value !== 'string' || value.trim() === '') {
          setFormError(`${field.label} is required.`);
          return;
        }
      }
    }

    setIsSubmitting(true);
    try {
      const payload = toPayload(formValues);
      if (editingRow === 'new') {
        await api.post(listEndpoint, payload);
      } else if (editingRow) {
        await api.put(itemPath(editingRow.id), payload);
      }
      await loadRows();
      closeForm();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Something went wrong saving this. Please try again.';
      setFormError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await api.del(itemPath(pendingDelete.id));
      setPendingDelete(null);
      await loadRows();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Couldn't delete this item. Please try again.";
      setDeleteError(message);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary dark:text-white">{title}</h2>
          <p className="mt-1 text-sm text-ink-soft dark:text-ink-onDarkSoft">{description}</p>
        </div>
        <Button variant="accent" size="sm" onClick={openCreate} className="self-start sm:self-auto">
          <Plus className="h-4 w-4" aria-hidden="true" />
          {addButtonLabel}
        </Button>
      </div>

      <div className="mt-6">
        <AdminTable
          columns={columns}
          rows={rows}
          keyFor={(row) => row.id}
          isLoading={isLoading}
          error={error}
          onRetry={loadRows}
          emptyMessage={emptyMessage}
          actions={(row) => (
            <div className="flex justify-end gap-1.5">
              <button
                type="button"
                onClick={() => openEdit(row)}
                aria-label={`Edit ${rowLabel(row)}`}
                className="flex h-8 w-8 items-center justify-center rounded-full text-primary transition-colors hover:bg-primary-50 dark:text-ink-onDark dark:hover:bg-surface-dark"
              >
                <Pencil className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setDeleteError(null);
                  setPendingDelete(row);
                }}
                aria-label={`Delete ${rowLabel(row)}`}
                className="flex h-8 w-8 items-center justify-center rounded-full text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          )}
        />
      </div>

      {editingRow !== null && (
        <Modal title={formTitleFor(editingRow === 'new')} onClose={closeForm}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {fields.map((field) => (
              <AdminFieldInput
                key={field.name}
                field={field}
                value={formValues[field.name]}
                onChange={(value) => setFieldValue(field.name, value)}
              />
            ))}
            {formError && (
              <p role="alert" className="text-sm font-medium text-red-600 dark:text-red-400">
                {formError}
              </p>
            )}
            <div className="mt-2 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={closeForm}>
                Cancel
              </Button>
              <Button type="submit" variant="accent" disabled={isSubmitting}>
                {isSubmitting ? 'Saving…' : 'Save'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {pendingDelete && (
        <Modal title="Delete item" onClose={() => setPendingDelete(null)} maxWidthClassName="max-w-sm">
          <p className="text-sm text-ink-soft dark:text-ink-onDarkSoft">
            Are you sure you want to delete{' '}
            <strong className="text-ink dark:text-ink-onDark">{rowLabel(pendingDelete)}</strong>? This cannot be
            undone.
          </p>
          {deleteError && (
            <p role="alert" className="mt-3 text-sm font-medium text-red-600 dark:text-red-400">
              {deleteError}
            </p>
          )}
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
