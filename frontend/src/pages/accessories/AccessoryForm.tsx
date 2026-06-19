import { useState } from 'react';
import { accessoryApi, vendorApi, vehicleApi } from '../../api/resources';
import { CrudFormPage, type FormSectionDef } from '../crud/CrudFormPage';
import type { Accessory } from '../../types/entities';
import type { FieldDef } from '../../components/Form';
import { SearchableCombobox } from '../../components/common/SearchableCombobox';

const BASIC_FIELDS: FieldDef<Accessory>[] = [
  { name: 'accessory_code', label: 'Accessory Code', required: true },
  { name: 'accessory_type', label: 'Accessory Type', required: true, placeholder: 'GPS / Camera / FuelSensor / etc' },
  { name: 'serial_no', label: 'Serial No' },
  {
    name: 'status', label: 'Status', type: 'select', required: true,
    options: ['InStock', 'Installed', 'Active', 'Faulty', 'Removed', 'UnderRepair', 'Replaced', 'Scrap'].map((v) => ({ value: v, label: v })),
  },
];

const PURCHASE_FIELDS: FieldDef<Accessory>[] = [
  { name: 'vendor_id', label: 'Vendor' },
  { name: 'purchase_date', label: 'Purchase Date', type: 'date' },
  { name: 'warranty_upto', label: 'Warranty Expiry', type: 'date' },
];

const ASSIGNMENT_FIELDS: FieldDef<Accessory>[] = [
  { name: 'current_vehicle_id', label: 'Assigned Vehicle' },
  { name: 'health_status', label: 'Health Status' },
];

const TECHNICAL_FIELDS: FieldDef<Accessory>[] = [
  { name: 'imei_no', label: 'Device IMEI' },
  { name: 'sim_no', label: 'SIM Number' },
];

const SECTIONS: FormSectionDef<Accessory>[] = [
  { title: 'Basic Information', fields: BASIC_FIELDS },
  { title: 'Purchase Details', fields: PURCHASE_FIELDS },
  { title: 'Assignment Details', fields: ASSIGNMENT_FIELDS },
  { title: 'Technical Details', fields: TECHNICAL_FIELDS },
];

function validate(values: Partial<Accessory>): Record<string, string> {
  const errors: Record<string, string> = {};
  if (values.purchase_date && values.warranty_upto && values.warranty_upto < values.purchase_date) {
    errors.warranty_upto = 'Warranty expiry cannot be earlier than purchase date';
  }
  return errors;
}

export default function AccessoryForm() {
  const [warning, setWarning] = useState<string | null>(null);

  function handleValuesChange(values: Partial<Accessory>) {
    if (values.status === 'Scrap' && values.current_vehicle_id) {
      setWarning('Scrapped accessories should not remain assigned to a vehicle.');
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
      <CrudFormPage<Accessory>
        title="Accessory"
        basePath="/accessories"
        fields={[...BASIC_FIELDS, ...PURCHASE_FIELDS, ...ASSIGNMENT_FIELDS, ...TECHNICAL_FIELDS]}
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
          current_vehicle_id: (value, onChange) => (
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
        }}
        get={accessoryApi.get}
        create={accessoryApi.create}
        update={accessoryApi.update}
        defaults={{ status: 'InStock' }}
        validate={handleValuesChange}
      />
    </div>
  );
}
