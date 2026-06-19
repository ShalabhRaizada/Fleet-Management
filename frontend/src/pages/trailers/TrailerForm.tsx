import { useState } from 'react';
import { branchApi, trailerApi } from '../../api/resources';
import { CrudFormPage, type FormSectionDef } from '../crud/CrudFormPage';
import type { Trailer } from '../../types/entities';
import type { FieldDef } from '../../components/Form';
import { SearchableCombobox } from '../../components/common/SearchableCombobox';

const BASIC_FIELDS: FieldDef<Trailer>[] = [
  { name: 'trailer_no', label: 'Trailer No', required: true },
  {
    name: 'status', label: 'Status', type: 'select', required: true,
    options: ['Available', 'Attached', 'UnderMaintenance', 'ComplianceHold', 'Inactive'].map((v) => ({ value: v, label: v })),
  },
  { name: 'branch_id', label: 'Current Branch' },
];

const ASSET_FIELDS: FieldDef<Trailer>[] = [
  { name: 'trailer_type', label: 'Trailer Type', required: true },
  { name: 'body_type', label: 'Body Type' },
];

const TECHNICAL_FIELDS: FieldDef<Trailer>[] = [
  { name: 'chassis_no', label: 'Chassis No' },
  { name: 'axle_count', label: 'Axle Count', type: 'number', min: 0 },
  { name: 'payload_capacity_kg', label: 'Payload Capacity (kg)', type: 'number', min: 0 },
  { name: 'volume_cbm', label: 'Volume (cbm)', type: 'number', min: 0 },
  { name: 'length_ft', label: 'Length (ft)', type: 'number', min: 0 },
];

const SECTIONS: FormSectionDef<Trailer>[] = [
  { title: 'Basic Information', fields: BASIC_FIELDS },
  { title: 'Asset Details', fields: ASSET_FIELDS },
  { title: 'Technical Specifications', fields: TECHNICAL_FIELDS },
];

function validate(values: Partial<Trailer>): Record<string, string> {
  const errors: Record<string, string> = {};
  if (values.axle_count != null && values.axle_count < 0) errors.axle_count = 'Axle count cannot be negative';
  if (values.payload_capacity_kg != null && values.payload_capacity_kg < 0) errors.payload_capacity_kg = 'Payload cannot be negative';
  if (values.volume_cbm != null && values.volume_cbm < 0) errors.volume_cbm = 'Volume cannot be negative';
  if (values.length_ft != null && values.length_ft < 0) errors.length_ft = 'Length cannot be negative';
  return errors;
}

export default function TrailerForm() {
  const [warning, setWarning] = useState<string | null>(null);

  function handleValuesChange(values: Partial<Trailer>) {
    if (values.status && ['UnderMaintenance', 'ComplianceHold', 'Inactive'].includes(values.status)) {
      setWarning('Trailer cannot be coupled while in this status.');
    } else {
      setWarning(null);
    }
    return validate(values);
  }

  return (
    <div>
      {warning && (
        <div className="badge warn" style={{ display: 'block', padding: '8px 12px', marginBottom: 16 }}>
          {warning}
        </div>
      )}
      <CrudFormPage<Trailer>
        title="Trailer"
        basePath="/trailers"
        fields={[...BASIC_FIELDS, ...ASSET_FIELDS, ...TECHNICAL_FIELDS]}
        sections={SECTIONS}
        renderers={{
          branch_id: (value, onChange) => (
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
        get={trailerApi.get}
        create={trailerApi.create}
        update={trailerApi.update}
        defaults={{ status: 'Available' }}
        validate={handleValuesChange}
      />
    </div>
  );
}
