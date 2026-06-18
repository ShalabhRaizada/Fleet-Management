import { maintenanceDueApi } from '../../api/resources';
import { CrudListPage } from '../crud/CrudListPage';
import type { MaintenanceDue } from '../../types/entities-p2p3';

export default function MaintenanceDueList() {
  return (
    <CrudListPage<MaintenanceDue>
      title="Maintenance Due"
      basePath="/maintenance-due"
      rowKey={(r) => r.maintenance_due_id}
      list={maintenanceDueApi.list}
      remove={maintenanceDueApi.remove}
      columns={[
        { key: 'vehicle_id', header: 'Vehicle ID' },
        { key: 'due_date', header: 'Due Date', sortable: true },
        { key: 'due_odometer_km', header: 'Due Odometer KM' },
        { key: 'current_odometer_km', header: 'Current Odometer KM' },
        { key: 'status', header: 'Status', sortable: true },
      ]}
    />
  );
}
