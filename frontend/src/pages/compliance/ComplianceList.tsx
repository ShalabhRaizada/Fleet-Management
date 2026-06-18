import { complianceApi } from '../../api/resources';
import { CrudListPage } from '../crud/CrudListPage';
import type { AssetCompliance } from '../../types/entities';

export default function ComplianceList() {
  return (
    <CrudListPage<AssetCompliance>
      title="Compliance Register"
      basePath="/compliance"
      rowKey={(r) => r.asset_compliance_id}
      list={complianceApi.list}
      remove={complianceApi.remove}
      columns={[
        { key: 'asset_type', header: 'Asset Type' },
        { key: 'compliance_type_code', header: 'Compliance Type' },
        { key: 'document_no', header: 'Document No' },
        { key: 'valid_upto', header: 'Valid Upto', render: (r) => new Date(r.valid_upto).toLocaleDateString(), sortable: true },
        { key: 'status', header: 'Status', sortable: true },
      ]}
    />
  );
}
