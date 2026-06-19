import { userRecordApi } from '../../api/resources';
import { CrudListPage } from '../crud/CrudListPage';
import type { UserRecord } from '../../types/entities-p2p3';

export default function UserList() {
  return (
    <CrudListPage<UserRecord>
      title="Users"
      basePath="/users"
      rowKey={(r) => r.user_id}
      list={userRecordApi.list}
      remove={userRecordApi.remove}
      columns={[
        { key: 'login_id', header: 'Login ID', sortable: true },
        { key: 'display_name', header: 'Display Name', sortable: true },
        { key: 'role_code', header: 'Role', sortable: true },
        { key: 'mobile_no', header: 'Mobile No' },
        { key: 'email', header: 'Email' },
        { key: 'status', header: 'Status', sortable: true },
      ]}
    />
  );
}
