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

  if (loading) return <div className="text-gray-500 text-sm">Loading...</div>;
  if (error) return <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded">{error}</div>;
  if (!row) return null;

  return (
    <div className="max-w-3xl flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">{title}</h1>
        <div className="flex gap-2">
          <button onClick={() => navigate(`${basePath}/${id}/edit`)} className="text-sm px-3 py-1.5 bg-amber-100 hover:bg-amber-200 rounded">
            Edit
          </button>
          <button onClick={() => navigate(basePath)} className="text-sm px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded border border-gray-300">
            Back to list
          </button>
        </div>
      </div>
      <div className="bg-white border border-gray-200 rounded-lg p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {fieldsToShow.map((f) => (
          <div key={f.key}>
            <div className="text-xs uppercase text-gray-400">{f.label}</div>
            <div className="text-sm text-gray-800 mt-0.5">{String((row as Record<string, unknown>)[f.key] ?? '-')}</div>
          </div>
        ))}
      </div>
      {extra?.(row)}
    </div>
  );
}
