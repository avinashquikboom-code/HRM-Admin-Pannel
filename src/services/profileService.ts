import { api, getApiErrorMessage } from '@/lib/api';
import { getAuthSession, setAuthSession } from '@/lib/authStorage';
import { isDevAuthSession } from '@/lib/devAuth';
import {
  ApiProfile,
  ApiProfileUser,
  mapApiProfileResponse,
  mapUpdatedProfile,
  resolveAvatarUrl,
} from '@/lib/profileMapper';
import type { User } from '@/store/slices/authSlice';

export interface AdminProfileResponse {
  profile: ApiProfile;
  user: ApiProfileUser;
}

export interface UpdateProfileRequest {
  fullName: string;
  phone: string;
  bio?: string;
  email?: string;
}

interface UpdateProfileResponse {
  message: string;
  profile: ApiProfile;
}

export async function fetchAdminProfile(): Promise<User> {
  try {
    const { data } = await api.get<AdminProfileResponse>('/api/admin/profile');
    return mapApiProfileResponse(data.profile, data.user);
  } catch (error) {
    if (isDevAuthSession()) {
      const session = getAuthSession();
      if (session?.user) {
        return session.user;
      }
    }
    throw new Error(
      getApiErrorMessage(error, 'Failed to load profile. Please try again.')
    );
  }
}

export async function updateAdminProfile(
  payload: UpdateProfileRequest,
  currentUser: Pick<User, 'id' | 'role'>
): Promise<{ message: string; user: User }> {
  try {
    const { data } = await api.put<UpdateProfileResponse>(
      '/api/admin/profile',
      payload
    );

    return {
      message: data.message,
      user: mapUpdatedProfile(data.profile, currentUser),
    };
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, 'Failed to update profile. Please try again.')
    );
  }
}

export interface UploadAvatarRequest {
  avatarUrl?: string;
  imageBase64?: string;
}

export async function uploadAdminAvatar(
  payload: UploadAvatarRequest,
  currentUser: Pick<User, 'id' | 'role'>
): Promise<{ message: string; user: User }> {
  try {
    const { data } = await api.post<UpdateProfileResponse>(
      '/api/admin/profile/avatar',
      payload
    );

    const updatedUser = mapUpdatedProfile(data.profile, currentUser);

    // Persist to localStorage so the avatar survives page refreshes
    if (isDevAuthSession()) {
      const session = getAuthSession();
      if (session) {
        setAuthSession({ ...session, user: updatedUser });
      }
    }

    return { message: data.message, user: updatedUser };
  } catch (error) {
    // Offline fallback: persist the base64 avatar directly to the local session
    if (isDevAuthSession() && payload.imageBase64) {
      const session = getAuthSession();
      if (session?.user) {
        const resolvedAvatar = resolveAvatarUrl(payload.imageBase64);
        const updatedUser: User = {
          ...session.user,
          avatar: resolvedAvatar,
          profile: session.user.profile
            ? { ...session.user.profile, avatarUrl: payload.imageBase64 }
            : session.user.profile,
        };
        setAuthSession({ ...session, user: updatedUser });
        return { message: 'Avatar updated (offline mode).', user: updatedUser };
      }
    }
    throw new Error(
      getApiErrorMessage(error, 'Failed to upload avatar. Please try again.')
    );
  }
}

export async function removeAdminAvatar(
  currentUser: Pick<User, 'id' | 'role'>
): Promise<{ message: string; user: User }> {
  try {
    const { data } = await api.delete<UpdateProfileResponse>(
      '/api/admin/profile/avatar'
    );

    const updatedUser = mapUpdatedProfile(data.profile, currentUser);

    // Persist removal to localStorage so it survives page refreshes
    if (isDevAuthSession()) {
      const session = getAuthSession();
      if (session) {
        setAuthSession({ ...session, user: updatedUser });
      }
    }

    return { message: data.message, user: updatedUser };
  } catch (error) {
    // Offline fallback: clear avatar from local session
    if (isDevAuthSession()) {
      const session = getAuthSession();
      if (session?.user) {
        const updatedUser: User = {
          ...session.user,
          avatar: '/favicon.svg',
          profile: session.user.profile
            ? { ...session.user.profile, avatarUrl: null }
            : session.user.profile,
        };
        setAuthSession({ ...session, user: updatedUser });
        return { message: 'Avatar removed (offline mode).', user: updatedUser };
      }
    }
    throw new Error(
      getApiErrorMessage(error, 'Failed to remove avatar. Please try again.')
    );
  }
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read image file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
}
