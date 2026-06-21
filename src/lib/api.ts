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
  setAuthSession,
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
  timeout: 30000, // 30 second timeout for all requests
});

if (typeof window !== 'undefined' && isApiLoggingEnabled()) {
  console.info(
    `[HRM] API client → ${API_BASE_URL || window.location.origin}/api/* (backend: ${getBackendApiTarget()})`
  );
  console.info('[HRM] API logging enabled — open DevTools Console to inspect requests');
}

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
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
  async (error) => {
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
      requestUrl.includes('/api/auth/register') ||
      requestUrl.includes('/api/auth/refresh');

    if (isAuthRequest) {
      return Promise.reject(error);
    }

    const activePortal = resolvePortalFromWindow();
    const activeRole = store.getState().auth.user?.role;
    const currentToken = getAuthToken(activePortal, activeRole);

    if (!currentToken) {
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

    // Try to refresh the token
    if (!isRefreshing) {
      isRefreshing = true;

      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/auth/refresh`,
          {},
          {
            headers: {
              Authorization: `Bearer ${currentToken}`,
            },
            withCredentials: true,
          }
        );

        if (response.data.success && response.data.token) {
          const newToken = response.data.token;
          const session = getAuthSession(activePortal, activeRole);

          if (session) {
            setAuthSession({
              ...session,
              token: newToken,
            });
          }

          onTokenRefreshed(newToken);
          isRefreshing = false;

          // Retry the original request with new token
          if (error.config) {
            error.config.headers.Authorization = `Bearer ${newToken}`;
            return api.request(error.config);
          }
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        isRefreshing = false;
        refreshSubscribers = [];

        // Refresh failed, logout user
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
    } else {
      // Wait for the refresh to complete
      return new Promise((resolve) => {
        subscribeTokenRefresh((token: string) => {
          if (error.config) {
            error.config.headers.Authorization = `Bearer ${token}`;
            resolve(api.request(error.config));
          }
        });
      });
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
