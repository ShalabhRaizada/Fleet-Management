import { maintenanceScheduleApi } from '../../api/resources';
import { CrudListPage } from '../crud/CrudListPage';
import type { MaintenanceSchedule } from '../../types/entities-p2p3';

export default function MaintenanceScheduleList() {
  return (
    <CrudListPage<MaintenanceSchedule>
      title="Maintenance Schedules"
      basePath="/maintenance-schedules"
      rowKey={(r) => r.maintenance_schedule_id}
      list={maintenanceScheduleApi.list}
      remove={maintenanceScheduleApi.remove}
      columns={[
        { key: 'schedule_code', header: 'Schedule Code' },
        { key: 'maintenance_type', header: 'Maintenance Type' },
        { key: 'vehicle_type', header: 'Vehicle Type' },
        { key: 'is_blocking', header: 'Blocking' },
        { key: 'status', header: 'Status', sortable: true },
      ]}
    />
  );
}
