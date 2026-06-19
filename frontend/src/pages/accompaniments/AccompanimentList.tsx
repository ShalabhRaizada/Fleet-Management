import { Link } from 'react-router-dom';
import { accompanimentApi, vendorApi, branchApi } from '../../api/resources';
import { CrudListPage } from '../crud/CrudListPage';
import type { Accompaniment, Vendor, Branch } from '../../types/entities';
import { ImportCsvButton } from '../../components/common/ImportCsvButton';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ApiError } from '../../api/client';

type AccompanimentImportRow = Partial<Accompaniment> & Record<string, unknown>;

const TEMPLATE_HEADERS = [
  'Accompaniment_Code', 'Accompaniment_Type', 'Item_ID', 'Size_Or_Spec', 'Is_Reusable',
  'Vendor_Name', 'Branch_Name', 'Current_Status',
];

function parseRow(record: Record<string, string>): AccompanimentImportRow {
  return {
    accompaniment_code: record.Accompaniment_Code?.trim(),
    accompaniment_type: record.Accompaniment_Type?.trim(),
    item_id: record.Item_ID?.trim() || undefined,
    size_or_spec: record.Size_Or_Spec?.trim() || undefined,
    is_reusable: record.Is_Reusable?.trim().toLowerCase() !== 'false',
    vendor_name: record.Vendor_Name?.trim() || undefined,
    branch_name: record.Branch_Name?.trim() || undefined,
    current_status: record.Current_Status?.trim() || 'InStock',
  };
}

function validateRow(row: AccompanimentImportRow, allRows: AccompanimentImportRow[], rowIndex: number) {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!row.accompaniment_code) errors.push('Accompaniment Code is required');
  if (!row.accompaniment_type) errors.push('Accompaniment Type is required');
  const isDuplicate = allRows.some((r, i) => i !== rowIndex && r.accompaniment_code && r.accompaniment_code === row.accompaniment_code);
  if (isDuplicate) warnings.push('Duplicate accompaniment code within this file');
  return { errors, warnings, isDuplicate };
}

async function commitRows(rows: AccompanimentImportRow[]): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;
  let vendors: Vendor[] | null = null;
  let branches: Branch[] | null = null;
  for (const row of rows) {
    try {
      const payload: Partial<Accompaniment> = { ...row };
      const vendorName = (row as { vendor_name?: string }).vendor_name;
      const branchName = (row as { branch_name?: string }).branch_name;
      delete (payload as Record<string, unknown>).vendor_name;
      delete (payload as Record<string, unknown>).branch_name;
      if (vendorName) {
        if (!vendors) vendors = (await vendorApi.list({ page: 1, pageSize: 500 })).items;
        const match = vendors.find((v) => v.vendor_name === vendorName);
        if (match) payload.vendor_id = match.vendor_id;
      }
      if (branchName) {
        if (!branches) branches = (await branchApi.list({ page: 1, pageSize: 500 })).items;
        const match = branches.find((b) => b.branch_name === branchName);
        if (match) payload.current_branch_id = match.branch_id;
      }
      await accompanimentApi.create(payload);
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

export default function AccompanimentList() {
  return (
    <CrudListPage<Accompaniment>
      title="Accompaniments"
      basePath="/accompaniments"
      rowKey={(r) => r.accompaniment_id}
      list={accompanimentApi.list}
      remove={accompanimentApi.remove}
      headerActions={(reload) => (
        <ImportCsvButton<AccompanimentImportRow>
          title="Accompaniments"
          templateHeaders={TEMPLATE_HEADERS}
          sampleRow={{
            Accompaniment_Code: 'ACM-001', Accompaniment_Type: 'Tarpaulin', Item_ID: '', Size_Or_Spec: '20ft',
            Is_Reusable: 'true', Vendor_Name: 'TrackTech Pvt Ltd', Branch_Name: 'BLR Central', Current_Status: 'InStock',
          }}
          columns={[
            { key: 'accompaniment_code', label: 'Code' },
            { key: 'accompaniment_type', label: 'Type' },
            { key: 'current_status', label: 'Status' },
          ]}
          parseRow={parseRow}
          validateRow={validateRow}
          onCommit={commitRows}
          onDone={reload}
        />
      )}
      columns={[
        { key: 'accompaniment_code', header: 'Code', sortable: true },
        { key: 'accompaniment_type', header: 'Type' },
        { key: 'size_or_spec', header: 'Size/Spec' },
        { key: 'current_status', header: 'Current Status', sortable: true, render: (r) => <StatusBadge status={r.current_status} /> },
      ]}
      extraActions={(row) => (
        <Link to={`/accompaniments/${row.accompaniment_id}/issue`} className="link">Issue</Link>
      )}
    />
  );
}
