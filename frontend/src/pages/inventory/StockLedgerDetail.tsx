import { stockLedgerApi } from '../../api/resources';
import { CrudDetailPage } from '../crud/CrudDetailPage';
import type { StockLedger } from '../../types/entities-p2p3';

export default function StockLedgerDetail() {
  return (
    <CrudDetailPage<StockLedger>
      title="Stock Ledger Detail"
      basePath="/stock-ledger"
      get={stockLedgerApi.get}
      fieldsToShow={[
        { key: 'txn_datetime', label: 'Txn Datetime' },
        { key: 'branch_id', label: 'Branch ID' },
        { key: 'item_id', label: 'Item ID' },
        { key: 'movement_type', label: 'Movement Type' },
        { key: 'quantity', label: 'Quantity' },
        { key: 'unit_cost', label: 'Unit Cost' },
        { key: 'reference_type', label: 'Reference Type' },
        { key: 'reference_id', label: 'Reference ID' },
        { key: 'issued_to_type', label: 'Issued To Type' },
        { key: 'issued_to_id', label: 'Issued To ID' },
        { key: 'status', label: 'Status' },
      ]}
    />
  );
}
