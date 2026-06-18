import { Link } from 'react-router-dom';
import { accompanimentApi } from '../../api/resources';
import { CrudListPage } from '../crud/CrudListPage';
import type { Accompaniment } from '../../types/entities';

export default function AccompanimentList() {
  return (
    <CrudListPage<Accompaniment>
      title="Accompaniments"
      basePath="/accompaniments"
      rowKey={(r) => r.accompaniment_id}
      list={accompanimentApi.list}
      remove={accompanimentApi.remove}
      columns={[
        { key: 'accompaniment_code', header: 'Code', sortable: true },
        { key: 'accompaniment_type', header: 'Type' },
        { key: 'size_or_spec', header: 'Size/Spec' },
        { key: 'current_status', header: 'Current Status' },
      ]}
      extraActions={(row) => (
        <Link to={`/accompaniments/${row.accompaniment_id}/issue`} className="text-emerald-600 hover:underline">Issue</Link>
      )}
    />
  );
}
