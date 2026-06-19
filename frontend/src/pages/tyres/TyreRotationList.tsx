import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { tyreRotationApi } from '../../api/tyreRotation';
import { ApiError } from '../../api/client';
import type { TyreRotationHeader } from '../../types/tyreRotation';

const STATUS_OPTIONS = ['Draft', 'Submitted', 'Approved'];

export default function TyreRotationList() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<TyreRotationHeader[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [status, setStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [tyreSerial, setTyreSerial] = useState('');

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await tyreRotationApi.list({ page, pageSize, status, dateFrom, dateTo, tyreSerial });
      setRows(res.items);
      setTotal(res.total);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load tyre rotations');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  function applyFilters(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    load();
  }

  return (
    <div className="col gap-16">
      <div className="page-header">
        <h1>Tyre Rotations</h1>
        <button type="button" className="btn primary" onClick={() => navigate('/tyre-rotations/new')}>
          + New Rotation
        </button>
      </div>

      <form onSubmit={applyFilters} className="card" style={{ padding: 16 }}>
        <div className="field-row cols-4">
          <div className="field">
            <label>Status</label>
            <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Date From</label>
            <input type="date" className="input" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </div>
          <div className="field">
            <label>Date To</label>
            <input type="date" className="input" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
          <div className="field">
            <label>Tyre Serial No</label>
            <input className="input" value={tyreSerial} onChange={(e) => setTyreSerial(e.target.value)} placeholder="Search serial..." />
          </div>
        </div>
        <div className="row gap-8" style={{ marginTop: 12 }}>
          <button type="submit" className="btn primary">Apply Filters</button>
        </div>
      </form>

      {error && <div className="badge danger" style={{ display: 'block', padding: '8px 12px' }}>{error}</div>}

      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        <table className="tbl">
          <thead>
            <tr>
              <th>Date</th>
              <th>Asset</th>
              <th>Asset Type</th>
              <th className="num">Odometer</th>
              <th>Lines</th>
              <th>Reason</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="muted">Loading...</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={8} className="empty">No tyre rotations found.</td></tr>
            ) : (
              rows.map((r) => (
                <tr key={r.rotation_header_id}>
                  <td>{new Date(r.rotation_date).toLocaleDateString()}</td>
                  <td>{r.asset_label || r.asset_id}</td>
                  <td>{r.asset_type}</td>
                  <td className="num tnum">{r.odometer_km}</td>
                  <td>{r.line_count ?? '-'}</td>
                  <td>{r.reason_code || '-'}</td>
                  <td><span className={`badge ${r.status === 'Approved' ? 'success' : r.status === 'Submitted' ? '' : 'warn'}`}>{r.status}</span></td>
                  <td>
                    <Link to={`/tyre-rotations/${r.rotation_header_id}`} className="btn sm">View</Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="row gap-8" style={{ justifyContent: 'flex-end' }}>
        <span className="muted">Page {page} of {Math.max(1, Math.ceil(total / pageSize))} ({total} total)</span>
        <button type="button" className="btn" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</button>
        <button type="button" className="btn" disabled={page * pageSize >= total} onClick={() => setPage((p) => p + 1)}>Next</button>
      </div>
    </div>
  );
}
