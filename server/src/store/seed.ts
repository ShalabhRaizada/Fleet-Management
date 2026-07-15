import type { Store } from './store.js';
import { uid, now } from './store.js';

// Idempotent seed: teams, SLAs, demo accounts/opportunities used by the wireframes.
export function seed(store: Store) {
  const db = store.db;
  if (db.internalTeams.length) return;

  const teams = (['sales', 'network_planning', 'finance', 'commercial', 'legal', 'operations', 'customer_service', 'sustainability', 'leadership'] as const)
    .map(kind => ({ id: uid('team'), name: kind.replace(/_/g, ' '), kind }));
  db.internalTeams.push(...teams);

  db.slas.push(
    { id: uid('slad'), name: 'Planning quotation SLA', appliesToKind: 'network_planning', hours: 48 },
    { id: uid('slad'), name: 'Finance review SLA', appliesToKind: 'finance_review', hours: 24 },
    { id: uid('slad'), name: 'Commercial approval SLA', appliesToKind: 'commercial_approval', hours: 24 },
    { id: uid('slad'), name: 'Legal review SLA', appliesToKind: 'legal_review', hours: 72 },
  );

  const user = { id: 'user_sales1', name: 'Arjun Mehta', email: 'arjun@fleet.example', team: 'sales' as const };
  db.users.push(user,
    { id: 'user_fin1', name: 'Priya Nair', team: 'finance' },
    { id: 'user_np1', name: 'Planning Bot', team: 'network_planning' });

  const mk = (name: string, industry: string, region: string, creditDays: number) => {
    const a = { id: uid('acc'), name, industry, region, creditDays, creditLimit: 10_000_000, outstandingAmount: 0, strategic: true, notes: [], createdAt: now() };
    db.accounts.push(a);
    return a;
  };
  const tata = mk('Tata Steel', 'steel', 'East', 60);
  const ultratech = mk('UltraTech Cement', 'cement', 'East', 45);
  const jsw = mk('JSW Steel', 'steel', 'West', 45);
  mk('PepsiCo', 'fmcg', 'North', 30);

  db.contacts.push(
    { id: uid('cnt'), accountId: tata.id, name: 'R. Sharma', role: 'Head of Logistics', email: 'r.sharma@tatasteel.example', decisionMaker: true, notes: [] },
    { id: uid('cnt'), accountId: ultratech.id, name: 'S. Iyer', role: 'Procurement Lead', email: 's.iyer@ultratech.example', decisionMaker: true, notes: [] },
    { id: uid('cnt'), accountId: jsw.id, name: 'V. Kulkarni', role: 'SCM Manager', email: 'v.kulkarni@jsw.example', decisionMaker: false, notes: [] },
  );

  db.opportunities.push({
    id: 'opp_tata1',
    accountId: tata.id,
    name: 'Tata Steel — Jamshedpur outbound',
    ownerId: user.id,
    stage: 'quotation',
    probability: 65,
    expectedMonthlyRevenue: 4_800_000,
    buyingTimeline: 'This quarter',
    painPoints: ['Detention at plant gates', 'Unreliable market vehicles in monsoon'],
    competitors: ['Incumbent regional fleet operator'],
    currentTransportModel: 'Spot market vehicles via brokers',
    lanes: [{
      id: uid('lane'), origin: 'Jamshedpur', destination: 'Kolkata',
      intermediateStops: [], multiPick: false, multiDrop: false, distanceKm: 290,
    }],
    volume: { commodity: 'steel', tonsPerMonth: 1200, avgLoadPerTripTons: 30, vehicleType: 'multi-axle', trailerCategory: 'flatbed' },
    sustainability: { openTo: ['lng'], rejected: [], dropTrailer: true },
    commercial: { pricingModel: 'per_ton', creditDays: 60, paymentTermsDays: 60, fuelIndexLinked: true },
    healthScore: 72,
    nextActions: ['Confirm backhaul availability', 'Negotiate credit days to 45'],
    createdAt: now(), updatedAt: now(),
  });

  db.dealRooms.push({ id: uid('room'), opportunityId: 'opp_tata1', createdAt: now() });

  const contractId = 'ctr_jsw1';
  db.contracts.push({
    id: contractId, accountId: jsw.id, title: 'JSW Steel — Western region freight agreement',
    status: 'active', startDate: '2026-01-01', expiryDate: '2026-09-30', currentVersion: 1, createdAt: now(),
  });
  db.contractVersions.push({
    id: uid('ctv'), contractId, version: 1,
    body: 'Master freight agreement: Mumbai–Pune corridor, per-ton pricing, 45-day credit, standard detention clauses.',
    changeNote: 'Initial version', signatureStatus: 'signed', createdAt: now(),
  });

  store.save();
}
