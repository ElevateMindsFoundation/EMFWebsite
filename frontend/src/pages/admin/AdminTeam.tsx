import type { ApiTeamMember } from '../../types';
import { AdminCrudPage } from '../../components/admin/AdminCrudPage';
import type { AdminFieldConfig, AdminFormValues } from '../../components/admin/AdminCrudPage';
import { emptyToNull } from '../../components/admin/adminFormUtils';
import { SEO } from '../../components/SEO';

const FIELDS: AdminFieldConfig[] = [
  { name: 'name', label: 'Name', type: 'text', required: true },
  { name: 'title', label: 'Title', type: 'text', required: true, placeholder: 'e.g. Executive Director' },
  { name: 'bio', label: 'Bio', type: 'textarea', required: true, rows: 5 },
  { name: 'photoUrl', label: 'Photo URL', type: 'url' },
  { name: 'sortOrder', label: 'Sort order', type: 'number', hint: 'Lower numbers appear first' },
];

function getInitialValues(row?: ApiTeamMember): AdminFormValues {
  return {
    name: row?.name ?? '',
    title: row?.title ?? '',
    bio: row?.bio ?? '',
    photoUrl: row?.photoUrl ?? '',
    sortOrder: row ? String(row.sortOrder) : '0',
  };
}

function toPayload(values: AdminFormValues) {
  return {
    name: values.name,
    title: values.title,
    bio: values.bio,
    photoUrl: emptyToNull(values.photoUrl),
    sortOrder: values.sortOrder ? Number(values.sortOrder) : 0,
  };
}

export function AdminTeam() {
  return (
    <>
      <SEO title="Admin — Team" noindex />
      <AdminCrudPage<ApiTeamMember>
        title="Team"
        description="Team members shown on the public About page."
        addButtonLabel="Add Team Member"
        listEndpoint="/team"
        listKey="members"
        itemPath={(id) => `/team/${id}`}
        columns={[
          { header: 'Name', render: (row) => <span className="font-medium">{row.name}</span> },
          { header: 'Title', render: (row) => row.title },
          { header: 'Sort Order', render: (row) => row.sortOrder },
        ]}
        fields={FIELDS}
        getInitialValues={getInitialValues}
        toPayload={toPayload}
        emptyMessage="No team members yet — add the first one to get started."
        formTitleFor={(isEdit) => (isEdit ? 'Edit Team Member' : 'Add Team Member')}
        rowLabel={(row) => row.name}
      />
    </>
  );
}
