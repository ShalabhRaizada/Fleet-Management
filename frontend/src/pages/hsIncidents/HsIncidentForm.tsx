import { hsIncidentApi } from '../../api/resources';
import { CrudFormPage } from '../crud/CrudFormPage';
import type { HsIncident } from '../../types/entities-p2p3';
import type { FieldDef } from '../../components/Form';

const fields: FieldDef<HsIncident>[] = [
  {
    name: 'incident_type', label: 'Incident Type', type: 'select', required: true,
    options: ['NearMiss', 'Injury', 'PropertyDamage', 'Spill', 'GasLeak', 'Other'].map((v) => ({ value: v, label: v })),
  },
  {
    name: 'severity', label: 'Severity', type: 'select', required: true,
    options: ['Low', 'Medium', 'High', 'Critical'].map((v) => ({ value: v, label: v })),
  },
  { name: 'vehicle_id', label: 'Vehicle ID (UUID)' },
  { name: 'driver_id', label: 'Driver ID (UUID)' },
  { name: 'location', label: 'Location' },
  { name: 'occurred_at', label: 'Occurred At', type: 'datetime-local', required: true },
  { name: 'reported_by', label: 'Reported By (User UUID)', required: true },
  { name: 'description', label: 'Description', type: 'textarea' },
  { name: 'injury_details', label: 'Injury Details', type: 'textarea' },
  { name: 'is_recordable', label: 'Is Recordable', type: 'checkbox' },
  {
    name: 'status', label: 'Status', type: 'select', required: true,
    options: ['Reported', 'UnderInvestigation', 'CorrectiveActionPending', 'Closed'].map((v) => ({ value: v, label: v })),
  },
];

export default function HsIncidentForm() {
  return (
    <CrudFormPage<HsIncident>
      title="H&S Incident"
      basePath="/hs-incidents"
      fields={fields}
      get={hsIncidentApi.get}
      create={hsIncidentApi.create}
      update={hsIncidentApi.update}
      defaults={{ incident_type: 'NearMiss', severity: 'Low', status: 'Reported', is_recordable: false }}
    />
  );
}
