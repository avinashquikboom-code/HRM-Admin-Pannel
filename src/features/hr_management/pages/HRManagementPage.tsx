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
  Radio,
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
  ResponsiveContainer
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
      className="space-y-6 pb-8 text-text-primary animate-fadeIn"
    >
      {/* 1. Header Command Hub with Glowing Ambient Effects */}
      <motion.div 
        variants={itemVariants}
        className="relative overflow-hidden rounded-[2.5rem] border border-border/50 dark:border-white/10 bg-surface dark:bg-gradient-to-br dark:from-slate-900/90 dark:to-slate-950/95 backdrop-blur-xl p-8 md:p-10 shadow-sm dark:shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-8 animate-slideDown"
      >
        <div className="absolute -top-12 -right-12 w-96 h-96 bg-primary/10 rounded-full filter blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute -bottom-24 -left-12 w-80 h-80 bg-emerald-500/5 rounded-full filter blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/20 to-emerald-500/10 border border-primary/30 text-primary text-[10px] font-black px-3.5 py-1.5 rounded-full uppercase tracking-widest shadow-inner">
            <Radio size={12} className="animate-pulse text-primary" />
            Active platform command center
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-text-primary tracking-tight leading-none">
            {greetingMessage}, <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-teal-400 to-emerald-400">Administrator</span>
          </h1>
          <p className="text-xs md:text-sm text-text-secondary font-medium max-w-xl leading-relaxed">
            Monitor real-time corporate workspace parameters, track check-ins, and broadcast ecosystem-wide updates.
          </p>
        </div>

        <div className="relative z-10 shrink-0 flex items-center gap-4 bg-surface-variant/40 dark:bg-slate-900/50 border border-border/50 dark:border-white/5 px-6.5 py-5 rounded-[2rem] backdrop-blur-2xl shadow-sm dark:shadow-2xl">
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-black text-text-secondary uppercase tracking-widest flex items-center gap-1.5">
              <Clock size={12} className="text-primary animate-pulse" /> SYSTEM CLOCK
            </span>
            <span className="text-3xl font-black text-text-primary tracking-wider font-mono mt-1 drop-shadow-[0_0_8px_rgba(59,163,139,0.3)]">
              {currentTime || '00:00:00'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleDownloadLeaveReport}
              className="p-3 bg-surface-variant/50 hover:bg-surface-variant/80 dark:bg-white/5 dark:hover:bg-white/10 text-text-secondary hover:text-primary dark:text-slate-300 dark:hover:text-primary rounded-sm border border-border/50 dark:border-white/10 transition-all duration-300 active:scale-95 shadow-sm shrink-0"
              title="Download Leave Report"
            >
              <Download size={15} />
            </button>
            <button 
              onClick={handleDownloadAttendanceReport}
              className="p-3 bg-surface-variant/50 hover:bg-surface-variant/80 dark:bg-white/5 dark:hover:bg-white/10 text-text-secondary hover:text-primary dark:text-slate-300 dark:hover:text-primary rounded-sm border border-border/50 dark:border-white/10 transition-all duration-300 active:scale-95 shadow-sm shrink-0"
              title="Download Attendance Report"
            >
              <Download size={15} />
            </button>
            <button 
              onClick={handleRefresh} 
              disabled={isLoading || isRefreshing}
              className="p-3 bg-surface-variant/50 hover:bg-surface-variant/80 dark:bg-white/5 dark:hover:bg-white/10 text-text-secondary hover:text-primary dark:text-slate-300 dark:hover:text-primary rounded-sm border border-border/50 dark:border-white/10 transition-all duration-300 active:scale-95 disabled:opacity-50 shadow-sm shrink-0"
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
          className="flex items-center justify-between p-4 bg-error/10 border border-error/20 rounded-sm text-error-text text-sm shadow-sm"
        >
          <div className="flex items-center gap-3">
            <AlertCircle size={20} className="text-error" />
            <span className="font-medium">{error}</span>
          </div>
          <button 
            onClick={() => loadData()}
            className="px-4 py-1.5 bg-error text-white font-bold rounded-sm text-xs hover:bg-error/90 transition-all duration-200"
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
                <div key={i} className="glass-card p-6 h-28 bg-surface-variant/30 border border-border" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 glass-card p-8 h-80 bg-surface-variant/20 border border-border" />
              <div className="glass-card p-8 h-80 bg-surface-variant/20 border border-border" />
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
            {/* 2. Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { 
                  label: 'TOTAL HR ADMINS', 
                  value: stats?.totalHRAdmins ?? 0, 
                  desc: 'Active system administrator profiles', 
                  icon: Users, 
                  iconContainerClass: 'from-primary/20 to-primary/5 border-primary/20 text-primary',
                },
                { 
                  label: 'ACTIVE SESSIONS', 
                  value: stats?.activeSessions ?? 0, 
                  desc: 'Workspace logins today', 
                  icon: Activity, 
                  iconContainerClass: 'from-sky-500/20 to-sky-500/5 border-sky-500/20 text-sky-500',
                },
                { 
                  label: 'PLATFORM HIRES', 
                  value: stats?.newHires ?? 0, 
                  desc: 'Onboarded within last 30 days', 
                  icon: UserPlus, 
                  iconContainerClass: 'from-violet-500/20 to-violet-500/5 border-violet-500/20 text-violet-500',
                },
                { 
                  label: 'ONBOARDING RATE', 
                  value: stats?.onboardingRate ?? '100.0%', 
                  desc: 'Successful platform validations', 
                  icon: UserCheck, 
                  iconContainerClass: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/20 text-emerald-500',
                },
              ].map((stat, i) => (
                <div 
                  key={i}
                  className="p-6 border border-border bg-surface flex flex-col justify-between min-h-[150px] rounded-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className={cn("w-11 h-11 rounded-sm bg-gradient-to-br flex items-center justify-center border", stat.iconContainerClass)}>
                      <stat.icon size={20} />
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-[9px] text-text-secondary font-black uppercase tracking-widest leading-none">{stat.label}</p>
                    <p className="text-3xl font-black mt-1.5 text-text-primary tracking-tight">{stat.value}</p>
                    <p className="text-[10px] text-text-secondary mt-1 font-semibold leading-none">{stat.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* 3. High-Fidelity Interactive Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Hiring Growth Graph with Spline area gradient styling */}
              <div className="lg:col-span-2 p-8 border border-border bg-surface relative overflow-hidden flex flex-col rounded-sm group hover:bg-surface-variant/10 transition-all duration-300">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full filter blur-3xl pointer-events-none group-hover:bg-primary/10 transition-all duration-300" />
                
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <h3 className="heading-2 text-text-primary flex items-center gap-2 text-lg font-black tracking-tight">
                        <TrendingUp size={18} className="text-primary animate-pulse" />
                        Ecosystem Hiring Growth
                      </h3>
                      <p className="text-xs text-text-secondary mt-0.5">Comparative platform-wide hiring trends over past months</p>
                    </div>
                    <select className="bg-surface-variant border border-border rounded-sm px-3.5 py-2 text-xs outline-none cursor-pointer hover:border-border-hover transition-all font-bold text-text-primary">
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
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.3} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--text-secondary)', fontSize: 11}} dy={8} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-secondary)', fontSize: 11}} domain={[0, hasHiringData ? 'auto' : 10]} allowDecimals={false} />
                        <Tooltip 
                          cursor={{fill: 'var(--surface-variant)', radius: 12}}
                          contentStyle={{ 
                            borderRadius: '0px', 
                            border: '1px solid var(--border)', 
                            backgroundColor: 'var(--surface)',
                            color: 'var(--text-primary)',
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

                <div className="border-t border-border pt-4.5 mt-auto flex items-center justify-between text-xs font-semibold text-text-secondary">
                  <span className="flex items-center gap-1.5">
                    <Award size={14} className="text-primary animate-bounce" />
                    Real-time ecosystem database synchronized
                  </span>
                  <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider font-mono">Operations metrics</span>
                </div>
              </div>

              {/* HR Status Distribution premium donut style */}
              <div className="p-8 border border-border bg-surface flex flex-col relative overflow-hidden rounded-sm group hover:bg-surface-variant/10 transition-all duration-300">
                <div className="absolute top-0 right-0 w-36 h-36 bg-sky-500/5 rounded-full filter blur-3xl pointer-events-none group-hover:bg-sky-500/10 transition-all duration-300" />
                
                <div>
                  <h3 className="heading-2 text-text-primary flex items-center gap-2 text-lg font-black tracking-tight">
                    <Building size={18} className="text-sky-400" />
                    HR Status Distribution
                  </h3>
                  <p className="text-xs text-text-secondary mt-0.5">Active vs Inactive Administrators breakdown</p>
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
                            borderRadius: '0px', 
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
                    <p className="text-xl font-black text-text-primary">{stats?.totalHRAdmins ?? 0} Admins</p>
                    <p className="text-[8px] text-text-secondary uppercase tracking-widest font-black">Ecosystem Load</p>
                  </div>
                </div>

                <div className="space-y-2 border-t border-border pt-4.5 mt-auto">
                  {(stats?.hrDistribution || []).map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-xs font-bold p-1 rounded-lg hover:bg-surface-variant transition-all duration-200">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-text-secondary">{item.name}</span>
                      </div>
                      <span className="text-text-primary font-black">{item.value}%</span>
                    </div>
                  ))}
                </div>
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
