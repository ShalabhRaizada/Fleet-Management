/**
 * Phase-1 roles. Maps to role_master.role_code seed values.
 */
export const ROLES = {
  ADMIN: 'ADMIN',
  FLEET_MANAGER: 'FLEET_MANAGER',
  WORKSHOP_SUPERVISOR: 'WORKSHOP_SUPERVISOR',
  DRIVER: 'DRIVER',
  APPROVER: 'APPROVER',
} as const;

export type RoleCode = (typeof ROLES)[keyof typeof ROLES];

export const ALL_ROLES: RoleCode[] = Object.values(ROLES) as RoleCode[];

/** Roles allowed to approve approval_request / asset_compliance / job_card approvals. */
export const APPROVER_ROLES: RoleCode[] = [ROLES.ADMIN, ROLES.APPROVER, ROLES.FLEET_MANAGER];

/** Roles allowed to write (create/update/delete) master & transactional data broadly. */
export const WRITE_ROLES: RoleCode[] = [ROLES.ADMIN, ROLES.FLEET_MANAGER, ROLES.WORKSHOP_SUPERVISOR];
