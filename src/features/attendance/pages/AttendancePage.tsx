"use client";

import { useState } from 'react';
import { toast } from 'sonner';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  XCircle,
  Filter,
  Search,
  Download,
  Users,
  Activity,
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Plus
} from 'lucide-react';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import TableSkeleton from '@/components/TableSkeleton';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { cn } from '@/utils/cn';
import ChartContainer from '@/components/ChartContainer';
import Modal from '@/components/Modal';
import SuperAdminHeader from '@/components/SuperAdminHeader';
import { useTodayAttendance } from '@/hooks/useTodayAttendance';
import { api } from '@/lib/api';


function formatCheckInTime(value: string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function formatAttendanceStatus(status: string) {
  switch (status) {
    case 'PRESENT':
      return 'On-time';
    case 'LATE':
      return 'Late';
    case 'ABSENT':
      return 'Absent';
    case 'HALF_DAY':
      return 'Half Day';
    case 'REMOTE':
      return 'Remote';
    default:
      return status;
  }
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

const MiniCalendar = () => {
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const today = new Date().getDate();
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-black uppercase tracking-widest text-text-primary">May 2024</h4>
        <div className="flex gap-1">
          <button className="p-1 hover:bg-surface-variant rounded-lg transition-colors"><ChevronLeft size={16} /></button>
          <button className="p-1 hover:bg-surface-variant rounded-lg transition-colors"><ChevronRight size={16} /></button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {days.map((d, idx) => <span key={`${d}-${idx}`} className="text-micro font-black text-muted">{d}</span>)}
        {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
          <div 
            key={d} 
            className={cn(
              "h-8 flex items-center justify-center rounded-sm text-xs font-bold transition-all cursor-pointer",
              d === today ? "bg-primary text-white shadow-lg shadow-primary/20" : "hover:bg-surface-variant text-text-secondary",
              [1, 15, 28].includes(d) && d !== today && "relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-accent after:rounded-full"
            )}
          >
            {d}
          </div>
        ))}
      </div>
    </div>
  );
};

const AttendancePage = () => {
  const { records, distribution, isLoading, error, refetch } = useTodayAttendance();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null);
  const [employeeAttendance, setEmployeeAttendance] = useState<any[]>([]);
  const [employeeLeaves, setEmployeeLeaves] = useState<any[]>([]);
  const [isLoadingEmployeeData, setIsLoadingEmployeeData] = useState(false);


  // Handle employee detail view
  const handleViewEmployeeDetails = async (employee: any) => {
    setSelectedEmployee(employee);
    setIsLoadingEmployeeData(true);
    try {
      // Fetch employee attendance history
      const attendanceResponse = await api.get('/api/admin/attendance/history', {
        params: { employeeId: employee.id, limit: 10 }
      });
      setEmployeeAttendance(attendanceResponse.data.records || []);

      // Fetch employee leaves
      const leavesResponse = await api.get('/api/admin/leaves', {
        params: { employeeId: employee.id }
      });
      setEmployeeLeaves(leavesResponse.data.leaves || []);
    } catch (error) {
      console.error('Error loading employee details:', error);
      alert('Failed to load employee details. Please try again.');
    } finally {
      setIsLoadingEmployeeData(false);
    }
  };

  // Handle attendance PDF download
  const handleDownloadAttendanceReport = async (employeeId?: number | string, employeeName?: string) => {
    try {
      // Show loading state
      const response = await api.get('/api/admin/reports/attendance/download', {
        params: employeeId ? { employeeId } : undefined,
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const namePart = employeeName ? employeeName.replace(/\s+/g, '-').toLowerCase() : 'all-employees';
      link.setAttribute('download', `attendance-report-${namePart}-${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      // Show success message
      toast.success('Attendance report downloaded successfully!');
    } catch (error: any) {
      console.error('Error downloading attendance report:', error);
      toast.error('Failed to download attendance report. Please try again.');
    }
  };

  const presentCount = records.filter(r => r.status === 'PRESENT').length;
  const lateCount = records.filter(r => r.status === 'LATE').length;
  const absentCount = records.filter(r => r.status === 'ABSENT').length;
  const activeTodayCount = presentCount + lateCount;
  const onTimePercentage = activeTodayCount > 0 ? `${Math.round((presentCount / activeTodayCount) * 100)}%` : '0%';

  const filteredRecords = records.filter(record => {
    const employeeName = `${record.employee.firstName} ${record.employee.lastName}`.toLowerCase();
    const employeeCode = (record.employee.employeeCode || '').toLowerCase();
    const officeName = (record.office?.name || '').toLowerCase();
    const search = searchTerm.toLowerCase();
    return employeeName.includes(search) || employeeCode.includes(search) || officeName.includes(search);
  });

  const topStats = [
    { 
      label: 'Active Today', 
      value: activeTodayCount.toLocaleString(), 
      icon: Users, 
      color: 'primary', 
      trend: '+5.4%',
      glowColor: 'rgba(59, 163, 139, 0.25)'
    },
    { 
      label: 'Average On-time', 
      value: onTimePercentage, 
      icon: CheckCircle2, 
      color: 'success', 
      trend: '+2.1%',
      glowColor: 'rgba(34, 197, 94, 0.25)'
    },
    { 
      label: 'Late Arrivals', 
      value: lateCount.toLocaleString(), 
      icon: Clock, 
      color: 'warning', 
      trend: '+12%',
      glowColor: 'rgba(245, 158, 11, 0.25)'
    },
    { 
      label: 'Absent Today', 
      value: absentCount.toLocaleString(), 
      icon: XCircle, 
      color: 'error', 
      trend: '-0.8%',
      glowColor: 'rgba(239, 68, 68, 0.25)'
    },
  ];

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-10"
    >
      <SuperAdminHeader
        title="Attendance Monitoring"
        subtitle="Orchestrate daily employee check-in timelines, geofence radius exceptions, live audit tables, and holiday configurations."
        badgeText="Workforce Presence Governance"
        badgeIcon={Calendar}
        stats={[
          { label: 'Active Today', value: activeTodayCount.toString(), icon: Users },
          { label: 'On-time', value: presentCount.toString(), icon: CheckCircle2 },
          { label: 'Late', value: lateCount.toString(), icon: XCircle },
          { label: 'Absent', value: absentCount.toString(), icon: XCircle }
        ]}
      >
        <button 
            onClick={() => handleDownloadAttendanceReport()}
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-600/20 hover:shadow-emerald-600/30 px-6.5 py-4 shrink-0 rounded-sm text-xs font-black uppercase tracking-wider justify-center transition-all duration-300 mr-3"
          >
            <Download size={18} />
            Download Monthly Report
        </button>
      </SuperAdminHeader>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {topStats.map((stat) => (
          <motion.div
            key={stat.label}
            variants={itemVariants}
            whileHover={{ y: -8, transition: { duration: 0.3, ease: "easeOut" } }}
            className="glass-card p-6 group hover:border-primary/50 transition-all cursor-default relative overflow-hidden shadow-premium"
          >
            {/* Radial Glow Effect */}
            <div 
              className="absolute -right-4 -top-4 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none"
              style={{ background: stat.glowColor }}
            />
            
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className={cn(
                "p-3.5 rounded-sm transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm",
                `bg-${stat.color}/10 text-${stat.color}`
              )}>
                <stat.icon size={22} />
              </div>
              <span className={cn(
                "text-micro font-black px-2.5 py-1.5 rounded-sm uppercase tracking-wider border shadow-sm",
                stat.trend.startsWith('+') ? "bg-success/10 text-success border-success/10" : "bg-error/10 text-error border-error/10"
              )}>
                {stat.trend}
              </span>
            </div>
            <div className="relative z-10">
              <p className="text-micro font-black text-text-secondary uppercase tracking-[0.15em] mb-1">{stat.label}</p>
              <h3 className="text-stat-value tabular-nums">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Summary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div variants={itemVariants} className="glass-card p-8 relative overflow-hidden group">
          <div className="absolute -left-10 -top-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-1000" />
          
          <h3 className="heading-2 relative z-10">Presence Breakdown</h3>
          <p className="text-page-desc mt-1 mb-8 relative z-10 font-medium">System-wide daily status distribution</p>
          
          <div className="relative z-10">
          <ChartContainer heightClassName="h-[250px]">
              <PieChart>
                <Pie
                  data={distribution.length > 0 ? distribution : [{ name: 'No Data', value: 1, color: '#64748B' }]}
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={8}
                  dataKey="value"
                  animationDuration={1500}
                  stroke="none"
                >
                  {(distribution.length > 0 ? distribution : [{ name: 'No Data', value: 1, color: '#64748B' }]).map((entry: { color: string }, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} className="outline-none" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '0px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    backgroundColor: 'var(--surface)',
                    backdropFilter: 'blur(8px)',
                    color: 'var(--text-primary)'
                  }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                />
              </PieChart>
          </ChartContainer>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <span className="text-stat-value">{distribution.length > 0 ? Math.round((distribution.filter((d: { name: string }) => d.name === 'PRESENT').reduce((a: number, c: { value: number }) => a + c.value, 0) / distribution.reduce((a: number, c: { value: number }) => a + c.value, 0)) * 100) : 0}%</span>
              <p className="text-label text-text-secondary">Present</p>
            </div>
          </div>
          
          <div className="mt-8 space-y-3 relative z-10">
            {distribution.map((item: { name: string; value: number; color: string }) => (
              <div key={item.name} className="flex items-center justify-between p-3 rounded-sm hover:bg-surface-variant transition-colors border border-transparent hover:border-border shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: item.color }} />
                  <span className="text-sm font-bold text-text-primary">{item.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-text-secondary">
                    {Math.round((item.value / Math.max(1, distribution.reduce((a: number, c: { value: number }) => a + c.value, 0))) * 100)}%
                  </span>
                  <span className="text-sm font-black text-text-primary tracking-tight">{item.value.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="lg:col-span-2 glass-card p-8 relative overflow-hidden group">
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-accent/5 rounded-full blur-3xl group-hover:bg-accent/10 transition-colors duration-1000" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 relative z-10">
            <div>
              <h3 className="heading-2">Peak Check-in Activity</h3>
              <p className="text-sm text-page-desc mt-1">Hourly density of employee arrivals across the platform</p>
            </div>
            <div className="flex items-center gap-4 text-label bg-surface-variant p-2.5 rounded-sm border border-border/50 shadow-sm">
              <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-primary" /> On-time</span>
              <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-accent" /> Late</span>
            </div>
          </div>

          <ChartContainer heightClassName="h-[320px]" className="relative z-10">
              {isLoading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-full h-full animate-pulse bg-surface-variant/30 rounded-sm" />
                </div>
              ) : (
                <BarChart data={[]}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                  <XAxis 
                    dataKey="time" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: 'var(--text-secondary)', fontSize: 10, fontWeight: 900}} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: 'var(--text-secondary)', fontSize: 10, fontWeight: 900}}
                  />
                  <Tooltip 
                    cursor={{fill: 'var(--primary)', opacity: 0.05}} 
                    contentStyle={{ 
                      borderRadius: '0px', 
                      border: 'none', 
                      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                      padding: '16px',
                      background: 'var(--surface)',
                      backdropFilter: 'blur(8px)',
                      color: 'var(--text-primary)'
                    }}
                    itemStyle={{ color: 'var(--text-primary)' }}
                  />
                  <Bar dataKey="ontime" stackId="a" fill="#3BA38B" radius={[0, 0, 0, 0]} animationDuration={1500} />
                  <Bar dataKey="late" stackId="a" fill="#F4B860" radius={[10, 10, 0, 0]} animationDuration={2000} />
                </BarChart>
              )}
          </ChartContainer>
        </motion.div>
      </div>

      {error && (
        <div className="rounded-sm bg-error/10 border border-error/20 px-4 py-3 text-sm font-medium text-error flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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

      {/* Real-time Feed */}
      <motion.div variants={itemVariants} className="glass-card overflow-hidden">
        <div className="p-8 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-sm bg-primary/10 text-primary flex items-center justify-center animate-pulse shadow-sm">
              <Activity size={24} />
            </div>
            <div>
              <h3 className="heading-2">Live Activity Feed</h3>
              <p className="text-sm text-page-desc mt-1">Real-time check-in stream from across all client companies</p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-grow sm:flex-grow-0 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search employees..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11 pr-4 py-3 bg-surface-variant border-none rounded-sm text-sm outline-none focus:ring-4 focus:ring-primary/10 transition-all w-full sm:w-64 font-bold text-text-primary"
              />
            </div>
            <button className="p-3 bg-surface-variant hover:bg-border/50 rounded-sm text-text-secondary transition-all active:scale-95 border border-border/50 shadow-sm">
              <Filter size={20} />
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
                <tr className="bg-surface-variant/50">
                  <th className="px-4 sm:px-6 md:px-8 py-4 sm:py-5 text-label text-muted border-b border-border">Employee</th>
                  <th className="px-4 sm:px-6 md:px-8 py-4 sm:py-5 text-label text-muted border-b border-border">Company</th>
                  <th className="px-4 sm:px-6 md:px-8 py-4 sm:py-5 text-label text-muted border-b border-border">Log Time</th>
                  <th className="px-4 sm:px-6 md:px-8 py-4 sm:py-5 text-label text-muted border-b border-border">Method</th>
                  <th className="px-4 sm:px-6 md:px-8 py-4 sm:py-5 text-label text-muted border-b border-border">Break Status</th>
                  <th className="px-4 sm:px-6 md:px-8 py-4 sm:py-5 text-label text-muted border-b border-border text-right">Status</th>
                  <th className="px-4 sm:px-6 md:px-8 py-4 sm:py-5 text-label text-muted border-b border-border text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredRecords.length > 0 ? (
                  filteredRecords.map((record) => {
                    const employeeName = `${record.employee.firstName} ${record.employee.lastName}`;
                    const avatar = `${record.employee.firstName[0] ?? ''}${record.employee.lastName[0] ?? ''}`.toUpperCase();
                    const statusLabel = formatAttendanceStatus(record.status);

                    return (
                  <motion.tr
                    key={record.id}
                    variants={itemVariants}
                    className="hover:bg-surface-variant/30 transition-all group cursor-pointer"
                    onClick={() => handleViewEmployeeDetails(record.employee)}
                  >
                    <td className="px-4 sm:px-6 md:px-8 py-5 sm:py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-surface-variant border border-border flex items-center justify-center font-bold text-xs text-text-primary shadow-sm group-hover:scale-110 transition-transform duration-300">
                          {avatar}
                        </div>
                        <div>
                          <span className="block font-bold text-text-primary tracking-tight group-hover:text-primary transition-colors">{employeeName}</span>
                          <span className="text-micro font-black text-muted tracking-wider">{record.employee.employeeCode}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 md:px-8 py-5 sm:py-6">
                      <span className="text-sm font-bold text-text-secondary uppercase tracking-tight">{record.office?.name ?? 'Unassigned'}</span>
                    </td>
                    <td className="px-4 sm:px-6 md:px-8 py-5 sm:py-6">
                      <div className="flex items-center gap-2 text-sm text-text-primary font-black tabular-nums">
                        <Clock size={16} className="text-primary" />
                        {formatCheckInTime(record.checkIn)}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 md:px-8 py-5 sm:py-6">
                      <div className="flex items-center gap-2 text-xs font-bold text-text-secondary uppercase tracking-widest">
                        <MapPin size={14} className="text-muted" />
                        {record.status === 'REMOTE' ? 'Remote' : 'Office'}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 md:px-8 py-5 sm:py-6">
                      {record.isOnBreak ? (
                        <span className="px-2.5 py-1 bg-amber-500/15 text-amber-500 border border-amber-500/20 rounded-sm text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1.5 shadow-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block animate-ping" />
                          On Break
                        </span>
                      ) : record.totalBreakSeconds && record.totalBreakSeconds > 0 ? (
                        <span className="text-sm font-bold text-text-primary tabular-nums">
                          {Math.floor(record.totalBreakSeconds / 60)}m {record.totalBreakSeconds % 60}s
                        </span>
                      ) : (
                        <span className="text-sm font-bold text-muted">—</span>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 md:px-8 py-5 sm:py-6 text-right">
                      <span className={cn(
                        "px-4 py-1.5 rounded-sm text-label inline-flex items-center gap-2 transition-all group-hover:scale-110 border shadow-sm",
                        statusLabel === 'On-time' ? 'bg-success/10 text-success border-success/10' : 'bg-warning/10 text-warning border-warning/10'
                      )}>
                        {statusLabel === 'On-time' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                        {statusLabel}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 md:px-8 py-5 sm:py-6 text-center">
                      <button
                        onClick={() => handleDownloadAttendanceReport(record.employee.id, employeeName)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500/10 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 rounded-sm text-[10px] font-black uppercase tracking-wider text-emerald-400 transition-all cursor-pointer active:scale-95"
                        title={`Download attendance report for ${employeeName}`}
                      >
                        <Download size={13} />
                        Download
                      </button>
                    </td>
                  </motion.tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 sm:px-6 md:px-8 py-8 sm:py-10 text-center text-sm font-medium text-text-secondary">
                      No attendance records for today yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Employee Detail Modal */}
      <Modal
        isOpen={selectedEmployee !== null}
        onClose={() => setSelectedEmployee(null)}
        title={`Employee Details - ${selectedEmployee ? `${selectedEmployee.firstName} ${selectedEmployee.lastName}` : ''}`}
      >
        {selectedEmployee && (
          <div className="space-y-4">
            {/* Employee Info */}
            <div className="p-4 bg-surface-variant/50 rounded-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                  {selectedEmployee.firstName[0]}{selectedEmployee.lastName[0]}
                </div>
                <div>
                  <p className="font-bold text-text-primary">{selectedEmployee.firstName} {selectedEmployee.lastName}</p>
                  <p className="text-sm text-text-secondary">{selectedEmployee.designation || 'Employee'}</p>
                  <p className="text-xs text-muted">{selectedEmployee.employeeCode}</p>
                </div>
              </div>
            </div>

            {/* Attendance History */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-text-primary mb-3">Recent Attendance</h4>
              {isLoadingEmployeeData ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                </div>
              ) : employeeAttendance.length === 0 ? (
                <p className="text-sm text-text-secondary text-center py-4">No attendance records found.</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {employeeAttendance.map((att: any) => (
                    <div key={att.id} className="p-3 bg-surface-variant/30 rounded-sm">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-semibold">{att.date}</span>
                        <span className={`text-xs font-bold px-2 py-1 rounded ${
                          att.status === 'PRESENT' ? 'bg-green-500/20 text-green-500' :
                          att.status === 'ABSENT' ? 'bg-red-500/20 text-red-500' :
                          att.status === 'LATE' ? 'bg-orange-500/20 text-orange-500' :
                          'bg-gray-500/20 text-gray-500'
                        }`}>
                          {att.status}
                        </span>
                      </div>
                      <div className="text-xs text-text-secondary space-y-1">
                        <p>Check-in: {att.checkIn ? new Date(att.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</p>
                        <p>Check-out: {att.checkOut ? new Date(att.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</p>
                        <p>Break time: {att.totalBreakSeconds && att.totalBreakSeconds > 0 
                          ? `${Math.floor(att.totalBreakSeconds / 60)}m ${att.totalBreakSeconds % 60}s` 
                          : '—'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Leave History */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-text-primary mb-3">Leave History</h4>
              {isLoadingEmployeeData ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                </div>
              ) : employeeLeaves.length === 0 ? (
                <p className="text-sm text-text-secondary text-center py-4">No leave records found.</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {employeeLeaves.map((leave: any) => (
                    <div key={leave.id} className="p-3 bg-surface-variant/30 rounded-sm">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-semibold">{leave.type}</span>
                        <span className={`text-xs font-bold px-2 py-1 rounded ${
                          leave.status === 'Approved' ? 'bg-green-500/20 text-green-500' :
                          leave.status === 'Rejected' ? 'bg-red-500/20 text-red-500' :
                          'bg-orange-500/20 text-orange-500'
                        }`}>
                          {leave.status}
                        </span>
                      </div>
                      <div className="text-xs text-text-secondary space-y-1">
                        <p>{leave.startDate} to {leave.endDate}</p>
                        {leave.reason && <p className="truncate">{leave.reason}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Download Report Button */}
            <button
              onClick={() => handleDownloadAttendanceReport(selectedEmployee.id, `${selectedEmployee.firstName} ${selectedEmployee.lastName}`)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-sm font-semibold hover:bg-primary-dark transition-colors"
            >
              <Download size={16} />
              Download Attendance Report
            </button>
          </div>
        )}
      </Modal>

    </motion.div>
  );
};

export default AttendancePage;
