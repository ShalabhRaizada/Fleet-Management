import type { Store } from '../store/store.js';
import { uid, now } from '../store/store.js';
import type { Contract, ContractAmendment, ContractVersion } from '../domain/types.js';
import { logDealRoom } from './dealRoom.js';
import { createNotification } from './inbox.js';

export function createContract(store: Store, input: {
  accountId: string; opportunityId?: string; quotationVersionId?: string;
  title: string; body: string; startDate?: string; expiryDate?: string; actor: string;
}): { contract: Contract; version: ContractVersion } {
  const contract: Contract = {
    id: uid('ctr'), accountId: input.accountId, opportunityId: input.opportunityId,
    quotationVersionId: input.quotationVersionId, title: input.title,
    status: 'draft', startDate: input.startDate, expiryDate: input.expiryDate,
    currentVersion: 1, createdAt: now(),
  };
  store.db.contracts.push(contract);
  const version: ContractVersion = {
    id: uid('ctv'), contractId: contract.id, version: 1, body: input.body,
    changeNote: 'Initial version', signatureStatus: 'unsigned', createdAt: now(),
  };
  store.db.contractVersions.push(version);
  if (input.opportunityId) logDealRoom(store, input.opportunityId, 'contract', contract.id, `Contract created: ${input.title}`);
  store.audit(input.actor, 'Contract', contract.id, 'created');
  store.save();
  return { contract, version };
}

// Amendments never overwrite history: applying one appends a NEW ContractVersion
// (acceptance criterion 8). Prior versions remain untouched and fully auditable.
export function proposeAmendment(store: Store, contractId: string, actor: string, input: {
  proposedChange: string; effectiveDate?: string; commercialImpact?: string;
  operationalImpact?: string; requiredApprovals?: string[];
}): ContractAmendment {
  const contract = store.db.contracts.find(c => c.id === contractId);
  if (!contract) throw new Error('Contract not found');
  const amendment: ContractAmendment = {
    id: uid('amd'), contractId,
    proposedChange: input.proposedChange,
    effectiveDate: input.effectiveDate,
    commercialImpact: input.commercialImpact,
    operationalImpact: input.operationalImpact,
    requiredApprovals: input.requiredApprovals ?? ['commercial'],
    customerConsent: 'pending',
    status: 'pending_approval',
    createdAt: now(),
  };
  store.db.contractAmendments.push(amendment);
  if (contract.opportunityId) logDealRoom(store, contract.opportunityId, 'contract', amendment.id, `Amendment proposed: ${input.proposedChange}`);
  store.audit(actor, 'ContractAmendment', amendment.id, 'proposed');
  store.save();
  return amendment;
}

export function applyAmendment(store: Store, amendmentId: string, actor: string): ContractVersion {
  const amendment = store.db.contractAmendments.find(a => a.id === amendmentId);
  if (!amendment) throw new Error('Amendment not found');
  if (amendment.status === 'applied') throw new Error('Amendment already applied');
  const contract = store.db.contracts.find(c => c.id === amendment.contractId)!;
  const prev = store.db.contractVersions
    .filter(v => v.contractId === contract.id)
    .sort((a, b) => b.version - a.version)[0];

  const version: ContractVersion = {
    id: uid('ctv'),
    contractId: contract.id,
    version: prev.version + 1,
    body: `${prev.body}\n\n--- Amendment (${amendment.effectiveDate ?? 'immediate'}) ---\n${amendment.proposedChange}`,
    changeNote: amendment.proposedChange,
    amendmentId: amendment.id,
    signatureStatus: 'unsigned',
    createdAt: now(),
  };
  store.db.contractVersions.push(version);          // append — never mutate prior versions
  contract.currentVersion = version.version;
  amendment.status = 'applied';
  amendment.resultingVersion = version.version;

  if (contract.opportunityId) logDealRoom(store, contract.opportunityId, 'contract', version.id, `Contract v${version.version} created from amendment`);
  createNotification(store, actor, 'Contract updated', `${contract.title} is now v${version.version}`, 'Contract', contract.id);
  store.audit(actor, 'ContractVersion', version.id, 'created_from_amendment', { amendmentId });
  store.save();
  return version;
}

export function contractHistory(store: Store, contractId: string) {
  return {
    contract: store.db.contracts.find(c => c.id === contractId),
    versions: store.db.contractVersions.filter(v => v.contractId === contractId).sort((a, b) => a.version - b.version),
    amendments: store.db.contractAmendments.filter(a => a.contractId === contractId),
    audit: store.db.auditEvents.filter(e =>
      (e.entityKind.startsWith('Contract') && e.entityId === contractId) ||
      store.db.contractVersions.some(v => v.contractId === contractId && v.id === e.entityId) ||
      store.db.contractAmendments.some(a => a.contractId === contractId && a.id === e.entityId)),
  };
}
