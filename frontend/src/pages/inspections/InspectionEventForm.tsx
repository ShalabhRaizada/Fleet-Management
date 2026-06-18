import { inspectionEventApi } from '../../api/resources';
import { CrudFormPage } from '../crud/CrudFormPage';
import type { InspectionEvent } from '../../types/entities-p2p3';
import type { FieldDef } from '../../components/Form';

const fields: FieldDef<InspectionEvent>[] = [
  { name: 'template_id', label: 'Template ID (UUID)', required: true },
  {
    name: 'asset_type', label: 'Asset Type', type: 'select', required: true,
    options: ['Vehicle', 'Trailer', 'Tyre', 'Accessory'].map((v) => ({ value: v, label: v })),
  },
  { name: 'asset_id', label: 'Asset ID (UUID)', required: true },
  { name: 'vehicle_id', label: 'Vehicle ID (UUID)' },
  { name: 'trailer_id', label: 'Trailer ID (UUID)' },
  { name: 'performed_by_user_id', label: 'Performed By (User ID)' },
  { name: 'inspection_datetime', label: 'Inspection Datetime', type: 'datetime-local', required: true },
  {
    name: 'outcome', label: 'Outcome', type: 'select', required: true,
    options: ['Approved', 'Conditional', 'Rejected'].map((v) => ({ value: v, label: v })),
  },
  { name: 'remarks', label: 'Remarks', type: 'textarea' },
  { name: 'job_card_id', label: 'Job Card ID (UUID)' },
];

export default function InspectionEventForm() {
  return (
    <CrudFormPage<InspectionEvent>
      title="Inspection Event"
      basePath="/inspection-events"
      fields={fields}
      get={inspectionEventApi.get}
      create={inspectionEventApi.create}
      update={inspectionEventApi.update}
      defaults={{ asset_type: 'Vehicle', outcome: 'Approved' }}
    />
  );
}
