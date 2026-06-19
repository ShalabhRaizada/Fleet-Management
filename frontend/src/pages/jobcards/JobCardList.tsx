import { jobCardApi, vehicleApi, trailerApi, workshopApi } from '../../api/resources';
import { CrudListPage } from '../crud/CrudListPage';
import type { JobCard, Vehicle, Trailer, Workshop } from '../../types/entities';
import { ImportCsvButton } from '../../components/common/ImportCsvButton';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ApiError } from '../../api/client';

type JobCardImportRow = Partial<JobCard> & Record<string, unknown>;

const TEMPLATE_HEADERS = [
  'Job_Card_No', 'Vehicle_Reg_No', 'Trailer_No', 'Job_Date', 'Odometer', 'Service_Type',
  'Issue_Description', 'Priority', 'Workshop_Name', 'Labour_Hours', 'Labour_Rate',
  'Parts_Cost', 'Other_Charges', 'Tax_Amount', 'Total_Cost', 'Status', 'Remarks',
];

function parseRow(record: Record<string, string>): JobCardImportRow {
  return {
    job_card_no: record.Job_Card_No?.trim(),
    vehicle_reg_no: record.Vehicle_Reg_No?.trim() || undefined,
    trailer_no: record.Trailer_No?.trim() || undefined,
    reported_datetime: record.Job_Date ? `${record.Job_Date.trim()}T00:00` : undefined,
    opened_at: record.Job_Date ? `${record.Job_Date.trim()}T00:00` : undefined,
    odometer_km: record.Odometer ? Number(record.Odometer) : undefined,
    job_card_type: record.Service_Type?.trim() || 'Scheduled',
    defect_summary: record.Issue_Description?.trim(),
    priority: record.Priority?.trim() || 'Medium',
    workshop_name: record.Workshop_Name?.trim() || undefined,
    estimated_amount: record.Total_Cost ? Number(record.Total_Cost) : undefined,
    status: record.Status?.trim() || 'Open',
  };
}

function validateRow(row: JobCardImportRow, allRows: JobCardImportRow[], rowIndex: number) {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!row.job_card_no) errors.push('Job Card No is required');
  if (!row.defect_summary) errors.push('Issue Description is required');
  if (!row.vehicle_reg_no && !row.trailer_no) errors.push('Vehicle Reg No or Trailer No is required');
  if (row.estimated_amount != null && row.estimated_amount < 0) errors.push('Total cost cannot be negative');
  const isDuplicate = allRows.some((r, i) => i !== rowIndex && r.job_card_no && r.job_card_no === row.job_card_no);
  if (isDuplicate) warnings.push('Duplicate job card number within this file');
  return { errors, warnings, isDuplicate };
}

async function commitRows(rows: JobCardImportRow[]): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;
  let vehicles: Vehicle[] | null = null;
  let trailers: Trailer[] | null = null;
  let workshops: Workshop[] | null = null;
  for (const row of rows) {
    try {
      const payload: Partial<JobCard> = { ...row };
      const regNo = (row as { vehicle_reg_no?: string }).vehicle_reg_no;
      const trailerNo = (row as { trailer_no?: string }).trailer_no;
      const workshopName = (row as { workshop_name?: string }).workshop_name;
      delete (payload as Record<string, unknown>).vehicle_reg_no;
      delete (payload as Record<string, unknown>).trailer_no;
      delete (payload as Record<string, unknown>).workshop_name;
      if (regNo) {
        if (!vehicles) vehicles = (await vehicleApi.list({ page: 1, pageSize: 500 })).items;
        const match = vehicles.find((v) => v.registration_no === regNo);
        if (match) payload.vehicle_id = match.vehicle_id;
      }
      if (trailerNo) {
        if (!trailers) trailers = (await trailerApi.list({ page: 1, pageSize: 500 })).items;
        const match = trailers.find((t) => t.trailer_no === trailerNo);
        if (match) payload.trailer_id = match.trailer_id;
      }
      if (workshopName) {
        if (!workshops) workshops = (await workshopApi.list({ page: 1, pageSize: 500 })).items;
        const match = workshops.find((w) => w.workshop_name === workshopName);
        if (match) payload.workshop_id = match.workshop_id;
      }
      await jobCardApi.create(payload);
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

export default function JobCardList() {
  return (
    <CrudListPage<JobCard>
      title="Job Cards"
      basePath="/job-cards"
      rowKey={(r) => r.job_card_id}
      list={jobCardApi.list}
      remove={jobCardApi.remove}
      headerActions={(reload) => (
        <ImportCsvButton<JobCardImportRow>
          title="Job Cards"
          templateHeaders={TEMPLATE_HEADERS}
          sampleRow={{
            Job_Card_No: 'JC-1001', Vehicle_Reg_No: 'MH12AB1234', Trailer_No: '', Job_Date: '2026-06-01',
            Odometer: '154200', Service_Type: 'Breakdown', Issue_Description: 'Brake pad wear', Priority: 'High',
            Workshop_Name: 'BLR Central Workshop', Labour_Hours: '2', Labour_Rate: '500', Parts_Cost: '3500',
            Other_Charges: '0', Tax_Amount: '630', Total_Cost: '5130', Status: 'Open', Remarks: '',
          }}
          columns={[
            { key: 'job_card_no', label: 'Job Card No' },
            { key: 'job_card_type', label: 'Type' },
            { key: 'priority', label: 'Priority' },
            { key: 'status', label: 'Status' },
          ]}
          parseRow={parseRow}
          validateRow={validateRow}
          onCommit={commitRows}
          onDone={reload}
        />
      )}
      columns={[
        { key: 'job_card_no', header: 'Job Card No', sortable: true },
        { key: 'job_card_type', header: 'Type' },
        { key: 'defect_summary', header: 'Defect Summary' },
        { key: 'priority', header: 'Priority' },
        { key: 'status', header: 'Status', sortable: true, render: (r) => <StatusBadge status={r.status} /> },
        { key: 'opened_at', header: 'Opened At', render: (r) => new Date(r.opened_at).toLocaleDateString() },
        {
          key: 'sla_breached',
          header: 'SLA',
          render: (r) => (r.sla_breached ? <span className="badge danger">SLA Breached</span> : null),
        },
      ]}
    />
  );
}
