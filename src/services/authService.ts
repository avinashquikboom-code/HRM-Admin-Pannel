import { api, getApiErrorMessage } from '@/lib/api';
import {
  createDevAuthSession,
  isDevAuthSession,
  matchesEmployeeDevCredentials,
  matchesPlatformDevCredentials,
  matchesSuperAdminDevCredentials,
} from '@/lib/devAuth';
import { getAuthToken, writeTokenCookie } from '@/lib/authStorage';
import { mapApiProfileResponse } from '@/lib/profileMapper';
import {
  resolveLoginLocationQuick,
  setLoginLocationBanner,
} from '@/lib/loginLocation';
import {
  roleAllowedForPortal,
  type PortalType,
} from '@/lib/portals';
import type { User } from '@/store/slices/authSlice';

export interface LoginRequest {
  email: string;
  password: string;
}

interface LoginApiUser {
  id: number;
  email: string;
  role: string;
  profile?: Parameters<typeof mapApiProfileResponse>[0] | null;
}

interface LoginApiResponse {
  token: string;
  currentLoginLocation?: string;
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
    id: apiUser.id,
    email: apiUser.email,
    role: apiUser.role.toUpperCase(),
    name: fallbackName,
    avatar: '/favicon.svg',
  };
}

async function tryApiLogin(
  credentials: LoginRequest,
  portal: PortalType
) {
  const loginLocation = await resolveLoginLocationQuick();
  const { data } = await api.post<LoginApiResponse>('/api/auth/login', {
    ...credentials,
    loginLocation,
  });

  const user = mapLoginUser(data.user);

  if (!roleAllowedForPortal(user.role, portal)) {
    const messages: Record<PortalType, string> = {
      super_admin:
        'This account cannot access Super Admin. Use an ADMIN account.',
      platform_admin:
        'This account cannot access Admin Panel. Use an HR (Admin) account.',
      employee:
        'This account cannot access Employee Portal. Use an EMPLOYEE account.',
    };
    throw new Error(messages[portal]);
  }

  const resolvedLocation =
    data.currentLoginLocation ||
    data.user.profile?.security?.lastLoginLocation ||
    loginLocation;

  setLoginLocationBanner(resolvedLocation);

  return {
    token: data.token,
    user,
    portal,
  };
}

function tryDevLogin(portal: PortalType) {
  const loginLocation = 'Local device';
  setLoginLocationBanner(loginLocation);
  const session = createDevAuthSession(portal);
  if (session.user.profile?.security) {
    session.user.profile.security.lastLoginLocation = loginLocation;
  }
  return session;
}

export async function loginRequest(
  credentials: LoginRequest,
  portal: PortalType
) {
  try {
    return await tryApiLogin(credentials, portal);
  } catch (apiError) {
    const canUseSuperAdminDemo =
      portal === 'super_admin' &&
      matchesSuperAdminDevCredentials(credentials.email, credentials.password);

    const canUsePlatformDemo =
      portal === 'platform_admin' &&
      matchesPlatformDevCredentials(credentials.email, credentials.password);

    const canUseEmployeeDemo =
      portal === 'employee' &&
      matchesEmployeeDevCredentials(credentials.email, credentials.password);

    if (canUseSuperAdminDemo || canUsePlatformDemo || canUseEmployeeDemo) {
      console.info('[HRM] API login unavailable — using offline demo session');
      return tryDevLogin(portal);
    }

    throw new Error(
      getApiErrorMessage(apiError, 'Login failed. Please try again.')
    );
  }
}

export type RegisterRole = 'EMPLOYEE' | 'HR';

export interface RegisterRequest {
  email: string;
  password: string;
  role: RegisterRole;
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
  token?: string;
}

function assertRegisterAuthToken() {
  if (isDevAuthSession()) {
    throw new Error('Registration is unavailable. Please sign in again.');
  }

  const token = getAuthToken();
  if (!token) {
    throw new Error('Please sign in again.');
  }
}

export async function registerUser(payload: RegisterRequest) {
  assertRegisterAuthToken();

  const normalizedRole = payload.role.toUpperCase() as RegisterRole;
  if (normalizedRole !== 'EMPLOYEE' && normalizedRole !== 'HR') {
    throw new Error('Role must be EMPLOYEE or HR.');
  }

  try {
    const { data } = await api.post<RegisterResponse>(
      '/api/auth/register',
      {
        email: payload.email.trim().toLowerCase(),
        password: payload.password,
        role: normalizedRole,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (data.token) {
      writeTokenCookie(data.token);
    }

    return data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, 'Registration failed. Please try again.')
    );
  }
}
