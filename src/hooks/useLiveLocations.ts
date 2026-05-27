'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import { fetchLiveLocations, type EmployeeLiveLocation } from '@/services/locationService';

export function useLiveLocations(isAutoRefreshing = true) {
  const token = useAppSelector((state) => state.auth.token);
  const [locations, setLocations] = useState<EmployeeLiveLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadLocations = useCallback(async () => {
    if (!token) {
      setLocations([]);
      setError('');
      setIsLoading(false);
      return [];
    }

    setIsLoading(true);
    setError('');

    try {
      const data = await fetchLiveLocations();
      setLocations(data);
      return data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load telemetry locations';
      setError(message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadLocations();
  }, [loadLocations]);

  // Telemetry Polling Loop
  useEffect(() => {
    if (!isAutoRefreshing || !token) return;

    const intervalId = setInterval(() => {
      fetchLiveLocations()
        .then((data) => {
          setLocations(data);
          setError('');
        })
        .catch((err) => {
          console.error('[Telemetry Polling Error]:', err);
        });
    }, 10000); // 10 seconds polling interval

    return () => clearInterval(intervalId);
  }, [isAutoRefreshing, token]);

  return {
    locations,
    isLoading,
    error,
    refetch: loadLocations,
    setLocations,
  };
}
