import { documentApi } from '../../api/resources';
import { CrudListPage } from '../crud/CrudListPage';
import type { DocumentStore } from '../../types/entities-p2p3';

export default function DocumentList() {
  return (
    <CrudListPage<DocumentStore>
      title="Documents"
      basePath="/documents"
      rowKey={(r) => r.document_id}
      list={documentApi.list}
      remove={documentApi.remove}
      columns={[
        { key: 'entity_type', header: 'Entity Type', sortable: true },
        { key: 'document_category', header: 'Category', sortable: true },
        { key: 'file_name', header: 'File Name' },
        { key: 'uploaded_at', header: 'Uploaded At', sortable: true },
      ]}
    />
  );
}
