import { accidentEventApi } from '../../api/resources';
import { CrudFormPage } from '../crud/CrudFormPage';
import type { AccidentEvent } from '../../types/entities-p2p3';
import type { FieldDef } from '../../components/Form';

const fields: FieldDef<AccidentEvent>[] = [
  { name: 'job_card_id', label: 'Job Card ID (UUID)' },
  { name: 'vehicle_id', label: 'Vehicle ID (UUID)', required: true },
  { name: 'trailer_id', label: 'Trailer ID (UUID)' },
  { name: 'driver_id', label: 'Driver ID (UUID)' },
  { name: 'accident_datetime', label: 'Accident Datetime', type: 'datetime-local', required: true },
  { name: 'location_text', label: 'Location' },
  { name: 'third_party_involved', label: 'Third Party Involved', type: 'checkbox', required: true },
  { name: 'fir_no', label: 'FIR No' },
  { name: 'damage_summary', label: 'Damage Summary', type: 'textarea' },
  { name: 'insurance_claim_no', label: 'Insurance Claim No' },
  { name: 'estimated_loss_amount', label: 'Estimated Loss Amount', type: 'number' },
  {
    name: 'claim_status', label: 'Claim Status', type: 'select',
    options: ['Pending', 'Submitted', 'Approved', 'Rejected', 'Settled'].map((v) => ({ value: v, label: v })),
  },
  {
    name: 'status', label: 'Status', type: 'select', required: true,
    options: ['Open', 'UnderRepair', 'Claim', 'Closed'].map((v) => ({ value: v, label: v })),
  },
];

export default function AccidentEventForm() {
  return (
    <CrudFormPage<AccidentEvent>
      title="Accident Event"
      basePath="/accident-events"
      fields={fields}
      get={accidentEventApi.get}
      create={accidentEventApi.create}
      update={accidentEventApi.update}
      defaults={{ third_party_involved: false, status: 'Open' }}
    />
  );
}
