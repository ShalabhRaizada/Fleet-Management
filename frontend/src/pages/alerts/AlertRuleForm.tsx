import { alertRuleApi } from '../../api/resources';
import { CrudFormPage } from '../crud/CrudFormPage';
import type { AlertRule } from '../../types/entities-p2p3';
import type { FieldDef } from '../../components/Form';

const fields: FieldDef<AlertRule>[] = [
  { name: 'alert_type', label: 'Alert Type', required: true },
  { name: 'entity_type', label: 'Entity Type', required: true },
  { name: 'threshold_value', label: 'Threshold Value', type: 'number' },
  {
    name: 'threshold_unit', label: 'Threshold Unit', type: 'select',
    options: ['Days', 'KM', 'Hours', 'Percent', 'Amount'].map((v) => ({ value: v, label: v })),
  },
  {
    name: 'severity', label: 'Severity', type: 'select', required: true,
    options: ['Info', 'Warning', 'Critical'].map((v) => ({ value: v, label: v })),
  },
  { name: 'notify_role_code', label: 'Notify Role Code' },
  { name: 'is_active', label: 'Active', type: 'checkbox', required: true },
];

export default function AlertRuleForm() {
  return (
    <CrudFormPage<AlertRule>
      title="Alert Rule"
      basePath="/alert-rules"
      fields={fields}
      get={alertRuleApi.get}
      create={alertRuleApi.create}
      update={alertRuleApi.update}
      defaults={{ severity: 'Warning', is_active: true }}
    />
  );
}
