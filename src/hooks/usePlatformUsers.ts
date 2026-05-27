'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import { fetchPlatformUsers, type PlatformUser } from '@/services/userService';

export function usePlatformUsers() {
  const token = useAppSelector((state) => state.auth.token);
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadUsers = useCallback(async () => {
    if (!token) {
      setUsers([]);
      setError('');
      setIsLoading(false);
      return [];
    }

    setIsLoading(true);
    setError('');

    try {
      const data = await fetchPlatformUsers();
      setUsers(data);
      return data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load platform users';
      setError(message);
      setUsers([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  return {
    users,
    isLoading,
    error,
    refetch: loadUsers,
    setUsers,
  };
}
