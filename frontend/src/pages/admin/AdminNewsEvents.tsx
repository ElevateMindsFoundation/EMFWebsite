import type { ApiNewsEvent } from '../../types';
import { AdminCrudPage } from '../../components/admin/AdminCrudPage';
import type { AdminFieldConfig, AdminFormValues } from '../../components/admin/AdminCrudPage';
import { emptyToNull, dateInputToIsoOrNull, isoToDateInput } from '../../components/admin/adminFormUtils';
import { Badge } from '../../components/ui/Badge';
import { SEO } from '../../components/SEO';
import { formatDate } from '../../utils/date';

const TYPE_OPTIONS = [
  { value: 'NEWS', label: 'News' },
  { value: 'EVENT', label: 'Event' },
];

const FIELDS: AdminFieldConfig[] = [
  { name: 'title', label: 'Title', type: 'text', required: true },
  { name: 'body', label: 'Body', type: 'textarea', required: true, rows: 6 },
  { name: 'type', label: 'Type', type: 'select', required: true, options: TYPE_OPTIONS },
  { name: 'eventDate', label: 'Event date', type: 'date', hint: 'Only used for events' },
  { name: 'imageUrl', label: 'Image URL', type: 'url' },
  { name: 'isFeatured', label: 'Featured', type: 'checkbox' },
];

function getInitialValues(row?: ApiNewsEvent): AdminFormValues {
  return {
    title: row?.title ?? '',
    body: row?.body ?? '',
    type: row?.type ?? 'NEWS',
    eventDate: isoToDateInput(row?.eventDate),
    imageUrl: row?.imageUrl ?? '',
    isFeatured: row?.isFeatured ?? false,
  };
}

function toPayload(values: AdminFormValues) {
  return {
    title: values.title,
    body: values.body,
    type: values.type,
    eventDate: dateInputToIsoOrNull(values.eventDate),
    imageUrl: emptyToNull(values.imageUrl),
    isFeatured: Boolean(values.isFeatured),
  };
}

export function AdminNewsEvents() {
  return (
    <>
      <SEO title="Admin — News & Events" noindex />
      <AdminCrudPage<ApiNewsEvent>
        title="News & Events"
        description="Posts shown on the public News & Events page."
        addButtonLabel="Add Post"
        listEndpoint="/news-events"
        listKey="items"
        itemPath={(id) => `/news-events/${id}`}
        columns={[
          { header: 'Title', render: (row) => <span className="font-medium">{row.title}</span> },
          { header: 'Type', render: (row) => <Badge tone={row.type === 'EVENT' ? 'accent' : 'primary'}>{row.type}</Badge> },
          { header: 'Event Date', render: (row) => (row.eventDate ? formatDate(row.eventDate.slice(0, 10)) : '—') },
          { header: 'Featured', render: (row) => (row.isFeatured ? 'Yes' : 'No') },
        ]}
        fields={FIELDS}
        getInitialValues={getInitialValues}
        toPayload={toPayload}
        emptyMessage="No news or events yet — add the first post to get started."
        formTitleFor={(isEdit) => (isEdit ? 'Edit Post' : 'Add Post')}
        rowLabel={(row) => row.title}
      />
    </>
  );
}
