import { complianceApi } from '../../api/resources';
import { CrudFormPage } from '../crud/CrudFormPage';
import type { AssetCompliance } from '../../types/entities';
import type { FieldDef } from '../../components/Form';

const fields: FieldDef<AssetCompliance>[] = [
  { name: 'asset_type', label: 'Asset Type', type: 'select', required: true, options: [{ value: 'Vehicle', label: 'Vehicle' }, { value: 'Trailer', label: 'Trailer' }] },
  { name: 'asset_id', label: 'Asset ID (UUID)', required: true },
  { name: 'compliance_type_code', label: 'Compliance Type Code', required: true },
  { name: 'document_no', label: 'Document No' },
  { name: 'issued_by', label: 'Issued By' },
  { name: 'valid_from', label: 'Valid From', type: 'date' },
  { name: 'valid_upto', label: 'Valid Upto', type: 'date', required: true },
  { name: 'amount', label: 'Amount', type: 'number' },
  { name: 'document_url', label: 'Document URL' },
  {
    name: 'status', label: 'Status', type: 'select', required: true,
    options: ['Valid', 'ExpiringSoon', 'Expired', 'UnderRenewal', 'Exempted', 'NotApplicable'].map((v) => ({ value: v, label: v })),
  },
];

export default function ComplianceForm() {
  return (
    <CrudFormPage<AssetCompliance>
      title="Compliance Record"
      basePath="/compliance"
      fields={fields}
      get={complianceApi.get}
      create={complianceApi.create}
      update={complianceApi.update}
      defaults={{ asset_type: 'Vehicle', status: 'Valid' }}
    />
  );
}
