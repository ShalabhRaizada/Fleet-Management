import { tollTransactionApi } from '../../api/resources';
import { CrudDetailPage } from '../crud/CrudDetailPage';
import type { TollTransaction } from '../../types/entities-p2p3';

export default function TollTransactionDetail() {
  return (
    <CrudDetailPage<TollTransaction>
      title="Toll Transaction Detail"
      basePath="/toll-transactions"
      get={tollTransactionApi.get}
      fieldsToShow={[
        { key: 'vehicle_id', label: 'Vehicle ID' },
        { key: 'trip_id', label: 'Trip ID' },
        { key: 'toll_plaza_code', label: 'Toll Plaza Code' },
        { key: 'toll_plaza_name', label: 'Toll Plaza Name' },
        { key: 'txn_datetime', label: 'Txn Datetime' },
        { key: 'amount', label: 'Amount' },
        { key: 'source', label: 'Source' },
        { key: 'reference_no', label: 'Reference No' },
        { key: 'reconciliation_status', label: 'Reconciliation Status' },
      ]}
    />
  );
}
