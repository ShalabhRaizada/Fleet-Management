import { describe, it, expect, beforeEach } from 'vitest';
import { Store } from '../src/store/store.js';
import { seed } from '../src/store/seed.js';
import { parseIntent } from '../src/services/intent.js';
import { parseDayUtterance, buildDayPlan } from '../src/services/dayPlanner.js';
import { createQuotationRequest, completePlanning } from '../src/services/quotation.js';
import { sendToFinance, decideFinanceReview, assertQuotationSendable } from '../src/services/approvals.js';
import { draftQuotationEmail, sendCommunication } from '../src/services/communications.js';
import { createContract, proposeAmendment, applyAmendment, contractHistory } from '../src/services/contracts.js';
import { detectBlockers, ensureDealRoom } from '../src/services/dealRoom.js';
import { scanAccountGrowth } from '../src/services/growth.js';
import { sweepSLAs } from '../src/services/sla.js';
import { handleUtterance } from '../src/services/conversation.js';

let store: Store;
beforeEach(() => {
  store = new Store(); // in-memory
  seed(store);
});

const OPP = 'opp_tata1';
const USER = 'user_sales1';

describe('intent parser', () => {
  it('parses a quotation request with lane, volume, fuel and backhaul', () => {
    const i = parseIntent('Ask Network Planning to prepare a quotation for Chennai to Pune, 600 metric tons per month, using LNG tractors. Include a backhaul option.');
    expect(i.kind).toBe('request_quotation');
    if (i.kind === 'request_quotation') {
      expect(i.origin).toBe('Chennai');
      expect(i.destination).toBe('Pune');
      expect(i.tonsPerMonth).toBe(600);
      expect(i.fuel).toBe('lng');
      expect(i.backhaul).toBe(true);
    }
  });

  it('parses sustainability signals', () => {
    expect(parseIntent('Customer wants LNG')).toMatchObject({ kind: 'sustainability', preference: 'lng', sentiment: 'wants' });
    expect(parseIntent('Customer rejected EV')).toMatchObject({ kind: 'sustainability', preference: 'ev', sentiment: 'rejected' });
  });

  it('parses core commands', () => {
    expect(parseIntent('Plan my day').kind).toBe('plan_day');
    expect(parseIntent('Open Tata Steel')).toMatchObject({ kind: 'open_account', accountName: 'Tata Steel' });
    expect(parseIntent('Send this quotation to Finance for validation').kind).toBe('send_to_finance');
    expect(parseIntent('Send the approved quotation to the customer and propose a meeting on Friday'))
      .toMatchObject({ kind: 'send_quotation_to_customer', proposeMeeting: 'Friday' });
    expect(parseIntent("What is blocking the Tata Steel opportunity?").kind).toBe('deal_blockers');
    expect(parseIntent('Add this new lane to the existing customer contract').kind).toBe('contract_amendment');
  });
});

describe('plan my day', () => {
  it('extracts sequenced stops with meeting types', () => {
    const stops = parseDayUtterance('Today I want to visit Tata Steel at Jamshedpur. Then UltraTech at Kharagpur. Lunch with JSW. Evening Teams call with Pepsi.');
    expect(stops.length).toBe(4);
    expect(stops[0]).toMatchObject({ customer: 'Tata Steel', location: 'Jamshedpur', type: 'face_to_face' });
    expect(stops[2].type).toBe('lunch');
    expect(stops[3].type).toBe('teams');
  });

  it('builds a plan with travel time and agendas', () => {
    const plan = buildDayPlan(store, USER, 'Visit Tata Steel at Jamshedpur. Then UltraTech at Kharagpur.');
    expect(plan.meetings.length).toBe(2);
    expect(plan.meetings[1].travelMinutesFromPrevious).toBeGreaterThan(0);
    expect(plan.meetings[0].agenda.length).toBeGreaterThan(0);
    expect(plan.routeSummary).toContain('Jamshedpur');
  });
});

describe('quotation workflow (criteria 1, 2, 3)', () => {
  it('attaches full qualification data to the planning request', () => {
    const { collab } = createQuotationRequest(store, {
      opportunityId: OPP, requestedById: USER, includeBackhaul: true, instructions: 'test',
    });
    const p = collab.payload as Record<string, unknown>;
    expect(p.volume).toBeDefined();
    expect(p.sustainability).toBeDefined();
    expect(p.commercial).toBeDefined();
    expect(p.lane).toBeDefined();
    expect((p.opportunity as { probability: number }).probability).toBe(65);
  });

  it('planning completion produces structured outputs and costing', () => {
    const { quotationRequest } = createQuotationRequest(store, {
      opportunityId: OPP, requestedById: USER, includeBackhaul: true, instructions: 'test',
    });
    const { version, costing } = completePlanning(store, quotationRequest.id, 'planner1');
    expect(version.planning.vehicleRequirement).toBeGreaterThan(0);
    expect(version.planning.costPerTrip).toBeGreaterThan(0);
    expect(version.planning.recommendedPriceRange!.min).toBeGreaterThan(version.planning.costPerTrip!);
    expect(costing.grossMarginPct).toBeGreaterThan(0);
  });
});

describe('finance approval + external send gate (criteria 4, 5, 15)', () => {
  function makeQuotation() {
    const { quotationRequest } = createQuotationRequest(store, {
      opportunityId: OPP, requestedById: USER, includeBackhaul: true, instructions: 'test',
    });
    return completePlanning(store, quotationRequest.id, 'planner1').version;
  }

  it('blocks external send before finance approval', async () => {
    const version = makeQuotation();
    expect(() => assertQuotationSendable(store, version.id)).toThrow(/cannot be sent/);
    await expect(draftQuotationEmail(store, version.id, USER)).rejects.toThrow(/cannot be sent/);
  });

  it('finance can approve, reject or conditionally approve; audit trail is kept', () => {
    const version = makeQuotation();
    const review = sendToFinance(store, version.id, USER);
    expect(review.aiRecommendation).toBeTruthy();
    const decision = decideFinanceReview(store, review.id, {
      reviewerId: 'user_fin1', decision: 'approved_with_conditions',
      conditions: ['Reduce credit days to 45'], comments: 'Conditional approval',
    });
    expect(store.db.quotationVersions.find(v => v.id === version.id)!.status).toBe('approved');
    expect(store.db.approvalDecisions.some(d => d.id === decision.id)).toBe(true);
    expect(store.db.auditEvents.some(e => e.entityId === decision.id && e.action === 'approved_with_conditions')).toBe(true);
  });

  it('allows send after approval, records communication, and blocks double-send', async () => {
    const version = makeQuotation();
    const review = sendToFinance(store, version.id, USER);
    decideFinanceReview(store, review.id, { reviewerId: 'user_fin1', decision: 'approved' });
    const { communication, preview } = await draftQuotationEmail(store, version.id, USER, 'Friday');
    expect(communication.status).toBe('pending_preview'); // preview gate — nothing sent yet
    expect(preview.recipient).toContain('Sharma');
    const sent = sendCommunication(store, communication.id, USER);
    expect(sent.status).toBe('sent');
    expect(store.db.quotationVersions.find(v => v.id === version.id)!.status).toBe('sent_to_customer');
    // A follow-up is auto-created (criterion: follow-up after quotation submission)
    expect(store.db.followUps.some(f => f.opportunityId === OPP)).toBe(true);
    expect(() => sendCommunication(store, communication.id, USER)).toThrow(/Already sent/);
  });

  it('finance rejection keeps the quotation unsendable', () => {
    const version = makeQuotation();
    const review = sendToFinance(store, version.id, USER);
    decideFinanceReview(store, review.id, { reviewerId: 'user_fin1', decision: 'rejected', comments: 'Margin too low' });
    expect(() => assertQuotationSendable(store, version.id)).toThrow();
  });
});

describe('contract versioning (criteria 8, 12)', () => {
  it('amendments append new versions and never overwrite history', () => {
    const { contract, version } = createContract(store, {
      accountId: store.db.accounts[0].id, title: 'Test contract', body: 'ORIGINAL BODY', actor: USER,
    });
    const originalBody = version.body;
    const amendment = proposeAmendment(store, contract.id, USER, { proposedChange: 'Add Chennai–Pune lane at approved rate from 1 August' });
    const v2 = applyAmendment(store, amendment.id, USER);

    expect(v2.version).toBe(2);
    const history = contractHistory(store, contract.id);
    expect(history.versions.length).toBe(2);
    expect(history.versions[0].body).toBe(originalBody);            // v1 untouched
    expect(history.versions[1].body).toContain('Chennai–Pune');
    expect(history.contract!.currentVersion).toBe(2);
    expect(history.audit.length).toBeGreaterThan(0);                // audit trail exists
    expect(() => applyAmendment(store, amendment.id, USER)).toThrow(/already applied/);
  });
});

describe('deal room + blockers (criteria 9, 10)', () => {
  it('creates one deal room per opportunity and detects blockers', () => {
    const r1 = ensureDealRoom(store, OPP);
    const r2 = ensureDealRoom(store, OPP);
    expect(r1.id).toBe(r2.id);

    const { quotationRequest } = createQuotationRequest(store, {
      opportunityId: OPP, requestedById: USER, includeBackhaul: false, instructions: 'test',
    });
    const { version } = completePlanning(store, quotationRequest.id, 'planner1');
    sendToFinance(store, version.id, USER);

    const blockers = detectBlockers(store, OPP);
    expect(blockers.join(' ')).toMatch(/Finance approval is? pending|Finance approval pending/);
    expect(blockers.join(' ')).toMatch(/credit term|45/);
  });
});

describe('growth scan (criterion 7)', () => {
  it('finds backhaul / LNG / dedicated fleet opportunities', () => {
    const acc = store.db.opportunities.find(o => o.id === OPP)!.accountId;
    const found = scanAccountGrowth(store, acc, USER);
    const kinds = found.map(g => g.kind);
    expect(kinds).toContain('backhaul');
    expect(kinds).toContain('lng_conversion');
    expect(kinds).toContain('dedicated_fleet');
  });
});

describe('SLA reminders and escalation (criterion 11)', () => {
  it('reminds then escalates overdue requests', () => {
    const { collab } = createQuotationRequest(store, {
      opportunityId: OPP, requestedById: USER, includeBackhaul: false, instructions: 'test',
    });
    // Force overdue
    const sla = store.db.workflowSLAs.find(w => w.requestId === collab.id)!;
    sla.dueAt = new Date(Date.now() - 3600_000).toISOString();

    const first = sweepSLAs(store);
    expect(first).toContainEqual({ requestId: collab.id, action: 'reminded' });
    const second = sweepSLAs(store);
    expect(second).toContainEqual({ requestId: collab.id, action: 'escalated' });
    expect(store.db.escalations.some(e => e.requestId === collab.id && e.status === 'open')).toBe(true);
  });
});

describe('end-to-end voice flow (criteria 1, 13, 14)', () => {
  it('runs quotation → finance → customer send entirely through utterances', async () => {
    const r1 = await handleUtterance(store, {
      userId: USER, opportunityId: OPP, viaVoice: true,
      text: 'Ask Network Planning to prepare a quotation for Jamshedpur to Kolkata, 1200 metric tons per month, using LNG tractors. Include a backhaul option.',
    });
    expect(r1.intent).toBe('request_quotation');

    // Attempt customer send before finance — must be refused.
    const blocked = await handleUtterance(store, {
      userId: USER, opportunityId: OPP, conversationId: r1.conversationId,
      text: 'Send the approved quotation to the customer and propose a meeting on Friday',
    });
    expect(blocked.reply).toMatch(/cannot go out|no finance-approved/i);

    // Switch from voice to text mid-conversation without losing context (criterion 14).
    const r2 = await handleUtterance(store, {
      userId: USER, opportunityId: OPP, conversationId: r1.conversationId, viaVoice: false,
      text: 'Send this quotation to Finance for validation',
    });
    expect(r2.intent).toBe('send_to_finance');

    const review = store.db.financeReviews.at(-1)!;
    decideFinanceReview(store, review.id, { reviewerId: 'user_fin1', decision: 'approved' });

    const r3 = await handleUtterance(store, {
      userId: USER, opportunityId: OPP, conversationId: r1.conversationId, viaVoice: true,
      text: 'Send the approved quotation to the customer and propose a meeting on Friday',
    });
    expect(r3.requiresPreview).toBe(true);   // criterion 15: always previewable
    const convo = store.db.conversations.find(c => c.id === r1.conversationId)!;
    expect(convo.turns.length).toBeGreaterThanOrEqual(8); // full context retained
  });
});
