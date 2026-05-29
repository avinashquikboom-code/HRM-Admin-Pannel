'use client';

import {
  Building2,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  User,
  UserPlus,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import type { Office } from '@/services/officeService';
import type { OfficeEmployee } from '@/services/officeService';

interface OfficeSidebarProps {
  offices: Office[];
  selectedOfficeId: string | null;
  onSelectOffice: (id: string) => void;
  onAddOffice: () => void;
  onEditOffice: (office: Office) => void;
  onDeleteOffice: (office: Office) => void;
  isDeletingOfficeId: string | null;
  isLoading: boolean;
  assignedEmployees: OfficeEmployee[];
  assignedCount: number;
  isOfficeDetailLoading: boolean;
  officeDetailError: string;
  onRetryOfficeDetail: () => void;
  onAssignEmployee: () => void;
  onUnassignEmployee: (employeeId: string, employeeName: string) => void;
  unassigningEmployeeId: string | null;
  selectedOfficeName?: string;
}

export default function OfficeSidebar({
  offices,
  selectedOfficeId,
  onSelectOffice,
  onAddOffice,
  onEditOffice,
  onDeleteOffice,
  isDeletingOfficeId,
  isLoading,
  assignedEmployees,
  assignedCount,
  isOfficeDetailLoading,
  officeDetailError,
  onRetryOfficeDetail,
  onAssignEmployee,
  onUnassignEmployee,
  unassigningEmployeeId,
  selectedOfficeName,
}: OfficeSidebarProps) {
  return (
    <div className="glass-card flex flex-col h-full min-h-[420px] overflow-hidden">
      <div className="p-5 border-b border-border flex items-center justify-between gap-3">
        <div>
          <h2 className="text-section-title">Offices</h2>
          <p className="text-xs text-text-secondary mt-1">
            {offices.length} registered location{offices.length === 1 ? '' : 's'}
          </p>
        </div>
        <button
          type="button"
          onClick={onAddOffice}
          className="btn-primary py-2 px-3 text-xs shrink-0"
        >
          <Plus size={16} />
          Add
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[280px] lg:max-h-none">
        {isLoading ? (
          [1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-20 rounded-xl bg-surface-variant animate-pulse"
            />
          ))
        ) : offices.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-6 text-center">
            <Building2 size={24} className="mx-auto text-muted mb-2" />
            <p className="text-sm font-semibold text-text-secondary">
              No offices yet
            </p>
            <p className="text-xs text-muted mt-1">
              Add an office to start geofence tracking.
            </p>
          </div>
        ) : (
          offices.map((office) => {
            const isSelected = selectedOfficeId === office.id;
            return (
              <div
                key={office.id}
                className={cn(
                  'rounded-xl border p-4 transition-all',
                  isSelected
                    ? 'border-primary/30 bg-primary/5 shadow-sm'
                    : 'border-border/60 hover:border-primary/20 bg-surface-variant/30'
                )}
              >
                <button
                  type="button"
                  onClick={() => onSelectOffice(office.id)}
                  className="w-full text-left"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        'p-2 rounded-xl shrink-0',
                        isSelected
                          ? 'bg-primary/15 text-primary'
                          : 'bg-surface-variant text-text-secondary'
                      )}
                    >
                      <Building2 size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-text-primary truncate">
                        {office.name}
                      </p>
                      <p className="text-xs text-text-secondary mt-0.5 truncate">
                        {office.address}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                          {office.code || '—'}
                        </span>
                        <span
                          className={cn(
                            'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full',
                            office.isActive
                              ? 'bg-success/10 text-success'
                              : 'bg-muted/10 text-muted'
                          )}
                        >
                          {office.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <span className="text-[10px] text-muted">
                          {office._count.employees} staff · {office.maxPunchRadiusMeters}m radius
                        </span>
                      </div>
                    </div>
                  </div>
                </button>

                <div className="flex justify-end gap-1 mt-2 pt-2 border-t border-border/40">
                  <button
                    type="button"
                    onClick={() => onEditOffice(office)}
                    className="p-1.5 rounded-lg text-text-secondary hover:text-primary hover:bg-primary/10 transition-colors"
                    title="Edit office"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteOffice(office)}
                    disabled={isDeletingOfficeId === office.id}
                    className="p-1.5 rounded-lg text-text-secondary hover:text-error hover:bg-error/10 transition-colors disabled:opacity-50"
                    title="Delete office"
                  >
                    {isDeletingOfficeId === office.id ? (
                      <RefreshCw size={14} className="animate-spin" />
                    ) : (
                      <Trash2 size={14} />
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {selectedOfficeId && (
        <div className="border-t border-border p-4 bg-surface-variant/20 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted">
                Assigned staff
              </p>
              <p className="text-sm font-semibold text-text-primary truncate">
                {selectedOfficeName ?? 'Selected office'}
              </p>
            </div>
            <button
              type="button"
              onClick={onAssignEmployee}
              className="btn-secondary py-1.5 px-2.5 text-xs shrink-0"
            >
              <UserPlus size={14} />
              Assign
            </button>
          </div>

          {officeDetailError && (
            <div className="rounded-lg bg-error/10 border border-error/20 px-3 py-2 text-xs text-error flex items-center justify-between gap-2">
              <span className="truncate">{officeDetailError}</span>
              <button
                type="button"
                onClick={onRetryOfficeDetail}
                className="font-bold uppercase tracking-wide shrink-0 hover:underline"
              >
                Retry
              </button>
            </div>
          )}

          {isOfficeDetailLoading ? (
            <div className="space-y-2">
              {[1, 2].map((item) => (
                <div
                  key={item}
                  className="h-12 rounded-lg bg-surface-variant animate-pulse"
                />
              ))}
            </div>
          ) : assignedEmployees.length > 0 ? (
            <ul className="space-y-2 max-h-40 overflow-y-auto">
              {assignedEmployees.map((employee) => (
                <li
                  key={employee.id}
                  className="flex items-center gap-3 p-2.5 rounded-lg bg-surface/80 border border-border/50"
                >
                  <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-black shrink-0">
                    {employee.firstName[0]}
                    {employee.lastName[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-text-primary truncate">
                      {employee.firstName} {employee.lastName}
                    </p>
                    <p className="text-xs text-text-secondary truncate">
                      {employee.designation ?? employee.employeeCode}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      onUnassignEmployee(
                        employee.id,
                        `${employee.firstName} ${employee.lastName}`
                      )
                    }
                    disabled={unassigningEmployeeId === employee.id}
                    className="p-1.5 rounded-lg text-text-secondary hover:text-error hover:bg-error/10 disabled:opacity-50"
                    title="Unassign"
                  >
                    {unassigningEmployeeId === employee.id ? (
                      <RefreshCw size={14} className="animate-spin" />
                    ) : (
                      <Trash2 size={14} />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          ) : assignedCount > 0 ? (
            <p className="text-xs text-text-secondary text-center py-2">
              {assignedCount} assigned — details could not be loaded.
            </p>
          ) : (
            <div className="text-center py-4">
              <User size={20} className="mx-auto text-muted mb-1" />
              <p className="text-xs text-text-secondary">
                No employees assigned to this office.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
