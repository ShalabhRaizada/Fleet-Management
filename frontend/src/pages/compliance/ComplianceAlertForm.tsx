import { complianceAlertApi } from '../../api/resources';
import { CrudFormPage } from '../crud/CrudFormPage';
import type { ComplianceAlertRecord } from '../../types/entities-p2p3';
import type { FieldDef } from '../../components/Form';

const fields: FieldDef<ComplianceAlertRecord>[] = [
  { name: 'asset_compliance_id', label: 'Asset Compliance ID (UUID)', required: true },
  { name: 'alert_date', label: 'Alert Date', type: 'date', required: true },
  { name: 'days_to_expiry', label: 'Days to Expiry', type: 'number', required: true },
  {
    name: 'severity', label: 'Severity', type: 'select', required: true,
    options: ['Info', 'Warning', 'Critical'].map((v) => ({ value: v, label: v })),
  },
  {
    name: 'status', label: 'Status', type: 'select', required: true,
    options: ['Open', 'Closed', 'Snoozed'].map((v) => ({ value: v, label: v })),
  },
  { name: 'assigned_to_user_id', label: 'Assigned To (User ID)' },
];

export default function ComplianceAlertForm() {
  return (
    <CrudFormPage<ComplianceAlertRecord>
      title="Compliance Alert"
      basePath="/compliance-alerts"
      fields={fields}
      get={complianceAlertApi.get}
      create={complianceAlertApi.create}
      update={complianceAlertApi.update}
      defaults={{ severity: 'Info', status: 'Open' }}
    />
  );
}
