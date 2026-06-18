import { routeFuelNormApi } from '../../api/resources';
import { CrudFormPage } from '../crud/CrudFormPage';
import type { RouteFuelNorm } from '../../types/entities-p2p3';
import type { FieldDef } from '../../components/Form';

const fields: FieldDef<RouteFuelNorm>[] = [
  { name: 'route_code', label: 'Route Code', required: true },
  { name: 'origin', label: 'Origin', required: true },
  { name: 'destination', label: 'Destination', required: true },
  { name: 'vehicle_type', label: 'Vehicle Type', required: true },
  { name: 'fuel_type', label: 'Fuel Type', required: true },
  { name: 'planned_quantity', label: 'Planned Quantity', type: 'number', required: true },
  { name: 'planned_toll_amount', label: 'Planned Toll Amount', type: 'number' },
  { name: 'distance_km', label: 'Distance (KM)', type: 'number' },
  { name: 'effective_from', label: 'Effective From', type: 'date', required: true },
  {
    name: 'status', label: 'Status', type: 'select', required: true,
    options: ['Active', 'Inactive'].map((v) => ({ value: v, label: v })),
  },
];

export default function RouteFuelNormForm() {
  return (
    <CrudFormPage<RouteFuelNorm>
      title="Route Fuel Norm"
      basePath="/route-fuel-norms"
      fields={fields}
      get={routeFuelNormApi.get}
      create={routeFuelNormApi.create}
      update={routeFuelNormApi.update}
      defaults={{ status: 'Active' }}
    />
  );
}
