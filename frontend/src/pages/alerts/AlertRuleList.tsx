import { alertRuleApi } from '../../api/resources';
import { CrudListPage } from '../crud/CrudListPage';
import type { AlertRule } from '../../types/entities-p2p3';

export default function AlertRuleList() {
  return (
    <CrudListPage<AlertRule>
      title="Alert Rules"
      basePath="/alert-rules"
      rowKey={(r) => r.alert_rule_id}
      list={alertRuleApi.list}
      remove={alertRuleApi.remove}
      columns={[
        { key: 'alert_type', header: 'Alert Type' },
        { key: 'entity_type', header: 'Entity Type' },
        { key: 'threshold_value', header: 'Threshold' },
        { key: 'severity', header: 'Severity', sortable: true },
        { key: 'is_active', header: 'Active' },
      ]}
    />
  );
}
