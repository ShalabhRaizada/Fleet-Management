import { documentApi } from '../../api/resources';
import { CrudFormPage } from '../crud/CrudFormPage';
import type { DocumentStore } from '../../types/entities-p2p3';
import type { FieldDef } from '../../components/Form';

const fields: FieldDef<DocumentStore>[] = [
  { name: 'entity_type', label: 'Entity Type', required: true },
  { name: 'entity_id', label: 'Entity ID (UUID)', required: true },
  {
    name: 'document_category', label: 'Document Category', type: 'select', required: true,
    options: ['Invoice', 'Compliance', 'Photo', 'Certificate', 'Other'].map((v) => ({ value: v, label: v })),
  },
  { name: 'file_name', label: 'File Name', required: true },
  { name: 'file_url', label: 'File URL', required: true },
  { name: 'mime_type', label: 'MIME Type' },
  { name: 'uploaded_by_user_id', label: 'Uploaded By (User ID)' },
  { name: 'uploaded_at', label: 'Uploaded At', type: 'datetime-local', required: true },
  { name: 'ocr_json', label: 'OCR JSON', type: 'textarea' },
];

export default function DocumentForm() {
  return (
    <CrudFormPage<DocumentStore>
      title="Document"
      basePath="/documents"
      fields={fields}
      get={documentApi.get}
      create={documentApi.create}
      update={documentApi.update}
      defaults={{ document_category: 'Other' }}
    />
  );
}
