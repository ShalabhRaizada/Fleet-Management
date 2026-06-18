import { fuelTransactionApi } from '../../api/resources';
import { CrudListPage } from '../crud/CrudListPage';
import type { FuelTransaction } from '../../types/entities';

export default function FuelList() {
  return (
    <CrudListPage<FuelTransaction>
      title="Fuel Transactions"
      basePath="/fuel"
      rowKey={(r) => r.fuel_txn_id}
      list={fuelTransactionApi.list}
      remove={fuelTransactionApi.remove}
      columns={[
        { key: 'txn_datetime', header: 'Date/Time', render: (r) => new Date(r.txn_datetime).toLocaleString(), sortable: true },
        { key: 'fuel_type', header: 'Fuel Type' },
        { key: 'quantity', header: 'Quantity' },
        { key: 'unit_of_measure', header: 'UoM' },
        { key: 'rate_per_unit', header: 'Rate/Unit' },
        { key: 'amount', header: 'Amount' },
        { key: 'receipt_no', header: 'Receipt No' },
        { key: 'status', header: 'Status' },
      ]}
    />
  );
}
