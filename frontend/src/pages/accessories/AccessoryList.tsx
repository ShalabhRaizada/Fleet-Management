import { accessoryApi, vendorApi, vehicleApi } from '../../api/resources';
import { CrudListPage } from '../crud/CrudListPage';
import type { Accessory, Vendor, Vehicle } from '../../types/entities';
import { ImportCsvButton } from '../../components/common/ImportCsvButton';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ApiError } from '../../api/client';

type AccessoryImportRow = Partial<Accessory> & Record<string, unknown>;

const TEMPLATE_HEADERS = [
  'Accessory_Code', 'Accessory_Type', 'Serial_No', 'Status', 'Vendor_Name', 'Purchase_Date',
  'Warranty_Expiry', 'Assigned_Vehicle_Reg_No', 'IMEI_No', 'SIM_No',
];

function parseRow(record: Record<string, string>): AccessoryImportRow {
  return {
    accessory_code: record.Accessory_Code?.trim(),
    accessory_type: record.Accessory_Type?.trim(),
    serial_no: record.Serial_No?.trim() || undefined,
    status: record.Status?.trim() || 'InStock',
    vendor_name: record.Vendor_Name?.trim() || undefined,
    purchase_date: record.Purchase_Date?.trim() || undefined,
    warranty_upto: record.Warranty_Expiry?.trim() || undefined,
    vehicle_reg_no: record.Assigned_Vehicle_Reg_No?.trim() || undefined,
    imei_no: record.IMEI_No?.trim() || undefined,
    sim_no: record.SIM_No?.trim() || undefined,
  };
}

function validateRow(row: AccessoryImportRow, allRows: AccessoryImportRow[], rowIndex: number) {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!row.accessory_code) errors.push('Accessory Code is required');
  if (!row.accessory_type) errors.push('Accessory Type is required');
  if (row.purchase_date && row.warranty_upto && row.warranty_upto < row.purchase_date) {
    errors.push('Warranty expiry cannot be earlier than purchase date');
  }
  const isDuplicate = allRows.some((r, i) => i !== rowIndex && r.accessory_code && r.accessory_code === row.accessory_code);
  if (isDuplicate) warnings.push('Duplicate accessory code within this file');
  return { errors, warnings, isDuplicate };
}

async function commitRows(rows: AccessoryImportRow[]): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;
  let vendors: Vendor[] | null = null;
  let vehicles: Vehicle[] | null = null;
  for (const row of rows) {
    try {
      const payload: Partial<Accessory> = { ...row };
      const vendorName = (row as { vendor_name?: string }).vendor_name;
      const regNo = (row as { vehicle_reg_no?: string }).vehicle_reg_no;
      delete (payload as Record<string, unknown>).vendor_name;
      delete (payload as Record<string, unknown>).vehicle_reg_no;
      if (vendorName) {
        if (!vendors) vendors = (await vendorApi.list({ page: 1, pageSize: 500 })).items;
        const match = vendors.find((v) => v.vendor_name === vendorName);
        if (match) payload.vendor_id = match.vendor_id;
      }
      if (regNo) {
        if (!vehicles) vehicles = (await vehicleApi.list({ page: 1, pageSize: 500 })).items;
        const match = vehicles.find((v) => v.registration_no === regNo);
        if (match) payload.current_vehicle_id = match.vehicle_id;
      }
      await accessoryApi.create(payload);
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

export default function AccessoryList() {
  return (
    <CrudListPage<Accessory>
      title="Accessories"
      basePath="/accessories"
      rowKey={(r) => r.accessory_id}
      list={accessoryApi.list}
      remove={accessoryApi.remove}
      headerActions={(reload) => (
        <ImportCsvButton<AccessoryImportRow>
          title="Accessories"
          templateHeaders={TEMPLATE_HEADERS}
          sampleRow={{
            Accessory_Code: 'ACC-001', Accessory_Type: 'GPS', Serial_No: 'SN-9001', Status: 'InStock',
            Vendor_Name: 'TrackTech Pvt Ltd', Purchase_Date: '2026-01-10', Warranty_Expiry: '2028-01-10',
            Assigned_Vehicle_Reg_No: '', IMEI_No: '', SIM_No: '',
          }}
          columns={[
            { key: 'accessory_code', label: 'Code' },
            { key: 'accessory_type', label: 'Type' },
            { key: 'status', label: 'Status' },
          ]}
          parseRow={parseRow}
          validateRow={validateRow}
          onCommit={commitRows}
          onDone={reload}
        />
      )}
      columns={[
        { key: 'accessory_code', header: 'Code', sortable: true },
        { key: 'accessory_type', header: 'Type' },
        { key: 'serial_no', header: 'Serial No' },
        { key: 'health_status', header: 'Health' },
        { key: 'status', header: 'Status', sortable: true, render: (r) => <StatusBadge status={r.status} /> },
      ]}
    />
  );
}
