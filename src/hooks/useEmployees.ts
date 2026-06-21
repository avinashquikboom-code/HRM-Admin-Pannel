'use client';

import { useCallback, useEffect, useState } from 'react';
import { fetchEmployees, type AdminEmployee } from '@/services/employeeService';

export function useEmployees(enabled = true) {
  const [employees, setEmployees] = useState<AdminEmployee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadEmployees = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      console.log('[useEmployees] Fetching employees...');
      const response = await fetchEmployees();
      console.log('[useEmployees] Employees fetched successfully:', response.employees.length);
      setEmployees(response.employees);
      return response.employees;
    } catch (err) {
      console.error('[useEmployees] Error fetching employees:', err);
      const message =
        err instanceof Error ? err.message : 'Failed to load employees';
      setError(message);
      setEmployees([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      loadEmployees();
    } else {
      setIsLoading(false);
    }
  }, [loadEmployees, enabled]);

  return {
    employees,
    isLoading,
    error,
    refetch: loadEmployees,
  };
}
