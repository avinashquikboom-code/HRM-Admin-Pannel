'use client';

import { Battery, Search } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { EmployeeLiveLocation } from '@/services/locationService';
import type { LocationStatusFilter } from '../types';

interface LocationRosterProps {
  employees: EmployeeLiveLocation[];
  selectedEmpId: number | null;
  onSelectEmployee: (id: number) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: LocationStatusFilter;
  onStatusFilterChange: (value: LocationStatusFilter) => void;
}

const FILTER_OPTIONS: { value: LocationStatusFilter; label: string }[] = [
  { value: 'All', label: 'All statuses' },
  { value: 'In Office', label: 'In office' },
  { value: 'Outside', label: 'Outside geofence' },
  { value: 'On Leave', label: 'On leave' },
];

function statusBadge(status: string) {
  if (status === 'In Office') {
    return 'bg-success/10 text-success border-success/15';
  }
  if (status === 'Outside Geofence') {
    return 'bg-warning/10 text-warning border-warning/15';
  }
  return 'bg-muted/10 text-muted border-border';
}

function displayStatus(status: string) {
  if (status === 'Outside Geofence') return 'Outside';
  return status;
}

export default function LocationRoster({
  employees,
  selectedEmpId,
  onSelectEmployee,
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}: LocationRosterProps) {
  return (
    <div className="glass-card overflow-hidden">
      <div className="px-5 py-4 border-b border-border space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="heading-2">Employee locations</h3>
            <p className="text-xs text-text-secondary mt-0.5">
              {employees.length} shown
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name or role..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-surface-variant border border-transparent focus:border-primary/20 rounded-xl outline-none focus:ring-2 focus:ring-primary/10 text-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) =>
              onStatusFilterChange(e.target.value as LocationStatusFilter)
            }
            className="sm:w-44 bg-surface-variant border border-transparent rounded-xl px-3 py-2.5 text-sm font-medium text-text-secondary outline-none"
          >
            {FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface-variant/50 text-xs uppercase tracking-wider text-text-secondary">
              <th className="px-5 py-3 font-bold">Employee</th>
              <th className="px-5 py-3 font-bold">Status</th>
              <th className="px-5 py-3 font-bold hidden md:table-cell">
                Coordinates
              </th>
              <th className="px-5 py-3 font-bold text-right">Speed / Battery</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {employees.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-5 py-10 text-center text-sm text-text-secondary"
                >
                  No employees match your filters.
                </td>
              </tr>
            ) : (
              employees.map((emp) => (
                <tr
                  key={emp.employeeId}
                  onClick={() => onSelectEmployee(emp.employeeId)}
                  className={cn(
                    'cursor-pointer transition-colors hover:bg-surface-variant/40',
                    selectedEmpId === emp.employeeId && 'bg-primary/5'
                  )}
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3 pointer-events-none">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-black shrink-0">
                        {emp.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </div>
                      <div>
                        <p className="font-semibold text-text-primary text-sm">
                          {emp.name}
                        </p>
                        <p className="text-xs text-text-secondary">{emp.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={cn(
                        'inline-flex px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide border pointer-events-none',
                        statusBadge(emp.status)
                      )}
                    >
                      {displayStatus(emp.status)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell font-mono text-xs text-text-secondary pointer-events-none">
                    {emp.status === 'On Leave'
                      ? '—'
                      : `${emp.lat.toFixed(4)}, ${emp.lng.toFixed(4)}`}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <p className="text-xs font-semibold text-primary pointer-events-none">
                      {emp.speed}
                    </p>
                    <p className="text-[10px] text-text-secondary flex items-center justify-end gap-1 mt-0.5 pointer-events-none">
                      <Battery size={10} /> {emp.battery}
                    </p>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
