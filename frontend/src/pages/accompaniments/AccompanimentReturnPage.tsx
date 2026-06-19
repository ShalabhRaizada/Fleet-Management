import { useEffect, useState } from 'react';
import { accompanimentIssueApi, accompanimentApi } from '../../api/resources';
import type { AccompanimentIssue } from '../../types/entities';
import { ApiError } from '../../api/client';
import { useToast } from '../../components/Toast';

export default function AccompanimentReturnPage() {
  const [issues, setIssues] = useState<AccompanimentIssue[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const { addToast } = useToast();

  async function load() {
    setLoading(true);
    try {
      const res = await accompanimentIssueApi.list({ page: 1, pageSize: 200, status: 'Issued' });
      setIssues(res.items);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleReturn(issue: AccompanimentIssue) {
    setBusyId(issue.accompaniment_issue_id);
    setError(null);
    try {
      await accompanimentIssueApi.update(issue.accompaniment_issue_id, {
        return_datetime: new Date().toISOString(),
        status: 'Returned',
      });
      await accompanimentApi.update(issue.accompaniment_id, { current_status: 'InStock' });
      addToast('Accompaniment marked as returned.', 'success');
      load();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Return failed';
      setError(message);
      addToast(message, 'error');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Accompaniment Returns</h1>
      </div>
      {error && <div className="badge danger" style={{ display: 'block', padding: '8px 12px', marginBottom: 16 }}>{error}</div>}
      <div className="card">
        <table className="tbl">
          <thead>
            <tr>
              <th>Accompaniment</th>
              <th>Vehicle</th>
              <th>Issued At</th>
              <th>Seal No</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={5} className="muted">Loading...</td></tr>}
            {!loading && issues.length === 0 && <tr><td colSpan={5} className="muted">No items currently issued.</td></tr>}
            {!loading && issues.map((i) => (
              <tr key={i.accompaniment_issue_id}>
                <td>{i.accompaniment_id}</td>
                <td>{i.vehicle_id || '-'}</td>
                <td>{new Date(i.issue_datetime).toLocaleString()}</td>
                <td>{i.seal_no || '-'}</td>
                <td>
                  <button disabled={busyId === i.accompaniment_issue_id} onClick={() => handleReturn(i)} className="link">
                    Mark Returned
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
