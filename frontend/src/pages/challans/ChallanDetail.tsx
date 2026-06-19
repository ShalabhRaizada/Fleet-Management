import { challanApi } from '../../api/resources';
import { CrudDetailPage } from '../crud/CrudDetailPage';
import type { Challan } from '../../types/entities';

export default function ChallanDetail() {
  return (
    <CrudDetailPage<Challan>
      title="Challan Detail"
      basePath="/challans"
      get={challanApi.get}
      fieldsToShow={[
        { key: 'challan_no', label: 'Challan No' },
        { key: 'vehicle_id', label: 'Vehicle ID' },
        { key: 'driver_id', label: 'Driver ID' },
        { key: 'violation_type', label: 'Violation Type' },
        { key: 'violation_date', label: 'Violation Date' },
        { key: 'location', label: 'Location' },
        { key: 'amount', label: 'Amount' },
        { key: 'issuing_authority', label: 'Issuing Authority' },
        { key: 'due_date', label: 'Due Date' },
        { key: 'payment_status', label: 'Payment Status' },
        { key: 'payment_date', label: 'Payment Date' },
        { key: 'payment_reference', label: 'Payment Reference' },
        { key: 'responsibility', label: 'Responsibility' },
        { key: 'remarks', label: 'Remarks' },
      ]}
    />
  );
}
