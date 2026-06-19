import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tyreRotationApi, getTyreLayout } from '../../api/tyreRotation';
import { vehicleApi, trailerApi, workshopApi } from '../../api/resources';
import { ApiError } from '../../api/client';
import { useToast } from '../../components/Toast';
import { SearchableCombobox } from '../../components/common/SearchableCombobox';
import type { Vehicle, Trailer, Workshop } from '../../types/entities';
import type {
  TyreAssetType, TyreLayout, TyreMovementType, TyreDestinationStatus, TyreRotationLineInput,
} from '../../types/tyreRotation';

const REASON_CODES = ['Scheduled', 'Wear', 'Puncture', 'Uneven Wear', 'Vibration', 'Inspection Finding', 'Other'];
const DESTINATION_STATUSES: TyreDestinationStatus[] = ['Spare', 'SentForRepair', 'Repairable', 'Retreaded', 'Scrap'];

interface DraftLine extends TyreRotationLineInput {
  key: string;
  serialLabel: string;
}

export default function TyreRotationCreate() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [assetType, setAssetType] = useState<TyreAssetType>('Vehicle');
  const [assetId, setAssetId] = useState('');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [trailers, setTrailers] = useState<Trailer[]>([]);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);

  const [rotationDate, setRotationDate] = useState(new Date().toISOString().slice(0, 10));
  const [odometerReading, setOdometerReading] = useState<number | ''>('');
  const [workshopId, setWorkshopId] = useState('');
  const [technicianName, setTechnicianName] = useState('');
  const [reasonCode, setReasonCode] = useState('Scheduled');
  const [remarks, setRemarks] = useState('');

  const [layout, setLayout] = useState<TyreLayout | null>(null);
  const [layoutLoading, setLayoutLoading] = useState(false);
  const [lines, setLines] = useState<DraftLine[]>([]);

  const [sourceKey, setSourceKey] = useState('');
  const [destPosition, setDestPosition] = useState('');
  const [destinationStatus, setDestinationStatus] = useState<TyreDestinationStatus>('Spare');
  const [newTreadDepth, setNewTreadDepth] = useState<number | ''>('');
  const [airPressure, setAirPressure] = useState<number | ''>('');

  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    vehicleApi.list({ page: 1, pageSize: 200 }).then((r) => setVehicles(r.items));
    trailerApi.list({ page: 1, pageSize: 200 }).then((r) => setTrailers(r.items));
    workshopApi.list({ page: 1, pageSize: 200 }).then((r) => setWorkshops(r.items));
  }, []);

  async function loadLayout() {
    if (!assetId) return;
    setLayoutLoading(true);
    setError(null);
    try {
      const data = await getTyreLayout(assetType, assetId);
      setLayout(data);
      if (data.odometer != null) setOdometerReading(Number(data.odometer));
      setLines([]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load tyre layout');
    } finally {
      setLayoutLoading(false);
    }
  }

  // Combine occupied positions + spare-pool tyres into one "movable source" list for the planner.
  const sourceOptions = layout
    ? [
        ...layout.positions.filter((p) => p.tyre).map((p) => ({
          key: `pos:${p.positionCode}`,
          label: `${p.positionCode} - ${p.tyre!.tyre_serial_no} (${p.tyre!.brand || ''} ${p.tyre!.size})`,
          tyreId: p.tyre!.tyre_id,
          fromPosition: p.positionCode,
          oldTreadDepth: null,
        })),
        ...layout.spareTyres.map((t) => ({
          key: `spare:${t.tyre_id}`,
          label: `Spare - ${t.tyre_serial_no} (${t.brand || ''} ${t.size})`,
          tyreId: t.tyre_id,
          fromPosition: null as string | null,
          oldTreadDepth: null,
        })),
      ]
    : [];

  function addMove() {
    if (!sourceKey) return;
    const src = sourceOptions.find((s) => s.key === sourceKey);
    if (!src) return;

    const isFromSpare = sourceKey.startsWith('spare:');
    const isToPosition = !!destPosition;

    let movementType: TyreMovementType;
    let destStatus: TyreDestinationStatus | null = null;

    if (isToPosition) {
      movementType = isFromSpare ? 'SpareToActive' : 'Rotation';
    } else {
      movementType = isFromSpare ? 'AddReplacement' : 'MoveToSpare';
      destStatus = destinationStatus;
    }

    const newLine: DraftLine = {
      key: `${sourceKey}->${destPosition || 'spare'}->${Date.now()}`,
      tyreId: src.tyreId,
      oldPositionCode: src.fromPosition,
      newPositionCode: destPosition || null,
      newTreadDepth: newTreadDepth === '' ? null : Number(newTreadDepth),
      airPressure: airPressure === '' ? null : Number(airPressure),
      movementType,
      destinationStatus: destStatus,
      remarks: null,
      serialLabel: src.label,
    };
    setLines((ls) => [...ls, newLine]);
    setSourceKey('');
    setDestPosition('');
    setNewTreadDepth('');
    setAirPressure('');
  }

  function removeLine(key: string) {
    setLines((ls) => ls.filter((l) => l.key !== key));
  }

  async function saveDraft() {
    setBusy(true);
    setError(null);
    try {
      const result = await tyreRotationApi.create({
        assetType,
        assetId,
        rotationDate,
        odometerReading: Number(odometerReading),
        workshopId: workshopId || null,
        technicianName: technicianName || null,
        reasonCode,
        remarks: remarks || null,
        lines: lines.map(({ key, serialLabel, ...rest }) => rest),
      });
      addToast('Tyre rotation draft saved.', 'success');
      navigate(`/tyre-rotations/${result.rotation_header_id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save rotation draft');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="col gap-16">
      <div className="page-header">
        <h1>New Tyre Rotation</h1>
      </div>

      {error && <div className="badge danger" style={{ display: 'block', padding: '8px 12px' }}>{error}</div>}

      <div className="card" style={{ padding: 16 }}>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>1. Select Asset and Details</div>
        <div className="field-row cols-4">
          <div className="field">
            <label>Asset Type</label>
            <select className="input" value={assetType} onChange={(e) => { setAssetType(e.target.value as TyreAssetType); setAssetId(''); setLayout(null); }}>
              <option value="Vehicle">Vehicle</option>
              <option value="Trailer">Trailer</option>
            </select>
          </div>
          <div className="field">
            <label>{assetType}</label>
            <SearchableCombobox
              value={assetId}
              onChange={setAssetId}
              placeholder={`Search ${assetType.toLowerCase()}...`}
              options={
                assetType === 'Vehicle'
                  ? vehicles.map((v) => ({ value: v.vehicle_id, label: v.registration_no }))
                  : trailers.map((t) => ({ value: t.trailer_id, label: t.trailer_no }))
              }
            />
          </div>
          <div className="field">
            <label>Rotation Date</label>
            <input type="date" className="input" value={rotationDate} onChange={(e) => setRotationDate(e.target.value)} />
          </div>
          <div className="field">
            <label>Odometer (km)</label>
            <input type="number" className="input" value={odometerReading} onChange={(e) => setOdometerReading(e.target.value === '' ? '' : Number(e.target.value))} />
          </div>
        </div>
        <div className="field-row cols-4" style={{ marginTop: 12 }}>
          <div className="field">
            <label>Workshop</label>
            <SearchableCombobox
              value={workshopId}
              onChange={setWorkshopId}
              placeholder="Search workshop..."
              options={workshops.map((w) => ({ value: w.workshop_id, label: w.workshop_name }))}
            />
          </div>
          <div className="field">
            <label>Technician</label>
            <input className="input" value={technicianName} onChange={(e) => setTechnicianName(e.target.value)} />
          </div>
          <div className="field">
            <label>Reason</label>
            <select className="input" value={reasonCode} onChange={(e) => setReasonCode(e.target.value)}>
              {REASON_CODES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Remarks</label>
            <input className="input" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
          </div>
        </div>
        <div className="row gap-8" style={{ marginTop: 12 }}>
          <button type="button" className="btn primary" disabled={!assetId || layoutLoading} onClick={loadLayout}>
            {layoutLoading ? 'Loading...' : 'Load Tyre Layout'}
          </button>
        </div>
      </div>

      {layout && (
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>2. Current Layout ({layout.axleConfiguration})</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
            {layout.positions.map((p) => (
              <div key={p.positionCode} className="card" style={{ padding: 10, background: p.tyre ? undefined : '#fafafa' }}>
                <div style={{ fontWeight: 600, fontSize: 12.5 }}>{p.positionCode}</div>
                <div className="muted" style={{ fontSize: 11, marginBottom: 6 }}>{p.positionLabel}</div>
                {p.tyre ? (
                  <>
                    <div style={{ fontSize: 12.5 }}>{p.tyre.tyre_serial_no}</div>
                    <div className="muted" style={{ fontSize: 11 }}>{p.tyre.brand} {p.tyre.size}</div>
                    <div className="muted" style={{ fontSize: 11 }}>{p.tyre.total_run_km ?? 0} km run</div>
                  </>
                ) : (
                  <div className="muted" style={{ fontSize: 11 }}>Empty</div>
                )}
              </div>
            ))}
          </div>
          {layout.spareTyres.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div className="muted" style={{ fontSize: 12, marginBottom: 4 }}>Spare Pool</div>
              <div className="row gap-8" style={{ flexWrap: 'wrap' }}>
                {layout.spareTyres.map((t) => (
                  <span key={t.tyre_id} className="badge">{t.tyre_serial_no}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {layout && (
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>3. Plan Tyre Movements</div>
          <div className="field-row cols-4">
            <div className="field">
              <label>Source (current position / spare)</label>
              <select className="input" value={sourceKey} onChange={(e) => setSourceKey(e.target.value)}>
                <option value="">Select source...</option>
                {sourceOptions.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Destination Position (leave blank to send to spare/removal)</label>
              <select className="input" value={destPosition} onChange={(e) => setDestPosition(e.target.value)}>
                <option value="">-- Send to Spare / Remove --</option>
                {layout.positions.map((p) => <option key={p.positionCode} value={p.positionCode}>{p.positionCode}</option>)}
              </select>
            </div>
            {!destPosition && (
              <div className="field">
                <label>Destination Status</label>
                <select className="input" value={destinationStatus} onChange={(e) => setDestinationStatus(e.target.value as TyreDestinationStatus)}>
                  {DESTINATION_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            )}
            <div className="field">
              <label>New Tread Depth (mm)</label>
              <input type="number" className="input" value={newTreadDepth} onChange={(e) => setNewTreadDepth(e.target.value === '' ? '' : Number(e.target.value))} />
            </div>
          </div>
          <div className="row gap-8" style={{ marginTop: 12 }}>
            <button type="button" className="btn" disabled={!sourceKey} onClick={addMove}>Move Tyre</button>
          </div>

          {lines.length > 0 && (
            <table className="tbl" style={{ marginTop: 16 }}>
              <thead>
                <tr>
                  <th>Tyre</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Movement</th>
                  <th>Destination Status</th>
                  <th className="num">New Tread (mm)</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {lines.map((l) => (
                  <tr key={l.key}>
                    <td>{l.serialLabel}</td>
                    <td>{l.oldPositionCode || 'Spare'}</td>
                    <td>{l.newPositionCode || 'Spare/Removed'}</td>
                    <td>{l.movementType}</td>
                    <td>{l.destinationStatus || '-'}</td>
                    <td className="num tnum">{l.newTreadDepth ?? '-'}</td>
                    <td><button type="button" className="btn sm danger" onClick={() => removeLine(l.key)}>Remove</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {layout && (
        <div className="row gap-8">
          <button type="button" className="btn primary lg" disabled={busy || lines.length === 0 || !odometerReading} onClick={saveDraft}>
            {busy ? 'Saving...' : 'Save as Draft'}
          </button>
          <button type="button" className="btn" onClick={() => navigate('/tyre-rotations')}>Cancel</button>
        </div>
      )}
    </div>
  );
}
