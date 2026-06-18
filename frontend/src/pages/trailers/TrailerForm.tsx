import { trailerApi } from '../../api/resources';
import { CrudFormPage } from '../crud/CrudFormPage';
import type { Trailer } from '../../types/entities';
import type { FieldDef } from '../../components/Form';

const fields: FieldDef<Trailer>[] = [
  { name: 'trailer_no', label: 'Trailer No', required: true },
  { name: 'trailer_type', label: 'Trailer Type', required: true },
  { name: 'body_type', label: 'Body Type' },
  { name: 'chassis_no', label: 'Chassis No' },
  { name: 'payload_capacity_kg', label: 'Payload Capacity (kg)', type: 'number' },
  { name: 'volume_cbm', label: 'Volume (cbm)', type: 'number' },
  { name: 'length_ft', label: 'Length (ft)', type: 'number' },
  { name: 'axle_count', label: 'Axle Count', type: 'number' },
  {
    name: 'status', label: 'Status', type: 'select', required: true,
    options: ['Available', 'Attached', 'UnderMaintenance', 'ComplianceHold', 'Inactive'].map((v) => ({ value: v, label: v })),
  },
];

export default function TrailerForm() {
  return (
    <CrudFormPage<Trailer>
      title="Trailer"
      basePath="/trailers"
      fields={fields}
      get={trailerApi.get}
      create={trailerApi.create}
      update={trailerApi.update}
      defaults={{ status: 'Available' }}
    />
  );
}
