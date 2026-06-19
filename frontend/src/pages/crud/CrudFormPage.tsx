import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FormGrid, FormActions, type FieldDef } from '../../components/Form';
import { ApiError } from '../../api/client';
import { useToast } from '../../components/Toast';

interface CrudFormPageProps<T> {
  title: string;
  basePath: string;
  fields: FieldDef<T>[];
  get: (id: string) => Promise<T>;
  create: (payload: Partial<T>) => Promise<T>;
  update: (id: string, payload: Partial<T>) => Promise<T>;
  defaults?: Partial<T>;
  /** id param name in the route, defaults to "id" */
  idParam?: string;
  validate?: (values: Partial<T>) => Record<string, string>;
}

export function CrudFormPage<T>({ title, basePath, fields, get, create, update, defaults = {}, idParam = 'id', validate }: CrudFormPageProps<T>) {
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

  useEffect(() => {
    if (isNew || !id) {
      setValues(defaults);
      return;
    }
    setLoading(true);
    get(id)
      .then(setValues)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load'))
      .finally(() => setLoading(false));
    // defaults/get intentionally omitted: defaults is a fresh object/reference per render
    // and get is treated as a stable callback supplied by the caller for the lifetime of the route.
  }, [id, isNew]);

  function handleChange(name: keyof T & string, value: unknown) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validate) {
      const validationErrors = validate(values);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
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
      navigate(basePath);
    } catch (err) {
      const message = err instanceof ApiError ? `${err.message}${err.errors ? ' - ' + JSON.stringify(err.errors) : ''}` : 'Save failed';
      setError(message);
      addToast(message, 'error');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="muted">Loading...</div>;

  return (
    <div style={{ maxWidth: 760 }}>
      <div className="page-header">
        <h1>{title}</h1>
      </div>
      {error && <div className="badge danger" style={{ display: 'block', padding: '8px 12px', marginBottom: 16 }}>{error}</div>}
      <form onSubmit={handleSubmit} className="card" style={{ padding: 20 }}>
        <FormGrid fields={fields} values={values} onChange={handleChange} errors={errors} />
        <FormActions>
          <button type="submit" disabled={saving} className="btn primary">
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button type="button" onClick={() => navigate(basePath)} className="btn">
            Cancel
          </button>
        </FormActions>
      </form>
    </div>
  );
}
