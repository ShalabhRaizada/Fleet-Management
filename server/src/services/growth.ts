import type { Store } from '../store/store.js';
import { uid, now } from '../store/store.js';
import type { CustomerGrowthOpportunity } from '../domain/types.js';

// Analyses an existing account for expansion potential (acceptance criterion 7).
// Rule-based signals over contracts, lanes, utilization and sustainability profile;
// the Claude growth agent can enrich these with narrative recommendations.
export function scanAccountGrowth(store: Store, accountId: string, actor: string): CustomerGrowthOpportunity[] {
  const account = store.db.accounts.find(a => a.id === accountId);
  if (!account) throw new Error('Account not found');
  const opps = store.db.opportunities.filter(o => o.accountId === accountId);
  const contracts = store.db.contracts.filter(c => c.accountId === accountId);
  const found: CustomerGrowthOpportunity[] = [];

  const add = (kind: CustomerGrowthOpportunity['kind'], description: string, revenue?: number) => {
    // dedupe on kind+description
    if (store.db.customerGrowthOpportunities.some(g => g.accountId === accountId && g.kind === kind && g.description === description)) return;
    const g: CustomerGrowthOpportunity = {
      id: uid('grw'), accountId, kind, description,
      estimatedMonthlyRevenue: revenue, status: 'identified', createdAt: now(),
    };
    store.db.customerGrowthOpportunities.push(g);
    found.push(g);
  };

  for (const opp of opps) {
    for (const lane of opp.lanes) {
      if (!lane.backhaulRoute) {
        add('backhaul', `Return leg ${lane.destination} → ${lane.origin} is running empty — evaluate backhaul pairing.`,
          Math.round((opp.expectedMonthlyRevenue ?? 500000) * 0.35));
      }
      if (!lane.multiDrop && lane.intermediateStops.length === 0) {
        add('multi_drop', `Lane ${lane.origin} → ${lane.destination} could serve intermediate drop points to raise utilization.`);
      }
    }
    const s = opp.sustainability;
    if (s?.openTo.includes('lng') && !s.rejected.includes('lng')) {
      add('lng_conversion', `${account.name} is open to LNG — propose LNG tractors on their highest-volume lane.`);
    }
    if (s?.openTo.includes('ev')) {
      add('ev_short_haul', `${account.name} is open to EV — propose EV for short-haul legs under 400 km.`);
    }
    if (s?.dropTrailer || s?.trailerPools) {
      add('drop_and_hook', `Customer operations support drop-trailer — propose a drop-and-hook model to cut detention.`);
    }
    if ((opp.volume?.tonsPerMonth ?? 0) > 400 && !opp.volume?.dedicatedFleet) {
      add('dedicated_fleet', `Volume of ${opp.volume?.tonsPerMonth} MT/month justifies a dedicated fleet proposal.`);
    }
  }

  for (const contract of contracts) {
    if (contract.expiryDate && new Date(contract.expiryDate) < new Date(Date.now() + 90 * 86400_000)) {
      add('contract_expansion', `Contract "${contract.title}" expires within 90 days — open renewal + expansion discussion.`);
    }
  }
  if (!opps.length) {
    add('new_lane', `No active opportunities at ${account.name} — schedule a discovery conversation.`);
  }

  store.audit(actor, 'Account', accountId, 'growth_scan', { found: found.length });
  store.save();
  return found;
}
