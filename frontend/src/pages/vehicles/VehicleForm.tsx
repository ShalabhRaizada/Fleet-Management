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
  { name: 'vehicle_category', label: 'Vehicle Category', required: true },
  { name: 'vehicle_type', label: 'Vehicle Type', required: true },
  {
    name: 'fuel_type', label: 'Fuel Type', type: 'select', required: true,
    options: ['Diesel', 'CNG', 'LNG', 'EV', 'Hybrid'].map((v) => ({ value: v, label: v })),
  },
  { name: 'make', label: 'Make' },
  { name: 'model', label: 'Model' },
  { name: 'manufacture_year', label: 'Manufacture Year', type: 'number' },
  { name: 'vin_no', label: 'VIN No' },
  { name: 'chassis_no', label: 'Chassis No' },
  { name: 'engine_no', label: 'Engine No' },
  { name: 'gvw_kg', label: 'GVW (kg)', type: 'number' },
  { name: 'payload_capacity_kg', label: 'Payload Capacity (kg)', type: 'number' },
  { name: 'volume_cbm', label: 'Volume (cbm)', type: 'number' },
  { name: 'axle_configuration', label: 'Axle Configuration' },
  { name: 'body_type', label: 'Body Type' },
  { name: 'current_odometer_km', label: 'Current Odometer (km)', type: 'number' },
  {
    name: 'status', label: 'Status', type: 'select', required: true,
    options: [
      'Available', 'Assigned', 'InTrip', 'UnderMaintenance', 'Breakdown',
      'AccidentHold', 'ComplianceHold', 'WorkshopHold', 'Sold', 'Scrapped', 'Inactive',
    ].map((v) => ({ value: v, label: v })),
  },
];

export default function VehicleForm() {
  return (
    <CrudFormPage<Vehicle>
      title="Vehicle"
      basePath="/vehicles"
      fields={fields}
      get={vehicleApi.get}
      create={vehicleApi.create}
      update={vehicleApi.update}
      defaults={{ status: 'Available', ownership_type: 'Owned', fuel_type: 'Diesel' }}
    />
  );
}
