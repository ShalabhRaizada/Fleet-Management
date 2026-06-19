import { useRef, useState } from 'react';
import { parseCsvToRecords, downloadCsvTemplate } from './csv';
import { BulkReviewTable, type BulkRowResult } from './BulkReviewTable';
import { useToast } from '../Toast';

interface BulkUploadModalProps<T extends Record<string, unknown>> {
  title: string;
  templateHeaders: string[];
  sampleRow?: Record<string, string>;
  columns: { key: keyof T & string; label: string }[];
  /** Maps a raw CSV record into the typed row shape. */
  parseRow: (record: Record<string, string>) => T;
  /** Validates one row against the rest of the batch; return field errors/warnings and whether it matches an existing record. */
  validateRow: (row: T, allRows: T[], rowIndex: number) => { errors: string[]; warnings: string[]; isDuplicate: boolean };
  /** Commits only the rows that passed validation. */
  onCommit: (validRows: T[]) => Promise<{ success: number; failed: number }>;
  onClose: () => void;
  /** "import" creates new records; "update" matches and updates existing ones by a business key. */
  mode?: 'import' | 'update';
}

export function BulkUploadModal<T extends Record<string, unknown>>({
  title, templateHeaders, sampleRow, columns, parseRow, validateRow, onCommit, onClose, mode = 'import',
}: BulkUploadModalProps<T>) {
  const { addToast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<BulkRowResult<T>[]>([]);
  const [committing, setCommitting] = useState(false);
  const [summary, setSummary] = useState<{ success: number; failed: number } | null>(null);

  function handleFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const { rows: records } = parseCsvToRecords(String(reader.result));
      const parsed = records.map((r) => parseRow(r));
      const results: BulkRowResult<T>[] = parsed.map((data, idx) => {
        const { errors, warnings, isDuplicate } = validateRow(data, parsed, idx);
        return { rowNumber: idx + 1, data, errors, warnings, isDuplicate };
      });
      setRows(results);
      setSummary(null);
    };
    reader.readAsText(file);
  }

  async function handleConfirm() {
    const validRows = rows.filter((r) => r.errors.length === 0).map((r) => r.data);
    if (validRows.length === 0) {
      addToast('No valid rows to commit.', 'error');
      return;
    }
    setCommitting(true);
    try {
      const result = await onCommit(validRows);
      setSummary(result);
      addToast(`Committed ${result.success} row(s), ${result.failed} failed.`, result.failed > 0 ? 'info' : 'success');
    } catch {
      addToast('Bulk commit failed.', 'error');
    } finally {
      setCommitting(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}
      onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}
    >
      <div className="card" style={{ width: 'min(900px, 92vw)', maxHeight: '88vh', overflow: 'auto', padding: 0 }}>
        <div className="card-h">
          <h3>{title} — {mode === 'import' ? 'Bulk Import' : 'Bulk Update'}</h3>
          <button type="button" className="btn sm" onClick={onClose}>Close</button>
        </div>
        <div className="card-b col gap-16">
          <div className="row gap-8">
            <button type="button" className="btn" onClick={() => downloadCsvTemplate(`${title.toLowerCase().replace(/\s+/g, '_')}_template.csv`, templateHeaders, sampleRow)}>
              Download Template
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
          </div>

          {rows.length > 0 && <BulkReviewTable rows={rows} columns={columns} />}

          {summary && (
            <div className="badge success" style={{ display: 'block', padding: '8px 12px' }}>
              Upload complete: {summary.success} succeeded, {summary.failed} failed.
            </div>
          )}

          {rows.length > 0 && !summary && (
            <div className="row gap-8">
              <button type="button" className="btn primary" disabled={committing} onClick={handleConfirm}>
                {committing ? 'Committing...' : `Confirm Upload (${rows.filter((r) => r.errors.length === 0).length} valid rows)`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
