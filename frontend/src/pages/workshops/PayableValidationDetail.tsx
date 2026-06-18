import { payableValidationApi } from '../../api/resources';
import { CrudDetailPage } from '../crud/CrudDetailPage';
import type { PayableValidation } from '../../types/entities-p2p3';

export default function PayableValidationDetail() {
  return (
    <CrudDetailPage<PayableValidation>
      title="Payable Validation Detail"
      basePath="/payable-validations"
      get={payableValidationApi.get}
      fieldsToShow={[
        { key: 'invoice_id', label: 'Invoice ID' },
        { key: 'job_card_id', label: 'Job Card ID' },
        { key: 'validation_type', label: 'Validation Type' },
        { key: 'validation_status', label: 'Validation Status' },
        { key: 'expected_value', label: 'Expected Value' },
        { key: 'actual_value', label: 'Actual Value' },
        { key: 'variance_amount', label: 'Variance Amount' },
        { key: 'remarks', label: 'Remarks' },
        { key: 'approved_by_user_id', label: 'Approved By' },
      ]}
    />
  );
}
