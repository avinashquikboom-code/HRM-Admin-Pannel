'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import {
  fetchTodayAttendance,
  type AttendanceRecord,
} from '@/services/attendanceService';

export function useTodayAttendance() {
  const token = useAppSelector((state) => state.auth.token);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadRecords = useCallback(async () => {
    if (!token) {
      setRecords([]);
      setError('');
      setIsLoading(false);
      return [];
    }

    setIsLoading(true);
    setError('');

    try {
      const data = await fetchTodayAttendance();
      setRecords(data);
      return data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load attendance';
      setError(message);
      setRecords([]);
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
    isLoading,
    error,
    refetch: loadRecords,
  };
}
