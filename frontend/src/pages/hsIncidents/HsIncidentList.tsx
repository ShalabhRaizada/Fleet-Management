import { hsIncidentApi } from '../../api/resources';
import { CrudListPage } from '../crud/CrudListPage';
import type { HsIncident } from '../../types/entities-p2p3';

export default function HsIncidentList() {
  return (
    <CrudListPage<HsIncident>
      title="H&S Incidents"
      basePath="/hs-incidents"
      rowKey={(r) => r.incident_id}
      list={hsIncidentApi.list}
      remove={hsIncidentApi.remove}
      columns={[
        { key: 'incident_type', header: 'Type', sortable: true },
        { key: 'severity', header: 'Severity', sortable: true },
        { key: 'location', header: 'Location' },
        { key: 'occurred_at', header: 'Occurred At', sortable: true },
        { key: 'is_recordable', header: 'Recordable' },
        { key: 'status', header: 'Status', sortable: true },
      ]}
    />
  );
}
