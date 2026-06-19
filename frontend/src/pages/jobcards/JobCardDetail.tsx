import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jobCardApi, jobCardLineApi } from '../../api/resources';
import type { JobCard, JobCardLine } from '../../types/entities';
import { ApiError } from '../../api/client';

export default function JobCardDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [jobCard, setJobCard] = useState<JobCard | null>(null);
  const [lines, setLines] = useState<JobCardLine[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState<number | ''>(1);
  const [unitRate, setUnitRate] = useState<number | ''>('');
  const [busy, setBusy] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const jc = await jobCardApi.get(id);
      setJobCard(jc);
      const lineRes = await jobCardLineApi.list({ page: 1, pageSize: 200, job_card_id: id });
      setLines(lineRes.items);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function addLine(e: React.FormEvent) {
    e.preventDefault();
    if (!id || quantity === '' || unitRate === '') return;
    setBusy(true);
    setError(null);
    try {
      await jobCardLineApi.create({
        job_card_id: id,
        description,
        quantity,
        unit_rate: unitRate,
        line_amount: Number(quantity) * Number(unitRate),
        status: 'Pending',
      });
      setDescription('');
      setQuantity(1);
      setUnitRate('');
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to add line');
    } finally {
      setBusy(false);
    }
  }

  function requestRemove(lineId: string) {
    setConfirmRemoveId(lineId);
  }

  function cancelRemove() {
    setConfirmRemoveId(null);
  }

  async function confirmRemove(lineId: string) {
    setRemovingId(lineId);
    setError(null);
    try {
      await jobCardLineApi.remove(lineId);
      setConfirmRemoveId(null);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to remove line');
    } finally {
      setRemovingId(null);
    }
  }

  if (loading) return <div className="text-gray-500 text-sm">Loading...</div>;
  if (!jobCard) return <div className="text-red-600 text-sm">Job card not found.</div>;

  const total = lines.reduce((sum, l) => sum + (l.line_amount || 0), 0);

  return (
    <div className="flex flex-col gap-4 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold flex items-center gap-2">
          Job Card: {jobCard.job_card_no}
          {jobCard.sla_breached && (
            <span className="inline-block bg-red-600 text-white text-xs font-semibold px-2 py-0.5 rounded">
              SLA Breached
            </span>
          )}
        </h1>
        <div className="flex gap-2">
          <button onClick={() => navigate(`/job-cards/${id}/edit`)} className="text-sm px-3 py-1.5 bg-amber-100 hover:bg-amber-200 rounded">Edit</button>
          <button onClick={() => navigate('/job-cards')} className="text-sm px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded border border-gray-300">Back</button>
        </div>
      </div>
      {error && <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded">{error}</div>}

      <div className="bg-white border border-gray-200 rounded-lg p-6 grid grid-cols-2 md:grid-cols-3 gap-4">
        <div><div className="text-xs uppercase text-gray-400">Type</div><div className="text-sm">{jobCard.job_card_type}</div></div>
        <div><div className="text-xs uppercase text-gray-400">Priority</div><div className="text-sm">{jobCard.priority}</div></div>
        <div><div className="text-xs uppercase text-gray-400">Status</div><div className="text-sm">{jobCard.status}</div></div>
        <div><div className="text-xs uppercase text-gray-400">SLA Target Hours</div><div className="text-sm">{jobCard.sla_target_hours ?? '-'}</div></div>
        <div className="md:col-span-3"><div className="text-xs uppercase text-gray-400">Defect Summary</div><div className="text-sm">{jobCard.defect_summary}</div></div>
        <div><div className="text-xs uppercase text-gray-400">Estimated Amount</div><div className="text-sm">{jobCard.estimated_amount ?? '-'}</div></div>
        <div><div className="text-xs uppercase text-gray-400">Approved Amount</div><div className="text-sm">{jobCard.approved_amount ?? '-'}</div></div>
        <div><div className="text-xs uppercase text-gray-400">Actual Amount</div><div className="text-sm">{jobCard.actual_amount ?? '-'}</div></div>
      </div>

      <div>
        <h2 className="text-sm font-medium mb-3">Line Items</h2>
        <div className="overflow-x-auto border border-gray-200 rounded-lg mb-3">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-3 py-2">Description</th>
                <th className="text-left px-3 py-2">Qty</th>
                <th className="text-left px-3 py-2">Unit Rate</th>
                <th className="text-left px-3 py-2">Line Amount</th>
                <th className="text-left px-3 py-2">Status</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {lines.length === 0 && <tr><td colSpan={6} className="px-3 py-4 text-gray-500">No line items yet.</td></tr>}
              {lines.map((l) => (
                <tr key={l.job_card_line_id} className="border-t border-gray-100">
                  <td className="px-3 py-2">{l.description}</td>
                  <td className="px-3 py-2">{l.quantity}</td>
                  <td className="px-3 py-2">{l.unit_rate}</td>
                  <td className="px-3 py-2">{l.line_amount}</td>
                  <td className="px-3 py-2">{l.status}</td>
                  <td className="px-3 py-2">
                    {confirmRemoveId === l.job_card_line_id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Remove?</span>
                        <button
                          disabled={removingId === l.job_card_line_id}
                          onClick={() => confirmRemove(l.job_card_line_id)}
                          className="text-red-600 hover:underline text-xs disabled:opacity-50"
                        >
                          Yes
                        </button>
                        <button onClick={cancelRemove} className="text-gray-600 hover:underline text-xs">
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        disabled={removingId === l.job_card_line_id}
                        onClick={() => requestRemove(l.job_card_line_id)}
                        className="text-red-600 hover:underline disabled:opacity-50"
                      >
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-gray-200 font-medium">
                <td className="px-3 py-2" colSpan={3}>Total</td>
                <td className="px-3 py-2">{total.toFixed(2)}</td>
                <td />
                <td />
              </tr>
            </tfoot>
          </table>
        </div>

        <form onSubmit={addLine} className="flex flex-wrap gap-2 items-end bg-white border border-gray-200 rounded-lg p-4">
          <input className="border border-gray-300 rounded px-3 py-1.5 text-sm flex-1 min-w-[160px]" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required />
          <input className="border border-gray-300 rounded px-3 py-1.5 text-sm w-24" type="number" min={1} placeholder="Qty" value={quantity} onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))} required />
          <input className="border border-gray-300 rounded px-3 py-1.5 text-sm w-32" type="number" min={0} placeholder="Unit Rate" value={unitRate} onChange={(e) => setUnitRate(e.target.value === '' ? '' : Number(e.target.value))} required />
          <button disabled={busy} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm px-4 py-1.5 rounded">
            Add Line
          </button>
        </form>
      </div>
    </div>
  );
}
