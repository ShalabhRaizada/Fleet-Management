import { vendorApi } from '../../api/resources';
import { CrudListPage } from '../crud/CrudListPage';
import type { Vendor } from '../../types/entities';

export default function VendorList() {
  return (
    <CrudListPage<Vendor>
      title="Vendors"
      basePath="/vendors"
      rowKey={(r) => r.vendor_id}
      list={vendorApi.list}
      remove={vendorApi.remove}
      columns={[
        { key: 'vendor_code', header: 'Vendor Code', sortable: true },
        { key: 'vendor_name', header: 'Vendor Name', sortable: true },
        { key: 'vendor_type', header: 'Type', sortable: true },
        { key: 'contact_person', header: 'Contact Person' },
        { key: 'mobile_no', header: 'Mobile No' },
        { key: 'status', header: 'Status', sortable: true },
      ]}
    />
  );
}
