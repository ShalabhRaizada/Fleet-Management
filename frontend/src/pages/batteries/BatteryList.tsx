import { batteryApi } from '../../api/resources';
import { CrudListPage } from '../crud/CrudListPage';
import type { Battery } from '../../types/entities';

export default function BatteryList() {
  return (
    <CrudListPage<Battery>
      title="Batteries"
      basePath="/batteries"
      rowKey={(r) => r.battery_id}
      list={batteryApi.list}
      remove={batteryApi.remove}
      columns={[
        { key: 'battery_serial_no', header: 'Serial No', sortable: true },
        { key: 'oem_name', header: 'OEM' },
        { key: 'capacity_ah', header: 'Capacity (Ah)' },
        { key: 'voltage', header: 'Voltage' },
        { key: 'fitment_date', header: 'Fitment Date', sortable: true },
        { key: 'status', header: 'Status', sortable: true },
      ]}
    />
  );
}
