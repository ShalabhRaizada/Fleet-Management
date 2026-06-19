import { auditLogApi } from '../../api/resources';
import { CrudListPage } from '../crud/CrudListPage';
import type { AuditLog } from '../../types/entities-p2p3';

export default function AuditLogList() {
  return (
    <CrudListPage<AuditLog>
      title="Audit Log"
      basePath="/audit-log"
      rowKey={(r) => r.audit_id}
      list={auditLogApi.list}
      canCreate={false}
      columns={[
        { key: 'table_name', header: 'Table', sortable: true },
        { key: 'record_id', header: 'Record ID' },
        { key: 'action', header: 'Action', sortable: true },
        { key: 'changed_by', header: 'Changed By' },
        { key: 'changed_at', header: 'Changed At', sortable: true },
        { key: 'legal_hold', header: 'Legal Hold' },
      ]}
    />
  );
}
