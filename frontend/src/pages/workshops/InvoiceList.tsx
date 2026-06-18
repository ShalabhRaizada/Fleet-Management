import { vendorInvoiceApi } from '../../api/resources';
import { CrudListPage } from '../crud/CrudListPage';
import type { VendorInvoice } from '../../types/entities';

export default function InvoiceList() {
  return (
    <CrudListPage<VendorInvoice>
      title="Workshop / Vendor Invoices"
      basePath="/workshops/invoices"
      rowKey={(r) => r.invoice_id}
      list={vendorInvoiceApi.list}
      remove={vendorInvoiceApi.remove}
      columns={[
        { key: 'invoice_no', header: 'Invoice No', sortable: true },
        { key: 'invoice_type', header: 'Type' },
        { key: 'invoice_date', header: 'Date', render: (r) => new Date(r.invoice_date).toLocaleDateString() },
        { key: 'taxable_amount', header: 'Taxable Amount' },
        { key: 'total_amount', header: 'Total Amount' },
        { key: 'payable_status', header: 'Payable Status' },
      ]}
    />
  );
}
