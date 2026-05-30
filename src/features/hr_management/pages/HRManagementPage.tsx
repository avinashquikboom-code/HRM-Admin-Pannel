"use client";

import { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  UserCheck, 
  UserPlus, 
  Activity,
  Search,
  Filter,
  MoreVertical,
  Clock,
  Shield,
  Calendar,
  Building,
  TrendingUp,
  CheckCircle2,
  XCircle,
  AlertCircle,
  UserX,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Award,
  Layers,
  FileText,
  Send,
  Zap,
  Briefcase,
  Sparkles,
  MapPin,
  ListTodo
} from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { cn } from '@/utils/cn';
import ChartContainer from '@/components/ChartContainer';
import TableSkeleton from '@/components/TableSkeleton';
import Link from 'next/link';
import {
  fetchHRStats,
  fetchDepartmentOverview,
  fetchLeaveOverview,
  fetchHREmployees,
  fetchAttendanceTrend,
  fetchHRActivity,
  HRStats,
  HRDepartmentOverview,
  HRLeaveOverview,
  HREmployee,
  HRAttendanceDay,
  HRActivityItem
} from '@/services/hrService';

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

const HRManagementPage = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'employees' | 'departments' | 'leaves'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // States for backend data
  const [stats, setStats] = useState<HRStats | null>(null);
  const [departments, setDepartments] = useState<HRDepartmentOverview[]>([]);
  const [unassignedEmployees, setUnassignedEmployees] = useState(0);
  const [leaveData, setLeaveData] = useState<HRLeaveOverview | null>(null);
  const [attendanceTrend, setAttendanceTrend] = useState<HRAttendanceDay[]>([]);
  const [activityList, setActivityList] = useState<HRActivityItem[]>([]);

  // Employee tab states
  const [employees, setEmployees] = useState<HREmployee[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEmployeesCount, setTotalEmployeesCount] = useState(0);
  const [employeeLimit] = useState(8);

  // Live broadcast simulated state
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);
  const [broadcastStatus, setBroadcastStatus] = useState<string | null>(null);

  // Live clock state
  const [time, setTime] = useState<string>('');
  const [greeting, setGreeting] = useState<string>('Welcome back');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      
      const hour = now.getHours();
      if (hour < 12) setGreeting('Good Morning');
      else if (hour < 17) setGreeting('Good Afternoon');
      else setGreeting('Good Evening');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);

    try {
      const [
        statsRes,
        deptRes,
        leaveRes,
        trendRes,
        activityRes
      ] = await Promise.all([
        fetchHRStats(),
        fetchDepartmentOverview(),
        fetchLeaveOverview(),
        fetchAttendanceTrend(),
        fetchHRActivity()
      ]);

      setStats(statsRes);
      setDepartments(deptRes.departments);
      setUnassignedEmployees(deptRes.unassigned);
      setLeaveData(leaveRes);
      setAttendanceTrend(trendRes);
      setActivityList(activityRes);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to sync with ecosystem databases.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const loadEmployeesData = useCallback(async () => {
    try {
      const res = await fetchHREmployees({
        search: searchQuery,
        status: statusFilter,
        department: deptFilter,
        page: currentPage,
        limit: employeeLimit
      });
      setEmployees(res.employees);
      setTotalPages(res.totalPages);
      setTotalEmployeesCount(res.total);
    } catch (err: any) {
      console.error(err);
    }
  }, [searchQuery, statusFilter, deptFilter, currentPage, employeeLimit]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  useEffect(() => {
    if (activeTab === 'employees') {
      loadEmployeesData();
    }
  }, [activeTab, loadEmployeesData]);

  const handleRefresh = () => {
    loadDashboardData(true);
    if (activeTab === 'employees') {
      loadEmployeesData();
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;

    setIsSendingBroadcast(true);
    setBroadcastStatus(null);

    setTimeout(() => {
      setIsSendingBroadcast(false);
      setBroadcastStatus('Broadcast successfully pushed to all devices!');
      setBroadcastMessage('');
      setTimeout(() => setBroadcastStatus(null), 3000);
    }, 1200);
  };

  // Modern leave category colors
  const getLeaveColor = (type: string) => {
    const t = type.toUpperCase();
    if (t.includes('SICK')) return '#EF4444'; // Red
    if (t.includes('CASUAL')) return '#3B82F6'; // Blue
    if (t.includes('EARNED') || t.includes('ANNUAL')) return '#10B981'; // Green
    if (t.includes('MATERNITY') || t.includes('PATERNITY')) return '#8B5CF6'; // Purple
    return '#F59E0B'; // Amber
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8 pb-12"
    >
      {/* Dynamic Command center header */}
      <motion.div 
        variants={itemVariants} 
        className="relative overflow-hidden rounded-[2.5rem] border border-border/30 bg-gradient-to-r from-[#1E293B]/70 to-[#0F172A]/85 backdrop-blur-md p-8 md:p-10 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full filter blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-secondary/15 rounded-full filter blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            <Sparkles size={12} className="animate-spin" />
            Active Command Node
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-none">
            {greeting}, Administrator
          </h1>
          <p className="text-sm text-slate-300 font-medium max-w-xl">
            Orchestrate operational parameters, handle workspace check-ins, and streamline corporate intelligence flows.
          </p>
        </div>

        <div className="relative z-10 flex flex-col items-end gap-2 shrink-0 bg-white/5 border border-white/10 px-6 py-4.5 rounded-3xl backdrop-blur-lg shadow-inner">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <Clock size={12} className="text-primary animate-pulse" /> Live System Time
          </span>
          <span className="text-2xl md:text-3xl font-black text-white tracking-wider font-mono">
            {time || '00:00:00'}
          </span>
          <span className="text-[10px] font-bold text-success-text bg-success/15 px-2 py-0.5 rounded-md">
            Node Synchronized
          </span>
        </div>
      </motion.div>

      {/* Global Actions bar */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Navigation Tabs */}
        <div className="flex border-b border-border/40 overflow-x-auto no-scrollbar gap-1 p-1 bg-surface-variant/20 rounded-2xl max-w-2xl">
          {[
            { id: 'overview', label: 'Dashboard Pulse', icon: TrendingUp },
            { id: 'employees', label: 'Employee Directory', icon: Users },
            { id: 'departments', label: 'Organization Units', icon: Building },
            { id: 'leaves', label: 'Time-Off Control', icon: Calendar },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 whitespace-nowrap cursor-pointer relative",
                  isActive 
                    ? "bg-surface text-primary shadow-md shadow-primary/5 border border-border/30" 
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-variant/30"
                )}
              >
                <Icon size={14} className={cn(isActive ? "text-primary animate-pulse" : "text-muted")} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Action triggers */}
        <div className="flex items-center gap-3">
          <button 
            onClick={handleRefresh} 
            disabled={isLoading || isRefreshing}
            className="p-2.5 bg-surface hover:bg-surface-variant text-text-secondary hover:text-primary rounded-xl border border-border/50 transition-all duration-300 active:scale-95 disabled:opacity-50"
            title="Force synchronization"
          >
            <RefreshCw size={16} className={cn(isRefreshing && "animate-spin text-primary")} />
          </button>
          <Link
            href="/user-rights"
            className="flex items-center gap-2 px-4 py-2 bg-surface border border-border/50 rounded-xl text-xs font-bold text-text-secondary hover:text-primary hover:border-primary/30 transition-all duration-300 shadow-sm"
          >
            <Shield size={14} className="text-primary" />
            Rights Matrix
          </Link>
          <button className="btn-primary shadow-md shadow-primary/10 flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl">
            <UserPlus size={14} /> Add Admin
          </button>
        </div>
      </motion.div>

      {/* Error state display */}
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-4 bg-error/10 border border-error/20 rounded-2xl text-error-text text-sm shadow-sm"
        >
          <div className="flex items-center gap-3">
            <AlertCircle size={20} className="text-error" />
            <span className="font-medium">{error}</span>
          </div>
          <button 
            onClick={() => loadDashboardData()}
            className="px-4 py-1.5 bg-error text-white font-bold rounded-xl text-xs hover:bg-error/90 transition-all duration-200"
          >
            Re-sync Databases
          </button>
        </motion.div>
      )}

      {/* Dynamic Views switching */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div 
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="glass-card p-6 h-28 animate-pulse bg-surface-variant/20" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 glass-card p-8 h-80 animate-pulse bg-surface-variant/10" />
              <div className="glass-card p-8 h-80 animate-pulse bg-surface-variant/10" />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="space-y-8"
          >
            {/* VIEW: OVERVIEW (MASTER DASHBOARD REDESIGN) */}
            {activeTab === 'overview' && (
              <>
                {/* Visual statistics grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { 
                      label: 'System Headcount', 
                      value: stats?.totalEmployees ?? 0, 
                      desc: `${stats?.activeEmployees ?? 0} active nodes in division`, 
                      icon: Users, 
                      color: 'text-primary', 
                      bg: 'bg-primary/10',
                      badge: 'Ecosystem Limit: 100%' 
                    },
                    { 
                      label: 'Ecosystem Attendance', 
                      value: `${stats?.attendanceRate ?? 0}%`, 
                      desc: `${stats?.presentToday ?? 0} marked present today`, 
                      icon: UserCheck, 
                      color: 'text-success', 
                      bg: 'bg-success/10',
                      badge: 'Optimal Parameter' 
                    },
                    { 
                      label: 'Pending Leaves', 
                      value: stats?.pendingLeaves ?? 0, 
                      desc: 'Time-off requests requiring validation', 
                      icon: Calendar, 
                      color: 'text-secondary', 
                      bg: 'bg-secondary/10',
                      badge: 'Awaiting Actions' 
                    },
                    { 
                      label: 'Open Task Targets', 
                      value: stats?.openTasks ?? 0, 
                      desc: 'Active operational goals in sync', 
                      icon: Activity, 
                      color: 'text-accent', 
                      bg: 'bg-accent/10',
                      badge: 'Performance Target' 
                    },
                  ].map((stat, i) => (
                    <motion.div 
                      key={i}
                      whileHover={{ y: -6 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="glass-card p-6 relative overflow-hidden group border border-border/30 hover:border-primary/20 hover:shadow-xl shadow-sm transition-all duration-300"
                    >
                      <div className="absolute top-0 right-0 p-8 bg-primary/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110 pointer-events-none" />
                      <div className="flex items-start justify-between relative z-10">
                        <div className="space-y-4">
                          <div className={cn("w-11 h-11 rounded-2xl flex items-center justify-center shadow-inner", stat.bg, stat.color)}>
                            <stat.icon size={20} />
                          </div>
                          <div>
                            <p className="text-[10px] text-text-secondary font-black uppercase tracking-widest">{stat.label}</p>
                            <p className="text-3xl font-black mt-1 text-text-primary tracking-tight">{stat.value}</p>
                            <p className="text-xs text-muted mt-1.5 font-semibold leading-snug">{stat.desc}</p>
                          </div>
                        </div>
                        <span className="text-[8px] font-black uppercase px-2 py-0.5 bg-surface border border-border/40 rounded text-muted shadow-sm select-none">
                          {stat.badge}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Primary Chart & Active Stream row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Attendance spline chart */}
                  <div className="lg:col-span-2 glass-card p-8 border border-border/30 shadow-sm relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full filter blur-2xl pointer-events-none" />
                    
                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div>
                          <h3 className="heading-2 text-text-primary flex items-center gap-2">
                            <TrendingUp size={18} className="text-primary" />
                            Attendance Trend Analytics
                          </h3>
                          <p className="text-xs text-text-secondary mt-0.5">Bi-weekly comparative spline mapping of team operations</p>
                        </div>
                        <div className="flex items-center gap-3.5 text-[10px] font-black uppercase tracking-wider bg-surface-variant/40 px-3 py-1.5 rounded-xl border border-border/30">
                          <div className="flex items-center gap-1 text-success">
                            <div className="w-2 h-2 rounded-full bg-success" /> Present
                          </div>
                          <div className="flex items-center gap-1 text-error">
                            <div className="w-2 h-2 rounded-full bg-error" /> Absent
                          </div>
                        </div>
                      </div>
                      
                      <ChartContainer heightClassName="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={attendanceTrend} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                            <defs>
                              <linearGradient id="gradientPresent" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10B981" stopOpacity={0.25}/>
                                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                              </linearGradient>
                              <linearGradient id="gradientAbsent" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.15}/>
                                <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: 'var(--text-secondary)', fontSize: 10}} dy={8} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-secondary)', fontSize: 10}} />
                            <Tooltip 
                              contentStyle={{ 
                                borderRadius: '16px', 
                                border: '1px solid var(--border)', 
                                backgroundColor: 'var(--surface)',
                                color: 'var(--text-primary)',
                                fontSize: '12px'
                              }}
                            />
                            <Area type="monotone" dataKey="present" name="Present" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#gradientPresent)" />
                            <Area type="monotone" dataKey="absent" name="Absent" stroke="#EF4444" strokeWidth={2.5} fillOpacity={1} fill="url(#gradientAbsent)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </div>

                    <div className="border-t border-border/30 pt-4.5 mt-6 flex items-center justify-between text-xs font-semibold text-text-secondary">
                      <span className="flex items-center gap-1.5">
                        <Activity size={14} className="text-primary animate-pulse" />
                        Average system attendance rate: <strong className="text-text-primary">{stats?.attendanceRate ?? 0}%</strong>
                      </span>
                      <span className="text-[10px] text-muted font-bold uppercase tracking-wider">Dynamic calculation</span>
                    </div>
                  </div>

                  {/* Active team presence & leave types breakdown */}
                  <div className="glass-card p-8 border border-border/30 shadow-sm flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-36 h-36 bg-secondary/5 rounded-full filter blur-xl pointer-events-none" />
                    
                    <div>
                      <h3 className="heading-2 text-text-primary flex items-center gap-2">
                        <Calendar size={18} className="text-secondary" />
                        Leave Distribution
                      </h3>
                      <p className="text-xs text-text-secondary mt-0.5">Aggregated division leaves metrics</p>
                    </div>

                    <div className="my-5 flex justify-center relative items-center">
                      <ChartContainer heightClassName="h-[170px] w-[170px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={leaveData?.leaveTypes.length ? leaveData.leaveTypes : [{ type: 'Zero requests', count: 1 }]}
                              innerRadius={50}
                              outerRadius={70}
                              paddingAngle={3}
                              dataKey="count"
                              stroke="none"
                            >
                              {(leaveData?.leaveTypes.length ? leaveData.leaveTypes : [{ type: 'None', count: 1 }]).map((entry, index) => (
                                <Cell 
                                  key={`cell-${index}`} 
                                  fill={getLeaveColor(entry.type)} 
                                  className="hover:opacity-90 cursor-pointer outline-none transition-all"
                                />
                              ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{ 
                                borderRadius: '12px', 
                                border: '1px solid var(--border)', 
                                backgroundColor: 'var(--surface)',
                                color: 'var(--text-primary)',
                                fontSize: '11px'
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                      <div className="absolute text-center">
                        <p className="text-2xl font-black text-text-primary">{leaveData?.total ?? 0}</p>
                        <p className="text-[9px] text-muted uppercase tracking-wider font-bold">Total requests</p>
                      </div>
                    </div>

                    <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1 no-scrollbar border-t border-border/30 pt-4">
                      {leaveData?.leaveTypes && leaveData.leaveTypes.length > 0 ? (
                        leaveData.leaveTypes.map((item) => (
                          <div key={item.type} className="flex items-center justify-between text-xs font-bold p-1 rounded-lg hover:bg-surface-variant/20 transition-all">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getLeaveColor(item.type) }} />
                              <span className="text-text-primary capitalize">{item.type.toLowerCase().replace('_', ' ')}</span>
                            </div>
                            <span className="text-text-secondary bg-surface-variant/50 px-2 py-0.5 rounded text-[10px] font-black">{item.count}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-xs font-bold text-muted">
                          Zero active leave parameters
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Dashboard bottom panel: Broadcast command & Real-time feed */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Timeline Stream */}
                  <div className="lg:col-span-2 glass-card p-8 border border-border/30 shadow-sm relative overflow-hidden">
                    <div className="mb-6">
                      <h3 className="heading-2 text-text-primary flex items-center gap-2">
                        <Clock size={18} className="text-primary animate-pulse" />
                        System Event Log
                      </h3>
                      <p className="text-xs text-text-secondary mt-0.5">Real-time status updates and process allocations</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Event logs */}
                      <div className="relative border-l border-border/50 pl-5.5 space-y-5.5 max-h-[300px] overflow-y-auto no-scrollbar">
                        {activityList.length > 0 ? (
                          activityList.map((act, index) => (
                            <motion.div 
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.04 }}
                              key={act.id} 
                              className="relative group"
                            >
                              <div className={cn(
                                "absolute -left-[27.5px] top-1 w-3 h-3 rounded-full border-2 bg-surface transition-transform group-hover:scale-125 duration-300",
                                act.type === 'task' ? "border-primary" : "border-secondary"
                              )} />
                              
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-black text-text-primary group-hover:text-primary transition-colors">{act.title}</span>
                                  {act.priority && (
                                    <span className={cn(
                                      "text-[8px] font-black uppercase px-1 py-0.5 rounded",
                                      act.priority === 'HIGH' ? "bg-error/10 text-error border border-error/15" : "bg-primary/10 text-primary border border-primary/15"
                                    )}>
                                      {act.priority}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-text-secondary mt-0.5 font-semibold">{act.description}</p>
                                <span className="text-[9px] text-muted font-bold block mt-1 uppercase tracking-wider">
                                  {new Date(act.date).toLocaleDateString()} at {new Date(act.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </motion.div>
                          ))
                        ) : (
                          <div className="py-6 text-center text-xs font-bold text-muted">
                            No logs registered
                          </div>
                        )}
                      </div>

                      {/* Division heat breakdown */}
                      <div className="space-y-4 bg-surface-variant/20 border border-border/30 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between">
                        <div>
                          <h4 className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-1.5">
                            <Building size={12} /> Division Ratios
                          </h4>
                          <div className="space-y-3.5 mt-5">
                            {departments.slice(0, 3).map((dept) => (
                              <div key={dept.id} className="space-y-1.5">
                                <div className="flex items-center justify-between text-xs font-bold">
                                  <span className="text-text-primary text-[11px]">{dept.name}</span>
                                  <span className="text-text-secondary">{dept.count} Members</span>
                                </div>
                                <div className="w-full h-1.5 bg-surface rounded-full overflow-hidden">
                                  <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${dept.percentage}%` }} />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="border-t border-border/40 pt-4 mt-6 flex items-center justify-between text-[9px] font-black text-muted uppercase tracking-widest">
                          <span>Verified: {stats?.activeEmployees} Nodes</span>
                          <span>Units: {stats?.departments} total</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Announcement broadcast hub */}
                  <div className="glass-card p-8 border border-border/30 shadow-sm relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full filter blur-xl pointer-events-none" />
                    
                    <div>
                      <h3 className="heading-2 text-text-primary flex items-center gap-2">
                        <Send size={18} className="text-primary animate-pulse" />
                        Announcement Center
                      </h3>
                      <p className="text-xs text-text-secondary mt-0.5">Broadcast custom operational messages to all active workspace nodes</p>
                    </div>

                    <form onSubmit={handleSendBroadcast} className="space-y-4 my-6">
                      <div className="relative">
                        <textarea
                          value={broadcastMessage}
                          onChange={(e) => setBroadcastMessage(e.target.value)}
                          placeholder="Type ecosystem notice or announcement broadcast details here..."
                          rows={4}
                          className="w-full p-4.5 bg-surface border border-border/40 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all font-semibold text-text-primary placeholder:text-muted resize-none leading-relaxed"
                          maxLength={250}
                        />
                        <span className="absolute bottom-3 right-3 text-[9px] font-black text-muted select-none">
                          {broadcastMessage.length}/250
                        </span>
                      </div>

                      <button
                        type="submit"
                        disabled={isSendingBroadcast || !broadcastMessage.trim()}
                        className="w-full btn-primary py-3 rounded-2xl flex items-center justify-center gap-2 text-xs font-black shadow-md shadow-primary/10 disabled:opacity-40"
                      >
                        <Zap size={14} />
                        {isSendingBroadcast ? 'Broadcasting notice...' : 'Push Announcement broadcast'}
                      </button>
                    </form>

                    <AnimatePresence>
                      {broadcastStatus && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="flex items-center gap-2 p-3 bg-success/15 border border-success/20 rounded-xl text-[10px] font-bold text-success-text"
                        >
                          <CheckCircle2 size={13} className="text-success" />
                          <span>{broadcastStatus}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <span className="text-[9px] text-muted font-bold block uppercase tracking-wider">
                      Broadcast security clearance: Level 3+
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* TAB: EMPLOYEES */}
            {activeTab === 'employees' && (
              <div className="glass-card overflow-hidden border border-border/30 shadow-sm">
                <div className="p-6 sm:p-8 border-b border-border/30 flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-surface/30">
                  <div>
                    <h3 className="heading-2 text-text-primary flex items-center gap-2">
                      <Users size={20} className="text-primary" />
                      Employee Directory
                    </h3>
                    <p className="text-xs text-text-secondary mt-0.5">Filter, configure, and orchestrate all corporate profiles</p>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                    <div className="relative flex-grow sm:flex-grow-0 min-w-[260px]">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" size={16} />
                      <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                        placeholder="Search by code, name, designation..."
                        className="pl-10 pr-4 py-2.5 bg-surface border border-border/40 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all w-full font-semibold text-text-primary placeholder:text-muted"
                      />
                    </div>

                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" size={14} />
                      <select 
                        value={deptFilter}
                        onChange={(e) => { setDeptFilter(e.target.value); setCurrentPage(1); }}
                        className="pl-9 pr-8 py-2.5 bg-surface border border-border/40 rounded-2xl text-xs font-bold outline-none cursor-pointer hover:border-primary/20 transition-all text-text-secondary appearance-none"
                      >
                        <option value="">All Units</option>
                        {departments.map(d => (
                          <option key={d.id} value={d.name}>{d.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="relative">
                      <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" size={14} />
                      <select 
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                        className="pl-9 pr-8 py-2.5 bg-surface border border-border/40 rounded-2xl text-xs font-bold outline-none cursor-pointer hover:border-primary/20 transition-all text-text-secondary appearance-none"
                      >
                        <option value="">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="on_leave">On Leave</option>
                        <option value="terminated">Terminated</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-variant/20">
                        <th className="px-8 py-4.5 text-[10px] font-black uppercase tracking-widest text-text-secondary border-b border-border/30">Employee Details</th>
                        <th className="px-6 py-4.5 text-[10px] font-black uppercase tracking-widest text-text-secondary border-b border-border/30">Designation</th>
                        <th className="px-6 py-4.5 text-[10px] font-black uppercase tracking-widest text-text-secondary border-b border-border/30">Organization Unit</th>
                        <th className="px-6 py-4.5 text-[10px] font-black uppercase tracking-widest text-text-secondary border-b border-border/30">Security Status</th>
                        <th className="px-6 py-4.5 text-[10px] font-black uppercase tracking-widest text-text-secondary border-b border-border/30">Analytics Summary</th>
                        <th className="px-8 py-4.5 text-[10px] font-black uppercase tracking-widest text-text-secondary border-b border-border/30 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30 bg-surface/10">
                      {employees.length > 0 ? (
                        employees.map((emp) => (
                          <motion.tr 
                            key={emp.id}
                            variants={itemVariants}
                            className="hover:bg-surface-variant/20 transition-colors group cursor-pointer"
                          >
                            <td className="px-8 py-4.5">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-surface to-border flex items-center justify-center font-bold text-muted group-hover:scale-105 transition-transform shadow-sm">
                                  {emp.firstName.charAt(0)}{emp.lastName.charAt(0)}
                                </div>
                                <div>
                                  <div className="font-bold text-text-primary group-hover:text-primary transition-colors flex items-center gap-2">
                                    {emp.fullName}
                                    <span className="text-[9px] font-black font-mono bg-surface border border-border/40 text-muted px-1.5 py-0.5 rounded">
                                      {emp.employeeCode}
                                    </span>
                                  </div>
                                  <span className="text-xs text-muted font-medium">{emp.email || 'No email associated'}</span>
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-4.5">
                              <span className="text-xs font-semibold text-text-primary">{emp.designation}</span>
                            </td>

                            <td className="px-6 py-4.5">
                              <div className="flex items-center gap-2 text-xs font-bold text-text-secondary">
                                <Building size={13} className="text-muted" />
                                {emp.department}
                              </div>
                              <span className="text-[10px] text-muted font-bold block mt-0.5">{emp.office}</span>
                            </td>

                            <td className="px-6 py-4.5">
                              <span className={cn(
                                "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest inline-flex items-center gap-1.5 shadow-sm border",
                                emp.status === 'active' 
                                  ? "bg-success/10 text-success border-success/20" 
                                  : emp.status === 'on_leave'
                                  ? "bg-secondary/10 text-secondary border-secondary/20"
                                  : "bg-surface text-text-secondary border-border"
                              )}>
                                <div className={cn("w-1.5 h-1.5 rounded-full", emp.status === 'active' ? "bg-success animate-pulse" : emp.status === 'on_leave' ? "bg-secondary" : "bg-muted")} />
                                {emp.status}
                              </span>
                            </td>

                            <td className="px-6 py-4.5">
                              <div className="flex gap-4 text-xs font-bold text-text-secondary">
                                <div className="flex items-center gap-1" title="Assigned Tasks">
                                  <FileText size={13} className="text-primary" />
                                  <span>{emp.taskCount}</span>
                                </div>
                                <div className="flex items-center gap-1" title="Time-off Requests">
                                  <Calendar size={13} className="text-secondary" />
                                  <span>{emp.leaveCount}</span>
                                </div>
                                <div className="flex items-center gap-1" title="Attendance Logged">
                                  <UserCheck size={13} className="text-success" />
                                  <span>{emp.attendanceCount}</span>
                                </div>
                              </div>
                            </td>

                            <td className="px-8 py-4.5 text-right">
                              <button className="p-2 hover:bg-surface border border-transparent hover:border-border rounded-xl text-text-secondary hover:text-primary transition-all duration-300 shadow-sm active:scale-95">
                                <MoreVertical size={16} />
                              </button>
                            </td>
                          </motion.tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="text-center py-12 text-sm font-bold text-muted bg-surface/5">
                            <UserX className="mx-auto text-muted mb-3" size={32} />
                            No corporate profiles matched query
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="p-6 bg-surface/20 flex items-center justify-between border-t border-border/30">
                  <p className="text-xs font-bold text-text-secondary">
                    Showing <span className="text-text-primary">{employees.length}</span> of <span className="text-text-primary">{totalEmployeesCount}</span> corporate units
                  </p>
                  
                  {totalPages > 1 && (
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 border border-border/50 bg-surface rounded-xl text-text-secondary hover:text-primary disabled:opacity-40 transition-all duration-200"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <span className="text-xs font-black text-text-primary px-3">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button 
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2 border border-border/50 bg-surface rounded-xl text-text-secondary hover:text-primary disabled:opacity-40 transition-all duration-200"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: DEPARTMENTS */}
            {activeTab === 'departments' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="heading-2 text-text-primary flex items-center gap-2">
                      <Building size={20} className="text-primary" />
                      Organization Units
                    </h3>
                    <p className="text-xs text-text-secondary mt-0.5">Manage functional business blocks and divisions</p>
                  </div>
                  <button className="btn-secondary py-2 px-4 text-xs font-bold flex items-center gap-1.5 rounded-xl">
                    <Building size={14} />
                    Add New Division
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {departments.map((dept, index) => (
                    <motion.div 
                      key={dept.id}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.04 }}
                      whileHover={{ y: -4 }}
                      className="glass-card p-6 border border-border/30 hover:border-primary/20 shadow-sm relative overflow-hidden flex flex-col justify-between group"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-full" />
                      
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <span className="text-[10px] font-black text-primary uppercase bg-primary/10 px-2 py-0.5 rounded-md">
                              {dept.code || 'DIV'}
                            </span>
                            <h4 className="text-sm font-black text-text-primary group-hover:text-primary transition-colors mt-2">{dept.name}</h4>
                          </div>
                          <button className="p-1.5 hover:bg-surface-variant rounded-lg text-text-secondary hover:text-primary transition-all">
                            <MoreVertical size={14} />
                          </button>
                        </div>

                        <div className="space-y-3.5 my-5">
                          <div className="flex items-center justify-between text-xs font-bold text-text-secondary">
                            <span>Occupancy</span>
                            <span className="text-text-primary">{dept.count} Members</span>
                          </div>
                          
                          <div className="w-full h-2 bg-surface-variant/40 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 rounded-full" 
                              style={{ width: `${dept.percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-border/30 pt-4 flex items-center justify-between text-xs font-semibold text-text-secondary bg-surface/5 px-2 rounded-xl py-2">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-success" />
                          <span>{dept.active} Active</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-muted" />
                          <span>{dept.inactive} Inactive</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {unassignedEmployees > 0 && (
                    <motion.div 
                      whileHover={{ y: -4 }}
                      className="glass-card p-6 border border-secondary/20 bg-secondary/5 shadow-sm relative overflow-hidden flex flex-col justify-between"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-secondary/5 to-transparent rounded-bl-full" />
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <span className="text-[10px] font-black text-secondary uppercase bg-secondary/10 px-2 py-0.5 rounded-md">
                              UNASSIGNED
                            </span>
                            <h4 className="text-sm font-black text-text-primary mt-2">Unassigned Division</h4>
                          </div>
                        </div>
                        <p className="text-xs text-text-secondary mt-3">Members of the corporation who are currently not assigned to any specific division or unit structure.</p>
                      </div>
                      <div className="border-t border-secondary/20 pt-4 mt-6 flex items-center justify-between text-xs font-bold text-secondary-text">
                        <span>Pending Placement</span>
                        <span className="bg-secondary/15 px-3 py-1 rounded-xl">{unassignedEmployees} Members</span>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: LEAVES */}
            {activeTab === 'leaves' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="heading-2 text-text-primary flex items-center gap-2">
                      <Calendar size={20} className="text-primary" />
                      Corporate Time-Off Control
                    </h3>
                    <p className="text-xs text-text-secondary mt-0.5">Approve, decline, or monitor leaves of absence globally</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="bg-secondary/10 text-secondary border border-secondary/20 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5">
                      <Clock size={14} />
                      {leaveData?.pending ?? 0} Pending Actions
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                  <div className="xl:col-span-2 space-y-4">
                    {leaveData?.recent && leaveData.recent.length > 0 ? (
                      leaveData.recent.map((req, index) => (
                        <motion.div 
                          key={req.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.04 }}
                          className="glass-card p-6 border border-border/30 hover:border-primary/20 shadow-sm relative overflow-hidden group transition-all duration-300"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div className="flex items-start gap-4">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-surface to-border flex items-center justify-center font-bold text-muted group-hover:scale-105 transition-transform shadow-sm">
                                {req.employeeName.charAt(0)}
                              </div>
                              <div>
                                <h4 className="text-sm font-black text-text-primary group-hover:text-primary transition-colors">{req.employeeName}</h4>
                                <p className="text-[10px] text-muted font-bold mt-0.5">{req.designation} — {req.department}</p>
                                
                                <div className="mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-bold text-text-secondary">
                                  <span className="flex items-center gap-1 bg-surface-variant/40 px-2 py-0.5 rounded-md">
                                    <Layers size={13} className="text-primary" />
                                    {req.type}
                                  </span>
                                  <span className="flex items-center gap-1 bg-surface-variant/40 px-2 py-0.5 rounded-md">
                                    <Calendar size={13} className="text-secondary" />
                                    {new Date(req.fromDate).toLocaleDateString()} to {new Date(req.toDate).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-xs text-text-secondary mt-3 bg-surface-variant/15 border border-border/30 p-2.5 rounded-xl italic font-medium">"{req.reason}"</p>
                              </div>
                            </div>

                            <div className="flex flex-col items-end justify-between h-full min-h-[80px] self-stretch gap-3">
                              <span className={cn(
                                "px-3.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest inline-flex items-center gap-1 border",
                                req.status === 'APPROVED' 
                                  ? "bg-success/15 text-success border-success/20" 
                                  : req.status === 'PENDING'
                                  ? "bg-secondary/15 text-secondary border-secondary/20"
                                  : "bg-error/15 text-error border-error/20"
                              )}>
                                {req.status === 'APPROVED' && <CheckCircle2 size={11} />}
                                {req.status === 'REJECTED' && <XCircle size={11} />}
                                {req.status}
                              </span>

                              {req.status === 'PENDING' && (
                                <div className="flex gap-2">
                                  <button className="px-3.5 py-1.5 bg-error text-white font-bold rounded-xl text-xs hover:bg-error/90 active:scale-95 transition-all duration-200 shadow-sm shadow-error/10">
                                    Reject
                                  </button>
                                  <button className="px-3.5 py-1.5 bg-primary text-white font-bold rounded-xl text-xs hover:bg-primary/90 active:scale-95 transition-all duration-200 shadow-sm shadow-primary/10">
                                    Approve
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="py-12 text-center text-xs font-semibold text-muted glass-card border border-border/30">
                        No recent time-off requests registered
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    <div className="glass-card p-6 border border-border/30 shadow-sm">
                      <h4 className="text-xs font-black text-text-primary uppercase tracking-widest mb-4">Leave Summary</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3.5 bg-surface-variant/20 rounded-2xl border border-border/20 shadow-inner">
                          <div>
                            <p className="text-[10px] font-bold text-text-secondary uppercase">Pending Approval</p>
                            <p className="text-2xl font-black text-secondary mt-1">{leaveData?.pending ?? 0}</p>
                          </div>
                          <Clock size={24} className="text-secondary opacity-80" />
                        </div>
                        <div className="flex items-center justify-between p-3.5 bg-success/5 rounded-2xl border border-success/15 shadow-inner">
                          <div>
                            <p className="text-[10px] font-bold text-success uppercase">Approved Leaves</p>
                            <p className="text-2xl font-black text-success mt-1">{leaveData?.approved ?? 0}</p>
                          </div>
                          <CheckCircle2 size={24} className="text-success opacity-85" />
                        </div>
                        <div className="flex items-center justify-between p-3.5 bg-error/5 rounded-2xl border border-error/15 shadow-inner">
                          <div>
                            <p className="text-[10px] font-bold text-error-text uppercase">Rejected Leaves</p>
                            <p className="text-2xl font-black text-error mt-1">{leaveData?.rejected ?? 0}</p>
                          </div>
                          <XCircle size={24} className="text-error opacity-80" />
                        </div>
                      </div>
                    </div>

                    <div className="glass-card p-6 border border-border/30 shadow-sm relative overflow-hidden bg-primary/5">
                      <h4 className="text-xs font-black text-primary uppercase tracking-widest mb-3">Policy Note</h4>
                      <p className="text-xs text-text-secondary leading-relaxed font-medium">As an HR manager, decisions to approve or reject leave requests will directly update attendance sheets and payroll modules in real time.</p>
                      <div className="border-t border-border/30 pt-4 mt-6">
                        <span className="text-[10px] font-black text-muted uppercase tracking-wider">Quickboom HRM Module</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default HRManagementPage;
