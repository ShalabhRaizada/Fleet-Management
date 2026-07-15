import type { Store } from '../store/store.js';

// AI Revenue Command Centre metrics for leadership.
export function commandCentreMetrics(store: Store) {
  const db = store.db;
  const open = db.opportunities.filter(o => !['won', 'lost'].includes(o.stage));
  const totalPipeline = open.reduce((s, o) => s + (o.expectedMonthlyRevenue ?? 0), 0);
  const weightedPipeline = open.reduce((s, o) => s + (o.expectedMonthlyRevenue ?? 0) * o.probability / 100, 0);

  const pipelineByStage: Record<string, number> = {};
  for (const o of open) {
    pipelineByStage[o.stage] = (pipelineByStage[o.stage] ?? 0) + (o.expectedMonthlyRevenue ?? 0);
  }

  const turnaroundHours = (kind: string) => {
    const done = db.collaborationRequests.filter(c => c.kind === kind && c.status === 'completed');
    if (!done.length) return null;
    const total = done.reduce((s, c) => s + (new Date(c.updatedAt).getTime() - new Date(c.createdAt).getTime()), 0);
    return Math.round(total / done.length / 3600_000 * 10) / 10;
  };

  const soon = new Date(Date.now() + 90 * 86400_000);
  return {
    totalPipeline,
    weightedPipeline: Math.round(weightedPipeline),
    pipelineByStage,
    openOpportunities: open.length,
    quotationsRequested: db.quotationRequests.length,
    quotationsPending: db.quotationRequests.filter(q => q.status !== 'completed').length,
    quotationTurnaroundHours: turnaroundHours('network_planning'),
    financeApprovalTurnaroundHours: turnaroundHours('finance_review'),
    commercialApprovalTurnaroundHours: turnaroundHours('commercial_approval'),
    contractsUnderReview: db.contracts.filter(c => c.status === 'in_legal_review').length,
    contractsNearingExpiry: db.contracts.filter(c => c.expiryDate && new Date(c.expiryDate) < soon).length,
    growthOpportunities: db.customerGrowthOpportunities.filter(g => g.status === 'identified').length,
    backhaulOpportunities: db.customerGrowthOpportunities.filter(g => g.kind === 'backhaul' && g.status === 'identified').length,
    lngConversionPipeline: db.customerGrowthOpportunities.filter(g => g.kind === 'lng_conversion' && g.status !== 'dropped').length,
    evConversionPipeline: db.customerGrowthOpportunities.filter(g => g.kind === 'ev_short_haul' && g.status !== 'dropped').length,
    approvalBottlenecks: db.workflowSLAs.filter(w => w.breached).length,
    followUpCompliance: (() => {
      const all = db.followUps.length;
      if (!all) return null;
      return Math.round(db.followUps.filter(f => f.status === 'done').length / all * 100);
    })(),
    escalationsOpen: db.escalations.filter(e => e.status === 'open').length,
    likelyToCloseThisMonth: open
      .filter(o => o.probability >= 70)
      .map(o => ({ id: o.id, name: o.name, probability: o.probability, expectedMonthlyRevenue: o.expectedMonthlyRevenue })),
  };
}
