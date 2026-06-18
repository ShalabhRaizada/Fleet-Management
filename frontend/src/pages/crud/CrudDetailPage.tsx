import { useEffect, useState, type ReactNode } from 'react';
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

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    get(id)
      .then(setRow)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <div className="muted">Loading...</div>;
  if (error) return <div className="badge danger" style={{ display: 'block', padding: '8px 12px' }}>{error}</div>;
  if (!row) return null;

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
            <div style={{ fontSize: 13 }}>{String((row as Record<string, unknown>)[f.key] ?? '-')}</div>
          </div>
        ))}
      </div>
      {extra?.(row)}
    </div>
  );
}
