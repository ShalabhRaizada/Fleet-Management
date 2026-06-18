import { accidentEventApi } from '../../api/resources';
import { CrudListPage } from '../crud/CrudListPage';
import type { AccidentEvent } from '../../types/entities-p2p3';

export default function AccidentEventList() {
  return (
    <CrudListPage<AccidentEvent>
      title="Accident Events"
      basePath="/accident-events"
      rowKey={(r) => r.accident_id}
      list={accidentEventApi.list}
      remove={accidentEventApi.remove}
      columns={[
        { key: 'vehicle_id', header: 'Vehicle ID' },
        { key: 'accident_datetime', header: 'Accident Datetime', sortable: true },
        { key: 'fir_no', header: 'FIR No' },
        { key: 'claim_status', header: 'Claim Status', sortable: true },
        { key: 'status', header: 'Status', sortable: true },
      ]}
    />
  );
}
