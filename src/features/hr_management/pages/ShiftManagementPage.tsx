"use client";

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
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

  const [activeTab, setActiveTab] = useState<'definitions' | 'requests'>('definitions');
  const [shiftRequests, setShiftRequests] = useState<any[]>([]);
  const [isRequestsLoading, setIsRequestsLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);
  const [decisionNote, setDecisionNote] = useState('');
  const [decisionStatus, setDecisionStatus] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [deciding, setDeciding] = useState(false);

  const loadShiftRequests = useCallback(async () => {
    setIsRequestsLoading(true);
    try {
      const response = await api.get('/api/admin/shift-requests');
      if (response.data.success) {
        setShiftRequests(response.data.data);
      }
    } catch (err) {
      console.error('Failed to load shift requests:', err);
    } finally {
      setIsRequestsLoading(false);
    }
  }, []);

  const handleOpenDecisionModal = (request: any, status: 'APPROVED' | 'REJECTED') => {
    setSelectedRequest(request);
    setDecisionStatus(status);
    setDecisionNote('');
    setIsDecisionModalOpen(true);
  };

  const submitDecision = async () => {
    if (!selectedRequest) return;
    setDeciding(true);
    try {
      const res = await api.patch(`/api/admin/shift-requests/${selectedRequest.id}`, {
        status: decisionStatus,
        note: decisionNote
      });
      if (res.data.success) {
        toast.success(`Request ${decisionStatus.toLowerCase()} successfully.`);
        setIsDecisionModalOpen(false);
        loadShiftRequests();
      }
    } catch (err: any) {
      console.error('Failed to decide request:', err);
      toast.error(err?.response?.data?.message || 'Failed to process request.');
    } finally {
      setDeciding(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'requests') {
      loadShiftRequests();
    }
  }, [activeTab, loadShiftRequests]);

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

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab('definitions')}
          className={cn(
            "px-5 py-3 border-b-2 text-xs font-black uppercase tracking-wider transition-all cursor-pointer",
            activeTab === 'definitions'
              ? "border-primary text-primary"
              : "border-transparent text-text-secondary hover:text-text-primary"
          )}
        >
          Shift Definitions
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={cn(
            "px-5 py-3 border-b-2 text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2",
            activeTab === 'requests'
              ? "border-primary text-primary"
              : "border-transparent text-text-secondary hover:text-text-primary"
          )}
        >
          Shift Requests
          {shiftRequests.filter(r => r.status === 'PENDING').length > 0 && (
            <span className="w-5 h-5 rounded-full bg-error/10 text-error text-[10px] font-black flex items-center justify-center">
              {shiftRequests.filter(r => r.status === 'PENDING').length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'definitions' ? (
        <>
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
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <AnimatePresence>
              {filteredShifts.length === 0 ? (
                <motion.div
                  variants={itemVariants}
                  className="col-span-full text-center py-12 text-text-secondary"
                >
                  <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No shifts found</p>
                </motion.div>
              ) : (
                filteredShifts.map((shift) => (
                  <motion.div
                    key={shift.id}
                    variants={itemVariants}
                    className="flex flex-col justify-between p-4 bg-surface border border-border rounded-sm hover:border-primary/30 transition-all gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <div 
                        className="p-3 rounded-sm shrink-0"
                        style={{ backgroundColor: `${shift.color}20`, color: shift.color }}
                      >
                        <Clock className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-text-primary truncate">{shift.name}</h4>
                        <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-text-secondary">
                          <span className="flex items-center gap-1 whitespace-nowrap">
                            <Timer size={12} />
                            {shift.startTime} - {shift.endTime}
                          </span>
                          <span className="w-1.5 h-1.5 rounded-full bg-border" />
                          <span className="flex items-center gap-1 whitespace-nowrap">
                            <Clock size={12} />
                            {shift.graceMinutes}m grace
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end border-t border-border/40 pt-3 gap-1">
                      <button
                        onClick={() => openEditModal(shift)}
                        className="p-2 hover:bg-surface-variant rounded-sm text-text-secondary hover:text-primary transition-all"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(shift)}
                        className="p-2 hover:bg-red-500/10 rounded-sm text-text-secondary hover:text-red-500 transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </motion.div>
        </>
      ) : (
        <div className="space-y-6">
          {/* Shift Requests Tables */}
          {isRequestsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-8">
              {/* Pending Requests */}
              <div className="border border-border bg-surface rounded-sm">
                <div className="p-4 bg-surface-variant/30 border-b border-border">
                  <h3 className="text-xs font-black text-text-primary uppercase tracking-wider">Pending Shift Change Requests</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-surface-variant/10">
                        <th className="px-4 py-3 text-[10px] font-black text-text-secondary uppercase tracking-widest">Employee</th>
                        <th className="px-4 py-3 text-[10px] font-black text-text-secondary uppercase tracking-widest">Current Shift</th>
                        <th className="px-4 py-3 text-[10px] font-black text-text-secondary uppercase tracking-widest">Requested Shift</th>
                        <th className="px-4 py-3 text-[10px] font-black text-text-secondary uppercase tracking-widest">Reason</th>
                        <th className="px-4 py-3 text-[10px] font-black text-text-secondary uppercase tracking-widest">Date Requested</th>
                        <th className="px-4 py-3 text-[10px] font-black text-text-secondary uppercase tracking-widest text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shiftRequests.filter(r => r.status === 'PENDING').length > 0 ? (
                        shiftRequests.filter(r => r.status === 'PENDING').map((req) => (
                          <tr key={req.id} className="border-b border-border/50 hover:bg-surface-variant/10 transition-colors">
                            <td className="px-4 py-3.5 text-xs font-black text-text-primary">
                              {req.employee ? `${req.employee.firstName} ${req.employee.lastName}` : 'Unknown'}
                              <span className="block text-[10px] font-semibold text-text-secondary mt-0.5">{req.employee?.office?.name || 'No Branch'}</span>
                            </td>
                            <td className="px-4 py-3.5 text-xs font-semibold text-text-secondary">{req.currentShift}</td>
                            <td className="px-4 py-3.5 text-xs font-bold text-primary">{req.requestedShift}</td>
                            <td className="px-4 py-3.5 text-xs text-text-secondary max-w-[200px] truncate" title={req.reason}>{req.reason}</td>
                            <td className="px-4 py-3.5 text-xs text-text-secondary">
                              {new Date(req.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                            </td>
                            <td className="px-4 py-3.5 text-xs text-right space-x-2 whitespace-nowrap">
                              <button
                                onClick={() => handleOpenDecisionModal(req, 'APPROVED')}
                                className="px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-sm text-[10px] font-black uppercase tracking-wider cursor-pointer transition-all"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleOpenDecisionModal(req, 'REJECTED')}
                                className="px-2.5 py-1.5 bg-error/10 hover:bg-error/20 text-error rounded-sm text-[10px] font-black uppercase tracking-wider cursor-pointer transition-all"
                              >
                                Reject
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-xs font-bold text-text-secondary uppercase tracking-widest">
                            No pending shift change requests.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Request History */}
              <div className="border border-border bg-surface rounded-sm">
                <div className="p-4 bg-surface-variant/30 border-b border-border">
                  <h3 className="text-xs font-black text-text-primary uppercase tracking-wider">Shift Change History</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-surface-variant/10">
                        <th className="px-4 py-3 text-[10px] font-black text-text-secondary uppercase tracking-widest">Employee</th>
                        <th className="px-4 py-3 text-[10px] font-black text-text-secondary uppercase tracking-widest">Requested Shift</th>
                        <th className="px-4 py-3 text-[10px] font-black text-text-secondary uppercase tracking-widest">Status</th>
                        <th className="px-4 py-3 text-[10px] font-black text-text-secondary uppercase tracking-widest">Decided Date</th>
                        <th className="px-4 py-3 text-[10px] font-black text-text-secondary uppercase tracking-widest">Review Note</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shiftRequests.filter(r => r.status !== 'PENDING').length > 0 ? (
                        shiftRequests.filter(r => r.status !== 'PENDING').map((req) => (
                          <tr key={req.id} className="border-b border-border/50 hover:bg-surface-variant/10 transition-colors">
                            <td className="px-4 py-3.5 text-xs font-black text-text-primary">
                              {req.employee ? `${req.employee.firstName} ${req.employee.lastName}` : 'Unknown'}
                            </td>
                            <td className="px-4 py-3.5 text-xs font-semibold text-text-secondary">
                              {req.currentShift} → <span className="font-bold text-primary">{req.requestedShift}</span>
                            </td>
                            <td className="px-4 py-3.5 text-xs whitespace-nowrap">
                              <span className={cn(
                                "px-2 py-1 rounded-sm text-[10px] font-black uppercase tracking-wider",
                                req.status === 'APPROVED' ? "bg-emerald-500/10 text-emerald-500" : "bg-error/10 text-error"
                              )}>
                                {req.status}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-xs text-text-secondary">
                              {req.decidedAt ? new Date(req.decidedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
                            </td>
                            <td className="px-4 py-3.5 text-xs text-text-secondary max-w-[200px] truncate" title={req.reviewNote || '-'}>
                              {req.reviewNote || '-'}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-xs font-bold text-text-secondary uppercase tracking-widest">
                            No shift change history found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

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

      {/* Shift Request Decision Modal */}
      <ConfirmModal
        isOpen={isDecisionModalOpen}
        onClose={() => setIsDecisionModalOpen(false)}
        onConfirm={submitDecision}
        title={decisionStatus === 'APPROVED' ? 'Approve Shift Change' : 'Reject Shift Change'}
        confirmText={decisionStatus === 'APPROVED' ? 'Approve' : 'Reject'}
        message={
          <div className="space-y-4 text-left">
            <p className="text-xs font-semibold text-text-secondary">
              Are you sure you want to {decisionStatus.toLowerCase()} this shift request for{' '}
              <strong className="text-text-primary">
                {selectedRequest?.employee ? `${selectedRequest.employee.firstName} ${selectedRequest.employee.lastName}` : 'this employee'}
              </strong>?
            </p>
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-wider text-text-secondary">
                Review Notes / Reason
              </label>
              <textarea
                value={decisionNote}
                onChange={(e) => setDecisionNote(e.target.value)}
                placeholder="Write reason for approval/rejection..."
                rows={3}
                className="w-full px-3 py-2 bg-surface-variant border border-border rounded-sm text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-text-primary"
              />
            </div>
          </div>
        }
      />
    </div>
  );
};

export default ShiftManagementPage;
