'use strict';

// Central vocabulary for the Tricktrack ITAM module. Everything the API and UI
// validate against lives here so admins/developers change it in one place.

const ASSET_CATEGORIES = {
  it_hardware: 'IT Hardware',
  deskside: 'Desk-Side Equipment',
  network: 'Networking Equipment',
  software: 'Software',
  business_application: 'Business Application',
  api: 'API',
  ai_tool: 'AI Tool',
  cloud: 'Cloud Asset',
};

// Section 7 — Asset lifecycle statuses.
const ASSET_STATUSES = [
  'Planned',
  'Ordered',
  'Received',
  'In Stock',
  'Available',
  'Reserved',
  'Pending Approval',
  'Allocated',
  'In Use',
  'Under Repair',
  'Lost',
  'Damaged',
  'Returned',
  'Available for Reuse',
  'Retired',
  'Disposed',
  'License Expired',
  'License Revoked',
  'Cloud Provisioned',
  'Cloud Suspended',
  'Cloud Decommissioned',
];

// Statuses in which an instance can be picked for a new allocation.
const ALLOCATABLE_STATUSES = ['In Stock', 'Available', 'Available for Reuse', 'Received'];

// Section 8 — Request statuses.
const REQUEST_STATUSES = [
  'Draft',
  'Submitted',
  'Pending Manager Approval',
  'Pending IT Approval',
  'Pending Security Approval',
  'Pending Finance Approval',
  'Approved',
  'Rejected',
  'More Information Required',
  'In Fulfilment',
  'Allocated',
  'Issued',
  'User Accepted',
  'Return Requested',
  'Returned',
  'Closed',
  'Cancelled',
];

// Section 9 — Urgency levels.
const URGENCY_LEVELS = ['Low', 'Normal', 'High', 'Critical'];

// Section 10 — Approval stages, in the order they run when configured.
const APPROVAL_STAGES = ['manager', 'it', 'security', 'finance'];

const APPROVAL_STAGE_STATUS = {
  manager: 'Pending Manager Approval',
  it: 'Pending IT Approval',
  security: 'Pending Security Approval',
  finance: 'Pending Finance Approval',
};

// Section 4 — Roles.
const ROLES = ['end_user', 'manager', 'it_asset_admin', 'it_support', 'security', 'finance', 'admin'];

// Roles allowed to act on each approval stage (admin can always act).
const STAGE_APPROVER_ROLES = {
  manager: ['manager'],
  it: ['it_asset_admin', 'it_support'],
  security: ['security'],
  finance: ['finance'],
};

// Section 6.4 — Return reasons.
const RETURN_REASONS = [
  'No longer required',
  'Employee transfer',
  'Employee exit',
  'Replacement received',
  'Temporary usage completed',
  'Damaged',
  'Upgrade required',
];

const ENVIRONMENTS = ['dev', 'test', 'production'];

const DATA_SENSITIVITY = ['none', 'internal', 'confidential', 'restricted'];

// Section 3.5 — Auditable actions.
const AUDIT_ACTIONS = [
  'asset.created',
  'asset.updated',
  'asset.retired',
  'asset.disposed',
  'instance.created',
  'instance.updated',
  'catalog.created',
  'catalog.updated',
  'request.created',
  'request.submitted',
  'request.approved',
  'request.rejected',
  'request.info_requested',
  'request.info_provided',
  'request.cancelled',
  'request.closed',
  'allocation.created',
  'allocation.accepted',
  'allocation.return_requested',
  'allocation.returned',
  'license.assigned',
  'license.revoked',
  'cloud.provisioned',
  'cloud.decommissioned',
  'user.created',
];

module.exports = {
  ASSET_CATEGORIES,
  ASSET_STATUSES,
  ALLOCATABLE_STATUSES,
  REQUEST_STATUSES,
  URGENCY_LEVELS,
  APPROVAL_STAGES,
  APPROVAL_STAGE_STATUS,
  ROLES,
  STAGE_APPROVER_ROLES,
  RETURN_REASONS,
  ENVIRONMENTS,
  DATA_SENSITIVITY,
  AUDIT_ACTIONS,
};
