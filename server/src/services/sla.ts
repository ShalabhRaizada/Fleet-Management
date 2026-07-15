import type { Store } from '../store/store.js';
import { uid, now } from '../store/store.js';
import type { CollaborationRequest } from '../domain/types.js';
import { createNotification } from './inbox.js';

export function armSLA(store: Store, request: CollaborationRequest) {
  const dueAt = new Date(Date.now() + request.slaHours * 3600_000).toISOString();
  store.db.workflowSLAs.push({ id: uid('sla'), requestId: request.id, dueAt, breached: false });
}

// Sweeps all armed SLAs: overdue → reminder, then escalation (acceptance criterion 11).
export function sweepSLAs(store: Store) {
  const results: { requestId: string; action: 'reminded' | 'escalated' }[] = [];
  for (const w of store.db.workflowSLAs) {
    const req = store.db.collaborationRequests.find(c => c.id === w.requestId);
    if (!req || ['completed', 'cancelled'].includes(req.status)) continue;
    if (new Date(w.dueAt) > new Date()) continue;

    if (!w.remindedAt) {
      w.remindedAt = now();
      createNotification(store, req.assignedTeamId, 'SLA reminder',
        `Request ${req.id} (${req.kind}) is past its ${req.slaHours}h SLA.`, 'CollaborationRequest', req.id);
      store.audit('system', 'WorkflowSLA', w.id, 'reminder_sent');
      results.push({ requestId: req.id, action: 'reminded' });
    } else if (!w.breached) {
      w.breached = true;
      const esc = {
        id: uid('esc'), requestId: req.id,
        reason: `SLA breach: ${req.kind} request open beyond ${req.slaHours}h`,
        raisedTo: 'leadership' as const, status: 'open' as const, createdAt: now(),
      };
      store.db.escalations.push(esc);
      w.escalationId = esc.id;
      createNotification(store, req.requestedById, 'SLA breached — escalated',
        `Request ${req.id} escalated to leadership.`, 'Escalation', esc.id);
      store.audit('system', 'Escalation', esc.id, 'created', { requestId: req.id });
      results.push({ requestId: req.id, action: 'escalated' });
    }
  }
  if (results.length) store.save();
  return results;
}
