import { integrationConfigApi } from '../../api/resources';
import { CrudFormPage } from '../crud/CrudFormPage';
import type { IntegrationConfig } from '../../types/entities-p2p3';
import type { FieldDef } from '../../components/Form';

const fields: FieldDef<IntegrationConfig>[] = [
  {
    name: 'integration_name', label: 'Integration Name', type: 'select', required: true,
    options: ['ULIP', 'FASTag', 'GPS', 'OBD', 'EVCharging', 'FuelVendor', 'OCR'].map((v) => ({ value: v, label: v })),
  },
  {
    name: 'environment', label: 'Environment', type: 'select', required: true,
    options: ['Dev', 'UAT', 'Prod'].map((v) => ({ value: v, label: v })),
  },
  { name: 'base_url', label: 'Base URL' },
  {
    name: 'auth_type', label: 'Auth Type', type: 'select',
    options: ['OAuth', 'APIKey', 'mTLS', 'Basic'].map((v) => ({ value: v, label: v })),
  },
  { name: 'credential_ref', label: 'Credential Reference' },
  { name: 'is_enabled', label: 'Enabled', type: 'checkbox', required: true },
  { name: 'last_success_at', label: 'Last Success At', type: 'datetime-local' },
];

export default function IntegrationConfigForm() {
  return (
    <CrudFormPage<IntegrationConfig>
      title="Integration Config"
      basePath="/integration-configs"
      fields={fields}
      get={integrationConfigApi.get}
      create={integrationConfigApi.create}
      update={integrationConfigApi.update}
      defaults={{ environment: 'Dev', is_enabled: true }}
    />
  );
}
