import { complianceApi, vehicleApi, trailerApi } from '../../api/resources';
import { CrudListPage } from '../crud/CrudListPage';
import type { AssetCompliance, Vehicle, Trailer } from '../../types/entities';
import { ImportCsvButton } from '../../components/common/ImportCsvButton';
import { ExpiryStatusBadge } from '../../components/common/StatusBadge';
import { ApiError } from '../../api/client';

type ComplianceImportRow = Partial<AssetCompliance> & Record<string, unknown>;

const TEMPLATE_HEADERS = [
  'Asset_Type', 'Vehicle_Reg_No', 'Trailer_No', 'Compliance_Type', 'Document_No',
  'Issuing_Authority', 'Issue_Date', 'Expiry_Date', 'Status', 'Remarks',
];

function parseRow(record: Record<string, string>): ComplianceImportRow {
  const assetType = (record.Asset_Type?.trim() || 'Vehicle') as 'Vehicle' | 'Trailer';
  return {
    asset_type: assetType,
    vehicle_reg_no: record.Vehicle_Reg_No?.trim() || undefined,
    trailer_no: record.Trailer_No?.trim() || undefined,
    compliance_type_code: record.Compliance_Type?.trim(),
    document_no: record.Document_No?.trim() || undefined,
    issued_by: record.Issuing_Authority?.trim() || undefined,
    valid_from: record.Issue_Date?.trim() || undefined,
    valid_upto: record.Expiry_Date?.trim(),
    status: record.Status?.trim() || 'Valid',
  };
}

function validateRow(row: ComplianceImportRow, allRows: ComplianceImportRow[], rowIndex: number) {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!row.compliance_type_code) errors.push('Compliance Type is required');
  if (!row.valid_upto) errors.push('Expiry Date is required');
  if (row.asset_type === 'Trailer' && !row.trailer_no) errors.push('Trailer No is required for Trailer asset type');
  if (row.asset_type !== 'Trailer' && !row.vehicle_reg_no) errors.push('Vehicle Reg No is required for Vehicle asset type');
  if (row.valid_from && row.valid_upto && row.valid_upto < row.valid_from) errors.push('Expiry date cannot be earlier than issue date');
  const isDuplicate = allRows.some((r, i) => i !== rowIndex
    && r.compliance_type_code === row.compliance_type_code
    && (r.vehicle_reg_no === row.vehicle_reg_no) && (r.trailer_no === row.trailer_no));
  if (isDuplicate) warnings.push('Duplicate compliance record for this asset within this file');
  return { errors, warnings, isDuplicate };
}

async function commitRows(rows: ComplianceImportRow[]): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;
  let vehicles: Vehicle[] | null = null;
  let trailers: Trailer[] | null = null;
  for (const row of rows) {
    try {
      const payload: Partial<AssetCompliance> = { ...row };
      const regNo = (row as { vehicle_reg_no?: string }).vehicle_reg_no;
      const trailerNo = (row as { trailer_no?: string }).trailer_no;
      delete (payload as Record<string, unknown>).vehicle_reg_no;
      delete (payload as Record<string, unknown>).trailer_no;
      if (payload.asset_type === 'Trailer' && trailerNo) {
        if (!trailers) trailers = (await trailerApi.list({ page: 1, pageSize: 500 })).items;
        const match = trailers.find((t) => t.trailer_no === trailerNo);
        if (match) payload.asset_id = match.trailer_id;
      } else if (regNo) {
        if (!vehicles) vehicles = (await vehicleApi.list({ page: 1, pageSize: 500 })).items;
        const match = vehicles.find((v) => v.registration_no === regNo);
        if (match) payload.asset_id = match.vehicle_id;
      }
      await complianceApi.create(payload);
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

export default function ComplianceList() {
  return (
    <CrudListPage<AssetCompliance>
      title="Compliance Register"
      basePath="/compliance"
      rowKey={(r) => r.asset_compliance_id}
      list={complianceApi.list}
      remove={complianceApi.remove}
      headerActions={(reload) => (
        <ImportCsvButton<ComplianceImportRow>
          title="Compliance"
          templateHeaders={TEMPLATE_HEADERS}
          sampleRow={{
            Asset_Type: 'Vehicle', Vehicle_Reg_No: 'MH12AB1234', Trailer_No: '', Compliance_Type: 'Insurance',
            Document_No: 'INS-2026-001', Issuing_Authority: 'ICICI Lombard', Issue_Date: '2026-01-01',
            Expiry_Date: '2027-01-01', Status: 'Valid', Remarks: '',
          }}
          columns={[
            { key: 'asset_type', label: 'Asset Type' },
            { key: 'compliance_type_code', label: 'Compliance Type' },
            { key: 'valid_upto', label: 'Expiry Date' },
            { key: 'status', label: 'Status' },
          ]}
          parseRow={parseRow}
          validateRow={validateRow}
          onCommit={commitRows}
          onDone={reload}
        />
      )}
      columns={[
        { key: 'asset_type', header: 'Asset Type' },
        { key: 'compliance_type_code', header: 'Compliance Type' },
        { key: 'document_no', header: 'Document No' },
        { key: 'valid_upto', header: 'Valid Upto', render: (r) => new Date(r.valid_upto).toLocaleDateString(), sortable: true },
        { key: 'status', header: 'Expiry Status', sortable: true, render: (r) => <ExpiryStatusBadge expiryDate={r.valid_upto} /> },
      ]}
    />
  );
}
