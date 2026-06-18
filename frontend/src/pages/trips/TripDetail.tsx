import { tripApi } from '../../api/resources';
import { CrudDetailPage } from '../crud/CrudDetailPage';
import type { TripMaster } from '../../types/entities-p2p3';

export default function TripDetail() {
  return (
    <CrudDetailPage<TripMaster>
      title="Trip Detail"
      basePath="/trips"
      get={tripApi.get}
      fieldsToShow={[
        { key: 'trip_no', label: 'Trip No' },
        { key: 'vehicle_id', label: 'Vehicle ID' },
        { key: 'trailer_id', label: 'Trailer ID' },
        { key: 'driver_id', label: 'Driver ID' },
        { key: 'origin', label: 'Origin' },
        { key: 'destination', label: 'Destination' },
        { key: 'route_code', label: 'Route Code' },
        { key: 'customer_name', label: 'Customer Name' },
        { key: 'cargo_type', label: 'Cargo Type' },
        { key: 'planned_start_at', label: 'Planned Start At' },
        { key: 'actual_start_at', label: 'Actual Start At' },
        { key: 'status', label: 'Status' },
      ]}
    />
  );
}
