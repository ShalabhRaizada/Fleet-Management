import { vehicleApi, branchApi } from '../../api/resources';
import { CrudListPage } from '../crud/CrudListPage';
import type { Vehicle } from '../../types/entities';
import type { Branch } from '../../types/entities';
import { ImportCsvButton } from '../../components/common/ImportCsvButton';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ApiError } from '../../api/client';

type VehicleImportRow = Partial<Vehicle> & Record<string, unknown>;

const TEMPLATE_HEADERS = [
  'Registration_No', 'Vehicle_Code', 'Ownership_Type', 'Status', 'Branch_Code',
  'Vehicle_Category', 'Vehicle_Type', 'Make', 'Model', 'Manufacture_Year',
  'VIN_No', 'Chassis_No', 'Engine_No', 'GVW_KG', 'Payload_KG', 'Volume_CBM',
  'Axle_Config', 'Body_Type', 'Fuel_Type', 'Current_Odometer',
];

function parseRow(record: Record<string, string>): VehicleImportRow {
  return {
    registration_no: record.Registration_No?.trim(),
    vehicle_code: record.Vehicle_Code?.trim() || undefined,
    ownership_type: record.Ownership_Type?.trim(),
    status: record.Status?.trim() || 'Available',
    branch_code: record.Branch_Code?.trim() || undefined,
    vehicle_category: record.Vehicle_Category?.trim(),
    vehicle_type: record.Vehicle_Type?.trim(),
    make: record.Make?.trim() || undefined,
    model: record.Model?.trim() || undefined,
    manufacture_year: record.Manufacture_Year ? Number(record.Manufacture_Year) : undefined,
    vin_no: record.VIN_No?.trim() || undefined,
    chassis_no: record.Chassis_No?.trim() || undefined,
    engine_no: record.Engine_No?.trim() || undefined,
    gvw_kg: record.GVW_KG ? Number(record.GVW_KG) : undefined,
    payload_capacity_kg: record.Payload_KG ? Number(record.Payload_KG) : undefined,
    volume_cbm: record.Volume_CBM ? Number(record.Volume_CBM) : undefined,
    axle_configuration: record.Axle_Config?.trim() || undefined,
    body_type: record.Body_Type?.trim() || undefined,
    fuel_type: record.Fuel_Type?.trim(),
    current_odometer_km: record.Current_Odometer ? Number(record.Current_Odometer) : undefined,
  };
}

const REGISTRATION_PATTERN = /^[A-Z]{2}\d{2}[A-Z]{1,2}\d{4}$/;

function validateRow(row: VehicleImportRow, allRows: VehicleImportRow[], rowIndex: number) {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!row.registration_no) errors.push('Registration No is required');
  else if (!REGISTRATION_PATTERN.test(row.registration_no)) warnings.push('Registration No does not match standard Indian plate format');
  if (!row.ownership_type) errors.push('Ownership Type is required');
  if (!row.vehicle_category) errors.push('Vehicle Category is required');
  if (!row.vehicle_type) errors.push('Vehicle Type is required');
  if (!row.fuel_type) errors.push('Fuel Type is required');
  if (row.manufacture_year && row.manufacture_year > new Date().getFullYear()) errors.push('Manufacture year cannot be in the future');
  const isDuplicate = allRows.some((r, i) => i !== rowIndex && r.registration_no && r.registration_no === row.registration_no);
  if (isDuplicate) warnings.push('Duplicate registration number within this file');
  return { errors, warnings, isDuplicate };
}

async function commitRows(rows: VehicleImportRow[]): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;
  let branches: Branch[] | null = null;
  for (const row of rows) {
    try {
      const payload: Partial<Vehicle> = { ...row };
      const branchCode = (row as { branch_code?: string }).branch_code;
      delete (payload as Record<string, unknown>).branch_code;
      if (branchCode) {
        if (!branches) branches = (await branchApi.list({ page: 1, pageSize: 500 })).items;
        const match = branches.find((b) => b.branch_code === branchCode);
        if (match) payload.branch_id = match.branch_id;
      }
      await vehicleApi.create(payload);
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

export default function VehicleList() {
  return (
    <CrudListPage<Vehicle>
      title="Vehicles"
      basePath="/vehicles"
      rowKey={(r) => r.vehicle_id}
      list={vehicleApi.list}
      remove={vehicleApi.remove}
      headerActions={(reload) => (
        <ImportCsvButton<VehicleImportRow>
          title="Vehicles"
          templateHeaders={TEMPLATE_HEADERS}
          sampleRow={{
            Registration_No: 'MH12AB1234', Vehicle_Code: 'V-001', Ownership_Type: 'Owned', Status: 'Available',
            Branch_Code: 'BLR01', Vehicle_Category: 'LCV', Vehicle_Type: 'Truck', Make: 'Tata', Model: '407',
            Manufacture_Year: '2022', VIN_No: '', Chassis_No: '', Engine_No: '', GVW_KG: '3500', Payload_KG: '1500',
            Volume_CBM: '12', Axle_Config: '2x2', Body_Type: 'Box', Fuel_Type: 'Diesel', Current_Odometer: '15000',
          }}
          columns={[
            { key: 'registration_no', label: 'Registration No' },
            { key: 'vehicle_category', label: 'Category' },
            { key: 'vehicle_type', label: 'Type' },
            { key: 'fuel_type', label: 'Fuel' },
            { key: 'status', label: 'Status' },
          ]}
          parseRow={parseRow}
          validateRow={validateRow}
          onCommit={commitRows}
          onDone={reload}
        />
      )}
      columns={[
        { key: 'registration_no', header: 'Registration No', sortable: true },
        { key: 'vehicle_code', header: 'Code' },
        { key: 'vehicle_category', header: 'Category' },
        { key: 'vehicle_type', header: 'Type' },
        { key: 'fuel_type', header: 'Fuel' },
        { key: 'make', header: 'Make' },
        { key: 'model', header: 'Model' },
        { key: 'status', header: 'Status', sortable: true, render: (r) => <StatusBadge status={r.status} /> },
      ]}
    />
  );
}
