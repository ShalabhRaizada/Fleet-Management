import type { Store } from '../store/store.js';
import { uid, now } from '../store/store.js';
import type { CustomerCommunication, FollowUp } from '../domain/types.js';
import { assertQuotationSendable } from './approvals.js';
import { logDealRoom } from './dealRoom.js';
import { createNotification } from './inbox.js';
import { runAgent } from '../ai/claude.js';

// Drafts (never auto-sends) a customer quotation email. The draft is returned
// for on-screen preview — sending is a separate explicit call (criteria 5 & 15).
export async function draftQuotationEmail(store: Store, quotationVersionId: string, actor: string, proposeMeeting?: string) {
  const qv = assertQuotationSendable(store, quotationVersionId); // throws if approvals incomplete
  const opp = store.db.opportunities.find(o => o.id === qv.opportunityId)!;
  const account = store.db.accounts.find(a => a.id === opp.accountId)!;
  const contact = store.db.contacts.find(c => c.accountId === account.id && c.decisionMaker)
    ?? store.db.contacts.find(c => c.accountId === account.id);
  const lane = opp.lanes[0];

  const fallbackBody =
    `Dear ${contact?.name ?? 'Sir/Madam'},\n\n` +
    `Thank you for the opportunity to serve ${account.name}. Please find attached our approved quotation ` +
    `for the ${lane ? `${lane.origin} → ${lane.destination}` : ''} lane at ₹${qv.quotedPricePerTrip}/trip ` +
    `(${qv.pricingModel?.replace(/_/g, ' ')}), valid until ${qv.validUntil?.slice(0, 10)}.\n\n` +
    (proposeMeeting ? `Could we meet on ${proposeMeeting} to walk through the proposal?\n\n` : '') +
    `Warm regards`;

  const aiBody = await runAgent('email',
    `Draft a quotation email to ${contact?.name ?? 'the customer'} at ${account.name}.` +
    (proposeMeeting ? ` Propose a meeting on ${proposeMeeting}.` : ''),
    { quotation: qv, lane, account: account.name });

  const comm: CustomerCommunication = {
    id: uid('cmm'),
    accountId: account.id,
    opportunityId: opp.id,
    channel: 'email',
    direction: 'outbound',
    subject: `Quotation — ${account.name} ${lane ? `${lane.origin}–${lane.destination}` : ''} (v${qv.version})`,
    body: aiBody ?? fallbackBody,
    attachments: [`quotation-v${qv.version}.pdf`, 'route-plan.pdf'],
    quotationVersionId: qv.id,
    status: 'pending_preview',
    createdAt: now(),
  };
  store.db.customerCommunications.push(comm);
  store.audit(actor, 'CustomerCommunication', comm.id, 'drafted', { quotationVersionId });
  store.save();
  return {
    communication: comm,
    preview: {
      recipient: contact ? `${contact.name} <${contact.email ?? 'no-email'}>` : account.name,
      subject: comm.subject,
      body: comm.body,
      attachments: comm.attachments,
      approvedPricingVersion: `v${qv.version} — ₹${qv.quotedPricePerTrip}/trip`,
      validityPeriod: qv.validUntil,
      disclaimer: 'Rates subject to fuel index escalation and approved commercial terms.',
    },
  };
}

// Explicit confirm step after preview.
export function sendCommunication(store: Store, communicationId: string, actor: string) {
  const comm = store.db.customerCommunications.find(c => c.id === communicationId);
  if (!comm) throw new Error('Communication not found');
  if (comm.status === 'sent') throw new Error('Already sent');
  if (comm.quotationVersionId) {
    const qv = assertQuotationSendable(store, comm.quotationVersionId); // re-check gate at send time
    qv.status = 'sent_to_customer';
  }
  comm.status = 'sent';
  if (comm.opportunityId) {
    logDealRoom(store, comm.opportunityId, 'communication', comm.id, `Email sent: ${comm.subject}`);
    const opp = store.db.opportunities.find(o => o.id === comm.opportunityId)!;
    if (opp.stage === 'quotation') opp.stage = 'negotiation';
    scheduleFollowUp(store, {
      ownerId: opp.ownerId, accountId: comm.accountId, opportunityId: opp.id,
      reason: 'Quotation submitted — follow up with customer',
      dueAt: new Date(Date.now() + 3 * 86400_000).toISOString(),
      suggestedAction: 'Call the customer to confirm receipt and gauge reaction to pricing.',
    });
  }
  createNotification(store, actor, 'Email sent', comm.subject ?? '', 'CustomerCommunication', comm.id);
  store.audit(actor, 'CustomerCommunication', comm.id, 'sent');
  store.save();
  return comm;
}

export function recordInbound(store: Store, input: { accountId: string; opportunityId?: string; body: string; subject?: string }) {
  const comm: CustomerCommunication = {
    id: uid('cmm'), accountId: input.accountId, opportunityId: input.opportunityId,
    channel: 'email', direction: 'inbound', subject: input.subject, body: input.body,
    attachments: [], status: 'received', createdAt: now(),
  };
  store.db.customerCommunications.push(comm);
  if (input.opportunityId) logDealRoom(store, input.opportunityId, 'communication', comm.id, `Customer replied: ${input.subject ?? ''}`);
  store.save();
  return comm;
}

export function scheduleFollowUp(store: Store, input: {
  ownerId: string; accountId?: string; opportunityId?: string;
  reason: string; dueAt: string; suggestedAction?: string;
}): FollowUp {
  const f: FollowUp = { id: uid('flw'), status: 'open', createdAt: now(), ...input };
  store.db.followUps.push(f);
  store.audit(input.ownerId, 'FollowUp', f.id, 'created');
  store.save();
  return f;
}
