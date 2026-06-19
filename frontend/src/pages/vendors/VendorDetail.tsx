import { vendorApi } from '../../api/resources';
import { CrudDetailPage } from '../crud/CrudDetailPage';
import type { Vendor } from '../../types/entities';

export default function VendorDetail() {
  return (
    <CrudDetailPage<Vendor>
      title="Vendor Detail"
      basePath="/vendors"
      get={vendorApi.get}
      fieldsToShow={[
        { key: 'vendor_code', label: 'Vendor Code' },
        { key: 'vendor_name', label: 'Vendor Name' },
        { key: 'vendor_type', label: 'Vendor Type' },
        { key: 'gstin', label: 'GSTIN' },
        { key: 'contact_person', label: 'Contact Person' },
        { key: 'mobile_no', label: 'Mobile No' },
        { key: 'email', label: 'Email' },
        { key: 'payment_terms_days', label: 'Payment Terms (Days)' },
        { key: 'status', label: 'Status' },
        { key: 'is_msme', label: 'MSME Registered' },
        { key: 'service_locations', label: 'Service Locations' },
        { key: 'oem_association', label: 'OEM Association' },
        { key: 'rate_contract_valid_from', label: 'Rate Contract Valid From' },
        { key: 'rate_contract_valid_to', label: 'Rate Contract Valid To' },
        { key: 'sla_terms', label: 'SLA Terms' },
        { key: 'bank_account_no', label: 'Bank Account No' },
        { key: 'bank_ifsc', label: 'Bank IFSC' },
        { key: 'approval_status', label: 'Approval Status' },
        { key: 'vendor_rating', label: 'Vendor Rating' },
      ]}
    />
  );
}
