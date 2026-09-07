import type { ApiVolunteerOpportunity } from '../../types';
import { AdminCrudPage } from '../../components/admin/AdminCrudPage';
import type { AdminFieldConfig, AdminFormValues } from '../../components/admin/AdminCrudPage';
import { splitTags, joinTags } from '../../components/admin/adminFormUtils';
import { Badge } from '../../components/ui/Badge';
import { SEO } from '../../components/SEO';

const FIELDS: AdminFieldConfig[] = [
  { name: 'title', label: 'Title', type: 'text', required: true },
  { name: 'description', label: 'Description', type: 'textarea', required: true, rows: 5 },
  { name: 'category', label: 'Category', type: 'text', required: true },
  { name: 'location', label: 'Location', type: 'text', required: true },
  { name: 'isRemote', label: 'Remote', type: 'checkbox' },
  { name: 'spotsAvailable', label: 'Spots available', type: 'number', required: true },
  { name: 'tags', label: 'Tags', type: 'tags', hint: 'Comma-separated' },
];

function getInitialValues(row?: ApiVolunteerOpportunity): AdminFormValues {
  return {
    title: row?.title ?? '',
    description: row?.description ?? '',
    category: row?.category ?? '',
    location: row?.location ?? '',
    isRemote: row?.isRemote ?? false,
    spotsAvailable: row ? String(row.spotsAvailable) : '1',
    tags: joinTags(row?.tags),
  };
}

function toPayload(values: AdminFormValues) {
  return {
    title: values.title,
    description: values.description,
    category: values.category,
    location: values.location,
    isRemote: Boolean(values.isRemote),
    spotsAvailable: Number(values.spotsAvailable),
    tags: splitTags(values.tags),
  };
}

export function AdminVolunteerOpportunities() {
  return (
    <>
      <SEO title="Admin — Volunteer Opportunities" noindex />
      <AdminCrudPage<ApiVolunteerOpportunity>
        title="Volunteer Opportunities"
        description="Roles shown on the public Volunteer page."
        addButtonLabel="Add Opportunity"
        listEndpoint="/volunteer/opportunities"
        listKey="opportunities"
        itemPath={(id) => `/volunteer/opportunities/${id}`}
        columns={[
          { header: 'Title', render: (row) => <span className="font-medium">{row.title}</span> },
          { header: 'Category', render: (row) => <Badge>{row.category}</Badge> },
          { header: 'Location', render: (row) => (row.isRemote ? 'Remote' : row.location) },
          { header: 'Spots', render: (row) => row.spotsAvailable },
        ]}
        fields={FIELDS}
        getInitialValues={getInitialValues}
        toPayload={toPayload}
        emptyMessage="No volunteer opportunities yet — add the first one to get started."
        formTitleFor={(isEdit) => (isEdit ? 'Edit Opportunity' : 'Add Opportunity')}
        rowLabel={(row) => row.title}
      />
    </>
  );
}
