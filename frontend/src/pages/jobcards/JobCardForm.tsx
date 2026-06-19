import { vehicleApi, trailerApi, workshopApi, jobCardApi } from '../../api/resources';
import { CrudFormPage, type FormSectionDef } from '../crud/CrudFormPage';
import type { JobCard } from '../../types/entities';
import type { FieldDef } from '../../components/Form';
import { SearchableCombobox } from '../../components/common/SearchableCombobox';

const JOB_DETAILS_FIELDS: FieldDef<JobCard>[] = [
  { name: 'job_card_no', label: 'Job Card No', required: true },
  {
    name: 'job_card_type', label: 'Job Card Type', type: 'select', required: true,
    options: ['Scheduled', 'Breakdown', 'Accident', 'Inspection', 'Tyre', 'Accessory', 'Trailer', 'Consumable'].map((v) => ({ value: v, label: v })),
  },
  { name: 'vehicle_id', label: 'Vehicle' },
  { name: 'trailer_id', label: 'Trailer' },
  { name: 'reported_datetime', label: 'Reported Date/Time', type: 'datetime-local', required: true },
  { name: 'odometer_km', label: 'Odometer (km)', type: 'number', min: 0 },
  { name: 'defect_summary', label: 'Issue Description', type: 'textarea', required: true },
  { name: 'priority', label: 'Priority', type: 'select', required: true, options: ['Low', 'Medium', 'High', 'Urgent'].map((v) => ({ value: v, label: v })) },
  {
    name: 'status', label: 'Status', type: 'select',
    options: ['Open', 'Assigned', 'Diagnosis', 'AwaitingParts', 'UnderRepair', 'QC', 'Completed', 'Closed', 'Reopened', 'Cancelled'].map((v) => ({ value: v, label: v })),
  },
];

const WORKSHOP_FIELDS: FieldDef<JobCard>[] = [
  { name: 'workshop_id', label: 'Workshop' },
  { name: 'opened_at', label: 'Opened At', type: 'datetime-local', required: true },
  { name: 'closed_at', label: 'Closed At', type: 'datetime-local' },
];

const COST_FIELDS: FieldDef<JobCard>[] = [
  { name: 'estimated_amount', label: 'Estimated Amount', type: 'number', min: 0 },
  { name: 'approved_amount', label: 'Approved Amount', type: 'number', min: 0 },
  { name: 'actual_amount', label: 'Actual Amount', type: 'number', min: 0 },
];

const SECTIONS: FormSectionDef<JobCard>[] = [
  { title: 'Job Details', fields: JOB_DETAILS_FIELDS },
  { title: 'Workshop Details', fields: WORKSHOP_FIELDS },
  { title: 'Labour & Cost', fields: COST_FIELDS },
];

function validate(values: Partial<JobCard>): Record<string, string> {
  const errors: Record<string, string> = {};
  if (values.estimated_amount != null && values.estimated_amount < 0) errors.estimated_amount = 'Cannot be negative';
  if (values.approved_amount != null && values.approved_amount < 0) errors.approved_amount = 'Cannot be negative';
  if (values.actual_amount != null && values.actual_amount < 0) errors.actual_amount = 'Cannot be negative';
  if (values.odometer_km != null && values.odometer_km < 0) errors.odometer_km = 'Cannot be negative';
  if (values.opened_at && values.closed_at && values.closed_at < values.opened_at) {
    errors.closed_at = 'Closed date cannot be earlier than opened date';
  }
  return errors;
}

export default function JobCardForm() {
  const now = new Date().toISOString().slice(0, 16);
  return (
    <CrudFormPage<JobCard>
      title="Job Card"
      basePath="/job-cards"
      fields={[...JOB_DETAILS_FIELDS, ...WORKSHOP_FIELDS, ...COST_FIELDS]}
      sections={SECTIONS}
      renderers={{
        vehicle_id: (value, onChange) => (
          <SearchableCombobox
            value={(value as string) ?? ''}
            onChange={onChange}
            loadOptions={async (q) => {
              const res = await vehicleApi.list({ page: 1, pageSize: 20, q });
              return res.items.map((v) => ({ value: v.vehicle_id, label: v.registration_no }));
            }}
            placeholder="Search vehicle..."
          />
        ),
        trailer_id: (value, onChange) => (
          <SearchableCombobox
            value={(value as string) ?? ''}
            onChange={onChange}
            loadOptions={async (q) => {
              const res = await trailerApi.list({ page: 1, pageSize: 20, q });
              return res.items.map((t) => ({ value: t.trailer_id, label: t.trailer_no }));
            }}
            placeholder="Search trailer..."
          />
        ),
        workshop_id: (value, onChange) => (
          <SearchableCombobox
            value={(value as string) ?? ''}
            onChange={onChange}
            loadOptions={async (q) => {
              const res = await workshopApi.list({ page: 1, pageSize: 20, q });
              return res.items.map((w) => ({ value: w.workshop_id, label: w.workshop_name, code: w.workshop_code }));
            }}
            placeholder="Search workshop..."
          />
        ),
      }}
      get={jobCardApi.get}
      create={jobCardApi.create}
      update={jobCardApi.update}
      defaults={{ status: 'Open', priority: 'Medium', reported_datetime: now, opened_at: now }}
      validate={validate}
    />
  );
}
