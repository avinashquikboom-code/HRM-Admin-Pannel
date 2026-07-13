'use client';

import { useEffect, useState } from 'react';
import { Loader2, Save, X } from 'lucide-react';
import Modal from '@/components/Modal';
import { toast } from 'sonner';
import { fetchDepartments } from '@/services/departmentService';
import { fetchStores } from '@/services/storeService';
import { fetchShifts, updateEmployee, fetchDesignations } from '@/services/employeeService';
import { fetchWorkModes, WorkMode } from '@/services/workModeService';

interface EditEmployeeModalProps {
  isOpen: boolean;
  employee: any; // AdminEmployee — id is now number
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
    designationId: '' as string,
    status: 'active',
    storeId: '' as string,
    departmentId: '' as string,
    shiftId: '' as string,
    workMode: 'OFFICE',
    shiftType: 'MORNING',
    commissionPercentage: '0',
  });

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dropdown data
  const [stores, setStores] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);
  const [designations, setDesignations] = useState<any[]>([]);
  const [workModesList, setWorkModesList] = useState<WorkMode[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // ─── Populate form from employee prop ───────────────────────────────────────
  useEffect(() => {
    if (isOpen && employee) {
      const initialStoreId = employee.storeId?.toString() || '';
      const initialDesignationId =
        employee.designationId?.toString() ||
        employee.designationRelation?.id?.toString() ||
        '';
      const initialShiftId = employee.shift?.id?.toString() || '';
      const initialShiftType = (employee.shiftType || employee.shiftTypeId || 'MORNING').toUpperCase();
      const initialWorkMode = (employee.workMode || employee.workModeId || 'OFFICE').toUpperCase();
      const initialDepartmentId =
        employee.departmentId?.toString() ||
        employee.department?.id?.toString() ||
        '';

      setForm({
        firstName: employee.firstName || '',
        lastName: employee.lastName || '',
        designationId: initialDesignationId,
        status: employee.status || 'active',
        storeId: initialStoreId,
        departmentId: initialDepartmentId,
        shiftId: initialShiftId,
        workMode: initialWorkMode,
        shiftType: initialShiftType,
        commissionPercentage: employee.commissionPercentage?.toString() || '0',
      });
      setError('');
      loadDropdownData();
    }
  }, [isOpen, employee]);

  // HopKid employees: name/status are owned by HopKid portal
  const isHopkid = employee?.source === 'HOPKID';

  // ─── Load all dropdown reference data ───────────────────────────────────────
  const loadDropdownData = async () => {
    setIsLoadingData(true);
    try {
      const [storesRes, departmentsRes, shiftsRes, designationsRes, workModesRes] =
        await Promise.allSettled([
          fetchStores(),
          fetchDepartments(),
          fetchShifts(),
          fetchDesignations(),
          fetchWorkModes().catch(() => []),
        ]);

      if (storesRes.status === 'fulfilled') {
        setStores(Array.isArray(storesRes.value) ? storesRes.value : []);
      }

      if (departmentsRes.status === 'fulfilled') {
        const raw = departmentsRes.value as any;
        const list = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.departments)
          ? raw.departments
          : [];
        setDepartments(list);
      }

      if (shiftsRes.status === 'fulfilled') {
        const raw = shiftsRes.value;
        setShifts(Array.isArray(raw) ? raw : []);
      }

      if (designationsRes.status === 'fulfilled') {
        const raw = designationsRes.value as any;
        const list = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.data)
          ? raw.data
          : [];
        setDesignations(list);
      }

      if (workModesRes.status === 'fulfilled') {
        setWorkModesList((workModesRes.value as WorkMode[]) || []);
      }
    } catch (err) {
      console.error('Failed to load dropdown data:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  // ─── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await updateEmployee(employee.id, {
        firstName: form.firstName,
        lastName: form.lastName,
        designationId: form.designationId || undefined,
        status: form.status,
        storeId: form.storeId || undefined,
        departmentId: form.departmentId || undefined,
        shiftId: form.shiftId || undefined,
        workMode: form.workMode || undefined,
        shiftType: form.shiftType || undefined,
        commissionPercentage: parseFloat(form.commissionPercentage) || 0,
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

  const inputCls =
    'w-full px-4 py-3 bg-surface-variant border border-border rounded-sm outline-none focus:border-primary/30 transition-all text-xs font-semibold text-text-primary disabled:opacity-50';
  const labelCls =
    'block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Employee">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* HopKid read-only banner */}
        {isHopkid && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-sm">
            <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold">
              🔒 HopKid Employee — Name, status, and store are managed in the HopKid portal.
              Only shift, department, commission, and work mode can be changed here.
            </p>
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-sm">
            <p className="text-xs text-rose-500 font-semibold">{error}</p>
          </div>
        )}

        {/* First Name / Last Name */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>First Name</label>
            <input
              type="text"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              className={inputCls}
              required
              disabled={isHopkid}
            />
          </div>
          <div>
            <label className={labelCls}>Last Name</label>
            <input
              type="text"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              className={inputCls}
              required
              disabled={isHopkid}
            />
          </div>
        </div>

        {/* Designation */}
        <div>
          <label className={labelCls}>Designation</label>
          <select
            value={form.designationId}
            onChange={(e) => setForm({ ...form, designationId: e.target.value })}
            disabled={isLoadingData}
            className={inputCls}
          >
            <option value="">Select Designation</option>
            {designations.map((d) => (
              <option key={d.id} value={d.id.toString()}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        {/* Store */}
        <div>
          <label className={labelCls}>Store</label>
          <select
            value={form.storeId}
            onChange={(e) => setForm({ ...form, storeId: e.target.value })}
            disabled={isLoadingData}
            className={inputCls}
          >
            <option value="">Select Store</option>
            {stores.map((store) => (
              <option key={store.id} value={store.id.toString()}>
                {store.name}
              </option>
            ))}
          </select>
        </div>

        {/* Department */}
        <div>
          <label className={labelCls}>Department</label>
          <select
            value={form.departmentId}
            onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
            disabled={isLoadingData}
            className={inputCls}
          >
            <option value="">Select Department</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id.toString()}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>

        {/* Shift + Work Mode */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Shift</label>
            <select
              value={form.shiftId}
              onChange={(e) => setForm({ ...form, shiftId: e.target.value })}
              disabled={isLoadingData}
              className={inputCls}
            >
              <option value="">Select Shift</option>
              {shifts.map((shift) => (
                <option key={shift.id} value={shift.id.toString()}>
                  {shift.name} ({shift.startTime} – {shift.endTime})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>Work Mode</label>
            <select
              value={form.workMode}
              onChange={(e) => setForm({ ...form, workMode: e.target.value })}
              className={inputCls}
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

        {/* Shift Type */}
        <div>
          <label className={labelCls}>Shift Type</label>
          <select
            value={form.shiftType}
            onChange={(e) => setForm({ ...form, shiftType: e.target.value })}
            className={inputCls}
          >
            <option value="">Select Shift Type</option>
            <option value="MORNING">Morning</option>
            <option value="AFTERNOON">Afternoon</option>
            <option value="NIGHT">Night</option>
            <option value="GENERAL">General</option>
          </select>
        </div>

        {/* Commission Percentage */}
        <div>
          <label className={labelCls}>Commission Rate (%)</label>
          <input
            type="number"
            min={0}
            max={100}
            step="0.01"
            value={form.commissionPercentage}
            onChange={(e) => setForm({ ...form, commissionPercentage: e.target.value })}
            className={inputCls}
            placeholder="e.g. 5"
          />
        </div>

        {/* Status */}
        <div>
          <label className={labelCls}>Status</label>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className={inputCls}
            disabled={isHopkid}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="on_leave">On Leave</option>
            <option value="terminated">Terminated</option>
          </select>
        </div>

        {/* Actions */}
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
