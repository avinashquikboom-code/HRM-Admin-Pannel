'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateUser } from '@/store/slices/authSlice';
import { fetchAdminProfile } from '@/services/profileService';
import type { User } from '@/store/slices/authSlice';

export function useAdminProfile() {
  const dispatch = useAppDispatch();
  const { user, token } = useAppSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(!user?.profile);
  const [error, setError] = useState('');

  const loadProfile = useCallback(async () => {
    if (!token) {
      setError('Not authenticated');
      setIsLoading(false);
      return null;
    }

    setIsLoading(true);
    setError('');

    try {
      const profileUser = await fetchAdminProfile();
      dispatch(updateUser(profileUser));
      return profileUser;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load profile';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, token]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return {
    user: user as User | null,
    profile: user?.profile,
    isLoading,
    error,
    refetch: loadProfile,
  };
}
