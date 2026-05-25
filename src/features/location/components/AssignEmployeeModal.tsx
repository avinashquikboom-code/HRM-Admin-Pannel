'use client';

import { useEffect, useState } from 'react';
import { Loader2, UserPlus } from 'lucide-react';
import Modal from '@/components/Modal';
import {
  assignEmployeeToOffice,
  fetchEmployees,
  type AdminEmployee,
} from '@/services/employeeService';
import { cn } from '@/utils/cn';

interface AssignEmployeeModalProps {
  isOpen: boolean;
  officeId: number | null;
  officeName: string;
  onClose: () => void;
  onAssigned: (message: string, officeId: number) => void;
}

export default function AssignEmployeeModal({
  isOpen,
  officeId,
  officeName,
  onClose,
  onAssigned,
}: AssignEmployeeModalProps) {
  const [employees, setEmployees] = useState<AdminEmployee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | ''>('');
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setError('');
    setSelectedEmployeeId('');
    setIsLoadingEmployees(true);

    fetchEmployees()
      .then(setEmployees)
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load employees.');
      })
      .finally(() => setIsLoadingEmployees(false));
  }, [isOpen]);

  const handleClose = () => {
    if (isSubmitting) return;
    setError('');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!officeId || !selectedEmployeeId) return;

    setError('');
    setIsSubmitting(true);

    try {
      const result = await assignEmployeeToOffice(
        Number(selectedEmployeeId),
        officeId
      );
      onAssigned(result.message, officeId);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign employee.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableEmployees = employees.filter(
    (employee) => employee.officeId !== officeId
  );

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Assign Employee to Office">
      <form onSubmit={handleSubmit} className="space-y-5">
        <p className="text-sm text-text-secondary">
          Assign an employee to <span className="font-bold text-text-primary">{officeName}</span>.
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
          {isLoadingEmployees ? (
            <div className="flex items-center gap-2 px-4 py-3 text-sm text-text-secondary">
              <Loader2 size={16} className="animate-spin" />
              Loading employees...
            </div>
          ) : (
            <select
              value={selectedEmployeeId}
              onChange={(e) =>
                setSelectedEmployeeId(e.target.value ? Number(e.target.value) : '')
              }
              required
              className="w-full px-4 py-3 bg-surface-variant rounded-2xl outline-none focus:ring-2 focus:ring-primary/50 text-text-primary font-medium"
            >
              <option value="">Select employee</option>
              {availableEmployees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.firstName} {employee.lastName} ({employee.employeeCode})
                  {employee.office ? ` — currently at ${employee.office.name}` : ' — unassigned'}
                </option>
              ))}
            </select>
          )}
        </div>

        {!isLoadingEmployees && availableEmployees.length === 0 && (
          <p className="text-sm text-text-secondary">
            All employees are already assigned to this office.
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
            disabled={isSubmitting || !selectedEmployeeId || isLoadingEmployees}
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
