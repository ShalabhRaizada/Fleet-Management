import { inspectionEventApi } from '../../api/resources';
import { CrudDetailPage } from '../crud/CrudDetailPage';
import type { InspectionEvent } from '../../types/entities-p2p3';

export default function InspectionEventDetail() {
  return (
    <CrudDetailPage<InspectionEvent>
      title="Inspection Event Detail"
      basePath="/inspection-events"
      get={inspectionEventApi.get}
      fieldsToShow={[
        { key: 'template_id', label: 'Template ID' },
        { key: 'asset_type', label: 'Asset Type' },
        { key: 'asset_id', label: 'Asset ID' },
        { key: 'vehicle_id', label: 'Vehicle ID' },
        { key: 'trailer_id', label: 'Trailer ID' },
        { key: 'performed_by_user_id', label: 'Performed By' },
        { key: 'inspection_datetime', label: 'Inspection Datetime' },
        { key: 'outcome', label: 'Outcome' },
        { key: 'remarks', label: 'Remarks' },
        { key: 'job_card_id', label: 'Job Card ID' },
      ]}
    />
  );
}
