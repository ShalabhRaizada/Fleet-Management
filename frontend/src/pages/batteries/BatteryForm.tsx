import { batteryApi } from '../../api/resources';
import { CrudFormPage } from '../crud/CrudFormPage';
import type { Battery } from '../../types/entities';
import type { FieldDef } from '../../components/Form';

const fields: FieldDef<Battery>[] = [
  { name: 'battery_serial_no', label: 'Battery Serial No', required: true },
  { name: 'vehicle_id', label: 'Vehicle ID (UUID)' },
  { name: 'oem_name', label: 'OEM Name' },
  { name: 'capacity_ah', label: 'Capacity (Ah)', type: 'number' },
  { name: 'voltage', label: 'Voltage', type: 'number' },
  { name: 'warranty_months', label: 'Warranty (Months)', type: 'number' },
  { name: 'fitment_date', label: 'Fitment Date', type: 'date' },
  { name: 'removal_date', label: 'Removal Date', type: 'date' },
  { name: 'removal_reason', label: 'Removal Reason' },
  {
    name: 'status', label: 'Status', type: 'select', required: true,
    options: ['Active', 'Removed', 'Scrapped', 'Warranty Claim'].map((v) => ({ value: v, label: v })),
  },
  { name: 'purchase_cost', label: 'Purchase Cost', type: 'number' },
  { name: 'vendor_id', label: 'Vendor ID (UUID)' },
];

export default function BatteryForm() {
  return (
    <CrudFormPage<Battery>
      title="Battery"
      basePath="/batteries"
      fields={fields}
      get={batteryApi.get}
      create={batteryApi.create}
      update={batteryApi.update}
      defaults={{ status: 'Active' }}
    />
  );
}
