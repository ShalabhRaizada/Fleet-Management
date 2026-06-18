import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { accompanimentApi, accompanimentIssueApi, vehicleApi } from '../../api/resources';
import type { Vehicle } from '../../types/entities';
import { ApiError } from '../../api/client';

export default function AccompanimentIssuePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleId, setVehicleId] = useState('');
  const [sealNo, setSealNo] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    vehicleApi.list({ page: 1, pageSize: 200 }).then((r) => setVehicles(r.items));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;
    setBusy(true);
    setError(null);
    try {
      await accompanimentIssueApi.create({
        accompaniment_id: id,
        vehicle_id: vehicleId || undefined,
        issue_datetime: new Date().toISOString(),
        seal_no: sealNo || undefined,
        status: 'Issued',
      });
      await accompanimentApi.update(id, { current_status: 'Issued' });
      navigate('/accompaniments');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Issue failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-lg font-semibold mb-4">Issue Accompaniment</h1>
      {error && <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle</label>
          <select className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm" value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} required>
            <option value="">Select vehicle</option>
            {vehicles.map((v) => (
              <option key={v.vehicle_id} value={v.vehicle_id}>{v.registration_no}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Seal No (if applicable)</label>
          <input className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm" value={sealNo} onChange={(e) => setSealNo(e.target.value)} />
        </div>
        <div className="flex gap-3">
          <button disabled={busy} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm px-4 py-2 rounded">
            {busy ? 'Saving...' : 'Issue'}
          </button>
          <button type="button" onClick={() => navigate('/accompaniments')} className="bg-gray-100 hover:bg-gray-200 text-sm px-4 py-2 rounded border border-gray-300">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
