'use client';

import { Battery, MapPin, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import type { EmployeeLiveLocation } from '@/services/locationService';

interface EmployeeDetailCardProps {
  employee: EmployeeLiveLocation | null;
  onClose: () => void;
  onForceBreach?: (employeeId: number) => void;
  onRecallToOffice?: (employeeId: number) => void;
}

export default function EmployeeDetailCard({
  employee,
  onClose,
  onForceBreach,
  onRecallToOffice,
}: EmployeeDetailCardProps) {
  const showDevControls = false;

  return (
    <AnimatePresence mode="wait">
      {employee ? (
        <motion.div
          key={employee.employeeId}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="glass-card p-5 space-y-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-sm shrink-0">
                {employee.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-text-primary truncate">
                  {employee.name}
                </h4>
                <p className="text-xs text-text-secondary truncate">
                  {employee.role}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-surface-variant text-text-secondary"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>

          <div
            className={cn(
              'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide',
              employee.status === 'In Office' &&
                'bg-success/10 text-success',
              employee.status === 'Outside Geofence' &&
                'bg-warning/10 text-warning',
              employee.status === 'On Leave' && 'bg-muted/10 text-muted'
            )}
          >
            <span
              className={cn(
                'w-2 h-2 rounded-full',
                employee.status === 'In Office' && 'bg-success',
                employee.status === 'Outside Geofence' &&
                  'bg-warning animate-pulse',
                employee.status === 'On Leave' && 'bg-muted'
              )}
            />
            {employee.status === 'Outside Geofence'
              ? 'Outside geofence'
              : employee.status}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-surface-variant/60 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
                Coordinates
              </p>
              <p className="text-xs font-mono font-semibold text-text-primary mt-1">
                {employee.status === 'On Leave'
                  ? '—'
                  : `${employee.lat.toFixed(5)}, ${employee.lng.toFixed(5)}`}
              </p>
            </div>
            <div className="rounded-xl bg-surface-variant/60 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
                Speed
              </p>
              <p className="text-xs font-semibold text-primary mt-1">
                {employee.speed}
              </p>
            </div>
            <div className="rounded-xl bg-surface-variant/60 p-3 col-span-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted flex items-center gap-1">
                <Battery size={10} /> Device battery
              </p>
              <p className="text-xs font-semibold text-text-primary mt-1">
                {employee.battery}
              </p>
            </div>
          </div>

          {employee.status !== 'On Leave' && (
            <p className="text-xs text-text-secondary flex items-start gap-1.5">
              <MapPin size={14} className="shrink-0 mt-0.5 text-primary" />
              {employee.status === 'In Office'
                ? 'Employee is within the configured office geofence.'
                : 'Employee is outside the allowed punch radius.'}
            </p>
          )}

          {showDevControls && employee.status !== 'On Leave' && (
            <div className="pt-2 border-t border-border space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
                Dev simulation
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onForceBreach?.(employee.employeeId)}
                  disabled={employee.status === 'Outside Geofence'}
                  className="btn-danger py-2 text-xs rounded-xl disabled:opacity-40"
                >
                  Simulate breach
                </button>
                <button
                  type="button"
                  onClick={() => onRecallToOffice?.(employee.employeeId)}
                  disabled={employee.status === 'In Office'}
                  className="btn-primary py-2 text-xs rounded-xl disabled:opacity-40"
                >
                  Return to office
                </button>
              </div>
            </div>
          )}
        </motion.div>
      ) : (
        <motion.div
          key="empty"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="glass-card p-8 flex flex-col items-center justify-center text-center min-h-[200px]"
        >
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
            <MapPin size={22} />
          </div>
          <p className="font-semibold text-text-primary text-sm">
            No employee selected
          </p>
          <p className="text-xs text-text-secondary mt-1 max-w-[220px]">
            Select someone on the map or in the list below to view their location
            details.
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
