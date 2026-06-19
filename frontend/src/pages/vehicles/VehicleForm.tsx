import { useState } from 'react';
import { branchApi, driverApi, vehicleApi } from '../../api/resources';
import { CrudFormPage, type FormSectionDef } from '../crud/CrudFormPage';
import type { Vehicle } from '../../types/entities';
import type { FieldDef } from '../../components/Form';
import { SearchableCombobox } from '../../components/common/SearchableCombobox';

const BASIC_FIELDS: FieldDef<Vehicle>[] = [
  { name: 'registration_no', label: 'Registration No', required: true },
  { name: 'vehicle_code', label: 'Vehicle Code' },
  {
    name: 'ownership_type', label: 'Ownership Type', type: 'select', required: true,
    options: ['Owned', 'Leased', 'Attached', 'Market'].map((v) => ({ value: v, label: v })),
  },
  {
    name: 'status', label: 'Status', type: 'select', required: true,
    options: [
      'Available', 'Assigned', 'InTrip', 'UnderMaintenance', 'Breakdown',
      'AccidentHold', 'ComplianceHold', 'WorkshopHold', 'Sold', 'Scrapped', 'Inactive',
    ].map((v) => ({ value: v, label: v })),
  },
  { name: 'branch_id', label: 'Branch / Operating Location' },
];

const ASSET_FIELDS: FieldDef<Vehicle>[] = [
  {
    name: 'vehicle_category', label: 'Vehicle Category', type: 'select', required: true,
    options: ['LCV', 'MCV', 'HCV', 'Trailer Truck', 'Special'].map((v) => ({ value: v, label: v })),
  },
  {
    name: 'vehicle_type', label: 'Vehicle Type', type: 'select', required: true,
    options: ['Truck', 'Mini Truck', 'Pickup', 'Tanker', 'Tipper', 'Trailer', 'Special'].map((v) => ({ value: v, label: v })),
  },
  { name: 'make', label: 'Make' },
  { name: 'model', label: 'Model' },
  { name: 'manufacture_year', label: 'Manufacturing Year', type: 'number', min: 1900, max: 2030 },
  { name: 'current_driver_id', label: 'Current Driver' },
];

const TECHNICAL_FIELDS: FieldDef<Vehicle>[] = [
  { name: 'vin_no', label: 'VIN Number' },
  { name: 'chassis_no', label: 'Chassis Number' },
  { name: 'engine_no', label: 'Engine Number' },
  { name: 'gvw_kg', label: 'GVW (kg)', type: 'number', min: 0 },
  { name: 'payload_capacity_kg', label: 'Payload Capacity (kg)', type: 'number', min: 0 },
  { name: 'volume_cbm', label: 'Volume (cbm)', type: 'number', min: 0 },
  { name: 'axle_configuration', label: 'Axle Configuration' },
  { name: 'body_type', label: 'Body Type' },
];

const OPERATIONS_FIELDS: FieldDef<Vehicle>[] = [
  {
    name: 'fuel_type', label: 'Fuel Type', type: 'select', required: true,
    options: ['Diesel', 'CNG', 'LNG', 'EV', 'Hybrid'].map((v) => ({ value: v, label: v })),
  },
  { name: 'current_odometer_km', label: 'Current Odometer (km)', type: 'number', min: 0 },
];

const SECTIONS: FormSectionDef<Vehicle>[] = [
  { title: 'Basic Information', fields: BASIC_FIELDS },
  { title: 'Asset Details', fields: ASSET_FIELDS },
  { title: 'Technical Details', fields: TECHNICAL_FIELDS },
  { title: 'Fuel & Operations', fields: OPERATIONS_FIELDS },
];

const REGISTRATION_PATTERN = /^[A-Z]{2}\d{2}[A-Z]{1,2}\d{4}$/;

function validate(values: Partial<Vehicle>): Record<string, string> {
  const errors: Record<string, string> = {};
  // Registration number format is checked separately as a non-blocking warning
  // (international plates may not match the Indian pattern).
  if (values.manufacture_year && values.manufacture_year > new Date().getFullYear()) {
    errors.manufacture_year = 'Manufacture year cannot be in the future';
  }
  if (values.current_odometer_km != null && values.current_odometer_km < 0) {
    errors.current_odometer_km = 'Odometer cannot be negative';
  }
  return errors;
}

export default function VehicleForm() {
  const [warning, setWarning] = useState<string | null>(null);

  function handleValuesChange(values: Partial<Vehicle>) {
    if (values.registration_no && !REGISTRATION_PATTERN.test(values.registration_no)) {
      setWarning('Registration No does not match the standard Indian plate format (e.g. MH12AB1234). International plates may differ.');
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
      <CrudFormPage<Vehicle>
        title="Vehicle"
        basePath="/vehicles"
        fields={[...BASIC_FIELDS, ...ASSET_FIELDS, ...TECHNICAL_FIELDS, ...OPERATIONS_FIELDS]}
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
          current_driver_id: (value, onChange) => (
            <SearchableCombobox
              value={(value as string) ?? ''}
              onChange={onChange}
              loadOptions={async (q) => {
                const res = await driverApi.list({ page: 1, pageSize: 20, q });
                return res.items.map((d) => ({ value: d.driver_id, label: d.driver_name, code: d.licence_no ?? undefined }));
              }}
              placeholder="Search driver..."
            />
          ),
        }}
        get={vehicleApi.get}
        create={vehicleApi.create}
        update={vehicleApi.update}
        defaults={{ status: 'Available', ownership_type: 'Owned', fuel_type: 'Diesel' }}
        validate={handleValuesChange}
      />
    </div>
  );
}
