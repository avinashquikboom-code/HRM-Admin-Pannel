import { api, getApiErrorMessage } from '@/lib/api';
import { mapApiProfileResponse } from '@/lib/profileMapper';
import type { User } from '@/store/slices/authSlice';

export interface LoginRequest {
  email: string;
  password: string;
}

interface LoginApiUser {
  id: number;
  email: string;
  role: string;
  employee: unknown | null;
  profile: Parameters<typeof mapApiProfileResponse>[0] | null;
}

interface LoginApiResponse {
  token: string;
  user: LoginApiUser;
}

function mapLoginUser(apiUser: LoginApiUser): User {
  if (apiUser.profile) {
    return mapApiProfileResponse(apiUser.profile, apiUser);
  }

  const emailName = apiUser.email.split('@')[0];
  const fallbackName =
    emailName.charAt(0).toUpperCase() + emailName.slice(1);

  return {
    id: String(apiUser.id),
    email: apiUser.email,
    role: apiUser.role,
    name: fallbackName,
    avatar: '/assets/admin-avatar.png',
  };
}

export async function loginRequest(credentials: LoginRequest) {
  try {
    const { data } = await api.post<LoginApiResponse>(
      '/api/auth/login',
      credentials
    );

    return {
      token: data.token,
      user: mapLoginUser(data.user),
    };
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Login failed. Please try again.'));
  }
}

export interface RegisterRequest {
  email: string;
  password: string;
  role: string;
}

export interface RegisteredUser {
  id: number;
  email: string;
  role: string;
  createdAt: string;
}

export interface RegisterResponse {
  message: string;
  user: RegisteredUser;
}

export async function registerUser(payload: RegisterRequest) {
  try {
    const { data } = await api.post<RegisterResponse>(
      '/api/auth/register',
      payload
    );

    return data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, 'Registration failed. Please try again.')
    );
  }
}
