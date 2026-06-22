"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import ConfirmModal from '@/components/ConfirmModal';
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
  BarChart3,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import Modal from '@/components/Modal';
import TableSkeleton from '@/components/TableSkeleton';
import { api } from '@/lib/api';
import { fetchAdminHolidays } from '@/services/settingsService';
import { 
  fetchAllLeaves, 
  fetchLeaveBalances, 
  createLeaveRequest, 
  updateLeaveStatus 
} from '@/services/leaveService';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip
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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'requests' | 'balances' | 'calendar'>('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  // Live Integration States
  const [leaveBalances, setLeaveBalances] = useState<any[]>([]);
  const [balancesCurrentPage, setBalancesCurrentPage] = useState(1);
  const [balancesTotalPages, setBalancesTotalPages] = useState(1);
  const [balancesCount, setBalancesCount] = useState(0);
  const [realEmployees, setRealEmployees] = useState<any[]>([]);
  const [holidays, setHolidays] = useState<any[]>([]);
  
  // Request logs pagination state
  const [requestsCurrentPage, setRequestsCurrentPage] = useState(1);
  const [requestsTotalPages, setRequestsTotalPages] = useState(1);
  const [requestsCount, setRequestsCount] = useState(0);

  // Remarks drawer state
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [remarks, setRemarks] = useState('');
  const [isRemarksModalOpen, setIsRemarksModalOpen] = useState(false);
  const [remarksAction, setRemarksAction] = useState<'approve' | 'reject'>('approve');

  // Form State for applying leave
  const [employeeName, setEmployeeName] = useState('');
  const [leaveType, setLeaveType] = useState('Casual Leave');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Balance adjust modal
  const [isBalanceAdjustOpen, setIsBalanceAdjustOpen] = useState(false);
  const [adjustEmployee, setAdjustEmployee] = useState('');
  const [adjustType, setAdjustType] = useState('Casual');
  const [adjustValue, setAdjustValue] = useState(0);

  // Helper function to safely format pagination numbers
  const formatPaginationNumber = (value: number | undefined | null): number => {
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  };

  const loadData = useCallback(async (requestsPage: number = 1, balancesPage: number = 1) => {
    setIsLoading(true);
    try {
      const [leaves, balances, empRes, holidaysRes] = await Promise.all([
        fetchAllLeaves(requestsPage, 20),
        fetchLeaveBalances(balancesPage, 20),
        api.get<{ success: boolean; employees: any[] }>('/api/admin/employees'),
        fetchAdminHolidays().catch(err => {
          console.error('Failed to fetch holidays:', err);
          return [];
        })
      ]);

      console.log('Loaded leaves:', leaves);
      console.log('Loaded balances:', balances);
      setLeaveRequests(leaves.leaves);
      setRequestsCurrentPage(leaves.page);
      setRequestsTotalPages(leaves.totalPages);
      setRequestsCount(leaves.count);
      setLeaveBalances(balances.balances);
      setBalancesCurrentPage(balances.page);
      setBalancesTotalPages(balances.totalPages);
      setBalancesCount(balances.count);

      if (empRes.data.success && empRes.data.employees.length > 0) {
        setRealEmployees(empRes.data.employees);
        setEmployeeName(`${empRes.data.employees[0].firstName} ${empRes.data.employees[0].lastName}`);
        setAdjustEmployee(`${empRes.data.employees[0].firstName} ${empRes.data.employees[0].lastName}`);
      }

      setHolidays(Array.isArray(holidaysRes) ? holidaysRes : []);
    } catch (err) {
      console.error('Failed to load leave admin data:', err);
      toast.error('Failed to load leave data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);


  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto-refresh leave requests every 30 seconds to show new submissions from mobile app
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Auto-refreshing leave requests...');
      loadData(requestsCurrentPage, balancesCurrentPage);
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [requestsCurrentPage, balancesCurrentPage, loadData]);

  // WebSocket connection for real-time leave balance updates

  // Handlers
  const handleRemarksAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    const apiStatus = remarksAction === 'approve' ? 'APPROVED' : 'REJECTED';

    try {
      await updateLeaveStatus(selectedRequest.id, { status: apiStatus, remarks });
      await loadData();
      setIsRemarksModalOpen(false);
      setSelectedRequest(null);
      setRemarks('');
      toast.success(`Leave request ${remarksAction === 'approve' ? 'approved' : 'rejected'} successfully!`);
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : 'Operation failed');
    }
  };

  const openRemarksModal = (req: any, action: 'approve' | 'reject') => {
    setSelectedRequest(req);
    setRemarksAction(action);
    setIsRemarksModalOpen(true);
  };

  const handleDownloadLeaveReport = async (employeeId?: number | string, employeeName?: string) => {
    try {
      // Show loading state
      const response = await api.get('/api/admin/leaves/report/download', {
        params: employeeId ? { employeeId } : undefined,
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const namePart = employeeName ? employeeName.replace(/\s+/g, '-').toLowerCase() : 'all-employees';
      link.setAttribute('download', `leave-report-${namePart}-${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      // Show success message
      toast.success('Leave report downloaded successfully!');
    } catch (error: any) {
      console.error('Failed to download leave report:', error);
      // When responseType is 'blob', server JSON errors arrive as a Blob — parse it for a useful message
      let message = 'Failed to download leave report. Please try again.';
      const data = error?.response?.data;
      if (data instanceof Blob) {
        try {
          const text = await data.text();
          const parsed = JSON.parse(text);
          if (parsed?.message) message = parsed.message;
        } catch {
          // keep default message
        }
      } else if (error instanceof Error && error.message) {
        message = error.message;
      }
      toast.error(message);
    }
  };

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason) return;

    try {
      const targetEmp = realEmployees.find(emp => `${emp.firstName} ${emp.lastName}` === employeeName) || realEmployees[0];
      if (!targetEmp) throw new Error('No registered employee found.');

      await createLeaveRequest({
        employeeId: targetEmp.id,
        type: leaveType,
        fromDate: startDate,
        toDate: endDate,
        reason,
      });

      await loadData();
      toast.success('Leave request created successfully!');

      setIsApplyModalOpen(false);
      setStartDate('');
      setEndDate('');
      setReason('');
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : 'Failed to apply leave');
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
    setIsResetConfirmOpen(true);
  };

  const handleResetConfirm = () => {
    setLeaveBalances(prev => prev.map(bal => ({
      ...bal,
      casual: 12,
      sick: 10,
      earned: 15,
      paid: 10
    })));
    setIsResetConfirmOpen(false);
    toast.success('All leave balances reset to standard allocations');
  };

  const exportReport = (format: 'pdf' | 'excel') => {
    toast.info(`Exporting Leave Utilization Report in ${format.toUpperCase()} format...`);
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

  // Chart data calculation - dynamic based on actual leave data
  const chartData = useMemo(() => {
    const monthlyStats: Record<string, { cl: number; sl: number; el: number }> = {};
    const currentYear = new Date().getFullYear();

    // Initialize all months for the current year
    const allMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    allMonths.forEach(month => {
      monthlyStats[month] = { cl: 0, sl: 0, el: 0 };
    });

    leaveRequests.forEach(req => {
      if (req.status === 'Approved' || req.status === 'APPROVED') {
        const date = new Date(req.startDate);
        if (!isNaN(date.getTime()) && date.getFullYear() === currentYear) {
          const monthName = date.toLocaleDateString('en-US', { month: 'short' });
          if (monthlyStats[monthName]) {
            if (req.type === 'Casual Leave') monthlyStats[monthName].cl += 1;
            else if (req.type === 'Sick Leave') monthlyStats[monthName].sl += 1;
            else if (req.type === 'Earned Leave') monthlyStats[monthName].el += 1;
            else monthlyStats[monthName].el += 1; // Count other types as earned for visualization
          }
        }
      }
    });

    // Filter to only show months that have data or are in the current year up to current month
    const currentMonth = new Date().getMonth();
    const result = Object.entries(monthlyStats)
      .filter(([name, val]) => {
        const monthIndex = allMonths.indexOf(name);
        // Show months up to current month, or any month that has data
        return monthIndex <= currentMonth || (val.cl > 0 || val.sl > 0 || val.el > 0);
      })
      .map(([name, val]) => ({
        name,
        'Casual Leave': val.cl,
        'Sick Leave': val.sl,
        'Earned Leave': val.el
      }));

    console.log('Chart data calculated:', result);
    return result;
  }, [leaveRequests]);

  // Filter upcoming holidays (future dates only)
  const upcomingHolidays = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return holidays
      .filter(h => {
        const holidayDate = new Date(h.date);
        holidayDate.setHours(0, 0, 0, 0);
        return holidayDate >= today;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [holidays]);

  // Calendar visualizer matrix days (May 2026 for showcase)
  const calendarDays = useMemo(() => {
    const totalDays = 31;
    const startOffset = 5; // Friday starting May 1st 2026
    const days = [];

    // Complete the calendar grid cells to complete rows of 7
    const totalCells = Math.ceil((totalDays + startOffset) / 7) * 7;

    for (let i = 1 - startOffset; i <= totalCells - startOffset; i++) {
      if (i <= 0 || i > totalDays) {
        days.push({ day: 0, date: '', isHoliday: false, leaves: [] });
      } else {
        const dateStr = `2026-05-${i.toString().padStart(2, '0')}`;
        
        // Find if this date is a holiday in the database
        const holiday = holidays.find(h => {
          const [year, month, day] = h.date.split('-').map(Number);
          return year === 2026 && 
                 month === 5 && // May is month 5
                 day === i;
        });

        const activeLeaves = leaveRequests.filter(req => {
          if (req.status !== 'Approved') return false;
          const start = new Date(req.startDate);
          const end = new Date(req.endDate);
          const currentDayDate = new Date(2026, 4, i);
          
          start.setHours(0, 0, 0, 0);
          end.setHours(0, 0, 0, 0);
          currentDayDate.setHours(0, 0, 0, 0);
          
          return currentDayDate >= start && currentDayDate <= end;
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
  }, [leaveRequests, holidays]);


  return (
    <>
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8 pb-16 text-text-primary animate-fadeIn"
    >
      {/* Title Header Command hub */}
      <motion.div variants={itemVariants} className="relative overflow-hidden rounded-sm border border-border bg-surface dark:bg-gradient-to-br dark:from-slate-900/90 dark:to-slate-950/95 backdrop-blur-xl p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div className="absolute -top-12 -right-12 w-96 h-96 bg-primary/10 rounded-full filter blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute -bottom-24 -left-12 w-80 h-80 bg-emerald-500/5 rounded-full filter blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/20 to-emerald-500/10 border border-primary/30 text-primary text-[10px] font-black px-3.5 py-1.5 rounded-full uppercase tracking-widest">
            <CalendarRange size={12} className="text-primary animate-pulse" />
            Corporate Time-Off Governance
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-text-primary tracking-tight leading-none">
            Leave <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-teal-400 to-emerald-400">Governance</span>
          </h1>
          <p className="text-xs md:text-sm text-text-secondary font-medium max-w-xl leading-relaxed">
            Orchestrate employee time-off allocations, ledger records, monthly calendars, and holiday policies.
          </p>
        </div>

        <div className="relative z-10 shrink-0 flex items-center gap-3">
          <button 
            onClick={() => handleDownloadLeaveReport()}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6.5 py-4 shrink-0 rounded-sm text-xs font-black uppercase tracking-wider justify-center transition-all duration-300"
          >
            <Download size={18} />
            Download All Report
          </button>
          <button 
            onClick={() => setIsApplyModalOpen(true)}
            className="btn-primary px-6.5 py-4 shrink-0 rounded-sm text-xs font-black uppercase tracking-wider justify-center"
          >
            <Plus size={18} />
            Apply Time-Off
          </button>
        </div>
      </motion.div>

      {/* Tab Navigation Controls */}
      <motion.div variants={itemVariants} className="flex overflow-x-auto gap-2 p-1.5 bg-surface-variant/30 border border-border rounded-sm no-scrollbar w-fit max-w-full">
        {[
          { id: 'dashboard', label: 'Dashboard Overview', icon: BarChart3 },
          { id: 'requests', label: 'Request Logs', icon: FileText },
          { id: 'balances', label: 'Balance Ledger', icon: Layers },
          { id: 'calendar', label: 'Ecosystem Calendar', icon: CalendarIcon },
        ].map((tab) => {
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-5 py-3 rounded-sm text-xs font-bold uppercase tracking-wider shrink-0 whitespace-nowrap transition-all duration-300 cursor-pointer",
                isSelected 
                  ? "bg-primary text-white border-primary/30" 
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-variant/30"
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
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="relative overflow-hidden border border-border bg-surface p-6 flex items-center gap-5 rounded-sm">
                    <div className="w-14 h-14 rounded-sm bg-surface-variant animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-surface-variant rounded animate-pulse w-3/4" />
                      <div className="h-8 bg-surface-variant rounded animate-pulse w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
            {/* KPI Counters Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { label: 'Total Leave Requests', value: totalRequests, icon: FileText, color: 'from-blue-500/20 to-blue-500/5 border-blue-500/20 text-blue-500 dark:text-blue-400', glowBgClass: 'bg-blue-500/5 group-hover:bg-blue-500/10' },
                { label: 'Pending Approvals', value: pendingRequests, icon: Clock, color: 'from-amber-500/20 to-amber-500/5 border-amber-500/20 text-amber-500 dark:text-amber-400', glowBgClass: 'bg-amber-500/5 group-hover:bg-amber-500/10' },
                { label: 'Approved Requests', value: approvedRequests, icon: CheckCircle2, color: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/20 text-emerald-500 dark:text-emerald-400', glowBgClass: 'bg-emerald-500/5 group-hover:bg-emerald-500/10' },
                { label: 'Upcoming Holidays', value: upcomingHolidays.length, icon: CalendarIcon, color: 'from-rose-500/20 to-rose-500/5 border-rose-500/20 text-rose-500 dark:text-rose-455', glowBgClass: 'bg-rose-500/5 group-hover:bg-rose-500/10' },
              ].map((stat, i) => (
                <div 
                  key={i}
                  className="relative overflow-hidden border border-border bg-surface hover:bg-surface-variant/30 p-6 flex items-center gap-5 rounded-sm group transition-all duration-300"
                >
                  <div className={cn("absolute -right-8 -bottom-8 w-24 h-24 rounded-full filter blur-xl pointer-events-none transition-all duration-500", stat.glowBgClass)} />
                  <div 
                    className={cn("w-14 h-14 rounded-sm flex items-center justify-center shrink-0 bg-gradient-to-br border", stat.color)}
                  >
                    <stat.icon size={24} className="group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-text-secondary uppercase tracking-widest leading-none">{stat.label}</p>
                    <p className="text-3xl font-black text-text-primary mt-1.5 tracking-tight">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Dashboard Analytics & Holiday List */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Analytics Graph */}
              <div className="xl:col-span-2 relative overflow-hidden rounded-sm border border-border bg-surface p-6 sm:p-8">
                <div className="flex items-center justify-between gap-4 mb-6">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary mb-1">Time-off distributions</p>
                    <h3 className="text-lg font-black text-text-primary">Monthly Leave Utilization Trends</h3>
                  </div>
                  <TrendingUp className="text-primary w-5 h-5" />
                </div>
                
                <div className="h-72 w-full mt-4">
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '4px' }}
                          labelStyle={{ color: 'var(--text-primary)', fontWeight: 'bold' }}
                          itemStyle={{ color: 'var(--text-secondary)' }}
                        />
                        <Bar dataKey="Casual Leave" fill="#F4B860" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Sick Leave" fill="#EF4444" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Earned Leave" fill="#3BA38B" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-text-secondary text-xs font-semibold">
                      No leave data available for chart
                    </div>
                  )}
                </div>
              </div>

              {/* Holiday Quicklist */}
              <div className="relative overflow-hidden rounded-sm border border-border bg-surface p-6 sm:p-8 flex flex-col justify-between">
                <div className="space-y-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary mb-1">Corporate calendar</p>
                      <h3 className="text-lg font-black text-text-primary">Upcoming Holidays</h3>
                    </div>
                    <CalendarIcon className="text-rose-500 w-5 h-5 animate-pulse" />
                  </div>

                  <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                    {upcomingHolidays.length > 0 ? (
                      upcomingHolidays.slice(0, 4).map((h) => (
                        <div key={h.id} className="flex items-center justify-between p-3.5 bg-surface-variant/40 border border-border/50 rounded-sm hover:border-rose-500/20 transition-all">
                          <div>
                            <span className="text-xs font-bold text-text-primary block">{h.name}</span>
                            <span className="text-[10px] text-text-secondary font-semibold mt-1 block">
                              {(() => {
                                const [year, month, day] = h.date.split('-').map(Number);
                                return new Date(year, month - 1, day).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
                              })()}
                            </span>
                          </div>
                          <span className="inline-flex items-center text-[9px] font-black uppercase tracking-wider text-rose-500 dark:text-rose-450 bg-rose-500/10 px-2 py-0.5 rounded-sm border border-rose-500/20">
                            {h.type}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-xs font-bold text-text-secondary/50 py-8">
                        No upcoming holidays scheduled
                      </div>
                    )}
                  </div>
                </div>

                <button 
                  onClick={() => setActiveTab('calendar')}
                  className="w-full mt-6 py-3 border border-border hover:border-primary/20 bg-surface-variant/50 hover:bg-primary/10 rounded-sm text-[10px] font-black uppercase tracking-wider text-text-secondary hover:text-primary transition-all duration-300 cursor-pointer"
                >
                  View Complete Calendar
                </button>
              </div>
            </div>
            </>
            )}
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
            <div className="flex flex-col xl:flex-row gap-4 items-center justify-between border border-border bg-surface p-4.5 rounded-sm">
              <div className="relative w-full xl:w-96 group">
                <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-primary transition-colors w-5 h-5" />
                <input 
                  type="text" 
                  placeholder="Search time-off justification..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-13 pr-4 py-3.5 bg-surface-variant/40 border border-border hover:border-border-hover focus:border-primary/30 rounded-sm outline-none transition-all text-xs font-semibold text-text-primary placeholder:text-text-secondary/50"
                />
              </div>
              <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                <select 
                  value={filterType} 
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full sm:w-48 bg-surface-variant/40 border border-border hover:border-border-hover focus:border-primary/30 rounded-sm px-4 py-3.5 text-xs outline-none font-bold text-text-secondary hover:text-text-primary transition-all cursor-pointer"
                >
                  <option value="All" className="bg-surface text-text-primary">All Leave Types</option>
                  {LEAVE_TYPES_CONFIG.map(type => (
                    <option key={type.id} value={type.name} className="bg-surface text-text-primary">{type.name}</option>
                  ))}
                </select>

                <select 
                  value={filterStatus} 
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full sm:w-48 bg-surface-variant/40 border border-border hover:border-border-hover focus:border-primary/30 rounded-sm px-4 py-3.5 text-xs outline-none font-bold text-text-secondary hover:text-text-primary transition-all cursor-pointer"
                >
                  <option value="All" className="bg-surface text-text-primary">All Statuses</option>
                  <option value="Pending" className="bg-surface text-text-primary">Pending Action</option>
                  <option value="Approved" className="bg-surface text-text-primary">Approved</option>
                  <option value="Rejected" className="bg-surface text-text-primary">Rejected</option>
                </select>

                <button 
                  onClick={() => exportReport('excel')}
                  className="flex items-center gap-2 px-5 py-3.5 bg-surface-variant/50 hover:bg-surface-variant/80 border border-border rounded-sm text-xs font-bold text-text-secondary hover:text-text-primary transition-all cursor-pointer justify-center w-full sm:w-auto"
                >
                  <Download size={14} />
                  Export Sheet
                </button>
              </div>
            </div>

            {/* Requests Table view */}
            {isLoading ? (
              <div className="relative overflow-hidden rounded-sm border border-border bg-surface p-8">
                <TableSkeleton rows={4} columns={6} />
              </div>
            ) : (
              <div className="relative overflow-hidden rounded-sm border border-border bg-surface">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-variant/50 border-b border-border">
                        <th className="px-6 py-5 text-[10px] font-black text-text-secondary uppercase tracking-widest">Requester</th>
                        <th className="px-6 py-5 text-[10px] font-black text-text-secondary uppercase tracking-widest">Time-Off Tier</th>
                        <th className="px-6 py-5 text-[10px] font-black text-text-secondary uppercase tracking-widest text-center">Period Duration</th>
                        <th className="px-6 py-5 text-[10px] font-black text-text-secondary uppercase tracking-widest">Reason / Remarks</th>
                        <th className="px-6 py-5 text-[10px] font-black text-text-secondary uppercase tracking-widest">Status</th>
                        <th className="px-6 py-5 text-[10px] font-black text-text-secondary uppercase tracking-widest text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      <AnimatePresence mode="popLayout">
                        {filteredRequests.length > 0 ? (
                          filteredRequests.map((req) => (
                            <motion.tr 
                              layout
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              key={req.id}
                              className="hover:bg-surface-variant/30 transition-colors group cursor-default"
                            >
                              <td className="px-6 py-5 font-bold text-text-primary group-hover:text-primary transition-colors tracking-tight">
                                {req.employeeName}
                              </td>
                              <td className="px-6 py-5">
                                <span className="text-xs font-bold text-text-secondary">{req.type}</span>
                              </td>
                              <td className="px-6 py-5 text-center">
                                <span className="font-mono text-[10px] font-black text-text-secondary bg-surface-variant border border-border px-3 py-1.5 rounded-sm">
                                  {req.startDate} to {req.endDate}
                                </span>
                              </td>
                              <td className="px-6 py-5 max-w-xs">
                                <p className="font-medium text-text-secondary text-xs truncate" title={req.reason}>{req.reason}</p>
                                {req.remarks && (
                                  <p className="text-[10px] text-text-secondary/65 mt-1 italic">Remarks: {req.remarks}</p>
                                )}
                              </td>
                              <td className="px-6 py-5">
                                <span className={cn(
                                  "px-3.5 py-1.5 rounded-sm text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1.5 border",
                                  req.status === 'Approved' ? "bg-emerald-500/10 text-emerald-555 dark:text-emerald-400 border-emerald-500/20" : 
                                  req.status === 'Rejected' ? "bg-rose-500/10 text-rose-555 dark:text-rose-400 border-rose-500/20" : "bg-amber-500/10 text-amber-555 dark:text-amber-400 border-amber-500/20"
                                )}>
                                  <span className={cn(
                                    "w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentColor]",
                                    req.status === 'Approved' ? "bg-emerald-500 dark:bg-emerald-400" : 
                                    req.status === 'Rejected' ? "bg-rose-500 dark:bg-rose-400" : "bg-amber-500 dark:bg-amber-400 animate-pulse"
                                  )} />
                                  {req.status}
                                </span>
                              </td>
                              <td className="px-6 py-5 text-right">
                                {req.status === 'Pending' ? (
                                  <div className="flex items-center justify-end gap-2">
                                    <button 
                                      onClick={() => openRemarksModal(req, 'approve')}
                                      className="p-2.5 bg-emerald-500/10 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 rounded-sm text-emerald-555 dark:text-emerald-400 transition-all active:scale-95 cursor-pointer"
                                      title="Approve time-off"
                                    >
                                      <Check size={16} />
                                    </button>
                                    <button 
                                      onClick={() => openRemarksModal(req, 'reject')}
                                      className="p-2.5 bg-rose-500/10 hover:bg-rose-500 hover:text-white border border-rose-500/20 rounded-sm text-rose-555 dark:text-rose-400 transition-all active:scale-95 cursor-pointer"
                                      title="Reject time-off"
                                    >
                                      <X size={16} />
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-[10px] font-black uppercase text-text-secondary/65 select-none tracking-wider">Processed</span>
                                )}
                              </td>
                            </motion.tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="px-6 py-12 text-center text-xs font-bold text-text-secondary uppercase tracking-widest bg-surface">
                              No request logs found.
                            </td>
                          </tr>
                        )}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination Controls */}
                <div className="p-4.5 bg-surface border border-border rounded-sm flex flex-col gap-3">
                  <div className="text-xs text-text-secondary font-semibold text-center">
                    Showing <span className="text-text-primary font-bold">{formatPaginationNumber(Math.min((requestsCurrentPage - 1) * 20 + 1, requestsCount))}</span> to{' '}
                    <span className="text-text-primary font-bold">{formatPaginationNumber(Math.min(requestsCurrentPage * 20, requestsCount))}</span> of{' '}
                    <span className="text-text-primary font-bold">{formatPaginationNumber(requestsCount)}</span> requests
                  </div>
                  {requestsTotalPages > 1 && (
                    <div className="flex items-center justify-between gap-2 mt-1">
                      <button
                        type="button"
                        onClick={() => loadData(requestsCurrentPage - 1, balancesCurrentPage)}
                        disabled={requestsCurrentPage === 1}
                        className="flex-1 py-2 bg-surface hover:bg-surface-variant text-text-primary border border-border rounded-sm text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <ChevronLeft size={14} />
                        Prev
                      </button>
                      <span className="text-xs text-text-secondary px-3 font-semibold shrink-0">
                        Page {requestsCurrentPage} of {requestsTotalPages}
                      </span>
                      <button
                        type="button"
                        onClick={() => loadData(requestsCurrentPage + 1, balancesCurrentPage)}
                        disabled={requestsCurrentPage === requestsTotalPages}
                        className="flex-1 py-2 bg-surface hover:bg-surface-variant text-text-primary border border-border rounded-sm text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        Next
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
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
            <div className="flex items-center justify-between gap-4 p-4.5 border border-border bg-surface rounded-sm">
              <div>
                <h3 className="text-sm font-black text-text-primary uppercase tracking-widest">Allowance Adjustment Operations</h3>
                <p className="text-xs text-text-secondary mt-1 font-medium leading-relaxed">Modify individual employee allocation credits or standard parameters.</p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsBalanceAdjustOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4.5 py-3 border border-border hover:border-primary/20 bg-surface-variant/50 hover:bg-primary/10 rounded-sm text-[10px] font-black uppercase tracking-wider text-text-secondary hover:text-primary transition-all cursor-pointer"
                >
                  <Plus size={13} />
                  Adjust Credit
                </button>
                <button 
                  onClick={resetAllBalances}
                  className="inline-flex items-center gap-1.5 px-4.5 py-3 border border-rose-500/20 hover:border-rose-500/30 bg-rose-500/5 hover:bg-rose-500/10 rounded-sm text-[10px] font-black uppercase tracking-wider text-rose-500 dark:text-rose-400 hover:text-rose-600 dark:hover:text-rose-350 transition-all cursor-pointer"
                >
                  <Trash2 size={13} />
                  Reset Ledger
                </button>
              </div>
            </div>

            {/* Leave Balance Sheet Table */}
            <div className="relative overflow-hidden rounded-sm border border-border bg-surface">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-variant/50 border-b border-border">
                      <th className="px-6 py-5 text-[10px] font-black text-text-secondary uppercase tracking-widest">Employee Details</th>
                      <th className="px-6 py-5 text-[10px] font-black text-text-secondary uppercase tracking-widest text-center">Casual Leave</th>
                      <th className="px-6 py-5 text-[10px] font-black text-text-secondary uppercase tracking-widest text-center">Sick Leave</th>
                      <th className="px-6 py-5 text-[10px] font-black text-text-secondary uppercase tracking-widest text-center">Earned Leave</th>
                      <th className="px-6 py-5 text-[10px] font-black text-text-secondary uppercase tracking-widest text-center">Paid Allowances</th>
                      <th className="px-6 py-5 text-[10px] font-black text-text-secondary uppercase tracking-widest text-center">Status</th>
                      <th className="px-6 py-5 text-[10px] font-black text-text-secondary uppercase tracking-widest text-center">Report</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {leaveBalances.map((bal) => (
                      <tr key={bal.employeeId} className="hover:bg-surface-variant/30 transition-colors">
                        <td className="px-6 py-4.5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-sm bg-primary/20 text-primary flex items-center justify-center font-black text-xs border border-primary/20">
                              {bal.name.substring(0, 2).toUpperCase()}
                            </div>
                            <span className="font-bold text-text-primary">{bal.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4.5 text-center font-bold text-amber-500 dark:text-amber-400 tabular-nums">{bal.casual}</td>
                        <td className="px-6 py-4.5 text-center font-bold text-rose-500 dark:text-rose-455 tabular-nums">{bal.sick}</td>
                        <td className="px-6 py-4.5 text-center font-bold text-primary tabular-nums">{bal.earned}</td>
                        <td className="px-6 py-4.5 text-center font-bold text-violet-500 dark:text-violet-400 tabular-nums">{bal.paid}</td>
                        <td className="px-6 py-4.5 text-center">
                          <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-emerald-500 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-sm">
                            <UserCheck size={10} />
                            Compliant
                          </span>
                        </td>
                        <td className="px-6 py-4.5 text-center">
                          <button
                            onClick={() => handleDownloadLeaveReport(bal.employeeId, bal.name)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500/10 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 rounded-sm text-[10px] font-black uppercase tracking-wider text-emerald-500 dark:text-emerald-400 transition-all cursor-pointer active:scale-95"
                            title={`Download leave report for ${bal.name}`}
                          >
                            <Download size={13} />
                            Download
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination Controls */}
              <div className="p-4.5 bg-surface border border-border rounded-sm flex flex-col gap-3">
                <div className="text-xs text-text-secondary font-semibold text-center">
                  Showing <span className="text-text-primary font-bold">{formatPaginationNumber(Math.min((balancesCurrentPage - 1) * 20 + 1, balancesCount))}</span> to{' '}
                  <span className="text-text-primary font-bold">{formatPaginationNumber(Math.min(balancesCurrentPage * 20, balancesCount))}</span> of{' '}
                  <span className="text-text-primary font-bold">{formatPaginationNumber(balancesCount)}</span> employees
                </div>
                {balancesTotalPages > 1 && (
                  <div className="flex items-center justify-between gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => loadData(requestsCurrentPage, balancesCurrentPage - 1)}
                      disabled={balancesCurrentPage === 1}
                      className="flex-1 py-2 bg-surface hover:bg-surface-variant text-text-primary border border-border rounded-sm text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <ChevronLeft size={14} />
                      Prev
                    </button>
                    <span className="text-xs text-text-secondary px-3 font-semibold shrink-0">
                      Page {balancesCurrentPage} of {balancesTotalPages}
                    </span>
                    <button
                      type="button"
                      onClick={() => loadData(requestsCurrentPage, balancesCurrentPage + 1)}
                      disabled={balancesCurrentPage === balancesTotalPages}
                      className="flex-1 py-2 bg-surface hover:bg-surface-variant text-text-primary border border-border rounded-sm text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      Next
                      <ChevronRight size={14} />
                    </button>
                  </div>
                )}
              </div>
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
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 border border-border bg-surface rounded-sm">
              <div>
                <h3 className="text-md font-black text-text-primary tracking-tight">May 2026</h3>
                <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider mt-0.5">Corporate Holiday & Leaves Overview</p>
              </div>
              <div className="flex flex-wrap gap-2.5">
                <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-rose-500 dark:text-rose-455 bg-rose-500/10 px-2.5 py-1.5 rounded-sm border border-rose-500/20">Holiday</span>
                <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1.5 rounded-sm border border-primary/20">Approved Leave</span>
              </div>
            </div>

            {/* Grid monthly layout wrapped in scrollable container to prevent cutting off */}
            <div className="overflow-x-auto pb-4 no-scrollbar">
              <div className="grid grid-cols-7 gap-2.5 min-w-[768px]">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(w => (
                  <div key={w} className="text-center text-[10px] font-black uppercase tracking-widest text-text-secondary py-2">{w}</div>
                ))}

                {calendarDays.map((day, idx) => {
                  const hasLeave = day.leaves.length > 0;
                  return (
                    <div 
                      key={idx}
                      className={cn(
                        "min-h-[6.5rem] p-3 rounded-sm border transition-all flex flex-col justify-between",
                        day.day === 0 ? "border-transparent bg-transparent select-none opacity-0" :
                        day.isHoliday ? "border-rose-500/30 bg-rose-500/5" :
                        hasLeave ? "border-primary/20 bg-primary/5" : "border-border bg-surface hover:bg-surface-variant/30"
                      )}
                    >
                      <div className="flex justify-between items-start">
                        <span className={cn(
                          "text-xs font-black",
                          day.isHoliday ? "text-rose-500 dark:text-rose-450" :
                          hasLeave ? "text-primary" : "text-text-secondary"
                        )}>{day.day || ''}</span>
                      </div>

                      <div className="space-y-1.5">
                        {day.isHoliday && (
                          <p className="text-[8px] font-black uppercase tracking-wider text-rose-500 leading-relaxed truncate" title={day.holidayName}>{day.holidayName}</p>
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
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* Remarks/Justification input overlay Modal */}
      <Modal isOpen={isRemarksModalOpen} onClose={() => setIsRemarksModalOpen(false)} title={`${remarksAction === 'approve' ? 'Approve' : 'Reject'} Justification Remarks`}>
        <form onSubmit={handleRemarksAction} className="space-y-5">
          <div className="space-y-2 text-xs font-semibold text-text-secondary">
            <label className="block text-text-secondary uppercase tracking-widest text-[9px] font-black ml-1">Optional remarks / reason details</label>
            <textarea 
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Provide a processing rationale or justification note..."
              className="w-full px-5 py-4 bg-surface-variant border border-border focus:border-primary/30 rounded-sm outline-none text-text-primary transition-all placeholder:text-text-secondary/50"
            />
          </div>

          <div className="flex gap-4 pt-2">
            <button 
              type="button" 
              onClick={() => setIsRemarksModalOpen(false)}
              className="flex-1 px-5 py-4 bg-surface-variant/50 border border-border rounded-sm text-xs font-black uppercase tracking-widest text-text-secondary hover:bg-surface-variant/80 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className={cn(
                "flex-1 py-4 text-white rounded-sm text-xs font-black uppercase tracking-widest cursor-pointer",
                remarksAction === 'approve' ? "bg-emerald-500 hover:bg-emerald-600" : "bg-rose-500 hover:bg-rose-600"
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
            <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Select Employee</label>
            <select 
              value={adjustEmployee}
              onChange={(e) => setAdjustEmployee(e.target.value)}
              className="w-full px-5 py-4 bg-surface-variant border border-border focus:border-primary/30 rounded-sm outline-none text-xs font-bold text-text-primary cursor-pointer transition-all"
            >
              {leaveBalances.map(bal => (
                <option key={bal.employeeId} value={bal.name} className="bg-surface text-text-primary">{bal.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Allocation Tier</label>
            <select 
              value={adjustType}
              onChange={(e) => setAdjustType(e.target.value)}
              className="w-full px-5 py-4 bg-surface-variant border border-border focus:border-primary/30 rounded-sm outline-none text-xs font-bold text-text-primary cursor-pointer transition-all"
            >
              {LEAVE_TYPES_CONFIG.map(type => (
                <option key={type.id} value={type.name.replace(' Leave', '')} className="bg-surface text-text-primary">{type.name} ({type.code})</option>
              ))}
            </select>
          </div>

          <div className="space-y-2 text-xs font-semibold text-text-secondary">
            <label className="block text-text-secondary uppercase tracking-widest text-[9px] font-black ml-1">Allowance Delta (e.g. +5 or -3)</label>
            <input 
              type="number"
              value={adjustValue}
              onChange={(e) => setAdjustValue(Number(e.target.value))}
              required
              className="w-full px-5 py-4 bg-surface-variant border border-border focus:border-primary/30 rounded-sm outline-none text-text-primary transition-all text-xs"
            />
          </div>

          <div className="flex gap-4 pt-2">
            <button 
              type="button" 
              onClick={() => setIsBalanceAdjustOpen(false)}
              className="flex-1 px-5 py-4 bg-surface-variant/50 border border-border rounded-sm text-xs font-black uppercase tracking-widest text-text-secondary hover:bg-surface-variant/80 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="flex-1 btn-primary py-4 rounded-sm font-black uppercase tracking-wider text-xs cursor-pointer"
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
            <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Employee Profile</label>
            <select 
              value={employeeName}
              onChange={(e) => setEmployeeName(e.target.value)}
              className="w-full px-5 py-4 bg-surface-variant border border-border focus:border-primary/30 rounded-sm outline-none text-xs font-bold text-text-primary cursor-pointer transition-all"
            >
              {leaveBalances.map(bal => (
                <option key={bal.employeeId} value={bal.name} className="bg-surface text-text-primary">{bal.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Time-Off Tier</label>
            <select 
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
              className="w-full px-5 py-4 bg-surface-variant border border-border focus:border-primary/30 rounded-sm outline-none text-xs font-bold text-text-primary cursor-pointer transition-all"
            >
              {LEAVE_TYPES_CONFIG.map(type => (
                <option key={type.id} value={type.name} className="bg-surface text-text-primary">{type.name} ({type.code})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Start Date</label>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                onClick={(e) => {
                  try {
                    e.currentTarget.showPicker();
                  } catch (err) {}
                }}
                required
                className="w-full px-5 py-4 bg-surface-variant border border-border focus:border-primary/30 rounded-sm outline-none text-xs font-bold text-text-primary transition-all cursor-pointer"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">End Date</label>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                onClick={(e) => {
                  try {
                    e.currentTarget.showPicker();
                  } catch (err) {}
                }}
                required
                className="w-full px-5 py-4 bg-surface-variant border border-border focus:border-primary/30 rounded-sm outline-none text-xs font-bold text-text-primary transition-all cursor-pointer"
              />
            </div>
          </div>

          <div className="space-y-2 text-xs font-semibold text-text-secondary">
            <label className="block text-text-secondary uppercase tracking-widest text-[9px] font-black ml-1">Reason for Request</label>
            <textarea 
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide a detailed justification for the time-off..."
              required
              className="w-full px-5 py-4 bg-surface-variant border border-border focus:border-primary/30 rounded-sm outline-none text-text-primary transition-all placeholder:text-text-secondary/50"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              type="button" 
              onClick={() => setIsApplyModalOpen(false)}
              className="flex-1 px-5 py-4 bg-surface-variant/50 border border-border rounded-sm text-xs font-black uppercase tracking-widest text-text-secondary hover:bg-surface-variant/80 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="flex-1 btn-primary py-4 rounded-sm font-black uppercase tracking-wider text-xs cursor-pointer"
            >
              Submit Allocation
            </button>
          </div>
        </form>
      </Modal>
    </motion.div>

    <ConfirmModal
      isOpen={isResetConfirmOpen}
      onClose={() => setIsResetConfirmOpen(false)}
      onConfirm={handleResetConfirm}
      title="Reset All Leave Balances"
      message="Are you sure you want to reset all employee leave balances to annual standard allocations? This action cannot be undone."
      confirmText="Reset Balances"
      cancelText="Cancel"
    />
    </>
  );
}
