import { breakdownEventApi } from '../../api/resources';
import { CrudListPage } from '../crud/CrudListPage';
import type { BreakdownEvent } from '../../types/entities-p2p3';

export default function BreakdownEventList() {
  return (
    <CrudListPage<BreakdownEvent>
      title="Breakdown Events"
      basePath="/breakdown-events"
      rowKey={(r) => r.breakdown_id}
      list={breakdownEventApi.list}
      remove={breakdownEventApi.remove}
      columns={[
        { key: 'vehicle_id', header: 'Vehicle ID' },
        { key: 'breakdown_datetime', header: 'Breakdown Datetime', sortable: true },
        { key: 'breakdown_category', header: 'Category', sortable: true },
        { key: 'severity', header: 'Severity', sortable: true },
        { key: 'status', header: 'Status', sortable: true },
      ]}
    />
  );
}
