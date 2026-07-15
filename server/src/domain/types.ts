// Domain model for the AI-first Sales Enablement / Revenue Operating System.

export type ID = string;

export type MeetingType =
  | 'face_to_face' | 'teams' | 'zoom' | 'phone' | 'lunch' | 'dinner'
  | 'conference' | 'plant_visit' | 'site_visit' | 'informal_social';

export type Commodity =
  | 'steel' | 'cement' | 'chemicals' | 'fmcg' | 'retail' | 'automotive'
  | 'containers' | 'dense_cargo' | 'project_cargo' | 'other';

export type PricingModel =
  | 'per_km' | 'per_ton' | 'ton_km' | 'slab' | 'trip_based'
  | 'dedicated_fleet' | 'monthly_fixed' | 'variable';

export type FuelPreference = 'lng' | 'ev' | 'biofuel' | 'hybrid' | 'diesel';

export type OpportunityStage =
  | 'discovery' | 'qualification' | 'solutioning' | 'quotation'
  | 'negotiation' | 'contracting' | 'won' | 'lost';

export interface Account {
  id: ID;
  name: string;
  industry?: string;
  region?: string;
  creditDays?: number;
  creditLimit?: number;
  outstandingAmount?: number;
  strategic?: boolean;
  notes: string[];
  createdAt: string;
}

export interface Contact {
  id: ID;
  accountId: ID;
  name: string;
  role?: string;
  phone?: string;
  email?: string;
  decisionMaker?: boolean;
  notes: string[];
}

export interface Lane {
  id: ID;
  origin: string;
  destination: string;
  intermediateStops: string[];
  multiPick: boolean;
  multiDrop: boolean;
  distanceKm?: number;
  forwardRoute?: string;
  backhaulRoute?: string;
  returnUtilizationPct?: number;
  emptyKm?: number;
}

export interface VolumeProfile {
  commodity: Commodity;
  tonsPerMonth?: number;
  tripsPerMonth?: number;
  avgLoadPerTripTons?: number;
  vehicleType?: string;
  tractorCategory?: string;
  trailerCategory?: string;
  dedicatedFleet?: boolean;
  seasonalVariation?: string;
  peakVolume?: number;
  minCommittedVolume?: number;
}

export interface SustainabilityProfile {
  openTo: FuelPreference[];
  rejected: FuelPreference[];
  coupling?: boolean;
  decoupling?: boolean;
  dropTrailer?: boolean;
  trailerPools?: boolean;
}

export interface CommercialProfile {
  pricingModel?: PricingModel;
  detentionLoading?: string;
  detentionUnloading?: string;
  transitInsurance?: 'carrier_risk' | 'owner_risk';
  paymentTermsDays?: number;
  creditDays?: number;
  emdRequired?: boolean;
  bankGuaranteeRequired?: boolean;
  penaltyClauses?: string;
  escalationFormula?: string;
  fuelIndexLinked?: boolean;
}

export interface Opportunity {
  id: ID;
  accountId: ID;
  name: string;
  ownerId: ID;
  stage: OpportunityStage;
  probability: number;            // 0..100
  expectedMonthlyRevenue?: number;
  expectedStartDate?: string;
  customerDecisionDate?: string;
  buyingTimeline?: string;
  painPoints: string[];
  competitors: string[];
  currentTransportModel?: string;
  lanes: Lane[];
  volume?: VolumeProfile;
  sustainability?: SustainabilityProfile;
  commercial?: CommercialProfile;
  healthScore?: number;           // 0..100
  nextActions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Meeting {
  id: ID;
  ownerId: ID;
  accountId?: ID;
  title: string;
  type: MeetingType;
  location?: string;
  start: string;
  end: string;
  travelMinutesFromPrevious?: number;
  agenda: string[];
  reminders: string[];
  transcript?: string;
  summary?: string;
}

export interface DayPlan {
  id: ID;
  ownerId: ID;
  date: string;
  meetings: Meeting[];
  routeSummary: string;
  createdAt: string;
}

// ---------------- Collaboration & workflow entities ----------------

export type TeamKind =
  | 'sales' | 'network_planning' | 'finance' | 'commercial' | 'legal'
  | 'operations' | 'customer_service' | 'sustainability' | 'leadership';

export interface InternalTeam { id: ID; name: string; kind: TeamKind; }
export interface InternalTeamMember { id: ID; teamId: ID; name: string; email?: string; role?: string; }

export type RequestStatus =
  | 'draft' | 'submitted' | 'in_progress' | 'question_raised'
  | 'completed' | 'returned' | 'cancelled';

export interface CollaborationRequest {
  id: ID;
  kind: 'network_planning' | 'finance_review' | 'commercial_approval' | 'legal_review' | 'other';
  opportunityId: ID;
  accountId: ID;
  requestedById: ID;
  assignedTeamId: ID;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: RequestStatus;
  requestedCompletionDate?: string;
  slaHours: number;
  payload: Record<string, unknown>;   // structured request data (qualification snapshot etc.)
  createdAt: string;
  updatedAt: string;
}

export interface CollaborationMessage {
  id: ID;
  requestId: ID;
  authorId: ID;
  body: string;
  viaVoice: boolean;
  createdAt: string;
}

export interface QuotationRequest {
  id: ID;
  opportunityId: ID;
  collaborationRequestId: ID;
  laneIds: ID[];
  instructions?: string;
  includeBackhaul: boolean;
  fuelPreference?: FuelPreference;
  status: RequestStatus;
  createdAt: string;
}

export interface PlanningOutputs {
  recommendedRoute?: string;
  routeDistanceKm?: number;
  transitTimeHours?: number;
  vehicleRequirement?: number;
  trailerRequirement?: number;
  driverRequirement?: number;
  monthlyTripCapacity?: number;
  emptyKmPct?: number;
  backhaulPairing?: string;
  fleetUtilizationPct?: number;
  lngFeasible?: boolean;
  evFeasible?: boolean;
  fuelOrChargingAvailability?: string;
  tollAndPermitCost?: number;
  driverAndOperatingCost?: number;
  costPerTrip?: number;
  costPerKm?: number;
  costPerTon?: number;
  costPerTonKm?: number;
  operationalRisks?: string[];
  serviceConstraints?: string[];
  assumptions?: string[];
  recommendedPriceRange?: { min: number; max: number };
}

export interface QuotationVersion {
  id: ID;
  quotationRequestId: ID;
  opportunityId: ID;
  version: number;
  planning: PlanningOutputs;
  quotedPricePerTrip?: number;
  pricingModel?: PricingModel;
  validUntil?: string;
  status: 'draft' | 'pending_finance' | 'finance_approved' | 'finance_rejected'
        | 'approved' | 'sent_to_customer' | 'superseded';
  createdAt: string;
}

export interface CostingVersion {
  id: ID;
  quotationVersionId: ID;
  version: number;
  fixedCost: number;
  variableCost: number;
  fuelAssumption?: string;
  tollAssumption?: string;
  grossMarginPct?: number;
  createdAt: string;
}

export type ApprovalDecisionValue =
  | 'approved' | 'rejected' | 'returned' | 'approved_with_conditions'
  | 'revised_price_recommended' | 'escalated';

export interface ApprovalRule {
  id: ID;
  kind: 'finance' | 'commercial';
  description: string;
  // thresholds — any breach requires this approval level
  maxDiscountPct?: number;
  minGrossMarginPct?: number;
  maxCreditDays?: number;
  approverTeamId: ID;
}

export interface ApprovalStep {
  id: ID;
  requestId: ID;              // CollaborationRequest id
  ruleId?: ID;
  order: number;
  approverTeamId: ID;
  status: 'pending' | 'decided';
  decisionId?: ID;
}

export interface ApprovalDecision {
  id: ID;
  stepId: ID;
  requestId: ID;
  reviewerId: ID;
  decision: ApprovalDecisionValue;
  comments?: string;
  revisedValues?: Record<string, unknown>;
  conditions?: string[];
  voiceTranscript?: string;
  decidedAt: string;
}

export interface FinanceReview {
  id: ID;
  quotationVersionId: ID;
  collaborationRequestId: ID;
  grossMarginPct?: number;
  creditDays?: number;
  workingCapitalImpact?: string;
  customerCreditRisk?: 'low' | 'medium' | 'high';
  minimumAcceptablePrice?: number;
  exceptions: string[];
  decision?: ApprovalDecisionValue;
  aiRecommendation?: string;
  createdAt: string;
}

export interface CommercialApproval {
  id: ID;
  opportunityId: ID;
  collaborationRequestId: ID;
  kind: 'special_pricing' | 'discount' | 'fuel_escalation_exception' | 'detention_exception'
      | 'credit_term_exception' | 'free_trial' | 'mobilization_support' | 'custom_sla'
      | 'emd_waiver' | 'bank_guarantee_waiver' | 'insurance_exception' | 'low_margin_bid';
  detail: string;
  decision?: ApprovalDecisionValue;
  createdAt: string;
}

export interface LegalReview {
  id: ID;
  contractId: ID;
  collaborationRequestId: ID;
  deviationSummary?: string;
  redlines: string[];
  decision?: ApprovalDecisionValue;
  createdAt: string;
}

export interface ContractLane { id: ID; contractId: ID; laneId: ID; ratePerTrip?: number; effectiveFrom: string; }
export interface ContractRateCard { id: ID; contractId: ID; version: number; entries: { laneId: ID; ratePerTrip: number }[]; createdAt: string; }

export interface Contract {
  id: ID;
  accountId: ID;
  opportunityId?: ID;
  quotationVersionId?: ID;
  title: string;
  status: 'draft' | 'in_legal_review' | 'active' | 'expired' | 'terminated';
  startDate?: string;
  expiryDate?: string;
  currentVersion: number;
  createdAt: string;
}

export interface ContractVersion {
  id: ID;
  contractId: ID;
  version: number;
  body: string;                       // full contract text/summary snapshot — immutable
  changeNote?: string;
  amendmentId?: ID;
  signatureStatus: 'unsigned' | 'sent' | 'signed';
  createdAt: string;
}

export interface ContractAmendment {
  id: ID;
  contractId: ID;
  proposedChange: string;
  effectiveDate?: string;
  commercialImpact?: string;
  operationalImpact?: string;
  requiredApprovals: string[];
  customerConsent: 'pending' | 'accepted' | 'rejected';
  status: 'draft' | 'pending_approval' | 'approved' | 'applied' | 'rejected';
  resultingVersion?: number;
  createdAt: string;
}

export interface CustomerCommunication {
  id: ID;
  accountId: ID;
  opportunityId?: ID;
  channel: 'email' | 'phone' | 'meeting' | 'whatsapp';
  direction: 'outbound' | 'inbound';
  subject?: string;
  body: string;
  attachments: string[];
  quotationVersionId?: ID;
  status: 'draft' | 'pending_preview' | 'sent' | 'received';
  createdAt: string;
}

export interface InternalCommunication {
  id: ID;
  fromId: ID;
  toTeamId?: ID;
  opportunityId?: ID;
  body: string;
  createdAt: string;
}

// ---------------- Deal room ----------------

export interface DealRoom {
  id: ID;
  opportunityId: ID;
  createdAt: string;
}
export interface DealRoomParticipant { id: ID; dealRoomId: ID; name: string; team: TeamKind | 'customer'; }
export interface DealRoomArtifact {
  id: ID; dealRoomId: ID;
  kind: 'transcript' | 'voice_note' | 'quotation' | 'cost_sheet' | 'approval' | 'contract' | 'communication' | 'task' | 'note';
  refId?: ID; title: string; createdAt: string;
}
export interface DealRoomActivity { id: ID; dealRoomId: ID; actor: string; action: string; createdAt: string; }

export interface CustomerGrowthOpportunity {
  id: ID;
  accountId: ID;
  kind: 'new_lane' | 'additional_load' | 'backhaul' | 'reverse_logistics' | 'multi_pick'
      | 'multi_drop' | 'dedicated_fleet' | 'lng_conversion' | 'ev_short_haul'
      | 'drop_and_hook' | 'warehousing' | 'contract_expansion';
  description: string;
  estimatedMonthlyRevenue?: number;
  status: 'identified' | 'pursuing' | 'converted' | 'dropped';
  createdAt: string;
}

export interface FollowUp {
  id: ID;
  ownerId: ID;
  accountId?: ID;
  opportunityId?: ID;
  reason: string;
  dueAt: string;
  status: 'open' | 'done' | 'overdue';
  suggestedAction?: string;
  createdAt: string;
}

export interface Escalation {
  id: ID;
  requestId?: ID;
  followUpId?: ID;
  reason: string;
  raisedTo: TeamKind;
  status: 'open' | 'resolved';
  createdAt: string;
}

export interface ServiceLevelAgreement { id: ID; name: string; appliesToKind: CollaborationRequest['kind']; hours: number; }
export interface WorkflowSLA {
  id: ID;
  requestId: ID;
  dueAt: string;
  breached: boolean;
  remindedAt?: string;
  escalationId?: ID;
}

export interface Notification {
  id: ID;
  userId: ID;
  title: string;
  body: string;
  read: boolean;
  refKind?: string;
  refId?: ID;
  createdAt: string;
}

export interface AuditEvent {
  id: ID;
  actor: string;
  entityKind: string;
  entityId: ID;
  action: string;
  detail?: Record<string, unknown>;
  createdAt: string;                  // immutable append-only log
}

export interface User { id: ID; name: string; email?: string; team: TeamKind; }

// ---------------- Conversation / voice ----------------

export interface ConversationTurn {
  role: 'user' | 'assistant';
  text: string;
  viaVoice?: boolean;
  at: string;
}

export interface Conversation {
  id: ID;
  ownerId: ID;
  opportunityId?: ID;
  accountId?: ID;
  purpose: 'general' | 'plan_day' | 'opportunity_discovery' | 'meeting_record' | 'deal_room';
  turns: ConversationTurn[];
  createdAt: string;
}

export interface DB {
  users: User[];
  accounts: Account[];
  contacts: Contact[];
  opportunities: Opportunity[];
  meetings: Meeting[];
  dayPlans: DayPlan[];
  internalTeams: InternalTeam[];
  internalTeamMembers: InternalTeamMember[];
  collaborationRequests: CollaborationRequest[];
  collaborationMessages: CollaborationMessage[];
  quotationRequests: QuotationRequest[];
  quotationVersions: QuotationVersion[];
  costingVersions: CostingVersion[];
  approvalRules: ApprovalRule[];
  approvalSteps: ApprovalStep[];
  approvalDecisions: ApprovalDecision[];
  financeReviews: FinanceReview[];
  commercialApprovals: CommercialApproval[];
  legalReviews: LegalReview[];
  contracts: Contract[];
  contractVersions: ContractVersion[];
  contractAmendments: ContractAmendment[];
  contractLanes: ContractLane[];
  contractRateCards: ContractRateCard[];
  customerCommunications: CustomerCommunication[];
  internalCommunications: InternalCommunication[];
  dealRooms: DealRoom[];
  dealRoomParticipants: DealRoomParticipant[];
  dealRoomArtifacts: DealRoomArtifact[];
  dealRoomActivities: DealRoomActivity[];
  customerGrowthOpportunities: CustomerGrowthOpportunity[];
  followUps: FollowUp[];
  escalations: Escalation[];
  slas: ServiceLevelAgreement[];
  workflowSLAs: WorkflowSLA[];
  notifications: Notification[];
  auditEvents: AuditEvent[];
  conversations: Conversation[];
}
