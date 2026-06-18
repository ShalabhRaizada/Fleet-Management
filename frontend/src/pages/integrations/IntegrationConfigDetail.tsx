import { integrationConfigApi } from '../../api/resources';
import { CrudDetailPage } from '../crud/CrudDetailPage';
import type { IntegrationConfig } from '../../types/entities-p2p3';

export default function IntegrationConfigDetail() {
  return (
    <CrudDetailPage<IntegrationConfig>
      title="Integration Config Detail"
      basePath="/integration-configs"
      get={integrationConfigApi.get}
      fieldsToShow={[
        { key: 'integration_name', label: 'Integration Name' },
        { key: 'environment', label: 'Environment' },
        { key: 'base_url', label: 'Base URL' },
        { key: 'auth_type', label: 'Auth Type' },
        { key: 'credential_ref', label: 'Credential Reference' },
        { key: 'is_enabled', label: 'Enabled' },
        { key: 'last_success_at', label: 'Last Success At' },
      ]}
    />
  );
}
