import { inspectionResultLineApi } from '../../api/resources';
import { CrudDetailPage } from '../crud/CrudDetailPage';
import type { InspectionResultLine } from '../../types/entities-p2p3';

export default function InspectionResultLineDetail() {
  return (
    <CrudDetailPage<InspectionResultLine>
      title="Inspection Result Line Detail"
      basePath="/inspection-result-lines"
      get={inspectionResultLineApi.get}
      fieldsToShow={[
        { key: 'inspection_id', label: 'Inspection ID' },
        { key: 'check_item_code', label: 'Check Item Code' },
        { key: 'check_item_name', label: 'Check Item Name' },
        { key: 'result', label: 'Result' },
        { key: 'severity', label: 'Severity' },
        { key: 'photo_url', label: 'Photo URL' },
        { key: 'remarks', label: 'Remarks' },
      ]}
    />
  );
}
