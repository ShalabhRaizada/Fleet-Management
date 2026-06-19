import { userRecordApi } from '../../api/resources';
import { CrudFormPage } from '../crud/CrudFormPage';
import type { UserRecord } from '../../types/entities-p2p3';
import type { FieldDef } from '../../components/Form';

// NOTE: password management is out of scope here — auth/credentials are handled
// elsewhere; this form only manages the user_master profile/role/status fields.
const fields: FieldDef<UserRecord>[] = [
  { name: 'login_id', label: 'Login ID', required: true },
  { name: 'display_name', label: 'Display Name', required: true },
  { name: 'mobile_no', label: 'Mobile No' },
  { name: 'email', label: 'Email' },
  {
    name: 'role_code', label: 'Role', type: 'select', required: true,
    options: ['ADMIN', 'FLEET_MANAGER', 'WORKSHOP_SUPERVISOR', 'DRIVER', 'APPROVER'].map((v) => ({ value: v, label: v })),
  },
  { name: 'branch_id', label: 'Branch ID (UUID)' },
  {
    name: 'status', label: 'Status', type: 'select', required: true,
    options: ['Active', 'Inactive'].map((v) => ({ value: v, label: v })),
  },
];

export default function UserForm() {
  return (
    <CrudFormPage<UserRecord>
      title="User"
      basePath="/users"
      fields={fields}
      get={userRecordApi.get}
      create={userRecordApi.create}
      update={userRecordApi.update}
      defaults={{ role_code: 'DRIVER', status: 'Active' }}
    />
  );
}
