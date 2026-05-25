"use client";

import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Mail,
  Building2,
  Calendar,
  Download,
  Users
} from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import { cn } from '@/utils/cn';
import TableSkeleton from '@/components/TableSkeleton';

import { mockEmployees as employees } from '@/data/mockData';

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

const EmployeesPage = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8 pb-10"
    >
      {/* Header Section */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="heading-1">Global Employee Directory</h1>
          <p className="text-text-secondary mt-1">Monitor and manage all employees across the platform ecosystem.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border rounded-2xl text-sm font-medium text-text-secondary hover:text-primary transition-all duration-300 hover:shadow-lg">
            <Download size={18} />
            Export CSV
          </button>
          <button className="btn-primary shadow-lg shadow-primary/20">
            <Users size={20} />
            Employee Analytics
          </button>
        </div>
      </motion.div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { label: 'Total Employees', value: '45,920', border: 'border-primary', icon: Users },
          { label: 'Currently Active', value: '42,105', border: 'border-success', icon: Users },
          { label: 'Average Tenure', value: '1.8 Years', border: 'border-accent', icon: Calendar },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            variants={itemVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className={cn("glass-card p-6 border-l-4 relative overflow-hidden group", stat.border)}
          >
            <div className="absolute top-0 right-0 p-8 bg-surface-variant rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
            <div className="relative z-10">
              <p className="text-sm font-medium text-text-secondary uppercase tracking-wider">{stat.label}</p>
              <h3 className="text-3xl font-bold text-text-primary mt-1 tracking-tight">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filter Bar */}
      <motion.div variants={itemVariants} className="flex flex-col xl:flex-row gap-4 items-center justify-between glass-card p-4">
        <div className="relative w-full xl:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search by name, email, role..." 
            className="w-full pl-12 pr-4 py-3 bg-surface-variant border border-transparent focus:border-primary/20 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 transition-all"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          <button className="flex items-center gap-2 px-4 py-3 bg-surface-variant rounded-2xl text-sm font-medium text-text-secondary hover:text-primary transition-all border border-transparent hover:border-primary/10 flex-grow sm:flex-grow-0 justify-center">
            <Filter size={18} />
            More Filters
          </button>
          <select className="flex-grow sm:flex-grow-0 bg-surface-variant border border-transparent hover:border-primary/10 rounded-2xl px-4 py-3 text-sm outline-none font-medium text-text-secondary cursor-pointer transition-all">
            <option>All Companies</option>
            <option>TechVibe Inc.</option>
            <option>Global Logistics</option>
            <option>EcoWare Solutions</option>
          </select>
          <select className="flex-grow sm:flex-grow-0 bg-surface-variant border border-transparent hover:border-primary/10 rounded-2xl px-4 py-3 text-sm outline-none font-medium text-text-secondary cursor-pointer transition-all">
            <option>All Status</option>
            <option>Active</option>
            <option>On Leave</option>
            <option>Terminated</option>
          </select>
        </div>
      </motion.div>

      {/* Employees Table */}
      {isLoading ? (
        <div className="glass-card p-8">
          <TableSkeleton rows={5} columns={6} />
        </div>
      ) : (
        <motion.div variants={itemVariants} className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-variant/50 border-b border-border">
                  <th className="px-8 py-5 text-xs font-bold text-text-secondary uppercase tracking-wider">Employee</th>
                  <th className="px-8 py-5 text-xs font-bold text-text-secondary uppercase tracking-wider">Company</th>
                  <th className="px-8 py-5 text-xs font-bold text-text-secondary uppercase tracking-wider">Role</th>
                  <th className="px-8 py-5 text-xs font-bold text-text-secondary uppercase tracking-wider">Salary</th>
                  <th className="px-8 py-5 text-xs font-bold text-text-secondary uppercase tracking-wider">Status</th>
                  <th className="px-8 py-5 text-xs font-bold text-text-secondary uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {employees.map((employee) => (
                  <motion.tr 
                    key={employee.id}
                    variants={itemVariants}
                    className="hover:bg-surface-variant transition-colors group cursor-pointer"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center font-bold text-primary border border-primary/10 shadow-sm group-hover:scale-110 transition-transform">
                          {employee.avatar}
                        </div>
                        <div>
                          <p className="font-bold text-text-primary group-hover:text-primary transition-colors">{employee.name}</p>
                          <div className="flex items-center gap-1.5 text-xs text-text-secondary mt-0.5">
                            <Mail size={12} className="text-muted" />
                            {employee.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <Building2 size={16} className="text-muted" />
                        <span className="text-sm font-semibold text-text-secondary group-hover:text-text-primary transition-colors">{employee.company}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-sm font-medium text-text-secondary">{employee.role}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-sm font-bold text-text-primary">{employee.salary}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className={cn(
                        "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest inline-flex items-center gap-2",
                        employee.status === 'Active' ? 'bg-success/10 text-success' : 
                        employee.status === 'On Leave' ? 'bg-warning/10 text-warning' : 'bg-error/10 text-error'
                      )}>
                        <div className={cn("w-2 h-2 rounded-full", 
                          employee.status === 'Active' ? 'bg-success animate-pulse' : 
                          employee.status === 'On Leave' ? 'bg-warning' : 'bg-error'
                        )} />
                        {employee.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button className="p-2.5 hover:bg-surface rounded-xl text-text-secondary hover:text-primary transition-all duration-300 shadow-sm border border-transparent hover:border-border">
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-6 bg-surface-variant/50 flex items-center justify-between border-t border-border">
            <p className="text-sm text-text-secondary font-medium">Showing <span className="text-text-primary font-bold">5</span> of <span className="text-text-primary font-bold">45,920</span> employees</p>
            <div className="flex items-center gap-2">
              <button className="btn-secondary py-2.5 px-5 text-xs font-bold disabled:opacity-50" disabled>Previous</button>
              <button className="btn-secondary py-2.5 px-5 text-xs font-bold">Next</button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default EmployeesPage;
