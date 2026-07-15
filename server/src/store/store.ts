import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import type { DB, AuditEvent } from '../domain/types.js';

const emptyDB = (): DB => ({
  users: [], accounts: [], contacts: [], opportunities: [], meetings: [], dayPlans: [],
  internalTeams: [], internalTeamMembers: [], collaborationRequests: [], collaborationMessages: [],
  quotationRequests: [], quotationVersions: [], costingVersions: [],
  approvalRules: [], approvalSteps: [], approvalDecisions: [],
  financeReviews: [], commercialApprovals: [], legalReviews: [],
  contracts: [], contractVersions: [], contractAmendments: [], contractLanes: [], contractRateCards: [],
  customerCommunications: [], internalCommunications: [],
  dealRooms: [], dealRoomParticipants: [], dealRoomArtifacts: [], dealRoomActivities: [],
  customerGrowthOpportunities: [], followUps: [], escalations: [],
  slas: [], workflowSLAs: [], notifications: [], auditEvents: [], conversations: [],
});

export const uid = (prefix: string) => `${prefix}_${crypto.randomBytes(6).toString('hex')}`;
export const now = () => new Date().toISOString();

export class Store {
  db: DB;
  private file?: string;

  constructor(file?: string) {
    this.file = file;
    if (file && fs.existsSync(file)) {
      this.db = { ...emptyDB(), ...JSON.parse(fs.readFileSync(file, 'utf8')) };
    } else {
      this.db = emptyDB();
    }
  }

  save() {
    if (!this.file) return;
    fs.mkdirSync(path.dirname(this.file), { recursive: true });
    const tmp = this.file + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(this.db, null, 2));
    fs.renameSync(tmp, this.file);
  }

  audit(actor: string, entityKind: string, entityId: string, action: string, detail?: Record<string, unknown>) {
    const ev: AuditEvent = { id: uid('aud'), actor, entityKind, entityId, action, detail, createdAt: now() };
    this.db.auditEvents.push(ev);
    return ev;
  }
}
