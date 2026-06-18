import { integrationConfigApi } from '../../api/resources';
import { CrudListPage } from '../crud/CrudListPage';
import type { IntegrationConfig } from '../../types/entities-p2p3';

export default function IntegrationConfigList() {
  return (
    <CrudListPage<IntegrationConfig>
      title="Integration Configs"
      basePath="/integration-configs"
      rowKey={(r) => r.integration_config_id}
      list={integrationConfigApi.list}
      remove={integrationConfigApi.remove}
      columns={[
        { key: 'integration_name', header: 'Integration', sortable: true },
        { key: 'environment', header: 'Environment', sortable: true },
        { key: 'auth_type', header: 'Auth Type' },
        { key: 'is_enabled', header: 'Enabled' },
        { key: 'last_success_at', header: 'Last Success At' },
      ]}
    />
  );
}
