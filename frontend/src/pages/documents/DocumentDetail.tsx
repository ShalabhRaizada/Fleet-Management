import { documentApi } from '../../api/resources';
import { CrudDetailPage } from '../crud/CrudDetailPage';
import type { DocumentStore } from '../../types/entities-p2p3';

export default function DocumentDetail() {
  return (
    <CrudDetailPage<DocumentStore>
      title="Document Detail"
      basePath="/documents"
      get={documentApi.get}
      fieldsToShow={[
        { key: 'entity_type', label: 'Entity Type' },
        { key: 'entity_id', label: 'Entity ID' },
        { key: 'document_category', label: 'Document Category' },
        { key: 'file_name', label: 'File Name' },
        { key: 'file_url', label: 'File URL' },
        { key: 'mime_type', label: 'MIME Type' },
        { key: 'uploaded_by_user_id', label: 'Uploaded By' },
        { key: 'uploaded_at', label: 'Uploaded At' },
        { key: 'ocr_json', label: 'OCR JSON' },
      ]}
    />
  );
}
