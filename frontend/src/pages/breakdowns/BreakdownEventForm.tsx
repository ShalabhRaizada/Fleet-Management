import { breakdownEventApi } from '../../api/resources';
import { CrudFormPage } from '../crud/CrudFormPage';
import type { BreakdownEvent } from '../../types/entities-p2p3';
import type { FieldDef } from '../../components/Form';

const fields: FieldDef<BreakdownEvent>[] = [
  { name: 'job_card_id', label: 'Job Card ID (UUID)' },
  { name: 'vehicle_id', label: 'Vehicle ID (UUID)', required: true },
  { name: 'trip_id', label: 'Trip ID (UUID)' },
  { name: 'breakdown_datetime', label: 'Breakdown Datetime', type: 'datetime-local', required: true },
  { name: 'location_text', label: 'Location' },
  { name: 'latitude', label: 'Latitude', type: 'number' },
  { name: 'longitude', label: 'Longitude', type: 'number' },
  {
    name: 'breakdown_category', label: 'Breakdown Category', type: 'select', required: true,
    options: ['Mechanical', 'Electrical', 'Tyre', 'Fuel', 'Battery', 'LNG', 'CNG', 'EV', 'Trailer'].map((v) => ({ value: v, label: v })),
  },
  {
    name: 'severity', label: 'Severity', type: 'select', required: true,
    options: ['Low', 'Medium', 'High', 'Critical'].map((v) => ({ value: v, label: v })),
  },
  { name: 'downtime_minutes', label: 'Downtime (Minutes)', type: 'number' },
  { name: 'root_cause', label: 'Root Cause', type: 'textarea' },
  {
    name: 'status', label: 'Status', type: 'select', required: true,
    options: ['Open', 'Assigned', 'UnderRepair', 'Closed'].map((v) => ({ value: v, label: v })),
  },
];

export default function BreakdownEventForm() {
  return (
    <CrudFormPage<BreakdownEvent>
      title="Breakdown Event"
      basePath="/breakdown-events"
      fields={fields}
      get={breakdownEventApi.get}
      create={breakdownEventApi.create}
      update={breakdownEventApi.update}
      defaults={{ breakdown_category: 'Mechanical', severity: 'Medium', status: 'Open' }}
    />
  );
}
