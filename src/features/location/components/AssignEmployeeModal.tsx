'use client';

import { useEffect, useState } from 'react';
import { Loader2, UserPlus, UserCheck, Building } from 'lucide-react';
import Modal from '@/components/Modal';
import {
  assignUserToOffice,
} from '@/services/employeeService';
import {
  fetchPlatformUsers,
  type PlatformUser,
} from '@/services/userService';
import { fetchHRDepartments } from '@/services/hrService';
import { cn } from '@/utils/cn';

interface AssignEmployeeModalProps {
  isOpen: boolean;
  officeId: string | null;
  officeName: string;
  onClose: () => void;
  onAssigned: (message: string, officeId: string) => void;
}

export default function AssignEmployeeModal({
  isOpen,
  officeId,
  officeName,
  onClose,
  onAssigned,
}: AssignEmployeeModalProps) {
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | undefined>();
  const [departments, setDepartments] = useState<any[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setError('');
    setSelectedUserId(null);
    setSelectedDepartmentId(undefined);
    setIsLoadingUsers(true);
    setIsLoadingDepartments(true);

    Promise.all([
      fetchPlatformUsers()
        .then((data) => setUsers(data))
        .catch((err) => {
          setError(err instanceof Error ? err.message : 'Failed to load users.');
        })
        .finally(() => setIsLoadingUsers(false)),
      fetchHRDepartments()
        .then((data) => setDepartments(data))
        .catch((err) => {
          console.error('Failed to load departments:', err);
        })
        .finally(() => setIsLoadingDepartments(false)),
    ]);
  }, [isOpen]);

  const handleClose = () => {
    if (isSubmitting) return;
    setError('');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!officeId || selectedUserId === null) return;

    setError('');
    setIsSubmitting(true);

    try {
      const result = await assignUserToOffice(selectedUserId, officeId, selectedDepartmentId);
      onAssigned(result.message, officeId);
      onClose();
    } catch (err) {
      console.error('[AssignEmployeeModal] Assignment failed:', err);
      const message = err instanceof Error ? err.message : 'Failed to assign employee.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter out users already assigned to this office
  const availableUsers = users.filter((user) => {
    if (!user.employee || !user.employee.office) return true;
    return String(user.employee.office.id) !== String(officeId);
  });

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Assign Employee to Office">
      <form onSubmit={handleSubmit} className="space-y-5">
        <p className="text-sm text-text-secondary">
          Assign an employee to <span className="font-bold text-text-primary">{officeName}</span>.
          <span className="block mt-1 text-xs text-muted">
            Users without an employee profile will have one auto-created.
          </span>
        </p>

        {error && (
          <div className="rounded-sm bg-error/10 border border-error/20 px-4 py-3 text-sm font-medium text-error">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-xs font-black text-muted uppercase tracking-widest ml-1">
            Employee
          </label>
          {isLoadingUsers ? (
            <div className="flex items-center gap-2 px-4 py-3 text-sm text-text-secondary">
              <Loader2 size={16} className="animate-spin" />
              Loading users...
            </div>
          ) : (
            <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
              {availableUsers.map((user) => (
                <label
                  key={user.id}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-sm border cursor-pointer transition-all',
                    selectedUserId === user.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border/60 hover:border-primary/30 bg-surface-variant/30'
                  )}
                >
                  <input
                    type="radio"
                    name="selectedUser"
                    value={user.id}
                    checked={selectedUserId === user.id}
                    onChange={() => setSelectedUserId(user.id)}
                    className="sr-only"
                  />
                  <div className="w-9 h-9 rounded-sm bg-primary/10 text-primary flex items-center justify-center text-xs font-black shrink-0">
                    {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-text-primary truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-text-secondary truncate">
                      {user.email} · {user.role}
                    </p>
                  </div>
                  <div className="shrink-0">
                    {user.hasEmployeeProfile ? (
                      user.employee?.office ? (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-1 rounded-full">
                          {user.employee.office.name}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full flex items-center gap-1">
                          <UserCheck size={10} />
                          Unassigned
                        </span>
                      )
                    ) : (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted bg-muted/10 px-2 py-1 rounded-full">
                        No profile
                      </span>
                    )}
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {!isLoadingUsers && availableUsers.length === 0 && (
          <p className="text-sm text-text-secondary text-center py-4">
            All users are already assigned to this office.
          </p>
        )}

        <div className="space-y-2">
          <label className="text-xs font-black text-muted uppercase tracking-widest ml-1">
            Department
          </label>
          <div className="relative group">
            <Building className="absolute left-4.5 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-primary transition-colors w-5 h-5" />
            <select
              value={selectedDepartmentId || ''}
              onChange={(e) => setSelectedDepartmentId(e.target.value ? parseInt(e.target.value) : undefined)}
              disabled={isLoadingDepartments || isSubmitting}
              className="w-full pl-13 pr-4 py-3.5 bg-slate-950/40 border border-white/5 hover:border-white/10 focus:border-primary/30 rounded-sm outline-none transition-all text-xs font-semibold text-white disabled:opacity-60 cursor-pointer"
            >
              <option value="">Select Department (Optional)</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex-1 py-3 rounded-sm border border-border text-text-secondary font-bold uppercase tracking-widest text-xs disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || selectedUserId === null || isLoadingUsers}
            className={cn(
              'flex-[2] py-3 rounded-sm bg-primary text-white font-bold uppercase tracking-widest text-xs',
              'shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all disabled:opacity-70',
              'flex items-center justify-center gap-2'
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Assigning...
              </>
            ) : (
              <>
                <UserPlus size={16} />
                Assign Employee
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
