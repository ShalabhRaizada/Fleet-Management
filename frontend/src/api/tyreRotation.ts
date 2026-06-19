import { api } from './client';
import type { PagedResult } from '../types/api';
import type {
  TyreAssetType, TyreLayout, TyrePosition, TyreRotationCreateInput,
  TyreRotationDetail, TyreRotationHeader, TyreHistoryResponse,
} from '../types/tyreRotation';

export interface TyreRotationListParams {
  page?: number;
  pageSize?: number;
  assetId?: string;
  status?: string;
  workshopId?: string;
  dateFrom?: string;
  dateTo?: string;
  tyreSerial?: string;
}

function toQuery<T extends object>(params: T): string {
  const usp = new URLSearchParams();
  Object.entries(params as Record<string, string | number | undefined | null>).forEach(([k, v]) => {
    if (v !== undefined && v !== '') usp.set(k, String(v));
  });
  const s = usp.toString();
  return s ? `?${s}` : '';
}

export const tyreRotationApi = {
  list: (params: TyreRotationListParams = {}) =>
    api.get<PagedResult<TyreRotationHeader>>(`/tyre-rotations${toQuery(params)}`),
  get: (rotationId: string) => api.get<TyreRotationDetail>(`/tyre-rotations/${rotationId}`),
  create: (payload: TyreRotationCreateInput) => api.post<TyreRotationHeader>('/tyre-rotations', payload),
  update: (rotationId: string, payload: TyreRotationCreateInput) =>
    api.put<TyreRotationDetail>(`/tyre-rotations/${rotationId}`, payload),
  submit: (rotationId: string, destinationStatusByTyre?: Record<string, string>) =>
    api.post<TyreRotationDetail & { alerts: { tyreId: string; serial: string; reason: string }[] }>(
      `/tyre-rotations/${rotationId}/submit`,
      { destinationStatusByTyre }
    ),
  approve: (rotationId: string) => api.post<TyreRotationDetail>(`/tyre-rotations/${rotationId}/approve`, {}),
  validate: (payload: TyreRotationCreateInput) =>
    api.post<{ valid: boolean; errors: string[] }>('/tyre-rotations/validate', payload),
};

export const tyrePositionApi = {
  list: (assetType?: TyreAssetType, axleConfiguration?: string) =>
    api.get<TyrePosition[]>(`/tyre-positions${toQuery({ assetType, axleConfiguration })}`),
};

export function getTyreLayout(assetType: TyreAssetType, assetId: string) {
  return api.get<TyreLayout>(`/assets/${assetType}/${assetId}/tyre-layout`);
}

export function getTyreHistory(tyreId: string) {
  return api.get<TyreHistoryResponse>(`/tyres/${tyreId}/history`);
}
