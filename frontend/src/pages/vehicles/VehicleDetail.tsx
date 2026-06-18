import { vehicleApi } from '../../api/resources';
import { CrudDetailPage } from '../crud/CrudDetailPage';
import type { Vehicle } from '../../types/entities';

export default function VehicleDetail() {
  return (
    <CrudDetailPage<Vehicle>
      title="Vehicle Detail"
      basePath="/vehicles"
      get={vehicleApi.get}
      fieldsToShow={[
        { key: 'registration_no', label: 'Registration No' },
        { key: 'vehicle_code', label: 'Code' },
        { key: 'ownership_type', label: 'Ownership Type' },
        { key: 'vehicle_category', label: 'Category' },
        { key: 'vehicle_type', label: 'Type' },
        { key: 'fuel_type', label: 'Fuel Type' },
        { key: 'make', label: 'Make' },
        { key: 'model', label: 'Model' },
        { key: 'manufacture_year', label: 'Manufacture Year' },
        { key: 'vin_no', label: 'VIN No' },
        { key: 'chassis_no', label: 'Chassis No' },
        { key: 'engine_no', label: 'Engine No' },
        { key: 'gvw_kg', label: 'GVW (kg)' },
        { key: 'payload_capacity_kg', label: 'Payload Capacity (kg)' },
        { key: 'current_odometer_km', label: 'Current Odometer (km)' },
        { key: 'status', label: 'Status' },
      ]}
    />
  );
}
