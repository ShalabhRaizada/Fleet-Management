import type { Store } from '../store/store.js';
import { uid, now } from '../store/store.js';

export function createNotification(store: Store, userId: string, title: string, body: string, refKind?: string, refId?: string) {
  const n = { id: uid('ntf'), userId, title, body, read: false, refKind, refId, createdAt: now() };
  store.db.notifications.push(n);
  return n;
}

export type InboxCategory =
  | 'network_planning' | 'quotations' | 'finance' | 'commercial' | 'legal'
  | 'contracts' | 'customer' | 'followups' | 'escalations' | 'overdue' | 'recommendations';

export interface InboxItem {
  id: string;
  category: InboxCategory;
  title: string;
  detail: string;
  refKind: string;
  refId: string;
  opportunityId?: string;
  overdue: boolean;
  createdAt: string;
  actions: string[];
}

// Unified AI Collaboration Inbox — aggregates everything actionable.
export function buildInbox(store: Store, userId: string): InboxItem[] {
  const items: InboxItem[] = [];
  const db = store.db;
  const oppName = (id?: string) => db.opportunities.find(o => o.id === id)?.name ?? id ?? '';

  for (const c of db.collaborationRequests) {
    if (['completed', 'cancelled'].includes(c.status)) continue;
    const sla = db.workflowSLAs.find(w => w.requestId === c.id);
    const category: InboxCategory =
      c.kind === 'network_planning' ? 'network_planning' :
      c.kind === 'finance_review' ? 'finance' :
      c.kind === 'commercial_approval' ? 'commercial' :
      c.kind === 'legal_review' ? 'legal' : 'recommendations';
    items.push({
      id: c.id, category,
      title: `${c.kind.replace(/_/g, ' ')} — ${oppName(c.opportunityId)}`,
      detail: `Status: ${c.status}. SLA ${c.slaHours}h${sla?.breached ? ' — BREACHED' : ''}`,
      refKind: 'CollaborationRequest', refId: c.id, opportunityId: c.opportunityId,
      overdue: !!sla?.breached, createdAt: c.createdAt,
      actions: ['approve', 'reject', 'reassign', 'escalate', 'add_comment', 'send_reminder', 'open_deal_room', 'mark_complete'],
    });
  }

  for (const q of db.quotationVersions.filter(v => ['draft', 'pending_finance'].includes(v.status))) {
    items.push({
      id: q.id, category: 'quotations',
      title: `Quotation v${q.version} ${q.status === 'pending_finance' ? 'awaiting Finance validation' : 'in preparation'} — ${oppName(q.opportunityId)}`,
      detail: `Quoted ₹${q.quotedPricePerTrip ?? '—'}/trip`,
      refKind: 'QuotationVersion', refId: q.id, opportunityId: q.opportunityId,
      overdue: false, createdAt: q.createdAt,
      actions: ['open_deal_room', 'send_reminder'],
    });
  }

  for (const f of db.followUps.filter(f => f.status !== 'done')) {
    const overdue = new Date(f.dueAt) < new Date();
    if (overdue && f.status === 'open') f.status = 'overdue';
    items.push({
      id: f.id, category: overdue ? 'overdue' : 'followups',
      title: `Follow-up ${overdue ? 'overdue' : 'due'} — ${f.reason}`,
      detail: f.suggestedAction ?? '',
      refKind: 'FollowUp', refId: f.id, opportunityId: f.opportunityId,
      overdue, createdAt: f.createdAt,
      actions: ['mark_complete', 'schedule_followup', 'contact_customer'],
    });
  }

  for (const e of db.escalations.filter(e => e.status === 'open')) {
    items.push({
      id: e.id, category: 'escalations',
      title: `Escalation — ${e.reason}`,
      detail: `Raised to ${e.raisedTo}`,
      refKind: 'Escalation', refId: e.id,
      overdue: true, createdAt: e.createdAt,
      actions: ['mark_complete', 'add_comment'],
    });
  }

  for (const g of db.customerGrowthOpportunities.filter(g => g.status === 'identified')) {
    const acc = db.accounts.find(a => a.id === g.accountId);
    items.push({
      id: g.id, category: 'recommendations',
      title: `Growth: ${g.kind.replace(/_/g, ' ')} at ${acc?.name}`,
      detail: g.description,
      refKind: 'CustomerGrowthOpportunity', refId: g.id,
      overdue: false, createdAt: g.createdAt,
      actions: ['create_opportunity', 'mark_complete'],
    });
  }

  return items.sort((a, b) => Number(b.overdue) - Number(a.overdue) || b.createdAt.localeCompare(a.createdAt));
}
