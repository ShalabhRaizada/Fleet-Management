import { useCallback, useEffect, useState } from 'react';
import { couplingApi, vehicleApi, trailerApi } from '../../api/resources';
import type { Coupling, Vehicle, Trailer } from '../../types/entities';
import { ApiError } from '../../api/client';
import { DataTable, usePagedList } from '../../components/DataTable';

export default function CouplingPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [trailers, setTrailers] = useState<Trailer[]>([]);
  const [vehicleId, setVehicleId] = useState('');
  const [trailerId, setTrailerId] = useState('');
  const [location, setLocationField] = useState('');
  const [odometer, setOdometer] = useState<number | ''>('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const fetcher = useCallback(
    (p: { page: number; pageSize: number; q?: string; sortBy?: string; sortDir?: 'ASC' | 'DESC' }) =>
      couplingApi.list({ ...p, sortBy: 'coupled_at', sortDir: 'DESC' }),
    []
  );
  const { items, page, pageSize, total, setPage, loading, reload } = usePagedList<Coupling>(fetcher);

  useEffect(() => {
    vehicleApi.list({ page: 1, pageSize: 200 }).then((r) => setVehicles(r.items));
    trailerApi.list({ page: 1, pageSize: 200 }).then((r) => setTrailers(r.items));
  }, []);

  const vehicleName = (id?: string | null) => vehicles.find((v) => v.vehicle_id === id)?.registration_no || id || '-';
  const trailerName = (id?: string | null) => trailers.find((t) => t.trailer_id === id)?.trailer_no || id || '-';

  const activeCouplings = items.filter((c) => c.status === 'Active' || !c.decoupled_at);

  async function handleCouple(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (vehicleId === trailerId) {
      setError('Cannot couple a vehicle to itself.');
      setBusy(false);
      return;
    }
    setBusy(true);
    try {
      await couplingApi.create({
        vehicle_id: vehicleId,
        trailer_id: trailerId,
        coupled_at: new Date().toISOString(),
        coupling_location: location || undefined,
        odometer_km: odometer === '' ? undefined : odometer,
        status: 'Active',
      });
      setVehicleId('');
      setTrailerId('');
      setLocationField('');
      setOdometer('');
      reload();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Coupling failed');
    } finally {
      setBusy(false);
    }
  }

  async function handleDecouple(row: Coupling) {
    setBusy(true);
    setError(null);
    try {
      await couplingApi.update(row.coupling_id, { decoupled_at: new Date().toISOString(), status: 'Decoupled' });
      reload();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Decouple failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-lg font-semibold">Vehicle-Trailer Coupling</h1>
      {error && <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded">{error}</div>}

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-sm font-medium mb-3">Couple a vehicle and trailer</h2>
        <form onSubmit={handleCouple} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <select className="border border-gray-300 rounded px-3 py-1.5 text-sm" value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} required>
            <option value="">Select vehicle</option>
            {vehicles.map((v) => (
              <option key={v.vehicle_id} value={v.vehicle_id}>{v.registration_no}</option>
            ))}
          </select>
          <select className="border border-gray-300 rounded px-3 py-1.5 text-sm" value={trailerId} onChange={(e) => setTrailerId(e.target.value)} required>
            <option value="">Select trailer</option>
            {trailers.map((t) => (
              <option key={t.trailer_id} value={t.trailer_id}>{t.trailer_no}</option>
            ))}
          </select>
          <input className="border border-gray-300 rounded px-3 py-1.5 text-sm" placeholder="Location" value={location} onChange={(e) => setLocationField(e.target.value)} />
          <input
            className="border border-gray-300 rounded px-3 py-1.5 text-sm"
            placeholder="Odometer (km)"
            type="number"
            value={odometer}
            onChange={(e) => setOdometer(e.target.value === '' ? '' : Number(e.target.value))}
          />
          <button disabled={busy} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm px-4 py-1.5 rounded col-span-1">
            Couple
          </button>
        </form>
      </div>

      <div>
        <h2 className="text-sm font-medium mb-3">Current Active Couplings</h2>
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-3 py-2">Vehicle</th>
                <th className="text-left px-3 py-2">Trailer</th>
                <th className="text-left px-3 py-2">Coupled At</th>
                <th className="text-left px-3 py-2">Location</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {activeCouplings.length === 0 && (
                <tr><td colSpan={5} className="px-3 py-4 text-gray-500">No active couplings.</td></tr>
              )}
              {activeCouplings.map((c) => (
                <tr key={c.coupling_id} className="border-t border-gray-100">
                  <td className="px-3 py-2">{vehicleName(c.vehicle_id)}</td>
                  <td className="px-3 py-2">{trailerName(c.trailer_id)}</td>
                  <td className="px-3 py-2">{new Date(c.coupled_at).toLocaleString()}</td>
                  <td className="px-3 py-2">{c.coupling_location || '-'}</td>
                  <td className="px-3 py-2">
                    <button onClick={() => handleDecouple(c)} disabled={busy} className="text-red-600 hover:underline">
                      Decouple
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-medium mb-3">Coupling History</h2>
        <DataTable
          columns={[
            { key: 'vehicle_id', header: 'Vehicle', render: (r) => vehicleName(r.vehicle_id) },
            { key: 'trailer_id', header: 'Trailer', render: (r) => trailerName(r.trailer_id) },
            { key: 'coupled_at', header: 'Coupled At', render: (r) => new Date(r.coupled_at).toLocaleString() },
            { key: 'decoupled_at', header: 'Decoupled At', render: (r) => (r.decoupled_at ? new Date(r.decoupled_at).toLocaleString() : '-') },
            { key: 'status', header: 'Status' },
          ]}
          rows={items}
          rowKey={(r) => r.coupling_id}
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={setPage}
          loading={loading}
          exportFilename="couplings"
        />
      </div>
    </div>
  );
}
