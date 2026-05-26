import type { User } from '@/store/slices/authSlice';

export const DEFAULT_DEV_EMAIL = 'admin@hrm.com';
export const DEFAULT_DEV_PASSWORD = '123456';
export const DEV_AUTH_TOKEN = 'dev-local-auth-token';

export function matchesDevCredentials(email: string, password: string) {
  return (
    email.trim().toLowerCase() === DEFAULT_DEV_EMAIL &&
    password === DEFAULT_DEV_PASSWORD
  );
}

export function isDevAuthSession(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const raw = localStorage.getItem('hrm_auth');
    if (!raw) return false;
    const session = JSON.parse(raw) as { token?: string };
    return session.token === DEV_AUTH_TOKEN;
  } catch {
    return false;
  }
}

export function createDevAuthSession(): { token: string; user: User } {
  const now = new Date().toISOString();

  return {
    token: DEV_AUTH_TOKEN,
    user: {
      id: '1',
      name: 'Admin',
      email: DEFAULT_DEV_EMAIL,
      role: 'ADMIN',
      avatar: '/assets/admin-avatar.png',
      phone: '',
      bio: 'Offline demo administrator',
      profile: {
        id: 1,
        userId: 1,
        email: DEFAULT_DEV_EMAIL,
        fullName: 'Admin',
        phone: '',
        avatarUrl: null,
        timezone: 'Asia/Kolkata',
        timezoneLabel: 'India Standard Time (IST)',
        bio: 'Offline demo administrator',
        security: {
          twoFactorEnabled: false,
          twoFactorStatus: 'Disabled',
          lastLoginAt: now,
          lastLoginLocation: 'Local device',
          clearanceLevel: 5,
          clearanceLabel: 'Super Admin',
        },
        createdAt: now,
        updatedAt: now,
      },
    },
  };
}
