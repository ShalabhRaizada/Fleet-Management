import type { Store } from '../store/store.js';
import { uid, now } from '../store/store.js';
import type {
  ApprovalDecision, ApprovalDecisionValue, ApprovalStep, CollaborationRequest,
  CommercialApproval, FinanceReview, LegalReview, QuotationVersion,
} from '../domain/types.js';
import { createNotification } from './inbox.js';
import { armSLA } from './sla.js';
import { logDealRoom } from './dealRoom.js';

function makeCollab(store: Store, kind: CollaborationRequest['kind'], opportunityId: string, accountId: string,
  requestedById: string, teamKind: 'finance' | 'commercial' | 'legal', payload: Record<string, unknown>): CollaborationRequest {
  const team = store.db.internalTeams.find(t => t.kind === teamKind)!;
  const sla = store.db.slas.find(s => s.appliesToKind === kind);
  const collab: CollaborationRequest = {
    id: uid('req'), kind, opportunityId, accountId, requestedById,
    assignedTeamId: team.id, priority: 'high', status: 'submitted',
    slaHours: sla?.hours ?? 24, payload, createdAt: now(), updatedAt: now(),
  };
  store.db.collaborationRequests.push(collab);
  armSLA(store, collab);
  createNotification(store, team.id, `New ${kind.replace(/_/g, ' ')} request`, `Opportunity ${opportunityId}`, 'CollaborationRequest', collab.id);
  return collab;
}

// ---- Finance review -------------------------------------------------------

export function sendToFinance(store: Store, quotationVersionId: string, requestedById: string): FinanceReview {
  const qv = store.db.quotationVersions.find(v => v.id === quotationVersionId);
  if (!qv) throw new Error('Quotation version not found');
  const opp = store.db.opportunities.find(o => o.id === qv.opportunityId)!;
  const account = store.db.accounts.find(a => a.id === opp.accountId)!;
  const costing = store.db.costingVersions.find(c => c.quotationVersionId === qv.id);
  const creditDays = opp.commercial?.creditDays ?? account.creditDays ?? 30;
  const margin = costing?.grossMarginPct;

  const collab = makeCollab(store, 'finance_review', opp.id, account.id, requestedById, 'finance', {
    quotationVersionId: qv.id, quotedPricePerTrip: qv.quotedPricePerTrip,
    costPerTrip: qv.planning.costPerTrip, grossMarginPct: margin, creditDays,
  });

  const review: FinanceReview = {
    id: uid('fin'),
    quotationVersionId: qv.id,
    collaborationRequestId: collab.id,
    grossMarginPct: margin,
    creditDays,
    workingCapitalImpact: creditDays > 45 ? `High — ${creditDays} credit days ties up working capital` : 'Moderate',
    customerCreditRisk: (account.outstandingAmount ?? 0) > (account.creditLimit ?? Infinity) ? 'high' : creditDays > 45 ? 'medium' : 'low',
    minimumAcceptablePrice: qv.planning.costPerTrip ? Math.round(qv.planning.costPerTrip * 1.08) : undefined,
    exceptions: creditDays > 45 ? [`Credit days ${creditDays} exceed standard 45`] : [],
    aiRecommendation: creditDays > 45
      ? `Approve only if payment terms are reduced from ${creditDays} to 45 days.`
      : (margin ?? 0) < 10 ? 'Margin below 10% — recommend revised price or management approval.' : 'Within policy — recommend approval.',
    createdAt: now(),
  };
  store.db.financeReviews.push(review);

  qv.status = 'pending_finance';
  const step: ApprovalStep = {
    id: uid('step'), requestId: collab.id, order: 1,
    approverTeamId: collab.assignedTeamId, status: 'pending',
  };
  store.db.approvalSteps.push(step);
  logDealRoom(store, opp.id, 'approval', review.id, `Finance review requested for quotation v${qv.version}`);
  store.audit(requestedById, 'FinanceReview', review.id, 'created');
  store.save();
  return review;
}

export interface DecisionInput {
  reviewerId: string;
  decision: ApprovalDecisionValue;
  comments?: string;
  conditions?: string[];
  revisedValues?: Record<string, unknown>;
  voiceTranscript?: string;
}

export function decideFinanceReview(store: Store, financeReviewId: string, input: DecisionInput): ApprovalDecision {
  const review = store.db.financeReviews.find(r => r.id === financeReviewId);
  if (!review) throw new Error('Finance review not found');
  const decision = recordDecision(store, review.collaborationRequestId, input);
  review.decision = input.decision;

  const qv = store.db.quotationVersions.find(v => v.id === review.quotationVersionId)!;
  if (input.decision === 'approved' || input.decision === 'approved_with_conditions') {
    qv.status = 'approved';
  } else if (input.decision === 'rejected') {
    qv.status = 'finance_rejected';
  } else if (input.decision === 'returned' || input.decision === 'revised_price_recommended') {
    qv.status = 'draft';
  }
  const opp = store.db.opportunities.find(o => o.id === qv.opportunityId)!;
  createNotification(store, opp.ownerId, `Finance ${input.decision.replace(/_/g, ' ')}`,
    `Quotation v${qv.version}: ${input.comments ?? ''}`, 'QuotationVersion', qv.id);
  logDealRoom(store, opp.id, 'approval', decision.id, `Finance decision: ${input.decision}`);
  store.save();
  return decision;
}

// ---- Commercial approval --------------------------------------------------

export function requestCommercialApproval(store: Store, opportunityId: string, requestedById: string,
  kind: CommercialApproval['kind'], detail: string): CommercialApproval {
  const opp = store.db.opportunities.find(o => o.id === opportunityId);
  if (!opp) throw new Error('Opportunity not found');
  const collab = makeCollab(store, 'commercial_approval', opp.id, opp.accountId, requestedById, 'commercial', { kind, detail });
  const ca: CommercialApproval = {
    id: uid('com'), opportunityId, collaborationRequestId: collab.id, kind, detail, createdAt: now(),
  };
  store.db.commercialApprovals.push(ca);
  store.db.approvalSteps.push({
    id: uid('step'), requestId: collab.id, order: 1, approverTeamId: collab.assignedTeamId, status: 'pending',
  });
  logDealRoom(store, opp.id, 'approval', ca.id, `Commercial approval requested: ${kind}`);
  store.audit(requestedById, 'CommercialApproval', ca.id, 'created', { kind });
  store.save();
  return ca;
}

export function decideCommercialApproval(store: Store, id: string, input: DecisionInput): ApprovalDecision {
  const ca = store.db.commercialApprovals.find(c => c.id === id);
  if (!ca) throw new Error('Commercial approval not found');
  const decision = recordDecision(store, ca.collaborationRequestId, input);
  ca.decision = input.decision;
  const opp = store.db.opportunities.find(o => o.id === ca.opportunityId)!;
  createNotification(store, opp.ownerId, `Commercial ${input.decision.replace(/_/g, ' ')}`, ca.detail, 'CommercialApproval', ca.id);
  store.save();
  return decision;
}

// ---- Legal review ---------------------------------------------------------

export function sendToLegal(store: Store, contractId: string, requestedById: string): LegalReview {
  const contract = store.db.contracts.find(c => c.id === contractId);
  if (!contract) throw new Error('Contract not found');
  const collab = makeCollab(store, 'legal_review', contract.opportunityId ?? '', contract.accountId, requestedById, 'legal', { contractId });
  const review: LegalReview = {
    id: uid('leg'), contractId, collaborationRequestId: collab.id,
    deviationSummary: 'AI comparison vs standard terms pending legal confirmation',
    redlines: [], createdAt: now(),
  };
  store.db.legalReviews.push(review);
  contract.status = 'in_legal_review';
  store.db.approvalSteps.push({
    id: uid('step'), requestId: collab.id, order: 1, approverTeamId: collab.assignedTeamId, status: 'pending',
  });
  store.audit(requestedById, 'LegalReview', review.id, 'created');
  store.save();
  return review;
}

// ---- Shared decision recording (immutable audit history) -------------------

export function recordDecision(store: Store, collaborationRequestId: string, input: DecisionInput): ApprovalDecision {
  const collab = store.db.collaborationRequests.find(c => c.id === collaborationRequestId);
  if (!collab) throw new Error('Collaboration request not found');
  const step = store.db.approvalSteps.find(s => s.requestId === collaborationRequestId && s.status === 'pending');
  const decision: ApprovalDecision = {
    id: uid('dec'),
    stepId: step?.id ?? '',
    requestId: collaborationRequestId,
    reviewerId: input.reviewerId,
    decision: input.decision,
    comments: input.comments,
    revisedValues: input.revisedValues,
    conditions: input.conditions,
    voiceTranscript: input.voiceTranscript,
    decidedAt: now(),
  };
  store.db.approvalDecisions.push(decision);   // append-only — never mutated
  if (step) { step.status = 'decided'; step.decisionId = decision.id; }
  collab.status = input.decision === 'returned' ? 'returned' : 'completed';
  collab.updatedAt = now();
  store.audit(input.reviewerId, 'ApprovalDecision', decision.id, input.decision, { requestId: collaborationRequestId });
  return decision;
}

// ---- External send gate (acceptance criterion 5) ---------------------------

export function assertQuotationSendable(store: Store, quotationVersionId: string): QuotationVersion {
  const qv = store.db.quotationVersions.find(v => v.id === quotationVersionId);
  if (!qv) throw new Error('Quotation version not found');
  if (qv.status !== 'approved') {
    throw new Error(`Quotation v${qv.version} cannot be sent to the customer: status is "${qv.status}". Finance approval is mandatory before external send.`);
  }
  return qv;
}
