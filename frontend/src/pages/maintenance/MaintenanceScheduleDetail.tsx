import { maintenanceScheduleApi } from '../../api/resources';
import { CrudDetailPage } from '../crud/CrudDetailPage';
import type { MaintenanceSchedule } from '../../types/entities-p2p3';

export default function MaintenanceScheduleDetail() {
  return (
    <CrudDetailPage<MaintenanceSchedule>
      title="Maintenance Schedule Detail"
      basePath="/maintenance-schedules"
      get={maintenanceScheduleApi.get}
      fieldsToShow={[
        { key: 'schedule_code', label: 'Schedule Code' },
        { key: 'vehicle_category', label: 'Vehicle Category' },
        { key: 'vehicle_type', label: 'Vehicle Type' },
        { key: 'fuel_type', label: 'Fuel Type' },
        { key: 'maintenance_type', label: 'Maintenance Type' },
        { key: 'trigger_km', label: 'Trigger KM' },
        { key: 'trigger_days', label: 'Trigger Days' },
        { key: 'trigger_engine_hours', label: 'Trigger Engine Hours' },
        { key: 'checklist_template_id', label: 'Checklist Template ID' },
        { key: 'is_blocking', label: 'Is Blocking' },
        { key: 'status', label: 'Status' },
      ]}
    />
  );
}
