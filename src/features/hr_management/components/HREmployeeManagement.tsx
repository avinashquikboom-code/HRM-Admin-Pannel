"use client";

import { useState, useEffect, useCallback } from 'react';
import ConfirmModal from '@/components/ConfirmModal';
import LinkEmployeeToOfficeModal from './LinkEmployeeToOfficeModal';
import { 
  Users, 
  UserPlus, 
  Edit, 
  Trash2, 
  Building, 
  Mail, 
  Phone, 
  Briefcase,
  Search,
  Filter,
  X,
  Check,
  AlertCircle,
  RefreshCw,
  Clock,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import {
  fetchHREmployees,
  fetchHROffices,
  fetchHRDepartments,
  createHREmployee,
  updateHREmployee,
  deleteHREmployee,
  HREmployee,
  HROffice,
  HRDepartment,
  CreateHREmployeeRequest,
  UpdateHREmployeeRequest,
  HREmployeesResponse
} from '@/services/hrService';
import { sendOfficeAssignedNotification } from '@/services/notificationService';
import { fetchShifts } from '@/services/employeeService';

interface HREmployeeManagementProps {
  className?: string;
  refreshTrigger?: number;
}

const HREmployeeManagement: React.FC<HREmployeeManagementProps> = ({ className, refreshTrigger }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Employee data
  const [employees, setEmployees] = useState<HREmployee[]>([]);
  const [offices, setOffices] = useState<HROffice[]>([]);
  const [departments, setDepartments] = useState<HRDepartment[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  });

  // Form states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<HREmployee | null>(null);
  const [formData, setFormData] = useState<CreateHREmployeeRequest>({
    email: '',
    firstName: '',
    lastName: '',
    designation: '',
    status: 'active',
    officeId: undefined,
    departmentId: undefined,
    phone: '',
    aadharNumber: '',
    pfNumber: '',
    esicNumber: '',
    isHandicapped: false,
    currentAddress: '',
    permanentAddress: '',
    workModeId: 'OFFICE',
    shiftTypeId: 'MORNING',
    shiftId: undefined,
    effectiveFrom: ''
  });

  const [shiftsList, setShiftsList] = useState<any[]>([]);

  const [sameAsPermanent, setSameAsPermanent] = useState(false);

  // Search and filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');

  // Loading states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<HREmployee | null>(null);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [employeeToLink, setEmployeeToLink] = useState<HREmployee | null>(null);

  // Error and success message state
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const loadEmployees = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);

    try {
      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
      };
      
      if (searchTerm) params.search = searchTerm;
      if (statusFilter) params.status = statusFilter;
      if (departmentFilter) params.department = departmentFilter;

      const response: HREmployeesResponse = await fetchHREmployees(params);
      setEmployees(response.employees);
      setPagination({
        total: response.total,
        page: response.page,
        limit: response.limit,
        totalPages: response.totalPages
      });
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to fetch employees.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [pagination.page, pagination.limit, searchTerm, statusFilter, departmentFilter]);

  const loadOfficesAndDepartments = useCallback(async () => {
    try {
      const [officesRes, departmentsRes, shiftsRes] = await Promise.all([
        fetchHROffices(),
        fetchHRDepartments(),
        fetchShifts()
      ]);
      setOffices(officesRes);
      setDepartments(departmentsRes);
      setShiftsList(shiftsRes || []);
    } catch (err: any) {
      console.error('Failed to load offices, departments, and shifts:', err);
      // Set empty arrays to prevent UI from hanging
      setOffices([]);
      setDepartments([]);
      setShiftsList([]);
    }
  }, []);

  useEffect(() => {
    loadEmployees(refreshTrigger !== undefined && refreshTrigger > 0);
    loadOfficesAndDepartments();
  }, [refreshTrigger]);

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const newEmployee = await createHREmployee(formData);
      showSuccessMessage('Employee created successfully!');
      setIsCreateModalOpen(false);

      // Send mobile notification if an office was selected during creation
      if (formData.officeId) {
        const assignedOffice = offices.find((o) => o.id === formData.officeId);
        if (assignedOffice) {
          sendOfficeAssignedNotification({
            employeeId: newEmployee.id,
            employeeName: `${formData.firstName} ${formData.lastName ?? ''}`.trim(),
            officeName: assignedOffice.name,
          });
        }
      }

      setFormData({
        email: '',
        firstName: '',
        lastName: '',
        designation: '',
        status: 'active',
        officeId: undefined,
        departmentId: undefined,
        phone: '',
        aadharNumber: '',
        pfNumber: '',
        esicNumber: '',
        isHandicapped: false,
        currentAddress: '',
        permanentAddress: '',
        workModeId: 'OFFICE',
        shiftTypeId: 'MORNING',
        shiftId: undefined,
        effectiveFrom: ''
      });
      setSameAsPermanent(false);
      loadEmployees();
    } catch (err: any) {
      setError(err?.message || 'Failed to create employee.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;
    
    setIsSubmitting(true);
    setError(null);

    // Capture the old office name before update to detect office change
    const previousOfficeName = typeof selectedEmployee.office === 'object' && selectedEmployee.office !== null
      ? selectedEmployee.office.name
      : selectedEmployee.office;

    try {
      const updateData: UpdateHREmployeeRequest = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        designation: formData.designation,
        status: formData.status,
        officeId: formData.officeId,
        departmentId: formData.departmentId,
        phone: formData.phone
      };
      
      const updatedEmployee = await updateHREmployee(selectedEmployee.id, updateData);
      showSuccessMessage('Employee updated successfully!');
      setIsEditModalOpen(false);
      setSelectedEmployee(null);

      // Send notification only if office changed
      const newOffice = offices.find((o) => o.id === formData.officeId);
      const officeChanged =
        formData.officeId !== undefined &&
        newOffice &&
        newOffice.name !== previousOfficeName;

      if (officeChanged && newOffice) {
        sendOfficeAssignedNotification({
          employeeId: updatedEmployee.id,
          employeeName: updatedEmployee.fullName,
          officeName: newOffice.name,
        });
      }

      loadEmployees();
    } catch (err: any) {
      setError(err?.message || 'Failed to update employee.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEmployee = (employee: HREmployee) => {
    setEmployeeToDelete(employee);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteEmployee = async () => {
    if (!employeeToDelete) return;

    setIsDeleting(employeeToDelete.id);
    try {
      await deleteHREmployee(employeeToDelete.id);
      showSuccessMessage('Employee deleted successfully!');
      loadEmployees();
    } catch (err: any) {
      setError(err?.message || 'Failed to delete employee.');
    } finally {
      setIsDeleting(null);
      setDeleteConfirmOpen(false);
      setEmployeeToDelete(null);
    }
  };

  const openEditModal = (employee: HREmployee) => {
    setSelectedEmployee(employee);
    setFormData({
      email: employee.email || '',
      firstName: employee.firstName,
      lastName: employee.lastName,
      designation: employee.designation,
      status: employee.status,
      officeId: typeof employee.office === 'object' && employee.office !== null
        ? Number(employee.office.id)
        : offices.find(o => o.name === employee.office)?.id,
      departmentId: typeof employee.department === 'object' && employee.department !== null
        ? Number(employee.department.id)
        : departments.find(d => d.name === employee.department)?.id,
      phone: employee.phone || '',
      aadharNumber: employee.aadharNumber || '',
      pfNumber: employee.pfNumber || '',
      esicNumber: employee.esicNumber || '',
      isHandicapped: employee.isHandicapped || false,
      currentAddress: employee.currentAddress || '',
      permanentAddress: employee.permanentAddress || '',
      workModeId: employee.workModeId || 'OFFICE',
      shiftTypeId: employee.shiftTypeId || 'MORNING',
      shiftId: employee.shift ? Number(employee.shift.id) : undefined,
      effectiveFrom: ''
    });
    setSameAsPermanent(false);
    setIsEditModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'inactive':
        return 'bg-slate-500/10 text-text-secondary border-border';
      default:
        return 'bg-slate-500/10 text-text-secondary border-border';
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="heading-2 text-text-primary flex items-center gap-2 text-lg font-black tracking-tight">
            <Users size={18} className="text-primary animate-pulse" />
            Employee Management
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">Add, edit, and manage employee records with company assignments</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="btn-primary py-2.5 px-4 rounded-sm flex items-center gap-2 text-xs font-black shadow-lg shadow-primary/10 transition-all"
        >
          <UserPlus size={14} />
          Add Employee
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary/50" />
          <input
            type="text"
            placeholder="Search employees by name, code, or designation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-surface-variant/40 border border-border hover:border-border-hover focus:border-primary/30 rounded-sm text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-semibold text-text-primary placeholder:text-text-secondary/50"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-surface-variant border border-border rounded-sm px-4 py-2.5 text-xs outline-none cursor-pointer hover:border-border-hover transition-all font-bold text-text-primary"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="bg-surface-variant border border-border rounded-sm px-4 py-2.5 text-xs outline-none cursor-pointer hover:border-border-hover transition-all font-bold text-text-primary"
        >
          <option value="">All Departments</option>
          {departments.map((dept) => (
            <option key={dept.id} value={dept.name}>{dept.name}</option>
          ))}
        </select>
        <button
          onClick={() => loadEmployees(true)}
          disabled={isRefreshing}
          className="p-2.5 bg-surface-variant/50 hover:bg-surface-variant/80 text-text-secondary hover:text-primary rounded-sm border border-border/50 transition-all duration-300 active:scale-95 disabled:opacity-50"
        >
          <RefreshCw size={14} className={cn(isRefreshing && "animate-spin")} />
        </button>
      </div>

      {/* Success Message Display */}
      <AnimatePresence>
        {successMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-between p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-sm text-emerald-400 text-sm"
          >
            <div className="flex items-center gap-3">
              <Check size={18} className="text-emerald-400" />
              <span className="font-medium">{successMessage}</span>
            </div>
            <button 
              onClick={() => setSuccessMessage(null)}
              className="p-1 hover:bg-emerald-500/20 rounded-lg transition-colors"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Display */}
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-4 bg-error/10 border border-error/20 rounded-sm text-error-text text-sm"
        >
          <div className="flex items-center gap-3">
            <AlertCircle size={18} className="text-error" />
            <span className="font-medium">{error}</span>
          </div>
          <button 
            onClick={() => setError(null)}
            className="p-1 hover:bg-error/20 rounded-lg transition-colors"
          >
            <X size={16} />
          </button>
        </motion.div>
      )}

      {/* Employee Table */}
      <div className="border border-border bg-surface shadow-sm overflow-hidden rounded-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-variant/50 border-b border-border">
              <tr>
                <th className="text-left p-4 text-xs font-black text-text-secondary uppercase tracking-wider">Employee</th>
                <th className="text-left p-4 text-xs font-black text-text-secondary uppercase tracking-wider">Contact</th>
                <th className="text-left p-4 text-xs font-black text-text-secondary uppercase tracking-wider">Company</th>
                <th className="text-left p-4 text-xs font-black text-text-secondary uppercase tracking-wider">Department</th>
                <th className="text-left p-4 text-xs font-black text-text-secondary uppercase tracking-wider">Work Mode</th>
                <th className="text-left p-4 text-xs font-black text-text-secondary uppercase tracking-wider">Shift Type</th>
                <th className="text-left p-4 text-xs font-black text-text-secondary uppercase tracking-wider">Shift</th>
                <th className="text-left p-4 text-xs font-black text-text-secondary uppercase tracking-wider">Status</th>
                <th className="text-left p-4 text-xs font-black text-text-secondary uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-4">
                      <div className="h-4 bg-surface-variant rounded w-3/4"></div>
                    </td>
                    <td className="p-4">
                      <div className="h-4 bg-surface-variant rounded w-1/2"></div>
                    </td>
                    <td className="p-4">
                      <div className="h-4 bg-surface-variant rounded w-1/3"></div>
                    </td>
                    <td className="p-4">
                      <div className="h-4 bg-surface-variant rounded w-1/3"></div>
                    </td>
                    <td className="p-4">
                      <div className="h-4 bg-surface-variant rounded w-1/4"></div>
                    </td>
                    <td className="p-4">
                      <div className="h-4 bg-surface-variant rounded w-1/4"></div>
                    </td>
                    <td className="p-4">
                      <div className="h-4 bg-surface-variant rounded w-1/4"></div>
                    </td>
                    <td className="p-4">
                      <div className="h-4 bg-surface-variant rounded w-1/4"></div>
                    </td>
                    <td className="p-4">
                      <div className="h-4 bg-surface-variant rounded w-1/2"></div>
                    </td>
                  </tr>
                ))
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-text-secondary">
                    <Users size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="text-sm font-medium text-text-primary">No employees found</p>
                    <p className="text-xs mt-2 text-text-secondary">
                      {searchTerm || statusFilter || departmentFilter 
                        ? 'Try adjusting your search or filters to see more results'
                        : 'Start by adding your first employee to the system'
                      }
                    </p>
                    {!searchTerm && !statusFilter && !departmentFilter && (
                      <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="mt-4 px-4 py-2 bg-primary text-white rounded-sm text-xs font-black hover:bg-primary/90 transition-colors"
                      >
                        <UserPlus size={14} className="inline mr-2" />
                        Add First Employee
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                employees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-surface-variant/30 transition-colors">
                    <td className="p-4">
                      <div>
                        <p className="text-sm font-bold text-text-primary">{employee.fullName}</p>
                        <p className="text-xs text-text-secondary">{employee.employeeCode}</p>
                        <p className="text-xs text-text-secondary/70">{employee.designation}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        {employee.email && (
                          <div className="flex items-center gap-2 text-xs text-text-primary">
                            <Mail size={12} className="text-text-secondary/50" />
                            {employee.email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-xs text-text-primary">
                          <Building size={12} className="text-text-secondary/50" />
                          {employee.office 
                            ? (typeof employee.office === 'object' ? employee.office.name : employee.office) 
                            : 'Remote'}
                        </div>
                        {(!employee.office || employee.office === 'Remote' || (typeof employee.office === 'object' && employee.office.name === 'Remote')) && (
                          <button
                            type="button"
                            onClick={() => {
                              setEmployeeToLink(employee);
                              setIsLinkModalOpen(true);
                            }}
                            className="text-[10px] font-bold text-primary hover:text-primary-dark transition-colors cursor-pointer hover:underline text-left"
                          >
                            Link to Office
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-xs text-text-primary">
                        <Briefcase size={12} className="text-text-secondary/50" />
                        {employee.department 
                          ? (typeof employee.department === 'object' ? employee.department.name : employee.department) 
                          : 'Unassigned'}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-xs font-bold text-text-primary capitalize">{employee.workModeId?.toLowerCase() || 'office'}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-xs font-bold text-text-primary capitalize">{employee.shiftTypeId?.toLowerCase().replace('_', ' ') || 'morning'}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-xs font-bold text-text-primary">{employee.shift?.name || '—'}</span>
                    </td>
                    <td className="p-4">
                      <span className={cn(
                        "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black border",
                        getStatusColor(employee.status)
                      )}>
                        {employee.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(employee)}
                          className="p-1.5 bg-surface-variant hover:bg-surface-variant/80 text-text-secondary hover:text-primary rounded-sm transition-colors border border-border/50"
                          title="Edit employee"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteEmployee(employee)}
                          disabled={isDeleting === employee.id}
                          className="p-1.5 bg-surface-variant hover:bg-rose-500/10 text-text-secondary hover:text-rose-600 rounded-sm transition-colors disabled:opacity-50 border border-border/50"
                          title="Delete employee"
                        >
                          {isDeleting === employee.id ? (
                            <RefreshCw size={14} className="animate-spin" />
                          ) : (
                            <Trash2 size={14} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-border">
            <p className="text-xs text-text-secondary">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} employees
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                disabled={pagination.page === 1}
                className="p-2 bg-surface-variant hover:bg-surface-variant/80 text-text-secondary rounded-sm transition-colors border border-border/50 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-xs text-text-secondary px-2 font-semibold">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
                disabled={pagination.page === pagination.totalPages}
                className="p-2 bg-surface-variant hover:bg-surface-variant/80 text-text-secondary rounded-sm transition-colors border border-border/50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Employee Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsCreateModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="border border-border bg-surface rounded-sm p-8 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-black text-text-primary mb-6 flex items-center gap-2">
                <UserPlus size={18} className="text-primary" />
                Add New Employee
              </h3>
              
              <form onSubmit={handleCreateEmployee} className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-text-secondary uppercase tracking-wider mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full p-3 bg-surface-variant border border-border rounded-sm text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all font-semibold text-text-primary placeholder:text-text-secondary/50"
                    placeholder="employee@company.com"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-text-secondary uppercase tracking-wider mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      className="w-full p-3 bg-surface-variant border border-border rounded-sm text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all font-semibold text-text-primary placeholder:text-text-secondary/50"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-text-secondary uppercase tracking-wider mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      className="w-full p-3 bg-surface-variant border border-border rounded-sm text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all font-semibold text-text-primary placeholder:text-text-secondary/50"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-text-secondary uppercase tracking-wider mb-2">
                    Designation
                  </label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) => setFormData(prev => ({ ...prev, designation: e.target.value }))}
                    className="w-full p-3 bg-surface-variant border border-border rounded-sm text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all font-semibold text-text-primary placeholder:text-text-secondary/50"
                    placeholder="Software Engineer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-text-secondary uppercase tracking-wider mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full p-3 bg-surface-variant border border-border rounded-sm text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all font-semibold text-text-primary placeholder:text-text-secondary/50"
                    placeholder="+91 9876543210"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-text-secondary uppercase tracking-wider mb-2">
                    Aadhar Number
                  </label>
                  <input
                    type="text"
                    value={formData.aadharNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, aadharNumber: e.target.value }))}
                    className="w-full p-3 bg-surface-variant border border-border rounded-sm text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all font-semibold text-text-primary placeholder:text-text-secondary/50"
                    placeholder="12-digit Aadhar number"
                    maxLength={12}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-text-secondary uppercase tracking-wider mb-2">
                      PF Number (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.pfNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, pfNumber: e.target.value }))}
                      className="w-full p-3 bg-surface-variant border border-border rounded-sm text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all font-semibold text-text-primary placeholder:text-text-secondary/50"
                      placeholder="PF Number"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-text-secondary uppercase tracking-wider mb-2">
                      ESIC Number (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.esicNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, esicNumber: e.target.value }))}
                      className="w-full p-3 bg-surface-variant border border-border rounded-sm text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all font-semibold text-text-primary placeholder:text-text-secondary/50"
                      placeholder="ESIC Number"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-surface-variant/50 border border-border rounded-sm">
                  <input
                    type="checkbox"
                    id="isHandicapped"
                    checked={formData.isHandicapped}
                    onChange={(e) => setFormData(prev => ({ ...prev, isHandicapped: e.target.checked }))}
                    className="w-4 h-4 rounded"
                  />
                  <label htmlFor="isHandicapped" className="text-xs font-bold text-text-primary cursor-pointer">
                    Handicapped
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-black text-text-secondary uppercase tracking-wider mb-2">
                    Permanent Address
                  </label>
                  <textarea
                    value={formData.permanentAddress}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, permanentAddress: e.target.value }));
                      if (sameAsPermanent) {
                        setFormData(prev => ({ ...prev, currentAddress: e.target.value }));
                      }
                    }}
                    className="w-full p-3 bg-surface-variant border border-border rounded-sm text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all font-semibold text-text-primary placeholder:text-text-secondary/50 resize-none"
                    placeholder="Enter permanent address"
                    rows={3}
                  />
                </div>

                <div className="flex items-center gap-3 p-3 bg-surface-variant/50 border border-border rounded-sm">
                  <input
                    type="checkbox"
                    id="sameAsPermanent"
                    checked={sameAsPermanent}
                    onChange={(e) => {
                      setSameAsPermanent(e.target.checked);
                      if (e.target.checked) {
                        setFormData(prev => ({ ...prev, currentAddress: prev.permanentAddress }));
                      }
                    }}
                    className="w-4 h-4 rounded"
                  />
                  <label htmlFor="sameAsPermanent" className="text-xs font-bold text-text-primary cursor-pointer">
                    Same as permanent address
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-black text-text-secondary uppercase tracking-wider mb-2">
                    Current Address
                  </label>
                  <textarea
                    value={formData.currentAddress}
                    onChange={(e) => setFormData(prev => ({ ...prev, currentAddress: e.target.value }))}
                    disabled={sameAsPermanent}
                    className={cn(
                      "w-full p-3 bg-surface-variant border border-border rounded-sm text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all font-semibold text-text-primary placeholder:text-text-secondary/50 resize-none",
                      sameAsPermanent && "opacity-50 cursor-not-allowed"
                    )}
                    placeholder="Enter current address"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-text-secondary uppercase tracking-wider mb-2">
                      Company
                    </label>
                    <select
                      value={formData.officeId || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, officeId: e.target.value ? parseInt(e.target.value) : undefined }))}
                      className="w-full p-3 bg-surface-variant border border-border rounded-sm text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all font-bold text-text-primary"
                    >
                      <option value="">Select Company</option>
                      {offices.map((office) => (
                        <option key={office.id} value={office.id}>{office.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-text-secondary uppercase tracking-wider mb-2">
                      Department *
                    </label>
                    <select
                      required
                      value={formData.departmentId || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, departmentId: e.target.value ? parseInt(e.target.value) : undefined }))}
                      className="w-full p-3 bg-surface-variant border border-border rounded-sm text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all font-bold text-text-primary"
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="mt-2 w-full p-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded-sm text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                    >
                      <UserPlus size={12} />
                      Create Role
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-text-secondary uppercase tracking-wider mb-2">
                      Work Mode
                    </label>
                    <select
                      value={formData.workModeId || 'OFFICE'}
                      onChange={(e) => setFormData(prev => ({ ...prev, workModeId: e.target.value }))}
                      className="w-full p-3 bg-surface-variant border border-border rounded-sm text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all font-bold text-text-primary"
                    >
                      <option value="OFFICE">Office (On-site)</option>
                      <option value="HYBRID">Hybrid</option>
                      <option value="REMOTE">Remote</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-text-secondary uppercase tracking-wider mb-2">
                      Shift Type
                    </label>
                    <select
                      value={formData.shiftTypeId || 'MORNING'}
                      onChange={(e) => setFormData(prev => ({ ...prev, shiftTypeId: e.target.value }))}
                      className="w-full p-3 bg-surface-variant border border-border rounded-sm text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all font-bold text-text-primary"
                    >
                      <option value="MORNING">Morning Shift</option>
                      <option value="EVENING">Evening Shift</option>
                      <option value="NIGHT">Night Shift</option>
                      <option value="ON_FIELD">On Field Shift</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-text-secondary uppercase tracking-wider mb-2">
                      Shift Allocation
                    </label>
                    <select
                      value={formData.shiftId || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, shiftId: e.target.value ? parseInt(e.target.value) : undefined }))}
                      className="w-full p-3 bg-surface-variant border border-border rounded-sm text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all font-bold text-text-primary"
                    >
                      <option value="">Select Shift</option>
                      {shiftsList.map((shift) => (
                        <option key={shift.id} value={shift.id}>{shift.name} ({shift.startTime} - {shift.endTime})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-text-secondary uppercase tracking-wider mb-2">
                      Assignment Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.effectiveFrom || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, effectiveFrom: e.target.value }))}
                      className="w-full p-3 bg-surface-variant border border-border rounded-sm text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all font-bold text-text-primary"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="flex-1 p-3 border border-border text-text-secondary rounded-sm transition-colors font-bold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 btn-primary py-3 rounded-sm font-black text-xs shadow-lg shadow-primary/10 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Creating...' : 'Create Employee'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Employee Modal */}
      <AnimatePresence>
        {isEditModalOpen && selectedEmployee && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsEditModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="border border-border bg-surface rounded-sm p-8 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-black text-text-primary mb-6 flex items-center gap-2">
                <Edit size={18} className="text-primary" />
                Edit Employee
              </h3>
              
              <form onSubmit={handleUpdateEmployee} className="space-y-4">
                <div className="p-3 bg-surface-variant/50 border border-border rounded-sm">
                  <p className="text-xs text-text-secondary font-medium">Employee Code</p>
                  <p className="text-sm font-bold text-text-primary">{selectedEmployee.employeeCode}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-text-secondary uppercase tracking-wider mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      className="w-full p-3 bg-surface-variant border border-border rounded-sm text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all font-semibold text-text-primary placeholder:text-text-secondary/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-text-secondary uppercase tracking-wider mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      className="w-full p-3 bg-surface-variant border border-border rounded-sm text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all font-semibold text-text-primary placeholder:text-text-secondary/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-text-secondary uppercase tracking-wider mb-2">
                    Designation
                  </label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) => setFormData(prev => ({ ...prev, designation: e.target.value }))}
                    className="w-full p-3 bg-surface-variant border border-border rounded-sm text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all font-semibold text-text-primary placeholder:text-text-secondary/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-text-secondary uppercase tracking-wider mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full p-3 bg-surface-variant border border-border rounded-sm text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all font-semibold text-text-primary placeholder:text-text-secondary/50"
                    placeholder="+91 9876543210"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-text-secondary uppercase tracking-wider mb-2">
                    Aadhar Number
                  </label>
                  <input
                    type="text"
                    value={formData.aadharNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, aadharNumber: e.target.value }))}
                    className="w-full p-3 bg-surface-variant border border-border rounded-sm text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all font-semibold text-text-primary placeholder:text-text-secondary/50"
                    placeholder="12-digit Aadhar number"
                    maxLength={12}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-text-secondary uppercase tracking-wider mb-2">
                      PF Number (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.pfNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, pfNumber: e.target.value }))}
                      className="w-full p-3 bg-surface-variant border border-border rounded-sm text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all font-semibold text-text-primary placeholder:text-text-secondary/50"
                      placeholder="PF Number"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-text-secondary uppercase tracking-wider mb-2">
                      ESIC Number (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.esicNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, esicNumber: e.target.value }))}
                      className="w-full p-3 bg-surface-variant border border-border rounded-sm text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all font-semibold text-text-primary placeholder:text-text-secondary/50"
                      placeholder="ESIC Number"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-surface-variant/50 border border-border rounded-sm">
                  <input
                    type="checkbox"
                    id="editIsHandicapped"
                    checked={formData.isHandicapped}
                    onChange={(e) => setFormData(prev => ({ ...prev, isHandicapped: e.target.checked }))}
                    className="w-4 h-4 rounded"
                  />
                  <label htmlFor="editIsHandicapped" className="text-xs font-bold text-text-primary cursor-pointer">
                    Handicapped
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-black text-text-secondary uppercase tracking-wider mb-2">
                    Permanent Address
                  </label>
                  <textarea
                    value={formData.permanentAddress}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, permanentAddress: e.target.value }));
                      if (sameAsPermanent) {
                        setFormData(prev => ({ ...prev, currentAddress: e.target.value }));
                      }
                    }}
                    className="w-full p-3 bg-surface-variant border border-border rounded-sm text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all font-semibold text-text-primary placeholder:text-text-secondary/50 resize-none"
                    placeholder="Enter permanent address"
                    rows={3}
                  />
                </div>

                <div className="flex items-center gap-3 p-3 bg-surface-variant/50 border border-border rounded-sm">
                  <input
                    type="checkbox"
                    id="editSameAsPermanent"
                    checked={sameAsPermanent}
                    onChange={(e) => {
                      setSameAsPermanent(e.target.checked);
                      if (e.target.checked) {
                        setFormData(prev => ({ ...prev, currentAddress: prev.permanentAddress }));
                      }
                    }}
                    className="w-4 h-4 rounded"
                  />
                  <label htmlFor="editSameAsPermanent" className="text-xs font-bold text-text-primary cursor-pointer">
                    Same as permanent address
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-black text-text-secondary uppercase tracking-wider mb-2">
                    Current Address
                  </label>
                  <textarea
                    value={formData.currentAddress}
                    onChange={(e) => setFormData(prev => ({ ...prev, currentAddress: e.target.value }))}
                    disabled={sameAsPermanent}
                    className={cn(
                      "w-full p-3 bg-surface-variant border border-border rounded-sm text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all font-semibold text-text-primary placeholder:text-text-secondary/50 resize-none",
                      sameAsPermanent && "opacity-50 cursor-not-allowed"
                    )}
                    placeholder="Enter current address"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-text-secondary uppercase tracking-wider mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full p-3 bg-surface-variant border border-border rounded-sm text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all font-bold text-text-primary"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-text-secondary uppercase tracking-wider mb-2">
                      Company
                    </label>
                    <select
                      value={formData.officeId || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, officeId: e.target.value ? parseInt(e.target.value) : undefined }))}
                      className="w-full p-3 bg-surface-variant border border-border rounded-sm text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all font-bold text-text-primary"
                    >
                      <option value="">Select Company</option>
                      {offices.map((office) => (
                        <option key={office.id} value={office.id}>{office.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-text-secondary uppercase tracking-wider mb-2">
                      Department *
                    </label>
                    <select
                      required
                      value={formData.departmentId || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, departmentId: e.target.value ? parseInt(e.target.value) : undefined }))}
                      className="w-full p-3 bg-surface-variant border border-border rounded-sm text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all font-bold text-text-primary"
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-text-secondary uppercase tracking-wider mb-2">
                      Work Mode
                    </label>
                    <select
                      value={formData.workModeId || 'OFFICE'}
                      onChange={(e) => setFormData(prev => ({ ...prev, workModeId: e.target.value }))}
                      className="w-full p-3 bg-surface-variant border border-border rounded-sm text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all font-bold text-text-primary"
                    >
                      <option value="OFFICE">Office (On-site)</option>
                      <option value="HYBRID">Hybrid</option>
                      <option value="REMOTE">Remote</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-text-secondary uppercase tracking-wider mb-2">
                      Shift Type
                    </label>
                    <select
                      value={formData.shiftTypeId || 'MORNING'}
                      onChange={(e) => setFormData(prev => ({ ...prev, shiftTypeId: e.target.value }))}
                      className="w-full p-3 bg-surface-variant border border-border rounded-sm text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all font-bold text-text-primary"
                    >
                      <option value="MORNING">Morning Shift</option>
                      <option value="EVENING">Evening Shift</option>
                      <option value="NIGHT">Night Shift</option>
                      <option value="ON_FIELD">On Field Shift</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-text-secondary uppercase tracking-wider mb-2">
                      Shift Allocation
                    </label>
                    <select
                      value={formData.shiftId || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, shiftId: e.target.value ? parseInt(e.target.value) : undefined }))}
                      className="w-full p-3 bg-surface-variant border border-border rounded-sm text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all font-bold text-text-primary"
                    >
                      <option value="">Select Shift</option>
                      {shiftsList.map((shift) => (
                        <option key={shift.id} value={shift.id}>{shift.name} ({shift.startTime} - {shift.endTime})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-text-secondary uppercase tracking-wider mb-2">
                      Assignment Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.effectiveFrom || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, effectiveFrom: e.target.value }))}
                      className="w-full p-3 bg-surface-variant border border-border rounded-sm text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all font-bold text-text-primary"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="flex-1 p-3 border border-border text-text-secondary rounded-sm transition-colors font-bold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 btn-primary py-3 rounded-sm font-black text-xs shadow-lg shadow-primary/10 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Updating...' : 'Update Employee'}
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
        onConfirm={confirmDeleteEmployee}
        title="Delete Employee"
        message={employeeToDelete ? `Are you sure you want to delete "${employeeToDelete.firstName} ${employeeToDelete.lastName}"? This action cannot be undone.` : 'Are you sure you want to delete this employee? This action cannot be undone.'}
        confirmText="Delete"
        cancelText="Cancel"
      />

      <LinkEmployeeToOfficeModal
        isOpen={isLinkModalOpen}
        employee={employeeToLink}
        onClose={() => {
          setIsLinkModalOpen(false);
          setEmployeeToLink(null);
        }}
        onLinked={() => {
          loadEmployees();
        }}
      />
    </div>
  );
};

export default HREmployeeManagement;
