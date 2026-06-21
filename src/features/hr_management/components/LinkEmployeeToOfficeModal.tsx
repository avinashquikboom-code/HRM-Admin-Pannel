'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Building2, UserCheck, ShieldCheck } from 'lucide-react';
import Modal from '@/components/Modal';
import { updateHREmployee, fetchHROffices, fetchHRDepartments, type HREmployee, type HROffice, type HRDepartment, type UpdateHREmployeeRequest } from '@/services/hrService';
import { cn } from '@/utils/cn';

interface LinkEmployeeToOfficeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: HREmployee | null;
  onLinked: () => void;
}

export default function LinkEmployeeToOfficeModal({
  isOpen,
  onClose,
  employee,
  onLinked,
}: LinkEmployeeToOfficeModalProps) {
  const [offices, setOffices] = useState<HROffice[]>([]);
  const [departments, setDepartments] = useState<HRDepartment[]>([]);
  const [selectedOfficeId, setSelectedOfficeId] = useState<string>('');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | undefined>();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen || !employee) return;

    setError('');
    setSelectedOfficeId('');
    setSelectedDepartmentId(undefined);
    setIsLoading(true);

    Promise.all([
      fetchHROffices(),
      fetchHRDepartments()
    ])
      .then(([officesData, departmentsData]) => {
        setOffices(officesData);
        setDepartments(departmentsData);
        
        // Pre-select existing department if matched
        const deptName = typeof employee.department === 'object' && employee.department !== null
          ? employee.department.name
          : employee.department;
        if (deptName && deptName !== 'Unassigned') {
          const matchedDept = departmentsData.find(d => d.name === deptName);
          if (matchedDept) {
            setSelectedDepartmentId(matchedDept.id);
          }
        }
      })
      .catch((err) => {
        console.error('Failed to load offices and departments:', err);
        setError('Failed to load office and department lists.');
      })
      .finally(() => setIsLoading(false));
  }, [isOpen, employee]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee || !selectedOfficeId) return;

    setError('');
    setIsSubmitting(true);

    try {
      const updateData: UpdateHREmployeeRequest = {
        firstName: employee.firstName,
        lastName: employee.lastName,
        designation: employee.designation,
        status: employee.status,
        officeId: parseInt(selectedOfficeId, 10),
        departmentId: selectedDepartmentId,
        phone: employee.phone
      };

      await updateHREmployee(employee.id, updateData);
      toast.success(`Employee ${employee.fullName} linked to office successfully!`);
      onLinked();
      onClose();
    } catch (err) {
      console.error('[LinkEmployeeToOfficeModal] Linking failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to link employee to office.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Link Employee to Office">
      <form onSubmit={handleSubmit} className="space-y-6 text-text-primary">
        <div className="p-4 bg-surface-variant/30 border border-border/50 rounded-sm">
          <p className="text-xs text-text-secondary leading-relaxed">
            You are linking employee <span className="font-bold text-text-primary">{employee?.fullName}</span> ({employee?.employeeCode}) to a physical office location. This will enable geofenced mobile check-ins for this employee.
          </p>
        </div>

        {error && (
          <div className="rounded-sm bg-error/10 border border-error/20 p-4 text-xs font-semibold text-error">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-8 gap-2 text-text-secondary text-sm">
            <Loader2 size={16} className="animate-spin" />
            Loading office and department lists...
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-muted uppercase tracking-widest ml-1">
                Office Location *
              </label>
              <div className="relative group">
                <Building2 className="absolute left-4.5 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-primary transition-colors w-5 h-5" />
                <select
                  required
                  value={selectedOfficeId}
                  onChange={(e) => setSelectedOfficeId(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full pl-13 pr-4 py-3.5 bg-slate-950/40 border border-white/5 hover:border-white/10 focus:border-primary/30 rounded-sm outline-none transition-all text-xs font-semibold text-white cursor-pointer"
                >
                  <option value="" className="bg-slate-900 text-white">Select Office (Required)</option>
                  {offices.map((off) => (
                    <option key={off.id} value={off.id.toString()} className="bg-slate-900 text-white">
                      {off.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-muted uppercase tracking-widest ml-1">
                Department
              </label>
              <div className="relative group">
                <ShieldCheck className="absolute left-4.5 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-primary transition-colors w-5 h-5" />
                <select
                  value={selectedDepartmentId || ''}
                  onChange={(e) => setSelectedDepartmentId(e.target.value ? parseInt(e.target.value) : undefined)}
                  disabled={isSubmitting}
                  className="w-full pl-13 pr-4 py-3.5 bg-slate-950/40 border border-white/5 hover:border-white/10 focus:border-primary/30 rounded-sm outline-none transition-all text-xs font-semibold text-white cursor-pointer"
                >
                  <option value="" className="bg-slate-900 text-white">Select Department (Optional)</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id} className="bg-slate-900 text-white">
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 py-3.5 rounded-sm border border-border hover:border-white/20 bg-surface-variant/40 hover:bg-surface-variant/60 text-text-secondary hover:text-white font-bold uppercase tracking-widest text-xs disabled:opacity-60 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !selectedOfficeId || isLoading}
            className={cn(
              'flex-[2] py-3.5 rounded-sm bg-primary text-white font-bold uppercase tracking-widest text-xs',
              'shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all disabled:opacity-75',
              'flex items-center justify-center gap-2 cursor-pointer'
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Linking...
              </>
            ) : (
              <>
                <UserCheck size={16} />
                Link Office & Dept
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
