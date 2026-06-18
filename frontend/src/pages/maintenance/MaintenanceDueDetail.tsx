import { maintenanceDueApi } from '../../api/resources';
import { CrudDetailPage } from '../crud/CrudDetailPage';
import type { MaintenanceDue } from '../../types/entities-p2p3';

export default function MaintenanceDueDetail() {
  return (
    <CrudDetailPage<MaintenanceDue>
      title="Maintenance Due Detail"
      basePath="/maintenance-due"
      get={maintenanceDueApi.get}
      fieldsToShow={[
        { key: 'vehicle_id', label: 'Vehicle ID' },
        { key: 'maintenance_schedule_id', label: 'Maintenance Schedule ID' },
        { key: 'due_date', label: 'Due Date' },
        { key: 'due_odometer_km', label: 'Due Odometer KM' },
        { key: 'current_odometer_km', label: 'Current Odometer KM' },
        { key: 'status', label: 'Status' },
        { key: 'job_card_id', label: 'Job Card ID' },
      ]}
    />
  );
}
