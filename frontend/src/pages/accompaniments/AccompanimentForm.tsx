import { accompanimentApi } from '../../api/resources';
import { CrudFormPage } from '../crud/CrudFormPage';
import type { Accompaniment } from '../../types/entities';
import type { FieldDef } from '../../components/Form';

const fields: FieldDef<Accompaniment>[] = [
  { name: 'accompaniment_code', label: 'Code', required: true },
  {
    name: 'accompaniment_type', label: 'Type', type: 'select', required: true,
    options: ['Tarpaulin', 'Seal', 'SmartSeal', 'OTPLock', 'ELock', 'Rope', 'Chain', 'LashingBelt', 'SafetyKit'].map((v) => ({ value: v, label: v })),
  },
  { name: 'item_id', label: 'Item ID (UUID)' },
  { name: 'size_or_spec', label: 'Size / Spec' },
  { name: 'is_reusable', label: 'Reusable', type: 'checkbox' },
  { name: 'vendor_id', label: 'Vendor ID (UUID)' },
  { name: 'current_status', label: 'Current Status', required: true, placeholder: 'InStock / Issued / Damaged / Lost' },
];

export default function AccompanimentForm() {
  return (
    <CrudFormPage<Accompaniment>
      title="Accompaniment"
      basePath="/accompaniments"
      fields={fields}
      get={accompanimentApi.get}
      create={accompanimentApi.create}
      update={accompanimentApi.update}
      defaults={{ is_reusable: true, current_status: 'InStock' }}
    />
  );
}
