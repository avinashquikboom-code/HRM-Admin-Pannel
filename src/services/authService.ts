import { api, getApiErrorMessage } from '@/lib/api';
import { getAuthSession, getAuthToken, writeTokenCookie } from '@/lib/authStorage';
import { mapApiProfileResponse } from '@/lib/profileMapper';
import {
  resolveLoginLocationQuick,
  setLoginLocationBanner,
} from '@/lib/loginLocation';
import {
  portalForRole,
  normalizeUserRole,
  type PortalType,
} from '@/lib/portals';
import type { User } from '@/store/slices/authSlice';
import {
  matchesDevCredentialsForPortal,
  createDevAuthSession,
} from '@/lib/devAuth';

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
    role: normalizeUserRole(apiUser.role),
    name: fallbackName,
    avatar: '/favicon.svg',
  };
}

async function tryApiLogin(
  credentials: LoginRequest,
  portal: PortalType
) {
  const { data } = await api.post<LoginApiResponse>('/api/auth/login', {
    email: credentials.email.trim().toLowerCase(),
    password: credentials.password,
  });

  const user = mapLoginUser(data.user);
  const resolvedPortal = portalForRole(user.role);

  if (!resolvedPortal || resolvedPortal !== portal) {
    const messages: Record<PortalType, string> = {
      super_admin:
        'This account cannot access Super Admin. Use a Super Admin account.',
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
    (portal !== 'super_admin' ? await resolveLoginLocationQuick() : null);

  if (resolvedLocation && portal !== 'super_admin') {
    setLoginLocationBanner(resolvedLocation);
  }

  return {
    token: data.token,
    user,
    portal: resolvedPortal,
  };
}

export async function loginRequest(
  credentials: LoginRequest,
  portal: PortalType
) {
  // Use dev auth for local development when credentials match
  if (matchesDevCredentialsForPortal(credentials.email, credentials.password, portal)) {
    const devSession = createDevAuthSession(portal);
    return devSession;
  }

  try {
    return await tryApiLogin(credentials, portal);
  } catch (apiError) {
    throw new Error(
      getApiErrorMessage(
        apiError,
        'Invalid email or password. Please check your credentials and try again.'
      )
    );
  }
}

export type RegisterRole = 'EMPLOYEE' | 'HR';

export interface RegisterRequest {
  email: string;
  password: string;
  role: RegisterRole;
  departmentId?: number;
  firstName?: string;
  lastName?: string;
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
        departmentId: payload.departmentId,
        firstName: payload.firstName?.trim() || undefined,
        lastName: payload.lastName?.trim() || undefined,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (data.token) {
      const portal = getAuthSession()?.portal ?? 'platform_admin';
      writeTokenCookie(data.token, portal);
    }

    return data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, 'Registration failed. Please try again.')
    );
  }
}
