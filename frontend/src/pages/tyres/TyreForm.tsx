import { tyreApi } from '../../api/resources';
import { CrudFormPage } from '../crud/CrudFormPage';
import type { Tyre } from '../../types/entities';
import type { FieldDef } from '../../components/Form';

const fields: FieldDef<Tyre>[] = [
  { name: 'tyre_serial_no', label: 'Serial No', required: true },
  { name: 'brand', label: 'Brand' },
  { name: 'model', label: 'Model' },
  { name: 'size', label: 'Size', required: true },
  { name: 'ply_rating', label: 'Ply Rating' },
  { name: 'purchase_date', label: 'Purchase Date', type: 'date' },
  { name: 'vendor_id', label: 'Vendor ID (UUID)' },
  { name: 'purchase_cost', label: 'Purchase Cost', type: 'number' },
  { name: 'warranty_upto', label: 'Warranty Upto', type: 'date' },
  {
    name: 'status', label: 'Status', type: 'select', required: true,
    options: ['New', 'InStock', 'Fitted', 'Running', 'Removed', 'Repairable', 'SentForRepair', 'Retreaded', 'Spare', 'Dead', 'Scrap', 'Disposed'].map((v) => ({ value: v, label: v })),
  },
  { name: 'total_run_km', label: 'Total Run (km)', type: 'number' },
];

export default function TyreForm() {
  return (
    <CrudFormPage<Tyre>
      title="Tyre"
      basePath="/tyres"
      fields={fields}
      get={tyreApi.get}
      create={tyreApi.create}
      update={tyreApi.update}
      defaults={{ status: 'New' }}
    />
  );
}
