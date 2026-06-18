import { vehicleApi } from '../../api/resources';
import { CrudListPage } from '../crud/CrudListPage';
import type { Vehicle } from '../../types/entities';

export default function VehicleList() {
  return (
    <CrudListPage<Vehicle>
      title="Vehicles"
      basePath="/vehicles"
      rowKey={(r) => r.vehicle_id}
      list={vehicleApi.list}
      remove={vehicleApi.remove}
      columns={[
        { key: 'registration_no', header: 'Registration No', sortable: true },
        { key: 'vehicle_code', header: 'Code' },
        { key: 'vehicle_category', header: 'Category' },
        { key: 'vehicle_type', header: 'Type' },
        { key: 'fuel_type', header: 'Fuel' },
        { key: 'make', header: 'Make' },
        { key: 'model', header: 'Model' },
        { key: 'status', header: 'Status', sortable: true },
      ]}
    />
  );
}
