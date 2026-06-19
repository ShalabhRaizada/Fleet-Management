import { userRecordApi } from '../../api/resources';
import { CrudDetailPage } from '../crud/CrudDetailPage';
import type { UserRecord } from '../../types/entities-p2p3';

export default function UserDetail() {
  return (
    <CrudDetailPage<UserRecord>
      title="User Detail"
      basePath="/users"
      get={userRecordApi.get}
      fieldsToShow={[
        { key: 'login_id', label: 'Login ID' },
        { key: 'display_name', label: 'Display Name' },
        { key: 'mobile_no', label: 'Mobile No' },
        { key: 'email', label: 'Email' },
        { key: 'role_code', label: 'Role' },
        { key: 'branch_id', label: 'Branch ID' },
        { key: 'status', label: 'Status' },
      ]}
    />
  );
}
