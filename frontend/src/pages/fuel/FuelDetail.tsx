import { fuelTransactionApi } from '../../api/resources';
import { CrudDetailPage } from '../crud/CrudDetailPage';
import type { FuelTransaction } from '../../types/entities';

export default function FuelDetail() {
  return (
    <CrudDetailPage<FuelTransaction>
      title="Fuel Transaction Detail"
      basePath="/fuel"
      get={fuelTransactionApi.get}
      fieldsToShow={[
        { key: 'fuel_type', label: 'Fuel Type' },
        { key: 'txn_datetime', label: 'Date/Time' },
        { key: 'quantity', label: 'Quantity' },
        { key: 'unit_of_measure', label: 'UoM' },
        { key: 'rate_per_unit', label: 'Rate/Unit' },
        { key: 'amount', label: 'Amount' },
        { key: 'odometer_km', label: 'Odometer (km)' },
        { key: 'receipt_no', label: 'Receipt No' },
        { key: 'status', label: 'Status' },
      ]}
    />
  );
}
