import { useState } from 'react';
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
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function handleDelete(row: T) {
    if (!remove) return;
    setConfirmDelete(rowKey(row));
  }

  async function confirmDeleteNow() {
    if (!remove || !confirmDelete) return;
    try {
      await remove(confirmDelete);
      setConfirmDelete(null);
      setDeleteError(null);
      reload();
    } catch (err) {
      setDeleteError(err instanceof ApiError ? err.message : 'Delete failed');
    }
  }

  function cancelDelete() {
    setConfirmDelete(null);
    setDeleteError(null);
  }

  return (
    <div className="col gap-16">
      <div className="page-header">
        <h1>{title}</h1>
        {canCreate && (
          <button onClick={() => navigate(`${basePath}/new`)} className="btn primary">
            + Add New
          </button>
        )}
      </div>
      {error && <div className="badge danger" style={{ display: 'block', padding: '8px 12px' }}>{error}</div>}
      {confirmDelete && (
        <div className="badge danger" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px' }}>
          <span>Confirm delete?</span>
          <button onClick={confirmDeleteNow} className="btn primary">
            Yes, delete
          </button>
          <button onClick={cancelDelete} className="btn">
            Cancel
          </button>
        </div>
      )}
      {deleteError && <div className="badge danger" style={{ display: 'block', padding: '8px 12px' }}>{deleteError}</div>}
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
          <div className="row">
            <span className="link" onClick={() => navigate(`${basePath}/${rowKey(row)}`)}>
              View
            </span>
            <span className="link" onClick={() => navigate(`${basePath}/${rowKey(row)}/edit`)}>
              Edit
            </span>
            {remove && (
              <span className="link" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(row)}>
                Delete
              </span>
            )}
            {extraActions?.(row)}
          </div>
        )}
      />
    </div>
  );
}
