import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fuelTransactionApi, vehicleApi } from '../../api/resources';
import { FormGrid } from '../../components/Form';
import type { FieldDef } from '../../components/Form';
import type { FuelTransaction, Vehicle } from '../../types/entities';
import { ApiError } from '../../api/client';
import { useToast } from '../../components/Toast';
import { FormSection } from '../../components/common/FormSection';
import { SearchableCombobox } from '../../components/common/SearchableCombobox';
import { ActionFooter } from '../../components/common/ActionFooter';

const DEFAULTS: Partial<FuelTransaction> = {
  status: 'Recorded',
  fuel_type: 'Diesel',
  txn_datetime: new Date().toISOString().slice(0, 16),
};

const BASIC_FIELDS: FieldDef<FuelTransaction>[] = [
  { name: 'vehicle_id', label: 'Vehicle Registration Number' },
  {
    name: 'fuel_type', label: 'Fuel Type', type: 'select', required: true,
    options: ['Diesel', 'CNG', 'LNG', 'EV', 'Hybrid'].map((v) => ({ value: v, label: v })),
  },
  { name: 'txn_datetime', label: 'Transaction Date/Time', type: 'datetime-local', required: true },
  { name: 'receipt_no', label: 'Receipt No' },
];

const QUANTITY_FIELDS: FieldDef<FuelTransaction>[] = [
  { name: 'quantity', label: 'Quantity', type: 'number', required: true, min: 0.001 },
  { name: 'unit_of_measure', label: 'Unit of Measure', required: true, placeholder: 'L / Kg / kWh' },
  { name: 'rate_per_unit', label: 'Rate per Unit', type: 'number', required: true, min: 0 },
];

const ODOMETER_FIELDS: FieldDef<FuelTransaction>[] = [
  { name: 'odometer_km', label: 'Current Odometer (km)', type: 'number', min: 0 },
  { name: 'start_soc_pct', label: 'Start SoC % (EV)', type: 'number', min: 0, max: 100 },
  { name: 'end_soc_pct', label: 'End SoC % (EV)', type: 'number', min: 0, max: 100 },
  { name: 'fill_pressure', label: 'Fill Pressure (CNG/LNG)', type: 'number' },
  { name: 'fuel_temperature', label: 'Fuel Temperature (LNG)', type: 'number' },
];

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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [previousOdometer, setPreviousOdometer] = useState<number | null>(null);

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

  function validate(next: Partial<FuelTransaction>): Record<string, string> {
    const fieldErrors: Record<string, string> = {};
    if (next.quantity != null && next.quantity <= 0) fieldErrors.quantity = 'Quantity must be greater than zero';
    if (next.rate_per_unit != null && next.rate_per_unit <= 0) fieldErrors.rate_per_unit = 'Rate must be greater than zero';
    if (previousOdometer != null && next.odometer_km != null && next.odometer_km < previousOdometer) {
      fieldErrors.odometer_km = `Cannot be less than previous odometer (${previousOdometer} km)`;
    }
    return fieldErrors;
  }

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
      if (name === 'vehicle_id') {
        const vehicle = vehicles.find((v) => v.vehicle_id === value);
        if (vehicle) {
          next.fuel_type = vehicle.fuel_type;
          if (vehicle.current_odometer_km != null) {
            setPreviousOdometer(vehicle.current_odometer_km);
            if (next.odometer_km == null) next.odometer_km = vehicle.current_odometer_km;
          }
        }
      }
      setErrors(validate(next));
      return next;
    });
  }

  const distanceSinceLastFuel = previousOdometer != null && values.odometer_km != null ? Math.max(0, values.odometer_km - previousOdometer) : null;
  const fuelEfficiency = distanceSinceLastFuel != null && distanceSinceLastFuel > 0 && values.quantity ? Math.round((distanceSinceLastFuel / values.quantity) * 100) / 100 : null;

  async function save(): Promise<boolean> {
    const validationErrors = validate(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return false;
    }
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
      return true;
    } catch (err) {
      const message = err instanceof ApiError ? `${err.message}${err.errors ? ' - ' + JSON.stringify(err.errors) : ''}` : 'Save failed';
      setError(message);
      addToast(message, 'error');
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (await save()) navigate('/fuel');
  }

  async function handleSaveAndAddAnother() {
    if (await save()) {
      setValues(DEFAULTS);
      setErrors({});
      setPreviousOdometer(null);
    }
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); handleSubmit(); }
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n' && isNew) { e.preventDefault(); handleSaveAndAddAnother(); }
      else if (e.key === 'Escape') { navigate('/fuel'); }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values, isNew]);

  if (loading) return <div className="muted">Loading...</div>;

  return (
    <div style={{ maxWidth: 980 }}>
      <div className="page-header">
        <h1>Fuel Transaction</h1>
      </div>
      {error && <div className="badge danger" style={{ display: 'block', padding: '8px 12px', marginBottom: 16 }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <FormSection title="Basic Fuel Entry">
          <FormGrid
            fields={BASIC_FIELDS}
            values={values}
            onChange={handleChange}
            errors={errors}
            cols={3}
            renderers={{
              vehicle_id: (value, onChange) => (
                <SearchableCombobox
                  value={(value as string) ?? ''}
                  onChange={onChange}
                  required
                  options={vehicles.map((v) => ({ value: v.vehicle_id, label: v.registration_no }))}
                  placeholder="Search vehicle..."
                />
              ),
            }}
          />
        </FormSection>
        <FormSection title="Quantity & Cost">
          <FormGrid fields={QUANTITY_FIELDS} values={values} onChange={handleChange} errors={errors} cols={3} />
          <div className="field-row cols-3" style={{ marginTop: 12 }}>
            <div className="field">
              <label>Amount <span className="muted" style={{ fontSize: 11 }}>(auto-calculated)</span></label>
              <input type="number" className="input" min={0} value={(values.amount as number | string) ?? ''} readOnly style={{ backgroundColor: 'var(--surface-3)' }} />
            </div>
          </div>
        </FormSection>
        <FormSection title="Odometer & Efficiency">
          <FormGrid fields={ODOMETER_FIELDS} values={values} onChange={handleChange} errors={errors} cols={3} />
          <div className="field-row cols-3" style={{ marginTop: 12 }}>
            <div className="field">
              <label>Distance Since Last Fuel (km)</label>
              <input className="input" readOnly value={distanceSinceLastFuel ?? ''} style={{ backgroundColor: 'var(--surface-3)' }} />
            </div>
            <div className="field">
              <label>Fuel Efficiency (km/unit)</label>
              <input className="input" readOnly value={fuelEfficiency ?? ''} style={{ backgroundColor: 'var(--surface-3)' }} />
            </div>
          </div>
        </FormSection>
        <ActionFooter
          saving={saving}
          onCancel={() => navigate('/fuel')}
          onSaveAndAddAnother={isNew ? handleSaveAndAddAnother : undefined}
        />
      </form>
    </div>
  );
}
