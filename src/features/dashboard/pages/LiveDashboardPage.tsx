'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  Clock, 
  Calendar, 
  Coffee, 
  MapPin, 
  AlertTriangle,
  RefreshCw,
  Search,
  UserCheck,
  UserX,
  X,
  Play
} from 'lucide-react';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import { api } from '@/lib/api';
import Modal from '@/components/Modal';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { y: 15, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 100, damping: 15 }
  }
};

interface EmployeeDetail {
  id: number;
  firstName: string;
  lastName: string;
  employeeCode: string;
  designation: string;
  officeName: string;
  breakType?: string;
  startAt?: string;
}

interface LiveStats {
  present: number;
  absent: number;
  onLeave: number;
  late: number;
  breaks: {
    lunch: number;
    tea: number;
    personal: number;
    meeting: number;
  };
  pendingLeaves: number;
  pendingShiftRequests: number;
  branchWise: {
    branch: string;
    present: number;
    absent: number;
    onBreak: number;
  }[];
  details: {
    present: EmployeeDetail[];
    absent: EmployeeDetail[];
    onLeave: EmployeeDetail[];
    late: EmployeeDetail[];
    breaks: {
      lunch: EmployeeDetail[];
      tea: EmployeeDetail[];
      personal: EmployeeDetail[];
      meeting: EmployeeDetail[];
    };
  };
}

export default function LiveDashboardPage() {
  const [stats, setStats] = useState<LiveStats | null>(null);
  const [upcomingLeaves, setUpcomingLeaves] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');
  
  // Drill-down Modal State
  const [activeDetailType, setActiveDetailType] = useState<string | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailTitle, setDetailTitle] = useState('');
  const [detailList, setDetailList] = useState<EmployeeDetail[]>([]);
  const [detailSearch, setDetailSearch] = useState('');

  const fetchLiveStats = useCallback(async (showRefreshingIndicator = false) => {
    if (showRefreshingIndicator) setIsRefreshing(true);
    try {
      const [statsRes, upcomingRes] = await Promise.all([
        api.get<{ success: boolean; stats: LiveStats }>('/api/admin/dashboard/live'),
        api.get<{ success: boolean; leaves: any[] }>('/api/admin/leaves/upcoming')
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
        setError('');
      }

      if (upcomingRes.data.success) {
        setUpcomingLeaves(upcomingRes.data.leaves);
      }
    } catch (err) {
      console.error('Error fetching live stats:', err);
      setError('Failed to fetch live stats. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Polling every 30 seconds
  useEffect(() => {
    fetchLiveStats();
    const interval = setInterval(() => {
      fetchLiveStats();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchLiveStats]);

  const handleOpenDetails = (type: string, title: string, list: EmployeeDetail[]) => {
    setActiveDetailType(type);
    setDetailTitle(title);
    setDetailList(list);
    setDetailSearch('');
    setDetailModalOpen(true);
  };

  const filteredDetails = detailList.filter(emp => {
    const term = detailSearch.toLowerCase().trim();
    if (!term) return true;
    return (
      `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(term) ||
      emp.employeeCode.toLowerCase().includes(term) ||
      emp.designation?.toLowerCase().includes(term) ||
      emp.officeName.toLowerCase().includes(term) ||
      (emp.breakType && emp.breakType.toLowerCase().includes(term))
    );
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="animate-spin text-primary" size={32} />
          <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">Loading Live Stats...</p>
        </div>
      </div>
    );
  }

  const breaksTotal = stats 
    ? stats.breaks.lunch + stats.breaks.tea + stats.breaks.personal + stats.breaks.meeting
    : 0;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-black text-text-primary tracking-tight">Live Telemetry Dashboard</h1>
          <p className="text-xs font-semibold text-text-secondary mt-1">Real-time status tracking for all branch employees. Auto-refreshes every 30s.</p>
        </div>
        <button
          onClick={() => fetchLiveStats(true)}
          disabled={isRefreshing}
          className="self-start sm:self-center px-4 py-2 bg-surface hover:bg-surface-variant text-text-primary border border-border rounded-sm text-xs font-bold flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")} />
          {isRefreshing ? 'Refreshing...' : 'Refresh Now'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-error/10 border border-error/20 text-error font-medium text-sm rounded-sm">
          {error}
        </div>
      )}

      {stats && (
        <>
          {/* Main Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Present */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -3 }}
              onClick={() => handleOpenDetails('present', 'Employees: Checked In Today', stats.details.present)}
              className="p-6 border border-border bg-surface hover:border-emerald-500/30 hover:shadow-md cursor-pointer transition-all rounded-sm flex items-center justify-between"
            >
              <div>
                <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest leading-none">Checked In</p>
                <h3 className="text-4xl font-black text-emerald-500 mt-2.5 leading-none">{stats.present}</h3>
                <p className="text-xs font-semibold text-text-secondary mt-2">Active & present today</p>
              </div>
              <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 flex items-center justify-center rounded-sm">
                <UserCheck size={24} />
              </div>
            </motion.div>

            {/* Absent */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -3 }}
              onClick={() => handleOpenDetails('absent', 'Employees: Absent Today', stats.details.absent)}
              className="p-6 border border-border bg-surface hover:border-error/30 hover:shadow-md cursor-pointer transition-all rounded-sm flex items-center justify-between"
            >
              <div>
                <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest leading-none">Absent</p>
                <h3 className="text-4xl font-black text-error mt-2.5 leading-none">{stats.absent}</h3>
                <p className="text-xs font-semibold text-text-secondary mt-2">Not punched in / no leave</p>
              </div>
              <div className="w-12 h-12 bg-error/10 text-error flex items-center justify-center rounded-sm">
                <UserX size={24} />
              </div>
            </motion.div>

            {/* On Leave */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -3 }}
              onClick={() => handleOpenDetails('onLeave', 'Employees: On Approved Leave Today', stats.details.onLeave)}
              className="p-6 border border-border bg-surface hover:border-blue-500/30 hover:shadow-md cursor-pointer transition-all rounded-sm flex items-center justify-between"
            >
              <div>
                <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest leading-none">On Leave</p>
                <h3 className="text-4xl font-black text-blue-500 mt-2.5 leading-none">{stats.onLeave}</h3>
                <p className="text-xs font-semibold text-text-secondary mt-2">Approved leave requests today</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/10 text-blue-500 flex items-center justify-center rounded-sm">
                <Calendar size={24} />
              </div>
            </motion.div>

            {/* Late Check-in */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -3 }}
              onClick={() => handleOpenDetails('late', 'Employees: Late Arrivals Today', stats.details.late)}
              className="p-6 border border-border bg-surface hover:border-amber-500/30 hover:shadow-md cursor-pointer transition-all rounded-sm flex items-center justify-between"
            >
              <div>
                <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest leading-none">Late Arrivals</p>
                <h3 className="text-4xl font-black text-amber-500 mt-2.5 leading-none">{stats.late}</h3>
                <p className="text-xs font-semibold text-text-secondary mt-2">Arrived past shift start</p>
              </div>
              <div className="w-12 h-12 bg-amber-500/10 text-amber-500 flex items-center justify-center rounded-sm">
                <Clock size={24} />
              </div>
            </motion.div>
          </div>

          {/* Breaks Telemetry Section */}
          <motion.div variants={itemVariants} className="border border-border bg-surface p-6 rounded-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-black text-text-primary uppercase tracking-wider">Active Break Summary</h3>
                <p className="text-xs font-semibold text-text-secondary mt-0.5">Total of {breaksTotal} employees currently taking a break.</p>
              </div>
              <Coffee className="text-text-secondary" size={20} />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { type: 'lunch', label: 'Lunch Break', count: stats.breaks.lunch, color: 'from-sky-500/10 to-sky-500/5 text-sky-500 border-sky-500/20', list: stats.details.breaks.lunch },
                { type: 'tea', label: 'Tea Break', count: stats.breaks.tea, color: 'from-amber-500/10 to-amber-500/5 text-amber-500 border-amber-500/20', list: stats.details.breaks.tea },
                { type: 'personal', label: 'Personal Break', count: stats.breaks.personal, color: 'from-purple-500/10 to-purple-500/5 text-purple-500 border-purple-500/20', list: stats.details.breaks.personal },
                { type: 'meeting', label: 'Meeting / Client', count: stats.breaks.meeting, color: 'from-pink-500/10 to-pink-500/5 text-pink-500 border-pink-500/20', list: stats.details.breaks.meeting }
              ].map((b) => (
                <div
                  key={b.type}
                  onClick={() => handleOpenDetails(`break-${b.type}`, `Employees: On ${b.label}`, b.list)}
                  className={cn(
                    "p-4 border bg-gradient-to-br rounded-sm cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-sm",
                    b.color
                  )}
                >
                  <p className="text-[10px] font-black uppercase tracking-wider leading-none opacity-80">{b.label}</p>
                  <p className="text-2xl font-black mt-2 leading-none">{b.count}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Branch-wise Telemetry Table */}
            <motion.div variants={itemVariants} className="lg:col-span-2 border border-border bg-surface p-6 rounded-sm">
              <div className="flex items-center gap-2 mb-4">
                <MapPin size={16} className="text-text-secondary" />
                <h3 className="text-sm font-black text-text-primary uppercase tracking-wider">Branch-Wise Summary</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="py-3 text-[10px] font-black text-text-secondary uppercase tracking-widest">Office Branch</th>
                      <th className="py-3 text-[10px] font-black text-text-secondary uppercase tracking-widest text-center">Present</th>
                      <th className="py-3 text-[10px] font-black text-text-secondary uppercase tracking-widest text-center">Absent</th>
                      <th className="py-3 text-[10px] font-black text-text-secondary uppercase tracking-widest text-center">On Break</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.branchWise.length > 0 ? (
                      stats.branchWise.map((b, i) => (
                        <tr key={i} className="border-b border-border/50 hover:bg-surface-variant/20 transition-colors">
                          <td className="py-3.5 text-xs font-black text-text-primary">{b.branch}</td>
                          <td className="py-3.5 text-xs font-bold text-emerald-500 text-center">{b.present}</td>
                          <td className="py-3.5 text-xs font-bold text-error text-center">{b.absent}</td>
                          <td className="py-3.5 text-xs font-bold text-amber-500 text-center">{b.onBreak}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-xs font-bold text-text-secondary uppercase tracking-widest">
                          No branch data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Quick Actions / Pending Indicators */}
            <div className="space-y-6">
              <motion.div variants={itemVariants} className="border border-border bg-surface p-6 rounded-sm space-y-6">
                <h3 className="text-sm font-black text-text-primary uppercase tracking-wider">Action Pending Tasks</h3>
                
                <div className="space-y-4">
                  {/* Leave Requests Pending */}
                  <div className="p-4 border border-border bg-surface-variant/35 rounded-sm flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-black text-text-primary uppercase tracking-wider">Leave Approvals</h4>
                      <p className="text-xs font-semibold text-text-secondary mt-1">{stats.pendingLeaves} requests waiting for HR</p>
                    </div>
                    {stats.pendingLeaves > 0 ? (
                      <span className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-500 text-xs font-black flex items-center justify-center animate-pulse">
                        {stats.pendingLeaves}
                      </span>
                    ) : (
                      <span className="text-xs text-emerald-500 font-bold uppercase tracking-wider">Clear</span>
                    )}
                  </div>

                  {/* Shift Change Requests Pending */}
                  <div className="p-4 border border-border bg-surface-variant/35 rounded-sm flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-black text-text-primary uppercase tracking-wider">Shift Requests</h4>
                      <p className="text-xs font-semibold text-text-secondary mt-1">{stats.pendingShiftRequests} requests waiting for HR</p>
                    </div>
                    {stats.pendingShiftRequests > 0 ? (
                      <span className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 text-xs font-black flex items-center justify-center animate-pulse">
                        {stats.pendingShiftRequests}
                      </span>
                    ) : (
                      <span className="text-xs text-emerald-500 font-bold uppercase tracking-wider">Clear</span>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Today & Tomorrow On Leave Widget */}
              <motion.div variants={itemVariants} className="border border-border bg-surface p-6 rounded-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar size={16} className="text-text-secondary" />
                  <h3 className="text-sm font-black text-text-primary uppercase tracking-wider">Today & Tomorrow On Leave</h3>
                </div>
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {upcomingLeaves.length > 0 ? (
                    upcomingLeaves.map((leave, i) => (
                      <div key={i} className="p-3 border border-border/50 bg-surface-variant/20 rounded-sm">
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-black text-text-primary">{leave.employeeName}</span>
                          <span className="text-[10px] font-black uppercase bg-blue-500/10 text-blue-500 px-1.5 py-0.5 rounded-sm">
                            {leave.type}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-2 text-[10px] text-text-secondary font-semibold">
                          <span>{leave.branch}</span>
                          <span>{leave.dates}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs font-semibold text-text-secondary text-center py-6">No employees on leave today or tomorrow</p>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </>
      )}

      {/* Drill-down details modal */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={detailTitle}
        maxWidth="max-w-4xl"
      >
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
            <input
              type="text"
              placeholder="Search by name, code, designation, branch..."
              value={detailSearch}
              onChange={(e) => setDetailSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-surface-variant rounded-sm outline-none focus:ring-2 focus:ring-primary/50 text-xs font-bold"
            />
          </div>

          <div className="border border-border rounded-sm max-h-[450px] overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-variant/40 border-b border-border sticky top-0 z-10">
                  <th className="px-4 py-3.5 text-[9px] font-black text-text-secondary uppercase tracking-widest">Employee Name</th>
                  <th className="px-4 py-3.5 text-[9px] font-black text-text-secondary uppercase tracking-widest">Code</th>
                  <th className="px-4 py-3.5 text-[9px] font-black text-text-secondary uppercase tracking-widest">Designation</th>
                  <th className="px-4 py-3.5 text-[9px] font-black text-text-secondary uppercase tracking-widest">Branch</th>
                  {activeDetailType && activeDetailType.startsWith('break-') && (
                    <th className="px-4 py-3.5 text-[9px] font-black text-text-secondary uppercase tracking-widest">Started At</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredDetails.length > 0 ? (
                  filteredDetails.map((emp) => (
                    <tr key={emp.id} className="border-b border-border/50 hover:bg-surface-variant/15 transition-colors">
                      <td className="px-4 py-3 text-xs font-black text-text-primary">{emp.firstName} {emp.lastName}</td>
                      <td className="px-4 py-3 text-xs font-semibold text-text-secondary">{emp.employeeCode}</td>
                      <td className="px-4 py-3 text-xs font-semibold text-text-secondary">{emp.designation || 'Unassigned'}</td>
                      <td className="px-4 py-3 text-xs font-semibold text-text-secondary">{emp.officeName}</td>
                      {emp.startAt && (
                        <td className="px-4 py-3 text-xs font-bold text-amber-500">
                          {new Date(emp.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-xs font-bold text-text-secondary uppercase tracking-widest">
                      No matching records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
