import { fuelTransactionApi, vehicleApi } from '../../api/resources';
import { CrudListPage } from '../crud/CrudListPage';
import type { FuelTransaction, Vehicle } from '../../types/entities';
import { ImportCsvButton } from '../../components/common/ImportCsvButton';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ApiError } from '../../api/client';

type FuelImportRow = Partial<FuelTransaction> & Record<string, unknown>;

const TEMPLATE_HEADERS = [
  'Vehicle_Reg_No', 'Fuel_Date', 'Fuel_Time', 'Fuel_Type', 'Location',
  'Quantity', 'UOM', 'Rate', 'Total_Amount', 'Tax_Amount', 'Invoice_No', 'Current_Odometer', 'Remarks',
];

function parseRow(record: Record<string, string>): FuelImportRow {
  const date = record.Fuel_Date?.trim();
  const time = record.Fuel_Time?.trim() || '00:00';
  return {
    vehicle_reg_no: record.Vehicle_Reg_No?.trim(),
    txn_datetime: date ? `${date}T${time}` : undefined,
    fuel_type: record.Fuel_Type?.trim() || 'Diesel',
    quantity: record.Quantity ? Number(record.Quantity) : undefined,
    unit_of_measure: record.UOM?.trim(),
    rate_per_unit: record.Rate ? Number(record.Rate) : undefined,
    amount: record.Total_Amount ? Number(record.Total_Amount) : undefined,
    receipt_no: record.Invoice_No?.trim() || undefined,
    odometer_km: record.Current_Odometer ? Number(record.Current_Odometer) : undefined,
    status: 'Recorded',
  };
}

function validateRow(row: FuelImportRow, allRows: FuelImportRow[], rowIndex: number) {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!row.vehicle_reg_no) errors.push('Vehicle Registration Number is required');
  if (!row.txn_datetime) errors.push('Fuel Date is required');
  if (row.quantity == null || row.quantity <= 0) errors.push('Quantity must be greater than zero');
  if (row.rate_per_unit == null || row.rate_per_unit <= 0) errors.push('Rate must be greater than zero');
  if (!row.unit_of_measure) errors.push('Unit of Measure is required');
  const isDuplicate = allRows.some((r, i) => i !== rowIndex && r.vehicle_reg_no === row.vehicle_reg_no && r.txn_datetime === row.txn_datetime);
  if (isDuplicate) warnings.push('Duplicate vehicle + date/time within this file');
  return { errors, warnings, isDuplicate };
}

async function commitRows(rows: FuelImportRow[]): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;
  let vehicles: Vehicle[] | null = null;
  for (const row of rows) {
    try {
      const payload: Partial<FuelTransaction> = { ...row };
      const regNo = (row as { vehicle_reg_no?: string }).vehicle_reg_no;
      delete (payload as Record<string, unknown>).vehicle_reg_no;
      if (regNo) {
        if (!vehicles) vehicles = (await vehicleApi.list({ page: 1, pageSize: 500 })).items;
        const match = vehicles.find((v) => v.registration_no === regNo);
        if (match) payload.vehicle_id = match.vehicle_id;
      }
      await fuelTransactionApi.create(payload);
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

export default function FuelList() {
  return (
    <CrudListPage<FuelTransaction>
      title="Fuel Transactions"
      basePath="/fuel"
      rowKey={(r) => r.fuel_txn_id}
      list={fuelTransactionApi.list}
      remove={fuelTransactionApi.remove}
      headerActions={(reload) => (
        <ImportCsvButton<FuelImportRow>
          title="Fuel Transactions"
          templateHeaders={TEMPLATE_HEADERS}
          sampleRow={{
            Vehicle_Reg_No: 'MH12AB1234', Fuel_Date: '2026-06-01', Fuel_Time: '09:30', Fuel_Type: 'Diesel',
            Location: 'BLR Depot', Quantity: '120', UOM: 'L', Rate: '92.5', Total_Amount: '11100', Tax_Amount: '0',
            Invoice_No: 'INV-1001', Current_Odometer: '154200', Remarks: '',
          }}
          columns={[
            { key: 'fuel_type', label: 'Fuel Type' },
            { key: 'quantity', label: 'Quantity' },
            { key: 'amount', label: 'Amount' },
            { key: 'status', label: 'Status' },
          ]}
          parseRow={parseRow}
          validateRow={validateRow}
          onCommit={commitRows}
          onDone={reload}
        />
      )}
      columns={[
        { key: 'txn_datetime', header: 'Date/Time', render: (r) => new Date(r.txn_datetime).toLocaleString(), sortable: true },
        { key: 'fuel_type', header: 'Fuel Type' },
        { key: 'quantity', header: 'Quantity' },
        { key: 'unit_of_measure', header: 'UoM' },
        { key: 'rate_per_unit', header: 'Rate/Unit' },
        { key: 'amount', header: 'Amount' },
        { key: 'receipt_no', header: 'Receipt No' },
        { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
      ]}
    />
  );
}
