import { useEffect, useState } from 'react';
import { accompanimentIssueApi, accompanimentApi } from '../../api/resources';
import type { AccompanimentIssue } from '../../types/entities';
import { ApiError } from '../../api/client';

export default function AccompanimentReturnPage() {
  const [issues, setIssues] = useState<AccompanimentIssue[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

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
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Return failed');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold">Accompaniment Returns</h1>
      {error && <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded">{error}</div>}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-3 py-2">Accompaniment</th>
              <th className="text-left px-3 py-2">Vehicle</th>
              <th className="text-left px-3 py-2">Issued At</th>
              <th className="text-left px-3 py-2">Seal No</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={5} className="px-3 py-4 text-gray-500">Loading...</td></tr>}
            {!loading && issues.length === 0 && <tr><td colSpan={5} className="px-3 py-4 text-gray-500">No items currently issued.</td></tr>}
            {!loading && issues.map((i) => (
              <tr key={i.accompaniment_issue_id} className="border-t border-gray-100">
                <td className="px-3 py-2">{i.accompaniment_id}</td>
                <td className="px-3 py-2">{i.vehicle_id || '-'}</td>
                <td className="px-3 py-2">{new Date(i.issue_datetime).toLocaleString()}</td>
                <td className="px-3 py-2">{i.seal_no || '-'}</td>
                <td className="px-3 py-2">
                  <button disabled={busyId === i.accompaniment_issue_id} onClick={() => handleReturn(i)} className="text-emerald-600 hover:underline">
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
