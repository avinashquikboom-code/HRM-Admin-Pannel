import axios from 'axios';
import { getAuthToken } from '@/lib/authStorage';
import { isDevAuthSession } from '@/lib/devAuth';
import { store } from '@/store';
import { logout } from '@/store/slices/authSlice';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5002';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (isDevAuthSession()) {
    return Promise.reject(new axios.CanceledError('Offline dev mode'));
  }

  const token = getAuthToken();
  if (token) {
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

    if (
      typeof window !== 'undefined' &&
      !window.location.pathname.startsWith('/login')
    ) {
      window.location.href = '/login';
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
