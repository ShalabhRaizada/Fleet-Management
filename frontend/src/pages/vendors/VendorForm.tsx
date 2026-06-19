import { vendorApi } from '../../api/resources';
import { CrudFormPage } from '../crud/CrudFormPage';
import type { Vendor } from '../../types/entities';
import type { FieldDef } from '../../components/Form';

const fields: FieldDef<Vendor>[] = [
  { name: 'vendor_code', label: 'Vendor Code', required: true },
  { name: 'vendor_name', label: 'Vendor Name', required: true },
  {
    name: 'vendor_type', label: 'Vendor Type', type: 'select', required: true,
    options: ['Fuel', 'Workshop', 'Tyre', 'Accessory', 'Consumable', 'Insurance', 'RTO'].map((v) => ({ value: v, label: v })),
  },
  { name: 'gstin', label: 'GSTIN' },
  { name: 'contact_person', label: 'Contact Person' },
  { name: 'mobile_no', label: 'Mobile No' },
  { name: 'email', label: 'Email' },
  { name: 'payment_terms_days', label: 'Payment Terms (Days)', type: 'number' },
  {
    name: 'status', label: 'Status', type: 'select', required: true,
    options: ['Active', 'Blocked', 'Inactive'].map((v) => ({ value: v, label: v })),
  },
  { name: 'is_msme', label: 'MSME Registered', type: 'checkbox' },
  { name: 'service_locations', label: 'Service Locations', placeholder: 'Comma-separated, e.g. Delhi,Mumbai' },
  { name: 'oem_association', label: 'OEM Association' },
  { name: 'rate_contract_valid_from', label: 'Rate Contract Valid From', type: 'date' },
  { name: 'rate_contract_valid_to', label: 'Rate Contract Valid To', type: 'date' },
  { name: 'sla_terms', label: 'SLA Terms', type: 'textarea' },
  { name: 'bank_account_no', label: 'Bank Account No' },
  { name: 'bank_ifsc', label: 'Bank IFSC' },
  {
    name: 'approval_status', label: 'Approval Status', type: 'select', required: true,
    options: ['Pending', 'Approved', 'Rejected'].map((v) => ({ value: v, label: v })),
  },
  { name: 'vendor_rating', label: 'Vendor Rating (0-5)', type: 'number' },
];

export default function VendorForm() {
  return (
    <CrudFormPage<Vendor>
      title="Vendor"
      basePath="/vendors"
      fields={fields}
      get={vendorApi.get}
      create={vendorApi.create}
      update={vendorApi.update}
      defaults={{ vendor_type: 'Workshop', status: 'Active', is_msme: false, approval_status: 'Pending' }}
    />
  );
}
