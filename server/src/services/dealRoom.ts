import type { Store } from '../store/store.js';
import { uid, now } from '../store/store.js';
import type { DealRoom, DealRoomArtifact } from '../domain/types.js';

// Every opportunity gets exactly one deal room (acceptance criterion 9).
export function ensureDealRoom(store: Store, opportunityId: string): DealRoom {
  let room = store.db.dealRooms.find(r => r.opportunityId === opportunityId);
  if (!room) {
    room = { id: uid('room'), opportunityId, createdAt: now() };
    store.db.dealRooms.push(room);
    const opp = store.db.opportunities.find(o => o.id === opportunityId);
    if (opp) {
      store.db.dealRoomParticipants.push({ id: uid('prt'), dealRoomId: room.id, name: opp.ownerId, team: 'sales' });
    }
    store.audit('system', 'DealRoom', room.id, 'created', { opportunityId });
  }
  return room;
}

export function logDealRoom(store: Store, opportunityId: string, kind: DealRoomArtifact['kind'], refId: string, title: string) {
  const room = ensureDealRoom(store, opportunityId);
  store.db.dealRoomArtifacts.push({ id: uid('art'), dealRoomId: room.id, kind, refId, title, createdAt: now() });
  store.db.dealRoomActivities.push({ id: uid('act'), dealRoomId: room.id, actor: 'system', action: title, createdAt: now() });
}

// Rule-based blocker detection — used directly by the API and as grounding
// context for the Claude deal-room agent.
export function detectBlockers(store: Store, opportunityId: string): string[] {
  const blockers: string[] = [];
  const opp = store.db.opportunities.find(o => o.id === opportunityId);
  if (!opp) return ['Opportunity not found'];

  const pendingFinance = store.db.financeReviews.filter(r => {
    const qv = store.db.quotationVersions.find(v => v.id === r.quotationVersionId);
    return qv?.opportunityId === opportunityId && !r.decision;
  });
  for (const r of pendingFinance) {
    blockers.push(`Finance approval pending${r.exceptions.length ? ` — ${r.exceptions.join('; ')}` : ''}. ${r.aiRecommendation ?? ''}`.trim());
  }

  const openPlanning = store.db.collaborationRequests.filter(c =>
    c.opportunityId === opportunityId && c.kind === 'network_planning' && !['completed', 'cancelled'].includes(c.status));
  for (const c of openPlanning) blockers.push('Network Planning has not yet returned a route and cost solution.');

  const noBackhaul = store.db.quotationVersions.find(v =>
    v.opportunityId === opportunityId && v.status !== 'superseded' && (v.planning.emptyKmPct ?? 0) > 35);
  if (noBackhaul) blockers.push(`No backhaul confirmed — ${noBackhaul.planning.emptyKmPct}% empty kilometres erodes margin. Ask planning to evaluate the return lane.`);

  const breached = store.db.workflowSLAs.filter(w => {
    const c = store.db.collaborationRequests.find(cr => cr.id === w.requestId);
    return c?.opportunityId === opportunityId && w.breached;
  });
  for (const w of breached) blockers.push(`SLA breached on request ${w.requestId} — escalation raised.`);

  if ((opp.commercial?.creditDays ?? 0) > 45) {
    blockers.push(`${opp.commercial!.creditDays}-day credit term reduces expected return — recommend negotiating 45 days.`);
  }
  if (!opp.lanes.length) blockers.push('No lanes qualified yet.');
  if (!opp.volume?.tonsPerMonth) blockers.push('Monthly volume not captured.');

  return blockers.length ? blockers : ['No blockers detected — recommend advancing to next stage.'];
}

export function dealRoomSummary(store: Store, opportunityId: string) {
  const room = ensureDealRoom(store, opportunityId);
  const opp = store.db.opportunities.find(o => o.id === opportunityId)!;
  const account = store.db.accounts.find(a => a.id === opp.accountId);
  const quotations = store.db.quotationVersions.filter(v => v.opportunityId === opportunityId);
  const approvals = store.db.approvalDecisions.filter(d =>
    store.db.collaborationRequests.find(c => c.id === d.requestId)?.opportunityId === opportunityId);
  const contracts = store.db.contracts.filter(c => c.opportunityId === opportunityId);
  const comms = store.db.customerCommunications.filter(c => c.opportunityId === opportunityId);
  const followUps = store.db.followUps.filter(f => f.opportunityId === opportunityId);
  return {
    room,
    opportunity: opp,
    account,
    blockers: detectBlockers(store, opportunityId),
    quotations,
    approvals,
    contracts,
    communications: comms,
    followUps,
    artifacts: store.db.dealRoomArtifacts.filter(a => a.dealRoomId === room.id),
    activities: store.db.dealRoomActivities.filter(a => a.dealRoomId === room.id),
    participants: store.db.dealRoomParticipants.filter(p => p.dealRoomId === room.id),
  };
}
