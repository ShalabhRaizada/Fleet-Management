import { tollTransactionApi } from '../../api/resources';
import { CrudListPage } from '../crud/CrudListPage';
import type { TollTransaction } from '../../types/entities-p2p3';

export default function TollTransactionList() {
  return (
    <CrudListPage<TollTransaction>
      title="Toll Transactions"
      basePath="/toll-transactions"
      rowKey={(r) => r.toll_txn_id}
      list={tollTransactionApi.list}
      remove={tollTransactionApi.remove}
      columns={[
        { key: 'toll_plaza_name', header: 'Toll Plaza' },
        { key: 'txn_datetime', header: 'Txn Datetime', sortable: true },
        { key: 'amount', header: 'Amount' },
        { key: 'source', header: 'Source' },
        { key: 'reconciliation_status', header: 'Reconciliation', sortable: true },
      ]}
    />
  );
}
