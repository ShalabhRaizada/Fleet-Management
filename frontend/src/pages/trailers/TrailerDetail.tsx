import { trailerApi } from '../../api/resources';
import { CrudDetailPage } from '../crud/CrudDetailPage';
import type { Trailer } from '../../types/entities';

export default function TrailerDetail() {
  return (
    <CrudDetailPage<Trailer>
      title="Trailer Detail"
      basePath="/trailers"
      get={trailerApi.get}
      fieldsToShow={[
        { key: 'trailer_no', label: 'Trailer No' },
        { key: 'trailer_type', label: 'Type' },
        { key: 'body_type', label: 'Body Type' },
        { key: 'chassis_no', label: 'Chassis No' },
        { key: 'payload_capacity_kg', label: 'Payload Capacity (kg)' },
        { key: 'axle_count', label: 'Axle Count' },
        { key: 'status', label: 'Status' },
      ]}
    />
  );
}
