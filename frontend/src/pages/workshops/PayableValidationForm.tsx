import { payableValidationApi } from '../../api/resources';
import { CrudFormPage } from '../crud/CrudFormPage';
import type { PayableValidation } from '../../types/entities-p2p3';
import type { FieldDef } from '../../components/Form';

const fields: FieldDef<PayableValidation>[] = [
  { name: 'invoice_id', label: 'Invoice ID (UUID)', required: true },
  { name: 'job_card_id', label: 'Job Card ID (UUID)' },
  {
    name: 'validation_type', label: 'Validation Type', type: 'select', required: true,
    options: ['JobCardMatch', 'EstimateMatch', 'RateContract', 'Duplicate', 'GST', 'GRN'].map((v) => ({ value: v, label: v })),
  },
  {
    name: 'validation_status', label: 'Validation Status', type: 'select', required: true,
    options: ['Passed', 'Failed', 'Warning', 'Overridden'].map((v) => ({ value: v, label: v })),
  },
  { name: 'expected_value', label: 'Expected Value' },
  { name: 'actual_value', label: 'Actual Value' },
  { name: 'variance_amount', label: 'Variance Amount', type: 'number' },
  { name: 'remarks', label: 'Remarks', type: 'textarea' },
  { name: 'approved_by_user_id', label: 'Approved By (User ID)' },
];

export default function PayableValidationForm() {
  return (
    <CrudFormPage<PayableValidation>
      title="Payable Validation"
      basePath="/payable-validations"
      fields={fields}
      get={payableValidationApi.get}
      create={payableValidationApi.create}
      update={payableValidationApi.update}
      defaults={{ validation_type: 'JobCardMatch', validation_status: 'Passed' }}
    />
  );
}
