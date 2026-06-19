import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { hsIncidentApi, hsCorrectiveActionApi } from '../../api/resources';
import { CrudDetailPage } from '../crud/CrudDetailPage';
import type { HsIncident, HsCorrectiveAction } from '../../types/entities-p2p3';
import { ApiError } from '../../api/client';

function formatDate(value?: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString();
}

interface CollapsiblePanelProps {
  title: string;
  viewAllHref: string;
  children: ReactNode;
}

function CollapsiblePanel({ title, viewAllHref, children }: CollapsiblePanelProps) {
  const [open, setOpen] = useState(true);
  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div
        className="px-6 py-3 flex items-center justify-between cursor-pointer hover:bg-gray-50"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{open ? '▼' : '▶'}</span>
          <h2 className="text-sm font-medium">{title}</h2>
        </div>
        <Link
          to={viewAllHref}
          onClick={(e) => e.stopPropagation()}
          className="text-xs text-blue-600 hover:underline"
        >
          View All
        </Link>
      </div>
      {open && <div className="border-t border-gray-100 px-6 py-4">{children}</div>}
    </div>
  );
}

function CorrectiveActionsPanel({ incidentId }: { incidentId: string }) {
  const [records, setRecords] = useState<HsCorrectiveAction[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionDescription, setActionDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function load() {
    setRecords(null);
    setError(null);
    hsCorrectiveActionApi
      .list({ page: 1, pageSize: 20, incident_id: incidentId })
      .then((res) => setRecords(res.items))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load'));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incidentId]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    setSubmitting(true);
    try {
      await hsCorrectiveActionApi.create({
        incident_id: incidentId,
        action_description: actionDescription,
        assigned_to: assignedTo,
        due_date: dueDate || null,
      });
      setActionDescription('');
      setAssignedTo('');
      setDueDate('');
      load();
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : 'Failed to add corrective action');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <CollapsiblePanel title="Corrective Actions" viewAllHref={`/hs-corrective-actions?incident_id=${incidentId}`}>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      {!error && records === null && <div className="text-gray-500 text-sm">Loading...</div>}
      {!error && records !== null && records.length === 0 && (
        <div className="text-gray-500 text-sm">No corrective actions found.</div>
      )}
      {!error && records !== null && records.length > 0 && (
        <div className="overflow-x-auto border border-gray-200 rounded-lg mb-4">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-3 py-2">Description</th>
                <th className="text-left px-3 py-2">Assigned To</th>
                <th className="text-left px-3 py-2">Due Date</th>
                <th className="text-left px-3 py-2">Completed Date</th>
                <th className="text-left px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.action_id} className="border-t border-gray-100">
                  <td className="px-3 py-2">{r.action_description}</td>
                  <td className="px-3 py-2">{r.assigned_to}</td>
                  <td className="px-3 py-2">{formatDate(r.due_date)}</td>
                  <td className="px-3 py-2">{formatDate(r.completed_date)}</td>
                  <td className="px-3 py-2">{r.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-2">
        <div className="flex flex-col">
          <label className="text-xs text-gray-500">Action Description</label>
          <input
            className="border border-gray-300 rounded px-2 py-1 text-sm"
            value={actionDescription}
            onChange={(e) => setActionDescription(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-gray-500">Assigned To (User UUID)</label>
          <input
            className="border border-gray-300 rounded px-2 py-1 text-sm"
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-gray-500">Due Date</label>
          <input
            type="date"
            className="border border-gray-300 rounded px-2 py-1 text-sm"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
        <button type="submit" disabled={submitting} className="btn primary text-sm">
          {submitting ? 'Adding...' : 'Add Corrective Action'}
        </button>
      </form>
      {submitError && <div className="text-red-600 text-sm mt-2">{submitError}</div>}
    </CollapsiblePanel>
  );
}

export default function HsIncidentDetail() {
  return (
    <CrudDetailPage<HsIncident>
      title="H&S Incident Detail"
      basePath="/hs-incidents"
      get={hsIncidentApi.get}
      fieldsToShow={[
        { key: 'incident_type', label: 'Incident Type' },
        { key: 'severity', label: 'Severity' },
        { key: 'vehicle_id', label: 'Vehicle ID' },
        { key: 'driver_id', label: 'Driver ID' },
        { key: 'location', label: 'Location' },
        { key: 'occurred_at', label: 'Occurred At' },
        { key: 'reported_by', label: 'Reported By' },
        { key: 'description', label: 'Description' },
        { key: 'injury_details', label: 'Injury Details' },
        { key: 'is_recordable', label: 'Is Recordable' },
        { key: 'status', label: 'Status' },
      ]}
      extra={(incident) => (
        <div className="flex flex-col gap-4">
          <CorrectiveActionsPanel incidentId={incident.incident_id} />
        </div>
      )}
    />
  );
}
