import { maintenanceDueApi } from '../../api/resources';
import { CrudFormPage } from '../crud/CrudFormPage';
import type { MaintenanceDue } from '../../types/entities-p2p3';
import type { FieldDef } from '../../components/Form';

const fields: FieldDef<MaintenanceDue>[] = [
  { name: 'vehicle_id', label: 'Vehicle ID (UUID)', required: true },
  { name: 'maintenance_schedule_id', label: 'Maintenance Schedule ID (UUID)', required: true },
  { name: 'due_date', label: 'Due Date', type: 'date' },
  { name: 'due_odometer_km', label: 'Due Odometer KM', type: 'number' },
  { name: 'current_odometer_km', label: 'Current Odometer KM', type: 'number' },
  {
    name: 'status', label: 'Status', type: 'select', required: true,
    options: ['Upcoming', 'Due', 'Overdue', 'Completed', 'Deferred'].map((v) => ({ value: v, label: v })),
  },
  { name: 'job_card_id', label: 'Job Card ID (UUID)' },
];

export default function MaintenanceDueForm() {
  return (
    <CrudFormPage<MaintenanceDue>
      title="Maintenance Due"
      basePath="/maintenance-due"
      fields={fields}
      get={maintenanceDueApi.get}
      create={maintenanceDueApi.create}
      update={maintenanceDueApi.update}
      defaults={{ status: 'Upcoming' }}
    />
  );
}
