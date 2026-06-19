import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { vehicleApi, inspectionTemplateApi, inspectionEventApi, inspectionResultLineApi } from '../../api/resources';
import { ApiError } from '../../api/client';
import type { Vehicle } from '../../types/entities';
import type { InspectionTemplate } from '../../types/entities-p2p3';

const CHECKLIST_ITEMS = [
  { code: 'TYRES', name: 'Tyres' },
  { code: 'LIGHTS', name: 'Lights' },
  { code: 'BRAKES', name: 'Brakes' },
  { code: 'ENGINE', name: 'Engine' },
  { code: 'DOCUMENTS', name: 'Documents' },
];

type ResultValue = 'Pass' | 'Fail' | 'NA';

export default function PdiWorkbench() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [templates, setTemplates] = useState<InspectionTemplate[]>([]);
  const [vehicleId, setVehicleId] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [remarks, setRemarks] = useState('');
  const [results, setResults] = useState<Record<string, ResultValue>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [v, t] = await Promise.all([
          vehicleApi.list({ page: 1, pageSize: 200 }),
          inspectionTemplateApi.list({ page: 1, pageSize: 100 }),
        ]);
        setVehicles(v.items);
        setTemplates(t.items);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function setItemResult(code: string, value: ResultValue) {
    setResults((prev) => ({ ...prev, [code]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!vehicleId || !templateId) {
      setError('Please select a vehicle and a template');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const hasFail = Object.values(results).some((v) => v === 'Fail');
      const event = await inspectionEventApi.create({
        template_id: templateId,
        asset_type: 'Vehicle',
        asset_id: vehicleId,
        vehicle_id: vehicleId,
        inspection_datetime: new Date().toISOString(),
        outcome: hasFail ? 'Fail' : 'Pass',
        remarks: remarks || undefined,
      });
      const inspectionId = (event as { inspection_id: string }).inspection_id;
      for (const item of CHECKLIST_ITEMS) {
        await inspectionResultLineApi.create({
          inspection_id: inspectionId,
          check_item_code: item.code,
          check_item_name: item.name,
          result: results[item.code] || 'NA',
        });
      }
      navigate(`/inspection-events/${inspectionId}`);
    } catch (err) {
      setError(err instanceof ApiError ? `${err.message}${err.errors ? ' - ' + JSON.stringify(err.errors) : ''}` : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="muted">Loading...</div>;

  return (
    <div className="col gap-16" style={{ maxWidth: 820 }}>
      <div className="page-header">
        <h1>PDI &amp; Handover</h1>
      </div>
      {error && <div className="badge danger" style={{ display: 'block', padding: '8px 12px' }}>{error}</div>}
      <form onSubmit={handleSubmit} className="card" style={{ padding: 20 }}>
        <div className="field-row cols-2">
          <div className="field">
            <label>Vehicle<span className="req">*</span></label>
            <select className="select" value={vehicleId} onChange={(e) => setVehicleId(e.target.value)}>
              <option value="">-- select vehicle --</option>
              {vehicles.map((v) => (
                <option key={v.vehicle_id} value={v.vehicle_id}>
                  {v.registration_no} {v.vehicle_code ? `(${v.vehicle_code})` : ''}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Inspection Template<span className="req">*</span></label>
            <select className="select" value={templateId} onChange={(e) => setTemplateId(e.target.value)}>
              <option value="">-- select template --</option>
              {templates.map((t) => (
                <option key={t.template_id} value={t.template_id}>
                  {t.template_name} ({t.template_code})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Checklist</div>
          <table className="tbl">
            <thead>
              <tr>
                <th>Item</th>
                <th>Pass</th>
                <th>Fail</th>
                <th>N/A</th>
              </tr>
            </thead>
            <tbody>
              {CHECKLIST_ITEMS.map((item) => (
                <tr key={item.code}>
                  <td>{item.name}</td>
                  {(['Pass', 'Fail', 'NA'] as ResultValue[]).map((val) => (
                    <td key={val} style={{ textAlign: 'center' }}>
                      <input
                        type="radio"
                        name={`result-${item.code}`}
                        checked={results[item.code] === val}
                        onChange={() => setItemResult(item.code, val)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="field" style={{ marginTop: 16 }}>
          <label>Remarks</label>
          <textarea className="textarea" rows={3} value={remarks} onChange={(e) => setRemarks(e.target.value)} />
        </div>

        <div className="row" style={{ paddingTop: 16, borderTop: '1px solid var(--divider)', marginTop: 16 }}>
          <button type="submit" disabled={saving} className="btn primary">
            {saving ? 'Submitting...' : 'Submit PDI'}
          </button>
          <button type="button" onClick={() => navigate('/dashboard')} className="btn">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
