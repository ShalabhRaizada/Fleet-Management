import { jobCardApi } from '../../api/resources';
import { CrudFormPage } from '../crud/CrudFormPage';
import type { JobCard } from '../../types/entities';
import type { FieldDef } from '../../components/Form';

const fields: FieldDef<JobCard>[] = [
  { name: 'job_card_no', label: 'Job Card No', required: true },
  {
    name: 'job_card_type', label: 'Job Card Type', type: 'select', required: true,
    options: ['Scheduled', 'Breakdown', 'Accident', 'Inspection', 'Tyre', 'Accessory', 'Trailer', 'Consumable'].map((v) => ({ value: v, label: v })),
  },
  { name: 'vehicle_id', label: 'Vehicle ID (UUID)' },
  { name: 'trailer_id', label: 'Trailer ID (UUID)' },
  { name: 'workshop_id', label: 'Workshop ID (UUID)' },
  { name: 'reported_datetime', label: 'Reported Date/Time', type: 'datetime-local', required: true },
  { name: 'odometer_km', label: 'Odometer (km)', type: 'number' },
  { name: 'defect_summary', label: 'Defect Summary', type: 'textarea', required: true },
  { name: 'priority', label: 'Priority', required: true, placeholder: 'Low / Medium / High / Urgent' },
  { name: 'estimated_amount', label: 'Estimated Amount', type: 'number' },
  { name: 'approved_amount', label: 'Approved Amount', type: 'number' },
  { name: 'actual_amount', label: 'Actual Amount', type: 'number' },
  {
    name: 'status', label: 'Status', type: 'select',
    options: ['Open', 'Assigned', 'Diagnosis', 'AwaitingParts', 'UnderRepair', 'QC', 'Completed', 'Closed', 'Reopened', 'Cancelled'].map((v) => ({ value: v, label: v })),
  },
  { name: 'opened_at', label: 'Opened At', type: 'datetime-local', required: true },
];

export default function JobCardForm() {
  const now = new Date().toISOString().slice(0, 16);
  return (
    <CrudFormPage<JobCard>
      title="Job Card"
      basePath="/job-cards"
      fields={fields}
      get={jobCardApi.get}
      create={jobCardApi.create}
      update={jobCardApi.update}
      defaults={{ status: 'Open', priority: 'Medium', reported_datetime: now, opened_at: now }}
    />
  );
}
