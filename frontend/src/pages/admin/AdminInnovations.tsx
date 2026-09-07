import type { ApiInnovation } from '../../types';
import { AdminCrudPage } from '../../components/admin/AdminCrudPage';
import type { AdminFieldConfig, AdminFormValues } from '../../components/admin/AdminCrudPage';
import { splitTags, joinTags, emptyToNull } from '../../components/admin/adminFormUtils';
import { Badge } from '../../components/ui/Badge';
import { SEO } from '../../components/SEO';

const DOMAINS = [
  'AI for Learning',
  'Assistive AI Devices',
  'Early Diagnosis & Intervention',
  'Community & Training',
  'Deaf & Hearing Support',
  'Non-Verbal / AAC Support',
];

const FIELDS: AdminFieldConfig[] = [
  { name: 'title', label: 'Title', type: 'text', required: true },
  { name: 'description', label: 'Description', type: 'textarea', required: true, rows: 5 },
  {
    name: 'domain',
    label: 'Domain',
    type: 'select',
    required: true,
    options: DOMAINS.map((d) => ({ value: d, label: d })),
  },
  { name: 'year', label: 'Year', type: 'number', required: true },
  { name: 'impactMetric', label: 'Impact metric', type: 'text', required: true, placeholder: 'e.g. 200+ children served' },
  { name: 'images', label: 'Image URLs', type: 'tags', hint: 'Comma-separated URLs' },
  { name: 'videoUrl', label: 'Video URL', type: 'url' },
  { name: 'teamMembers', label: 'Team members', type: 'tags', hint: 'Comma-separated names' },
];

function getInitialValues(row?: ApiInnovation): AdminFormValues {
  return {
    title: row?.title ?? '',
    description: row?.description ?? '',
    domain: row?.domain ?? DOMAINS[0],
    year: row ? String(row.year) : String(new Date().getFullYear()),
    impactMetric: row?.impactMetric ?? '',
    images: joinTags(row?.images),
    videoUrl: row?.videoUrl ?? '',
    teamMembers: joinTags(row?.teamMembers),
  };
}

function toPayload(values: AdminFormValues) {
  return {
    title: values.title,
    description: values.description,
    domain: values.domain,
    year: Number(values.year),
    impactMetric: values.impactMetric,
    images: splitTags(values.images),
    videoUrl: emptyToNull(values.videoUrl),
    teamMembers: splitTags(values.teamMembers),
  };
}

export function AdminInnovations() {
  return (
    <>
      <SEO title="Admin — Innovations" noindex />
      <AdminCrudPage<ApiInnovation>
        title="Innovations"
        description="The AI-powered tools and programs shown on the public Innovations page."
        addButtonLabel="Add Innovation"
        listEndpoint="/innovations"
        listKey="innovations"
        itemPath={(id) => `/innovations/${id}`}
        columns={[
          { header: 'Title', render: (row) => <span className="font-medium">{row.title}</span> },
          { header: 'Domain', render: (row) => <Badge>{row.domain}</Badge> },
          { header: 'Year', render: (row) => row.year },
          { header: 'Impact Metric', render: (row) => row.impactMetric },
        ]}
        fields={FIELDS}
        getInitialValues={getInitialValues}
        toPayload={toPayload}
        emptyMessage="No innovations yet — add the first one to get started."
        formTitleFor={(isEdit) => (isEdit ? 'Edit Innovation' : 'Add Innovation')}
        rowLabel={(row) => row.title}
      />
    </>
  );
}
