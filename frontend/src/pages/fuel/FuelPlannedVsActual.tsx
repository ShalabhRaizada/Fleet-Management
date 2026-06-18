import { fuelVarianceApi } from '../../api/resources';
import { CrudListPage } from '../crud/CrudListPage';
import type { FuelVariance } from '../../types/entities-extra';

export default function FuelPlannedVsActual() {
  return (
    <CrudListPage<FuelVariance>
      title="Fuel: Planned vs Actual"
      basePath="/fuel/variance"
      rowKey={(r) => r.fuel_variance_id}
      list={fuelVarianceApi.list}
      canCreate={false}
      columns={[
        { key: 'planned_quantity', header: 'Planned Qty' },
        { key: 'actual_quantity', header: 'Actual Qty' },
        { key: 'variance_quantity', header: 'Variance' },
        { key: 'variance_pct', header: 'Variance %' },
        { key: 'exception_reason', header: 'Exception Reason' },
        { key: 'approval_status', header: 'Approval Status', sortable: true },
      ]}
    />
  );
}
