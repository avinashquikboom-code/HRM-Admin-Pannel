"use client";

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import ConfirmModal from '@/components/ConfirmModal';
import { 
  Briefcase, 
  Plus, 
  Edit, 
  Trash2, 
  RefreshCw,
  Search,
  Loader2,
  AlertCircle,
  Check
} from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { cn } from '@/utils/cn';
import SuperAdminHeader from '@/components/SuperAdminHeader';
import {
  fetchDesignations,
  createDesignation,
  updateDesignation,
  deleteDesignation,
  type Designation,
  type CreateDesignationRequest,
  type UpdateDesignationRequest
} from '@/services/designationService';

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

const DesignationManagementPage = () => {
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDesignation, setSelectedDesignation] = useState<Designation | null>(null);
  
  // Form states
  const [formData, setFormData] = useState<CreateDesignationRequest>({
    name: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [designationToDelete, setDesignationToDelete] = useState<Designation | null>(null);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const filteredDesignations = designations.filter(designation =>
    designation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (designation.code && designation.code.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const loadDesignations = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);

    try {
      const response = await fetchDesignations();
      setDesignations(response.data);
    } catch (err: any) {
      console.error('Failed to load designations:', err);
      setError(err?.message || 'Failed to load designations. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDesignations();
  }, [loadDesignations]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Designation name is required');
      return;
    }

    setIsSubmitting(true);
    setFormError('');
    setFormSuccess('');

    try {
      await createDesignation(formData);
      setFormSuccess('Designation created successfully!');
      setTimeout(() => {
        setIsCreateModalOpen(false);
        setFormData({ name: '' });
        setFormSuccess('');
        loadDesignations();
      }, 1000);
    } catch (err: any) {
      setFormError(err?.message || 'Failed to create designation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDesignation || !formData.name.trim()) {
      setFormError('Designation name is required');
      return;
    }

    setIsSubmitting(true);
    setFormError('');
    setFormSuccess('');

    try {
      const updateData: UpdateDesignationRequest = {
        name: formData.name,
        isActive: selectedDesignation.isActive
      };
      await updateDesignation(selectedDesignation.id, updateData);
      setFormSuccess('Designation updated successfully!');
      setTimeout(() => {
        setIsEditModalOpen(false);
        setSelectedDesignation(null);
        setFormData({ name: '' });
        setFormSuccess('');
        loadDesignations();
      }, 1000);
    } catch (err: any) {
      setFormError(err?.message || 'Failed to update designation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (designation: Designation) => {
    setDesignationToDelete(designation);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!designationToDelete) return;

    try {
      await deleteDesignation(designationToDelete.id);
      toast.success('Designation deleted successfully');
      setDeleteConfirmOpen(false);
      setDesignationToDelete(null);
      loadDesignations();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete designation');
    }
  };

  const openEditModal = (designation: Designation) => {
    setSelectedDesignation(designation);
    setFormData({ name: designation.name });
    setFormError('');
    setFormSuccess('');
    setIsEditModalOpen(true);
  };

  const openCreateModal = () => {
    setFormData({ name: '' });
    setFormError('');
    setFormSuccess('');
    setIsCreateModalOpen(true);
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
        title="Designation Management"
        subtitle="Manage employee designations, job titles, and organizational roles."
        badgeText="Designation Configuration"
        badgeIcon={Briefcase}
        stats={[
          { label: 'Total Designations', value: designations.length.toString(), icon: Briefcase },
          { label: 'Active', value: designations.filter(d => d.isActive).length.toString(), icon: Check },
        ]}
      >
        <button
          onClick={() => loadDesignations(true)}
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
          Add Designation
        </button>
      </SuperAdminHeader>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
        <input
          type="text"
          placeholder="Search designations..."
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

      {/* Designations List */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-3"
      >
        <AnimatePresence>
          {filteredDesignations.length === 0 ? (
            <motion.div
              variants={itemVariants}
              className="text-center py-12 text-text-secondary"
            >
              <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No designations found</p>
            </motion.div>
          ) : (
            filteredDesignations.map((designation) => (
              <motion.div
                key={designation.id}
                variants={itemVariants}
                className="flex items-center justify-between p-4 bg-surface-variant border border-border rounded-sm hover:border-primary/30 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-sm">
                    <Briefcase className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary">{designation.name}</h3>
                    {designation.code && (
                      <p className="text-xs text-text-secondary">Code: {designation.code}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "px-2 py-1 text-xs font-semibold rounded-sm",
                    designation.isActive 
                      ? "bg-emerald-500/10 text-emerald-600" 
                      : "bg-red-500/10 text-red-600"
                  )}>
                    {designation.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <button
                    onClick={() => openEditModal(designation)}
                    className="p-2 hover:bg-surface-variant/80 rounded-sm transition-all"
                  >
                    <Edit className="w-4 h-4 text-text-primary" />
                  </button>
                  <button
                    onClick={() => handleDelete(designation)}
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
              className="bg-surface border border-border rounded-sm w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-bold text-text-primary mb-4">Add Designation</h2>
              
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
                    Designation Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ name: e.target.value })}
                    placeholder="e.g., Software Engineer"
                    className="w-full px-3 py-2 bg-surface-variant border border-border rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
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
        {isEditModalOpen && selectedDesignation && (
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
              className="bg-surface border border-border rounded-sm w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-bold text-text-primary mb-4">Edit Designation</h2>
              
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
                    Designation Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ name: e.target.value })}
                    placeholder="e.g., Software Engineer"
                    className="w-full px-3 py-2 bg-surface-variant border border-border rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={selectedDesignation.isActive}
                    onChange={(e) => {
                      setSelectedDesignation({ ...selectedDesignation, isActive: e.target.checked });
                    }}
                    className="w-4 h-4 rounded"
                  />
                  <label htmlFor="isActive" className="text-sm text-text-primary">
                    Active
                  </label>
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
        title="Delete Designation"
        message={`Are you sure you want to delete "${designationToDelete?.name}"? This action cannot be undone.`}
      />
    </div>
  );
};

export default DesignationManagementPage;
