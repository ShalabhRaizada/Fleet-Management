import { useState } from 'react';
import { downloadCsv, toCsv } from './csv';

export interface BulkRowResult<T> {
  rowNumber: number;
  data: T;
  errors: string[];
  warnings: string[];
  isDuplicate: boolean;
}

interface BulkReviewTableProps<T> {
  rows: BulkRowResult<T>[];
  columns: { key: keyof T & string; label: string }[];
}

export function BulkReviewTable<T extends Record<string, unknown>>({ rows, columns }: BulkReviewTableProps<T>) {
  const [errorsOnly, setErrorsOnly] = useState(false);
  const visible = errorsOnly ? rows.filter((r) => r.errors.length > 0) : rows;
  const errorCount = rows.filter((r) => r.errors.length > 0).length;

  function exportErrors() {
    const headers = ['Row', ...columns.map((c) => c.label), 'Errors', 'Warnings'];
    const csvRows = rows.filter((r) => r.errors.length > 0).map((r) => ({
      Row: r.rowNumber,
      ...columns.reduce((acc, c) => ({ ...acc, [c.label]: String(r.data[c.key] ?? '') }), {} as Record<string, string>),
      Errors: r.errors.join('; '),
      Warnings: r.warnings.join('; '),
    }));
    downloadCsv('validation_errors.csv', toCsv(headers, csvRows));
  }

  return (
    <div>
      <div className="row gap-8" style={{ marginBottom: 8, alignItems: 'center' }}>
        <span className="muted" style={{ fontSize: 12.5 }}>
          {rows.length} row{rows.length === 1 ? '' : 's'} — {errorCount} with errors, {rows.length - errorCount} valid
        </span>
        <label className="checkbox" style={{ marginLeft: 'auto' }}>
          <input type="checkbox" checked={errorsOnly} onChange={(e) => setErrorsOnly(e.target.checked)} />
          Show only error rows
        </label>
        {errorCount > 0 && (
          <button type="button" className="btn sm" onClick={exportErrors}>Export Errors</button>
        )}
      </div>
      <div style={{ maxHeight: 360, overflow: 'auto' }}>
        <table className="tbl">
          <thead>
            <tr>
              <th>Row</th>
              <th>Status</th>
              {columns.map((c) => <th key={c.key}>{c.label}</th>)}
              <th>Messages</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((r) => (
              <tr key={r.rowNumber} style={{ background: r.errors.length > 0 ? 'var(--danger-bg)' : undefined }}>
                <td>{r.rowNumber}</td>
                <td>
                  {r.errors.length > 0 ? (
                    <span className="badge danger">Invalid</span>
                  ) : r.isDuplicate ? (
                    <span className="badge warn">Duplicate</span>
                  ) : (
                    <span className="badge success">Valid</span>
                  )}
                </td>
                {columns.map((c) => <td key={c.key}>{String(r.data[c.key] ?? '')}</td>)}
                <td style={{ fontSize: 11.5 }}>
                  {r.errors.map((e, i) => <div key={i} style={{ color: 'var(--danger)' }}>{e}</div>)}
                  {r.warnings.map((w, i) => <div key={i} style={{ color: 'var(--warn)' }}>{w}</div>)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
