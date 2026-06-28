"use client";

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import ConfirmModal from '@/components/ConfirmModal';
import { 
  Clock, 
  Plus, 
  Edit, 
  Trash2, 
  RefreshCw,
  Search,
  Loader2,
  AlertCircle,
  Check,
  Calendar,
  Timer,
  Building,
  User
} from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { cn } from '@/utils/cn';
import SuperAdminHeader from '@/components/SuperAdminHeader';
import {
  fetchShifts,
  createShift,
  updateShift,
  deleteShift,
  type Shift,
  type CreateShiftRequest,
  type UpdateShiftRequest
} from '@/services/shiftService';
import { fetchBranches, type Branch } from '@/services/branchService';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05
    }
  }
};

const itemVariants: Variants = {
  hidden: { y: 15, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 110,
      damping: 15
    }
  }
};

const WORKING_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const ShiftManagementPage = () => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  
  // Form states
  const [formData, setFormData] = useState<CreateShiftRequest>({
    name: '',
    startTime: '09:00',
    endTime: '18:00',
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    graceMinutes: 15,
    breakMinutes: 60,
    color: '#3BA38B',
    roleId: undefined,
    branchId: undefined
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [shiftToDelete, setShiftToDelete] = useState<Shift | null>(null);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  
  // Role and Branch data
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);
  
  const ROLES = [
    { id: 1, name: 'SUPER_ADMIN', label: 'Super Admin (Head Office)' },
    { id: 2, name: 'HR', label: 'HR Manager (Head Office)' },
    { id: 3, name: 'STORE_MANAGER', label: 'Store Manager (Store)' },
    { id: 4, name: 'SALESMAN', label: 'Salesman (Store)' },
    { id: 5, name: 'HELPER', label: 'Helper (Store)' }
  ];

  const filteredShifts = shifts.filter(shift =>
    shift.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const loadShifts = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);

    try {
      const response = await fetchShifts();
      setShifts(response.shifts);
    } catch (err: any) {
      console.error('Failed to load shifts:', err);
      setError(err?.message || 'Failed to load shifts. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const loadBranches = useCallback(async () => {
    setIsLoadingBranches(true);
    try {
      const branchData = await fetchBranches();
      setBranches(branchData);
    } catch (err) {
      console.error('Failed to load branches:', err);
    } finally {
      setIsLoadingBranches(false);
    }
  }, []);

  useEffect(() => {
    loadShifts();
    loadBranches();
  }, [loadShifts, loadBranches]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.startTime || !formData.endTime || formData.workingDays.length === 0) {
      setFormError('All fields are required');
      return;
    }

    setIsSubmitting(true);
    setFormError('');
    setFormSuccess('');

    try {
      await createShift(formData);
      setFormSuccess('Shift created successfully!');
      setTimeout(() => {
        setIsCreateModalOpen(false);
        setFormData({
          name: '',
          startTime: '09:00',
          endTime: '18:00',
          workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          graceMinutes: 15,
          breakMinutes: 60,
          color: '#3BA38B',
          roleId: undefined,
          branchId: undefined
        });
        setFormSuccess('');
        loadShifts();
      }, 1000);
    } catch (err: any) {
      setFormError(err?.message || 'Failed to create shift. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShift || !formData.name.trim() || !formData.startTime || !formData.endTime || formData.workingDays.length === 0) {
      setFormError('All fields are required');
      return;
    }

    setIsSubmitting(true);
    setFormError('');
    setFormSuccess('');

    try {
      await updateShift(selectedShift.id, formData);
      setFormSuccess('Shift updated successfully!');
      setTimeout(() => {
        setIsEditModalOpen(false);
        setSelectedShift(null);
        setFormData({
          name: '',
          startTime: '09:00',
          endTime: '18:00',
          workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          graceMinutes: 15,
          breakMinutes: 60,
          color: '#3BA38B',
          roleId: undefined,
          branchId: undefined
        });
        setFormSuccess('');
        loadShifts();
      }, 1000);
    } catch (err: any) {
      setFormError(err?.message || 'Failed to update shift. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (shift: Shift) => {
    setShiftToDelete(shift);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!shiftToDelete) return;

    try {
      await deleteShift(shiftToDelete.id);
      toast.success('Shift deleted successfully');
      setDeleteConfirmOpen(false);
      setShiftToDelete(null);
      loadShifts();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete shift');
    }
  };

  const openEditModal = (shift: Shift) => {
    setSelectedShift(shift);
    setFormData({
      name: shift.name,
      startTime: shift.startTime,
      endTime: shift.endTime,
      workingDays: shift.workingDays,
      graceMinutes: shift.graceMinutes,
      breakMinutes: shift.breakMinutes,
      color: shift.color,
      roleId: shift.roleId,
      branchId: shift.branchId
    });
    setFormError('');
    setFormSuccess('');
    setIsEditModalOpen(true);
  };

  const openCreateModal = () => {
    setFormData({
      name: '',
      startTime: '09:00',
      endTime: '18:00',
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      graceMinutes: 15,
      breakMinutes: 60,
      color: '#3BA38B',
      roleId: undefined,
      branchId: undefined
    });
    setFormError('');
    setFormSuccess('');
    setIsCreateModalOpen(true);
  };

  const toggleWorkingDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter(d => d !== day)
        : [...prev.workingDays, day]
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <SuperAdminHeader
        title="Shift Management"
        subtitle="Manage shift timings, working schedules, and employee assignments."
        badgeText="Shift Configuration"
        badgeIcon={Clock}
        stats={[
          { label: 'Total Shifts', value: shifts.length.toString(), icon: Clock },
        ]}
      >
        <button
          onClick={() => loadShifts(true)}
          disabled={isRefreshing}
          className="p-2 bg-surface-variant hover:bg-surface-variant/80 border border-border rounded-sm transition-all mr-2"
        >
          <RefreshCw className={cn("w-5 h-5 text-text-primary", isRefreshing && "animate-spin")} />
        </button>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-sm transition-all font-semibold"
        >
          <Plus className="w-4 h-4" />
          Add Shift
        </button>
      </SuperAdminHeader>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
        <input
          type="text"
          placeholder="Search shifts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-surface-variant border border-border rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
        />
      </div>

      {/* Error State */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-sm">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Shifts List */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-3"
      >
        <AnimatePresence>
          {filteredShifts.length === 0 ? (
            <motion.div
              variants={itemVariants}
              className="text-center py-12 text-text-secondary"
            >
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No shifts found</p>
            </motion.div>
          ) : (
            filteredShifts.map((shift) => (
              <motion.div
                key={shift.id}
                variants={itemVariants}
                className="flex items-center justify-between p-4 bg-surface-variant border border-border rounded-sm hover:border-primary/30 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div 
                    className="p-3 rounded-sm"
                    style={{ backgroundColor: `${shift.color}20`, color: shift.color }}
                  >
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary">{shift.name}</h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-text-secondary">
                      <span className="flex items-center gap-1">
                        <Timer className="w-3 h-3" />
                        {shift.startTime} - {shift.endTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {shift.workingDays.length} days
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(shift)}
                    className="p-2 hover:bg-surface-variant/80 rounded-sm transition-all"
                  >
                    <Edit className="w-4 h-4 text-text-primary" />
                  </button>
                  <button
                    onClick={() => handleDelete(shift)}
                    className="p-2 hover:bg-red-500/10 rounded-sm transition-all"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </motion.div>

      {/* Create Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setIsCreateModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface border border-border rounded-sm w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-bold text-text-primary mb-4">Add Shift</h2>
              
              {formError && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-sm">
                  <p className="text-sm text-red-600">{formError}</p>
                </div>
              )}

              {formSuccess && (
                <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-sm flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <p className="text-sm text-emerald-600">{formSuccess}</p>
                </div>
              )}

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-text-secondary mb-2">
                    Shift Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Morning Shift"
                    className="w-full px-3 py-2 bg-surface-variant border border-border rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-text-secondary mb-2">
                      Role
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <select
                        value={formData.roleId || ''}
                        onChange={(e) => setFormData({ ...formData, roleId: e.target.value ? parseInt(e.target.value) : undefined })}
                        className="w-full pl-10 pr-3 py-2 bg-surface-variant border border-border rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all cursor-pointer"
                      >
                        <option value="">All Roles</option>
                        {ROLES.map((role) => (
                          <option key={role.id} value={role.id}>{role.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-text-secondary mb-2">
                      Branch
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <select
                        value={formData.branchId || ''}
                        onChange={(e) => setFormData({ ...formData, branchId: e.target.value ? parseInt(e.target.value) : undefined })}
                        disabled={isLoadingBranches}
                        className="w-full pl-10 pr-3 py-2 bg-surface-variant border border-border rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all cursor-pointer disabled:opacity-60"
                      >
                        <option value="">All Branches</option>
                        {branches.map((branch) => (
                          <option key={branch.id} value={branch.id}>{branch.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-text-secondary mb-2">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="w-full px-3 py-2 bg-surface-variant border border-border rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-text-secondary mb-2">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      className="w-full px-3 py-2 bg-surface-variant border border-border rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text-secondary mb-2">
                    Working Days
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {WORKING_DAYS.map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleWorkingDay(day)}
                        className={cn(
                          "px-3 py-2 text-xs font-semibold rounded-sm transition-all",
                          formData.workingDays.includes(day)
                            ? "bg-primary text-white"
                            : "bg-surface-variant text-text-secondary hover:bg-surface-variant/80"
                        )}
                      >
                        {day.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-text-secondary mb-2">
                      Grace Minutes
                    </label>
                    <input
                      type="number"
                      value={formData.graceMinutes}
                      onChange={(e) => setFormData({ ...formData, graceMinutes: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-surface-variant border border-border rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-text-secondary mb-2">
                      Break Minutes
                    </label>
                    <input
                      type="number"
                      value={formData.breakMinutes}
                      onChange={(e) => setFormData({ ...formData, breakMinutes: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-surface-variant border border-border rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text-secondary mb-2">
                    Color
                  </label>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full h-10 bg-surface-variant border border-border rounded-sm cursor-pointer"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="flex-1 px-4 py-2 bg-surface-variant hover:bg-surface-variant/80 border border-border rounded-sm transition-all font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-sm transition-all font-semibold disabled:opacity-50"
                  >
                    {isSubmitting ? 'Creating...' : 'Create'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditModalOpen && selectedShift && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setIsEditModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface border border-border rounded-sm w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-bold text-text-primary mb-4">Edit Shift</h2>
              
              {formError && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-sm">
                  <p className="text-sm text-red-600">{formError}</p>
                </div>
              )}

              {formSuccess && (
                <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-sm flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <p className="text-sm text-emerald-600">{formSuccess}</p>
                </div>
              )}

              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-text-secondary mb-2">
                    Shift Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Morning Shift"
                    className="w-full px-3 py-2 bg-surface-variant border border-border rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-text-secondary mb-2">
                      Role
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <select
                        value={formData.roleId || ''}
                        onChange={(e) => setFormData({ ...formData, roleId: e.target.value ? parseInt(e.target.value) : undefined })}
                        className="w-full pl-10 pr-3 py-2 bg-surface-variant border border-border rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all cursor-pointer"
                      >
                        <option value="">All Roles</option>
                        {ROLES.map((role) => (
                          <option key={role.id} value={role.id}>{role.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-text-secondary mb-2">
                      Branch
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <select
                        value={formData.branchId || ''}
                        onChange={(e) => setFormData({ ...formData, branchId: e.target.value ? parseInt(e.target.value) : undefined })}
                        disabled={isLoadingBranches}
                        className="w-full pl-10 pr-3 py-2 bg-surface-variant border border-border rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all cursor-pointer disabled:opacity-60"
                      >
                        <option value="">All Branches</option>
                        {branches.map((branch) => (
                          <option key={branch.id} value={branch.id}>{branch.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-text-secondary mb-2">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="w-full px-3 py-2 bg-surface-variant border border-border rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-text-secondary mb-2">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      className="w-full px-3 py-2 bg-surface-variant border border-border rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text-secondary mb-2">
                    Working Days
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {WORKING_DAYS.map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleWorkingDay(day)}
                        className={cn(
                          "px-3 py-2 text-xs font-semibold rounded-sm transition-all",
                          formData.workingDays.includes(day)
                            ? "bg-primary text-white"
                            : "bg-surface-variant text-text-secondary hover:bg-surface-variant/80"
                        )}
                      >
                        {day.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-text-secondary mb-2">
                      Grace Minutes
                    </label>
                    <input
                      type="number"
                      value={formData.graceMinutes}
                      onChange={(e) => setFormData({ ...formData, graceMinutes: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-surface-variant border border-border rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-text-secondary mb-2">
                      Break Minutes
                    </label>
                    <input
                      type="number"
                      value={formData.breakMinutes}
                      onChange={(e) => setFormData({ ...formData, breakMinutes: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-surface-variant border border-border rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text-secondary mb-2">
                    Color
                  </label>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full h-10 bg-surface-variant border border-border rounded-sm cursor-pointer"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="flex-1 px-4 py-2 bg-surface-variant hover:bg-surface-variant/80 border border-border rounded-sm transition-all font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-sm transition-all font-semibold disabled:opacity-50"
                  >
                    {isSubmitting ? 'Updating...' : 'Update'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Shift"
        message={`Are you sure you want to delete "${shiftToDelete?.name}"? This action cannot be undone.`}
      />
    </div>
  );
};

export default ShiftManagementPage;
