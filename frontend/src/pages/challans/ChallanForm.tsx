import { challanApi } from '../../api/resources';
import { CrudFormPage } from '../crud/CrudFormPage';
import type { Challan } from '../../types/entities';
import type { FieldDef } from '../../components/Form';

const fields: FieldDef<Challan>[] = [
  { name: 'challan_no', label: 'Challan No', required: true },
  { name: 'vehicle_id', label: 'Vehicle ID (UUID)', required: true },
  { name: 'driver_id', label: 'Driver ID (UUID)' },
  { name: 'violation_type', label: 'Violation Type', required: true },
  { name: 'violation_date', label: 'Violation Date', type: 'date', required: true },
  { name: 'location', label: 'Location' },
  { name: 'amount', label: 'Amount', type: 'number', required: true },
  { name: 'issuing_authority', label: 'Issuing Authority' },
  { name: 'due_date', label: 'Due Date', type: 'date' },
  {
    name: 'payment_status', label: 'Payment Status', type: 'select', required: true,
    options: ['Pending', 'Paid', 'Disputed', 'Waived'].map((v) => ({ value: v, label: v })),
  },
  { name: 'payment_date', label: 'Payment Date', type: 'date' },
  { name: 'payment_reference', label: 'Payment Reference' },
  {
    name: 'responsibility', label: 'Responsibility', type: 'select',
    options: ['Driver', 'Company'].map((v) => ({ value: v, label: v })),
  },
  { name: 'remarks', label: 'Remarks' },
];

export default function ChallanForm() {
  return (
    <CrudFormPage<Challan>
      title="Challan"
      basePath="/challans"
      fields={fields}
      get={challanApi.get}
      create={challanApi.create}
      update={challanApi.update}
      defaults={{ payment_status: 'Pending', responsibility: 'Company' }}
    />
  );
}
