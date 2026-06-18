import { stockLedgerApi } from '../../api/resources';
import { CrudListPage } from '../crud/CrudListPage';
import type { StockLedger } from '../../types/entities-p2p3';

export default function StockLedgerList() {
  return (
    <CrudListPage<StockLedger>
      title="Stock Ledger"
      basePath="/stock-ledger"
      rowKey={(r) => r.stock_ledger_id}
      list={stockLedgerApi.list}
      remove={stockLedgerApi.remove}
      columns={[
        { key: 'txn_datetime', header: 'Txn Datetime', sortable: true },
        { key: 'item_id', header: 'Item ID' },
        { key: 'movement_type', header: 'Movement Type', sortable: true },
        { key: 'quantity', header: 'Quantity' },
        { key: 'status', header: 'Status', sortable: true },
      ]}
    />
  );
}
