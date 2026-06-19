import { useState } from 'react';
import { branchApi, tyreApi, vendorApi } from '../../api/resources';
import { CrudFormPage, type FormSectionDef } from '../crud/CrudFormPage';
import type { Tyre } from '../../types/entities';
import type { FieldDef } from '../../components/Form';
import { SearchableCombobox } from '../../components/common/SearchableCombobox';

const BASIC_FIELDS: FieldDef<Tyre>[] = [
  { name: 'tyre_serial_no', label: 'Serial No', required: true },
  { name: 'brand', label: 'Brand' },
  { name: 'model', label: 'Model' },
  { name: 'size', label: 'Size', required: true },
  { name: 'ply_rating', label: 'Ply Rating' },
];

const PURCHASE_FIELDS: FieldDef<Tyre>[] = [
  { name: 'purchase_date', label: 'Purchase Date', type: 'date' },
  { name: 'vendor_id', label: 'Vendor' },
  { name: 'purchase_cost', label: 'Purchase Cost', type: 'number', min: 0 },
  { name: 'warranty_upto', label: 'Warranty Upto', type: 'date' },
];

const TECHNICAL_FIELDS: FieldDef<Tyre>[] = [
  {
    name: 'status', label: 'Status', type: 'select', required: true,
    options: ['New', 'InStock', 'Fitted', 'Running', 'Removed', 'Repairable', 'SentForRepair', 'Retreaded', 'Spare', 'Dead', 'Scrap', 'Disposed'].map((v) => ({ value: v, label: v })),
  },
  { name: 'total_run_km', label: 'Total Run (km)', type: 'number', min: 0 },
];

const ASSIGNMENT_FIELDS: FieldDef<Tyre>[] = [
  { name: 'current_branch_id', label: 'Current Branch' },
  { name: 'current_position', label: 'Current Position' },
];

const SECTIONS: FormSectionDef<Tyre>[] = [
  { title: 'Basic Information', fields: BASIC_FIELDS },
  { title: 'Purchase Details', fields: PURCHASE_FIELDS },
  { title: 'Technical Details', fields: TECHNICAL_FIELDS },
  { title: 'Assignment Details', fields: ASSIGNMENT_FIELDS },
];

function validate(values: Partial<Tyre>): Record<string, string> {
  const errors: Record<string, string> = {};
  if (values.purchase_date && values.warranty_upto && values.warranty_upto < values.purchase_date) {
    errors.warranty_upto = 'Warranty date cannot be before purchase date';
  }
  if (values.purchase_cost != null && values.purchase_cost < 0) {
    errors.purchase_cost = 'Purchase cost cannot be negative';
  }
  if (values.total_run_km != null && values.total_run_km < 0) {
    errors.total_run_km = 'Total run cannot be negative';
  }
  return errors;
}

export default function TyreForm() {
  const [warning, setWarning] = useState<string | null>(null);

  function handleValuesChange(values: Partial<Tyre>) {
    if (values.purchase_date) {
      const purchaseDate = new Date(values.purchase_date);
      const ageYears = (Date.now() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
      if (ageYears > 6) {
        setWarning('This tyre is over 6 years old based on purchase date — verify it is still serviceable.');
      } else {
        setWarning(null);
      }
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
      <CrudFormPage<Tyre>
        title="Tyre"
        basePath="/tyres"
        fields={[...BASIC_FIELDS, ...PURCHASE_FIELDS, ...TECHNICAL_FIELDS, ...ASSIGNMENT_FIELDS]}
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
        get={tyreApi.get}
        create={tyreApi.create}
        update={tyreApi.update}
        defaults={{ status: 'New' }}
        validate={handleValuesChange}
      />
    </div>
  );
}
