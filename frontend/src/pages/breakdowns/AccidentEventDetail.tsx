import { accidentEventApi } from '../../api/resources';
import { CrudDetailPage } from '../crud/CrudDetailPage';
import type { AccidentEvent } from '../../types/entities-p2p3';

export default function AccidentEventDetail() {
  return (
    <CrudDetailPage<AccidentEvent>
      title="Accident Event Detail"
      basePath="/accident-events"
      get={accidentEventApi.get}
      fieldsToShow={[
        { key: 'job_card_id', label: 'Job Card ID' },
        { key: 'vehicle_id', label: 'Vehicle ID' },
        { key: 'trailer_id', label: 'Trailer ID' },
        { key: 'driver_id', label: 'Driver ID' },
        { key: 'accident_datetime', label: 'Accident Datetime' },
        { key: 'location_text', label: 'Location' },
        { key: 'third_party_involved', label: 'Third Party Involved' },
        { key: 'fir_no', label: 'FIR No' },
        { key: 'damage_summary', label: 'Damage Summary' },
        { key: 'insurance_claim_no', label: 'Insurance Claim No' },
        { key: 'estimated_loss_amount', label: 'Estimated Loss Amount' },
        { key: 'claim_status', label: 'Claim Status' },
        { key: 'status', label: 'Status' },
      ]}
    />
  );
}
