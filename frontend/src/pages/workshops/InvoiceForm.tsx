import { vendorInvoiceApi } from '../../api/resources';
import { CrudFormPage } from '../crud/CrudFormPage';
import type { VendorInvoice } from '../../types/entities';
import type { FieldDef } from '../../components/Form';

const fields: FieldDef<VendorInvoice>[] = [
  {
    name: 'invoice_type', label: 'Invoice Type', type: 'select', required: true,
    options: ['Workshop', 'Fuel', 'Tyre', 'Accessory', 'Consumable', 'Compliance'].map((v) => ({ value: v, label: v })),
  },
  { name: 'vendor_id', label: 'Vendor ID (UUID)', required: true },
  { name: 'workshop_id', label: 'Workshop ID (UUID)' },
  { name: 'invoice_no', label: 'Invoice No', required: true },
  { name: 'invoice_date', label: 'Invoice Date', type: 'date', required: true },
  { name: 'gstin', label: 'GSTIN' },
  { name: 'taxable_amount', label: 'Taxable Amount', type: 'number', required: true },
  { name: 'cgst_amount', label: 'CGST Amount', type: 'number' },
  { name: 'sgst_amount', label: 'SGST Amount', type: 'number' },
  { name: 'igst_amount', label: 'IGST Amount', type: 'number' },
  { name: 'total_amount', label: 'Total Amount', type: 'number', required: true },
  { name: 'document_url', label: 'Document URL' },
  {
    name: 'payable_status', label: 'Payable Status', type: 'select', required: true,
    options: ['Draft', 'Matched', 'Exception', 'Approved', 'Posted', 'Paid', 'Rejected'].map((v) => ({ value: v, label: v })),
  },
];

export default function InvoiceForm() {
  return (
    <CrudFormPage<VendorInvoice>
      title="Vendor Invoice"
      basePath="/workshops/invoices"
      fields={fields}
      get={vendorInvoiceApi.get}
      create={vendorInvoiceApi.create}
      update={vendorInvoiceApi.update}
      defaults={{ invoice_type: 'Workshop', payable_status: 'Draft' }}
    />
  );
}
