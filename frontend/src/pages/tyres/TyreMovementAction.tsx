import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { tyreApi, tyreMovementApi, vehicleApi } from '../../api/resources';
import type { Vehicle } from '../../types/entities';
import { ApiError } from '../../api/client';

interface Props {
  mode: 'fitment' | 'removal';
}

export default function TyreMovementAction({ mode }: Props) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleId, setVehicleId] = useState('');
  const [position, setPosition] = useState('');
  const [odometer, setOdometer] = useState<number | ''>('');
  const [treadDepth, setTreadDepth] = useState<number | ''>('');
  const [notes, setNotes] = useState('');
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
      await tyreMovementApi.create({
        tyre_id: id,
        movement_type: mode === 'fitment' ? 'Fitment' : 'Removal',
        vehicle_id: vehicleId || undefined,
        to_position: mode === 'fitment' ? position : undefined,
        from_position: mode === 'removal' ? position : undefined,
        odometer_km: odometer === '' ? undefined : odometer,
        tread_depth_mm: treadDepth === '' ? undefined : treadDepth,
        condition_notes: notes || undefined,
        movement_datetime: new Date().toISOString(),
        status: 'Recorded',
      });
      await tyreApi.update(id, {
        status: mode === 'fitment' ? 'Fitted' : 'Removed',
        current_position: mode === 'fitment' ? position : null,
        current_vehicle_id: mode === 'fitment' ? vehicleId : null,
      });
      navigate(`/tyres/${id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Action failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-lg font-semibold mb-4">{mode === 'fitment' ? 'Record Tyre Fitment' : 'Record Tyre Removal'}</h1>
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
          <label className="block text-sm font-medium text-gray-700 mb-1">{mode === 'fitment' ? 'To Position' : 'From Position'}</label>
          <input className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm" value={position} onChange={(e) => setPosition(e.target.value)} placeholder="e.g. FL, FR, RL1" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Odometer (km)</label>
          <input type="number" className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm" value={odometer} onChange={(e) => setOdometer(e.target.value === '' ? '' : Number(e.target.value))} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tread Depth (mm)</label>
          <input type="number" className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm" value={treadDepth} onChange={(e) => setTreadDepth(e.target.value === '' ? '' : Number(e.target.value))} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Condition Notes</label>
          <textarea className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <div className="flex gap-3">
          <button disabled={busy} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm px-4 py-2 rounded">
            {busy ? 'Saving...' : 'Save'}
          </button>
          <button type="button" onClick={() => navigate(`/tyres/${id}`)} className="bg-gray-100 hover:bg-gray-200 text-sm px-4 py-2 rounded border border-gray-300">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
