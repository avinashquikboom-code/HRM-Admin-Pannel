'use client';

import { useEffect, useState } from 'react';
import { Loader2, Save, X } from 'lucide-react';
import Modal from '@/components/Modal';
import { cn } from '@/utils/cn';
import { toast } from 'sonner';
import { fetchDepartments } from '@/services/departmentService';
import { fetchOffices } from '@/services/officeService';
import { fetchShifts, updateEmployee } from '@/services/employeeService';
import { fetchWorkModes, WorkMode } from '@/services/workModeService';

interface EditEmployeeModalProps {
  isOpen: boolean;
  employee: any;
  onClose: () => void;
  onUpdated: () => void;
}

export default function EditEmployeeModal({
  isOpen,
  employee,
  onClose,
  onUpdated,
}: EditEmployeeModalProps) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    designation: '',
    status: 'active',
    officeId: '',
    departmentId: '',
    shiftId: '',
    workMode: 'onsite',
    shiftType: 'morning',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [offices, setOffices] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);
  const [workModesList, setWorkModesList] = useState<WorkMode[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  useEffect(() => {
    if (isOpen && employee) {
      setForm({
        firstName: employee.firstName || '',
        lastName: employee.lastName || '',
        designation: employee.designation || '',
        status: employee.status || 'active',
        officeId: employee.officeId || '',
        departmentId: employee.departmentId || '',
        shiftId: employee.shift?.id || '',
        workMode: employee.workMode || '',
        shiftType: employee.shiftType || '',
      });
      setError('');
      loadDropdownData();
    }
  }, [isOpen, employee]);

  const loadDropdownData = async () => {
    setIsLoadingData(true);
    try {
      const [officesRes, departmentsRes, shiftsRes, workModesRes] = await Promise.all([
        fetchOffices(),
        fetchDepartments(),
        fetchShifts(),
        fetchWorkModes().catch(() => [])
      ]);
      setOffices(Array.isArray(officesRes) ? officesRes : []);
      setDepartments(Array.isArray(departmentsRes) ? departmentsRes : departmentsRes?.departments || []);
      setShifts(Array.isArray(shiftsRes) ? shiftsRes : []);
      setWorkModesList(workModesRes || []);
    } catch (err) {
      console.error('Failed to load dropdown data:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      console.log('Submitting employee update:', {
        id: employee.id,
        form
      });
      await updateEmployee(employee.id, {
        firstName: form.firstName,
        lastName: form.lastName,
        designation: form.designation,
        status: form.status,
        officeId: form.officeId || undefined,
        departmentId: form.departmentId || undefined,
        shiftId: form.shiftId || undefined,
        workMode: form.workMode || undefined,
        shiftType: form.shiftType || undefined,
      });
      toast.success('Employee updated successfully!');
      onUpdated();
      onClose();
    } catch (err: any) {
      console.error('Employee update error:', err);
      setError(err?.message || 'Failed to update employee');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Employee">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-sm">
            <p className="text-xs text-rose-500 font-semibold">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
              First Name
            </label>
            <input
              type="text"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              className="w-full px-4 py-3 bg-surface-variant border border-border rounded-sm outline-none focus:border-primary/30 transition-all text-xs font-semibold text-text-primary"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
              Last Name
            </label>
            <input
              type="text"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              className="w-full px-4 py-3 bg-surface-variant border border-border rounded-sm outline-none focus:border-primary/30 transition-all text-xs font-semibold text-text-primary"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
            Designation
          </label>
          <input
            type="text"
            value={form.designation}
            onChange={(e) => setForm({ ...form, designation: e.target.value })}
            className="w-full px-4 py-3 bg-surface-variant border border-border rounded-sm outline-none focus:border-primary/30 transition-all text-xs font-semibold text-text-primary"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
              Office
            </label>
            <select
              value={form.officeId}
              onChange={(e) => setForm({ ...form, officeId: e.target.value })}
              disabled={isLoadingData}
              className="w-full px-4 py-3 bg-surface-variant border border-border rounded-sm outline-none focus:border-primary/30 transition-all text-xs font-semibold text-text-primary disabled:opacity-50"
            >
              <option value="">Select Office</option>
              {offices.map((office) => (
                <option key={office.id} value={office.id}>
                  {office.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
              Department
            </label>
            <select
              value={form.departmentId}
              onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
              disabled={isLoadingData}
              className="w-full px-4 py-3 bg-surface-variant border border-border rounded-sm outline-none focus:border-primary/30 transition-all text-xs font-semibold text-text-primary disabled:opacity-50"
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
              Shift
            </label>
            <select
              value={form.shiftId}
              onChange={(e) => setForm({ ...form, shiftId: e.target.value })}
              disabled={isLoadingData}
              className="w-full px-4 py-3 bg-surface-variant border border-border rounded-sm outline-none focus:border-primary/30 transition-all text-xs font-semibold text-text-primary disabled:opacity-50"
            >
              <option value="">Select Shift</option>
              {shifts.map((shift) => (
                <option key={shift.id} value={shift.id}>
                  {shift.name} ({shift.startTime} - {shift.endTime})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
              Work Mode
            </label>
            <select
              value={form.workMode}
              onChange={(e) => setForm({ ...form, workMode: e.target.value })}
              className="w-full px-4 py-3 bg-surface-variant border border-border rounded-sm outline-none focus:border-primary/30 transition-all text-xs font-semibold text-text-primary"
            >
              {workModesList.length > 0 ? (
                <>
                  <option value="">Select Work Mode</option>
                  {workModesList.map((mode) => (
                    <option key={mode.id} value={mode.id}>
                      {mode.name}
                    </option>
                  ))}
                </>
              ) : (
                <>
                  <option value="">Select Work Mode</option>
                  <option value="OFFICE">Office (On-site)</option>
                  <option value="REMOTE">Remote</option>
                  <option value="HYBRID">Hybrid</option>
                </>
              )}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
            Shift Type
          </label>
          <select
            value={form.shiftType}
            onChange={(e) => setForm({ ...form, shiftType: e.target.value })}
            className="w-full px-4 py-3 bg-surface-variant border border-border rounded-sm outline-none focus:border-primary/30 transition-all text-xs font-semibold text-text-primary"
          >
            <option value="">Select Shift Type</option>
            <option value="morning">Morning</option>
            <option value="afternoon">Afternoon</option>
            <option value="night">Night</option>
            <option value="general">General</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
            Status
          </label>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="w-full px-4 py-3 bg-surface-variant border border-border rounded-sm outline-none focus:border-primary/30 transition-all text-xs font-semibold text-text-primary"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="on_leave">On Leave</option>
            <option value="terminated">Terminated</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2.5 bg-surface-variant hover:bg-surface-variant/80 text-text-secondary border border-border rounded-sm text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <X size={16} />
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-sm text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
