import { accessoryApi } from '../../api/resources';
import { CrudListPage } from '../crud/CrudListPage';
import type { Accessory } from '../../types/entities';

export default function AccessoryList() {
  return (
    <CrudListPage<Accessory>
      title="Accessories"
      basePath="/accessories"
      rowKey={(r) => r.accessory_id}
      list={accessoryApi.list}
      remove={accessoryApi.remove}
      columns={[
        { key: 'accessory_code', header: 'Code', sortable: true },
        { key: 'accessory_type', header: 'Type' },
        { key: 'serial_no', header: 'Serial No' },
        { key: 'health_status', header: 'Health' },
        { key: 'status', header: 'Status', sortable: true },
      ]}
    />
  );
}
