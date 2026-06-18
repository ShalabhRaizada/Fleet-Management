import { tollTransactionApi } from '../../api/resources';
import { CrudFormPage } from '../crud/CrudFormPage';
import type { TollTransaction } from '../../types/entities-p2p3';
import type { FieldDef } from '../../components/Form';

const fields: FieldDef<TollTransaction>[] = [
  { name: 'vehicle_id', label: 'Vehicle ID (UUID)', required: true },
  { name: 'trip_id', label: 'Trip ID (UUID)' },
  { name: 'toll_plaza_code', label: 'Toll Plaza Code' },
  { name: 'toll_plaza_name', label: 'Toll Plaza Name' },
  { name: 'txn_datetime', label: 'Txn Datetime', type: 'datetime-local', required: true },
  { name: 'amount', label: 'Amount', type: 'number', required: true },
  {
    name: 'source', label: 'Source', type: 'select', required: true,
    options: ['FASTag', 'Manual', 'ULIP'].map((v) => ({ value: v, label: v })),
  },
  { name: 'reference_no', label: 'Reference No' },
  {
    name: 'reconciliation_status', label: 'Reconciliation Status', type: 'select', required: true,
    options: ['Matched', 'Unmatched', 'Exception'].map((v) => ({ value: v, label: v })),
  },
];

export default function TollTransactionForm() {
  return (
    <CrudFormPage<TollTransaction>
      title="Toll Transaction"
      basePath="/toll-transactions"
      fields={fields}
      get={tollTransactionApi.get}
      create={tollTransactionApi.create}
      update={tollTransactionApi.update}
      defaults={{ source: 'FASTag', reconciliation_status: 'Unmatched' }}
    />
  );
}
