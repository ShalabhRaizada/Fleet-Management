import type { Store } from '../store/store.js';
import { uid, now } from '../store/store.js';
import type { Conversation, Opportunity } from '../domain/types.js';
import { parseIntent } from './intent.js';
import { buildDayPlan } from './dayPlanner.js';
import { createQuotationRequest, completePlanning } from './quotation.js';
import { sendToFinance, requestCommercialApproval, sendToLegal } from './approvals.js';
import { draftQuotationEmail } from './communications.js';
import { scheduleFollowUp } from './communications.js';
import { scanAccountGrowth } from './growth.js';
import { detectBlockers, ensureDealRoom } from './dealRoom.js';
import { proposeAmendment } from './contracts.js';
import { runAgent } from '../ai/agents.js';

export interface VoiceResult {
  reply: string;                 // spoken back to the salesperson
  intent: string;
  data?: unknown;                // structured payload for the UI
  suggestions?: string[];        // chips
  requiresPreview?: boolean;     // UI must show preview before external send
}

const DISCOVERY_QUESTIONS = [
  'Who are the key decision makers for this business?',
  'How do they run transport today — own fleet, market vehicles, or contracted carriers?',
  'What pain points do they have with the current setup?',
  'Which competitors are serving them, and at what pricing model?',
  'What monthly volume in metric tons are we targeting, and on which lanes?',
  'Are they open to LNG or EV vehicles?',
  'What is their buying timeline and expected start date?',
];

function nextDiscoveryQuestion(opp: Opportunity): string | null {
  if (!opp.currentTransportModel) return DISCOVERY_QUESTIONS[1];
  if (!opp.painPoints.length) return DISCOVERY_QUESTIONS[2];
  if (!opp.competitors.length) return DISCOVERY_QUESTIONS[3];
  if (!opp.lanes.length || !opp.volume?.tonsPerMonth) return DISCOVERY_QUESTIONS[4];
  if (!opp.sustainability) return DISCOVERY_QUESTIONS[5];
  if (!opp.buyingTimeline) return DISCOVERY_QUESTIONS[6];
  return null;
}

export function getOrCreateConversation(store: Store, ownerId: string, id?: string, opportunityId?: string): Conversation {
  let convo = id ? store.db.conversations.find(c => c.id === id) : undefined;
  if (!convo) {
    convo = { id: uid('cnv'), ownerId, opportunityId, purpose: 'general', turns: [], createdAt: now() };
    store.db.conversations.push(convo);
  }
  return convo;
}

export async function handleUtterance(store: Store, input: {
  userId: string; text: string; viaVoice?: boolean;
  conversationId?: string; opportunityId?: string; accountId?: string;
}): Promise<VoiceResult & { conversationId: string }> {
  const convo = getOrCreateConversation(store, input.userId, input.conversationId, input.opportunityId);
  convo.turns.push({ role: 'user', text: input.text, viaVoice: input.viaVoice, at: now() });
  const intent = parseIntent(input.text);

  const opp = input.opportunityId
    ? store.db.opportunities.find(o => o.id === input.opportunityId)
    : convo.opportunityId
      ? store.db.opportunities.find(o => o.id === convo.opportunityId)
      : undefined;

  const finish = (r: VoiceResult): VoiceResult & { conversationId: string } => {
    convo.turns.push({ role: 'assistant', text: r.reply, at: now() });
    store.save();
    return { ...r, conversationId: convo.id };
  };

  const findAccount = (name?: string) =>
    name ? store.db.accounts.find(a => a.name.toLowerCase().includes(name.toLowerCase().trim())) : undefined;

  switch (intent.kind) {
    case 'plan_day': {
      const plan = buildDayPlan(store, input.userId, input.text);
      return finish({
        intent: intent.kind,
        reply: plan.meetings.length
          ? `Planned ${plan.meetings.length} meetings. Route: ${plan.routeSummary}. Calendar blocked and reminders set.`
          : 'I could not identify any customer visits — try "Plan my day. Visit Tata Steel at Jamshedpur, then lunch with JSW."',
        data: plan,
        suggestions: ['Open Tata Steel', 'Record meeting', 'Show today\'s meetings'],
      });
    }

    case 'open_account': {
      const account = findAccount(intent.accountName);
      if (!account) return finish({ intent: intent.kind, reply: `I couldn't find an account named ${intent.accountName}.` });
      const opps = store.db.opportunities.filter(o => o.accountId === account.id);
      return finish({
        intent: intent.kind,
        reply: `${account.name}: ${opps.length} opportunit${opps.length === 1 ? 'y' : 'ies'}${opps[0] ? `, latest at ${opps[0].stage} stage` : ''}.`,
        data: { account, opportunities: opps },
        suggestions: ['Create opportunity', 'Ask for more lanes', 'What is blocking this deal'],
      });
    }

    case 'create_opportunity': {
      const account = findAccount(intent.accountName) ?? (input.accountId ? store.db.accounts.find(a => a.id === input.accountId) : undefined);
      if (!account) return finish({ intent: intent.kind, reply: 'Which customer is this opportunity for?' });
      const newOpp: Opportunity = {
        id: uid('opp'), accountId: account.id, name: `${account.name} — new business`,
        ownerId: input.userId, stage: 'discovery', probability: 20,
        painPoints: [], competitors: [], lanes: [], nextActions: ['Complete discovery interview'],
        createdAt: now(), updatedAt: now(),
      };
      store.db.opportunities.push(newOpp);
      ensureDealRoom(store, newOpp.id);
      convo.opportunityId = newOpp.id;
      convo.purpose = 'opportunity_discovery';
      store.audit(input.userId, 'Opportunity', newOpp.id, 'created');
      store.save();
      return finish({
        intent: intent.kind,
        reply: `Opportunity created for ${account.name}. Let's qualify it — ${DISCOVERY_QUESTIONS[1]}`,
        data: newOpp,
        suggestions: ['Add lane', 'Add commodity', 'Add volume', 'Customer wants LNG'],
      });
    }

    case 'add_lane': {
      if (!opp) return finish({ intent: intent.kind, reply: 'Which opportunity should I add this lane to? Open one first.' });
      if (!intent.origin || !intent.destination) {
        return finish({ intent: intent.kind, reply: 'Tell me the lane like "add lane Chennai to Pune".' });
      }
      const lane = {
        id: uid('lane'), origin: intent.origin, destination: intent.destination,
        intermediateStops: [], multiPick: false, multiDrop: false,
      };
      opp.lanes.push(lane);
      if (intent.tonsPerMonth) opp.volume = { ...(opp.volume ?? { commodity: 'other' }), tonsPerMonth: intent.tonsPerMonth };
      opp.updatedAt = now();
      store.audit(input.userId, 'Opportunity', opp.id, 'lane_added', { lane: `${lane.origin}->${lane.destination}` });
      store.save();
      const q = nextDiscoveryQuestion(opp);
      return finish({
        intent: intent.kind,
        reply: `Lane ${lane.origin} to ${lane.destination} added${intent.tonsPerMonth ? ` with ${intent.tonsPerMonth} tons per month` : ''}.${q ? ` ${q}` : ''}`,
        data: lane,
        suggestions: ['Add volume', 'Customer wants LNG', 'Send this lane to Network Planning for quotation'],
      });
    }

    case 'sustainability': {
      if (!opp) return finish({ intent: intent.kind, reply: 'Open an opportunity first.' });
      const s = opp.sustainability ?? { openTo: [], rejected: [] };
      if (intent.sentiment === 'wants' && !s.openTo.includes(intent.preference)) s.openTo.push(intent.preference);
      if (intent.sentiment === 'rejected' && !s.rejected.includes(intent.preference)) s.rejected.push(intent.preference);
      s.openTo = s.openTo.filter(p => !s.rejected.includes(p));
      opp.sustainability = s;
      opp.updatedAt = now();
      store.save();
      return finish({
        intent: intent.kind,
        reply: `Noted — customer ${intent.sentiment === 'wants' ? 'is open to' : 'rejected'} ${intent.preference.toUpperCase()}.`,
        data: s,
        suggestions: ['Estimate monthly fleet', 'Send this lane to Network Planning for quotation'],
      });
    }

    case 'estimate_fleet': {
      if (!opp?.lanes.length || !opp.volume?.tonsPerMonth) {
        return finish({ intent: intent.kind, reply: 'I need a lane and monthly volume first — say "add lane Chennai to Pune, 600 tons per month".' });
      }
      const { computePlanningOutputs } = await import('./quotation.js');
      const est = computePlanningOutputs(opp, opp.lanes[0]);
      return finish({
        intent: intent.kind,
        reply: `Roughly ${est.vehicleRequirement} tractors and ${est.trailerRequirement} trailers for ${opp.volume.tonsPerMonth} tons per month, about ${est.monthlyTripCapacity} trips capacity.`,
        data: est,
      });
    }

    case 'request_quotation': {
      if (!opp) return finish({ intent: intent.kind, reply: 'Open or create an opportunity first, then ask me to send it to Network Planning.' });
      const { collab, quotationRequest, lane } = createQuotationRequest(store, {
        opportunityId: opp.id, requestedById: input.userId,
        origin: intent.origin, destination: intent.destination,
        tonsPerMonth: intent.tonsPerMonth, fuelPreference: intent.fuel,
        includeBackhaul: intent.backhaul, instructions: intent.instructions,
      });
      // Demo mode: the "planning team" responds instantly via the heuristic engine.
      const { version } = completePlanning(store, quotationRequest.id, 'network_planning');
      return finish({
        intent: intent.kind,
        reply: `Sent to Network Planning with all qualification data attached. They returned quotation v${version.version}: ` +
          `${lane.origin} to ${lane.destination}, ${version.planning.vehicleRequirement} vehicles, ` +
          `cost ₹${version.planning.costPerTrip} per trip, suggested price ₹${version.quotedPricePerTrip}. ` +
          `Say "send this quotation to Finance for validation" when ready.`,
        data: { collaborationRequest: collab, quotationVersion: version },
        suggestions: ['Send this quotation to Finance for validation'],
      });
    }

    case 'send_to_finance': {
      const qv = store.db.quotationVersions
        .filter(v => (!opp || v.opportunityId === opp.id) && v.status === 'draft')
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
      if (!qv) return finish({ intent: intent.kind, reply: 'No draft quotation found to send to Finance.' });
      const review = sendToFinance(store, qv.id, input.userId);
      return finish({
        intent: intent.kind,
        reply: `Quotation v${qv.version} sent to Finance. AI recommendation: ${review.aiRecommendation}`,
        data: review,
      });
    }

    case 'request_commercial_approval': {
      if (!opp) return finish({ intent: intent.kind, reply: 'Open an opportunity first.' });
      const kind = /discount/.test(intent.detail.toLowerCase()) ? 'discount'
        : /fuel/.test(intent.detail.toLowerCase()) ? 'fuel_escalation_exception'
        : /margin/.test(intent.detail.toLowerCase()) ? 'low_margin_bid' : 'special_pricing';
      const ca = requestCommercialApproval(store, opp.id, input.userId, kind, intent.detail);
      return finish({ intent: intent.kind, reply: `Commercial approval requested: ${kind.replace(/_/g, ' ')}.`, data: ca });
    }

    case 'send_to_legal': {
      const contract = store.db.contracts.find(c => (!opp || c.opportunityId === opp.id) && c.status !== 'terminated');
      if (!contract) return finish({ intent: intent.kind, reply: 'No contract found for this deal yet.' });
      const review = sendToLegal(store, contract.id, input.userId);
      return finish({ intent: intent.kind, reply: `Contract "${contract.title}" sent to Legal for review.`, data: review });
    }

    case 'send_quotation_to_customer': {
      const qv = store.db.quotationVersions
        .filter(v => (!opp || v.opportunityId === opp.id) && v.status === 'approved')
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
      if (!qv) {
        return finish({
          intent: intent.kind,
          reply: 'There is no finance-approved quotation to send. External quotations cannot go out before mandatory approvals are complete.',
        });
      }
      const { communication, preview } = await draftQuotationEmail(store, qv.id, input.userId, intent.proposeMeeting);
      return finish({
        intent: intent.kind,
        reply: 'Draft is ready — review the preview on screen, then confirm to send.',
        data: { communication, preview },
        requiresPreview: true,
      });
    }

    case 'schedule_followup': {
      const f = scheduleFollowUp(store, {
        ownerId: input.userId, accountId: opp?.accountId, opportunityId: opp?.id,
        reason: `Follow-up requested by voice${intent.when ? ` (${intent.when})` : ''}`,
        dueAt: new Date(Date.now() + 2 * 86400_000).toISOString(),
      });
      return finish({ intent: intent.kind, reply: 'Follow-up scheduled.', data: f });
    }

    case 'growth_scan': {
      const account = findAccount(intent.accountName) ?? (opp ? store.db.accounts.find(a => a.id === opp.accountId) : undefined);
      if (!account) return finish({ intent: intent.kind, reply: 'Which account should I analyse for growth?' });
      const found = scanAccountGrowth(store, account.id, input.userId);
      const all = store.db.customerGrowthOpportunities.filter(g => g.accountId === account.id && g.status === 'identified');
      return finish({
        intent: intent.kind,
        reply: all.length
          ? `Found ${all.length} growth opportunities at ${account.name}: ${all.slice(0, 3).map(g => g.kind.replace(/_/g, ' ')).join(', ')}${all.length > 3 ? ' and more' : ''}.`
          : `No new growth opportunities detected at ${account.name} right now.`,
        data: { new: found, all },
      });
    }

    case 'deal_blockers': {
      const target = intent.accountName
        ? store.db.opportunities.find(o => {
            const a = store.db.accounts.find(acc => acc.id === o.accountId);
            return a?.name.toLowerCase().includes(intent.accountName!.toLowerCase());
          })
        : opp;
      if (!target) return finish({ intent: intent.kind, reply: 'Which deal should I check?' });
      const blockers = detectBlockers(store, target.id);
      return finish({ intent: intent.kind, reply: blockers.join(' '), data: { opportunityId: target.id, blockers } });
    }

    case 'contract_amendment': {
      const contract = store.db.contracts.find(c => (!opp || c.opportunityId === opp.id || c.accountId === opp.accountId) && c.status !== 'terminated')
        ?? store.db.contracts[0];
      if (!contract) return finish({ intent: intent.kind, reply: 'No existing contract found to amend.' });
      const amendment = proposeAmendment(store, contract.id, input.userId, { proposedChange: intent.detail });
      return finish({
        intent: intent.kind,
        reply: `Amendment drafted against "${contract.title}" and routed for approval. The current version stays untouched until the amendment is applied.`,
        data: amendment,
      });
    }

    case 'record_meeting': {
      convo.purpose = 'meeting_record';
      return finish({
        intent: intent.kind,
        reply: 'Recording. Tell me who you met and what was discussed — I will turn it into CRM notes and next actions.',
        suggestions: ['Finish conversation'],
      });
    }

    case 'email_summary': {
      const summary = await runAgent('email', 'Draft a short internal summary email of today\'s activity.', {
        meetings: store.db.meetings.slice(-5), opportunity: opp,
      });
      return finish({
        intent: intent.kind,
        reply: summary ?? 'Summary email drafted (AI drafting unavailable offline — connect an Anthropic API key for rich drafts).',
        requiresPreview: true,
      });
    }

    case 'inbox_action':
      return finish({
        intent: intent.kind,
        reply: `Okay — apply "${intent.action.replace(/_/g, ' ')}" from the inbox item you have open.`,
        data: { action: intent.action },
      });

    default: {
      // Not a recognised command → conversational AI (interview / coach / Q&A).
      if (convo.purpose === 'meeting_record' && opp) {
        // Treat free text as meeting notes → CRM update.
        const account = store.db.accounts.find(a => a.id === opp.accountId);
        account?.notes.push(input.text);
        opp.nextActions.push('Review meeting notes and confirm next steps');
        opp.updatedAt = now();
        store.audit(input.userId, 'Opportunity', opp.id, 'meeting_notes_captured');
        store.save();
        const ai = await runAgent('crm', 'Extract CRM updates and next actions from these meeting notes.', { notes: input.text, opportunity: opp.name });
        return finish({
          intent: 'meeting_notes',
          reply: ai ?? 'Captured in CRM. Anything else from the meeting?',
        });
      }
      if (opp) {
        const q = nextDiscoveryQuestion(opp);
        const ai = await runAgent('conversation', input.text, {
          opportunity: opp, account: store.db.accounts.find(a => a.id === opp.accountId)?.name,
        });
        return finish({
          intent: 'conversation',
          reply: ai ?? (q ?? 'Qualification looks complete. Say "send this lane to Network Planning for quotation" when ready.'),
          suggestions: ['Add lane', 'Add volume', 'Add pricing', 'Finish conversation'],
        });
      }
      const ai = await runAgent('conversation', input.text);
      return finish({
        intent: 'conversation',
        reply: ai ?? 'You can say things like "Plan my day", "Open Tata Steel", "Create opportunity", or "Record meeting".',
        suggestions: ['Plan my day', 'Open Tata Steel', 'Create opportunity', 'Record meeting'],
      });
    }
  }
}
