'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Search, Edit, Check, X, ShieldCheck, IndianRupee } from 'lucide-react';
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
    monthlySalary: 0,
    grossSalary: 0,
    basicSalary: 0,
    hra: 0,
    medicalAllowance: 0,
    travelAllowance: 0,
    specialAllowance: 0,
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
      monthlySalary: struct.monthlySalary || 0,
      grossSalary: struct.grossSalary || 0,
      basicSalary: struct.basicSalary || 0,
      hra: struct.hra || 0,
      medicalAllowance: struct.medicalAllowance || 0,
      travelAllowance: struct.travelAllowance || 0,
      specialAllowance: struct.specialAllowance || 0,
      incentive: struct.incentive || 0,
      bonus: struct.bonus || 0,
      pfEnabled: struct.pfEnabled || false,
      esicEnabled: struct.esicEnabled || false,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveStructure = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStructure) return;
    setIsSubmitting(true);

    try {
      const res = await api.patch<{ success: boolean; message: string }>(
        `/api/salary/structure/${selectedStructure.id}`,
        formData
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
            Salary Structure & Compensation Components
          </h3>
          <p className="text-xs text-text-secondary mt-1 font-medium">
            Manage base salary, allowances (HRA, Medical, Travel, Special), commissions, bonuses, and statutory PF/ESIC deductions per employee.
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
                <th className="px-6 py-4 text-[10.5px] font-black uppercase tracking-widest text-text-secondary">Employee Code</th>
                <th className="px-6 py-4 text-[10.5px] font-black uppercase tracking-widest text-text-secondary">Employee Name</th>
                <th className="px-6 py-4 text-[10.5px] font-black uppercase tracking-widest text-text-secondary">Designation</th>
                <th className="px-6 py-4 text-[10.5px] font-black uppercase tracking-widest text-text-secondary">Monthly Salary</th>
                <th className="px-6 py-4 text-[10.5px] font-black uppercase tracking-widest text-text-secondary">Gross Salary</th>
                <th className="px-6 py-4 text-[10.5px] font-black uppercase tracking-widest text-text-secondary">PF / ESIC</th>
                <th className="px-6 py-4 text-[10.5px] font-black uppercase tracking-widest text-text-secondary text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 dark:divide-white/10">
              {filteredStructures.map((struct) => (
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
                        <span className="text-[11px] font-medium text-text-secondary">{struct.officeName}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-xs font-black text-text-primary">{struct.designation}</span>
                  </td>
                  <td className="px-6 py-5 font-mono font-black text-primary text-sm">
                    ₹{struct.monthlySalary.toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-5 font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
                    ₹{struct.grossSalary.toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black ${struct.pfEnabled ? 'bg-emerald-500/10 text-emerald-600' : 'bg-surface-variant text-text-secondary'}`}>
                        PF: {struct.pfEnabled ? 'ON' : 'OFF'}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black ${struct.esicEnabled ? 'bg-emerald-500/10 text-emerald-600' : 'bg-surface-variant text-text-secondary'}`}>
                        ESIC: {struct.esicEnabled ? 'ON' : 'OFF'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(struct)}
                      className="px-4 py-2 bg-primary text-white hover:bg-primary/90 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center gap-1.5 ml-auto cursor-pointer"
                    >
                      <Edit size={14} />
                      Edit Structure
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Structure Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Salary Structure — ${selectedStructure?.employeeName}`}
      >
        <form onSubmit={handleSaveStructure} className="space-y-4 max-h-[75vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-text-primary uppercase tracking-wider mb-1">
                Monthly Base Salary (₹)
              </label>
              <input
                type="number"
                value={formData.monthlySalary}
                onChange={(e) => setFormData({ ...formData, monthlySalary: Number(e.target.value) })}
                className="w-full p-2.5 bg-surface-variant border border-border rounded-xl text-xs font-bold text-text-primary outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-text-primary uppercase tracking-wider mb-1">
                Gross Registered Salary (₹)
              </label>
              <input
                type="number"
                value={formData.grossSalary}
                onChange={(e) => setFormData({ ...formData, grossSalary: Number(e.target.value) })}
                className="w-full p-2.5 bg-surface-variant border border-border rounded-xl text-xs font-bold text-text-primary outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">Basic Salary (₹)</label>
              <input
                type="number"
                value={formData.basicSalary}
                onChange={(e) => setFormData({ ...formData, basicSalary: Number(e.target.value) })}
                className="w-full p-2 bg-surface-variant border border-border rounded-lg text-xs font-semibold text-text-primary"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">HRA (₹)</label>
              <input
                type="number"
                value={formData.hra}
                onChange={(e) => setFormData({ ...formData, hra: Number(e.target.value) })}
                className="w-full p-2 bg-surface-variant border border-border rounded-lg text-xs font-semibold text-text-primary"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">Medical Allowance (₹)</label>
              <input
                type="number"
                value={formData.medicalAllowance}
                onChange={(e) => setFormData({ ...formData, medicalAllowance: Number(e.target.value) })}
                className="w-full p-2 bg-surface-variant border border-border rounded-lg text-xs font-semibold text-text-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">Travel Allowance (₹)</label>
              <input
                type="number"
                value={formData.travelAllowance}
                onChange={(e) => setFormData({ ...formData, travelAllowance: Number(e.target.value) })}
                className="w-full p-2 bg-surface-variant border border-border rounded-lg text-xs font-semibold text-text-primary"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">Special Allowance (₹)</label>
              <input
                type="number"
                value={formData.specialAllowance}
                onChange={(e) => setFormData({ ...formData, specialAllowance: Number(e.target.value) })}
                className="w-full p-2 bg-surface-variant border border-border rounded-lg text-xs font-semibold text-text-primary"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">Incentive (₹)</label>
              <input
                type="number"
                value={formData.incentive}
                onChange={(e) => setFormData({ ...formData, incentive: Number(e.target.value) })}
                className="w-full p-2 bg-surface-variant border border-border rounded-lg text-xs font-semibold text-text-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-black text-text-primary uppercase tracking-wider mb-1">
                Fixed Bonus Component (₹)
              </label>
              <input
                type="number"
                value={formData.bonus}
                onChange={(e) => setFormData({ ...formData, bonus: Number(e.target.value) })}
                className="w-full p-2.5 bg-surface-variant border border-border rounded-xl text-xs font-bold text-text-primary outline-none"
              />
            </div>

            <div className="flex items-center gap-6 pt-5">
              <label className="flex items-center gap-2 text-xs font-bold text-text-primary cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.pfEnabled}
                  onChange={(e) => setFormData({ ...formData, pfEnabled: e.target.checked })}
                  className="w-4 h-4 accent-primary rounded"
                />
                Deduct PF (12%)
              </label>

              <label className="flex items-center gap-2 text-xs font-bold text-text-primary cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.esicEnabled}
                  onChange={(e) => setFormData({ ...formData, esicEnabled: e.target.checked })}
                  className="w-4 h-4 accent-primary rounded"
                />
                Deduct ESIC
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 bg-surface-variant hover:bg-surface text-text-secondary rounded-xl text-xs font-bold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Structure'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
