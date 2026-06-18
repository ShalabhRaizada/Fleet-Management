import { accessoryApi } from '../../api/resources';
import { CrudDetailPage } from '../crud/CrudDetailPage';
import type { Accessory } from '../../types/entities';

export default function AccessoryDetail() {
  return (
    <CrudDetailPage<Accessory>
      title="Accessory Detail"
      basePath="/accessories"
      get={accessoryApi.get}
      fieldsToShow={[
        { key: 'accessory_code', label: 'Code' },
        { key: 'accessory_type', label: 'Type' },
        { key: 'serial_no', label: 'Serial No' },
        { key: 'sim_no', label: 'SIM No' },
        { key: 'imei_no', label: 'IMEI No' },
        { key: 'current_vehicle_id', label: 'Current Vehicle ID' },
        { key: 'health_status', label: 'Health Status' },
        { key: 'status', label: 'Status' },
      ]}
    />
  );
}
