import { approvalMatrixApi } from '../../api/resources';
import { CrudDetailPage } from '../crud/CrudDetailPage';
import type { ApprovalMatrix } from '../../types/entities-p2p3';

export default function ApprovalMatrixDetail() {
  return (
    <CrudDetailPage<ApprovalMatrix>
      title="Approval Matrix Detail"
      basePath="/approval-matrix"
      get={approvalMatrixApi.get}
      fieldsToShow={[
        { key: 'transaction_type', label: 'Transaction Type' },
        { key: 'branch_id', label: 'Branch ID' },
        { key: 'amount_from', label: 'Amount From' },
        { key: 'amount_to', label: 'Amount To' },
        { key: 'approval_level', label: 'Approval Level' },
        { key: 'role_code', label: 'Role Code' },
        { key: 'is_active', label: 'Active' },
      ]}
    />
  );
}
