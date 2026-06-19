export interface Envelope<T> {
  success: boolean;
  message: string;
  data: T | null;
  errors: unknown[] | null;
  timestamp: string;
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface AuthUser {
  user_id: string;
  login_id: string;
  display_name: string;
  role_code: string;
  branch_id: string | null;
  mfa_enabled?: boolean;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface MfaRequiredResponse {
  mfaRequired: true;
  tempToken: string;
}

export type LoginResult = LoginResponse | MfaRequiredResponse;

export interface MfaSetupResponse {
  secret: string;
  otpauthUri: string;
}

export type RoleCode = 'ADMIN' | 'FLEET_MANAGER' | 'WORKSHOP_SUPERVISOR' | 'DRIVER' | 'APPROVER';
