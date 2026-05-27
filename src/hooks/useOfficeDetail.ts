'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import { fetchOfficeById, type OfficeDetail } from '@/services/officeService';

export function useOfficeDetail(officeId: string | null) {
  const token = useAppSelector((state) => state.auth.token);
  const [office, setOffice] = useState<OfficeDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const loadOffice = useCallback(
    async (targetOfficeId?: string) => {
      const id = targetOfficeId ?? officeId;

      if (!token || !id) {
        setOffice(null);
        setError('');
        setIsLoading(false);
        return null;
      }

      setIsLoading(true);
      setError('');

      try {
        const data = await fetchOfficeById(id);
        setOffice(data);
        return data;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to load office details';
        setError(message);
        setOffice(null);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [officeId, token]
  );

  useEffect(() => {
    loadOffice();
  }, [loadOffice]);

  return {
    office,
    isLoading,
    error,
    refetch: loadOffice,
  };
}
