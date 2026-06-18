import { maintenanceScheduleApi } from '../../api/resources';
import { CrudFormPage } from '../crud/CrudFormPage';
import type { MaintenanceSchedule } from '../../types/entities-p2p3';
import type { FieldDef } from '../../components/Form';

const fields: FieldDef<MaintenanceSchedule>[] = [
  { name: 'schedule_code', label: 'Schedule Code', required: true },
  { name: 'vehicle_category', label: 'Vehicle Category' },
  { name: 'vehicle_type', label: 'Vehicle Type' },
  { name: 'fuel_type', label: 'Fuel Type' },
  { name: 'maintenance_type', label: 'Maintenance Type', required: true },
  { name: 'trigger_km', label: 'Trigger KM', type: 'number' },
  { name: 'trigger_days', label: 'Trigger Days', type: 'number' },
  { name: 'trigger_engine_hours', label: 'Trigger Engine Hours', type: 'number' },
  { name: 'checklist_template_id', label: 'Checklist Template ID' },
  { name: 'is_blocking', label: 'Is Blocking', type: 'checkbox', required: true },
  {
    name: 'status', label: 'Status', type: 'select', required: true,
    options: ['Active', 'Inactive'].map((v) => ({ value: v, label: v })),
  },
];

export default function MaintenanceScheduleForm() {
  return (
    <CrudFormPage<MaintenanceSchedule>
      title="Maintenance Schedule"
      basePath="/maintenance-schedules"
      fields={fields}
      get={maintenanceScheduleApi.get}
      create={maintenanceScheduleApi.create}
      update={maintenanceScheduleApi.update}
      defaults={{ is_blocking: false, status: 'Active' }}
    />
  );
}
