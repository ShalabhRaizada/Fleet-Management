import { trailerApi } from '../../api/resources';
import { CrudListPage } from '../crud/CrudListPage';
import type { Trailer } from '../../types/entities';
import { ImportCsvButton } from '../../components/common/ImportCsvButton';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ApiError } from '../../api/client';

type TrailerImportRow = Partial<Trailer> & Record<string, unknown>;

const TEMPLATE_HEADERS = [
  'Trailer_No', 'Trailer_Type', 'Status', 'Body_Type', 'Chassis_No',
  'Axle_Count', 'Payload_KG', 'Volume_CBM', 'Length_FT',
];

function parseRow(record: Record<string, string>): TrailerImportRow {
  return {
    trailer_no: record.Trailer_No?.trim(),
    trailer_type: record.Trailer_Type?.trim(),
    status: record.Status?.trim() || 'Available',
    body_type: record.Body_Type?.trim() || undefined,
    chassis_no: record.Chassis_No?.trim() || undefined,
    axle_count: record.Axle_Count ? Number(record.Axle_Count) : undefined,
    payload_capacity_kg: record.Payload_KG ? Number(record.Payload_KG) : undefined,
    volume_cbm: record.Volume_CBM ? Number(record.Volume_CBM) : undefined,
    length_ft: record.Length_FT ? Number(record.Length_FT) : undefined,
  };
}

function validateRow(row: TrailerImportRow, allRows: TrailerImportRow[], rowIndex: number) {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!row.trailer_no) errors.push('Trailer No is required');
  if (!row.trailer_type) errors.push('Trailer Type is required');
  if (row.payload_capacity_kg != null && row.payload_capacity_kg < 0) errors.push('Payload cannot be negative');
  const isDuplicate = allRows.some((r, i) => i !== rowIndex && r.trailer_no && r.trailer_no === row.trailer_no);
  if (isDuplicate) warnings.push('Duplicate trailer number within this file');
  return { errors, warnings, isDuplicate };
}

async function commitRows(rows: TrailerImportRow[]): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;
  for (const row of rows) {
    try {
      await trailerApi.create(row);
      success += 1;
    } catch (err) {
      failed += 1;
      if (err instanceof ApiError) {
        // continue to next row; aggregate failure count only
      }
    }
  }
  return { success, failed };
}

export default function TrailerList() {
  return (
    <CrudListPage<Trailer>
      title="Trailers"
      basePath="/trailers"
      rowKey={(r) => r.trailer_id}
      list={trailerApi.list}
      remove={trailerApi.remove}
      headerActions={(reload) => (
        <ImportCsvButton<TrailerImportRow>
          title="Trailers"
          templateHeaders={TEMPLATE_HEADERS}
          sampleRow={{
            Trailer_No: 'TR-001', Trailer_Type: 'Flatbed', Status: 'Available', Body_Type: 'Open',
            Chassis_No: '', Axle_Count: '3', Payload_KG: '25000', Volume_CBM: '60', Length_FT: '40',
          }}
          columns={[
            { key: 'trailer_no', label: 'Trailer No' },
            { key: 'trailer_type', label: 'Type' },
            { key: 'status', label: 'Status' },
          ]}
          parseRow={parseRow}
          validateRow={validateRow}
          onCommit={commitRows}
          onDone={reload}
        />
      )}
      columns={[
        { key: 'trailer_no', header: 'Trailer No', sortable: true },
        { key: 'trailer_type', header: 'Type' },
        { key: 'body_type', header: 'Body Type' },
        { key: 'axle_count', header: 'Axles' },
        { key: 'status', header: 'Status', sortable: true, render: (r) => <StatusBadge status={r.status} /> },
      ]}
    />
  );
}
