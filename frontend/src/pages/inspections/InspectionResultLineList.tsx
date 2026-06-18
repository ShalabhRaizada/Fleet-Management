import { inspectionResultLineApi } from '../../api/resources';
import { CrudListPage } from '../crud/CrudListPage';
import type { InspectionResultLine } from '../../types/entities-p2p3';

export default function InspectionResultLineList() {
  return (
    <CrudListPage<InspectionResultLine>
      title="Inspection Result Lines"
      basePath="/inspection-result-lines"
      rowKey={(r) => r.inspection_line_id}
      list={inspectionResultLineApi.list}
      remove={inspectionResultLineApi.remove}
      columns={[
        { key: 'inspection_id', header: 'Inspection ID' },
        { key: 'check_item_name', header: 'Check Item' },
        { key: 'result', header: 'Result', sortable: true },
        { key: 'severity', header: 'Severity', sortable: true },
      ]}
    />
  );
}
