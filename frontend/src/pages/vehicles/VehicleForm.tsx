import { useState } from 'react';
import { vehicleApi } from '../../api/resources';
import { CrudFormPage } from '../crud/CrudFormPage';
import type { Vehicle } from '../../types/entities';
import type { FieldDef } from '../../components/Form';

const fields: FieldDef<Vehicle>[] = [
  { name: 'registration_no', label: 'Registration No', required: true },
  { name: 'vehicle_code', label: 'Vehicle Code' },
  {
    name: 'ownership_type', label: 'Ownership Type', type: 'select', required: true,
    options: ['Owned', 'Leased', 'Attached', 'Market'].map((v) => ({ value: v, label: v })),
  },
  {
    name: 'vehicle_category', label: 'Vehicle Category', type: 'select', required: true,
    options: ['LCV', 'MCV', 'HCV', 'Trailer Truck', 'Special'].map((v) => ({ value: v, label: v })),
  },
  {
    name: 'vehicle_type', label: 'Vehicle Type', type: 'select', required: true,
    options: ['Truck', 'Mini Truck', 'Pickup', 'Tanker', 'Tipper', 'Trailer', 'Special'].map((v) => ({ value: v, label: v })),
  },
  {
    name: 'fuel_type', label: 'Fuel Type', type: 'select', required: true,
    options: ['Diesel', 'CNG', 'LNG', 'EV', 'Hybrid'].map((v) => ({ value: v, label: v })),
  },
  { name: 'make', label: 'Make' },
  { name: 'model', label: 'Model' },
  { name: 'manufacture_year', label: 'Manufacture Year', type: 'number', min: 1900, max: 2030 },
  { name: 'vin_no', label: 'VIN No' },
  { name: 'chassis_no', label: 'Chassis No' },
  { name: 'engine_no', label: 'Engine No' },
  { name: 'gvw_kg', label: 'GVW (kg)', type: 'number', min: 0 },
  { name: 'payload_capacity_kg', label: 'Payload Capacity (kg)', type: 'number', min: 0 },
  { name: 'volume_cbm', label: 'Volume (cbm)', type: 'number', min: 0 },
  { name: 'axle_configuration', label: 'Axle Configuration' },
  { name: 'body_type', label: 'Body Type' },
  { name: 'current_odometer_km', label: 'Current Odometer (km)', type: 'number', min: 0 },
  {
    name: 'status', label: 'Status', type: 'select', required: true,
    options: [
      'Available', 'Assigned', 'InTrip', 'UnderMaintenance', 'Breakdown',
      'AccidentHold', 'ComplianceHold', 'WorkshopHold', 'Sold', 'Scrapped', 'Inactive',
    ].map((v) => ({ value: v, label: v })),
  },
];

const REGISTRATION_PATTERN = /^[A-Z]{2}\d{2}[A-Z]{1,2}\d{4}$/;

function validate(values: Partial<Vehicle>): Record<string, string> {
  const errors: Record<string, string> = {};
  // Registration number format is checked separately as a non-blocking warning
  // (international plates may not match the Indian pattern).
  if (values.manufacture_year && values.manufacture_year > new Date().getFullYear()) {
    errors.manufacture_year = 'Manufacture year cannot be in the future';
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
        fields={fields}
        get={vehicleApi.get}
        create={vehicleApi.create}
        update={vehicleApi.update}
        defaults={{ status: 'Available', ownership_type: 'Owned', fuel_type: 'Diesel' }}
        validate={handleValuesChange}
      />
    </div>
  );
}
