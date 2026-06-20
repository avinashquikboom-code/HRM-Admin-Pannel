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

    return { message: data.message, user: updatedUser };
  } catch (error) {
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

    return { message: data.message, user: updatedUser };
  } catch (error) {
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

export interface UpdatePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export async function updateAdminPassword(
  payload: UpdatePasswordPayload
): Promise<{ message: string }> {
  // If local offline dev auth session, mock the response
  if (isDevAuthSession()) {
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    let portalKey = 'dev_pwd_super_admin';
    let defaultDevPwd = '123456';
    
    if (typeof window !== 'undefined') {
      if (localStorage.getItem('super_hrm_auth')) {
        portalKey = 'dev_pwd_super_admin';
      } else if (localStorage.getItem('hrm_auth')) {
        portalKey = 'dev_pwd_platform_admin';
      } else if (localStorage.getItem('employee_hrm_auth')) {
        portalKey = 'dev_pwd_employee';
      }
    }
    
    let currentDevPassword = defaultDevPwd;
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(portalKey);
      if (saved) {
        currentDevPassword = saved;
      }
    }
    
    if (payload.currentPassword !== currentDevPassword) {
      throw new Error('Incorrect current password.');
    }
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(portalKey, payload.newPassword);
    }
    
    return { message: 'Password updated successfully (Dev Mode).' };
  }

  try {
    const { data } = await api.put<{ message: string }>(
      '/api/admin/change-password',
      payload
    );
    return data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, 'Failed to update password. Please try again.')
    );
  }
}

