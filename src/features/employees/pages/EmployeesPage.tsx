"use client";

import { useMemo, useState } from 'react';
import { 
  Search, 
  MoreVertical, 
  Mail,
  Building2,
  Calendar,
  Users,
  UserPlus,
  RefreshCw,
  UserCheck,
  Lock
} from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import Link from 'next/link';
import { cn } from '@/utils/cn';
import TableSkeleton from '@/components/TableSkeleton';
import SuperAdminHeader from '@/components/SuperAdminHeader';
import { useEmployees } from '@/hooks/useEmployees';
import ResetPasswordModal from '../components/ResetPasswordModal';

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

  const activeCount = employees.filter((employee) => employee.status?.toUpperCase() === 'ACTIVE').length;

  const handleResetPassword = (employee: any) => {
    setSelectedEmployee(employee);
    setIsPasswordModalOpen(true);
  };

  const handlePasswordResetSuccess = () => {
    refetch();
  };

  return (
    <>
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6 sm:space-y-8 pb-10 text-slate-100 animate-fadeIn"
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
            className="p-4 bg-slate-900/50 hover:bg-slate-800 text-slate-350 hover:text-white rounded-xl border border-white/5 transition-all shadow-sm active:scale-95 cursor-pointer"
            title="Refresh employees list"
          >
            <RefreshCw size={18} className={cn(isLoading && 'animate-spin')} />
          </button>
          <Link href="/users/register" className="btn-primary shadow-xl shadow-primary/20 hover:shadow-primary/30 px-6 py-4 shrink-0 rounded-xl text-xs font-black uppercase tracking-wider justify-center">
            <UserPlus size={18} />
            Register User
          </Link>
      </SuperAdminHeader>

      {error && (
        <div className="rounded-sm bg-rose-500/10 border border-rose-500/20 px-4.5 py-3.5 text-xs font-semibold text-rose-400 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => refetch()}
            className="text-[10px] font-black uppercase tracking-widest hover:text-white shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[
          { label: 'Total Employees', value: employees.length, color: 'from-blue-500/20 to-indigo-500/10 border-blue-500/30 text-blue-400', glow: 'rgba(59,130,246,0.15)', icon: Users },
          { label: 'Currently Active', value: activeCount, color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-450', glow: 'rgba(16,185,129,0.15)', icon: UserCheck },
          { label: 'Assigned Offices', value: employees.filter((e) => e.office).length, color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400', glow: 'rgba(245,158,11,0.15)', icon: Building2 },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            variants={itemVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="relative overflow-hidden rounded-[2rem] border border-white/5 bg-slate-900/40 p-6 flex items-center gap-5 shadow-2xl backdrop-blur-xl group hover:border-white/10 transition-all duration-300"
          >
            <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-white/5 rounded-full filter blur-xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
            <div 
              className={`w-14 h-14 rounded-sm flex items-center justify-center shrink-0 bg-gradient-to-br border ${stat.color}`}
              style={{ boxShadow: `0 8px 24px -6px ${stat.glow}` }}
            >
              <stat.icon size={24} className="group-hover:scale-110 transition-transform duration-300" />
            </div>
            <div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-3xl font-black text-white mt-1.5 tracking-tight">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Search panel removed from here and integrated directly into table header to reduce layout redundancy */}

      {isLoading ? (
        <div className="relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-slate-900/40 p-8 shadow-2xl backdrop-blur-xl">
          <TableSkeleton rows={5} columns={6} />
        </div>
      ) : (
        <>
        {/* Mobile card list */}
        <motion.div variants={itemVariants} className="md:hidden space-y-3">
          <div className="p-5 bg-slate-900/40 border border-white/5 rounded-[2rem] flex flex-col gap-3 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">All Employees</h3>
              <span className="text-xs text-slate-400 font-semibold">{filteredEmployees.length} total</span>
            </div>
            <div className="relative w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-primary transition-colors w-4 h-4" />
              <input 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search employees..." 
                className="w-full pl-11 pr-4 py-2.5 bg-slate-955/40 border border-white/5 hover:border-white/10 focus:border-primary/30 rounded-xl outline-none transition-all text-xs font-semibold text-white placeholder-slate-500"
              />
            </div>
          </div>

          {filteredEmployees.length > 0 ? (
            filteredEmployees.map((employee) => {
              const fullName = `${employee.firstName} ${employee.lastName}`;
              const initials = `${employee.firstName[0] ?? ''}${employee.lastName[0] ?? ''}`.toUpperCase();
              const statusLabel = formatStatus(employee.status);

              return (
                <div key={employee.id} className="relative overflow-hidden rounded-[2rem] border border-white/5 bg-slate-900/40 p-5 space-y-4 shadow-2xl backdrop-blur-xl">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center font-black text-primary border border-primary/20 shrink-0" style={{ boxShadow: '0 4px 12px -3px rgba(59,163,139,0.2)' }}>
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-white truncate">{fullName}</p>
                        <p className="text-xs text-slate-450 truncate mt-0.5">
                          {employee.user?.email ?? employee.employeeCode}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleResetPassword(employee)}
                      className="p-2.5 hover:bg-slate-950 rounded-xl text-slate-400 hover:text-primary border border-white/5 shrink-0 cursor-pointer transition-all active:scale-95"
                      title="Reset Password"
                    >
                      <Lock size={18} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-955/30 rounded-xl p-3 border border-white/5">
                      <p className="text-slate-500 uppercase tracking-widest text-[9px] font-black">Office</p>
                      <p className="font-bold text-white mt-1.5 truncate">{employee.office?.name ?? 'Unassigned'}</p>
                    </div>
                    <div className="bg-slate-955/30 rounded-xl p-3 border border-white/5">
                      <p className="text-slate-500 uppercase tracking-widest text-[9px] font-black">Role</p>
                      <p className="font-bold text-white mt-1.5 truncate">{employee.designation ?? '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 pt-2">
                    <span className="text-xs text-slate-400 font-semibold truncate">{employee.department?.name ?? 'No department'}</span>
                    <span className={cn(
                      "px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0 border inline-flex items-center gap-1.5",
                      statusLabel === 'Active' ? 'bg-emerald-500/10 text-emerald-450 border-emerald-500/20' :
                      statusLabel === 'On Leave' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    )}>
                      <span className={cn(
                        "w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentColor]",
                        statusLabel === 'Active' ? "bg-emerald-450" : 
                        statusLabel === 'On Leave' ? "bg-amber-400" : "bg-rose-400"
                      )} />
                      {statusLabel}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="relative overflow-hidden rounded-[2rem] border border-white/5 bg-slate-900/40 p-8 text-center text-xs font-bold text-slate-500 uppercase tracking-widest shadow-2xl backdrop-blur-xl">
              No employees found.
            </div>
          )}
          <div className="p-4.5 bg-slate-955/20 rounded-[2rem] border border-white/5 text-xs text-slate-400 font-semibold text-center shadow-xl backdrop-blur-xl">
            Showing <span className="text-white font-bold">{filteredEmployees.length}</span> of{' '}
            <span className="text-white font-bold">{employees.length}</span> employees
          </div>
        </motion.div>

        {/* Desktop table */}
        <motion.div variants={itemVariants} className="relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-slate-900/40 shadow-2xl backdrop-blur-xl hidden md:block">
          {/* Table Header/Toolbar */}
          <div className="px-8 py-6 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-955/10">
            <div>
              <h3 className="text-base font-bold text-white">All Employees</h3>
              <p className="text-xs text-slate-400 mt-1">Manage, verify, and search employee registry details</p>
            </div>
            
            <div className="relative w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-primary transition-colors w-4 h-4" />
              <input 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search employees..." 
                className="w-full pl-11 pr-4 py-2.5 bg-slate-955/40 border border-white/5 hover:border-white/10 focus:border-primary/30 rounded-xl outline-none transition-all text-xs font-semibold text-white placeholder-slate-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-955/30 border-b border-white/5">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Office</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map((employee) => {
                    const fullName = `${employee.firstName} ${employee.lastName}`;
                    const initials = `${employee.firstName[0] ?? ''}${employee.lastName[0] ?? ''}`.toUpperCase();
                    const statusLabel = formatStatus(employee.status);

                    return (
                      <motion.tr 
                        key={employee.id}
                        variants={itemVariants}
                        className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                      >
                        <td className="px-8 py-4.5">
                          <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center font-black text-primary border border-primary/20 shadow-sm group-hover:scale-105 transition-transform" style={{ boxShadow: '0 4px 12px -3px rgba(59,163,139,0.2)' }}>
                              {initials}
                            </div>
                            <div>
                              <p className="font-bold text-white group-hover:text-primary transition-colors">{fullName}</p>
                              <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                                <Mail size={12} className="text-slate-500" />
                                {employee.user?.email ?? employee.employeeCode}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-4.5">
                          <div className="flex items-center gap-2">
                            <Building2 size={16} className="text-slate-500" />
                            <span className="text-sm font-semibold text-slate-400 group-hover:text-white transition-colors">
                              {employee.office?.name ?? 'Unassigned'}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-4.5">
                          <span className="text-sm font-medium text-slate-400">{employee.designation ?? '—'}</span>
                        </td>
                        <td className="px-8 py-4.5">
                          <span className="text-sm font-medium text-slate-400">{employee.department?.name ?? '—'}</span>
                        </td>
                        <td className="px-8 py-4.5">
                          <span className={cn(
                            "px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1.5 border",
                            statusLabel === 'Active' ? 'bg-emerald-500/10 text-emerald-450 border-emerald-500/20' : 
                            statusLabel === 'On Leave' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          )}>
                            <span className={cn(
                              "w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentColor]",
                              statusLabel === 'Active' ? "bg-emerald-450" : 
                              statusLabel === 'On Leave' ? "bg-amber-400" : "bg-rose-400"
                            )} />
                            {statusLabel}
                          </span>
                        </td>
                        <td className="px-8 py-4.5 text-right">
                          <button 
                            onClick={() => handleResetPassword(employee)}
                            className="p-2.5 hover:bg-slate-900 rounded-xl text-slate-400 hover:text-primary transition-all duration-300 shadow-sm border border-white/5 active:scale-95 cursor-pointer"
                            title="Reset Password"
                          >
                            <Lock size={18} />
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-8 py-12 text-center text-xs font-bold text-slate-500 uppercase tracking-widest bg-slate-900/20">
                      No employees found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="p-6.5 bg-slate-955/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-white/5">
            <p className="text-sm text-slate-400 font-semibold">
              Showing <span className="text-white font-bold">{filteredEmployees.length}</span> of{' '}
              <span className="text-white font-bold">{employees.length}</span> employees
            </p>
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
    </>
  );
};

export default EmployeesPage;
