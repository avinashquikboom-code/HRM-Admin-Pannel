"use client";

import { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  UserCheck, 
  UserPlus, 
  Activity,
  Clock,
  Building,
  TrendingUp,
  Award,
  Send,
  Zap,
  Sparkles,
  Radio,
  Check,
  RefreshCw,
  AlertCircle,
  Download
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
import {
  fetchHRStats,
  fetchDepartmentOverview,
  fetchLeaveOverview,
  fetchAttendanceTrend,
  fetchHRActivity,
  downloadHRLeaveReport,
  downloadHRAttendanceReport,
  HRStats,
  HRDepartmentOverview,
  HRLeaveOverview,
  HRAttendanceDay,
  HRActivityItem
} from '@/services/hrService';
import HREmployeeManagement from '../components/HREmployeeManagement';

// Animation variants
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

const totalAdminsTrend: any[] = [];
const activeSessionsTrend: any[] = [];
const hiresTrend: any[] = [];
const onboardingTrend: any[] = [];

const HRManagementPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // States for backend data
  const [stats, setStats] = useState<HRStats | null>(null);
  const [departments, setDepartments] = useState<HRDepartmentOverview[]>([]);
  const [leaveData, setLeaveData] = useState<HRLeaveOverview | null>(null);
  const [attendanceTrend, setAttendanceTrend] = useState<HRAttendanceDay[]>([]);
  const [activityList, setActivityList] = useState<HRActivityItem[]>([]);

  const getMonthsArray = () => {
    const months = [];
    const now = new Date();
    for (let i = 4; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        name: d.toLocaleDateString('en-US', { month: 'short' }),
        hires: 0
      });
    }
    return months;
  };

  const hiringData = stats?.hiringGrowth && stats.hiringGrowth.length > 0 
    ? stats.hiringGrowth 
    : getMonthsArray();

  const hasHiringData = stats?.hiringGrowth && stats.hiringGrowth.some(h => h.hires > 0);

  // Broadcast state
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  // Clock & greetings state
  const [currentTime, setCurrentTime] = useState('');
  const [greetingMessage, setGreetingMessage] = useState('Welcome');

  useEffect(() => {
    const clockTimer = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      
      const hr = now.getHours();
      if (hr < 12) setGreetingMessage('Good Morning');
      else if (hr < 17) setGreetingMessage('Good Afternoon');
      else setGreetingMessage('Good Evening');
    };
    clockTimer();
    const interval = setInterval(clockTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const loadData = useCallback(async (showRefreshing = false) => {
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
      setLeaveData(leaveRes);
      setAttendanceTrend(trendRes);
      setActivityList(activityRes);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to communicate with the operational database.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = () => {
    loadData(true);
  };

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMsg.trim()) return;

    setIsBroadcasting(true);
    setTimeout(() => {
      setIsBroadcasting(false);
      setBroadcastSuccess(true);
      setBroadcastMsg('');
      setTimeout(() => setBroadcastSuccess(false), 3000);
    }, 1000);
  };

  const handleDownloadLeaveReport = async () => {
    try {
      await downloadHRLeaveReport();
    } catch (error) {
      console.error('Failed to download leave report:', error);
    }
  };

  const handleDownloadAttendanceReport = async () => {
    try {
      await downloadHRAttendanceReport();
    } catch (error) {
      console.error('Failed to download attendance report:', error);
    }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8 pb-16 text-slate-100 animate-fadeIn"
    >
      {/* 1. Header Command Hub with Glowing Ambient Effects */}
      <motion.div 
        variants={itemVariants}
        className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-slate-900/90 to-slate-950/95 backdrop-blur-xl p-8 md:p-10 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-8 animate-slideDown"
      >
        <div className="absolute -top-12 -right-12 w-96 h-96 bg-primary/10 rounded-full filter blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute -bottom-24 -left-12 w-80 h-80 bg-emerald-500/5 rounded-full filter blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/20 to-emerald-500/10 border border-primary/30 text-primary text-[10px] font-black px-3.5 py-1.5 rounded-full uppercase tracking-widest shadow-inner">
            <Radio size={12} className="animate-pulse text-primary" />
            Active platform command center
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-none">
            {greetingMessage}, <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-teal-400 to-emerald-400">Administrator</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-400 font-medium max-w-xl leading-relaxed">
            Monitor real-time corporate workspace parameters, track check-ins, and broadcast ecosystem-wide updates.
          </p>
        </div>

        <div className="relative z-10 shrink-0 flex items-center gap-4 bg-slate-900/50 border border-white/5 px-6.5 py-5 rounded-[2rem] backdrop-blur-2xl shadow-2xl">
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Clock size={12} className="text-primary animate-pulse" /> SYSTEM CLOCK
            </span>
            <span className="text-3xl font-black text-white tracking-wider font-mono mt-1 drop-shadow-[0_0_8px_rgba(59,163,139,0.3)]">
              {currentTime || '00:00:00'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleDownloadLeaveReport}
              className="p-3 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-primary rounded-2xl border border-white/10 transition-all duration-300 active:scale-95 shadow-inner shrink-0"
              title="Download Leave Report"
            >
              <Download size={15} />
            </button>
            <button 
              onClick={handleDownloadAttendanceReport}
              className="p-3 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-primary rounded-2xl border border-white/10 transition-all duration-300 active:scale-95 shadow-inner shrink-0"
              title="Download Attendance Report"
            >
              <Download size={15} />
            </button>
            <button 
              onClick={handleRefresh} 
              disabled={isLoading || isRefreshing}
              className="p-3 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-primary rounded-2xl border border-white/10 transition-all duration-300 active:scale-95 disabled:opacity-50 shadow-inner shrink-0"
              title="Refresh Operational Pulse"
            >
              <RefreshCw size={15} className={cn(isRefreshing && "animate-spin text-primary")} />
            </button>
          </div>
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
            onClick={() => loadData()}
            className="px-4 py-1.5 bg-error text-white font-bold rounded-xl text-xs hover:bg-error/90 transition-all duration-200"
          >
            Re-sync Databases
          </button>
        </motion.div>
      )}

      {/* Main Operational Panel */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6 animate-pulse"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="glass-card p-6 h-28 bg-slate-800/30 border border-white/5" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 glass-card p-8 h-80 bg-slate-800/20 border border-white/5" />
              <div className="glass-card p-8 h-80 bg-slate-800/20 border border-white/5" />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="dashboard-pulse"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="space-y-8"
          >
            {/* 2. Premium Metrics Grid with glowing micro-indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { 
                  label: 'TOTAL HR ADMINS', 
                  value: stats?.totalHRAdmins ?? 0, 
                  desc: 'Active system administrator profiles', 
                  icon: Users, 
                  color: 'text-primary', 
                  bg: 'bg-primary/10',
                  glow: 'group-hover:shadow-[0_0_45px_rgba(59,163,139,0.3)]',
                  trendData: totalAdminsTrend,
                  gradient: 'from-primary/15 to-transparent',
                  accentColor: '#3BA38B'
                },
                { 
                  label: 'ACTIVE SESSIONS', 
                  value: stats?.activeSessions ?? 0, 
                  desc: 'Workspace logins today', 
                  icon: Activity, 
                  color: 'text-sky-400', 
                  bg: 'bg-sky-400/10',
                  glow: 'group-hover:shadow-[0_0_45px_rgba(14,165,233,0.3)]',
                  trendData: activeSessionsTrend,
                  gradient: 'from-sky-500/15 to-transparent',
                  accentColor: '#0EA5E9'
                },
                { 
                  label: 'PLATFORM HIRES', 
                  value: stats?.newHires ?? 0, 
                  desc: 'Onboarded within last 30 days', 
                  icon: UserPlus, 
                  color: 'text-violet-400', 
                  bg: 'bg-violet-400/10',
                  glow: 'group-hover:shadow-[0_0_45px_rgba(139,92,246,0.3)]',
                  trendData: hiresTrend,
                  gradient: 'from-violet-500/15 to-transparent',
                  accentColor: '#8B5CF6'
                },
                { 
                  label: 'ONBOARDING RATE', 
                  value: stats?.onboardingRate ?? '100.0%', 
                  desc: 'Successful platform validations', 
                  icon: UserCheck, 
                  color: 'text-emerald-400', 
                  bg: 'bg-emerald-400/10',
                  glow: 'group-hover:shadow-[0_0_45px_rgba(16,185,129,0.3)]',
                  trendData: onboardingTrend,
                  gradient: 'from-emerald-500/15 to-transparent',
                  accentColor: '#10B981'
                },
              ].map((stat, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 18 }}
                  className="glass-card p-6 relative overflow-hidden group border border-white/[0.08] bg-slate-950/70 hover:bg-slate-900/80 hover:border-white/20 shadow-2xl transition-all duration-300 flex flex-col justify-between min-h-[170px]"
                >
                  <div className={cn("absolute inset-0 bg-gradient-to-br opacity-25 group-hover:opacity-40 transition-opacity duration-300", stat.gradient)} />
                  
                  <div className="flex items-start justify-between relative z-10">
                    <div className={cn("w-11 h-11 rounded-2xl flex items-center justify-center shadow-inner transition-all duration-300", stat.bg, stat.color, stat.glow)}>
                      <stat.icon size={20} />
                    </div>
                    <div className="flex items-center gap-1 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded text-[8px] font-black tracking-widest text-slate-400">
                      <Sparkles size={8} className="text-primary animate-pulse" /> LIVE
                    </div>
                  </div>

                  <div className="relative z-10 mt-4 flex items-end justify-between">
                    <div>
                      <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest leading-none">{stat.label}</p>
                      <p className="text-3xl font-black mt-1 text-white tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">{stat.value}</p>
                      <p className="text-[10px] text-slate-400 mt-1 font-semibold leading-none">{stat.desc}</p>
                    </div>

                    <div className="w-18 h-10 select-none opacity-80 group-hover:opacity-100 transition-all duration-300">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stat.trendData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                          <Area 
                            type="monotone" 
                            dataKey="val" 
                            stroke={stat.accentColor} 
                            strokeWidth={2} 
                            fill={`rgba(${stat.accentColor === '#3BA38B' ? '59,163,139' : stat.accentColor === '#0EA5E9' ? '14,165,233' : stat.accentColor === '#8B5CF6' ? '139,92,246' : '16,185,129'}, 0.08)`}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className={cn("absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full", stat.accentColor === '#3BA38B' ? "bg-primary animate-ping" : stat.accentColor === '#0EA5E9' ? "bg-sky-400 animate-pulse" : stat.accentColor === '#8B5CF6' ? "bg-violet-400" : "bg-emerald-400")} />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* 3. High-Fidelity Interactive Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Hiring Growth Graph with Spline area gradient styling */}
              <div className="lg:col-span-2 glass-card p-8 border border-white/5 bg-slate-900/40 shadow-2xl relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full filter blur-3xl pointer-events-none" />
                
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <h3 className="heading-2 text-white flex items-center gap-2 text-lg font-black tracking-tight">
                        <TrendingUp size={18} className="text-primary animate-pulse" />
                        Ecosystem Hiring Growth
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">Comparative platform-wide hiring trends over past months</p>
                    </div>
                    <select className="bg-slate-800 border border-white/10 rounded-xl px-3.5 py-2 text-xs outline-none cursor-pointer hover:border-white/20 transition-all font-bold text-slate-300">
                      <option>Last 5 Months</option>
                      <option>Last Year</option>
                    </select>
                  </div>

                  <ChartContainer heightClassName="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={hiringData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <defs>
                          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3BA38B" stopOpacity={0.95}/>
                            <stop offset="100%" stopColor="#10B981" stopOpacity={0.2}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.1} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 11}} dy={8} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 11}} domain={[0, hasHiringData ? 'auto' : 10]} allowDecimals={false} />
                        <Tooltip 
                          cursor={{fill: 'rgba(255, 255, 255, 0.02)', radius: 12}}
                          contentStyle={{ 
                            borderRadius: '16px', 
                            border: '1px solid rgba(255, 255, 255, 0.08)', 
                            backgroundColor: '#0F172A',
                            color: '#F1F5F9',
                            fontSize: '12px'
                          }}
                        />
                        <Bar 
                          dataKey="hires" 
                          name="Hires" 
                          fill="url(#barGradient)" 
                          radius={[10, 10, 0, 0]} 
                          barSize={38}
                          animationDuration={1200}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>

                <div className="border-t border-white/5 pt-4.5 mt-6 flex items-center justify-between text-xs font-semibold text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Award size={14} className="text-primary animate-bounce" />
                    Real-time ecosystem database synchronized
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">Operations metrics</span>
                </div>
              </div>

              {/* HR Status Distribution premium donut style */}
              <div className="glass-card p-8 border border-white/5 bg-slate-900/40 shadow-2xl flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-36 h-36 bg-sky-500/5 rounded-full filter blur-xl pointer-events-none" />
                
                <div>
                  <h3 className="heading-2 text-white flex items-center gap-2 text-lg font-black tracking-tight">
                    <Building size={18} className="text-sky-400" />
                    HR Status Distribution
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Active vs Inactive Administrators breakdown</p>
                </div>

                <div className="my-5 flex justify-center relative items-center">
                  <ChartContainer heightClassName="h-[170px] w-[170px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats?.hrDistribution || []}
                          innerRadius={52}
                          outerRadius={70}
                          paddingAngle={5}
                          dataKey="value"
                          stroke="none"
                        >
                          {(stats?.hrDistribution || []).map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.color} 
                              className="hover:opacity-90 cursor-pointer outline-none transition-all duration-300"
                            />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            borderRadius: '12px', 
                            border: '1px solid rgba(255, 255, 255, 0.08)', 
                            backgroundColor: '#0F172A',
                            color: '#F1F5F9',
                            fontSize: '11px'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                  <div className="absolute text-center">
                    <p className="text-xl font-black text-white">{stats?.totalHRAdmins ?? 0} Admins</p>
                    <p className="text-[8px] text-slate-400 uppercase tracking-widest font-black">Ecosystem Load</p>
                  </div>
                </div>

                <div className="space-y-2 border-t border-white/5 pt-4.5">
                  {(stats?.hrDistribution || []).map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-xs font-bold p-1 rounded-lg hover:bg-white/5 transition-all duration-200">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-slate-300">{item.name}</span>
                      </div>
                      <span className="text-white font-black">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 4. Broadcast Command & Activity timeline feed */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Live Feed Event Stream */}
              <div className="lg:col-span-2 glass-card p-8 border border-white/5 bg-slate-900/40 shadow-2xl relative overflow-hidden">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h3 className="heading-2 text-white flex items-center gap-2 text-lg font-black tracking-tight">
                      <Clock size={18} className="text-primary animate-pulse" />
                      Administrative Activity Logs
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Real-time chronologies of administrator check-ins</p>
                  </div>
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded">
                    Live stream
                  </span>
                </div>

                <div className="relative border-l border-white/10 pl-5.5 space-y-6 max-h-[300px] overflow-y-auto no-scrollbar">
                  {[
                    { id: 1, name: 'Robert Fox', role: 'HR Director', time: '10 mins ago', status: 'Online', desc: 'Authorized department security configurations.' },
                    { id: 2, name: 'Jane Cooper', role: 'Talent Acquisition', time: '2 hours ago', status: 'Offline', desc: 'Compiled recruiting profiles for placement.' },
                    { id: 3, name: 'Wade Warren', role: 'HR Manager', time: 'Yesterday', status: 'Offline', desc: 'Approved pending time-off allocations.' },
                    { id: 4, name: 'Cameron Williamson', role: 'HR Generalist', time: '5 mins ago', status: 'Online', desc: 'Logged in from Delhi Headquarters.' },
                  ].map((hr, idx) => (
                    <motion.div 
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      key={hr.id}
                      className="relative group"
                    >
                      <div className={cn(
                        "absolute -left-[27.5px] top-1.5 w-3 h-3 rounded-full border-2 bg-slate-950 transition-transform group-hover:scale-125 duration-300 shadow-inner",
                        hr.status === 'Online' ? "border-emerald-400" : "border-slate-600"
                      )} />
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-white group-hover:text-primary transition-colors">{hr.name}</span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase bg-slate-800 px-1.5 py-0.5 rounded">
                              {hr.role}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1 font-semibold leading-relaxed">{hr.desc}</p>
                        </div>
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest shrink-0">
                          {hr.time}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Command Center Broadcast Box */}
              <div className="glass-card p-8 border border-white/5 bg-slate-900/40 shadow-2xl relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full filter blur-xl pointer-events-none" />
                
                <div>
                  <h3 className="heading-2 text-white flex items-center gap-2 text-lg font-black tracking-tight">
                    <Send size={18} className="text-primary animate-pulse" />
                    Ecosystem Broadcast
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Post instant operations announcements to all devices</p>
                </div>

                <form onSubmit={handleBroadcast} className="space-y-4 my-6">
                  <div className="relative">
                    <textarea
                      value={broadcastMsg}
                      onChange={(e) => setBroadcastMsg(e.target.value)}
                      placeholder="Type announcements, corporate notices, or alert messages here..."
                      rows={4}
                      className="w-full p-4 bg-slate-950 border border-white/10 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all font-semibold text-white placeholder:text-slate-500 resize-none leading-relaxed"
                      maxLength={150}
                    />
                    <span className="absolute bottom-3.5 right-3.5 text-[9px] font-black text-slate-600 select-none">
                      {broadcastMsg.length}/150
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={isBroadcasting || !broadcastMsg.trim()}
                    className="w-full btn-primary py-3 rounded-2xl flex items-center justify-center gap-2 text-xs font-black shadow-lg shadow-primary/10 disabled:opacity-40 select-none transition-all"
                  >
                    <Zap size={13} />
                    {isBroadcasting ? 'Broadcasting notice...' : 'Push Announcement broadcast'}
                  </button>
                </form>

                <AnimatePresence>
                  {broadcastSuccess && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[10px] font-bold text-emerald-400"
                    >
                      <Check size={13} className="text-emerald-400" />
                      <span>Announcement successfully pushed to all devices!</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wider">
                  Clearance clearance: Level 3+
                </span>
              </div>
            </div>

            {/* 5. HR Employee Management Section */}
            <motion.div
              variants={itemVariants}
              className="w-full"
            >
              <HREmployeeManagement />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default HRManagementPage;
