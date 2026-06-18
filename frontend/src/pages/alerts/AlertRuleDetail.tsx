import { alertRuleApi } from '../../api/resources';
import { CrudDetailPage } from '../crud/CrudDetailPage';
import type { AlertRule } from '../../types/entities-p2p3';

export default function AlertRuleDetail() {
  return (
    <CrudDetailPage<AlertRule>
      title="Alert Rule Detail"
      basePath="/alert-rules"
      get={alertRuleApi.get}
      fieldsToShow={[
        { key: 'alert_type', label: 'Alert Type' },
        { key: 'entity_type', label: 'Entity Type' },
        { key: 'threshold_value', label: 'Threshold Value' },
        { key: 'threshold_unit', label: 'Threshold Unit' },
        { key: 'severity', label: 'Severity' },
        { key: 'notify_role_code', label: 'Notify Role Code' },
        { key: 'is_active', label: 'Active' },
      ]}
    />
  );
}
