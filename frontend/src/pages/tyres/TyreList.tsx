import { tyreApi, vendorApi } from '../../api/resources';
import { CrudListPage } from '../crud/CrudListPage';
import type { Tyre, Vendor } from '../../types/entities';
import { ImportCsvButton } from '../../components/common/ImportCsvButton';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ApiError } from '../../api/client';

type TyreImportRow = Partial<Tyre> & Record<string, unknown>;

const TEMPLATE_HEADERS = [
  'Serial_No', 'Brand', 'Model', 'Size', 'Ply_Rating', 'Purchase_Date',
  'Vendor_Code', 'Purchase_Cost', 'Warranty_Upto', 'Status', 'Total_Run_KM',
];

function parseRow(record: Record<string, string>): TyreImportRow {
  return {
    tyre_serial_no: record.Serial_No?.trim(),
    brand: record.Brand?.trim() || undefined,
    model: record.Model?.trim() || undefined,
    size: record.Size?.trim(),
    ply_rating: record.Ply_Rating?.trim() || undefined,
    purchase_date: record.Purchase_Date?.trim() || undefined,
    vendor_code: record.Vendor_Code?.trim() || undefined,
    purchase_cost: record.Purchase_Cost ? Number(record.Purchase_Cost) : undefined,
    warranty_upto: record.Warranty_Upto?.trim() || undefined,
    status: record.Status?.trim() || 'New',
    total_run_km: record.Total_Run_KM ? Number(record.Total_Run_KM) : undefined,
  };
}

function validateRow(row: TyreImportRow, allRows: TyreImportRow[], rowIndex: number) {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!row.tyre_serial_no) errors.push('Serial No is required');
  if (!row.size) errors.push('Size is required');
  if (row.purchase_cost != null && row.purchase_cost < 0) errors.push('Purchase cost cannot be negative');
  if (row.purchase_date && row.warranty_upto && row.warranty_upto < row.purchase_date) {
    errors.push('Warranty date cannot be before purchase date');
  }
  const isDuplicate = allRows.some((r, i) => i !== rowIndex && r.tyre_serial_no && r.tyre_serial_no === row.tyre_serial_no);
  if (isDuplicate) warnings.push('Duplicate serial number within this file');
  return { errors, warnings, isDuplicate };
}

async function commitRows(rows: TyreImportRow[]): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;
  let vendors: Vendor[] | null = null;
  for (const row of rows) {
    try {
      const payload: Partial<Tyre> = { ...row };
      const vendorCode = (row as { vendor_code?: string }).vendor_code;
      delete (payload as Record<string, unknown>).vendor_code;
      if (vendorCode) {
        if (!vendors) vendors = (await vendorApi.list({ page: 1, pageSize: 500 })).items;
        const match = vendors.find((v) => v.vendor_code === vendorCode);
        if (match) payload.vendor_id = match.vendor_id;
      }
      await tyreApi.create(payload);
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

export default function TyreList() {
  return (
    <CrudListPage<Tyre>
      title="Tyres"
      basePath="/tyres"
      rowKey={(r) => r.tyre_id}
      list={tyreApi.list}
      remove={tyreApi.remove}
      headerActions={(reload) => (
        <ImportCsvButton<TyreImportRow>
          title="Tyres"
          templateHeaders={TEMPLATE_HEADERS}
          sampleRow={{
            Serial_No: 'TY-00123', Brand: 'MRF', Model: 'Steel Grip', Size: '295/80R22.5', Ply_Rating: '18',
            Purchase_Date: '2024-01-15', Vendor_Code: 'VEN001', Purchase_Cost: '18500', Warranty_Upto: '2027-01-15',
            Status: 'InStock', Total_Run_KM: '0',
          }}
          columns={[
            { key: 'tyre_serial_no', label: 'Serial No' },
            { key: 'brand', label: 'Brand' },
            { key: 'size', label: 'Size' },
            { key: 'status', label: 'Status' },
          ]}
          parseRow={parseRow}
          validateRow={validateRow}
          onCommit={commitRows}
          onDone={reload}
        />
      )}
      columns={[
        { key: 'tyre_serial_no', header: 'Serial No', sortable: true },
        { key: 'brand', header: 'Brand' },
        { key: 'model', header: 'Model' },
        { key: 'size', header: 'Size' },
        { key: 'current_position', header: 'Position' },
        { key: 'status', header: 'Status', sortable: true, render: (r) => <StatusBadge status={r.status} /> },
      ]}
    />
  );
}
