"use client";

import { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  UserPlus, 
  Activity,
  Search,
  Filter,
  MoreVertical,
  Clock,
  Shield
} from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { cn } from '@/utils/cn';
import TableSkeleton from '@/components/TableSkeleton';
import Link from 'next/link';

const hiringData = [
  { name: 'Jan', hires: 45 },
  { name: 'Feb', hires: 52 },
  { name: 'Mar', hires: 38 },
  { name: 'Apr', hires: 61 },
  { name: 'May', hires: 48 },
];

const hrDistribution = [
  { name: 'Active', value: 85, color: '#3BA38B' },
  { name: 'Inactive', value: 15, color: '#64748B' },
  { name: 'Pending', value: 10, color: '#F4B860' },
];

const hrLogins = [
  { id: 1, name: 'Robert Fox', company: 'TechVibe Inc.', role: 'HR Director', lastLogin: '10 mins ago', status: 'Online' },
  { id: 2, name: 'Jane Cooper', company: 'Global Logistics', role: 'Talent Acquisition', lastLogin: '2 hours ago', status: 'Offline' },
  { id: 3, name: 'Wade Warren', company: 'EcoWare Solutions', role: 'HR Manager', lastLogin: 'Yesterday', status: 'Offline' },
  { id: 4, name: 'Cameron Williamson', company: 'Innovate Digital', role: 'HR Generalist', lastLogin: '5 mins ago', status: 'Online' },
  { id: 5, name: 'Brooklyn Simmons', company: 'Blue Sky Media', role: 'HR Business Partner', lastLogin: '3 hours ago', status: 'Offline' },
];

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

const HRManagementPage = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
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
          <h1 className="heading-1">HR Management</h1>
          <p className="text-page-desc mt-1">Monitor HR administrative activity and platform-wide hiring trends.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/user-rights"
            className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border rounded-2xl text-sm font-medium text-text-secondary hover:text-primary transition-all duration-300 hover:shadow-lg"
          >
            <Shield size={18} />
            Employee Rights
          </Link>
          <button className="btn-primary shadow-lg shadow-primary/20">
            <UserPlus size={20} />
            Invite Admin
          </button>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total HR Admins', value: '1,248', icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Active Sessions', value: '156', icon: Activity, color: 'text-secondary', bg: 'bg-secondary/10' },
          { label: 'Platform Hires', value: '482', icon: UserPlus, color: 'text-accent', bg: 'bg-accent/10' },
          { label: 'Onboarding Rate', value: '94.2%', icon: UserCheck, color: 'text-success', bg: 'bg-success/10' },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            variants={itemVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="glass-card p-6 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-8 bg-primary/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
            <div className="flex items-center gap-4 relative z-10">
              <div className={cn("p-4 rounded-2xl transition-transform group-hover:scale-110 duration-300", stat.bg, stat.color)}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-sm text-text-secondary font-medium uppercase tracking-wider">{stat.label}</p>
                <p className="text-stat-value mt-1">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div variants={itemVariants} className="lg:col-span-2 glass-card p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="heading-2">Ecosystem Hiring Growth</h3>
              <p className="text-sm text-text-secondary">Platform-wide recruitment trends</p>
            </div>
            <select className="bg-surface-variant border-none rounded-xl px-4 py-2 text-sm outline-none cursor-pointer hover:opacity-80 transition-all">
              <option>Last 5 Months</option>
              <option>Last Year</option>
            </select>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hiringData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--text-secondary)', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-secondary)', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: 'rgba(59, 163, 139, 0.05)', radius: 10}}
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    backgroundColor: 'var(--surface)',
                    backdropFilter: 'blur(8px)',
                    color: 'var(--text-primary)'
                  }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                />
                <Bar 
                  dataKey="hires" 
                  fill="#3BA38B" 
                  radius={[12, 12, 0, 0]} 
                  barSize={40}
                  animationDuration={1500}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-card p-8">
          <h3 className="heading-2 mb-2">HR Status Distribution</h3>
          <p className="text-sm text-text-secondary mb-8">Active vs Inactive Administrators</p>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={hrDistribution}
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {hrDistribution.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color} 
                      className="hover:opacity-80 transition-opacity cursor-pointer outline-none"
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    backgroundColor: 'var(--surface)',
                    backdropFilter: 'blur(8px)',
                    color: 'var(--text-primary)'
                  }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 space-y-4">
            {hrDistribution.map((item) => (
              <div key={item.name} className="flex items-center justify-between group cursor-default">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full group-hover:scale-125 transition-transform" style={{ backgroundColor: item.color }} />
                  <span className="text-sm font-medium text-text-primary">{item.name}</span>
                </div>
                <span className="text-sm font-bold text-text-primary">{item.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* HR Activity Table */}
      <motion.div variants={itemVariants} className="glass-card overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="heading-2">Recent Administrative Activity</h3>
            <p className="text-page-desc mt-1">Real-time log of HR admin interactions</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-grow sm:flex-grow-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
              <input 
                type="text" 
                placeholder="Search HR admins..."
                className="pl-10 pr-4 py-2.5 bg-surface-variant/30 border border-border/50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all w-full sm:w-64 font-medium text-text-primary"
              />
            </div>
            <button className="p-2.5 bg-surface-variant/30 border border-border/50 rounded-xl text-text-secondary hover:text-primary transition-all hover:bg-surface-variant flex-shrink-0">
              <Filter size={18} />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="p-8">
            <TableSkeleton rows={5} columns={5} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-variant/30">
                  <th className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-text-secondary border-b border-border/50">Admin Name</th>
                  <th className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-text-secondary border-b border-border/50">Company</th>
                  <th className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-text-secondary border-b border-border/50">System Role</th>
                  <th className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-text-secondary border-b border-border/50">Last Login</th>
                  <th className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-text-secondary border-b border-border/50">Status</th>
                  <th className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-text-secondary border-b border-border/50 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {hrLogins.map((hr) => (
                  <motion.tr 
                    key={hr.id}
                    variants={itemVariants}
                    className="hover:bg-surface-variant/30 transition-colors group cursor-pointer"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-surface-variant to-border flex items-center justify-center font-bold text-muted group-hover:scale-110 transition-transform shadow-sm">
                          {hr.name.charAt(0)}
                        </div>
                        <span className="font-semibold text-text-primary group-hover:text-primary transition-colors">{hr.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-text-secondary group-hover:text-text-primary transition-colors">{hr.company}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="px-3 py-1.5 bg-surface-variant rounded-xl text-xs font-semibold text-text-primary border border-border/50">
                        {hr.role}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-sm text-text-secondary font-medium">
                        <Clock size={14} className="text-muted" />
                        {hr.lastLogin}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={cn(
                        "px-4 py-1.5 rounded-full text-micro font-bold uppercase tracking-widest inline-flex items-center gap-2",
                        hr.status === 'Online' ? "bg-success/10 text-success" : "bg-surface-variant text-text-secondary"
                      )}>
                        <div className={cn("w-2 h-2 rounded-full", hr.status === 'Online' ? "bg-success animate-pulse" : "bg-muted")} />
                        {hr.status}
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
        )}
        <div className="p-6 bg-surface-variant/30 flex items-center justify-between">
          <p className="text-sm text-text-secondary font-medium">Showing <span className="text-text-primary font-bold">5</span> of <span className="text-text-primary font-bold">1,248</span> HR administrators</p>
          <div className="flex items-center gap-2">
            <button className="btn-secondary py-2 px-4 text-xs font-bold">Previous</button>
            <button className="btn-secondary py-2 px-4 text-xs font-bold">Next</button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default HRManagementPage;
