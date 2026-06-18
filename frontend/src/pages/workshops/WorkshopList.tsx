import { workshopApi } from '../../api/resources';
import { CrudListPage } from '../crud/CrudListPage';
import type { Workshop } from '../../types/entities';

export default function WorkshopList() {
  return (
    <CrudListPage<Workshop>
      title="Workshops"
      basePath="/workshops"
      rowKey={(r) => r.workshop_id}
      list={workshopApi.list}
      remove={workshopApi.remove}
      columns={[
        { key: 'workshop_code', header: 'Code', sortable: true },
        { key: 'workshop_name', header: 'Name' },
        { key: 'workshop_type', header: 'Type' },
        { key: 'gstin', header: 'GSTIN' },
        { key: 'status', header: 'Status' },
      ]}
    />
  );
}
