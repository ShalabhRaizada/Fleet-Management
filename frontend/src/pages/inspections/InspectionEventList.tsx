import { inspectionEventApi } from '../../api/resources';
import { CrudListPage } from '../crud/CrudListPage';
import type { InspectionEvent } from '../../types/entities-p2p3';

export default function InspectionEventList() {
  return (
    <CrudListPage<InspectionEvent>
      title="Inspection Events"
      basePath="/inspection-events"
      rowKey={(r) => r.inspection_id}
      list={inspectionEventApi.list}
      remove={inspectionEventApi.remove}
      columns={[
        { key: 'asset_type', header: 'Asset Type', sortable: true },
        { key: 'asset_id', header: 'Asset ID' },
        { key: 'inspection_datetime', header: 'Inspection Datetime', sortable: true },
        { key: 'outcome', header: 'Outcome', sortable: true },
      ]}
    />
  );
}
