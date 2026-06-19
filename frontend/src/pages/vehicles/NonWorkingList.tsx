import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { vehicleApi } from '../../api/resources';
import { ApiError } from '../../api/client';
import type { Vehicle } from '../../types/entities';

// Limitation: vehicle_master has no dedicated "non-working reason" column,
// so this view simply filters on `status` not in the working set
// (Available/InTrip) and surfaces the status itself in place of a reason.
const WORKING_STATUSES = ['Available', 'InTrip'];

export default function NonWorkingList() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const v = await vehicleApi.list({ page: 1, pageSize: 500 });
        setVehicles(v.items.filter((veh) => !WORKING_STATUSES.includes(veh.status)));
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Failed to load vehicles');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="muted">Loading...</div>;

  return (
    <div className="col gap-16">
      <div className="page-header">
        <h1>Non-Working Vehicles</h1>
      </div>
      {error && <div className="badge danger" style={{ display: 'block', padding: '8px 12px' }}>{error}</div>}
      <div className="kpi">
        <div className="label">Non-Working</div>
        <div className="value">{vehicles.length}</div>
      </div>
      <div className="card" style={{ padding: 0 }}>
        <table className="tbl">
          <thead>
            <tr>
              <th>Vehicle No</th>
              <th>Vehicle Code</th>
              <th>Status</th>
              <th>Branch ID</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v) => (
              <tr key={v.vehicle_id} className="clickable" onClick={() => navigate(`/vehicles/${v.vehicle_id}`)}>
                <td className="mono">{v.registration_no}</td>
                <td>{v.vehicle_code || '-'}</td>
                <td><span className="badge outline">{v.status}</span></td>
                <td className="mono">{v.branch_id || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
