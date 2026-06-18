import { vendorInvoiceApi } from '../../api/resources';
import { CrudDetailPage } from '../crud/CrudDetailPage';
import type { VendorInvoice } from '../../types/entities';

export default function InvoiceDetail() {
  return (
    <CrudDetailPage<VendorInvoice>
      title="Invoice Detail"
      basePath="/workshops/invoices"
      get={vendorInvoiceApi.get}
      fieldsToShow={[
        { key: 'invoice_no', label: 'Invoice No' },
        { key: 'invoice_type', label: 'Type' },
        { key: 'invoice_date', label: 'Date' },
        { key: 'gstin', label: 'GSTIN' },
        { key: 'taxable_amount', label: 'Taxable Amount' },
        { key: 'total_amount', label: 'Total Amount' },
        { key: 'payable_status', label: 'Payable Status' },
      ]}
    />
  );
}
