import { inspectionTemplateApi } from '../../api/resources';
import { CrudFormPage } from '../crud/CrudFormPage';
import type { InspectionTemplate } from '../../types/entities-p2p3';
import type { FieldDef } from '../../components/Form';

const fields: FieldDef<InspectionTemplate>[] = [
  { name: 'template_code', label: 'Template Code', required: true },
  { name: 'template_name', label: 'Template Name', required: true },
  {
    name: 'asset_type', label: 'Asset Type', type: 'select', required: true,
    options: ['Vehicle', 'Trailer', 'Tyre', 'Accessory'].map((v) => ({ value: v, label: v })),
  },
  { name: 'fuel_type', label: 'Fuel Type' },
  {
    name: 'inspection_type', label: 'Inspection Type', type: 'select', required: true,
    options: ['PreTrip', 'PostTrip', 'Periodic', 'LNGSafety', 'CNGSafety', 'EVSafety'].map((v) => ({ value: v, label: v })),
  },
  {
    name: 'status', label: 'Status', type: 'select', required: true,
    options: ['Active', 'Inactive'].map((v) => ({ value: v, label: v })),
  },
];

export default function InspectionTemplateForm() {
  return (
    <CrudFormPage<InspectionTemplate>
      title="Inspection Template"
      basePath="/inspection-templates"
      fields={fields}
      get={inspectionTemplateApi.get}
      create={inspectionTemplateApi.create}
      update={inspectionTemplateApi.update}
      defaults={{ asset_type: 'Vehicle', inspection_type: 'PreTrip', status: 'Active' }}
    />
  );
}
