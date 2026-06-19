import { useEffect, useState } from 'react';
import { vendorApi, jobCardApi, workshopApi, breakdownEventApi } from '../../api/resources';
import { ApiError } from '../../api/client';
import type { Vendor, JobCard, Workshop } from '../../types/entities';
import type { BreakdownEvent } from '../../types/entities-p2p3';

interface VendorRow {
  vendor_id: string;
  vendor_name: string;
  vendor_rating: number | null;
  jobCardCount: number;
  breakdownCount: number;
}

export default function VendorPerformanceReport() {
  const [rows, setRows] = useState<VendorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [vendors, jobCards, workshops, breakdowns] = await Promise.all([
          vendorApi.list({ page: 1, pageSize: 1000 }),
          jobCardApi.list({ page: 1, pageSize: 1000 }),
          workshopApi.list({ page: 1, pageSize: 1000 }),
          breakdownEventApi.list({ page: 1, pageSize: 1000 }),
        ]);

        const workshopVendor: Record<string, string> = {};
        (workshops.items as Workshop[]).forEach((w) => {
          if (w.vendor_id) workshopVendor[w.workshop_id] = w.vendor_id;
        });

        const jobCardCountByVendor: Record<string, number> = {};
        const jobCardVendorById: Record<string, string> = {};
        (jobCards.items as JobCard[]).forEach((jc) => {
          const vId = jc.workshop_id ? workshopVendor[jc.workshop_id] : undefined;
          if (vId) {
            jobCardCountByVendor[vId] = (jobCardCountByVendor[vId] || 0) + 1;
            jobCardVendorById[jc.job_card_id] = vId;
          }
        });

        const breakdownCountByVendor: Record<string, number> = {};
        (breakdowns.items as BreakdownEvent[]).forEach((b) => {
          const vId = b.job_card_id ? jobCardVendorById[b.job_card_id] : undefined;
          if (vId) breakdownCountByVendor[vId] = (breakdownCountByVendor[vId] || 0) + 1;
        });

        const result: VendorRow[] = (vendors.items as Vendor[]).map((v) => ({
          vendor_id: v.vendor_id,
          vendor_name: v.vendor_name,
          vendor_rating: v.vendor_rating ?? null,
          jobCardCount: jobCardCountByVendor[v.vendor_id] || 0,
          breakdownCount: breakdownCountByVendor[v.vendor_id] || 0,
        }));
        setRows(result);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Failed to load vendor performance data');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="muted">Loading...</div>;

  const ratedVendors = rows.filter((r) => r.vendor_rating !== null);
  const avgRating = ratedVendors.reduce((s, r) => s + (r.vendor_rating || 0), 0) / (ratedVendors.length || 1);

  return (
    <div className="col gap-16">
      <div className="page-header">
        <h1>Vendor Performance Report</h1>
      </div>
      {error && <div className="badge danger" style={{ display: 'block', padding: '8px 12px' }}>{error}</div>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
        <div className="kpi">
          <div className="label">Vendors</div>
          <div className="value">{rows.length}</div>
        </div>
        <div className="kpi">
          <div className="label">Avg Vendor Rating</div>
          <div className="value">{ratedVendors.length ? avgRating.toFixed(2) : '-'}</div>
        </div>
      </div>
      <div className="card" style={{ padding: 0 }}>
        <table className="tbl">
          <thead>
            <tr>
              <th>Vendor</th>
              <th className="num">Job Cards</th>
              <th className="num">Breakdowns</th>
              <th className="num">Rating</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.vendor_id}>
                <td>{r.vendor_name}</td>
                <td className="num tnum">{r.jobCardCount}</td>
                <td className="num tnum">{r.breakdownCount}</td>
                <td className="num tnum">{r.vendor_rating !== null ? r.vendor_rating.toFixed(2) : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
