"use client";

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import ConfirmModal from '@/components/ConfirmModal';
import { 
  Building2, 
  Plus, 
  Edit, 
  Trash2, 
  RefreshCw,
  Users,
  Search,
  Loader2,
  AlertCircle,
  Check
} from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { cn } from '@/utils/cn';
import SuperAdminHeader from '@/components/SuperAdminHeader';
import {
  fetchDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  type Department,
  type CreateDepartmentRequest,
  type UpdateDepartmentRequest
} from '@/services/departmentService';

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

const DepartmentManagementPage = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  
  // Form states
  const [formData, setFormData] = useState<CreateDepartmentRequest>({
    name: '',
    code: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deptToDelete, setDeptToDelete] = useState<Department | null>(null);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (dept.code && dept.code.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const loadDepartments = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);

    try {
      const response = await fetchDepartments();
      setDepartments(response.departments);
    } catch (err: any) {
      console.error('Failed to load departments:', err);
      setError(err?.message || 'Failed to load departments. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDepartments();
  }, [loadDepartments]);

  const handleRefresh = () => {
    loadDepartments(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setIsSubmitting(true);

    try {
      await createDepartment(formData);
      setFormSuccess('Department created successfully!');
      setFormData({ name: '', code: '' });
      setTimeout(() => {
        setIsCreateModalOpen(false);
        setFormSuccess('');
        loadDepartments();
      }, 1500);
    } catch (err: any) {
      setFormError(err?.message || 'Failed to create department. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDepartment) return;

    setFormError('');
    setFormSuccess('');
    setIsSubmitting(true);

    try {
      await updateDepartment(selectedDepartment.id, formData as UpdateDepartmentRequest);
      setFormSuccess('Department updated successfully!');
      setTimeout(() => {
        setIsEditModalOpen(false);
        setFormSuccess('');
        setSelectedDepartment(null);
        setFormData({ name: '', code: '' });
        loadDepartments();
      }, 1500);
    } catch (err: any) {
      setFormError(err?.message || 'Failed to update department. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (dept: Department) => {
    setDeptToDelete(dept);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deptToDelete) return;

    try {
      await deleteDepartment(deptToDelete.id);
      loadDepartments();
      toast.success('Department deleted successfully');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete department. Please try again.');
    } finally {
      setDeleteConfirmOpen(false);
      setDeptToDelete(null);
    }
  };

  const openEditModal = (dept: Department) => {
    setSelectedDepartment(dept);
    setFormData({ name: dept.name, code: dept.code || '' });
    setFormError('');
    setFormSuccess('');
    setIsEditModalOpen(true);
  };

  const closeModals = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedDepartment(null);
    setFormData({ name: '', code: '' });
    setFormError('');
    setFormSuccess('');
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8 pb-16 text-text-primary animate-fadeIn"
    >
      {/* Header */}
      <SuperAdminHeader
        title="Department Management"
        subtitle="Create and manage organizational departments."
        badgeText="Active Organization Registry"
        badgeIcon={Building2}
      >
        <button
          onClick={handleRefresh}
          disabled={isLoading || isRefreshing}
          className="p-4 bg-surface-variant/50 hover:bg-surface-variant/80 text-text-secondary hover:text-primary rounded-sm border border-border/50 transition-all duration-300 active:scale-95 disabled:opacity-50"
          title="Refresh"
        >
          <RefreshCw size={18} className={cn(isRefreshing && "animate-spin")} />
        </button>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="btn-primary px-6 py-4 shrink-0 rounded-sm flex items-center gap-2 text-xs font-black uppercase tracking-wider"
        >
          <Plus size={18} />
          Add Department
        </button>
      </SuperAdminHeader>

      {/* Error state */}
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-4 bg-error/10 border border-error/20 rounded-sm text-error-text text-sm"
        >
          <div className="flex items-center gap-3">
            <AlertCircle size={20} className="text-error" />
            <span className="font-medium">{error}</span>
          </div>
          <button 
            onClick={() => loadDepartments()}
            className="px-4 py-1.5 bg-error text-white font-bold rounded-sm text-xs hover:bg-error/90 transition-all"
          >
            Retry
          </button>
        </motion.div>
      )}

      {/* Search */}
      <motion.div variants={itemVariants} className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary/50 w-5 h-5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search departments by name or code..."
          className="w-full pl-13 pr-4 py-4 bg-surface-variant/40 border border-border hover:border-border-hover focus:border-primary/30 rounded-sm outline-none transition-all text-xs font-semibold text-text-primary placeholder:text-text-secondary/50"
        />
      </motion.div>

      {/* Departments Grid */}
      {isLoading ? (
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="glass-card p-6 h-32 bg-surface-variant/30 border border-border animate-pulse" />
          ))}
        </motion.div>
      ) : (
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDepartments.map((dept) => (
            <motion.div
              key={dept.id}
              whileHover={{ y: -5, scale: 1.02 }}
              className="p-6 border border-border bg-surface hover:bg-surface-variant/30 transition-all duration-300 relative overflow-hidden group rounded-sm"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full filter blur-3xl pointer-events-none group-hover:bg-primary/10 transition-all" />
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-sm bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20">
                    <Building2 size={24} className="text-primary" />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(dept)}
                      className="p-2 hover:bg-surface-variant rounded-sm text-text-secondary hover:text-primary transition-all"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(dept)}
                      disabled={dept._count.employees > 0}
                      className={cn(
                        "p-2 hover:bg-surface-variant rounded-sm transition-all",
                        dept._count.employees > 0 
                          ? "text-text-secondary/40 cursor-not-allowed" 
                          : "text-text-secondary hover:text-rose-500"
                      )}
                      title={dept._count.employees > 0 ? "Cannot delete - has employees" : "Delete"}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-text-primary mb-1">{dept.name}</h3>
                {dept.code && (
                  <p className="text-xs text-text-secondary font-mono mb-3">{dept.code}</p>
                )}

                <div className="flex items-center gap-2 text-xs text-text-secondary">
                  <Users size={14} />
                  <span className="font-semibold">{dept._count.employees} employee{dept._count.employees !== 1 ? 's' : ''}</span>
                </div>

                {dept._count.employees > 0 && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">
                      Active department
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}

          {filteredDepartments.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full text-center py-16"
            >
              <Building2 size={48} className="text-text-secondary/50 mx-auto mb-4" />
              <p className="text-text-secondary font-semibold">
                {searchTerm ? 'No departments found matching your search.' : 'No departments yet. Create your first department!'}
              </p>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={closeModals}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="p-8 w-full max-w-md border border-border bg-surface rounded-sm"
            >
              <h2 className="text-xl font-black text-text-primary mb-6">Create Department</h2>
              
              {formError && (
                <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-sm text-rose-400 text-xs font-semibold">
                  {formError}
                </div>
              )}

              {formSuccess && (
                <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-sm text-emerald-400 text-xs font-semibold flex items-center gap-2">
                  <Check size={14} />
                  {formSuccess}
                </div>
              )}

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-text-secondary uppercase tracking-widest mb-2">
                    Department Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="e.g., Engineering"
                    className="w-full px-4 py-3 bg-surface-variant border border-border rounded-sm text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all font-semibold text-text-primary placeholder:text-text-secondary/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-text-secondary uppercase tracking-widest mb-2">
                    Department Code (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g., DEPT-ENG"
                    className="w-full px-4 py-3 bg-surface-variant border border-border rounded-sm text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all font-semibold text-text-primary placeholder:text-text-secondary/50"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModals}
                    disabled={isSubmitting}
                    className="flex-1 py-3 rounded-sm border border-border text-text-secondary font-bold uppercase tracking-widest text-xs disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-[2] py-3 rounded-sm bg-primary text-white font-bold uppercase tracking-widest text-xs disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Department'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditModalOpen && selectedDepartment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={closeModals}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="p-8 w-full max-w-md border border-border bg-surface rounded-sm"
            >
              <h2 className="text-xl font-black text-text-primary mb-6">Edit Department</h2>
              
              {formError && (
                <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-sm text-rose-400 text-xs font-semibold">
                  {formError}
                </div>
              )}

              {formSuccess && (
                <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-sm text-emerald-400 text-xs font-semibold flex items-center gap-2">
                  <Check size={14} />
                  {formSuccess}
                </div>
              )}

              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-text-secondary uppercase tracking-widest mb-2">
                    Department Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="e.g., Engineering"
                    className="w-full px-4 py-3 bg-surface-variant border border-border rounded-sm text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all font-semibold text-text-primary placeholder:text-text-secondary/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-text-secondary uppercase tracking-widest mb-2">
                    Department Code (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g., DEPT-ENG"
                    className="w-full px-4 py-3 bg-surface-variant border border-border rounded-sm text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all font-semibold text-text-primary placeholder:text-text-secondary/50"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModals}
                    disabled={isSubmitting}
                    className="flex-1 py-3 rounded-sm border border-border text-text-secondary font-bold uppercase tracking-widest text-xs disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-[2] py-3 rounded-sm bg-primary text-white font-bold uppercase tracking-widest text-xs disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Updating...
                      </>
                    ) : (
                      'Update Department'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Department"
        message={deptToDelete ? `Are you sure you want to delete "${deptToDelete.name}"? This action cannot be undone.` : 'Are you sure you want to delete this department? This action cannot be undone.'}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </motion.div>
  );
};

export default DepartmentManagementPage;
