import axios from 'axios';
import { getAuthSession, getAuthToken } from '@/lib/authStorage';
import { DEV_AUTH_TOKEN, DEV_PLATFORM_AUTH_TOKEN, isDevAuthSession } from '@/lib/devAuth';
import { getLoginPathForPortal } from '@/lib/portals';
import { store } from '@/store';
import { logout } from '@/store/slices/authSlice';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5002';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  const isLogin = config.url?.includes('/api/auth/login');
  const isRegister = config.url?.includes('/api/auth/register');
  const isAdminRoute = config.url?.includes('/api/admin/');

  if (isDevAuthSession() && !isLogin) {
    return Promise.reject(new axios.CanceledError('Offline dev mode'));
  }

  if (
    (isRegister || isAdminRoute) &&
    (!token || token === DEV_AUTH_TOKEN || token === DEV_PLATFORM_AUTH_TOKEN)
  ) {
    return Promise.reject(
      new axios.CanceledError('Admin token required (hrm_auth / hrm_token cookie)')
    );
  }

  if (token && token !== DEV_AUTH_TOKEN && token !== DEV_PLATFORM_AUTH_TOKEN) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isCancel(error) || isDevAuthSession()) {
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

    store.dispatch(logout());

    if (typeof window !== 'undefined') {
      const portal = getAuthSession()?.portal ?? 'platform_admin';
      const loginPath = getLoginPathForPortal(portal);
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
