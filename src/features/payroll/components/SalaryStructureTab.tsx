'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Search, Edit, Check, X, ShieldCheck, IndianRupee, Calculator, Loader2 } from 'lucide-react';
import Modal from '@/components/Modal';
import TableSkeleton from '@/components/TableSkeleton';

export default function SalaryStructureTab() {
  const [structures, setStructures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedStructure, setSelectedStructure] = useState<any | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit form state
  const [formData, setFormData] = useState({
    basicSalary: 0,
    hra: 0,
    medicalAllowance: 0,
    travelAllowance: 0,
    specialAllowance: 0,
    salaryAdvanceLimit: 0,
    incentive: 0,
    bonus: 0,
    pfEnabled: false,
    esicEnabled: false,
  });

  const loadStructures = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<{ success: boolean; structures: any[] }>('/api/salary/structure');
      if (res.data.success) {
        setStructures(res.data.structures || []);
      }
    } catch (err) {
      console.error('Failed to load salary structures:', err);
      toast.error('Failed to load salary structures.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStructures();
  }, [loadStructures]);

  const handleOpenEdit = (struct: any) => {
    setSelectedStructure(struct);
    setFormData({
      basicSalary: struct.basicSalary || 0,
      hra: struct.hra || 0,
      medicalAllowance: struct.medicalAllowance || 0,
      travelAllowance: struct.travelAllowance || 0,
      specialAllowance: struct.specialAllowance || 0,
      salaryAdvanceLimit: struct.salaryAdvanceLimit || 0,
      incentive: struct.incentive || 0,
      bonus: struct.bonus || 0,
      pfEnabled: struct.pfEnabled || false,
      esicEnabled: struct.esicEnabled || false,
    });
    setIsEditModalOpen(true);
  };

  // Real-time Gross Total auto-calculation
  const calculatedGrossTotal =
    (Number(formData.basicSalary) || 0) +
    (Number(formData.hra) || 0) +
    (Number(formData.medicalAllowance) || 0) +
    (Number(formData.travelAllowance) || 0) +
    (Number(formData.specialAllowance) || 0);

  const handleSaveStructure = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStructure) return;

    // Validate values >= 0
    if (
      formData.basicSalary < 0 ||
      formData.hra < 0 ||
      formData.medicalAllowance < 0 ||
      formData.travelAllowance < 0 ||
      formData.specialAllowance < 0 ||
      formData.salaryAdvanceLimit < 0
    ) {
      toast.error('All salary component values must be greater than or equal to 0.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        basicSalary: Number(formData.basicSalary),
        hra: Number(formData.hra),
        medical: Number(formData.medicalAllowance),
        medicalAllowance: Number(formData.medicalAllowance),
        travel: Number(formData.travelAllowance),
        travelAllowance: Number(formData.travelAllowance),
        special: Number(formData.specialAllowance),
        specialAllowance: Number(formData.specialAllowance),
        salaryAdvanceLimit: Number(formData.salaryAdvanceLimit),
        monthlySalary: calculatedGrossTotal,
        grossSalary: calculatedGrossTotal,
        incentive: Number(formData.incentive),
        bonus: Number(formData.bonus),
        pfEnabled: formData.pfEnabled,
        esicEnabled: formData.esicEnabled,
      };

      const targetId = selectedStructure.employeeId || selectedStructure.id;
      const res = await api.patch<{ success: boolean; message: string; structure?: any }>(
        `/api/salary/structure/${targetId}`,
        payload
      );

      if (res.data.success) {
        toast.success(res.data.message || 'Salary structure updated successfully!');
        setIsEditModalOpen(false);
        await loadStructures();
      }
    } catch (err: any) {
      console.error('Save structure error:', err);
      toast.error(err?.response?.data?.message || 'Failed to update salary structure.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredStructures = structures.filter(
    (s) =>
      s.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.designation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="p-6 border-b border-border/50 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-surface-variant/20 dark:bg-slate-950/20 rounded-t-2xl">
        <div>
          <h3 className="heading-2 text-xl font-black text-text-primary">
            Salary Structure & Compensation Governance
          </h3>
          <p className="text-xs text-text-secondary mt-1 font-medium">
            Manage base salary, component allowances (HRA, Medical, Travel, Special), salary advance limit, and statutory PF/ESIC deductions per employee.
          </p>
        </div>
        <div className="relative flex-grow sm:flex-grow-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary w-4 h-4" />
          <input
            type="text"
            placeholder="Search employee code/name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2.5 bg-surface-variant/60 dark:bg-white/[0.05] border border-border/50 dark:border-white/10 rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary/30 w-full sm:w-72 font-semibold text-text-primary"
          />
        </div>
      </div>

      {loading ? (
        <div className="p-8">
          <TableSkeleton rows={5} columns={7} />
        </div>
      ) : filteredStructures.length === 0 ? (
        <div className="p-16 text-center">
          <IndianRupee size={44} className="mx-auto text-text-secondary/40 mb-3" />
          <p className="text-sm font-bold text-text-secondary">No salary structures found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-variant/40 dark:bg-slate-950/40 border-b border-border/50 dark:border-white/10">
                <th className="px-6 py-4 text-[10.5px] font-black uppercase tracking-widest text-text-secondary">Code</th>
                <th className="px-6 py-4 text-[10.5px] font-black uppercase tracking-widest text-text-secondary">Employee Name</th>
                <th className="px-6 py-4 text-[10.5px] font-black uppercase tracking-widest text-text-secondary">Basic</th>
                <th className="px-6 py-4 text-[10.5px] font-black uppercase tracking-widest text-text-secondary">Allowances (HRA/Med/Trv/Spc)</th>
                <th className="px-6 py-4 text-[10.5px] font-black uppercase tracking-widest text-text-secondary">Advance Limit</th>
                <th className="px-6 py-4 text-[10.5px] font-black uppercase tracking-widest text-text-secondary">Gross Total</th>
                <th className="px-6 py-4 text-[10.5px] font-black uppercase tracking-widest text-text-secondary text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 dark:divide-white/10">
              {filteredStructures.map((struct) => {
                const totalGross = (struct.basicSalary || 0) + (struct.hra || 0) + (struct.medicalAllowance || 0) + (struct.travelAllowance || 0) + (struct.specialAllowance || 0);
                const displayGross = totalGross > 0 ? totalGross : (struct.grossSalary || struct.monthlySalary || 0);

                return (
                  <tr key={struct.id} className="hover:bg-surface-variant/30 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-5">
                      <span className="font-mono text-xs font-black text-text-secondary bg-surface-variant/80 dark:bg-white/[0.06] px-3 py-1 rounded-lg border border-border/50 dark:border-white/10">
                        {struct.employeeCode}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-xs shrink-0">
                          {struct.employeeName ? struct.employeeName.charAt(0) : 'E'}
                        </div>
                        <div>
                          <span className="font-black text-text-primary block text-sm">{struct.employeeName}</span>
                          <span className="text-[11px] font-medium text-text-secondary">{struct.designation}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 font-mono font-bold text-text-primary text-xs">
                      ₹{(struct.basicSalary || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-5 font-mono text-xs text-text-secondary font-medium">
                      ₹{(struct.hra || 0).toLocaleString('en-IN')} / ₹{(struct.medicalAllowance || 0).toLocaleString('en-IN')} / ₹{(struct.travelAllowance || 0).toLocaleString('en-IN')} / ₹{(struct.specialAllowance || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-5 font-mono font-bold text-amber-600 dark:text-amber-400 text-xs">
                      ₹{(struct.salaryAdvanceLimit || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-5 font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
                      ₹{displayGross.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(struct)}
                        className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center gap-1.5 ml-auto cursor-pointer"
                      >
                        <Edit size={14} />
                        Edit Structure
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Structure Modal with Auto-calculating Gross Total */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Salary Structure — ${selectedStructure?.employeeName}`}
      >
        <form onSubmit={handleSaveStructure} className="space-y-4 max-h-[75vh] overflow-y-auto pr-2">

          {/* Auto-calculated Gross Total Header Banner */}
          <div className="p-4 bg-teal-500/10 border border-teal-500/20 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-black">
                <Calculator size={20} />
              </div>
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-teal-600 dark:text-teal-400 block">Auto-Calculated Gross Total</span>
                <span className="text-xs text-text-secondary font-medium">Basic + HRA + Medical + Travel + Special</span>
              </div>
            </div>
            <div className="text-right font-mono font-black text-xl text-teal-600 dark:text-teal-400">
              ₹{calculatedGrossTotal.toLocaleString('en-IN')}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-text-primary uppercase tracking-wider mb-1">
                Basic Salary (₹)
              </label>
              <input
                type="number"
                min="0"
                value={formData.basicSalary}
                onChange={(e) => setFormData({ ...formData, basicSalary: Number(e.target.value) })}
                className="w-full p-2.5 bg-surface-variant border border-border rounded-xl text-xs font-bold text-text-primary outline-none focus:ring-2 focus:ring-teal-500/30"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-text-primary uppercase tracking-wider mb-1">
                HRA (House Rent Allowance) (₹)
              </label>
              <input
                type="number"
                min="0"
                value={formData.hra}
                onChange={(e) => setFormData({ ...formData, hra: Number(e.target.value) })}
                className="w-full p-2.5 bg-surface-variant border border-border rounded-xl text-xs font-bold text-text-primary outline-none focus:ring-2 focus:ring-teal-500/30"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">Medical Allowance (₹)</label>
              <input
                type="number"
                min="0"
                value={formData.medicalAllowance}
                onChange={(e) => setFormData({ ...formData, medicalAllowance: Number(e.target.value) })}
                className="w-full p-2 bg-surface-variant border border-border rounded-lg text-xs font-semibold text-text-primary outline-none focus:ring-2 focus:ring-teal-500/30"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">Travel Allowance (₹)</label>
              <input
                type="number"
                min="0"
                value={formData.travelAllowance}
                onChange={(e) => setFormData({ ...formData, travelAllowance: Number(e.target.value) })}
                className="w-full p-2 bg-surface-variant border border-border rounded-lg text-xs font-semibold text-text-primary outline-none focus:ring-2 focus:ring-teal-500/30"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">Special Allowance (₹)</label>
              <input
                type="number"
                min="0"
                value={formData.specialAllowance}
                onChange={(e) => setFormData({ ...formData, specialAllowance: Number(e.target.value) })}
                className="w-full p-2 bg-surface-variant border border-border rounded-lg text-xs font-semibold text-text-primary outline-none focus:ring-2 focus:ring-teal-500/30"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-black text-text-primary uppercase tracking-wider mb-1">
                Salary Advance Max Limit (₹)
              </label>
              <input
                type="number"
                min="0"
                value={formData.salaryAdvanceLimit}
                onChange={(e) => setFormData({ ...formData, salaryAdvanceLimit: Number(e.target.value) })}
                className="w-full p-2.5 bg-surface-variant border border-border rounded-xl text-xs font-bold text-text-primary outline-none focus:ring-2 focus:ring-teal-500/30"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-text-primary uppercase tracking-wider mb-1">
                Fixed Bonus (₹)
              </label>
              <input
                type="number"
                min="0"
                value={formData.bonus}
                onChange={(e) => setFormData({ ...formData, bonus: Number(e.target.value) })}
                className="w-full p-2.5 bg-surface-variant border border-border rounded-xl text-xs font-bold text-text-primary outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-6 pt-3">
            <label className="flex items-center gap-2 text-xs font-bold text-text-primary cursor-pointer">
              <input
                type="checkbox"
                checked={formData.pfEnabled}
                onChange={(e) => setFormData({ ...formData, pfEnabled: e.target.checked })}
                className="w-4 h-4 accent-teal-600 rounded"
              />
              Deduct PF (12%)
            </label>

            <label className="flex items-center gap-2 text-xs font-bold text-text-primary cursor-pointer">
              <input
                type="checkbox"
                checked={formData.esicEnabled}
                onChange={(e) => setFormData({ ...formData, esicEnabled: e.target.checked })}
                className="w-4 h-4 accent-teal-600 rounded"
              />
              Deduct ESIC
            </label>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 bg-gray-200 dark:bg-slate-800 hover:bg-gray-300 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Structure'
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
