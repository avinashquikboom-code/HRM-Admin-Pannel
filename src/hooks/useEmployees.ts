'use client';

import { useCallback, useEffect, useState } from 'react';
import { fetchEmployees, type AdminEmployee } from '@/services/employeeService';

interface UseEmployeesParams {
  page?: number;
  limit?: number;
  search?: string;
  enabled?: boolean;
}

export function useEmployees(params: UseEmployeesParams = {}) {
  const { page = 1, limit = 10, search = '', enabled = true } = params;

  const [employees, setEmployees] = useState<AdminEmployee[]>([]);
  const [total, setTotal] = useState(0);
  const [registeredCount, setRegisteredCount] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [assignedCount, setAssignedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadEmployees = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      console.log('[useEmployees] Fetching employees...', { page, limit, search });
      const response = await fetchEmployees({ page, limit, search });
      console.log('[useEmployees] Employees response received:', response);
      setEmployees(response.employees || []);
      setTotal(response.total ?? 0);
      setRegisteredCount(response.registeredCount ?? 0);
      setActiveCount((response as any).activeCount ?? (response.employees || []).filter(e => e.status?.toUpperCase() === 'ACTIVE').length);
      setAssignedCount((response as any).assignedCount ?? 0);
      return response.employees;
    } catch (err) {
      console.error('[useEmployees] Error fetching employees:', err);
      const message =
        err instanceof Error ? err.message : 'Failed to load employees';
      setError(message);
      setEmployees([]);
      setTotal(0);
      setRegisteredCount(0);
      setActiveCount(0);
      setAssignedCount(0);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, search]);

  useEffect(() => {
    if (enabled) {
      loadEmployees();
    } else {
      setIsLoading(false);
    }
  }, [loadEmployees, enabled]);

  return {
    employees,
    total,
    registeredCount,
    activeCount,
    assignedCount,
    isLoading,
    error,
    refetch: loadEmployees,
  };
}
