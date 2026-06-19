import { useState } from 'react';
import { BulkUploadModal } from './BulkUploadModal';

interface ImportCsvButtonProps<T extends Record<string, unknown>> {
  title: string;
  templateHeaders: string[];
  sampleRow?: Record<string, string>;
  columns: { key: keyof T & string; label: string }[];
  parseRow: (record: Record<string, string>) => T;
  validateRow: (row: T, allRows: T[], rowIndex: number) => { errors: string[]; warnings: string[]; isDuplicate: boolean };
  onCommit: (validRows: T[]) => Promise<{ success: number; failed: number }>;
  mode?: 'import' | 'update';
  /** Called after the modal closes so the caller can refresh its list. */
  onDone?: () => void;
}

export function ImportCsvButton<T extends Record<string, unknown>>(props: ImportCsvButtonProps<T>) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className="btn" onClick={() => setOpen(true)}>
        Import CSV / Excel
      </button>
      {open && (
        <BulkUploadModal
          {...props}
          onClose={() => { setOpen(false); props.onDone?.(); }}
        />
      )}
    </>
  );
}
