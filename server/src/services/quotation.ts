import type { Store } from '../store/store.js';
import { uid, now } from '../store/store.js';
import type {
  CollaborationRequest, Lane, Opportunity, PlanningOutputs,
  QuotationRequest, QuotationVersion, CostingVersion, FuelPreference,
} from '../domain/types.js';
import { createNotification } from './inbox.js';
import { armSLA } from './sla.js';
import { logDealRoom } from './dealRoom.js';

export interface QuotationRequestInput {
  opportunityId: string;
  requestedById: string;
  origin?: string;
  destination?: string;
  tonsPerMonth?: number;
  fuelPreference?: FuelPreference;
  includeBackhaul: boolean;
  instructions: string;
  requestedCompletionDate?: string;
}

// Creates a structured Network Planning request with the opportunity's full
// qualification snapshot attached automatically (acceptance criteria 1 & 2).
export function createQuotationRequest(store: Store, input: QuotationRequestInput) {
  const opp = store.db.opportunities.find(o => o.id === input.opportunityId);
  if (!opp) throw new Error('Opportunity not found');
  const account = store.db.accounts.find(a => a.id === opp.accountId)!;

  // Resolve or create the lane referenced by voice.
  let lane: Lane | undefined = opp.lanes.find(l =>
    (!input.origin || l.origin.toLowerCase() === input.origin.toLowerCase()) &&
    (!input.destination || l.destination.toLowerCase() === input.destination.toLowerCase()));
  if (!lane && input.origin && input.destination) {
    lane = {
      id: uid('lane'), origin: input.origin, destination: input.destination,
      intermediateStops: [], multiPick: false, multiDrop: false,
    };
    opp.lanes.push(lane);
  }
  if (!lane) lane = opp.lanes[0];
  if (!lane) throw new Error('No lane on opportunity — say e.g. "add lane Chennai to Pune" first');

  if (input.tonsPerMonth) {
    opp.volume = { ...(opp.volume ?? { commodity: 'other' }), tonsPerMonth: input.tonsPerMonth };
  }

  const planningTeam = store.db.internalTeams.find(t => t.kind === 'network_planning')!;
  const sla = store.db.slas.find(s => s.appliesToKind === 'network_planning');

  const collab: CollaborationRequest = {
    id: uid('req'),
    kind: 'network_planning',
    opportunityId: opp.id,
    accountId: account.id,
    requestedById: input.requestedById,
    assignedTeamId: planningTeam.id,
    priority: 'high',
    status: 'submitted',
    requestedCompletionDate: input.requestedCompletionDate,
    slaHours: sla?.hours ?? 48,
    payload: {
      // Full qualification snapshot travels with the request.
      opportunity: {
        id: opp.id, name: opp.name, owner: opp.ownerId, stage: opp.stage,
        probability: opp.probability, expectedStartDate: opp.expectedStartDate,
        customerDecisionDate: opp.customerDecisionDate,
      },
      account: { id: account.id, name: account.name, industry: account.industry },
      lane,
      volume: opp.volume,
      sustainability: opp.sustainability,
      commercial: opp.commercial,
      fuelPreference: input.fuelPreference,
      includeBackhaul: input.includeBackhaul,
      instructions: input.instructions,
    },
    createdAt: now(),
    updatedAt: now(),
  };
  store.db.collaborationRequests.push(collab);

  const qr: QuotationRequest = {
    id: uid('qreq'),
    opportunityId: opp.id,
    collaborationRequestId: collab.id,
    laneIds: [lane.id],
    instructions: input.instructions,
    includeBackhaul: input.includeBackhaul,
    fuelPreference: input.fuelPreference,
    status: 'submitted',
    createdAt: now(),
  };
  store.db.quotationRequests.push(qr);

  armSLA(store, collab);
  createNotification(store, planningTeam.id, 'New quotation request',
    `${account.name}: ${lane.origin} → ${lane.destination}${input.tonsPerMonth ? `, ${input.tonsPerMonth} MT/month` : ''}`,
    'CollaborationRequest', collab.id);
  logDealRoom(store, opp.id, 'quotation', qr.id, `Planning request: ${lane.origin} → ${lane.destination}`);
  store.audit(input.requestedById, 'QuotationRequest', qr.id, 'created', { lane: `${lane.origin}->${lane.destination}` });
  store.save();
  return { collab, quotationRequest: qr, lane };
}

// Heuristic planning engine — stands in for the Network Planning team / Route
// Optimizer agent so the workflow runs end-to-end. A human planner (or the AI
// agent) can override any field before completing the request.
export function computePlanningOutputs(opp: Opportunity, lane: Lane, fuel?: FuelPreference): PlanningOutputs {
  const distance = lane.distanceKm ?? 1100;
  const tons = opp.volume?.tonsPerMonth ?? 500;
  const loadPerTrip = opp.volume?.avgLoadPerTripTons ?? 25;
  const trips = Math.ceil(tons / loadPerTrip);
  const roundTripDays = Math.max(1, Math.ceil((distance * 2) / 550));
  const vehicles = Math.ceil((trips * roundTripDays) / 26);
  const costPerKm = fuel === 'lng' ? 38 : fuel === 'ev' ? 30 : 42;
  const backhaul = !!lane.backhaulRoute || true;
  const emptyKmPct = backhaul ? 18 : 46;
  const costPerTrip = Math.round(distance * costPerKm * (1 + emptyKmPct / 100));
  return {
    recommendedRoute: `${lane.origin} → ${lane.intermediateStops.join(' → ') || 'NH corridor'} → ${lane.destination}`,
    routeDistanceKm: distance,
    transitTimeHours: Math.round(distance / 45),
    vehicleRequirement: vehicles,
    trailerRequirement: vehicles + Math.ceil(vehicles * 0.2),
    driverRequirement: vehicles + Math.ceil(vehicles * 0.1),
    monthlyTripCapacity: vehicles * Math.floor(26 / roundTripDays),
    emptyKmPct,
    backhaulPairing: backhaul ? `${lane.destination} → ${lane.origin} return lane candidates identified` : 'None identified',
    fleetUtilizationPct: backhaul ? 84 : 61,
    lngFeasible: fuel !== 'ev',
    evFeasible: distance <= 400,
    fuelOrChargingAvailability: fuel === 'lng' ? 'LNG stations available on corridor' : fuel === 'ev' ? 'Charging sparse beyond 400 km' : 'Diesel ubiquitous',
    tollAndPermitCost: Math.round(distance * 2.1),
    driverAndOperatingCost: Math.round(distance * 6.5),
    costPerTrip,
    costPerKm,
    costPerTon: Math.round(costPerTrip / loadPerTrip),
    costPerTonKm: Number((costPerTrip / loadPerTrip / distance).toFixed(2)),
    operationalRisks: distance > 1500 ? ['Long corridor — driver fatigue rules apply'] : [],
    serviceConstraints: [],
    assumptions: [`${loadPerTrip} MT average load per trip`, '26 working days/month', `${emptyKmPct}% empty km`],
    recommendedPriceRange: { min: Math.round(costPerTrip * 1.12), max: Math.round(costPerTrip * 1.22) },
  };
}

// Network Planning completes the request → creates a quotation version + costing version.
export function completePlanning(store: Store, quotationRequestId: string, actor: string, overrides?: Partial<PlanningOutputs>) {
  const qr = store.db.quotationRequests.find(q => q.id === quotationRequestId);
  if (!qr) throw new Error('Quotation request not found');
  const opp = store.db.opportunities.find(o => o.id === qr.opportunityId)!;
  const lane = opp.lanes.find(l => qr.laneIds.includes(l.id))!;
  const planning = { ...computePlanningOutputs(opp, lane, qr.fuelPreference), ...overrides };

  const existing = store.db.quotationVersions.filter(v => v.quotationRequestId === qr.id);
  for (const v of existing) if (v.status !== 'sent_to_customer') v.status = 'superseded';

  const version: QuotationVersion = {
    id: uid('quot'),
    quotationRequestId: qr.id,
    opportunityId: opp.id,
    version: existing.length + 1,
    planning,
    quotedPricePerTrip: planning.recommendedPriceRange?.min,
    pricingModel: opp.commercial?.pricingModel ?? 'trip_based',
    validUntil: new Date(Date.now() + 30 * 86400_000).toISOString(),
    status: 'draft',
    createdAt: now(),
  };
  store.db.quotationVersions.push(version);

  const costing: CostingVersion = {
    id: uid('cost'),
    quotationVersionId: version.id,
    version: 1,
    fixedCost: Math.round((planning.costPerTrip ?? 0) * 0.35),
    variableCost: Math.round((planning.costPerTrip ?? 0) * 0.65),
    fuelAssumption: qr.fuelPreference === 'lng' ? 'LNG @ ₹72/kg' : 'Diesel @ ₹92/l',
    tollAssumption: `₹${planning.tollAndPermitCost}/trip`,
    grossMarginPct: version.quotedPricePerTrip && planning.costPerTrip
      ? Number((((version.quotedPricePerTrip - planning.costPerTrip) / version.quotedPricePerTrip) * 100).toFixed(1))
      : undefined,
    createdAt: now(),
  };
  store.db.costingVersions.push(costing);

  qr.status = 'completed';
  const collab = store.db.collaborationRequests.find(c => c.id === qr.collaborationRequestId);
  if (collab) { collab.status = 'completed'; collab.updatedAt = now(); }

  createNotification(store, opp.ownerId, 'Planning complete',
    `Quotation v${version.version} ready for ${opp.name} — cost ₹${planning.costPerTrip}/trip, suggested ₹${version.quotedPricePerTrip}/trip`,
    'QuotationVersion', version.id);
  logDealRoom(store, opp.id, 'cost_sheet', costing.id, `Costing v1 for quotation v${version.version}`);
  store.audit(actor, 'QuotationVersion', version.id, 'created', { version: version.version });
  store.save();
  return { version, costing };
}
