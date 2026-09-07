import type { ApiEarlyInterventionProgram } from '../../types';
import { AdminCrudPage } from '../../components/admin/AdminCrudPage';
import type { AdminFieldConfig, AdminFormValues } from '../../components/admin/AdminCrudPage';
import { splitTags, joinTags, dateInputToIsoOrNull, isoToDateInput } from '../../components/admin/adminFormUtils';
import { Badge } from '../../components/ui/Badge';
import { SEO } from '../../components/SEO';

const AUDIENCE_OPTIONS = [
  { value: 'CHILDREN', label: 'Children' },
  { value: 'YOUTH', label: 'Youth' },
  { value: 'FAMILIES', label: 'Families' },
];

const FIELDS: AdminFieldConfig[] = [
  { name: 'name', label: 'Name', type: 'text', required: true },
  { name: 'description', label: 'Description', type: 'textarea', required: true, rows: 5 },
  { name: 'audience', label: 'Audience', type: 'select', required: true, options: AUDIENCE_OPTIONS },
  { name: 'timelineText', label: 'Timeline', type: 'text', required: true, placeholder: 'e.g. 8-week program' },
  { name: 'successIndicators', label: 'Success indicators', type: 'tags', hint: 'Comma-separated' },
  { name: 'registrationOpen', label: 'Registration open', type: 'checkbox' },
  { name: 'startDate', label: 'Start date', type: 'date' },
  { name: 'endDate', label: 'End date', type: 'date' },
];

function getInitialValues(row?: ApiEarlyInterventionProgram): AdminFormValues {
  return {
    name: row?.name ?? '',
    description: row?.description ?? '',
    audience: row?.audience ?? 'CHILDREN',
    timelineText: row?.timelineText ?? '',
    successIndicators: joinTags(row?.successIndicators),
    registrationOpen: row?.registrationOpen ?? false,
    startDate: isoToDateInput(row?.startDate),
    endDate: isoToDateInput(row?.endDate),
  };
}

function toPayload(values: AdminFormValues) {
  return {
    name: values.name,
    description: values.description,
    audience: values.audience,
    timelineText: values.timelineText,
    successIndicators: splitTags(values.successIndicators),
    registrationOpen: Boolean(values.registrationOpen),
    startDate: dateInputToIsoOrNull(values.startDate),
    endDate: dateInputToIsoOrNull(values.endDate),
  };
}

export function AdminEarlyInterventions() {
  return (
    <>
      <SEO title="Admin — Early Interventions" noindex />
      <AdminCrudPage<ApiEarlyInterventionProgram>
        title="Early Intervention Programs"
        description="Programs shown on the public Early Interventions page."
        addButtonLabel="Add Program"
        listEndpoint="/early-interventions"
        listKey="programs"
        itemPath={(id) => `/early-interventions/${id}`}
        columns={[
          { header: 'Name', render: (row) => <span className="font-medium">{row.name}</span> },
          {
            header: 'Audience',
            render: (row) => <Badge>{AUDIENCE_OPTIONS.find((o) => o.value === row.audience)?.label ?? row.audience}</Badge>,
          },
          {
            header: 'Registration',
            render: (row) => <Badge tone={row.registrationOpen ? 'success' : 'neutral'}>{row.registrationOpen ? 'Open' : 'Closed'}</Badge>,
          },
          { header: 'Timeline', render: (row) => row.timelineText },
        ]}
        fields={FIELDS}
        getInitialValues={getInitialValues}
        toPayload={toPayload}
        emptyMessage="No programs yet — add the first one to get started."
        formTitleFor={(isEdit) => (isEdit ? 'Edit Program' : 'Add Program')}
        rowLabel={(row) => row.name}
      />
    </>
  );
}
