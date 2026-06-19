import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { complianceApi, complianceTypeApi, vehicleApi, trailerApi } from '../../api/resources';
import { FormGrid } from '../../components/Form';
import type { FieldDef } from '../../components/Form';
import type { AssetCompliance, ComplianceType, Vehicle, Trailer } from '../../types/entities';
import { ApiError } from '../../api/client';
import { useToast } from '../../components/Toast';
import { FormSection } from '../../components/common/FormSection';
import { SearchableCombobox } from '../../components/common/SearchableCombobox';
import { ActionFooter } from '../../components/common/ActionFooter';
import { ExpiryStatusBadge } from '../../components/common/StatusBadge';

const DEFAULTS: Partial<AssetCompliance> = { asset_type: 'Vehicle', status: 'Valid' };

const DETAIL_FIELDS: FieldDef<AssetCompliance>[] = [
  { name: 'compliance_type_code', label: 'Compliance Type' },
  { name: 'document_no', label: 'Document Number' },
  { name: 'issued_by', label: 'Issuing Authority' },
  { name: 'valid_from', label: 'Issue Date', type: 'date' },
  { name: 'valid_upto', label: 'Expiry Date', type: 'date', required: true },
  { name: 'amount', label: 'Amount', type: 'number', min: 0 },
  { name: 'document_url', label: 'Document URL' },
];

const STATUS_FIELDS: FieldDef<AssetCompliance>[] = [
  {
    name: 'status', label: 'Compliance Status', type: 'select', required: true,
    options: ['Valid', 'ExpiringSoon', 'Expired', 'UnderRenewal', 'Exempted', 'NotApplicable'].map((v) => ({ value: v, label: v })),
  },
];

export default function ComplianceForm() {
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [trailers, setTrailers] = useState<Trailer[]>([]);
  const [complianceTypes, setComplianceTypes] = useState<ComplianceType[]>([]);
  const [values, setValues] = useState<Partial<AssetCompliance>>(DEFAULTS);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    vehicleApi.list({ page: 1, pageSize: 200 }).then((r) => setVehicles(r.items));
    trailerApi.list({ page: 1, pageSize: 200 }).then((r) => setTrailers(r.items));
    complianceTypeApi.list({ page: 1, pageSize: 200 }).then((r) => setComplianceTypes(r.items));
  }, []);

  useEffect(() => {
    if (isNew || !id) { setValues(DEFAULTS); return; }
    setLoading(true);
    complianceApi.get(id)
      .then(setValues)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  function validate(next: Partial<AssetCompliance>): Record<string, string> {
    const fieldErrors: Record<string, string> = {};
    if (next.valid_from && next.valid_upto && next.valid_upto < next.valid_from) {
      fieldErrors.valid_upto = 'Expiry date cannot be earlier than issue date';
    }
    if (!next.asset_id) fieldErrors.asset_id = 'Asset is required';
    return fieldErrors;
  }

  function handleChange(name: keyof AssetCompliance & string, value: unknown) {
    setValues((prev) => {
      const next = { ...prev, [name]: value } as Partial<AssetCompliance>;
      if (name === 'asset_type') next.asset_id = undefined;
      setErrors(validate(next));
      return next;
    });
  }

  async function save(): Promise<boolean> {
    const validationErrors = validate(values);
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return false; }
    setSaving(true);
    setError(null);
    try {
      if (isNew) { await complianceApi.create(values); addToast('Record created successfully.', 'success'); }
      else if (id) { await complianceApi.update(id, values); addToast('Record updated successfully.', 'success'); }
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
    if (await save()) navigate('/compliance');
  }

  async function handleSaveAndAddAnother() {
    if (await save()) { setValues(DEFAULTS); setErrors({}); }
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); handleSubmit(); }
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n' && isNew) { e.preventDefault(); handleSaveAndAddAnother(); }
      else if (e.key === 'Escape') { navigate('/compliance'); }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values, isNew]);

  if (loading) return <div className="muted">Loading...</div>;

  return (
    <div style={{ maxWidth: 980 }}>
      <div className="page-header">
        <h1>Compliance Record</h1>
      </div>
      {error && <div className="badge danger" style={{ display: 'block', padding: '8px 12px', marginBottom: 16 }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <FormSection title="Asset Reference">
          <div className="field-row cols-3">
            <div className="field">
              <label>Asset Type<span className="req">*</span></label>
              <select className="select" value={values.asset_type ?? 'Vehicle'} onChange={(e) => handleChange('asset_type', e.target.value)}>
                <option value="Vehicle">Vehicle</option>
                <option value="Trailer">Trailer</option>
              </select>
            </div>
            <div className="field">
              <label>{values.asset_type === 'Trailer' ? 'Trailer Number' : 'Vehicle Registration Number'}<span className="req">*</span></label>
              <SearchableCombobox
                value={values.asset_id ?? ''}
                onChange={(v) => handleChange('asset_id', v)}
                required
                placeholder={values.asset_type === 'Trailer' ? 'Search trailer...' : 'Search vehicle...'}
                options={
                  values.asset_type === 'Trailer'
                    ? trailers.map((t) => ({ value: t.trailer_id, label: t.trailer_no }))
                    : vehicles.map((v) => ({ value: v.vehicle_id, label: v.registration_no }))
                }
              />
              {errors.asset_id && <p style={{ fontSize: 11.5, color: 'var(--danger)', margin: '2px 0 0' }}>{errors.asset_id}</p>}
            </div>
          </div>
        </FormSection>
        <FormSection title="Compliance Details">
          <FormGrid
            fields={DETAIL_FIELDS}
            values={values}
            onChange={handleChange}
            errors={errors}
            cols={3}
            renderers={{
              compliance_type_code: (value, onChange) => (
                <SearchableCombobox
                  value={(value as string) ?? ''}
                  onChange={onChange}
                  required
                  options={complianceTypes.map((c) => ({ value: c.compliance_type_code, label: c.compliance_name ?? c.compliance_type_code }))}
                  placeholder="Search compliance type..."
                />
              ),
            }}
          />
        </FormSection>
        <FormSection title="Status">
          <FormGrid fields={STATUS_FIELDS} values={values} onChange={handleChange} errors={errors} cols={3} />
          {values.valid_upto && (
            <div style={{ marginTop: 12 }}>
              <ExpiryStatusBadge expiryDate={values.valid_upto} />
            </div>
          )}
        </FormSection>
        <ActionFooter
          saving={saving}
          onCancel={() => navigate('/compliance')}
          onSaveAndAddAnother={isNew ? handleSaveAndAddAnother : undefined}
        />
      </form>
    </div>
  );
}
