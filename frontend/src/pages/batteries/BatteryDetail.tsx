import { batteryApi } from '../../api/resources';
import { CrudDetailPage } from '../crud/CrudDetailPage';
import type { Battery } from '../../types/entities';

export default function BatteryDetail() {
  return (
    <CrudDetailPage<Battery>
      title="Battery Detail"
      basePath="/batteries"
      get={batteryApi.get}
      fieldsToShow={[
        { key: 'battery_serial_no', label: 'Battery Serial No' },
        { key: 'vehicle_id', label: 'Vehicle ID' },
        { key: 'oem_name', label: 'OEM Name' },
        { key: 'capacity_ah', label: 'Capacity (Ah)' },
        { key: 'voltage', label: 'Voltage' },
        { key: 'warranty_months', label: 'Warranty (Months)' },
        { key: 'fitment_date', label: 'Fitment Date' },
        { key: 'removal_date', label: 'Removal Date' },
        { key: 'removal_reason', label: 'Removal Reason' },
        { key: 'status', label: 'Status' },
        { key: 'purchase_cost', label: 'Purchase Cost' },
        { key: 'vendor_id', label: 'Vendor ID' },
      ]}
    />
  );
}
