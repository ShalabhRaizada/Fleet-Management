import { tyreApi } from '../../api/resources';
import { CrudListPage } from '../crud/CrudListPage';
import type { Tyre } from '../../types/entities';

export default function TyreList() {
  return (
    <CrudListPage<Tyre>
      title="Tyres"
      basePath="/tyres"
      rowKey={(r) => r.tyre_id}
      list={tyreApi.list}
      remove={tyreApi.remove}
      columns={[
        { key: 'tyre_serial_no', header: 'Serial No', sortable: true },
        { key: 'brand', header: 'Brand' },
        { key: 'model', header: 'Model' },
        { key: 'size', header: 'Size' },
        { key: 'current_position', header: 'Position' },
        { key: 'status', header: 'Status', sortable: true },
      ]}
    />
  );
}
