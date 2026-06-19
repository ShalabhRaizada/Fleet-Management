import { handoverDocumentApi } from '../../api/resources';
import { CrudDetailPage } from '../crud/CrudDetailPage';
import type { HandoverDocument } from '../../types/entities-p2p3';

export default function HandoverDetail() {
  return (
    <CrudDetailPage<HandoverDocument>
      title="Handover Document Detail"
      basePath="/handovers"
      get={handoverDocumentApi.get}
      fieldsToShow={[
        { key: 'inspection_event_id', label: 'Inspection Event ID' },
        { key: 'vehicle_id', label: 'Vehicle ID' },
        { key: 'handover_type', label: 'Handover Type' },
        { key: 'handed_over_by', label: 'Handed Over By' },
        { key: 'received_by', label: 'Received By' },
        { key: 'handover_date', label: 'Handover Date' },
        { key: 'driver_signature_name', label: 'Driver Signature Name' },
        { key: 'acceptance_remarks', label: 'Acceptance Remarks' },
        { key: 'accepted', label: 'Accepted' },
      ]}
    />
  );
}
