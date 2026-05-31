'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import {
  fetchTodayAttendance,
  type AttendanceRecord,
  type AttendanceDistributionItem,
} from '@/services/attendanceService';

export function useTodayAttendance() {
  const token = useAppSelector((state) => state.auth.token);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [distribution, setDistribution] = useState<AttendanceDistributionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadRecords = useCallback(async () => {
    if (!token) {
      setRecords([]);
      setDistribution([]);
      setError('');
      setIsLoading(false);
      return [];
    }

    setIsLoading(true);
    setError('');

    try {
      const data = await fetchTodayAttendance();
      setRecords(data.attendances);
      setDistribution(data.attendanceDistribution || []);
      return data.attendances;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load attendance';
      setError(message);
      setRecords([]);
      setDistribution([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  return {
    records,
    distribution,
    isLoading,
    error,
    refetch: loadRecords,
  };
}
