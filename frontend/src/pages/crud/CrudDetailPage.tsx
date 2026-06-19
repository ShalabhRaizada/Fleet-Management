import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ApiError } from '../../api/client';

interface CrudDetailPageProps<T> {
  title: string;
  basePath: string;
  get: (id: string) => Promise<T>;
  fieldsToShow: { key: keyof T & string; label: string }[];
  extra?: (row: T) => ReactNode;
}

export function CrudDetailPage<T>({ title, basePath, get, fieldsToShow, extra }: CrudDetailPageProps<T>) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [row, setRow] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const getRef = useRef(get);

  useEffect(() => {
    getRef.current = get;
  }, [get]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getRef.current(id)
      .then(setRow)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="muted">Loading...</div>;
  if (error) return <div className="badge danger" style={{ display: 'block', padding: '8px 12px' }}>{error}</div>;
  if (!row) return null;

  function formatValue(key: string, value: unknown): string {
    if (value === null || value === undefined) return '—';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (key.endsWith('_at') || key.endsWith('_datetime') || key === 'valid_upto') {
      try {
        const d = new Date(value as string | number | Date);
        if (!isNaN(d.getTime())) return d.toLocaleString();
      } catch {
        // fall through to default formatting
      }
      return String(value);
    }
    if (key.endsWith('_date') || key === 'valid_upto') {
      try {
        const d = new Date(value as string | number | Date);
        if (!isNaN(d.getTime())) return d.toLocaleDateString();
      } catch {
        // fall through to default formatting
      }
      return String(value);
    }
    return String(value);
  }

  return (
    <div className="col gap-16" style={{ maxWidth: 760 }}>
      <div className="page-header">
        <h1>{title}</h1>
        <div className="row">
          <button onClick={() => navigate(`${basePath}/${id}/edit`)} className="btn">
            Edit
          </button>
          <button onClick={() => navigate(basePath)} className="btn ghost">
            Back to list
          </button>
        </div>
      </div>
      <div className="card field-row cols-2" style={{ padding: 20 }}>
        {fieldsToShow.map((f) => (
          <div key={f.key} className="field">
            <label>{f.label}</label>
            <div style={{ fontSize: 13 }}>{formatValue(f.key, (row as Record<string, unknown>)[f.key])}</div>
          </div>
        ))}
      </div>
      {extra?.(row)}
    </div>
  );
}
