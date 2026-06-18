import { inspectionTemplateApi } from '../../api/resources';
import { CrudDetailPage } from '../crud/CrudDetailPage';
import type { InspectionTemplate } from '../../types/entities-p2p3';

export default function InspectionTemplateDetail() {
  return (
    <CrudDetailPage<InspectionTemplate>
      title="Inspection Template Detail"
      basePath="/inspection-templates"
      get={inspectionTemplateApi.get}
      fieldsToShow={[
        { key: 'template_code', label: 'Template Code' },
        { key: 'template_name', label: 'Template Name' },
        { key: 'asset_type', label: 'Asset Type' },
        { key: 'fuel_type', label: 'Fuel Type' },
        { key: 'inspection_type', label: 'Inspection Type' },
        { key: 'status', label: 'Status' },
      ]}
    />
  );
}
