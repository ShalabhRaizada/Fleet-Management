import { useCallback, useEffect, useState } from 'react';
import { couplingApi, vehicleApi, trailerApi } from '../../api/resources';
import type { Coupling, Vehicle, Trailer } from '../../types/entities';
import { ApiError } from '../../api/client';
import { DataTable, usePagedList } from '../../components/DataTable';
import { SearchableCombobox } from '../../components/common/SearchableCombobox';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useToast } from '../../components/Toast';

export default function CouplingPage() {
  const { addToast } = useToast();
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

  const [activeCouplings, setActiveCouplings] = useState<Coupling[]>([]);
  const [activeLoading, setActiveLoading] = useState(false);

  const loadActiveCouplings = useCallback(async () => {
    setActiveLoading(true);
    try {
      const res = await couplingApi.list({ page: 1, pageSize: 100, status: 'Active', sortBy: 'coupled_at', sortDir: 'DESC' });
      setActiveCouplings(res.items);
    } catch {
      // surfaced via the shared error state on subsequent actions; non-fatal for this widget
    } finally {
      setActiveLoading(false);
    }
  }, []);

  const loadAssets = useCallback(() => {
    vehicleApi.list({ page: 1, pageSize: 200, status: 'Available' }).then((r) => setVehicles(r.items));
    trailerApi.list({ page: 1, pageSize: 200, status: 'Available' }).then((r) => setTrailers(r.items));
  }, []);

  useEffect(() => {
    loadAssets();
    loadActiveCouplings();
  }, [loadAssets, loadActiveCouplings]);

  const vehicleName = (id?: string | null) => vehicles.find((v) => v.vehicle_id === id)?.registration_no || id || '-';
  const trailerName = (id?: string | null) => trailers.find((t) => t.trailer_id === id)?.trailer_no || id || '-';

  async function handleCouple(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!vehicleId || !trailerId) {
      setError('Select both a vehicle and a trailer.');
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
      addToast('Vehicle and trailer coupled.', 'success');
      setVehicleId('');
      setTrailerId('');
      setLocationField('');
      setOdometer('');
      reload();
      loadActiveCouplings();
      loadAssets();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Coupling failed';
      setError(message);
      addToast(message, 'error');
    } finally {
      setBusy(false);
    }
  }

  async function handleDecouple(row: Coupling) {
    setBusy(true);
    setError(null);
    try {
      await couplingApi.update(row.coupling_id, { decoupled_at: new Date().toISOString(), status: 'Decoupled' });
      addToast('Decoupled.', 'success');
      reload();
      loadActiveCouplings();
      loadAssets();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Decouple failed';
      setError(message);
      addToast(message, 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="col gap-16">
      <div className="page-header">
        <h1>Vehicle-Trailer Coupling</h1>
      </div>
      {error && <div className="badge danger" style={{ display: 'block', padding: '8px 12px' }}>{error}</div>}

      <div className="card" style={{ padding: 16 }}>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>Couple a Vehicle and Trailer</div>
        <form onSubmit={handleCouple} className="field-row cols-4">
          <div className="field">
            <label>Vehicle (available only)<span className="req">*</span></label>
            <SearchableCombobox
              value={vehicleId}
              onChange={setVehicleId}
              options={vehicles.map((v) => ({ value: v.vehicle_id, label: v.registration_no }))}
              placeholder="Search vehicle..."
              required
            />
          </div>
          <div className="field">
            <label>Trailer (available only)<span className="req">*</span></label>
            <SearchableCombobox
              value={trailerId}
              onChange={setTrailerId}
              options={trailers.map((t) => ({ value: t.trailer_id, label: t.trailer_no }))}
              placeholder="Search trailer..."
              required
            />
          </div>
          <div className="field">
            <label>Coupling Location</label>
            <input className="input" placeholder="Location" value={location} onChange={(e) => setLocationField(e.target.value)} />
          </div>
          <div className="field">
            <label>Odometer (km)</label>
            <input
              className="input"
              placeholder="Odometer (km)"
              type="number"
              min={0}
              value={odometer}
              onChange={(e) => setOdometer(e.target.value === '' ? '' : Number(e.target.value))}
            />
          </div>
          <div className="row gap-8" style={{ gridColumn: '1 / -1' }}>
            <button type="submit" disabled={busy || !vehicleId || !trailerId} className="btn primary">
              {busy ? 'Coupling...' : 'Couple'}
            </button>
          </div>
        </form>
      </div>

      <div className="card" style={{ padding: 16 }}>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>Current Active Couplings</div>
        <table className="tbl">
          <thead>
            <tr>
              <th>Vehicle</th>
              <th>Trailer</th>
              <th>Coupled At</th>
              <th>Location</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {activeLoading && (
              <tr><td colSpan={5} className="muted">Loading...</td></tr>
            )}
            {!activeLoading && activeCouplings.length === 0 && (
              <tr><td colSpan={5} className="muted">No active couplings.</td></tr>
            )}
            {!activeLoading && activeCouplings.map((c) => (
              <tr key={c.coupling_id}>
                <td>{vehicleName(c.vehicle_id)}</td>
                <td>{trailerName(c.trailer_id)}</td>
                <td>{new Date(c.coupled_at).toLocaleString()}</td>
                <td>{c.coupling_location || '-'}</td>
                <td>
                  <span className="link" style={{ color: 'var(--danger)' }} onClick={() => handleDecouple(c)}>
                    Decouple
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>Coupling History</div>
        <DataTable
          columns={[
            { key: 'vehicle_id', header: 'Vehicle', render: (r) => vehicleName(r.vehicle_id) },
            { key: 'trailer_id', header: 'Trailer', render: (r) => trailerName(r.trailer_id) },
            { key: 'coupled_at', header: 'Coupled At', render: (r) => new Date(r.coupled_at).toLocaleString() },
            { key: 'decoupled_at', header: 'Decoupled At', render: (r) => (r.decoupled_at ? new Date(r.decoupled_at).toLocaleString() : '-') },
            { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
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
