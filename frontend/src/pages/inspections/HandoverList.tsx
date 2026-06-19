import { handoverDocumentApi } from '../../api/resources';
import { CrudListPage } from '../crud/CrudListPage';
import type { HandoverDocument } from '../../types/entities-p2p3';

export default function HandoverList() {
  return (
    <CrudListPage<HandoverDocument>
      title="Handover Documents"
      basePath="/handovers"
      rowKey={(r) => r.handover_id}
      list={handoverDocumentApi.list}
      canCreate={false}
      columns={[
        { key: 'handover_type', header: 'Type', sortable: true },
        { key: 'handed_over_by', header: 'Handed Over By' },
        { key: 'received_by', header: 'Received By' },
        { key: 'handover_date', header: 'Handover Date', sortable: true },
        { key: 'accepted', header: 'Accepted' },
      ]}
    />
  );
}
