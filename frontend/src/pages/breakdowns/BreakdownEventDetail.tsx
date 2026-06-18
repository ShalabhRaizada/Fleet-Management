import { breakdownEventApi } from '../../api/resources';
import { CrudDetailPage } from '../crud/CrudDetailPage';
import type { BreakdownEvent } from '../../types/entities-p2p3';

export default function BreakdownEventDetail() {
  return (
    <CrudDetailPage<BreakdownEvent>
      title="Breakdown Event Detail"
      basePath="/breakdown-events"
      get={breakdownEventApi.get}
      fieldsToShow={[
        { key: 'job_card_id', label: 'Job Card ID' },
        { key: 'vehicle_id', label: 'Vehicle ID' },
        { key: 'trip_id', label: 'Trip ID' },
        { key: 'breakdown_datetime', label: 'Breakdown Datetime' },
        { key: 'location_text', label: 'Location' },
        { key: 'latitude', label: 'Latitude' },
        { key: 'longitude', label: 'Longitude' },
        { key: 'breakdown_category', label: 'Breakdown Category' },
        { key: 'severity', label: 'Severity' },
        { key: 'downtime_minutes', label: 'Downtime (Minutes)' },
        { key: 'root_cause', label: 'Root Cause' },
        { key: 'status', label: 'Status' },
      ]}
    />
  );
}
