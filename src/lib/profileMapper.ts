import type { User, UserProfile } from '@/store/slices/authSlice';

export interface ApiProfile {
  id: number;
  userId: number;
  email: string;
  fullName: string;
  phone: string;
  avatarUrl: string | null;
  timezone: string;
  timezoneLabel: string;
  bio: string;
  security: UserProfile['security'];
  createdAt: string;
  updatedAt: string;
}

export interface ApiProfileUser {
  id: number;
  email: string;
  role: string;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5002';

export function resolveAvatarUrl(avatarUrl: string | null | undefined): string {
  if (!avatarUrl) {
    return '/favicon.svg';
  }

  if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://') || avatarUrl.startsWith('data:')) {
    return avatarUrl;
  }

  const base = API_BASE_URL.replace(/\/$/, '');
  const path = avatarUrl.startsWith('/') ? avatarUrl : `/${avatarUrl}`;
  return `${base}${path}`;
}

export function mapApiProfile(profile: ApiProfile): UserProfile {
  return {
    id: profile.id,
    userId: profile.userId,
    email: profile.email,
    fullName: profile.fullName,
    phone: profile.phone,
    avatarUrl: profile.avatarUrl,
    timezone: profile.timezone,
    timezoneLabel: profile.timezoneLabel,
    bio: profile.bio,
    security: profile.security,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  };
}

export function mapApiProfileResponse(
  profile: ApiProfile,
  apiUser: ApiProfileUser
): User {
  const mappedProfile = mapApiProfile(profile);
  const emailName = apiUser.email.split('@')[0];
  const fallbackName =
    emailName.charAt(0).toUpperCase() + emailName.slice(1);

  return {
    id: apiUser.id,
    email: apiUser.email,
    role: apiUser.role,
    name: mappedProfile.fullName || fallbackName,
    phone: mappedProfile.phone,
    bio: mappedProfile.bio,
    avatar: resolveAvatarUrl(mappedProfile.avatarUrl),
    profile: mappedProfile,
  };
}

export function mapUpdatedProfile(
  profile: ApiProfile,
  existingUser: Pick<User, 'id' | 'role'>
): User {
  return mapApiProfileResponse(profile, {
    id: existingUser.id,
    email: profile.email,
    role: existingUser.role,
  });
}

export function formatLastLogin(isoDate: string) {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}
