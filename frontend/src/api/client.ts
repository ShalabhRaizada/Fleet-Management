import axios, { AxiosError, type AxiosRequestConfig } from 'axios';
import type { Envelope, LoginResponse } from '../types/api';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

const ACCESS_TOKEN_KEY = 'fms_access_token';
const REFRESH_TOKEN_KEY = 'fms_refresh_token';
const USER_KEY = 'fms_user';

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setSession(login: LoginResponse) {
  localStorage.setItem(ACCESS_TOKEN_KEY, login.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, login.refreshToken);
  localStorage.setItem(USER_KEY, JSON.stringify(login.user));
}

export function setAccessToken(token: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearSession() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

const http = axios.create({ baseURL: BASE_URL });

http.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise: Promise<string | null> | null = null;

async function performRefresh(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;
  try {
    const res = await axios.post<Envelope<{ accessToken: string }>>(`${BASE_URL}/auth/refresh`, { refreshToken });
    const token = res.data.data?.accessToken;
    if (token) {
      setAccessToken(token);
      return token;
    }
    return null;
  } catch {
    return null;
  }
}

http.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as (AxiosRequestConfig & { _retried?: boolean }) | undefined;
    if (error.response?.status === 401 && original && !original._retried && !original.url?.includes('/auth/')) {
      original._retried = true;
      if (!refreshPromise) {
        refreshPromise = performRefresh().finally(() => {
          refreshPromise = null;
        });
      }
      const newToken = await refreshPromise;
      if (newToken) {
        original.headers = { ...(original.headers as Record<string, string>), Authorization: `Bearer ${newToken}` };
        return http(original);
      }
      clearSession();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export class ApiError extends Error {
  status: number;
  errors: unknown[] | null;
  constructor(message: string, status: number, errors: unknown[] | null) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

async function unwrap<T>(promise: Promise<{ data: Envelope<T> }>): Promise<T> {
  try {
    const res = await promise;
    if (!res.data.success) {
      throw new ApiError(res.data.message, 400, res.data.errors);
    }
    return res.data.data as T;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    const axiosErr = err as AxiosError<Envelope<unknown>>;
    const message = axiosErr.response?.data?.message || axiosErr.message || 'Request failed';
    const status = axiosErr.response?.status || 500;
    const errors = axiosErr.response?.data?.errors || null;
    throw new ApiError(message, status, errors);
  }
}

export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig) => unwrap<T>(http.get(url, config)),
  post: <T>(url: string, body?: unknown, config?: AxiosRequestConfig) => unwrap<T>(http.post(url, body, config)),
  put: <T>(url: string, body?: unknown, config?: AxiosRequestConfig) => unwrap<T>(http.put(url, body, config)),
  delete: <T>(url: string, config?: AxiosRequestConfig) => unwrap<T>(http.delete(url, config)),
  raw: http,
  baseUrl: BASE_URL,
};
