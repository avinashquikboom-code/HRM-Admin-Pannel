'use client';

import { useEffect, useState } from 'react';
import { Loader2, UserPlus, UserCheck } from 'lucide-react';
import Modal from '@/components/Modal';
import {
  assignUserToOffice,
} from '@/services/employeeService';
import {
  fetchPlatformUsers,
  type PlatformUser,
} from '@/services/userService';
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
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setError('');
    setSelectedUserId(null);
    setIsLoadingUsers(true);

    fetchPlatformUsers()
      .then((data) => setUsers(data))
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load users.');
      })
      .finally(() => setIsLoadingUsers(false));
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
      const result = await assignUserToOffice(selectedUserId, officeId);
      onAssigned(result.message, officeId);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign employee.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter out users already assigned to this office
  const availableUsers = users.filter((user) => {
    if (!user.employee) return true;
    return user.employee.office?.id.toString() !== officeId;
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
          <div className="rounded-2xl bg-error/10 border border-error/20 px-4 py-3 text-sm font-medium text-error">
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
                    'flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all',
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
                  <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xs font-black shrink-0">
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

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex-1 py-3 rounded-2xl border border-border text-text-secondary font-bold uppercase tracking-widest text-xs disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || selectedUserId === null || isLoadingUsers}
            className={cn(
              'flex-[2] py-3 rounded-2xl bg-primary text-white font-bold uppercase tracking-widest text-xs',
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
