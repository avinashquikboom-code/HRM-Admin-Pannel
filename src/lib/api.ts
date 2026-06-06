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
  // For the super_admin portal, SUPER_ADMIN and ADMIN have separate token
  // buckets; use the currently logged-in role to target the right one.
  const activeRole = store.getState().auth.user?.role;
  const token = getAuthToken(activePortal, activeRole);

  if (token) {
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
