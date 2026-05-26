'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateUser } from '@/store/slices/authSlice';
import { fetchAdminProfile } from '@/services/profileService';
import { isDevAuthSession } from '@/lib/devAuth';
import type { User } from '@/store/slices/authSlice';

export function useAdminProfile() {
  const dispatch = useAppDispatch();
  const { user, token } = useAppSelector((state) => state.auth);
  const hasCachedProfile = Boolean(user?.profile) || isDevAuthSession();
  const [isLoading, setIsLoading] = useState(!hasCachedProfile);
  const [error, setError] = useState('');

  const loadProfile = useCallback(async () => {
    if (!token) {
      setError('Not authenticated');
      setIsLoading(false);
      return null;
    }

    if (isDevAuthSession()) {
      setError('');
      setIsLoading(false);
      return user;
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
      return user;
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, token, user]);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    if (hasCachedProfile) {
      setIsLoading(false);
      setError('');
      return;
    }

    loadProfile();
  }, [token, hasCachedProfile, loadProfile]);

  return {
    user: user as User | null,
    profile: user?.profile,
    isLoading,
    error,
    refetch: loadProfile,
  };
}
