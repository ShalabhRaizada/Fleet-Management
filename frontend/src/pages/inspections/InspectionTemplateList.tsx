import { inspectionTemplateApi } from '../../api/resources';
import { CrudListPage } from '../crud/CrudListPage';
import type { InspectionTemplate } from '../../types/entities-p2p3';

export default function InspectionTemplateList() {
  return (
    <CrudListPage<InspectionTemplate>
      title="Inspection Templates"
      basePath="/inspection-templates"
      rowKey={(r) => r.template_id}
      list={inspectionTemplateApi.list}
      remove={inspectionTemplateApi.remove}
      columns={[
        { key: 'template_code', header: 'Template Code' },
        { key: 'template_name', header: 'Template Name' },
        { key: 'asset_type', header: 'Asset Type', sortable: true },
        { key: 'inspection_type', header: 'Inspection Type', sortable: true },
        { key: 'status', header: 'Status', sortable: true },
      ]}
    />
  );
}
