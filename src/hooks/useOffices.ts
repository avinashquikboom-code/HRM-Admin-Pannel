'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import { fetchOffices, type Office } from '@/services/officeService';

export function useOffices() {
  const token = useAppSelector((state) => state.auth.token);
  const [offices, setOffices] = useState<Office[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadOffices = useCallback(async () => {
    if (!token) {
      setOffices([]);
      setError('');
      setIsLoading(false);
      return [];
    }

    setIsLoading(true);
    setError('');

    try {
      const data = await fetchOffices();
      setOffices(data);
      return data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load offices';
      setError(message);
      setOffices([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadOffices();
  }, [loadOffices]);

  return {
    offices,
    isLoading,
    error,
    refetch: loadOffices,
  };
}
