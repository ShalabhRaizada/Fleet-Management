import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  vehicleApi, inspectionTemplateApi, inspectionEventApi, inspectionResultLineApi,
  handoverDocumentApi,
} from '../../api/resources';
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

  const [submittedInspectionId, setSubmittedInspectionId] = useState<string | null>(null);
  const [submittedVehicleId, setSubmittedVehicleId] = useState<string | null>(null);
  const [showHandoverForm, setShowHandoverForm] = useState(false);
  const [handoverSaving, setHandoverSaving] = useState(false);
  const [handoverError, setHandoverError] = useState<string | null>(null);
  const [handoverCreated, setHandoverCreated] = useState(false);
  const [handoverForm, setHandoverForm] = useState({
    handover_type: 'Driver Acceptance',
    handed_over_by: '',
    received_by: '',
    driver_signature_name: '',
    acceptance_remarks: '',
    accepted: false,
  });

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
      setSubmittedInspectionId(inspectionId);
      setSubmittedVehicleId(vehicleId);
    } catch (err) {
      setError(err instanceof ApiError ? `${err.message}${err.errors ? ' - ' + JSON.stringify(err.errors) : ''}` : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateHandover(e: React.FormEvent) {
    e.preventDefault();
    if (!submittedInspectionId || !submittedVehicleId) return;
    setHandoverSaving(true);
    setHandoverError(null);
    try {
      await handoverDocumentApi.create({
        inspection_event_id: submittedInspectionId,
        vehicle_id: submittedVehicleId,
        handover_type: handoverForm.handover_type,
        handed_over_by: handoverForm.handed_over_by || undefined,
        received_by: handoverForm.received_by || undefined,
        handover_date: new Date().toISOString(),
        driver_signature_name: handoverForm.driver_signature_name || undefined,
        acceptance_remarks: handoverForm.acceptance_remarks || undefined,
        accepted: handoverForm.accepted,
      });
      setHandoverCreated(true);
      setShowHandoverForm(false);
    } catch (err) {
      setHandoverError(err instanceof ApiError ? err.message : 'Failed to create handover document');
    } finally {
      setHandoverSaving(false);
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
          <button type="submit" disabled={saving || !!submittedInspectionId} className="btn primary">
            {saving ? 'Submitting...' : submittedInspectionId ? 'Submitted' : 'Submit PDI'}
          </button>
          <button type="button" onClick={() => navigate('/dashboard')} className="btn">
            Cancel
          </button>
        </div>
      </form>

      {submittedInspectionId && (
        <div className="card" style={{ padding: 20 }}>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <div style={{ fontWeight: 600 }}>Inspection submitted successfully.</div>
            <span className="link" onClick={() => navigate(`/inspection-events/${submittedInspectionId}`)}>
              View Inspection
            </span>
          </div>

          {handoverCreated ? (
            <div className="badge success" style={{ display: 'block', padding: '8px 12px', marginTop: 12 }}>
              Handover document created.
            </div>
          ) : !showHandoverForm ? (
            <button type="button" className="btn primary" style={{ marginTop: 12 }} onClick={() => setShowHandoverForm(true)}>
              Generate Handover
            </button>
          ) : (
            <form onSubmit={handleCreateHandover} style={{ marginTop: 16 }}>
              {handoverError && <div className="badge danger" style={{ display: 'block', padding: '8px 12px', marginBottom: 12 }}>{handoverError}</div>}
              <div className="field-row cols-2">
                <div className="field">
                  <label>Handover Type</label>
                  <select
                    className="select"
                    value={handoverForm.handover_type}
                    onChange={(e) => setHandoverForm((f) => ({ ...f, handover_type: e.target.value }))}
                  >
                    <option value="Driver Acceptance">Driver Acceptance</option>
                    <option value="Workshop Release">Workshop Release</option>
                  </select>
                </div>
                <div className="field">
                  <label>Handed Over By</label>
                  <input
                    className="input"
                    value={handoverForm.handed_over_by}
                    onChange={(e) => setHandoverForm((f) => ({ ...f, handed_over_by: e.target.value }))}
                  />
                </div>
                <div className="field">
                  <label>Received By</label>
                  <input
                    className="input"
                    value={handoverForm.received_by}
                    onChange={(e) => setHandoverForm((f) => ({ ...f, received_by: e.target.value }))}
                  />
                </div>
                <div className="field">
                  <label>Driver Signature (typed name)</label>
                  <input
                    className="input"
                    value={handoverForm.driver_signature_name}
                    onChange={(e) => setHandoverForm((f) => ({ ...f, driver_signature_name: e.target.value }))}
                  />
                </div>
              </div>
              <div className="field" style={{ marginTop: 12 }}>
                <label>Acceptance Remarks</label>
                <textarea
                  className="textarea"
                  rows={2}
                  value={handoverForm.acceptance_remarks}
                  onChange={(e) => setHandoverForm((f) => ({ ...f, acceptance_remarks: e.target.value }))}
                />
              </div>
              <div className="row" style={{ marginTop: 12, alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={handoverForm.accepted}
                  onChange={(e) => setHandoverForm((f) => ({ ...f, accepted: e.target.checked }))}
                  id="handover-accepted"
                />
                <label htmlFor="handover-accepted" style={{ marginLeft: 8 }}>Accepted</label>
              </div>
              <div className="row" style={{ marginTop: 16 }}>
                <button type="submit" disabled={handoverSaving} className="btn primary">
                  {handoverSaving ? 'Saving...' : 'Save Handover'}
                </button>
                <button type="button" className="btn" onClick={() => setShowHandoverForm(false)}>
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
