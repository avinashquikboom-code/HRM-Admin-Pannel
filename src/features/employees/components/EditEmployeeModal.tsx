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
    phone: '',
    aadharNumber: '',
    pfNumber: '',
    esicNumber: '',
    isHandicapped: false,
    currentAddress: '',
    permanentAddress: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    accountType: 'Savings',
    branchName: '',
    basicSalary: 0,
    grossSalary: 0,
    hra: 0,
    medicalAllowance: 0,
    travelAllowance: 0,
    specialAllowance: 0,
    incentive: 0,
    bonus: 0,
    advanceLimit: 25000,
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
        phone: employee.phone || employee.mobileNumber || '',
        aadharNumber: employee.aadharNumber || '',
        pfNumber: employee.pfNumber || '',
        esicNumber: employee.esicNumber || '',
        isHandicapped: employee.isHandicapped || false,
        currentAddress: employee.currentAddress || '',
        permanentAddress: employee.permanentAddress || '',
        bankName: employee.bankName || '',
        accountNumber: employee.accountNumber || '',
        ifscCode: employee.ifscCode || '',
        accountType: employee.accountType || 'Savings',
        branchName: employee.branchName || '',
        basicSalary: employee.basicSalary || employee.salaryStructure?.basicSalary || 0,
        grossSalary: employee.grossSalary || employee.salaryStructure?.grossSalary || (employee.basicSalary ? employee.basicSalary : 0),
        hra: employee.hra || 0,
        medicalAllowance: employee.medicalAllowance || 0,
        travelAllowance: employee.travelAllowance || 0,
        specialAllowance: employee.specialAllowance || 0,
        incentive: employee.incentive || 0,
        bonus: employee.bonus || 0,
        advanceLimit: employee.wallet?.advanceLimit ?? 25000,
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
        phone: form.phone || undefined,
        aadharNumber: form.aadharNumber || undefined,
        pfNumber: form.pfNumber || undefined,
        esicNumber: form.esicNumber || undefined,
        isHandicapped: form.isHandicapped,
        currentAddress: form.currentAddress || undefined,
        permanentAddress: form.permanentAddress || undefined,
        bankName: form.bankName || undefined,
        accountNumber: form.accountNumber || undefined,
        ifscCode: form.ifscCode || undefined,
        accountType: form.accountType || undefined,
        branchName: form.branchName || undefined,
        basicSalary: form.basicSalary || 0,
        grossSalary: form.grossSalary || 0,
        hra: form.hra || 0,
        medicalAllowance: form.medicalAllowance || 0,
        travelAllowance: form.travelAllowance || 0,
        specialAllowance: form.specialAllowance || 0,
        incentive: form.incentive || 0,
        bonus: form.bonus || 0,
        advanceLimit: form.advanceLimit || 0,
      } as any);
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
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-sm flex items-center justify-between">
            <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold">
              🔒 HopKid Employee — Name, mobile, store, salary, and commission rate are managed in HopKid.
            </p>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-amber-500/20 text-amber-600 dark:text-amber-300 rounded border border-amber-500/40">
              Managed in HopKid
            </span>
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
            <div className="flex items-center justify-between">
              <label className={labelCls}>First Name</label>
              {isHopkid && <span className="text-[9px] font-bold text-amber-500">Managed in HopKid</span>}
            </div>
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
            <div className="flex items-center justify-between">
              <label className={labelCls}>Last Name</label>
              {isHopkid && <span className="text-[9px] font-bold text-amber-500">Managed in HopKid</span>}
            </div>
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
          <div className="flex items-center justify-between">
            <label className={labelCls}>Store</label>
            {isHopkid && <span className="text-[9px] font-bold text-amber-500">Managed in HopKid</span>}
          </div>
          <select
            value={form.storeId}
            onChange={(e) => setForm({ ...form, storeId: e.target.value })}
            disabled={isLoadingData || isHopkid}
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
          <div className="flex items-center justify-between">
            <label className={labelCls}>Commission Rate (%)</label>
            {isHopkid && <span className="text-[9px] font-bold text-amber-500">Managed in HopKid</span>}
          </div>
          <input
            type="number"
            min={0}
            max={100}
            step="0.01"
            value={form.commissionPercentage}
            onChange={(e) => setForm({ ...form, commissionPercentage: e.target.value })}
            className={inputCls}
            placeholder="e.g. 5"
            disabled={isHopkid}
          />
        </div>

        {/* Phone Number / Mobile Number */}
        <div>
          <div className="flex items-center justify-between">
            <label className={labelCls}>Phone / Mobile Number</label>
            {isHopkid && (
              <span className="text-[9px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                Managed in HopKid
              </span>
            )}
          </div>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className={inputCls}
            placeholder="+91 9876543210"
            disabled={isHopkid}
          />
        </div>

        {/* Identification & Address Section */}
        <div className="p-4 bg-surface-variant/30 border border-border rounded-sm space-y-3">
          <h4 className="text-xs font-black text-text-secondary uppercase tracking-wider">Personal & Identification</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-black text-text-secondary uppercase tracking-wider mb-1">Aadhar Number</label>
              <input
                type="text"
                maxLength={12}
                value={form.aadharNumber}
                onChange={(e) => setForm({ ...form, aadharNumber: e.target.value })}
                className="w-full p-2 bg-surface border border-border rounded-sm text-xs font-semibold"
                placeholder="12-digit Aadhar"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-text-secondary uppercase tracking-wider mb-1">PF Number</label>
              <input
                type="text"
                value={form.pfNumber}
                onChange={(e) => setForm({ ...form, pfNumber: e.target.value })}
                className="w-full p-2 bg-surface border border-border rounded-sm text-xs font-semibold"
                placeholder="PF Number"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-text-secondary uppercase tracking-wider mb-1">ESIC Number</label>
              <input
                type="text"
                value={form.esicNumber}
                onChange={(e) => setForm({ ...form, esicNumber: e.target.value })}
                className="w-full p-2 bg-surface border border-border rounded-sm text-xs font-semibold"
                placeholder="ESIC Number"
              />
            </div>
            <div className="flex items-center gap-2 pt-4">
              <input
                type="checkbox"
                id="editIsHandicapped"
                checked={form.isHandicapped}
                onChange={(e) => setForm({ ...form, isHandicapped: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <label htmlFor="editIsHandicapped" className="text-xs font-bold text-text-primary cursor-pointer">
                Handicapped
              </label>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black text-text-secondary uppercase tracking-wider mb-1">Permanent Address</label>
            <textarea
              rows={2}
              value={form.permanentAddress}
              onChange={(e) => setForm({ ...form, permanentAddress: e.target.value })}
              className="w-full p-2 bg-surface border border-border rounded-sm text-xs font-semibold resize-none"
              placeholder="Permanent Address"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-text-secondary uppercase tracking-wider mb-1">Current Address</label>
            <textarea
              rows={2}
              value={form.currentAddress}
              onChange={(e) => setForm({ ...form, currentAddress: e.target.value })}
              className="w-full p-2 bg-surface border border-border rounded-sm text-xs font-semibold resize-none"
              placeholder="Current Address"
            />
          </div>
        </div>

        {/* Bank Details Section */}
        <div className="p-4 bg-surface-variant/30 border border-border rounded-sm space-y-3">
          <h4 className="text-xs font-black text-text-secondary uppercase tracking-wider">Bank Details</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-black text-text-secondary uppercase tracking-wider mb-1">Bank Name</label>
              <input
                type="text"
                value={form.bankName}
                onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                className="w-full p-2 bg-surface border border-border rounded-sm text-xs font-semibold"
                placeholder="e.g. HDFC Bank"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-text-secondary uppercase tracking-wider mb-1">Account Number</label>
              <input
                type="text"
                value={form.accountNumber}
                onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
                className="w-full p-2 bg-surface border border-border rounded-sm text-xs font-semibold"
                placeholder="Account number"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-text-secondary uppercase tracking-wider mb-1">IFSC Code</label>
              <input
                type="text"
                value={form.ifscCode}
                onChange={(e) => setForm({ ...form, ifscCode: e.target.value.toUpperCase() })}
                className="w-full p-2 bg-surface border border-border rounded-sm text-xs font-semibold uppercase"
                placeholder="HDFC0001234"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-text-secondary uppercase tracking-wider mb-1">Account Type</label>
              <select
                value={form.accountType}
                onChange={(e) => setForm({ ...form, accountType: e.target.value })}
                className="w-full p-2 bg-surface border border-border rounded-sm text-xs font-semibold"
              >
                <option value="Savings">Savings</option>
                <option value="Current">Current</option>
                <option value="Salary">Salary</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-[10px] font-black text-text-secondary uppercase tracking-wider mb-1">Branch Name</label>
              <input
                type="text"
                value={form.branchName}
                onChange={(e) => setForm({ ...form, branchName: e.target.value })}
                className="w-full p-2 bg-surface border border-border rounded-sm text-xs font-semibold"
                placeholder="Branch location"
              />
            </div>
          </div>
        </div>

        {/* Salary Structure Section */}
        <div className="p-4 bg-gradient-to-r from-blue-500/5 to-purple-500/5 border border-blue-500/10 rounded-sm">
          <h4 className="text-xs font-black text-primary uppercase tracking-widest mb-3">Salary Structure</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-black text-text-secondary uppercase tracking-wider mb-1">Basic Salary</label>
              <input
                type="number"
                min={0}
                value={form.basicSalary}
                onChange={(e) => {
                  const basic = parseFloat(e.target.value) || 0;
                  setForm(prev => {
                    const allowSum = prev.hra + prev.medicalAllowance + prev.travelAllowance + prev.specialAllowance + prev.incentive + prev.bonus;
                    const gross = (allowSum === 0 && basic > 0) ? basic : (basic + allowSum);
                    return {
                      ...prev,
                      basicSalary: basic,
                      grossSalary: gross
                    };
                  });
                }}
                className="w-full p-2 bg-surface border border-border rounded-sm text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-text-secondary uppercase tracking-wider mb-1">HRA</label>
              <input
                type="number"
                min={0}
                value={form.hra}
                onChange={(e) => {
                  const hra = parseFloat(e.target.value) || 0;
                  setForm(prev => ({
                    ...prev,
                    hra: hra,
                    grossSalary: prev.basicSalary + hra + prev.medicalAllowance + prev.travelAllowance + prev.specialAllowance + prev.incentive + prev.bonus
                  }));
                }}
                className="w-full p-2 bg-surface border border-border rounded-sm text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-text-secondary uppercase tracking-wider mb-1">Medical</label>
              <input
                type="number"
                min={0}
                value={form.medicalAllowance}
                onChange={(e) => {
                  const med = parseFloat(e.target.value) || 0;
                  setForm(prev => ({
                    ...prev,
                    medicalAllowance: med,
                    grossSalary: prev.basicSalary + prev.hra + med + prev.travelAllowance + prev.specialAllowance + prev.incentive + prev.bonus
                  }));
                }}
                className="w-full p-2 bg-surface border border-border rounded-sm text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-text-secondary uppercase tracking-wider mb-1">Travel</label>
              <input
                type="number"
                min={0}
                value={form.travelAllowance}
                onChange={(e) => {
                  const trv = parseFloat(e.target.value) || 0;
                  setForm(prev => ({
                    ...prev,
                    travelAllowance: trv,
                    grossSalary: prev.basicSalary + prev.hra + prev.medicalAllowance + trv + prev.specialAllowance + prev.incentive + prev.bonus
                  }));
                }}
                className="w-full p-2 bg-surface border border-border rounded-sm text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-text-secondary uppercase tracking-wider mb-1">Special</label>
              <input
                type="number"
                min={0}
                value={form.specialAllowance}
                onChange={(e) => {
                  const spc = parseFloat(e.target.value) || 0;
                  setForm(prev => ({
                    ...prev,
                    specialAllowance: spc,
                    grossSalary: prev.basicSalary + prev.hra + prev.medicalAllowance + prev.travelAllowance + spc + prev.incentive + prev.bonus
                  }));
                }}
                className="w-full p-2 bg-surface border border-border rounded-sm text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-text-secondary uppercase tracking-wider mb-1">Gross Total</label>
              <p className="p-2 text-sm font-black text-primary">₹{form.grossSalary.toLocaleString('en-IN')}</p>
            </div>
            <div>
              <label className="block text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">Salary Advance Limit (₹)</label>
              <input
                type="number"
                min={0}
                value={form.advanceLimit}
                onChange={(e) => setForm({ ...form, advanceLimit: parseFloat(e.target.value) || 0 })}
                className="w-full p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-sm text-xs font-bold text-emerald-600 dark:text-emerald-400"
                placeholder="25000"
              />
            </div>
          </div>
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
