import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { epicStatusUploadApi, nonWorkingVehicleActionApi } from '../../api/resources';
import { ApiError } from '../../api/client';
import type { EpicStatusUpload, NonWorkingVehicleAction } from '../../types/entities';

export default function NonWorkingList() {
  const [uploads, setUploads] = useState<EpicStatusUpload[]>([]);
  const [actions, setActions] = useState<NonWorkingVehicleAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ issue_category: string; remedial_action: string; resolved: boolean }>({
    issue_category: '',
    remedial_action: '',
    resolved: false,
  });
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const [u, a] = await Promise.all([
        epicStatusUploadApi.list({ page: 1, pageSize: 50, sortBy: 'uploaded_at', sortDir: 'DESC' }),
        nonWorkingVehicleActionApi.list({ page: 1, pageSize: 200 }),
      ]);
      setUploads(u.items);
      setActions(a.items);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setUploadError('Please choose a CSV file');
      return;
    }
    setUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      await api.raw.post('/epic-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFile(null);
      await load();
    } catch (err) {
      setUploadError(err instanceof ApiError ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  function startEdit(action: NonWorkingVehicleAction) {
    setEditingId(action.action_id);
    setEditForm({
      issue_category: action.issue_category || '',
      remedial_action: action.remedial_action || '',
      resolved: action.resolved,
    });
  }

  async function saveEdit() {
    if (!editingId) return;
    setSaving(true);
    try {
      await nonWorkingVehicleActionApi.update(editingId, {
        issue_category: editForm.issue_category || undefined,
        remedial_action: editForm.remedial_action || undefined,
        resolved: editForm.resolved,
        resolved_at: editForm.resolved ? new Date().toISOString() : null,
      });
      setEditingId(null);
      await load();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="muted">Loading...</div>;

  const unresolvedCount = actions.filter((a) => !a.resolved).length;

  return (
    <div className="col gap-16">
      <div className="page-header">
        <h1>Non-Working Vehicles</h1>
      </div>
      {error && <div className="badge danger" style={{ display: 'block', padding: '8px 12px' }}>{error}</div>}

      <div className="kpi">
        <div className="label">Unresolved Actions</div>
        <div className="value">{unresolvedCount}</div>
      </div>

      <div className="card" style={{ padding: 20 }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Upload EPIC Vehicle Status File</div>
        <form onSubmit={handleUpload} className="row" style={{ gap: 12, alignItems: 'center' }}>
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <button type="submit" disabled={uploading} className="btn primary">
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </form>
        <div className="muted" style={{ marginTop: 8, fontSize: 12 }}>
          CSV must have columns "vehicle_no" and "epic_status". Rows whose status indicates the
          vehicle is working (e.g. Available, InTrip) are skipped; all others create an
          actionable non-working record.
        </div>
        {uploadError && <div className="badge danger" style={{ display: 'block', padding: '8px 12px', marginTop: 8 }}>{uploadError}</div>}
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '12px 16px', fontWeight: 600 }}>Upload Batches</div>
        <table className="tbl">
          <thead>
            <tr>
              <th>File Name</th>
              <th>Uploaded At</th>
              <th>Total</th>
              <th>Matched</th>
              <th>Unmatched</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {uploads.map((u) => (
              <tr key={u.upload_id}>
                <td>{u.file_name}</td>
                <td>{new Date(u.uploaded_at).toLocaleString()}</td>
                <td>{u.total_rows}</td>
                <td>{u.matched_rows}</td>
                <td>{u.unmatched_rows}</td>
                <td><span className="badge outline">{u.status}</span></td>
              </tr>
            ))}
            {uploads.length === 0 && (
              <tr>
                <td colSpan={6} className="muted">No uploads yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '12px 16px', fontWeight: 600 }}>Non-Working Vehicle Actions</div>
        <table className="tbl">
          <thead>
            <tr>
              <th>Vehicle No (Raw)</th>
              <th>Vehicle ID</th>
              <th>EPIC Status</th>
              <th>Issue Category</th>
              <th>Remedial Action</th>
              <th>Resolved</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {actions.map((a) => (
              <tr key={a.action_id}>
                <td className="mono">{a.vehicle_no_raw || '-'}</td>
                <td className="mono">{a.vehicle_id || <span className="muted">unmatched</span>}</td>
                <td>{a.epic_status_raw || '-'}</td>
                {editingId === a.action_id ? (
                  <>
                    <td>
                      <input
                        className="input"
                        value={editForm.issue_category}
                        onChange={(e) => setEditForm((f) => ({ ...f, issue_category: e.target.value }))}
                      />
                    </td>
                    <td>
                      <input
                        className="input"
                        value={editForm.remedial_action}
                        onChange={(e) => setEditForm((f) => ({ ...f, remedial_action: e.target.value }))}
                      />
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        checked={editForm.resolved}
                        onChange={(e) => setEditForm((f) => ({ ...f, resolved: e.target.checked }))}
                      />
                    </td>
                    <td>
                      <div className="row">
                        <span className="link" onClick={saveEdit}>{saving ? 'Saving...' : 'Save'}</span>
                        <span className="link" onClick={() => setEditingId(null)}>Cancel</span>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{a.issue_category || '-'}</td>
                    <td>{a.remedial_action || '-'}</td>
                    <td>
                      <span className={`badge ${a.resolved ? 'success' : 'outline'}`}>{a.resolved ? 'Resolved' : 'Open'}</span>
                    </td>
                    <td>
                      <span className="link" onClick={() => startEdit(a)}>Resolve / Edit</span>
                    </td>
                  </>
                )}
              </tr>
            ))}
            {actions.length === 0 && (
              <tr>
                <td colSpan={7} className="muted">No non-working vehicle actions yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
