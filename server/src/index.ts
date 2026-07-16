import express from 'express';
import cors from 'cors';
import path from 'node:path';

// Load server/.env if present (ANTHROPIC_API_KEY, PORT, DATA_FILE).
// Uses Node's built-in loader — no dotenv dependency needed.
try { process.loadEnvFile(); } catch { /* no .env file — fine */ }
import { Store } from './store/store.js';
import { seed } from './store/seed.js';
import { handleUtterance } from './services/conversation.js';
import { buildDayPlan } from './services/dayPlanner.js';
import { createQuotationRequest, completePlanning } from './services/quotation.js';
import {
  sendToFinance, decideFinanceReview, requestCommercialApproval,
  decideCommercialApproval, sendToLegal, recordDecision,
} from './services/approvals.js';
import { draftQuotationEmail, sendCommunication, recordInbound, scheduleFollowUp } from './services/communications.js';
import { dealRoomSummary, detectBlockers } from './services/dealRoom.js';
import { buildInbox } from './services/inbox.js';
import { sweepSLAs } from './services/sla.js';
import { scanAccountGrowth } from './services/growth.js';
import { createContract, proposeAmendment, applyAmendment, contractHistory } from './services/contracts.js';
import { commandCentreMetrics } from './services/commandCentre.js';
import { runAgent, anthropicAvailable, type AgentName } from './ai/claude.js';

const DATA_FILE = process.env.DATA_FILE ?? path.join(process.cwd(), 'data', 'db.json');
const store = new Store(DATA_FILE);
seed(store);

const app = express();
app.use(cors());
app.use(express.json());

const ok = (res: express.Response, data: unknown) => res.json({ ok: true, data });
const wrap = (fn: (req: express.Request, res: express.Response) => unknown | Promise<unknown>): express.RequestHandler =>
  async (req, res) => {
    try {
      await fn(req, res);
    } catch (e) {
      res.status(400).json({ ok: false, error: (e as Error).message });
    }
  };

app.get('/api/health', (_req, res) => ok(res, { status: 'up', ai: anthropicAvailable() ? 'claude-opus-4-8' : 'rule-based fallback' }));

// ---- Voice / conversation ----
app.post('/api/voice', wrap(async (req, res) => {
  const { userId = 'user_sales1', text, viaVoice, conversationId, opportunityId, accountId } = req.body;
  if (!text) throw new Error('text required');
  ok(res, await handleUtterance(store, { userId, text, viaVoice, conversationId, opportunityId, accountId }));
}));
app.get('/api/conversations/:id', wrap((req, res) => ok(res, store.db.conversations.find(c => c.id === req.params.id))));

// ---- CRM ----
app.get('/api/accounts', wrap((_req, res) => ok(res, store.db.accounts)));
app.get('/api/accounts/:id', wrap((req, res) => ok(res, {
  account: store.db.accounts.find(a => a.id === req.params.id),
  contacts: store.db.contacts.filter(c => c.accountId === req.params.id),
  opportunities: store.db.opportunities.filter(o => o.accountId === req.params.id),
  contracts: store.db.contracts.filter(c => c.accountId === req.params.id),
  growth: store.db.customerGrowthOpportunities.filter(g => g.accountId === req.params.id),
})));
app.get('/api/opportunities', wrap((_req, res) => ok(res, store.db.opportunities)));
app.get('/api/opportunities/:id', wrap((req, res) => ok(res, dealRoomSummary(store, req.params.id))));
app.get('/api/opportunities/:id/blockers', wrap((req, res) => ok(res, detectBlockers(store, req.params.id))));

// ---- Day planning / calendar ----
app.post('/api/day-plan', wrap((req, res) => ok(res, buildDayPlan(store, req.body.userId ?? 'user_sales1', req.body.text))));
app.get('/api/meetings', wrap((_req, res) => ok(res, store.db.meetings)));

// ---- Network planning quotations ----
app.post('/api/quotation-requests', wrap((req, res) => ok(res, createQuotationRequest(store, req.body))));
app.post('/api/quotation-requests/:id/complete', wrap((req, res) =>
  ok(res, completePlanning(store, req.params.id, req.body.actor ?? 'network_planning', req.body.overrides))));
app.get('/api/quotations', wrap((_req, res) => ok(res, store.db.quotationVersions)));

// ---- Approvals ----
app.post('/api/finance-reviews', wrap((req, res) => ok(res, sendToFinance(store, req.body.quotationVersionId, req.body.requestedById ?? 'user_sales1'))));
app.get('/api/finance-reviews', wrap((_req, res) => ok(res, store.db.financeReviews)));
app.post('/api/finance-reviews/:id/decision', wrap((req, res) => ok(res, decideFinanceReview(store, req.params.id, req.body))));
app.post('/api/commercial-approvals', wrap((req, res) =>
  ok(res, requestCommercialApproval(store, req.body.opportunityId, req.body.requestedById ?? 'user_sales1', req.body.kind, req.body.detail))));
app.post('/api/commercial-approvals/:id/decision', wrap((req, res) => ok(res, decideCommercialApproval(store, req.params.id, req.body))));
app.post('/api/legal-reviews', wrap((req, res) => ok(res, sendToLegal(store, req.body.contractId, req.body.requestedById ?? 'user_sales1'))));
app.post('/api/requests/:id/decision', wrap((req, res) => { const d = recordDecision(store, req.params.id, req.body); store.save(); ok(res, d); }));
app.get('/api/approval-decisions', wrap((_req, res) => ok(res, store.db.approvalDecisions)));

// ---- Customer communications (preview → confirm send) ----
app.post('/api/communications/quotation-draft', wrap(async (req, res) =>
  ok(res, await draftQuotationEmail(store, req.body.quotationVersionId, req.body.actor ?? 'user_sales1', req.body.proposeMeeting))));
app.post('/api/communications/:id/send', wrap((req, res) => ok(res, sendCommunication(store, req.params.id, req.body.actor ?? 'user_sales1'))));
app.post('/api/communications/inbound', wrap((req, res) => ok(res, recordInbound(store, req.body))));
app.get('/api/communications', wrap((_req, res) => ok(res, store.db.customerCommunications)));

// ---- Follow-ups ----
app.post('/api/follow-ups', wrap((req, res) => ok(res, scheduleFollowUp(store, req.body))));
app.get('/api/follow-ups', wrap((_req, res) => ok(res, store.db.followUps)));

// ---- Contracts ----
app.post('/api/contracts', wrap((req, res) => ok(res, createContract(store, req.body))));
app.get('/api/contracts', wrap((_req, res) => ok(res, store.db.contracts)));
app.get('/api/contracts/:id/history', wrap((req, res) => ok(res, contractHistory(store, req.params.id))));
app.post('/api/contracts/:id/amendments', wrap((req, res) => ok(res, proposeAmendment(store, req.params.id, req.body.actor ?? 'user_sales1', req.body))));
app.post('/api/amendments/:id/apply', wrap((req, res) => ok(res, applyAmendment(store, req.params.id, req.body.actor ?? 'user_sales1'))));

// ---- Growth ----
app.post('/api/accounts/:id/growth-scan', wrap((req, res) => ok(res, scanAccountGrowth(store, req.params.id, req.body?.actor ?? 'user_sales1'))));

// ---- Inbox / notifications / SLA ----
app.get('/api/inbox', wrap((req, res) => ok(res, buildInbox(store, String(req.query.userId ?? 'user_sales1')))));
app.get('/api/notifications', wrap((_req, res) => ok(res, store.db.notifications)));
app.post('/api/sla/sweep', wrap((_req, res) => ok(res, sweepSLAs(store))));

// ---- Command centre & audit ----
app.get('/api/command-centre', wrap((_req, res) => ok(res, commandCentreMetrics(store))));
app.get('/api/audit', wrap((req, res) => ok(res, req.query.entityId
  ? store.db.auditEvents.filter(e => e.entityId === req.query.entityId)
  : store.db.auditEvents)));

// ---- Direct agent access (AI panel) ----
app.post('/api/agents/:name', wrap(async (req, res) => {
  const name = req.params.name as AgentName;
  const out = await runAgent(name, req.body.text, req.body.context);
  ok(res, { agent: name, reply: out ?? 'AI unavailable — set ANTHROPIC_API_KEY for Claude-powered agents.' });
}));

// SLA sweep every 5 minutes.
setInterval(() => sweepSLAs(store), 5 * 60_000).unref();

const PORT = Number(process.env.PORT ?? 4000);
app.listen(PORT, () => {
  console.log(`Fleet sales-enablement API on :${PORT} (AI: ${anthropicAvailable() ? 'claude-opus-4-8' : 'rule-based fallback'})`);
});
