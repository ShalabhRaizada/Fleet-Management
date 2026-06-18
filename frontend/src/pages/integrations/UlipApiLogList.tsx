import { ulipApiLogApi } from '../../api/resources';
import { CrudListPage } from '../crud/CrudListPage';
import type { UlipApiLog } from '../../types/entities-p2p3';

export default function UlipApiLogList() {
  return (
    <CrudListPage<UlipApiLog>
      title="ULIP API Logs"
      basePath="/ulip-api-logs"
      rowKey={(r) => r.api_log_id}
      list={ulipApiLogApi.list}
      canCreate={false}
      columns={[
        { key: 'api_name', header: 'API Name' },
        { key: 'reference_type', header: 'Reference Type' },
        { key: 'http_status_code', header: 'HTTP Status' },
        { key: 'api_status', header: 'API Status', sortable: true },
        { key: 'created_at', header: 'Created At', sortable: true },
      ]}
    />
  );
}
