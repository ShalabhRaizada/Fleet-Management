import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FormGrid, FormActions, type FieldDef } from '../../components/Form';
import { ApiError } from '../../api/client';

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
}

export function CrudFormPage<T>({ title, basePath, fields, get, create, update, defaults = {}, idParam = 'id' }: CrudFormPageProps<T>) {
  const params = useParams();
  const id = params[idParam];
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const [values, setValues] = useState<Partial<T>>(defaults);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isNew || !id) return;
    setLoading(true);
    get(id)
      .then(setValues)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [id, isNew]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleChange(name: keyof T & string, value: unknown) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (isNew) {
        await create(values);
      } else if (id) {
        await update(id, values);
      }
      navigate(basePath);
    } catch (err) {
      setError(err instanceof ApiError ? `${err.message}${err.errors ? ' - ' + JSON.stringify(err.errors) : ''}` : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="text-gray-500 text-sm">Loading...</div>;

  return (
    <div className="max-w-3xl">
      <h1 className="text-lg font-semibold mb-4">{title}</h1>
      {error && <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6">
        <FormGrid fields={fields} values={values} onChange={handleChange} />
        <FormActions>
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm px-4 py-2 rounded"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button
            type="button"
            onClick={() => navigate(basePath)}
            className="bg-gray-100 hover:bg-gray-200 text-sm px-4 py-2 rounded border border-gray-300"
          >
            Cancel
          </button>
        </FormActions>
      </form>
    </div>
  );
}
