"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  Check, 
  X, 
  Plus, 
  User, 
  FileText, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Search,
  Filter,
  UserCheck,
  Download,
  Trash2,
  Settings,
  AlertCircle,
  CalendarRange,
  Info,
  SlidersHorizontal,
  Layers,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import Modal from '@/components/Modal';
import TableSkeleton from '@/components/TableSkeleton';
import { api } from '@/lib/api';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  AreaChart, 
  Area 
} from 'recharts';



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

// Modern theme palette matching the HR dashboard
const LEAVE_TYPES_CONFIG = [
  { id: '1', name: 'Casual Leave', code: 'CL', color: '#F4B860', allowance: 12, rules: 'Max 3 consecutive days, no carry-forward' },
  { id: '2', name: 'Sick Leave', code: 'SL', color: '#EF4444', allowance: 10, rules: 'Requires medical certificate if > 2 days' },
  { id: '3', name: 'Earned Leave', code: 'EL', color: '#3BA38B', allowance: 15, rules: 'Carry-forward allowed up to 30 days' },
  { id: '4', name: 'Maternity Leave', code: 'ML', color: '#A78BFA', allowance: 90, rules: 'Fully paid leave for expecting mothers' },
  { id: '5', name: 'Paternity Leave', code: 'PL', color: '#60A5FA', allowance: 10, rules: 'For new fathers, max 10 days' },
  { id: '6', name: 'Work From Home', code: 'WFH', color: '#2DD4BF', allowance: 24, rules: 'Subject to department approval' },
];

export default function LeavePage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'requests' | 'balances' | 'policies' | 'calendar'>('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  // Live Integration States
  const [leaveBalances, setLeaveBalances] = useState<any[]>([]);
  const [realEmployees, setRealEmployees] = useState<any[]>([]);

  // Remarks drawer state
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [remarks, setRemarks] = useState('');
  const [isRemarksModalOpen, setIsRemarksModalOpen] = useState(false);
  const [remarksAction, setRemarksAction] = useState<'approve' | 'reject'>('approve');

  // Form State for applying leave
  const [employeeName, setEmployeeName] = useState('Sarah Johnson');
  const [leaveType, setLeaveType] = useState('Casual Leave');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  // Policy Settings state
  const [carryForwardDays, setCarryForwardDays] = useState(10);
  const [maxLimits, setMaxLimits] = useState(30);

  // Balance adjust modal
  const [isBalanceAdjustOpen, setIsBalanceAdjustOpen] = useState(false);
  const [adjustEmployee, setAdjustEmployee] = useState('');
  const [adjustType, setAdjustType] = useState('Casual');
  const [adjustValue, setAdjustValue] = useState(0);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const leavesRes = await api.get<{ success: boolean; leaves: any[] }>('/api/admin/leaves');
      if (leavesRes.data.success) {
        setLeaveRequests(leavesRes.data.leaves);
      }

      const balancesRes = await api.get<{ success: boolean; balances: any[] }>('/api/admin/leaves/balances');
      if (balancesRes.data.success) {
        setLeaveBalances(balancesRes.data.balances);
      }

      const empRes = await api.get<{ success: boolean; employees: any[] }>('/api/admin/employees');
      if (empRes.data.success && empRes.data.employees.length > 0) {
        setRealEmployees(empRes.data.employees);
        setEmployeeName(`${empRes.data.employees[0].firstName} ${empRes.data.employees[0].lastName}`);
        setAdjustEmployee(`${empRes.data.employees[0].firstName} ${empRes.data.employees[0].lastName}`);
      }
    } catch (err) {
      console.error('Failed to load leave admin data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handlers
  const handleRemarksAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    const actionStatus = remarksAction === 'approve' ? 'Approved' : 'Rejected';
    const apiStatus = remarksAction === 'approve' ? 'APPROVED' : 'REJECTED';

    try {
      await api.put(`/api/admin/leaves/${selectedRequest.id}`, { status: apiStatus, remarks });
      await loadData();
      setIsRemarksModalOpen(false);
      setSelectedRequest(null);
      setRemarks('');
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Operation failed');
    }
  };

  const openRemarksModal = (req: any, action: 'approve' | 'reject') => {
    setSelectedRequest(req);
    setRemarksAction(action);
    setIsRemarksModalOpen(true);
  };

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason) return;

    try {
      const targetEmp = realEmployees.find(emp => `${emp.firstName} ${emp.lastName}` === employeeName) || realEmployees[0];
      if (!targetEmp) throw new Error('No registered employee found.');

      await api.post('/api/admin/leaves', {
        employeeId: targetEmp.id,
        type: leaveType,
        fromDate: startDate,
        toDate: endDate,
        reason,
      });

      await loadData();

      setIsApplyModalOpen(false);
      setStartDate('');
      setEndDate('');
      setReason('');
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Failed to apply leave');
    }
  };

  const handleAdjustBalance = (e: React.FormEvent) => {
    e.preventDefault();
    const targetName = adjustEmployee;
    const typeKey = adjustType.toLowerCase();

    setLeaveBalances(prev => prev.map(bal => {
      if (bal.name === targetName) {
        const currentVal = Number(bal[typeKey] ?? 0);
        return {
          ...bal,
          [typeKey]: Math.max(0, currentVal + adjustValue)
        };
      }
      return bal;
    }));

    setIsBalanceAdjustOpen(false);
    setAdjustValue(0);
  };

  const resetAllBalances = () => {
    if (!window.confirm('Are you sure you want to reset all employee leave balances to annual standard allocations?')) return;
    setLeaveBalances(prev => prev.map(bal => ({
      ...bal,
      casual: 12,
      sick: 10,
      earned: 15,
      paid: 10
    })));
  };

  const exportReport = (format: 'pdf' | 'excel') => {
    alert(`Exporting Leave Utilization Report in ${format.toUpperCase()} format...`);
  };

  // Stats Counters
  const totalRequests = leaveRequests.length;
  const pendingRequests = leaveRequests.filter(r => r.status === 'Pending').length;
  const approvedRequests = leaveRequests.filter(r => r.status === 'Approved').length;

  const filteredRequests = useMemo(() => {
    return leaveRequests.filter(req => {
      const matchesSearch = req.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            req.reason.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'All' || req.type === filterType;
      const matchesStatus = filterStatus === 'All' || req.status === filterStatus;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [leaveRequests, searchTerm, filterType, filterStatus]);

  // Chart data calculation
  const chartData = useMemo(() => {
    const monthlyStats: Record<string, { cl: number; sl: number; el: number }> = {
      'Jan': { cl: 2, sl: 1, el: 1 },
      'Feb': { cl: 4, sl: 3, el: 2 },
      'Mar': { cl: 1, sl: 5, el: 4 },
      'Apr': { cl: 5, sl: 2, el: 6 },
      'May': { cl: 6, sl: 4, el: 3 },
    };

    leaveRequests.forEach(req => {
      if (req.status === 'Approved') {
        const date = new Date(req.startDate);
        if (!isNaN(date.getTime())) {
          const monthName = date.toLocaleDateString('en-US', { month: 'short' });
          if (monthlyStats[monthName]) {
            if (req.type === 'Casual Leave') monthlyStats[monthName].cl += 1;
            else if (req.type === 'Sick Leave') monthlyStats[monthName].sl += 1;
            else monthlyStats[monthName].el += 1;
          }
        }
      }
    });

    return Object.entries(monthlyStats).map(([name, val]) => ({
      name,
      'Casual Leave': val.cl,
      'Sick Leave': val.sl,
      'Earned Leave': val.el
    }));
  }, [leaveRequests]);

  // Calendar visualizer matrix days (May 2026 for showcase)
  const calendarDays = useMemo(() => {
    const totalDays = 31;
    const startOffset = 5; // Friday starting May 1st 2026
    const days = [];

    for (let i = 1 - startOffset; i <= totalDays; i++) {
      if (i <= 0) {
        days.push({ day: 0, date: '', isHoliday: false, leaves: [] });
      } else {
        const dateStr = `2026-05-${i.toString().padStart(2, '0')}`;
        let holiday: any = undefined;
        const activeLeaves = leaveRequests.filter(req => {
          if (req.status !== 'Approved') return false;
          const s = new Date(req.startDate).getDate();
          const e = new Date(req.endDate).getDate();
          return i >= s && i <= e;
        });

        days.push({
          day: i,
          date: dateStr,
          isHoliday: !!holiday,
          holidayName: holiday?.name,
          leaves: activeLeaves
        });
      }
    }
    return days;
  }, [leaveRequests]);

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8 pb-16 text-slate-100 animate-fadeIn"
    >
      {/* Title Header Command hub */}
      <motion.div variants={itemVariants} className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-slate-900/90 to-slate-950/95 backdrop-blur-xl p-8 md:p-10 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div className="absolute -top-12 -right-12 w-96 h-96 bg-primary/10 rounded-full filter blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute -bottom-24 -left-12 w-80 h-80 bg-emerald-500/5 rounded-full filter blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/20 to-emerald-500/10 border border-primary/30 text-primary text-[10px] font-black px-3.5 py-1.5 rounded-full uppercase tracking-widest shadow-inner">
            <CalendarRange size={12} className="text-primary animate-pulse" />
            Corporate Time-Off Governance
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-none">
            Leave <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-teal-400 to-emerald-400">Governance</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-400 font-medium max-w-xl leading-relaxed">
            Orchestrate employee time-off allocations, ledger records, monthly calendars, and holiday policies.
          </p>
        </div>

        <div className="relative z-10 shrink-0 flex items-center gap-3">
          <button 
            onClick={() => setIsApplyModalOpen(true)}
            className="btn-primary shadow-xl shadow-primary/20 hover:shadow-primary/30 px-6.5 py-4 shrink-0 rounded-2xl text-xs font-black uppercase tracking-wider justify-center"
          >
            <Plus size={18} />
            Apply Time-Off
          </button>
        </div>
      </motion.div>

      {/* Tab Navigation Controls */}
      <motion.div variants={itemVariants} className="flex overflow-x-auto gap-2 p-1.5 bg-slate-950/40 border border-white/5 rounded-2xl no-scrollbar max-w-3xl">
        {[
          { id: 'dashboard', label: 'Dashboard Overview', icon: BarChart3 },
          { id: 'requests', label: 'Request Logs', icon: FileText },
          { id: 'balances', label: 'Balance Ledger', icon: Layers },
          { id: 'policies', label: 'Policies & Types', icon: Settings },
          { id: 'calendar', label: 'Ecosystem Calendar', icon: CalendarIcon },
        ].map((tab) => {
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider shrink-0 transition-all duration-300 cursor-pointer",
                isSelected 
                  ? "bg-primary text-white shadow-lg shadow-primary/25 border-primary/30" 
                  : "text-slate-450 hover:text-white hover:bg-white/5"
              )}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </motion.div>

      {/* 1. DASHBOARD TAB */}
      <AnimatePresence mode="wait">
        {activeTab === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            {/* KPI Counters Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { label: 'Total Leave Requests', value: totalRequests, icon: FileText, color: 'from-blue-500/20 to-indigo-500/10 border-blue-500/30 text-blue-400', glow: 'rgba(59,130,246,0.15)' },
                { label: 'Pending Approvals', value: pendingRequests, icon: Clock, color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400', glow: 'rgba(245,158,11,0.15)' },
                { label: 'Approved Requests', value: approvedRequests, icon: CheckCircle2, color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-450', glow: 'rgba(16,185,129,0.15)' },
                { label: 'Upcoming Holidays', value: 0, icon: CalendarIcon, color: 'from-violet-500/20 to-purple-500/10 border-violet-500/30 text-violet-400', glow: 'rgba(139,92,246,0.15)' },
              ].map((stat, i) => (
                <div 
                  key={i}
                  className="relative overflow-hidden rounded-[2rem] border border-white/5 bg-slate-900/40 p-6 flex items-center gap-5 shadow-2xl backdrop-blur-xl group hover:border-white/10 transition-all duration-300"
                >
                  <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-white/5 rounded-full filter blur-xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
                  <div 
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-gradient-to-br border ${stat.color}`}
                    style={{ boxShadow: `0 8px 24px -6px ${stat.glow}` }}
                  >
                    <stat.icon size={24} className="group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                    <p className="text-3xl font-black text-white mt-1.5 tracking-tight">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Dashboard Analytics & Holiday List */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Analytics Graph */}
              <div className="xl:col-span-2 relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-slate-900/40 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center justify-between gap-4 mb-6">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Time-off distributions</p>
                    <h3 className="text-lg font-black text-white">Monthly Leave Utilization Trends</h3>
                  </div>
                  <TrendingUp className="text-primary w-5 h-5" />
                </div>
                
                <div className="h-72 w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0F172A', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}
                        labelStyle={{ color: '#94A3B8', fontWeight: 'bold' }}
                      />
                      <Bar dataKey="Casual Leave" fill="#F4B860" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Sick Leave" fill="#EF4444" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Earned Leave" fill="#3BA38B" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Holiday Quicklist */}
              <div className="relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-slate-900/40 p-6 sm:p-8 shadow-2xl backdrop-blur-xl flex flex-col justify-between">
                <div className="space-y-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Corporate calendar</p>
                      <h3 className="text-lg font-black text-white">Upcoming Holidays</h3>
                    </div>
                    <CalendarIcon className="text-violet-400 w-5 h-5 animate-pulse" />
                  </div>

                  <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                    {[]}
                  </div>
                </div>

                <button 
                  onClick={() => setActiveTab('calendar')}
                  className="w-full mt-6 py-3 border border-white/5 hover:border-primary/20 bg-slate-950/20 hover:bg-primary/10 rounded-2xl text-[10px] font-black uppercase tracking-wider text-slate-300 hover:text-white transition-all duration-300 cursor-pointer"
                >
                  View Complete Calendar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. REQUESTS TAB */}
      <AnimatePresence mode="wait">
        {activeTab === 'requests' && (
          <motion.div
            key="requests"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* Filter and Search Hub */}
            <div className="flex flex-col xl:flex-row gap-4 items-center justify-between border border-white/5 bg-slate-900/40 p-4.5 rounded-3xl shadow-2xl backdrop-blur-xl">
              <div className="relative w-full xl:w-96 group">
                <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-primary transition-colors w-5 h-5" />
                <input 
                  type="text" 
                  placeholder="Search time-off justification..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-13 pr-4 py-3.5 bg-slate-950/40 border border-white/5 hover:border-white/10 focus:border-primary/30 rounded-2xl outline-none transition-all text-xs font-semibold text-white placeholder-slate-500"
                />
              </div>
              <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                <select 
                  value={filterType} 
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full sm:w-48 bg-slate-950/40 border border-white/5 hover:border-white/10 focus:border-primary/30 rounded-2xl px-4 py-3.5 text-xs outline-none font-bold text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  <option value="All" className="bg-slate-900 text-white">All Leave Types</option>
                  <option value="Casual Leave" className="bg-slate-900 text-white">Casual Leave</option>
                  <option value="Sick Leave" className="bg-slate-900 text-white">Sick Leave</option>
                  <option value="Earned Leave" className="bg-slate-900 text-white">Earned Leave</option>
                </select>

                <select 
                  value={filterStatus} 
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full sm:w-48 bg-slate-950/40 border border-white/5 hover:border-white/10 focus:border-primary/30 rounded-2xl px-4 py-3.5 text-xs outline-none font-bold text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  <option value="All" className="bg-slate-900 text-white">All Statuses</option>
                  <option value="Pending" className="bg-slate-900 text-white">Pending Action</option>
                  <option value="Approved" className="bg-slate-900 text-white">Approved</option>
                  <option value="Rejected" className="bg-slate-900 text-white">Rejected</option>
                </select>

                <button 
                  onClick={() => exportReport('excel')}
                  className="flex items-center gap-2 px-5 py-3.5 bg-slate-900/50 hover:bg-slate-800 border border-white/5 rounded-2xl text-xs font-bold text-slate-400 hover:text-white transition-all cursor-pointer justify-center w-full sm:w-auto"
                >
                  <Download size={14} />
                  Export Sheet
                </button>
              </div>
            </div>

            {/* Requests Table view */}
            {isLoading ? (
              <div className="relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-slate-900/40 p-8 shadow-2xl backdrop-blur-xl">
                <TableSkeleton rows={4} columns={6} />
              </div>
            ) : (
              <motion.div variants={itemVariants} className="relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-slate-900/40 shadow-2xl backdrop-blur-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-950/30 border-b border-white/5">
                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Requester</th>
                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Time-Off Tier</th>
                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Period Duration</th>
                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Reason / Remarks</th>
                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      <AnimatePresence mode="popLayout">
                        {filteredRequests.length > 0 ? (
                          filteredRequests.map((req) => (
                            <motion.tr 
                              layout
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              key={req.id}
                              className="hover:bg-white/[0.02] transition-colors group cursor-default"
                            >
                              <td className="px-6 py-5 font-bold text-white group-hover:text-primary transition-colors tracking-tight">
                                {req.employeeName}
                              </td>
                              <td className="px-6 py-5">
                                <span className="text-xs font-bold text-slate-400">{req.type}</span>
                              </td>
                              <td className="px-6 py-5 text-center">
                                <span className="font-mono text-[10px] font-black text-slate-400 bg-slate-950/40 px-3 py-1.5 rounded-xl border border-white/5 shadow-sm">
                                  {req.startDate} to {req.endDate}
                                </span>
                              </td>
                              <td className="px-6 py-5 max-w-xs">
                                <p className="font-medium text-slate-400 text-xs truncate" title={req.reason}>{req.reason}</p>
                                {req.remarks && (
                                  <p className="text-[10px] text-slate-500 mt-1 italic">Remarks: {req.remarks}</p>
                                )}
                              </td>
                              <td className="px-6 py-5">
                                <span className={cn(
                                  "px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1.5 border shadow-sm",
                                  req.status === 'Approved' ? "bg-emerald-500/10 text-emerald-450 border-emerald-500/20" : 
                                  req.status === 'Rejected' ? "bg-rose-500/10 text-rose-400 border-rose-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                )}>
                                  <span className={cn(
                                    "w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentColor]",
                                    req.status === 'Approved' ? "bg-emerald-450" : 
                                    req.status === 'Rejected' ? "bg-rose-400" : "bg-amber-400 animate-pulse"
                                  )} />
                                  {req.status}
                                </span>
                              </td>
                              <td className="px-6 py-5 text-right">
                                {req.status === 'Pending' ? (
                                  <div className="flex items-center justify-end gap-2">
                                    <button 
                                      onClick={() => openRemarksModal(req, 'approve')}
                                      className="p-2.5 bg-emerald-500/10 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 rounded-xl text-emerald-400 transition-all shadow-sm active:scale-95 cursor-pointer"
                                      title="Approve time-off"
                                    >
                                      <Check size={16} />
                                    </button>
                                    <button 
                                      onClick={() => openRemarksModal(req, 'reject')}
                                      className="p-2.5 bg-rose-500/10 hover:bg-rose-500 hover:text-white border border-rose-500/20 rounded-xl text-rose-400 transition-all shadow-sm active:scale-95 cursor-pointer"
                                      title="Reject time-off"
                                    >
                                      <X size={16} />
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-[10px] font-black uppercase text-slate-500 select-none tracking-wider">Processed</span>
                                )}
                              </td>
                            </motion.tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="px-6 py-12 text-center text-xs font-bold text-slate-500 uppercase tracking-widest bg-slate-900/20">
                              No request logs found.
                            </td>
                          </tr>
                        )}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. BALANCES TAB */}
      <AnimatePresence mode="wait">
        {activeTab === 'balances' && (
          <motion.div
            key="balances"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* Balance Options Panel */}
            <div className="flex items-center justify-between gap-4 p-4.5 border border-white/5 bg-slate-900/40 rounded-3xl shadow-2xl backdrop-blur-xl">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Allowance Adjustment Operations</h3>
                <p className="text-xs text-slate-450 mt-1 font-medium leading-relaxed">Modify individual employee allocation credits or standard parameters.</p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsBalanceAdjustOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4.5 py-3 border border-white/5 hover:border-primary/20 bg-slate-950/20 hover:bg-primary/10 rounded-2xl text-[10px] font-black uppercase tracking-wider text-slate-300 hover:text-white transition-all cursor-pointer"
                >
                  <Plus size={13} />
                  Adjust Credit
                </button>
                <button 
                  onClick={resetAllBalances}
                  className="inline-flex items-center gap-1.5 px-4.5 py-3 border border-rose-500/10 hover:border-rose-500/30 bg-slate-950/20 hover:bg-rose-500/10 rounded-2xl text-[10px] font-black uppercase tracking-wider text-rose-400 hover:text-rose-350 transition-all cursor-pointer"
                >
                  <Trash2 size={13} />
                  Reset Ledger
                </button>
              </div>
            </div>

            {/* Leave Balance Sheet Table */}
            <div className="relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-slate-900/40 shadow-2xl backdrop-blur-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-950/30 border-b border-white/5">
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee Details</th>
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Casual Leave</th>
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Sick Leave</th>
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Earned Leave</th>
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Paid Allowances</th>
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {leaveBalances.map((bal) => (
                      <tr key={bal.employeeId} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4.5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-primary/20 text-primary flex items-center justify-center font-black text-xs border border-primary/20">
                              {bal.name.substring(0, 2).toUpperCase()}
                            </div>
                            <span className="font-bold text-white">{bal.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4.5 text-center font-bold text-amber-400 tabular-nums">{bal.casual}</td>
                        <td className="px-6 py-4.5 text-center font-bold text-rose-400 tabular-nums">{bal.sick}</td>
                        <td className="px-6 py-4.5 text-center font-bold text-primary tabular-nums">{bal.earned}</td>
                        <td className="px-6 py-4.5 text-center font-bold text-violet-400 tabular-nums">{bal.paid}</td>
                        <td className="px-6 py-4.5 text-center">
                          <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                            <UserCheck size={10} />
                            Compliant
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. POLICIES TAB */}
      <AnimatePresence mode="wait">
        {activeTab === 'policies' && (
          <motion.div
            key="policies"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 xl:grid-cols-3 gap-6"
          >
            {/* Standard leave configurations list */}
            <div className="xl:col-span-2 space-y-5">
              <div className="p-4 border border-white/5 bg-slate-900/40 rounded-3xl">
                <h3 className="text-xs font-black text-white uppercase tracking-widest">Active Time-Off Allocation Categories</h3>
                <p className="text-[11px] text-slate-500 font-semibold mt-1">Configure baseline allowances for each active category tier.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {LEAVE_TYPES_CONFIG.map((type) => (
                  <div 
                    key={type.id} 
                    className="relative overflow-hidden rounded-[2rem] border border-white/5 bg-slate-900/40 p-6 flex flex-col justify-between shadow-2xl backdrop-blur-xl group hover:border-white/10 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs text-white"
                          style={{ backgroundColor: type.color }}
                        >
                          {type.code}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">{type.name}</h4>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">{type.allowance} days standard allowance</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-5 pt-3.5 border-t border-white/5 flex items-center gap-2">
                      <Info size={12} className="text-slate-400 shrink-0" />
                      <p className="text-[10px] text-slate-400 font-medium leading-relaxed">{type.rules}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* General Time-off settings panel */}
            <div className="relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-slate-900/40 p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
              <div className="flex items-center gap-3.5 pb-4 border-b border-white/5">
                <div className="w-12 h-12 rounded-2xl bg-primary/20 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                  <Settings size={22} />
                </div>
                <div>
                  <h3 className="text-md font-black text-white tracking-tight">Global Policies</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Time-off controls</p>
                </div>
              </div>

              <div className="space-y-4 text-xs font-semibold text-slate-450">
                <div className="space-y-2">
                  <label className="block text-slate-400 uppercase tracking-widest text-[9px] font-black">Maximum Carry-Forward Limit</label>
                  <input 
                    type="number"
                    value={carryForwardDays}
                    onChange={(e) => setCarryForwardDays(Number(e.target.value))}
                    className="w-full px-4 py-3.5 bg-slate-950/40 border border-white/5 hover:border-white/10 focus:border-primary/30 rounded-2xl outline-none text-white transition-all text-xs"
                  />
                  <span className="text-[9px] text-slate-500 block leading-relaxed">Max days allowed to carry over into next calendar cycle.</span>
                </div>

                <div className="space-y-2">
                  <label className="block text-slate-400 uppercase tracking-widest text-[9px] font-black">Maximum Consecutive Leaves</label>
                  <input 
                    type="number"
                    value={maxLimits}
                    onChange={(e) => setMaxLimits(Number(e.target.value))}
                    className="w-full px-4 py-3.5 bg-slate-950/40 border border-white/5 hover:border-white/10 focus:border-primary/30 rounded-2xl outline-none text-white transition-all text-xs"
                  />
                  <span className="text-[9px] text-slate-500 block leading-relaxed">Sets default validation checks on submission limits.</span>
                </div>
              </div>

              <button 
                onClick={() => alert('Global Policy parameters saved successfully')}
                className="w-full py-4 bg-primary hover:bg-primary-dark text-white font-black uppercase tracking-wider text-xs rounded-2xl shadow-xl shadow-primary/20 transition-all duration-300 cursor-pointer"
              >
                Save Settings
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. CALENDAR TAB */}
      <AnimatePresence mode="wait">
        {activeTab === 'calendar' && (
          <motion.div
            key="calendar"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* Date info hub */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 border border-white/5 bg-slate-900/40 rounded-3xl">
              <div>
                <h3 className="text-md font-black text-white tracking-tight">May 2026</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Corporate Holiday & Leaves Overview</p>
              </div>
              <div className="flex flex-wrap gap-2.5">
                <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-violet-400 bg-violet-500/10 px-2.5 py-1.5 rounded-xl border border-violet-500/20">Holiday</span>
                <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1.5 rounded-xl border border-primary/20">Approved Leave</span>
              </div>
            </div>

            {/* Grid monthly layout */}
            <div className="grid grid-cols-7 gap-2.5">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(w => (
                <div key={w} className="text-center text-[10px] font-black uppercase tracking-widest text-slate-500 py-2">{w}</div>
              ))}

              {calendarDays.map((day, idx) => {
                const hasLeave = day.leaves.length > 0;
                return (
                  <div 
                    key={idx}
                    className={cn(
                      "min-h-[6.5rem] p-3 rounded-2xl border transition-all flex flex-col justify-between",
                      day.day === 0 ? "border-transparent bg-transparent select-none opacity-0" :
                      day.isHoliday ? "border-violet-500/30 bg-violet-500/5" :
                      hasLeave ? "border-primary/20 bg-primary/5" : "border-white/5 bg-slate-900/40 hover:border-white/10"
                    )}
                  >
                    <div className="flex justify-between items-start">
                      <span className={cn(
                        "text-xs font-black",
                        day.isHoliday ? "text-violet-400" :
                        hasLeave ? "text-primary" : "text-slate-400"
                      )}>{day.day || ''}</span>
                    </div>

                    <div className="space-y-1.5">
                      {day.isHoliday && (
                        <p className="text-[8px] font-black uppercase tracking-wider text-violet-450 leading-relaxed truncate" title={day.holidayName}>{day.holidayName}</p>
                      )}
                      {hasLeave && day.leaves.map((l: any, lidx: number) => (
                        <div 
                          key={lidx} 
                          className="px-2 py-0.5 rounded bg-primary/25 text-primary text-[8px] font-black uppercase truncate tracking-wide"
                          title={`${l.employeeName} (${l.type})`}
                        >
                          {l.employeeName.split(' ')[0]}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Remarks/Justification input overlay Modal */}
      <Modal isOpen={isRemarksModalOpen} onClose={() => setIsRemarksModalOpen(false)} title={`${remarksAction === 'approve' ? 'Approve' : 'Reject'} Justification Remarks`}>
        <form onSubmit={handleRemarksAction} className="space-y-5">
          <div className="space-y-2 text-xs font-semibold text-slate-450">
            <label className="block text-slate-400 uppercase tracking-widest text-[9px] font-black ml-1">Optional remarks / reason details</label>
            <textarea 
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Provide a processing rationale or justification note..."
              className="w-full px-5 py-4 bg-slate-950/40 border border-white/5 focus:border-primary/30 rounded-2xl outline-none text-white transition-all placeholder:text-slate-650"
            />
          </div>

          <div className="flex gap-4 pt-2">
            <button 
              type="button" 
              onClick={() => setIsRemarksModalOpen(false)}
              className="flex-1 px-5 py-4 bg-white/5 border border-white/5 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-350 hover:bg-white/10 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className={cn(
                "flex-1 py-4 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg cursor-pointer",
                remarksAction === 'approve' ? "bg-emerald-500 shadow-emerald-500/20 hover:bg-emerald-600" : "bg-rose-500 shadow-rose-500/20 hover:bg-rose-600"
              )}
            >
              Submit Processing
            </button>
          </div>
        </form>
      </Modal>

      {/* Adjust Credit Modal */}
      <Modal isOpen={isBalanceAdjustOpen} onClose={() => setIsBalanceAdjustOpen(false)} title="Adjust Allowance Ledger">
        <form onSubmit={handleAdjustBalance} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Select Employee</label>
            <select 
              value={adjustEmployee}
              onChange={(e) => setAdjustEmployee(e.target.value)}
              className="w-full px-5 py-4 bg-slate-950/40 border border-white/5 focus:border-primary/30 rounded-2xl outline-none text-xs font-bold text-white cursor-pointer transition-all"
            >
              {leaveBalances.map(bal => (
                <option key={bal.employeeId} value={bal.name} className="bg-slate-900 text-white">{bal.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Allocation Tier</label>
            <select 
              value={adjustType}
              onChange={(e) => setAdjustType(e.target.value)}
              className="w-full px-5 py-4 bg-slate-950/40 border border-white/5 focus:border-primary/30 rounded-2xl outline-none text-xs font-bold text-white cursor-pointer transition-all"
            >
              <option value="Casual" className="bg-slate-900 text-white">Casual Leave (CL)</option>
              <option value="Sick" className="bg-slate-900 text-white">Sick Leave (SL)</option>
              <option value="Earned" className="bg-slate-900 text-white">Earned Leave (EL)</option>
              <option value="Paid" className="bg-slate-900 text-white">Paid Leave (PL)</option>
            </select>
          </div>

          <div className="space-y-2 text-xs font-semibold text-slate-450">
            <label className="block text-slate-400 uppercase tracking-widest text-[9px] font-black ml-1">Allowance Delta (e.g. +5 or -3)</label>
            <input 
              type="number"
              value={adjustValue}
              onChange={(e) => setAdjustValue(Number(e.target.value))}
              required
              className="w-full px-5 py-4 bg-slate-950/40 border border-white/5 focus:border-primary/30 rounded-2xl outline-none text-white transition-all text-xs"
            />
          </div>

          <div className="flex gap-4 pt-2">
            <button 
              type="button" 
              onClick={() => setIsBalanceAdjustOpen(false)}
              className="flex-1 px-5 py-4 bg-white/5 border border-white/5 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-350 hover:bg-white/10 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="flex-1 btn-primary py-4 rounded-2xl shadow-lg shadow-primary/25 font-black uppercase tracking-wider text-xs cursor-pointer"
            >
              Apply Delta Change
            </button>
          </div>
        </form>
      </Modal>

      {/* General Time-off apply Modal */}
      <Modal isOpen={isApplyModalOpen} onClose={() => setIsApplyModalOpen(false)} title="Apply Time-Off Allocation">
        <form onSubmit={handleApplyLeave} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Employee Profile</label>
            <select 
              value={employeeName}
              onChange={(e) => setEmployeeName(e.target.value)}
              className="w-full px-5 py-4 bg-slate-950/40 border border-white/5 focus:border-primary/30 rounded-2xl outline-none text-xs font-bold text-white cursor-pointer transition-all"
            >
              {leaveBalances.map(bal => (
                <option key={bal.employeeId} value={bal.name} className="bg-slate-900 text-white">{bal.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Time-Off Tier</label>
            <select 
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
              className="w-full px-5 py-4 bg-slate-950/40 border border-white/5 focus:border-primary/30 rounded-2xl outline-none text-xs font-bold text-white cursor-pointer transition-all"
            >
              <option value="Casual Leave" className="bg-slate-900 text-white">Casual Leave (CL)</option>
              <option value="Sick Leave" className="bg-slate-900 text-white">Sick Leave (SL)</option>
              <option value="Earned Leave" className="bg-slate-900 text-white">Earned Leave (EL)</option>
              <option value="Paid Leave" className="bg-slate-900 text-white">Paid Leave (PL)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Start Date</label>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full px-5 py-4 bg-slate-950/40 border border-white/5 focus:border-primary/30 rounded-2xl outline-none text-xs font-bold text-white transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">End Date</label>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="w-full px-5 py-4 bg-slate-950/40 border border-white/5 focus:border-primary/30 rounded-2xl outline-none text-xs font-bold text-white transition-all"
              />
            </div>
          </div>

          <div className="space-y-2 text-xs font-semibold text-slate-455">
            <label className="block text-slate-400 uppercase tracking-widest text-[9px] font-black ml-1">Reason for Request</label>
            <textarea 
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide a detailed justification for the time-off..."
              required
              className="w-full px-5 py-4 bg-slate-950/40 border border-white/5 focus:border-primary/30 rounded-2xl outline-none text-white transition-all placeholder:text-slate-650"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              type="button" 
              onClick={() => setIsApplyModalOpen(false)}
              className="flex-1 px-5 py-4 bg-white/5 border border-white/5 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-350 hover:bg-white/10 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="flex-1 btn-primary py-4 rounded-2xl shadow-lg shadow-primary/25 font-black uppercase tracking-wider text-xs cursor-pointer"
            >
              Submit Allocation
            </button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}
