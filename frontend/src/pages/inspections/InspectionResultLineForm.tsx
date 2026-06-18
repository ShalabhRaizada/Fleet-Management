import { inspectionResultLineApi } from '../../api/resources';
import { CrudFormPage } from '../crud/CrudFormPage';
import type { InspectionResultLine } from '../../types/entities-p2p3';
import type { FieldDef } from '../../components/Form';

const fields: FieldDef<InspectionResultLine>[] = [
  { name: 'inspection_id', label: 'Inspection ID (UUID)', required: true },
  { name: 'check_item_code', label: 'Check Item Code', required: true },
  { name: 'check_item_name', label: 'Check Item Name', required: true },
  {
    name: 'result', label: 'Result', type: 'select', required: true,
    options: ['Pass', 'Fail', 'NA', 'Observation'].map((v) => ({ value: v, label: v })),
  },
  {
    name: 'severity', label: 'Severity', type: 'select',
    options: ['Low', 'Medium', 'High', 'Critical'].map((v) => ({ value: v, label: v })),
  },
  { name: 'photo_url', label: 'Photo URL' },
  { name: 'remarks', label: 'Remarks', type: 'textarea' },
];

export default function InspectionResultLineForm() {
  return (
    <CrudFormPage<InspectionResultLine>
      title="Inspection Result Line"
      basePath="/inspection-result-lines"
      fields={fields}
      get={inspectionResultLineApi.get}
      create={inspectionResultLineApi.create}
      update={inspectionResultLineApi.update}
      defaults={{ result: 'Pass' }}
    />
  );
}
