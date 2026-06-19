import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { accompanimentApi, accompanimentIssueApi, vehicleApi } from '../../api/resources';
import { ApiError } from '../../api/client';
import { SearchableCombobox } from '../../components/common/SearchableCombobox';
import { useToast } from '../../components/Toast';

export default function AccompanimentIssuePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [vehicleId, setVehicleId] = useState('');
  const [sealNo, setSealNo] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

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
      addToast('Accompaniment issued successfully.', 'success');
      navigate('/accompaniments');
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Issue failed';
      setError(message);
      addToast(message, 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ maxWidth: 480 }}>
      <div className="page-header">
        <h1>Issue Accompaniment</h1>
      </div>
      {error && <div className="badge danger" style={{ display: 'block', padding: '8px 12px', marginBottom: 16 }}>{error}</div>}
      <form onSubmit={handleSubmit} className="card">
        <div className="card-b" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="field">
            <label>Vehicle<span className="req">*</span></label>
            <SearchableCombobox
              value={vehicleId}
              onChange={(v) => setVehicleId(String(v))}
              required
              placeholder="Search vehicle..."
              loadOptions={async (q) => {
                const res = await vehicleApi.list({ page: 1, pageSize: 20, q });
                return res.items.map((v) => ({ value: v.vehicle_id, label: v.registration_no }));
              }}
            />
          </div>
          <div className="field">
            <label>Seal No (if applicable)</label>
            <input className="input" value={sealNo} onChange={(e) => setSealNo(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button disabled={busy} className="btn btn-primary" type="submit">
              {busy ? 'Saving...' : 'Issue'}
            </button>
            <button type="button" onClick={() => navigate('/accompaniments')} className="btn">
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
