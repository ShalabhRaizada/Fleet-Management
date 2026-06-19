import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fuelTransactionApi, vehicleApi } from '../../api/resources';
import { FormGrid, FormActions } from '../../components/Form';
import type { FieldDef } from '../../components/Form';
import type { FuelTransaction, Vehicle } from '../../types/entities';
import { ApiError } from '../../api/client';
import { useToast } from '../../components/Toast';

const DEFAULTS: Partial<FuelTransaction> = {
  status: 'Recorded',
  fuel_type: 'Diesel',
  txn_datetime: new Date().toISOString().slice(0, 16),
};

export default function FuelForm() {
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [values, setValues] = useState<Partial<FuelTransaction>>(DEFAULTS);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    vehicleApi.list({ page: 1, pageSize: 200 }).then((r) => setVehicles(r.items));
  }, []);

  useEffect(() => {
    if (isNew || !id) {
      setValues(DEFAULTS);
      return;
    }
    setLoading(true);
    fuelTransactionApi
      .get(id)
      .then(setValues)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  function handleChange(name: keyof FuelTransaction & string, value: unknown) {
    setValues((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'quantity' || name === 'rate_per_unit') {
        const qty = name === 'quantity' ? value : next.quantity;
        const rate = name === 'rate_per_unit' ? value : next.rate_per_unit;
        const qtyNum = typeof qty === 'number' ? qty : Number(qty);
        const rateNum = typeof rate === 'number' ? rate : Number(rate);
        if (!isNaN(qtyNum) && !isNaN(rateNum) && qty !== '' && rate !== '') {
          next.amount = Math.round(qtyNum * rateNum * 100) / 100;
        }
      }
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (isNew) {
        await fuelTransactionApi.create(values);
        addToast('Record created successfully.', 'success');
      } else if (id) {
        await fuelTransactionApi.update(id, values);
        addToast('Record updated successfully.', 'success');
      }
      navigate('/fuel');
    } catch (err) {
      const message = err instanceof ApiError ? `${err.message}${err.errors ? ' - ' + JSON.stringify(err.errors) : ''}` : 'Save failed';
      setError(message);
      addToast(message, 'error');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="muted">Loading...</div>;

  const fields: FieldDef<FuelTransaction>[] = [
    {
      name: 'vehicle_id', label: 'Vehicle', type: 'select', required: true,
      options: vehicles.map((v) => ({ value: v.vehicle_id, label: v.registration_no })),
    },
    {
      name: 'fuel_type', label: 'Fuel Type', type: 'select', required: true,
      options: ['Diesel', 'CNG', 'LNG', 'EV', 'Hybrid'].map((v) => ({ value: v, label: v })),
    },
    { name: 'txn_datetime', label: 'Transaction Date/Time', type: 'datetime-local', required: true },
    { name: 'quantity', label: 'Quantity', type: 'number', required: true, min: 0.001 },
    { name: 'unit_of_measure', label: 'Unit of Measure', required: true, placeholder: 'L / Kg / kWh' },
    { name: 'rate_per_unit', label: 'Rate per Unit', type: 'number', required: true, min: 0 },
    { name: 'odometer_km', label: 'Odometer (km)', type: 'number', min: 0 },
    { name: 'start_soc_pct', label: 'Start SoC % (EV)', type: 'number', min: 0, max: 100 },
    { name: 'end_soc_pct', label: 'End SoC % (EV)', type: 'number', min: 0, max: 100 },
    { name: 'fill_pressure', label: 'Fill Pressure (CNG/LNG)', type: 'number' },
    { name: 'fuel_temperature', label: 'Fuel Temperature (LNG)', type: 'number' },
    { name: 'receipt_no', label: 'Receipt No' },
  ];

  return (
    <div style={{ maxWidth: 760 }}>
      <div className="page-header">
        <h1>Fuel Transaction</h1>
      </div>
      {error && <div className="badge danger" style={{ display: 'block', padding: '8px 12px', marginBottom: 16 }}>{error}</div>}
      <form onSubmit={handleSubmit} className="card" style={{ padding: 20 }}>
        <FormGrid fields={fields} values={values} onChange={handleChange} />
        <div className="field-row cols-2">
          <div className="field">
            <label>
              Amount <span style={{ fontSize: 11, color: 'var(--muted, #888)' }}>(auto-calculated)</span>
            </label>
            <input
              type="number"
              className="input"
              min={0}
              value={(values.amount as number | string) ?? ''}
              readOnly
              style={{ backgroundColor: '#f3f4f6' }}
            />
          </div>
        </div>
        <FormActions>
          <button type="submit" disabled={saving} className="btn primary">
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button type="button" onClick={() => navigate('/fuel')} className="btn">
            Cancel
          </button>
        </FormActions>
      </form>
    </div>
  );
}
