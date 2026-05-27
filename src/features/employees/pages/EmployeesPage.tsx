"use client";

import { useMemo, useState } from 'react';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Mail,
  Building2,
  Calendar,
  Download,
  Users,
  UserPlus,
  RefreshCw
} from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import Link from 'next/link';
import { cn } from '@/utils/cn';
import TableSkeleton from '@/components/TableSkeleton';
import { useEmployees } from '@/hooks/useEmployees';

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
  switch (status) {
    case 'ACTIVE':
      return 'Active';
    case 'ON_LEAVE':
      return 'On Leave';
    case 'TERMINATED':
      return 'Terminated';
    case 'INACTIVE':
      return 'Inactive';
    default:
      return status;
  }
}

const EmployeesPage = () => {
  const { employees, isLoading, error, refetch } = useEmployees();
  const [searchTerm, setSearchTerm] = useState('');

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

  const activeCount = employees.filter((employee) => employee.status === 'ACTIVE').length;

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6 sm:space-y-8 pb-10"
    >
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="heading-1">Global Employee Directory</h1>
          <p className="text-page-desc mt-1">Monitor and manage all employees across the platform ecosystem.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => refetch()}
            className="p-3 bg-surface-variant hover:bg-border text-text-primary rounded-2xl transition-all shadow-sm active:scale-95"
            title="Refresh employees"
          >
            <RefreshCw size={18} className={cn(isLoading && 'animate-spin')} />
          </button>
          <Link href="/users/register" className="btn-primary shadow-lg shadow-primary/20 w-full sm:w-auto justify-center">
            <UserPlus size={20} />
            Register User
          </Link>
        </div>
      </motion.div>

      {error && (
        <div className="rounded-2xl bg-error/10 border border-error/20 px-4 py-3 text-sm font-medium text-error flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => refetch()}
            className="text-xs font-bold uppercase tracking-widest hover:underline shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { label: 'Total Employees', value: employees.length, border: 'border-primary', icon: Users },
          { label: 'Currently Active', value: activeCount, border: 'border-success', icon: Users },
          { label: 'Assigned Offices', value: employees.filter((e) => e.office).length, border: 'border-accent', icon: Calendar },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            variants={itemVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className={cn("glass-card p-6 border-l-4 relative overflow-hidden group", stat.border)}
          >
            <div className="relative z-10">
              <p className="text-sm font-medium text-text-secondary uppercase tracking-wider">{stat.label}</p>
              <h3 className="text-stat-value mt-1">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div variants={itemVariants} className="flex flex-col xl:flex-row gap-4 items-center justify-between glass-card p-4">
        <div className="relative w-full xl:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted w-5 h-5" />
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, role..." 
            className="w-full pl-12 pr-4 py-3 bg-surface-variant border border-transparent focus:border-primary/20 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 transition-all"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          <button className="flex items-center gap-2 px-4 py-3 bg-surface-variant rounded-2xl text-sm font-medium text-text-secondary hover:text-primary transition-all border border-transparent hover:border-primary/10 flex-grow sm:flex-grow-0 justify-center">
            <Filter size={18} />
            More Filters
          </button>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="glass-card p-8">
          <TableSkeleton rows={5} columns={6} />
        </div>
      ) : (
        <>
        {/* Mobile card list */}
        <motion.div variants={itemVariants} className="md:hidden space-y-3">
          {filteredEmployees.length > 0 ? (
            filteredEmployees.map((employee) => {
              const fullName = `${employee.firstName} ${employee.lastName}`;
              const initials = `${employee.firstName[0] ?? ''}${employee.lastName[0] ?? ''}`.toUpperCase();
              const statusLabel = formatStatus(employee.status);

              return (
                <div key={employee.id} className="glass-card p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center font-bold text-primary border border-primary/10 shrink-0">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-text-primary truncate">{fullName}</p>
                        <p className="text-xs text-text-secondary truncate mt-0.5">
                          {employee.user?.email ?? employee.employeeCode}
                        </p>
                      </div>
                    </div>
                    <button className="p-2 hover:bg-surface-variant rounded-xl text-text-secondary shrink-0">
                      <MoreVertical size={18} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-surface-variant/60 rounded-xl p-2.5">
                      <p className="text-muted uppercase tracking-wide text-[10px] font-bold">Office</p>
                      <p className="font-semibold text-text-primary mt-1 truncate">{employee.office?.name ?? 'Unassigned'}</p>
                    </div>
                    <div className="bg-surface-variant/60 rounded-xl p-2.5">
                      <p className="text-muted uppercase tracking-wide text-[10px] font-bold">Role</p>
                      <p className="font-semibold text-text-primary mt-1 truncate">{employee.designation ?? '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-text-secondary truncate">{employee.department?.name ?? 'No department'}</span>
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shrink-0",
                      statusLabel === 'Active' ? 'bg-success/10 text-success' :
                      statusLabel === 'On Leave' ? 'bg-warning/10 text-warning' : 'bg-error/10 text-error'
                    )}>
                      {statusLabel}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="glass-card p-8 text-center text-sm font-medium text-text-secondary">
              No employees found.
            </div>
          )}
          <div className="p-4 bg-surface-variant/50 rounded-2xl border border-border text-sm text-text-secondary font-medium text-center">
            Showing <span className="text-text-primary font-bold">{filteredEmployees.length}</span> of{' '}
            <span className="text-text-primary font-bold">{employees.length}</span> employees
          </div>
        </motion.div>

        {/* Desktop table */}
        <motion.div variants={itemVariants} className="glass-card overflow-hidden hidden md:block">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-variant/50 border-b border-border">
                  <th className="px-4 sm:px-6 md:px-8 py-4 sm:py-5 text-xs font-bold text-text-secondary uppercase tracking-wider">Employee</th>
                  <th className="px-4 sm:px-6 md:px-8 py-4 sm:py-5 text-xs font-bold text-text-secondary uppercase tracking-wider">Office</th>
                  <th className="px-4 sm:px-6 md:px-8 py-4 sm:py-5 text-xs font-bold text-text-secondary uppercase tracking-wider">Role</th>
                  <th className="px-4 sm:px-6 md:px-8 py-4 sm:py-5 text-xs font-bold text-text-secondary uppercase tracking-wider">Department</th>
                  <th className="px-4 sm:px-6 md:px-8 py-4 sm:py-5 text-xs font-bold text-text-secondary uppercase tracking-wider">Status</th>
                  <th className="px-4 sm:px-6 md:px-8 py-4 sm:py-5 text-xs font-bold text-text-secondary uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map((employee) => {
                    const fullName = `${employee.firstName} ${employee.lastName}`;
                    const initials = `${employee.firstName[0] ?? ''}${employee.lastName[0] ?? ''}`.toUpperCase();
                    const statusLabel = formatStatus(employee.status);

                    return (
                      <motion.tr 
                        key={employee.id}
                        variants={itemVariants}
                        className="hover:bg-surface-variant transition-colors group cursor-pointer"
                      >
                        <td className="px-4 sm:px-6 md:px-8 py-4 sm:py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center font-bold text-primary border border-primary/10 shadow-sm group-hover:scale-110 transition-transform">
                              {initials}
                            </div>
                            <div>
                              <p className="font-bold text-text-primary group-hover:text-primary transition-colors">{fullName}</p>
                              <div className="flex items-center gap-1.5 text-xs text-text-secondary mt-0.5">
                                <Mail size={12} className="text-muted" />
                                {employee.user?.email ?? employee.employeeCode}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 md:px-8 py-4 sm:py-5">
                          <div className="flex items-center gap-2">
                            <Building2 size={16} className="text-muted" />
                            <span className="text-sm font-semibold text-text-secondary group-hover:text-text-primary transition-colors">
                              {employee.office?.name ?? 'Unassigned'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 md:px-8 py-4 sm:py-5">
                          <span className="text-sm font-medium text-text-secondary">{employee.designation ?? '—'}</span>
                        </td>
                        <td className="px-4 sm:px-6 md:px-8 py-4 sm:py-5">
                          <span className="text-sm font-medium text-text-secondary">{employee.department?.name ?? '—'}</span>
                        </td>
                        <td className="px-4 sm:px-6 md:px-8 py-4 sm:py-5">
                          <span className={cn(
                            "px-4 py-1.5 rounded-full text-micro font-bold uppercase tracking-widest inline-flex items-center gap-2",
                            statusLabel === 'Active' ? 'bg-success/10 text-success' : 
                            statusLabel === 'On Leave' ? 'bg-warning/10 text-warning' : 'bg-error/10 text-error'
                          )}>
                            {statusLabel}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 md:px-8 py-4 sm:py-5 text-right">
                          <button className="p-2.5 hover:bg-surface rounded-xl text-text-secondary hover:text-primary transition-all duration-300 shadow-sm border border-transparent hover:border-border">
                            <MoreVertical size={18} />
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 sm:px-6 md:px-8 py-8 sm:py-10 text-center text-sm font-medium text-text-secondary">
                      No employees found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 sm:p-6 bg-surface-variant/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-border">
            <p className="text-sm text-text-secondary font-medium">
              Showing <span className="text-text-primary font-bold">{filteredEmployees.length}</span> of{' '}
              <span className="text-text-primary font-bold">{employees.length}</span> employees
            </p>
          </div>
        </motion.div>
        </>
      )}
    </motion.div>
  );
};

export default EmployeesPage;
