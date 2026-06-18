import { routeFuelNormApi } from '../../api/resources';
import { CrudListPage } from '../crud/CrudListPage';
import type { RouteFuelNorm } from '../../types/entities-p2p3';

export default function RouteFuelNormList() {
  return (
    <CrudListPage<RouteFuelNorm>
      title="Route Fuel Norms"
      basePath="/route-fuel-norms"
      rowKey={(r) => r.route_fuel_norm_id}
      list={routeFuelNormApi.list}
      remove={routeFuelNormApi.remove}
      columns={[
        { key: 'route_code', header: 'Route Code' },
        { key: 'origin', header: 'Origin' },
        { key: 'destination', header: 'Destination' },
        { key: 'vehicle_type', header: 'Vehicle Type' },
        { key: 'planned_quantity', header: 'Planned Qty' },
        { key: 'status', header: 'Status', sortable: true },
      ]}
    />
  );
}
