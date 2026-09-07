import type { ApiTestimonial } from '../../types';
import { AdminCrudPage } from '../../components/admin/AdminCrudPage';
import type { AdminFieldConfig, AdminFormValues } from '../../components/admin/AdminCrudPage';
import { emptyToNull } from '../../components/admin/adminFormUtils';
import { SEO } from '../../components/SEO';

const FIELDS: AdminFieldConfig[] = [
  { name: 'authorName', label: 'Author name', type: 'text', required: true },
  { name: 'relationship', label: 'Relationship', type: 'text', required: true, placeholder: 'e.g. Parent, Teacher' },
  { name: 'quote', label: 'Quote', type: 'textarea', required: true, rows: 5 },
  { name: 'photoUrl', label: 'Photo URL', type: 'url' },
  { name: 'isFeatured', label: 'Featured', type: 'checkbox' },
];

function getInitialValues(row?: ApiTestimonial): AdminFormValues {
  return {
    authorName: row?.authorName ?? '',
    relationship: row?.relationship ?? '',
    quote: row?.quote ?? '',
    photoUrl: row?.photoUrl ?? '',
    isFeatured: row?.isFeatured ?? false,
  };
}

function toPayload(values: AdminFormValues) {
  return {
    authorName: values.authorName,
    relationship: values.relationship,
    quote: values.quote,
    photoUrl: emptyToNull(values.photoUrl),
    isFeatured: Boolean(values.isFeatured),
  };
}

export function AdminTestimonials() {
  return (
    <>
      <SEO title="Admin — Testimonials" noindex />
      <AdminCrudPage<ApiTestimonial>
        title="Testimonials"
        description="Quotes shown across the public site's testimonial sections."
        addButtonLabel="Add Testimonial"
        listEndpoint="/testimonials"
        listKey="testimonials"
        itemPath={(id) => `/testimonials/${id}`}
        columns={[
          { header: 'Author', render: (row) => <span className="font-medium">{row.authorName}</span> },
          { header: 'Relationship', render: (row) => row.relationship },
          { header: 'Featured', render: (row) => (row.isFeatured ? 'Yes' : 'No') },
        ]}
        fields={FIELDS}
        getInitialValues={getInitialValues}
        toPayload={toPayload}
        emptyMessage="No testimonials yet — add the first one to get started."
        formTitleFor={(isEdit) => (isEdit ? 'Edit Testimonial' : 'Add Testimonial')}
        rowLabel={(row) => row.authorName}
      />
    </>
  );
}
