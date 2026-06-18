import { ulipApiLogApi } from '../../api/resources';
import { CrudDetailPage } from '../crud/CrudDetailPage';
import type { UlipApiLog } from '../../types/entities-p2p3';

export default function UlipApiLogDetail() {
  return (
    <CrudDetailPage<UlipApiLog>
      title="ULIP API Log Detail"
      basePath="/ulip-api-logs"
      get={ulipApiLogApi.get}
      fieldsToShow={[
        { key: 'api_name', label: 'API Name' },
        { key: 'reference_type', label: 'Reference Type' },
        { key: 'reference_id', label: 'Reference ID' },
        { key: 'request_payload', label: 'Request Payload' },
        { key: 'response_payload', label: 'Response Payload' },
        { key: 'http_status_code', label: 'HTTP Status Code' },
        { key: 'api_status', label: 'API Status' },
        { key: 'error_message', label: 'Error Message' },
        { key: 'created_at', label: 'Created At' },
      ]}
    />
  );
}
