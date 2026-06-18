import { api } from './client';
import type { PagedResult } from '../types/api';

export interface ListParams {
  page?: number;
  pageSize?: number;
  q?: string;
  sortBy?: string;
  sortDir?: 'ASC' | 'DESC';
  [key: string]: string | number | undefined;
}

function toQuery(params: ListParams = {}): string {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== '') usp.set(k, String(v));
  });
  const s = usp.toString();
  return s ? `?${s}` : '';
}

/** Generic typed REST resource client matching the backend's generic CRUD factory shape. */
export function createResource<T>(path: string) {
  return {
    list: (params?: ListParams) => api.get<PagedResult<T>>(`${path}${toQuery(params)}`),
    get: (id: string) => api.get<T>(`${path}/${id}`),
    create: (payload: Partial<T>) => api.post<T>(path, payload),
    update: (id: string, payload: Partial<T>) => api.put<T>(`${path}/${id}`, payload),
    remove: (id: string) => api.delete<T>(`${path}/${id}`),
    exportCsvUrl: (params?: ListParams) => `${api.baseUrl}${path}${toQuery({ ...params, export: 'csv' })}`,
  };
}
