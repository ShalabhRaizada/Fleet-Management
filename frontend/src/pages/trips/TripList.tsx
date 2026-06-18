import { tripApi } from '../../api/resources';
import { CrudListPage } from '../crud/CrudListPage';
import type { TripMaster } from '../../types/entities-p2p3';

export default function TripList() {
  return (
    <CrudListPage<TripMaster>
      title="Trips"
      basePath="/trips"
      rowKey={(r) => r.trip_id}
      list={tripApi.list}
      remove={tripApi.remove}
      columns={[
        { key: 'trip_no', header: 'Trip No' },
        { key: 'origin', header: 'Origin' },
        { key: 'destination', header: 'Destination' },
        { key: 'customer_name', header: 'Customer' },
        { key: 'status', header: 'Status', sortable: true },
      ]}
    />
  );
}
