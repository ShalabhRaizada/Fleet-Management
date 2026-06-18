import { workshopApi } from '../../api/resources';
import { CrudDetailPage } from '../crud/CrudDetailPage';
import type { Workshop } from '../../types/entities';

export default function WorkshopDetail() {
  return (
    <CrudDetailPage<Workshop>
      title="Workshop Detail"
      basePath="/workshops"
      get={workshopApi.get}
      fieldsToShow={[
        { key: 'workshop_code', label: 'Code' },
        { key: 'workshop_name', label: 'Name' },
        { key: 'workshop_type', label: 'Type' },
        { key: 'gstin', label: 'GSTIN' },
        { key: 'service_categories', label: 'Service Categories' },
        { key: 'payment_terms_days', label: 'Payment Terms (days)' },
        { key: 'status', label: 'Status' },
      ]}
    />
  );
}
