import { approvalMatrixApi } from '../../api/resources';
import { CrudListPage } from '../crud/CrudListPage';
import type { ApprovalMatrix } from '../../types/entities-p2p3';

export default function ApprovalMatrixList() {
  return (
    <CrudListPage<ApprovalMatrix>
      title="Approval Matrix"
      basePath="/approval-matrix"
      rowKey={(r) => r.approval_matrix_id}
      list={approvalMatrixApi.list}
      remove={approvalMatrixApi.remove}
      columns={[
        { key: 'transaction_type', header: 'Transaction Type' },
        { key: 'amount_from', header: 'Amount From' },
        { key: 'amount_to', header: 'Amount To' },
        { key: 'approval_level', header: 'Level' },
        { key: 'role_code', header: 'Role' },
        { key: 'is_active', header: 'Active' },
      ]}
    />
  );
}
