import { useEffect, useState } from 'react';
import { DataTable, usePagedList, type ColumnDef } from '../../components/DataTable';
import { vehicleApi, vahanValidationResultApi, validateVahan } from '../../api/resources';
import { ApiError } from '../../api/client';
import type { Vehicle, VahanValidationResult, VahanValidationRequestResult, VahanValidationResponse } from '../../types/entities';

export default function VahanValidation() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [vehicleError, setVehicleError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filterText, setFilterText] = useState('');

  const [validating, setValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [response, setResponse] = useState<VahanValidationResponse | null>(null);

  const history = usePagedList<VahanValidationResult>((params) =>
    vahanValidationResultApi.list({ ...params, sortBy: 'requested_at', sortDir: 'DESC' })
  );

  useEffect(() => {
    (async () => {
      try {
        const res = await vehicleApi.list({ page: 1, pageSize: 500, sortBy: 'registration_no' });
        setVehicles(res.items);
      } catch (err) {
        setVehicleError(err instanceof ApiError ? err.message : 'Failed to load vehicles');
      } finally {
        setLoadingVehicles(false);
      }
    })();
  }, []);

  const filteredVehicles = vehicles.filter((v) =>
    v.registration_no.toLowerCase().includes(filterText.toLowerCase())
  );

  function toggle(vehicleId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(vehicleId)) next.delete(vehicleId);
      else next.add(vehicleId);
      return next;
    });
  }

  function toggleAllFiltered() {
    setSelected((prev) => {
      const allSelected = filteredVehicles.every((v) => prev.has(v.vehicle_id));
      const next = new Set(prev);
      if (allSelected) {
        filteredVehicles.forEach((v) => next.delete(v.vehicle_id));
      } else {
        filteredVehicles.forEach((v) => next.add(v.vehicle_id));
      }
      return next;
    });
  }

  async function handleValidate() {
    if (selected.size === 0) {
      setValidationError('Select at least one vehicle');
      return;
    }
    setValidating(true);
    setValidationError(null);
    try {
      const res = await validateVahan(Array.from(selected));
      setResponse(res);
      history.reload();
    } catch (err) {
      setValidationError(err instanceof ApiError ? err.message : 'Validation failed');
    } finally {
      setValidating(false);
    }
  }

  const historyColumns: ColumnDef<VahanValidationResult>[] = [
    { key: 'vehicle_no', header: 'Registration No' },
    { key: 'response_status', header: 'Status' },
    { key: 'rc_status', header: 'RC Status' },
    { key: 'fitness_valid_upto', header: 'Fitness Valid Upto' },
    { key: 'pucc_valid_upto', header: 'PUCC Valid Upto' },
    { key: 'insurance_valid_upto', header: 'Insurance Valid Upto' },
    { key: 'permit_valid_upto', header: 'Permit Valid Upto' },
    {
      key: 'is_blacklisted',
      header: 'Blacklisted',
      render: (row) =>
        row.is_blacklisted ? (
          <span className="badge danger">Yes</span>
        ) : (
          <span className="badge outline">No</span>
        ),
    },
    {
      key: 'requested_at',
      header: 'Requested At',
      render: (row) => new Date(row.requested_at).toLocaleString(),
    },
  ];

  return (
    <div className="col gap-16">
      <div className="page-header">
        <h1>Validate VAHAN</h1>
      </div>

      {response && (
        <div className="row gap-16" style={{ flexWrap: 'wrap' }}>
          <div className="kpi">
            <div className="label">Validated</div>
            <div className="value">{response.summary.matched}</div>
          </div>
          <div className="kpi">
            <div className="label">Not Found</div>
            <div className="value">{response.summary.notFound}</div>
          </div>
          <div className="kpi">
            <div className="label">Flagged (Blacklisted)</div>
            <div className="value" style={response.summary.flagged > 0 ? { color: 'var(--danger)' } : undefined}>
              {response.summary.flagged}
            </div>
          </div>
        </div>
      )}

      <div className="card" style={{ padding: 20 }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Select Vehicles</div>
        {vehicleError && <div className="badge danger" style={{ display: 'block', padding: '8px 12px', marginBottom: 8 }}>{vehicleError}</div>}
        <div className="row" style={{ gap: 12, alignItems: 'center', marginBottom: 8 }}>
          <input
            className="input"
            style={{ maxWidth: 280 }}
            placeholder="Filter by registration no..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
          <button type="button" className="btn sm" onClick={toggleAllFiltered}>
            Select / Deselect All (filtered)
          </button>
          <span className="muted" style={{ fontSize: 12.5 }}>{selected.size} selected</span>
        </div>

        {loadingVehicles ? (
          <div className="muted">Loading vehicles...</div>
        ) : (
          <div style={{ maxHeight: 260, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 6 }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th></th>
                  <th>Registration No</th>
                  <th>Make/Model</th>
                  <th>Vehicle Type</th>
                </tr>
              </thead>
              <tbody>
                {filteredVehicles.map((v) => (
                  <tr key={v.vehicle_id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selected.has(v.vehicle_id)}
                        onChange={() => toggle(v.vehicle_id)}
                      />
                    </td>
                    <td className="mono">{v.registration_no}</td>
                    <td>{[v.make, v.model].filter(Boolean).join(' ') || '-'}</td>
                    <td>{v.vehicle_type}</td>
                  </tr>
                ))}
                {filteredVehicles.length === 0 && (
                  <tr>
                    <td colSpan={4} className="muted">No vehicles match the filter</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="row" style={{ marginTop: 12 }}>
          <button type="button" className="btn primary" disabled={validating} onClick={handleValidate}>
            {validating ? 'Validating...' : 'Validate Selected'}
          </button>
        </div>
        {validationError && <div className="badge danger" style={{ display: 'block', padding: '8px 12px', marginTop: 8 }}>{validationError}</div>}
      </div>

      {response && (
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '12px 16px', fontWeight: 600 }}>Latest Validation Results</div>
          <table className="tbl">
            <thead>
              <tr>
                <th>Registration No</th>
                <th>Status</th>
                <th>RC Status</th>
                <th>Fitness Valid Upto</th>
                <th>PUCC Valid Upto</th>
                <th>Insurance Valid Upto</th>
                <th>Permit Valid Upto</th>
                <th>Blacklisted</th>
              </tr>
            </thead>
            <tbody>
              {response.results.map((r: VahanValidationRequestResult) => (
                <tr key={r.vehicle_id}>
                  <td className="mono">{r.vehicle_no}</td>
                  <td>
                    <span className={`badge ${r.response_status === 'Success' ? 'success' : 'danger'}`}>
                      {r.response_status}
                    </span>
                    {r.message && <div className="muted" style={{ fontSize: 11 }}>{r.message}</div>}
                  </td>
                  <td>{r.rc_status || '-'}</td>
                  <td>{r.fitness_valid_upto || '-'}</td>
                  <td>{r.pucc_valid_upto || '-'}</td>
                  <td>{r.insurance_valid_upto || '-'}</td>
                  <td>{r.permit_valid_upto || '-'}</td>
                  <td>
                    {r.is_blacklisted ? (
                      <span className="badge danger">Yes{r.blacklist_reason ? `: ${r.blacklist_reason}` : ''}</span>
                    ) : (
                      <span className="badge outline">No</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="col gap-8">
        <div style={{ fontWeight: 600 }}>Validation History</div>
        <DataTable
          columns={historyColumns}
          rows={history.items}
          rowKey={(row) => row.result_id}
          page={history.page}
          pageSize={history.pageSize}
          total={history.total}
          onPageChange={history.setPage}
          onSearch={history.setQ}
          searchValue={history.q}
          onSort={history.setSort}
          sortBy={history.sortBy}
          sortDir={history.sortDir}
          loading={history.loading}
          exportFilename="vahan-validation-history"
        />
      </div>
    </div>
  );
}
