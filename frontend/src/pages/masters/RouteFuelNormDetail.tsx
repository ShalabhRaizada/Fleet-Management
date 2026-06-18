import { routeFuelNormApi } from '../../api/resources';
import { CrudDetailPage } from '../crud/CrudDetailPage';
import type { RouteFuelNorm } from '../../types/entities-p2p3';

export default function RouteFuelNormDetail() {
  return (
    <CrudDetailPage<RouteFuelNorm>
      title="Route Fuel Norm Detail"
      basePath="/route-fuel-norms"
      get={routeFuelNormApi.get}
      fieldsToShow={[
        { key: 'route_code', label: 'Route Code' },
        { key: 'origin', label: 'Origin' },
        { key: 'destination', label: 'Destination' },
        { key: 'vehicle_type', label: 'Vehicle Type' },
        { key: 'fuel_type', label: 'Fuel Type' },
        { key: 'planned_quantity', label: 'Planned Quantity' },
        { key: 'planned_toll_amount', label: 'Planned Toll Amount' },
        { key: 'distance_km', label: 'Distance (KM)' },
        { key: 'effective_from', label: 'Effective From' },
        { key: 'status', label: 'Status' },
      ]}
    />
  );
}
