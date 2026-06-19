import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { vehicleApi, complianceApi, fuelTransactionApi, jobCardApi } from '../../api/resources';
import { CrudDetailPage } from '../crud/CrudDetailPage';
import type { Vehicle, AssetCompliance, FuelTransaction, JobCard } from '../../types/entities';
import { ApiError } from '../../api/client';

function statusClass(status: string): string {
  if (status === 'Expired') return 'text-red-600';
  if (status === 'ExpiringSoon') return 'text-orange-500';
  if (status === 'Active') return 'text-green-600';
  return '';
}

function formatDate(value?: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString();
}

function formatDateTime(value?: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d.getTime())) return String(value);
  return d.toLocaleString();
}

interface CollapsiblePanelProps {
  title: string;
  viewAllHref: string;
  children: ReactNode;
}

function CollapsiblePanel({ title, viewAllHref, children }: CollapsiblePanelProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div
        className="px-6 py-3 flex items-center justify-between cursor-pointer hover:bg-gray-50"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{open ? '▼' : '▶'}</span>
          <h2 className="text-sm font-medium">{title}</h2>
        </div>
        <Link
          to={viewAllHref}
          onClick={(e) => e.stopPropagation()}
          className="text-xs text-blue-600 hover:underline"
        >
          View All
        </Link>
      </div>
      {open && <div className="border-t border-gray-100 px-6 py-4">{children}</div>}
    </div>
  );
}

function CompliancePanel({ vehicleId }: { vehicleId: string }) {
  const [records, setRecords] = useState<AssetCompliance[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setRecords(null);
    setError(null);
    complianceApi
      .list({ page: 1, pageSize: 20, asset_id: vehicleId })
      .then((res) => {
        if (!cancelled) setRecords(res.items);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : 'Failed to load');
      });
    return () => {
      cancelled = true;
    };
  }, [vehicleId]);

  return (
    <CollapsiblePanel title="Compliance Records" viewAllHref={`/compliance?asset_id=${vehicleId}`}>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      {!error && records === null && <div className="text-gray-500 text-sm">Loading...</div>}
      {!error && records !== null && records.length === 0 && (
        <div className="text-gray-500 text-sm">No compliance records found.</div>
      )}
      {!error && records !== null && records.length > 0 && (
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-3 py-2">Compliance Type</th>
                <th className="text-left px-3 py-2">Document No</th>
                <th className="text-left px-3 py-2">Valid Upto</th>
                <th className="text-left px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.asset_compliance_id} className="border-t border-gray-100">
                  <td className="px-3 py-2">{r.compliance_type_code}</td>
                  <td className="px-3 py-2">{r.document_no ?? '—'}</td>
                  <td className="px-3 py-2">{formatDate(r.valid_upto)}</td>
                  <td className={`px-3 py-2 ${statusClass(r.status)}`}>{r.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </CollapsiblePanel>
  );
}

function FuelTransactionsPanel({ vehicleId }: { vehicleId: string }) {
  const [records, setRecords] = useState<FuelTransaction[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setRecords(null);
    setError(null);
    fuelTransactionApi
      .list({ page: 1, pageSize: 5, vehicle_id: vehicleId, sortBy: 'txn_datetime', sortDir: 'DESC' })
      .then((res) => {
        if (!cancelled) setRecords(res.items);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : 'Failed to load');
      });
    return () => {
      cancelled = true;
    };
  }, [vehicleId]);

  return (
    <CollapsiblePanel title="Recent Fuel Transactions" viewAllHref={`/fuel?vehicle_id=${vehicleId}`}>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      {!error && records === null && <div className="text-gray-500 text-sm">Loading...</div>}
      {!error && records !== null && records.length === 0 && (
        <div className="text-gray-500 text-sm">No fuel transactions found.</div>
      )}
      {!error && records !== null && records.length > 0 && (
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-3 py-2">Date</th>
                <th className="text-left px-3 py-2">Fuel Type</th>
                <th className="text-left px-3 py-2">Qty</th>
                <th className="text-left px-3 py-2">Amount</th>
                <th className="text-left px-3 py-2">Odometer</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.fuel_txn_id} className="border-t border-gray-100">
                  <td className="px-3 py-2">{formatDateTime(r.txn_datetime)}</td>
                  <td className="px-3 py-2">{r.fuel_type}</td>
                  <td className="px-3 py-2">{r.quantity}</td>
                  <td className="px-3 py-2">{r.amount}</td>
                  <td className="px-3 py-2">{r.odometer_km ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </CollapsiblePanel>
  );
}

function OpenJobCardsPanel({ vehicleId }: { vehicleId: string }) {
  const [records, setRecords] = useState<JobCard[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setRecords(null);
    setError(null);
    jobCardApi
      .list({ page: 1, pageSize: 5, vehicle_id: vehicleId, status: 'Open' })
      .then((res) => {
        if (!cancelled) setRecords(res.items);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : 'Failed to load');
      });
    return () => {
      cancelled = true;
    };
  }, [vehicleId]);

  return (
    <CollapsiblePanel title="Open Job Cards" viewAllHref={`/job-cards?vehicle_id=${vehicleId}`}>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      {!error && records === null && <div className="text-gray-500 text-sm">Loading...</div>}
      {!error && records !== null && records.length === 0 && (
        <div className="text-gray-500 text-sm">No open job cards found.</div>
      )}
      {!error && records !== null && records.length > 0 && (
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-3 py-2">Job Card No</th>
                <th className="text-left px-3 py-2">Type</th>
                <th className="text-left px-3 py-2">Priority</th>
                <th className="text-left px-3 py-2">Status</th>
                <th className="text-left px-3 py-2">Opened At</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.job_card_id} className="border-t border-gray-100">
                  <td className="px-3 py-2">{r.job_card_no}</td>
                  <td className="px-3 py-2">{r.job_card_type}</td>
                  <td className="px-3 py-2">{r.priority}</td>
                  <td className="px-3 py-2">{r.status}</td>
                  <td className="px-3 py-2">{formatDateTime(r.opened_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </CollapsiblePanel>
  );
}

export default function VehicleDetail() {
  return (
    <CrudDetailPage<Vehicle>
      title="Vehicle Detail"
      basePath="/vehicles"
      get={vehicleApi.get}
      fieldsToShow={[
        { key: 'registration_no', label: 'Registration No' },
        { key: 'vehicle_code', label: 'Code' },
        { key: 'ownership_type', label: 'Ownership Type' },
        { key: 'vehicle_category', label: 'Category' },
        { key: 'vehicle_type', label: 'Type' },
        { key: 'fuel_type', label: 'Fuel Type' },
        { key: 'make', label: 'Make' },
        { key: 'model', label: 'Model' },
        { key: 'manufacture_year', label: 'Manufacture Year' },
        { key: 'vin_no', label: 'VIN No' },
        { key: 'chassis_no', label: 'Chassis No' },
        { key: 'engine_no', label: 'Engine No' },
        { key: 'gvw_kg', label: 'GVW (kg)' },
        { key: 'payload_capacity_kg', label: 'Payload Capacity (kg)' },
        { key: 'current_odometer_km', label: 'Current Odometer (km)' },
        { key: 'status', label: 'Status' },
      ]}
      extra={(vehicle) => (
        <div className="flex flex-col gap-4">
          <CompliancePanel vehicleId={vehicle.vehicle_id} />
          <FuelTransactionsPanel vehicleId={vehicle.vehicle_id} />
          <OpenJobCardsPanel vehicleId={vehicle.vehicle_id} />
        </div>
      )}
    />
  );
}
