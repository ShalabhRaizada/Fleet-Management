import { complianceApi } from '../../api/resources';
import { CrudDetailPage } from '../crud/CrudDetailPage';
import type { AssetCompliance } from '../../types/entities';

export default function ComplianceDetail() {
  return (
    <CrudDetailPage<AssetCompliance>
      title="Compliance Detail"
      basePath="/compliance"
      get={complianceApi.get}
      fieldsToShow={[
        { key: 'asset_type', label: 'Asset Type' },
        { key: 'asset_id', label: 'Asset ID' },
        { key: 'compliance_type_code', label: 'Compliance Type' },
        { key: 'document_no', label: 'Document No' },
        { key: 'issued_by', label: 'Issued By' },
        { key: 'valid_from', label: 'Valid From' },
        { key: 'valid_upto', label: 'Valid Upto' },
        { key: 'amount', label: 'Amount' },
        { key: 'status', label: 'Status' },
      ]}
    />
  );
}
