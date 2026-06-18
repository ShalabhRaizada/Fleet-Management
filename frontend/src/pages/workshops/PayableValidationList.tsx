import { payableValidationApi } from '../../api/resources';
import { CrudListPage } from '../crud/CrudListPage';
import type { PayableValidation } from '../../types/entities-p2p3';

export default function PayableValidationList() {
  return (
    <CrudListPage<PayableValidation>
      title="Payable Validations"
      basePath="/payable-validations"
      rowKey={(r) => r.validation_id}
      list={payableValidationApi.list}
      remove={payableValidationApi.remove}
      columns={[
        { key: 'invoice_id', header: 'Invoice ID' },
        { key: 'validation_type', header: 'Validation Type', sortable: true },
        { key: 'validation_status', header: 'Validation Status', sortable: true },
        { key: 'variance_amount', header: 'Variance Amount' },
      ]}
    />
  );
}
