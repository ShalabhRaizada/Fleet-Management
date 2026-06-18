import { trailerApi } from '../../api/resources';
import { CrudListPage } from '../crud/CrudListPage';
import type { Trailer } from '../../types/entities';

export default function TrailerList() {
  return (
    <CrudListPage<Trailer>
      title="Trailers"
      basePath="/trailers"
      rowKey={(r) => r.trailer_id}
      list={trailerApi.list}
      remove={trailerApi.remove}
      columns={[
        { key: 'trailer_no', header: 'Trailer No', sortable: true },
        { key: 'trailer_type', header: 'Type' },
        { key: 'body_type', header: 'Body Type' },
        { key: 'axle_count', header: 'Axles' },
        { key: 'status', header: 'Status', sortable: true },
      ]}
    />
  );
}
