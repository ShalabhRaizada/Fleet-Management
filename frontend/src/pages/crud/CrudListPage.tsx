import { useNavigate } from 'react-router-dom';
import { DataTable, usePagedList, type ColumnDef } from '../../components/DataTable';
import { ApiError } from '../../api/client';

interface CrudListPageProps<T> {
  title: string;
  basePath: string;
  columns: ColumnDef<T>[];
  rowKey: (row: T) => string;
  list: (params: { page: number; pageSize: number; q?: string; sortBy?: string; sortDir?: 'ASC' | 'DESC' }) => Promise<{
    items: T[];
    page: number;
    pageSize: number;
    total: number;
  }>;
  remove?: (id: string) => Promise<unknown>;
  canCreate?: boolean;
  searchable?: boolean;
  extraActions?: (row: T) => React.ReactNode;
}

export function CrudListPage<T>({
  title, basePath, columns, rowKey, list, remove, canCreate = true, searchable = true, extraActions,
}: CrudListPageProps<T>) {
  const navigate = useNavigate();
  const { items, page, pageSize, total, loading, error, setPage, setQ, q, setSort, sortBy, sortDir, reload } =
    usePagedList<T>(list);

  async function handleDelete(row: T) {
    if (!remove) return;
    if (!confirm('Delete this record?')) return;
    try {
      await remove(rowKey(row));
      reload();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Delete failed');
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">{title}</h1>
        {canCreate && (
          <button
            onClick={() => navigate(`${basePath}/new`)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded"
          >
            + Add New
          </button>
        )}
      </div>
      {error && <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded">{error}</div>}
      <DataTable
        columns={columns}
        rows={items}
        rowKey={rowKey}
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={setPage}
        onSearch={searchable ? setQ : undefined}
        searchValue={q}
        onSort={setSort}
        sortBy={sortBy}
        sortDir={sortDir}
        loading={loading}
        exportFilename={basePath.replace('/', '')}
        actions={(row) => (
          <div className="flex gap-2">
            <button onClick={() => navigate(`${basePath}/${rowKey(row)}`)} className="text-blue-600 hover:underline">
              View
            </button>
            <button onClick={() => navigate(`${basePath}/${rowKey(row)}/edit`)} className="text-amber-600 hover:underline">
              Edit
            </button>
            {remove && (
              <button onClick={() => handleDelete(row)} className="text-red-600 hover:underline">
                Delete
              </button>
            )}
            {extraActions?.(row)}
          </div>
        )}
      />
    </div>
  );
}
