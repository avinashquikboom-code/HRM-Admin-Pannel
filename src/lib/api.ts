import axios from 'axios';
import { getApiBaseUrl, getBackendApiTarget } from '@/lib/apiConfig';
import {
  attachRequestMetadata,
  isApiLoggingEnabled,
  logApiCanceled,
  logApiError,
  logApiRequest,
  logApiResponse,
} from '@/lib/apiLogger';
import {
  getAuthSession,
  getAuthToken,
  resolvePortalFromWindow,
} from '@/lib/authStorage';
import {
  DEV_AUTH_TOKEN,
  DEV_EMPLOYEE_AUTH_TOKEN,
  DEV_PLATFORM_AUTH_TOKEN,
  isDevAuthSession,
} from '@/lib/devAuth';
import { getLoginPathForPortal } from '@/lib/portals';
import { store } from '@/store';
import { logout } from '@/store/slices/authSlice';

const API_BASE_URL = getApiBaseUrl();

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

if (typeof window !== 'undefined' && isApiLoggingEnabled()) {
  console.info(
    `[HRM] API client → ${API_BASE_URL || window.location.origin}/api/* (backend: ${getBackendApiTarget()})`
  );
  console.info('[HRM] API logging enabled — open DevTools Console to inspect requests');
}

api.interceptors.request.use((config) => {
  attachRequestMetadata(config);

  const activePortal = resolvePortalFromWindow();
  const token = getAuthToken(activePortal);
  const isLogin = config.url?.includes('/api/auth/login');
  const isRegister = config.url?.includes('/api/auth/register');
  const isAdminRoute = config.url?.includes('/api/admin/');

  if (isDevAuthSession(activePortal) && !isLogin) {
    logApiCanceled(config, 'Offline dev mode');
    return Promise.reject(new axios.CanceledError('Offline dev mode'));
  }

  if (
    (isRegister || isAdminRoute) &&
    (!token ||
      token === DEV_AUTH_TOKEN ||
      token === DEV_PLATFORM_AUTH_TOKEN ||
      token === DEV_EMPLOYEE_AUTH_TOKEN)
  ) {
    logApiCanceled(config, 'Admin token required');
    return Promise.reject(
      new axios.CanceledError(
        'Admin token required (hrm_auth / super_hrm_auth cookies)'
      )
    );
  }

  if (
    token &&
    token !== DEV_AUTH_TOKEN &&
    token !== DEV_PLATFORM_AUTH_TOKEN &&
    token !== DEV_EMPLOYEE_AUTH_TOKEN
  ) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  logApiRequest(config);
  return config;
});

api.interceptors.response.use(
  (response) => {
    logApiResponse(response);
    return response;
  },
  (error) => {
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    if (axios.isAxiosError(error)) {
      logApiError(error);
    }

    if (isDevAuthSession(resolvePortalFromWindow())) {
      return Promise.reject(error);
    }

    if (!axios.isAxiosError(error) || error.response?.status !== 401) {
      return Promise.reject(error);
    }

    const requestUrl = error.config?.url ?? '';
    const isAuthRequest =
      requestUrl.includes('/api/auth/login') ||
      requestUrl.includes('/api/auth/register');

    if (isAuthRequest || !getAuthToken()) {
      return Promise.reject(error);
    }

    const activePortal = resolvePortalFromWindow();
    const sessionPortal = getAuthSession(activePortal)?.portal ?? activePortal;
    store.dispatch(logout());

    if (typeof window !== 'undefined') {
      const loginPath = getLoginPathForPortal(sessionPortal);
      if (!window.location.pathname.startsWith(loginPath)) {
        window.location.href = loginPath;
      }
    }

    return Promise.reject(error);
  }
);

export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong') {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    return data?.message ?? fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}
