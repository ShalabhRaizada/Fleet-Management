import { useCallback, useEffect, useState } from 'react';
import { complianceApi } from '../../api/resources';
import { DataTable, usePagedList } from '../../components/DataTable';
import type { AssetCompliance } from '../../types/entities';

export default function ComplianceExpiryList() {
  const [status, setStatus] = useState<'ExpiringSoon' | 'Expired'>('ExpiringSoon');
  const fetcher = useCallback(
    (p: { page: number; pageSize: number; q?: string; sortBy?: string; sortDir?: 'ASC' | 'DESC' }) =>
      complianceApi.list({ ...p, status }),
    [status]
  );
  const { items, page, pageSize, total, setPage, loading } = usePagedList<AssetCompliance>(fetcher);

  useEffect(() => {
    setPage(1);
  }, [status, setPage]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Compliance Expiry / Alerts</h1>
        <select
          className="border border-gray-300 rounded px-3 py-1.5 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value as 'ExpiringSoon' | 'Expired')}
        >
          <option value="ExpiringSoon">Expiring Soon</option>
          <option value="Expired">Expired</option>
        </select>
      </div>
      <DataTable
        columns={[
          { key: 'asset_type', header: 'Asset Type' },
          { key: 'compliance_type_code', header: 'Compliance Type' },
          { key: 'document_no', header: 'Document No' },
          { key: 'valid_upto', header: 'Valid Upto', render: (r) => new Date(r.valid_upto).toLocaleDateString() },
          { key: 'status', header: 'Status' },
        ]}
        rows={items}
        rowKey={(r) => r.asset_compliance_id}
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={setPage}
        loading={loading}
        exportFilename="compliance-expiry"
      />
    </div>
  );
}
