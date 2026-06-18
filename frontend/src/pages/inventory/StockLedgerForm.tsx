import { stockLedgerApi } from '../../api/resources';
import { CrudFormPage } from '../crud/CrudFormPage';
import type { StockLedger } from '../../types/entities-p2p3';
import type { FieldDef } from '../../components/Form';

const fields: FieldDef<StockLedger>[] = [
  { name: 'txn_datetime', label: 'Txn Datetime', type: 'datetime-local', required: true },
  { name: 'branch_id', label: 'Branch ID (UUID)', required: true },
  { name: 'item_id', label: 'Item ID (UUID)', required: true },
  {
    name: 'movement_type', label: 'Movement Type', type: 'select', required: true,
    options: ['GRN', 'Issue', 'Return', 'TransferOut', 'TransferIn', 'Scrap', 'Adjustment'].map((v) => ({ value: v, label: v })),
  },
  { name: 'quantity', label: 'Quantity', type: 'number', required: true },
  { name: 'unit_cost', label: 'Unit Cost', type: 'number' },
  {
    name: 'reference_type', label: 'Reference Type', type: 'select',
    options: ['JobCard', 'Vehicle', 'Invoice', 'Tyre', 'Accessory', 'Trip'].map((v) => ({ value: v, label: v })),
  },
  { name: 'reference_id', label: 'Reference ID' },
  {
    name: 'issued_to_type', label: 'Issued To Type', type: 'select',
    options: ['Vehicle', 'Mechanic', 'Driver', 'Branch', 'Workshop'].map((v) => ({ value: v, label: v })),
  },
  { name: 'issued_to_id', label: 'Issued To ID' },
  {
    name: 'status', label: 'Status', type: 'select', required: true,
    options: ['Draft', 'Posted', 'Cancelled'].map((v) => ({ value: v, label: v })),
  },
];

export default function StockLedgerForm() {
  return (
    <CrudFormPage<StockLedger>
      title="Stock Ledger Entry"
      basePath="/stock-ledger"
      fields={fields}
      get={stockLedgerApi.get}
      create={stockLedgerApi.create}
      update={stockLedgerApi.update}
      defaults={{ movement_type: 'GRN', status: 'Draft' }}
    />
  );
}
