import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FormGrid, FormActions, type FieldDef } from '../../components/Form';
import { FormSection } from '../../components/common/FormSection';
import { ApiError } from '../../api/client';
import { useToast } from '../../components/Toast';

export interface FormSectionDef<T> {
  title: string;
  subtitle?: string;
  fields: FieldDef<T>[];
}

interface CrudFormPageProps<T> {
  title: string;
  basePath: string;
  fields: FieldDef<T>[];
  /** Group fields into titled sections instead of one flat grid. Falls back to a single grid when omitted. */
  sections?: FormSectionDef<T>[];
  /** Override the default control for specific fields, e.g. a SearchableCombobox instead of a plain <select>. */
  renderers?: Partial<Record<keyof T & string, (value: unknown, onChange: (v: unknown) => void) => ReactNode>>;
  get: (id: string) => Promise<T>;
  create: (payload: Partial<T>) => Promise<T>;
  update: (id: string, payload: Partial<T>) => Promise<T>;
  defaults?: Partial<T>;
  /** id param name in the route, defaults to "id" */
  idParam?: string;
  validate?: (values: Partial<T>) => Record<string, string>;
  /** Show "Save & Add Another" on the Create screen (hidden automatically when editing). */
  allowSaveAndAddAnother?: boolean;
}

export function CrudFormPage<T>({
  title, basePath, fields, sections, renderers, get, create, update, defaults = {}, idParam = 'id', validate, allowSaveAndAddAnother = true,
}: CrudFormPageProps<T>) {
  const params = useParams();
  const id = params[idParam];
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [values, setValues] = useState<Partial<T>>(defaults);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const getRef = useRef(get);
  const defaultsRef = useRef(defaults);

  useEffect(() => {
    getRef.current = get;
    defaultsRef.current = defaults;
  }, [get, defaults]);

  useEffect(() => {
    if (isNew || !id) {
      setValues(defaultsRef.current);
      return;
    }
    setLoading(true);
    getRef.current(id)
      .then(setValues)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  function handleChange(name: keyof T & string, value: unknown) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSubmit();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n' && isNew && allowSaveAndAddAnother) {
        e.preventDefault();
        handleSaveAndAddAnother();
      } else if (e.key === 'Escape') {
        navigate(basePath);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values, isNew, allowSaveAndAddAnother]);

  async function save(): Promise<boolean> {
    if (validate) {
      const validationErrors = validate(values);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return false;
      }
    }
    setErrors({});
    setSaving(true);
    setError(null);
    try {
      if (isNew) {
        await create(values);
        addToast('Record created successfully.', 'success');
      } else if (id) {
        await update(id, values);
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
    if (await save()) navigate(basePath);
  }

  async function handleSaveAndAddAnother() {
    if (await save()) {
      setValues(defaultsRef.current);
      setErrors({});
    }
  }

  if (loading) return <div className="muted">Loading...</div>;

  return (
    <div style={{ maxWidth: sections ? 980 : 760 }}>
      <div className="page-header">
        <h1>{title}</h1>
      </div>
      {error && <div className="badge danger" style={{ display: 'block', padding: '8px 12px', marginBottom: 16 }}>{error}</div>}
      {sections ? (
        <form onSubmit={handleSubmit}>
          {sections.map((s) => (
            <FormSection key={s.title} title={s.title} subtitle={s.subtitle}>
              <FormGrid fields={s.fields} values={values} onChange={handleChange} errors={errors} renderers={renderers} cols={3} />
            </FormSection>
          ))}
          <FormActions>
            <button type="submit" disabled={saving} className="btn primary">
              {saving ? 'Saving...' : 'Save'}
            </button>
            {isNew && allowSaveAndAddAnother && (
              <button type="button" disabled={saving} onClick={handleSaveAndAddAnother} className="btn">
                Save & Add Another
              </button>
            )}
            <button type="button" onClick={() => navigate(basePath)} className="btn">
              Cancel
            </button>
          </FormActions>
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="card" style={{ padding: 20 }}>
          <FormGrid fields={fields} values={values} onChange={handleChange} errors={errors} renderers={renderers} />
          <FormActions>
            <button type="submit" disabled={saving} className="btn primary">
              {saving ? 'Saving...' : 'Save'}
            </button>
            {isNew && allowSaveAndAddAnother && (
              <button type="button" disabled={saving} onClick={handleSaveAndAddAnother} className="btn">
                Save & Add Another
              </button>
            )}
            <button type="button" onClick={() => navigate(basePath)} className="btn">
              Cancel
            </button>
          </FormActions>
        </form>
      )}
    </div>
  );
}
