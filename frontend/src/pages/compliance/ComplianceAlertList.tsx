import { complianceAlertApi } from '../../api/resources';
import { CrudListPage } from '../crud/CrudListPage';
import type { ComplianceAlertRecord } from '../../types/entities-p2p3';

export default function ComplianceAlertList() {
  return (
    <CrudListPage<ComplianceAlertRecord>
      title="Compliance Alerts"
      basePath="/compliance-alerts"
      rowKey={(r) => r.compliance_alert_id}
      list={complianceAlertApi.list}
      remove={complianceAlertApi.remove}
      columns={[
        { key: 'alert_date', header: 'Alert Date', sortable: true },
        { key: 'days_to_expiry', header: 'Days to Expiry' },
        { key: 'severity', header: 'Severity', sortable: true },
        { key: 'status', header: 'Status', sortable: true },
      ]}
    />
  );
}
