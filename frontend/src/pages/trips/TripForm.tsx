import { tripApi } from '../../api/resources';
import { CrudFormPage } from '../crud/CrudFormPage';
import type { TripMaster } from '../../types/entities-p2p3';
import type { FieldDef } from '../../components/Form';

const fields: FieldDef<TripMaster>[] = [
  { name: 'trip_no', label: 'Trip No', required: true },
  { name: 'vehicle_id', label: 'Vehicle ID (UUID)', required: true },
  { name: 'trailer_id', label: 'Trailer ID (UUID)' },
  { name: 'driver_id', label: 'Driver ID (UUID)' },
  { name: 'origin', label: 'Origin', required: true },
  { name: 'destination', label: 'Destination', required: true },
  { name: 'route_code', label: 'Route Code' },
  { name: 'customer_name', label: 'Customer Name' },
  { name: 'cargo_type', label: 'Cargo Type' },
  { name: 'planned_start_at', label: 'Planned Start At', type: 'datetime-local' },
  { name: 'actual_start_at', label: 'Actual Start At', type: 'datetime-local' },
  {
    name: 'status', label: 'Status', type: 'select', required: true,
    options: ['Planned', 'InTransit', 'Completed', 'Cancelled'].map((v) => ({ value: v, label: v })),
  },
];

export default function TripForm() {
  return (
    <CrudFormPage<TripMaster>
      title="Trip"
      basePath="/trips"
      fields={fields}
      get={tripApi.get}
      create={tripApi.create}
      update={tripApi.update}
      defaults={{ status: 'Planned' }}
    />
  );
}
