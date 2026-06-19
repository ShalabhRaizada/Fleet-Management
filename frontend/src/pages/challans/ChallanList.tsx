import { challanApi } from '../../api/resources';
import { CrudListPage } from '../crud/CrudListPage';
import type { Challan } from '../../types/entities';

export default function ChallanList() {
  return (
    <CrudListPage<Challan>
      title="Challans & Fines"
      basePath="/challans"
      rowKey={(r) => r.challan_id}
      list={challanApi.list}
      remove={challanApi.remove}
      columns={[
        { key: 'challan_no', header: 'Challan No', sortable: true },
        { key: 'violation_type', header: 'Violation Type' },
        { key: 'violation_date', header: 'Violation Date', sortable: true },
        { key: 'amount', header: 'Amount' },
        { key: 'payment_status', header: 'Payment Status', sortable: true },
        { key: 'responsibility', header: 'Responsibility' },
      ]}
    />
  );
}
