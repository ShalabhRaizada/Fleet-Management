import { approvalMatrixApi } from '../../api/resources';
import { CrudFormPage } from '../crud/CrudFormPage';
import type { ApprovalMatrix } from '../../types/entities-p2p3';
import type { FieldDef } from '../../components/Form';

const fields: FieldDef<ApprovalMatrix>[] = [
  { name: 'transaction_type', label: 'Transaction Type', required: true },
  { name: 'branch_id', label: 'Branch ID (UUID)' },
  { name: 'amount_from', label: 'Amount From', type: 'number' },
  { name: 'amount_to', label: 'Amount To', type: 'number' },
  { name: 'approval_level', label: 'Approval Level', type: 'number', required: true },
  { name: 'role_code', label: 'Role Code', required: true },
  { name: 'is_active', label: 'Active', type: 'checkbox', required: true },
];

export default function ApprovalMatrixForm() {
  return (
    <CrudFormPage<ApprovalMatrix>
      title="Approval Matrix Rule"
      basePath="/approval-matrix"
      fields={fields}
      get={approvalMatrixApi.get}
      create={approvalMatrixApi.create}
      update={approvalMatrixApi.update}
      defaults={{ is_active: true }}
    />
  );
}
