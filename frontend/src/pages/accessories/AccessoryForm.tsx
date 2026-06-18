import { accessoryApi } from '../../api/resources';
import { CrudFormPage } from '../crud/CrudFormPage';
import type { Accessory } from '../../types/entities';
import type { FieldDef } from '../../components/Form';

const fields: FieldDef<Accessory>[] = [
  { name: 'accessory_code', label: 'Accessory Code', required: true },
  { name: 'accessory_type', label: 'Accessory Type', required: true, placeholder: 'GPS / Camera / FuelSensor / etc' },
  { name: 'serial_no', label: 'Serial No' },
  { name: 'vendor_id', label: 'Vendor ID (UUID)' },
  { name: 'purchase_date', label: 'Purchase Date', type: 'date' },
  { name: 'warranty_upto', label: 'Warranty Upto', type: 'date' },
  { name: 'sim_no', label: 'SIM No' },
  { name: 'imei_no', label: 'IMEI No' },
  { name: 'current_vehicle_id', label: 'Current Vehicle ID (UUID)' },
  { name: 'health_status', label: 'Health Status' },
  {
    name: 'status', label: 'Status', type: 'select', required: true,
    options: ['InStock', 'Installed', 'Active', 'Faulty', 'Removed', 'UnderRepair', 'Replaced', 'Scrap'].map((v) => ({ value: v, label: v })),
  },
];

export default function AccessoryForm() {
  return (
    <CrudFormPage<Accessory>
      title="Accessory"
      basePath="/accessories"
      fields={fields}
      get={accessoryApi.get}
      create={accessoryApi.create}
      update={accessoryApi.update}
      defaults={{ status: 'InStock' }}
    />
  );
}
