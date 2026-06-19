import { accompanimentApi, vendorApi, branchApi } from '../../api/resources';
import { CrudFormPage, type FormSectionDef } from '../crud/CrudFormPage';
import type { Accompaniment } from '../../types/entities';
import type { FieldDef } from '../../components/Form';
import { SearchableCombobox } from '../../components/common/SearchableCombobox';

const BASIC_FIELDS: FieldDef<Accompaniment>[] = [
  { name: 'accompaniment_code', label: 'Code', required: true },
  {
    name: 'accompaniment_type', label: 'Type', type: 'select', required: true,
    options: ['Tarpaulin', 'Seal', 'SmartSeal', 'OTPLock', 'ELock', 'Rope', 'Chain', 'LashingBelt', 'SafetyKit'].map((v) => ({ value: v, label: v })),
  },
  { name: 'item_id', label: 'Item ID (UUID)' },
  { name: 'size_or_spec', label: 'Size / Spec' },
  { name: 'is_reusable', label: 'Reusable', type: 'checkbox' },
];

const ASSIGNMENT_FIELDS: FieldDef<Accompaniment>[] = [
  { name: 'vendor_id', label: 'Vendor' },
  { name: 'current_branch_id', label: 'Current Branch' },
];

const STATUS_FIELDS: FieldDef<Accompaniment>[] = [
  {
    name: 'current_status', label: 'Current Status', type: 'select', required: true,
    options: ['InStock', 'Issued', 'Damaged', 'Lost'].map((v) => ({ value: v, label: v })),
  },
];

const SECTIONS: FormSectionDef<Accompaniment>[] = [
  { title: 'Basic Information', fields: BASIC_FIELDS },
  { title: 'Assignment', fields: ASSIGNMENT_FIELDS },
  { title: 'Status', fields: STATUS_FIELDS },
];

export default function AccompanimentForm() {
  return (
    <CrudFormPage<Accompaniment>
      title="Accompaniment"
      basePath="/accompaniments"
      fields={[...BASIC_FIELDS, ...ASSIGNMENT_FIELDS, ...STATUS_FIELDS]}
      sections={SECTIONS}
      renderers={{
        vendor_id: (value, onChange) => (
          <SearchableCombobox
            value={(value as string) ?? ''}
            onChange={onChange}
            loadOptions={async (q) => {
              const res = await vendorApi.list({ page: 1, pageSize: 20, q });
              return res.items.map((v) => ({ value: v.vendor_id, label: v.vendor_name, code: v.vendor_code }));
            }}
            placeholder="Search vendor..."
          />
        ),
        current_branch_id: (value, onChange) => (
          <SearchableCombobox
            value={(value as string) ?? ''}
            onChange={onChange}
            loadOptions={async (q) => {
              const res = await branchApi.list({ page: 1, pageSize: 20, q });
              return res.items.map((b) => ({ value: b.branch_id, label: b.branch_name, code: b.branch_code }));
            }}
            placeholder="Search branch..."
          />
        ),
      }}
      get={accompanimentApi.get}
      create={accompanimentApi.create}
      update={accompanimentApi.update}
      defaults={{ is_reusable: true, current_status: 'InStock' }}
    />
  );
}
