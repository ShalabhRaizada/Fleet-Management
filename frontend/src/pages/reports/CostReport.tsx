import { useCallback, useEffect, useState } from 'react';
import { costLedgerApi } from '../../api/resources';
import { DataTable, usePagedList } from '../../components/DataTable';
import type { VehicleCostLedger } from '../../types/entities';

export default function CostReport() {
  const [category, setCategory] = useState('');
  const fetcher = useCallback(
    (p: { page: number; pageSize: number; q?: string; sortBy?: string; sortDir?: 'ASC' | 'DESC' }) =>
      costLedgerApi.list({ ...p, cost_category: category || undefined }),
    [category]
  );
  const { items, page, pageSize, total, setPage, loading } = usePagedList<VehicleCostLedger>(fetcher);

  useEffect(() => {
    setPage(1);
  }, [category, setPage]);

  const totalAmount = items.reduce((sum, r) => sum + Number(r.amount || 0), 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Vehicle Cost Report</h1>
        <input
          className="border border-gray-300 rounded px-3 py-1.5 text-sm"
          placeholder="Filter by cost category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
      </div>
      <div className="bg-white border border-gray-200 rounded-lg p-4 text-sm">
        Total (current page): <span className="font-semibold">{totalAmount.toFixed(2)}</span>
      </div>
      <DataTable
        columns={[
          { key: 'cost_datetime', header: 'Date', render: (r) => new Date(r.cost_datetime).toLocaleDateString(), sortable: true },
          { key: 'cost_category', header: 'Category', sortable: true },
          { key: 'source_transaction_type', header: 'Source Type' },
          { key: 'amount', header: 'Amount' },
          { key: 'posted_to_accounts', header: 'Posted', render: (r) => (r.posted_to_accounts ? 'Yes' : 'No') },
        ]}
        rows={items}
        rowKey={(r) => r.cost_ledger_id}
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={setPage}
        loading={loading}
        exportFilename="vehicle-cost-report"
      />
    </div>
  );
}
