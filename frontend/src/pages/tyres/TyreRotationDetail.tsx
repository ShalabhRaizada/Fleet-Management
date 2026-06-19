import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { tyreRotationApi } from '../../api/tyreRotation';
import { ApiError } from '../../api/client';
import { useToast } from '../../components/Toast';
import { useAuth } from '../../context/AuthContext';
import type { TyreRotationDetail as TyreRotationDetailType } from '../../types/tyreRotation';

export default function TyreRotationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { user } = useAuth();

  const [detail, setDetail] = useState<TyreRotationDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await tyreRotationApi.get(id);
      setDetail(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load rotation');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleSubmit() {
    if (!id) return;
    setBusy(true);
    try {
      const res = await tyreRotationApi.submit(id);
      addToast('Rotation submitted.', 'success');
      if (res.alerts?.length) {
        res.alerts.forEach((a) => addToast(`Tyre ${a.serial}: ${a.reason}`, 'info'));
      }
      await load();
    } catch (err) {
      addToast(err instanceof ApiError ? err.message : 'Failed to submit rotation', 'error');
    } finally {
      setBusy(false);
    }
  }

  async function handleApprove() {
    if (!id) return;
    setBusy(true);
    try {
      await tyreRotationApi.approve(id);
      addToast('Rotation approved.', 'success');
      await load();
    } catch (err) {
      addToast(err instanceof ApiError ? err.message : 'Failed to approve rotation', 'error');
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <div className="muted">Loading...</div>;
  if (error || !detail) return <div className="badge danger" style={{ display: 'block', padding: '8px 12px' }}>{error || 'Not found'}</div>;

  const canSubmit = detail.status === 'Draft' && ['ADMIN', 'FLEET_MANAGER', 'WORKSHOP_SUPERVISOR'].includes(user?.role_code || '');
  const canApprove = detail.status === 'Submitted' && ['ADMIN', 'FLEET_MANAGER'].includes(user?.role_code || '');

  return (
    <div className="col gap-16">
      <div className="page-header">
        <h1>Tyre Rotation - {detail.asset_label || detail.asset_id}</h1>
        <div className="row gap-8">
          {canSubmit && <button type="button" className="btn primary" disabled={busy} onClick={handleSubmit}>Submit</button>}
          {canApprove && <button type="button" className="btn primary" disabled={busy} onClick={handleApprove}>Approve</button>}
          <button type="button" className="btn" onClick={() => window.print()}>Print Slip</button>
        </div>
      </div>

      <div className="card" style={{ padding: 16 }}>
        <div className="field-row cols-4">
          <div><div className="muted" style={{ fontSize: 11 }}>Status</div><span className={`badge ${detail.status === 'Approved' ? 'success' : detail.status === 'Submitted' ? '' : 'warn'}`}>{detail.status}</span></div>
          <div><div className="muted" style={{ fontSize: 11 }}>Asset Type</div>{detail.asset_type}</div>
          <div><div className="muted" style={{ fontSize: 11 }}>Rotation Date</div>{new Date(detail.rotation_date).toLocaleDateString()}</div>
          <div><div className="muted" style={{ fontSize: 11 }}>Odometer (km)</div>{detail.odometer_km}</div>
        </div>
        <div className="field-row cols-4" style={{ marginTop: 12 }}>
          <div><div className="muted" style={{ fontSize: 11 }}>Technician</div>{detail.technician_name || '-'}</div>
          <div><div className="muted" style={{ fontSize: 11 }}>Reason</div>{detail.reason_code || '-'}</div>
          <div><div className="muted" style={{ fontSize: 11 }}>Submitted</div>{detail.submitted_at ? new Date(detail.submitted_at).toLocaleString() : '-'}</div>
          <div><div className="muted" style={{ fontSize: 11 }}>Approved</div>{detail.approved_at ? new Date(detail.approved_at).toLocaleString() : '-'}</div>
        </div>
        {detail.remarks && <div style={{ marginTop: 12 }}><div className="muted" style={{ fontSize: 11 }}>Remarks</div>{detail.remarks}</div>}
      </div>

      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        <table className="tbl">
          <thead>
            <tr>
              <th>Tyre Serial</th>
              <th>Brand / Size</th>
              <th>From</th>
              <th>To</th>
              <th>Movement</th>
              <th className="num">Tread Depth (mm)</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {detail.lines.map((l) => (
              <tr key={l.tyre_movement_id}>
                <td>{l.tyre_serial_no}</td>
                <td>{[l.brand, l.size].filter(Boolean).join(' / ')}</td>
                <td>{l.from_position || 'Spare'}</td>
                <td>{l.to_position || 'Spare/Removed'}</td>
                <td>{l.movement_type}</td>
                <td className="num tnum">{l.tread_depth_mm ?? '-'}</td>
                <td>{l.condition_notes || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button type="button" className="btn" onClick={() => navigate('/tyre-rotations')}>Back to List</button>
    </div>
  );
}
