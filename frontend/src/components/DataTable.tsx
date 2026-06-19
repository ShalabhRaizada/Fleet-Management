import { useCallback, useEffect, useState } from 'react';

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

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}T/;

function toCsv<T>(rows: T[], columns: ColumnDef<T>[]): string {
  const headers = columns.map((c) => c.header);
  const lines = [headers.join(',')];
  for (const row of rows) {
    const cells = columns.map((c) => {
      const raw = (row as Record<string, unknown>)[c.key];
      let val = raw === null || raw === undefined ? '' : String(raw);
      if (typeof raw === 'string' && ISO_DATE_PATTERN.test(raw)) {
        const date = new Date(raw);
        if (!isNaN(date.getTime())) {
          val = date.toLocaleDateString();
        }
      }
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
    <div className="card">
      <div className="toolbar">
        {onSearch && (
          <form
            className="row grow"
            onSubmit={(e) => {
              e.preventDefault();
              onSearch(localSearch);
            }}
          >
            <input
              className="input"
              style={{ maxWidth: 280 }}
              placeholder="Search..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
            />
            <button type="submit" className="btn sm">
              Search
            </button>
          </form>
        )}
        <button onClick={handleExport} className="btn sm" style={{ marginLeft: 'auto' }}>
          Export CSV
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="tbl">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={col.sortable ? { cursor: 'pointer' } : undefined}
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
              {actions && <th />}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td className="muted" colSpan={columns.length + (actions ? 1 : 0)}>
                  Loading...
                </td>
              </tr>
            )}
            {!loading && rows.length === 0 && (
              <tr>
                <td className="muted" colSpan={columns.length + (actions ? 1 : 0)}>
                  No records found.
                </td>
              </tr>
            )}
            {!loading &&
              rows.map((row) => (
                <tr key={rowKey(row)}>
                  {columns.map((col) => (
                    <td key={col.key}>
                      {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? '')}
                    </td>
                  ))}
                  {actions && <td className="actions">{actions(row)}</td>}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="row" style={{ justifyContent: 'space-between', padding: '10px 14px' }}>
        <span className="muted" style={{ fontSize: 12.5 }}>
          Page {page} of {totalPages} ({total} total)
        </span>
        <div className="row">
          <button disabled={page <= 1} onClick={() => onPageChange(page - 1)} className="btn sm">
            Prev
          </button>
          <button disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} className="btn sm">
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

  const reload = useCallback(async (cancelled?: { current: boolean }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetcher({ page, pageSize, q: q || undefined, sortBy, sortDir });
      if (cancelled?.current) return;
      setItems(res.items);
      setTotal(res.total);
    } catch (err) {
      if (cancelled?.current) return;
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      if (!cancelled?.current) setLoading(false);
    }
  }, [fetcher, page, pageSize, q, sortBy, sortDir]);

  useEffect(() => {
    const cancelled = { current: false };
    reload(cancelled);
    return () => {
      cancelled.current = true;
    };
  }, [reload]);

  return {
    items, page, pageSize, total, q, sortBy, sortDir, loading, error,
    setPage, setQ: (val: string) => { setQ(val); setPage(1); },
    setSort: (key: string, dir: 'ASC' | 'DESC') => { setSortBy(key); setSortDir(dir); },
    reload,
  };
}
