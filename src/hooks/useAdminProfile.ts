'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateUser } from '@/store/slices/authSlice';
import { fetchAdminProfile } from '@/services/profileService';
import type { User } from '@/store/slices/authSlice';

export function useAdminProfile() {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const hasCachedProfile = Boolean(user?.profile);
  const [isLoading, setIsLoading] = useState(!hasCachedProfile);
  const [error, setError] = useState('');

  const loadProfile = useCallback(async () => {
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
  }, [dispatch]);

  useEffect(() => {
    // Only fetch profile if authenticated
    if (isAuthenticated) {
      loadProfile();
    }
  }, [isAuthenticated, loadProfile]);

  return {
    user: user as User | null,
    profile: user?.profile,
    isLoading,
    error,
    refetch: loadProfile,
  };
}
