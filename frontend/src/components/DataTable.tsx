import { useEffect, useMemo, useState } from 'react';

export interface ColumnDef<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onSort?: (key: string, dir: 'ASC' | 'DESC') => void;
  sortBy?: string;
  sortDir?: 'ASC' | 'DESC';
  onSearch?: (q: string) => void;
  searchValue?: string;
  exportFilename?: string;
  loading?: boolean;
  actions?: (row: T) => React.ReactNode;
}

function toCsv<T>(rows: T[], columns: ColumnDef<T>[]): string {
  const headers = columns.map((c) => c.header);
  const lines = [headers.join(',')];
  for (const row of rows) {
    const cells = columns.map((c) => {
      const raw = (row as Record<string, unknown>)[c.key];
      const val = raw === null || raw === undefined ? '' : String(raw);
      return `"${val.replace(/"/g, '""')}"`;
    });
    lines.push(cells.join(','));
  }
  return lines.join('\n');
}

export function DataTable<T>({
  columns, rows, rowKey, page, pageSize, total, onPageChange, onSort, sortBy, sortDir,
  onSearch, searchValue, exportFilename = 'export', loading, actions,
}: DataTableProps<T>) {
  const [localSearch, setLocalSearch] = useState(searchValue || '');
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const handleExport = () => {
    const csv = toCsv(rows, columns);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${exportFilename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        {onSearch && (
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              onSearch(localSearch);
            }}
          >
            <input
              className="border border-gray-300 rounded px-3 py-1.5 text-sm w-64"
              placeholder="Search..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
            />
            <button type="submit" className="bg-gray-100 hover:bg-gray-200 text-sm px-3 py-1.5 rounded border border-gray-300">
              Search
            </button>
          </form>
        )}
        <button
          onClick={handleExport}
          className="ml-auto bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-3 py-1.5 rounded"
        >
          Export CSV
        </button>
      </div>

      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`text-left px-3 py-2 font-medium whitespace-nowrap ${col.sortable ? 'cursor-pointer hover:text-blue-600' : ''}`}
                  onClick={() => {
                    if (!col.sortable || !onSort) return;
                    const nextDir = sortBy === col.key && sortDir === 'ASC' ? 'DESC' : 'ASC';
                    onSort(col.key, nextDir);
                  }}
                >
                  {col.header}
                  {sortBy === col.key ? (sortDir === 'ASC' ? ' ▲' : ' ▼') : ''}
                </th>
              ))}
              {actions && <th className="px-3 py-2" />}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td className="px-3 py-4 text-gray-500" colSpan={columns.length + (actions ? 1 : 0)}>
                  Loading...
                </td>
              </tr>
            )}
            {!loading && rows.length === 0 && (
              <tr>
                <td className="px-3 py-4 text-gray-500" colSpan={columns.length + (actions ? 1 : 0)}>
                  No records found.
                </td>
              </tr>
            )}
            {!loading &&
              rows.map((row) => (
                <tr key={rowKey(row)} className="border-t border-gray-100 hover:bg-gray-50">
                  {columns.map((col) => (
                    <td key={col.key} className="px-3 py-2 whitespace-nowrap">
                      {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? '')}
                    </td>
                  ))}
                  {actions && <td className="px-3 py-2 whitespace-nowrap">{actions(row)}</td>}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          Page {page} of {totalPages} ({total} total)
        </span>
        <div className="flex gap-2">
          <button
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="px-2 py-1 border rounded disabled:opacity-40"
          >
            Prev
          </button>
          <button
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="px-2 py-1 border rounded disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export function usePagedList<T>(
  fetcher: (params: { page: number; pageSize: number; q?: string; sortBy?: string; sortDir?: 'ASC' | 'DESC' }) => Promise<{
    items: T[];
    page: number;
    pageSize: number;
    total: number;
  }>
) {
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState('');
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortDir, setSortDir] = useState<'ASC' | 'DESC' | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useMemo(
    () => async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetcher({ page, pageSize, q: q || undefined, sortBy, sortDir });
        setItems(res.items);
        setTotal(res.total);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [page, pageSize, q, sortBy, sortDir]
  );

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reload]);

  return {
    items, page, pageSize, total, q, sortBy, sortDir, loading, error,
    setPage, setQ: (val: string) => { setQ(val); setPage(1); },
    setSort: (key: string, dir: 'ASC' | 'DESC') => { setSortBy(key); setSortDir(dir); },
    reload,
  };
}
