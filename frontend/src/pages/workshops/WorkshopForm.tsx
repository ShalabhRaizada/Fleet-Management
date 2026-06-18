import { workshopApi } from '../../api/resources';
import { CrudFormPage } from '../crud/CrudFormPage';
import type { Workshop } from '../../types/entities';
import type { FieldDef } from '../../components/Form';

const fields: FieldDef<Workshop>[] = [
  { name: 'workshop_code', label: 'Workshop Code', required: true },
  { name: 'workshop_name', label: 'Workshop Name', required: true },
  { name: 'workshop_type', label: 'Workshop Type', required: true, placeholder: 'InHouse / Authorized / Local' },
  { name: 'vendor_id', label: 'Vendor ID (UUID)' },
  { name: 'gstin', label: 'GSTIN' },
  { name: 'service_categories', label: 'Service Categories' },
  { name: 'payment_terms_days', label: 'Payment Terms (days)', type: 'number' },
  { name: 'status', label: 'Status', required: true, placeholder: 'Active / Inactive' },
];

export default function WorkshopForm() {
  return (
    <CrudFormPage<Workshop>
      title="Workshop"
      basePath="/workshops"
      fields={fields}
      get={workshopApi.get}
      create={workshopApi.create}
      update={workshopApi.update}
      defaults={{ status: 'Active' }}
    />
  );
}
