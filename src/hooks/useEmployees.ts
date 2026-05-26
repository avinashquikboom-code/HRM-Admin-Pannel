'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import { fetchEmployees, type AdminEmployee } from '@/services/employeeService';

export function useEmployees() {
  const token = useAppSelector((state) => state.auth.token);
  const [employees, setEmployees] = useState<AdminEmployee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadEmployees = useCallback(async () => {
    if (!token) {
      setEmployees([]);
      setError('');
      setIsLoading(false);
      return [];
    }

    setIsLoading(true);
    setError('');

    try {
      const data = await fetchEmployees();
      setEmployees(data);
      return data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load employees';
      setError(message);
      setEmployees([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  return {
    employees,
    isLoading,
    error,
    refetch: loadEmployees,
  };
}
