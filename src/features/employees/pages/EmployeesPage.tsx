"use client";

import { useEffect, useMemo, useState } from 'react';
import {
  Search,
  MoreVertical,
  Mail,
  Building2,
  Briefcase,
  Calendar,
  Users,
  UserPlus,
  RefreshCw,
  UserCheck,
  Lock,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Edit
} from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import Link from 'next/link';
import { cn } from '@/utils/cn';
import TableSkeleton from '@/components/TableSkeleton';
import SuperAdminHeader from '@/components/SuperAdminHeader';
import { useEmployees } from '@/hooks/useEmployees';
import ResetPasswordModal from '../components/ResetPasswordModal';
import EditEmployeeModal from '../components/EditEmployeeModal';
import ConfirmModal from '@/components/ConfirmModal';
import { toast } from 'sonner';
import { deleteEmployee, unassignEmployeeFromOffice, unassignEmployeeFromDepartment } from '@/services/employeeService';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

function formatStatus(status: string) {
  if (!status) return 'Inactive';
  switch (status.toUpperCase()) {
    case 'ACTIVE':
      return 'Active';
    case 'ON_LEAVE':
      return 'On Leave';
    case 'TERMINATED':
      return 'Terminated';
    case 'INACTIVE':
      return 'Inactive';
    default:
      return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  }
}

const EmployeesPage = () => {
  const { employees, isLoading, error, refetch } = useEmployees();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [unassignConfirmOpen, setUnassignConfirmOpen] = useState(false);
  const [employeeToUnassign, setEmployeeToUnassign] = useState<any>(null);
  const [isUnassigning, setIsUnassigning] = useState<string | null>(null);
  const [unassignDeptConfirmOpen, setUnassignDeptConfirmOpen] = useState(false);
  const [employeeToUnassignDept, setEmployeeToUnassignDept] = useState<any>(null);
  const [isUnassigningDept, setIsUnassigningDept] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<any>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredEmployees = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return employees;

    return employees.filter((employee) => {
      const fullName = `${employee.firstName} ${employee.lastName}`.toLowerCase();
      const email = employee.user?.email?.toLowerCase() ?? '';
      const role = employee.designation?.toLowerCase() ?? '';
      const office = employee.office?.name?.toLowerCase() ?? '';
      const code = employee.employeeCode.toLowerCase();

      return (
        fullName.includes(query) ||
        email.includes(query) ||
        role.includes(query) ||
        office.includes(query) ||
        code.includes(query)
      );
    });
  }, [employees, searchTerm]);

  const paginatedEmployees = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredEmployees.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredEmployees, currentPage, itemsPerPage]);

  const activeCount = employees.filter((employee) => employee.status?.toUpperCase() === 'ACTIVE').length;
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

  const handleResetPassword = (employee: any) => {
    setSelectedEmployee(employee);
    setIsPasswordModalOpen(true);
  };

  const handlePasswordResetSuccess = () => {
    refetch();
  };

  const handleDeleteEmployee = (employee: any) => {
    setEmployeeToDelete(employee);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteEmployee = async () => {
    if (!employeeToDelete) return;

    setIsDeleting(employeeToDelete.id);
    try {
      await deleteEmployee(employeeToDelete.id);
      toast.success('Employee deleted successfully!');
      refetch();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete employee.');
    } finally {
      setIsDeleting(null);
      setDeleteConfirmOpen(false);
      setEmployeeToDelete(null);
    }
  };

  const handleEditEmployee = (employee: any) => {
    setEmployeeToEdit(employee);
    setEditModalOpen(true);
  };

  const handleUnassignAll = (employee: any) => {
    setEmployeeToUnassign(employee);
    setUnassignConfirmOpen(true);
  };

  const confirmUnassignOffice = async () => {
    if (!employeeToUnassign) return;

    setIsUnassigning(employeeToUnassign.id);
    try {
      await unassignEmployeeFromOffice(employeeToUnassign.id);
      toast.success('Employee unassigned from store successfully!');
      refetch();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to unassign employee from store.');
    } finally {
      setIsUnassigning(null);
      setUnassignConfirmOpen(false);
      setEmployeeToUnassign(null);
    }
  };

  const handleUnassignOffice = (employee: any) => {
    setEmployeeToUnassign(employee);
    setUnassignConfirmOpen(true);
  };

  const handleUnassignDepartment = (employee: any) => {
    setEmployeeToUnassignDept(employee);
    setUnassignDeptConfirmOpen(true);
  };

  const confirmUnassignDepartment = async () => {
    if (!employeeToUnassignDept) return;

    setIsUnassigningDept(employeeToUnassignDept.id);
    try {
      await unassignEmployeeFromDepartment(employeeToUnassignDept.id);
      toast.success('Employee unassigned from department successfully!');
      refetch();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to unassign employee from department.');
    } finally {
      setIsUnassigningDept(null);
      setUnassignDeptConfirmOpen(false);
      setEmployeeToUnassignDept(null);
    }
  };

  return (
    <>
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6 sm:space-y-8 pb-10 text-text-primary animate-fadeIn"
    >
      <SuperAdminHeader
        title="Employee Directory"
        subtitle="Monitor and manage all employees across the platform ecosystem."
        badgeText="Active Employee Registry"
        badgeIcon={Users}
      >
        <button
            type="button"
            onClick={() => refetch()}
            className="p-4 bg-surface-variant hover:bg-surface-variant/80 text-text-secondary hover:text-text-primary rounded-sm border border-border transition-all active:scale-95 cursor-pointer"
            title="Refresh employees list"
          >
            <RefreshCw size={18} className={cn(isLoading && 'animate-spin')} />
          </button>
          <Link href="/users/register" className="btn-primary px-6 py-4 shrink-0 rounded-sm text-xs font-black uppercase tracking-wider justify-center flex items-center gap-2">
            <UserPlus size={18} />
            Register User
          </Link>
      </SuperAdminHeader>

      {error && (
        <div className="rounded-sm bg-rose-500/10 border border-rose-500/20 px-4.5 py-3.5 text-xs font-semibold text-rose-500 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => refetch()}
            className="text-[10px] font-black uppercase tracking-widest hover:text-rose-600 shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[
          { 
            label: 'Total Employees', 
            value: employees.length, 
            description: 'Across all departments',
            iconClass: 'from-blue-500/20 to-blue-500/5 text-blue-500 border-blue-500/20', 
            icon: Users 
          },
          { 
            label: 'Currently Active', 
            value: activeCount, 
            description: 'Available for assignments',
            iconClass: 'from-emerald-500/20 to-emerald-500/5 text-emerald-500 border-emerald-500/20', 
            icon: UserCheck 
          },
          { 
            label: 'Assigned Stores', 
            value: employees.filter((e) => e.office).length, 
            description: 'With physical locations',
            iconClass: 'from-amber-500/20 to-amber-500/5 text-amber-500 border-amber-500/20', 
            icon: Building2 
          },
        ].map((stat, i) => (
          <motion.div
            key={i}
            variants={itemVariants}
            whileHover={{ y: -3, scale: 1.01 }}
            className="p-6 border border-border bg-surface hover:shadow-md transition-all duration-300 relative overflow-hidden group rounded-[2px]"
          >
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-11 h-11 rounded-sm flex items-center justify-center shrink-0 bg-gradient-to-br border ${stat.iconClass}`}>
                  <stat.icon size={20} className="group-hover:scale-110 transition-transform duration-300" />
                </div>
              </div>
              
              <div>
                <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest leading-none">{stat.label}</p>
                <div className="flex items-end gap-2 mt-2">
                  <p className="text-3xl font-black text-text-primary leading-none">{stat.value}</p>
                </div>
                {stat.description && (
                  <p className="text-xs font-semibold text-text-secondary mt-1 leading-none">{stat.description}</p>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Search panel removed from here and integrated directly into table header to reduce layout redundancy */}

      {isLoading ? (
        <div className="relative overflow-hidden rounded-sm border border-border bg-surface p-8">
          <TableSkeleton rows={5} columns={6} />
        </div>
      ) : (
        <>
        {/* Mobile card list */}
        <motion.div variants={itemVariants} className="md:hidden space-y-3">
          <div className="p-5 bg-surface border border-border rounded-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">All Employees</h3>
              <div className="flex items-center gap-3">
                <span className="text-xs text-text-secondary font-semibold">{filteredEmployees.length} total</span>
                <Link href="/users/register" className="btn-primary px-4 py-2 rounded-sm text-xs font-black uppercase tracking-wider justify-center flex items-center gap-2">
                  <UserPlus size={16} />
                  Add Employee
                </Link>
              </div>
            </div>
            <div className="relative w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-hover:text-primary transition-colors w-4 h-4" />
              <input 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search employees..." 
                className="w-full pl-11 pr-4 py-2.5 bg-surface-variant border border-border hover:border-border/80 focus:border-primary/30 rounded-sm outline-none transition-all text-xs font-semibold text-text-primary placeholder-text-secondary/50"
              />
            </div>
          </div>

          {paginatedEmployees.length > 0 ? (
            paginatedEmployees.map((employee) => {
              const fullName = `${employee.firstName} ${employee.lastName}`;
              const initials = `${employee.firstName[0] ?? ''}${employee.lastName[0] ?? ''}`.toUpperCase();
              const statusLabel = formatStatus(employee.status);

              return (
                <div key={employee.id} className="relative overflow-hidden rounded-sm border border-border bg-surface p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-11 h-11 rounded-sm bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center font-black text-primary border border-primary/20 shrink-0">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-text-primary truncate">{fullName}</p>
                        <p className="text-xs text-text-secondary truncate mt-0.5">
                          {employee.user?.email ?? employee.employeeCode}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditEmployee(employee)}
                        className="p-2.5 hover:bg-blue-500/10 rounded-sm text-text-secondary hover:text-blue-500 border border-border shrink-0 cursor-pointer transition-all active:scale-95"
                        title="Edit Employee"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleResetPassword(employee)}
                        className="p-2.5 hover:bg-surface-variant rounded-sm text-text-secondary hover:text-primary border border-border shrink-0 cursor-pointer transition-all active:scale-95"
                        title="Reset Password"
                      >
                        <Lock size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteEmployee(employee)}
                        disabled={isDeleting === employee.id}
                        className="p-2.5 hover:bg-rose-500/10 rounded-sm text-text-secondary hover:text-rose-500 border border-border shrink-0 cursor-pointer transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete Employee"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div className="bg-surface-variant rounded-sm p-3 border border-border">
                      <p className="text-text-secondary uppercase tracking-widest text-[9px] font-black">Store</p>
                      <p className="font-bold text-text-primary mt-1.5 truncate">{employee.office?.name ?? 'Unassigned'}</p>
                    </div>
                    <div className="bg-surface-variant rounded-sm p-3 border border-border">
                      <p className="text-text-secondary uppercase tracking-widest text-[9px] font-black">Role</p>
                      <p className="font-bold text-text-primary mt-1.5 truncate">{employee.designation ?? '—'}</p>
                    </div>
                    <div className="bg-surface-variant rounded-sm p-3 border border-border">
                      <p className="text-text-secondary uppercase tracking-widest text-[9px] font-black">Comm. (%)</p>
                      <p className="font-bold text-text-primary mt-1.5 truncate">
                        {employee.commissionPercentage !== undefined && employee.commissionPercentage !== null
                          ? `${employee.commissionPercentage}%`
                          : '0%'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 pt-2">
                    <span className="text-xs text-text-secondary font-semibold truncate">{employee.department?.name ?? 'No department'}</span>
                    <span className={cn(
                      "px-3 py-1.5 rounded-sm text-[10px] font-black uppercase tracking-wider shrink-0 border inline-flex items-center gap-1.5",
                      statusLabel === 'Active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                      statusLabel === 'On Leave' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                    )}>
                      <span className={cn(
                        "w-1.5 h-1.5 rounded-full ",
                        statusLabel === 'Active' ? "bg-emerald-500" : 
                        statusLabel === 'On Leave' ? "bg-amber-500" : "bg-rose-500"
                      )} />
                      {statusLabel}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="relative overflow-hidden rounded-sm border border-border bg-surface p-8 text-center text-xs font-bold text-text-secondary uppercase tracking-widest">
              No employees found.
            </div>
          )}
          
          {/* Mobile pagination controls */}
          <div className="p-4.5 bg-surface border border-border rounded-sm flex flex-col gap-3">
            <div className="text-xs text-text-secondary font-semibold text-center">
              {filteredEmployees.length > 0 ? (
                <>
                  Showing <span className="text-text-primary font-bold">{Math.min((currentPage - 1) * itemsPerPage + 1, filteredEmployees.length)}</span> to{' '}
                  <span className="text-text-primary font-bold">{Math.min(currentPage * itemsPerPage, filteredEmployees.length)}</span> of{' '}
                  <span className="text-text-primary font-bold">{filteredEmployees.length}</span> employees
                </>
              ) : (
                "No employees found"
              )}
            </div>
            
            {totalPages > 1 && (
              <div className="flex items-center justify-between gap-2 mt-1">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="flex-1 py-2 bg-surface hover:bg-surface-variant text-text-primary border border-border rounded-sm text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <ChevronLeft size={14} />
                  Prev
                </button>
                <span className="text-xs text-text-secondary px-3 font-semibold shrink-0">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="flex-1 py-2 bg-surface hover:bg-surface-variant text-text-primary border border-border rounded-sm text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1.5"
                >
                  Next
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Desktop table */}
        <motion.div variants={itemVariants} className="relative overflow-hidden rounded-sm border border-border bg-surface hidden md:block">
          {/* Table Header/Toolbar */}
          <div className="px-8 py-6 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-variant/50">
            <div>
              <h3 className="text-base font-bold text-text-primary">All Employees</h3>
              <p className="text-xs text-text-secondary mt-1">Manage, verify, and search employee registry details</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative w-80 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-hover:text-primary transition-colors w-4 h-4" />
                <input 
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search employees..." 
                  className="w-full pl-11 pr-4 py-2.5 bg-surface-variant border border-border hover:border-border/80 focus:border-primary/30 rounded-sm outline-none transition-all text-xs font-semibold text-text-primary placeholder-text-secondary/50"
                />
              </div>
              <Link href="/users/register" className="btn-primary px-4 py-2.5 rounded-sm text-xs font-black uppercase tracking-wider justify-center flex items-center gap-2 shrink-0">
                <UserPlus size={16} />
                Add Employee
              </Link>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-variant/50 border-b border-border">
                  <th className="px-8 py-5 text-xs font-bold text-text-secondary uppercase tracking-wider">Employee</th>
                  <th className="px-8 py-5 text-xs font-bold text-text-secondary uppercase tracking-wider">Store</th>
                  <th className="px-8 py-5 text-xs font-bold text-text-secondary uppercase tracking-wider">Role</th>
                  <th className="px-8 py-5 text-xs font-bold text-text-secondary uppercase tracking-wider">Department</th>
                  <th className="px-8 py-5 text-xs font-bold text-text-secondary uppercase tracking-wider">Shift</th>
                  <th className="px-8 py-5 text-xs font-bold text-text-secondary uppercase tracking-wider">Work Mode</th>
                  <th className="px-8 py-5 text-xs font-bold text-text-secondary uppercase tracking-wider">Shift Type</th>
                  <th className="px-8 py-5 text-xs font-bold text-text-secondary uppercase tracking-wider">Commission (%)</th>
                  <th className="px-8 py-5 text-xs font-bold text-text-secondary uppercase tracking-wider">Status</th>
                  <th className="px-8 py-5 text-xs font-bold text-text-secondary uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedEmployees.length > 0 ? (
                  paginatedEmployees.map((employee) => {
                    const fullName = `${employee.firstName} ${employee.lastName}`;
                    const initials = `${employee.firstName[0] ?? ''}${employee.lastName[0] ?? ''}`.toUpperCase();
                    const statusLabel = formatStatus(employee.status);

                    return (
                      <motion.tr 
                        key={employee.id}
                        variants={itemVariants}
                        className="hover:bg-surface-variant/50 transition-colors group cursor-pointer"
                      >
                        <td className="px-8 py-4.5">
                          <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-sm bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center font-black text-primary border border-primary/20">
                              {initials}
                            </div>
                            <div>
                              <p className="font-bold text-text-primary group-hover:text-primary transition-colors">{fullName}</p>
                              <div className="flex items-center gap-1.5 text-xs text-text-secondary mt-1">
                                <Mail size={12} className="text-text-secondary/70" />
                                {employee.user?.email ?? employee.employeeCode}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-4.5">
                          <div className="flex items-center gap-2">
                            <Building2 size={16} className="text-text-secondary/70" />
                            <span className="text-sm font-semibold text-text-secondary group-hover:text-text-primary transition-colors">
                              {employee.office?.name ?? 'Unassigned'}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-4.5">
                          <span className="text-sm font-medium text-text-secondary">{employee.designation ?? '—'}</span>
                        </td>
                        <td className="px-8 py-4.5">
                          <span className="text-sm font-medium text-text-secondary">{employee.department?.name ?? '—'}</span>
                        </td>
                        <td className="px-8 py-4.5">
                          <span className="text-sm font-medium text-text-secondary">{employee.shift?.name ?? '—'}</span>
                        </td>
                        <td className="px-8 py-4.5">
                          <span className="text-xs font-bold text-text-primary capitalize">{employee.workModeId?.toLowerCase() || 'office'}</span>
                        </td>
                        <td className="px-8 py-4.5">
                          <span className="text-xs font-bold text-text-primary capitalize">{employee.shiftTypeId?.toLowerCase().replace('_', ' ') || 'morning'}</span>
                        </td>
                        <td className="px-8 py-4.5">
                          <span className="text-sm font-semibold text-text-primary">
                            {employee.commissionPercentage !== undefined && employee.commissionPercentage !== null
                              ? `${employee.commissionPercentage}%`
                              : '0%'}
                          </span>
                        </td>
                        <td className="px-8 py-4.5">
                          <span className={cn(
                            "px-3.5 py-1.5 rounded-sm text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1.5 border",
                            statusLabel === 'Active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                            statusLabel === 'On Leave' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                          )}>
                            <span className={cn(
                              "w-1.5 h-1.5 rounded-full ",
                              statusLabel === 'Active' ? "bg-emerald-500" : 
                              statusLabel === 'On Leave' ? "bg-amber-500" : "bg-rose-500"
                            )} />
                            {statusLabel}
                          </span>
                        </td>
                        <td className="px-8 py-4.5 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEditEmployee(employee)}
                              className="p-2.5 hover:bg-blue-500/10 rounded-sm text-text-secondary hover:text-blue-500 transition-all duration-300 border border-border active:scale-95 cursor-pointer"
                              title="Edit Employee"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleResetPassword(employee)}
                              className="p-2.5 hover:bg-surface-variant rounded-sm text-text-secondary hover:text-primary transition-all duration-300 border border-border active:scale-95 cursor-pointer"
                              title="Reset Password"
                            >
                              <Lock size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteEmployee(employee)}
                              disabled={isDeleting === employee.id}
                              className="p-2.5 hover:bg-rose-500/10 rounded-sm text-text-secondary hover:text-rose-500 transition-all duration-300 border border-border active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Delete Employee"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={9} className="px-8 py-12 text-center text-xs font-bold text-text-secondary uppercase tracking-widest bg-surface-variant/30">
                      No employees found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="p-6.5 bg-surface-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-border">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <p className="text-xs font-semibold text-text-secondary">
                {filteredEmployees.length > 0 ? (
                  <>
                    Showing <span className="text-text-primary font-bold">{Math.min((currentPage - 1) * itemsPerPage + 1, filteredEmployees.length)}</span> to{' '}
                    <span className="text-text-primary font-bold">{Math.min(currentPage * itemsPerPage, filteredEmployees.length)}</span> of{' '}
                    <span className="text-text-primary font-bold">{filteredEmployees.length}</span> employees
                  </>
                ) : (
                  "No employees found"
                )}
              </p>
              
              {filteredEmployees.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-secondary font-semibold">Show:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="bg-surface border border-border rounded-sm text-xs font-semibold px-2 py-1 outline-none text-text-primary focus:border-primary/30 transition-colors"
                  >
                    {[5, 10, 20, 50].map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3.5 py-2 bg-surface hover:bg-surface-variant text-text-primary border border-border rounded-sm text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
                >
                  <ChevronLeft size={14} />
                  Previous
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={cn(
                        "w-8 h-8 rounded-sm text-xs font-black transition-all cursor-pointer border flex items-center justify-center",
                        currentPage === page
                          ? "bg-primary text-white border-primary"
                          : "bg-surface hover:bg-surface-variant text-text-secondary border-border"
                      )}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3.5 py-2 bg-surface hover:bg-surface-variant text-text-primary border border-border rounded-sm text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
                >
                  Next
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>
        </motion.div>
        </>
      )}
    </motion.div>

    <ResetPasswordModal
      isOpen={isPasswordModalOpen}
      onClose={() => setIsPasswordModalOpen(false)}
      employee={selectedEmployee}
      onSuccess={handlePasswordResetSuccess}
    />

    <ConfirmModal
      isOpen={deleteConfirmOpen}
      onClose={() => setDeleteConfirmOpen(false)}
      onConfirm={confirmDeleteEmployee}
      title="Delete Employee"
      message={employeeToDelete ? `Are you sure you want to delete "${employeeToDelete.firstName} ${employeeToDelete.lastName}"? This action cannot be undone.` : 'Are you sure you want to delete this employee? This action cannot be undone.'}
      confirmText="Delete"
      cancelText="Cancel"
    />

    <ConfirmModal
      isOpen={unassignConfirmOpen}
      onClose={() => setUnassignConfirmOpen(false)}
      onConfirm={confirmUnassignOffice}
      title="Unassign Store"
      message={employeeToUnassign ? `Are you sure you want to unassign "${employeeToUnassign.firstName} ${employeeToUnassign.lastName}" from "${employeeToUnassign.office?.name}"?` : 'Are you sure you want to unassign this employee from their store?'}
      confirmText="Unassign"
      cancelText="Cancel"
    />

    <ConfirmModal
      isOpen={unassignDeptConfirmOpen}
      onClose={() => setUnassignDeptConfirmOpen(false)}
      onConfirm={confirmUnassignDepartment}
      title="Unassign Department"
      message={employeeToUnassignDept ? `Are you sure you want to unassign "${employeeToUnassignDept.firstName} ${employeeToUnassignDept.lastName}" from "${employeeToUnassignDept.department?.name}"?` : 'Are you sure you want to unassign this employee from their department?'}
      confirmText="Unassign"
      cancelText="Cancel"
    />

    <EditEmployeeModal
      isOpen={editModalOpen}
      employee={employeeToEdit}
      onClose={() => setEditModalOpen(false)}
      onUpdated={() => {
        refetch();
        setEditModalOpen(false);
      }}
    />
    </>
  );
};

export default EmployeesPage;
