import { complianceAlertApi } from '../../api/resources';
import { CrudDetailPage } from '../crud/CrudDetailPage';
import type { ComplianceAlertRecord } from '../../types/entities-p2p3';

export default function ComplianceAlertDetail() {
  return (
    <CrudDetailPage<ComplianceAlertRecord>
      title="Compliance Alert Detail"
      basePath="/compliance-alerts"
      get={complianceAlertApi.get}
      fieldsToShow={[
        { key: 'asset_compliance_id', label: 'Asset Compliance ID' },
        { key: 'alert_date', label: 'Alert Date' },
        { key: 'days_to_expiry', label: 'Days to Expiry' },
        { key: 'severity', label: 'Severity' },
        { key: 'status', label: 'Status' },
        { key: 'assigned_to_user_id', label: 'Assigned To' },
      ]}
    />
  );
}
