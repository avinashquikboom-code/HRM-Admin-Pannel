'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Building2, UserCheck, ShieldCheck } from 'lucide-react';
import Modal from '@/components/Modal';
import { assignUserToOffice } from '@/services/employeeService';
import { fetchHROffices, fetchHRDepartments, type HROffice, type HRDepartment } from '@/services/hrService';
import { cn } from '@/utils/cn';
import type { PlatformUser } from '@/services/userService';

interface LinkUserToOfficeModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: PlatformUser | null;
  onLinked: () => void;
}

export default function LinkUserToOfficeModal({
  isOpen,
  onClose,
  user,
  onLinked,
}: LinkUserToOfficeModalProps) {
  const [offices, setOffices] = useState<HROffice[]>([]);
  const [departments, setDepartments] = useState<HRDepartment[]>([]);
  const [selectedOfficeId, setSelectedOfficeId] = useState<string>('');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | undefined>();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen || !user) return;

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
      })
      .catch((err) => {
        console.error('Failed to load offices and departments:', err);
        setError('Failed to load office and department lists.');
      })
      .finally(() => setIsLoading(false));
  }, [isOpen, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedOfficeId) return;

    setError('');
    setIsSubmitting(true);

    try {
      await assignUserToOffice(user.id, selectedOfficeId, selectedDepartmentId);
      toast.success(`User ${user.name} linked to office successfully!`);
      onLinked();
      onClose();
    } catch (err) {
      console.error('[LinkUserToOfficeModal] Linking failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to link employee to office.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Link User to Employee Profile">
      <form onSubmit={handleSubmit} className="space-y-6 text-text-primary">
        <div className="p-4 bg-surface-variant/30 border border-border/50 rounded-sm">
          <p className="text-xs text-text-secondary leading-relaxed">
            You are linking portal user <span className="font-bold text-text-primary">{user?.name}</span> ({user?.email}) to an employee profile by assigning them an office. An employee profile will be automatically created if it does not exist.
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
                Link Profile & Office
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
