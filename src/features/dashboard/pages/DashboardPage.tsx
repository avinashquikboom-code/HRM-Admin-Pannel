'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { 
  Users, 
  Building2, 
  IndianRupee, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Calendar as CalendarIcon,
  Zap,
  ShieldCheck,
  Clock,
  AlertCircle,
  ArrowRight,
  X,
  Plus,
  FileText,
  Wallet,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Database,
  Globe
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import Modal from '@/components/Modal';
import ChartContainer from '@/components/ChartContainer';
import SuperAdminHeader from '@/components/SuperAdminHeader';

const revenueData: { name: string; value: number; active: number }[] = [];

// subscriptionData now comes from useDashboardStats hook

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

const KPICard = ({ title, value, icon: Icon, change, isPositive, color = 'primary' }: any) => (
  <motion.div
    variants={itemVariants}
    whileHover={{ y: -5, transition: { duration: 0.2 } }}
    className="glass-card p-6 flex flex-col gap-4 relative overflow-hidden group border-transparent hover:border-primary/20"
  >
    <div className={cn(
      "absolute -right-8 -top-8 w-24 h-24 rounded-full blur-2xl opacity-20 transition-transform group-hover:scale-150 duration-700 dark:block hidden",
      color === 'primary' ? "bg-primary" :
      color === 'success' ? "bg-success" :
      color === 'warning' ? "bg-warning" :
      color === 'error' ? "bg-error" :
      "bg-primary"
    )} />

    <div className="flex items-center justify-between relative z-10">
      <div className={cn(
        "p-3 rounded-sm transition-all duration-300 group-hover:scale-110 shadow-sm",
        color === 'primary' ? "bg-primary/10 text-primary" :
        color === 'success' ? "bg-success/10 text-success" :
        color === 'warning' ? "bg-warning/10 text-warning" :
        color === 'error' ? "bg-error/10 text-error" :
        "bg-primary/10 text-primary"
      )}>
        <Icon size={24} />
      </div>
      <div className={cn(
        "flex items-center gap-1 text-micro font-black px-2 py-1 rounded-lg uppercase tracking-wider",
        isPositive ? "bg-success/10 text-success" : "bg-error/10 text-error"
      )}>
        {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
        {change}%
      </div>
    </div>

    <div className="relative z-10 mt-2">
      <p className="text-stat-label">{title}</p>
      <h3 className="text-stat-value mt-1">{value}</h3>
    </div>
  </motion.div>
);

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
        {days.map(d => <span key={d} className="text-micro font-black text-muted">{d}</span>)}
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

const DashboardPage = () => {
  const router = useRouter();
  const { data, loading, error } = useDashboardStats();
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('May 2024');
  const [chartsLoading, setChartsLoading] = useState(true);

  const quickActions = [
    { name: 'Add Company', icon: Building2, color: 'primary', desc: 'Onboard a new enterprise' },
    { name: 'Process Payroll', icon: Wallet, color: 'success', desc: 'Disburse monthly salaries' },
    { name: 'Generate Report', icon: FileText, color: 'accent', desc: 'Export system analytics' },
    { name: 'System Audit', icon: ShieldCheck, color: 'warning', desc: 'Run security protocols' },
  ];

  useEffect(() => {
    if (!loading && data) {
      setChartsLoading(false);
    }
  }, [loading, data]);

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8 pb-10"
    >
      <SuperAdminHeader
        title="Platform Intelligence"
        subtitle="Global ecosystem overview: Real-time monitoring of companies, workforce, and financial health."
        badgeText="Admin Dashboard"
        badgeIcon={Activity}
        stats={[
          { label: 'Total Revenue', value: data ? `₹${(data.monthlyRevenue / 1000000).toFixed(1)}M` : '₹0', icon: IndianRupee },
          { label: 'Active Companies', value: data ? data.totalCompanies.toString() : '0', icon: Building2 },
          { label: 'Total Employees', value: data ? data.totalEmployees.toString() : '0', icon: Users },
          { label: 'System Health', value: '98.5%', icon: ShieldCheck }
        ]}
      >
        <div className="relative">
          <button 
            onClick={() => setIsCalendarOpen(!isCalendarOpen)}
              className="flex items-center gap-2 px-4 py-2.5 bg-surface-variant border border-border rounded-sm text-sm font-semibold text-text-secondary hover:text-primary transition-all hover:shadow-lg active:scale-95"
            >
              <CalendarIcon size={18} />
              {selectedDate}
            </button>
            <AnimatePresence>
              {isCalendarOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-4 w-72 glass-card p-4 z-50 overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-4 border-b border-border/50 pb-2">
                    <span className="text-sm font-black uppercase tracking-widest text-text-primary">Select Period</span>
                    <button onClick={() => setIsCalendarOpen(false)}><X size={16} className="text-muted hover:text-error transition-colors" /></button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month) => (
                      <button 
                        key={month}
                        onClick={() => {
                          setSelectedDate(`${month} 2024`);
                          setIsCalendarOpen(false);
                        }}
                        className={cn(
                          "py-2 rounded-sm text-xs font-bold transition-all",
                          selectedDate.startsWith(month) ? "bg-primary text-white" : "hover:bg-surface-variant text-text-secondary"
                        )}
                      >
                        {month}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button 
            onClick={() => setIsQuickActionOpen(true)}
            className="btn-primary group shadow-xl shadow-primary/20"
          >
            <Zap size={18} className="group-hover:fill-current transition-all" />
            Quick Action
          </button>
      </SuperAdminHeader>

      {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="glass-card p-6 animate-pulse h-32" />
            ))}
          </div>
        ) : error ? (
          <p className="text-error">{error}</p>
        ) : data ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard
              title="Total Companies"
              value={data.totalCompanies.toLocaleString()}
              icon={Building2}
              change="12.5"
              isPositive={true}
              color="primary"
            />
            <KPICard
              title="Platform Workforce"
              value={`${data.platformWorkforce.toLocaleString()}k`}
              icon={Users}
              change="8.2"
              isPositive={true}
              color="secondary"
            />
            <div onClick={() => router.push('/payroll')} className="cursor-pointer">
              <KPICard
                title="Manual Audits"
                value={data.manualAudits.toString()}
                icon={ShieldCheck}
                change="4.1"
                isPositive={false}
                color="warning"
              />
            </div>
            <KPICard
              title="Monthly Revenue"
              value={`₹${(data.monthlyRevenue / 1000000).toFixed(2)}M`}
              icon={IndianRupee}
              change="18.7"
              isPositive={true}
              color="success"
            />
          </div>
        ) : null}

      {/* Main Analytics Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {chartsLoading ? (
          <motion.div variants={itemVariants} className="xl:col-span-2 glass-card p-8 animate-pulse">
            <div className="h-8 bg-surface-variant rounded-lg w-48 mb-2"></div>
            <div className="h-4 bg-surface-variant/70 rounded-lg w-64 mb-10"></div>
            <div className="h-[350px] bg-surface-variant/50 rounded-lg"></div>
          </motion.div>
        ) : (
          <motion.div variants={itemVariants} className="xl:col-span-2 glass-card p-8 relative overflow-hidden group">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-1000" />
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 relative z-10">
              <div>
                <h3 className="heading-2">System Growth Trajectory</h3>
                <p className="text-sm text-page-desc mt-1">Comparative analysis of projected vs actual platform revenue</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-xs font-bold text-text-secondary">Actual</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-muted" />
                  <span className="text-xs font-bold text-text-secondary">Target</span>
                </div>
              </div>
            </div>

            <ChartContainer heightClassName="h-[350px]" className="relative z-10">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="dashboardRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3BA38B" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3BA38B" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'var(--text-secondary)', fontSize: 12, fontWeight: 600 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'var(--text-secondary)', fontSize: 12, fontWeight: 600 }}
                    tickFormatter={(val) => `₹${val/1000}k`}
                  />
                  <Tooltip 
                    cursor={{ stroke: 'var(--color-primary)', strokeWidth: 2 }} 
                    contentStyle={{ 
                      borderRadius: '0px', 
                      border: 'none', 
                      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                      background: 'var(--surface)',
                      backdropFilter: 'blur(10px)',
                      padding: '16px',
                      color: 'var(--text-primary)'
                    }}
                    itemStyle={{ color: 'var(--text-primary)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#3BA38B" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#dashboardRevenueGradient)" 
                    animationDuration={2000}
                  />
                </AreaChart>
            </ChartContainer>
          </motion.div>
        )}

        {chartsLoading ? (
          <motion.div variants={itemVariants} className="glass-card p-8 flex flex-col group animate-pulse">
            <div className="h-8 bg-surface-variant rounded-lg w-40 mb-2"></div>
            <div className="h-4 bg-surface-variant/70 rounded-lg w-48 mb-8"></div>
            <div className="h-64 bg-surface-variant/50 rounded-lg mb-10"></div>
            <div className="space-y-4 mt-auto">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-surface-variant/50 rounded-lg"></div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div variants={itemVariants} className="glass-card p-8 flex flex-col group">
            <h3 className="heading-2 mb-2">Subscription Mix</h3>
            <p className="text-sm text-text-secondary mb-8 font-medium">Platform-wide plan adoption</p>
            
            <div className="relative mb-10">
            <ChartContainer heightClassName="h-64">
                <PieChart>
                  <Pie
                    data={data?.subscriptionDistribution || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={95}
                    paddingAngle={10}
                    dataKey="value"
                    stroke="none"
                    animationDuration={1500}
                  >
                    {(data?.subscriptionDistribution || []).map((entry: { color: string }, index: number) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color} 
                        className="outline-none"
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
            </ChartContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-stat-value">{(data?.subscriptionDistribution || []).reduce((acc: number, curr: { value: number }) => acc + curr.value, 0).toLocaleString()}</span>
                <span className="text-label text-text-secondary">Active Plans</span>
              </div>
            </div>

            <div className="space-y-4 mt-auto">
              {(data?.subscriptionDistribution || []).map((item: { name: string; value: number; color: string }) => (
                <div key={item.name} className="flex items-center justify-between p-4 rounded-sm bg-surface-variant group/item hover:bg-surface transition-all border border-transparent hover:border-border shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm font-bold text-text-primary group-hover/item:text-primary transition-colors">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-text-primary">{item.value}</span>
                    <p className="text-micro font-bold text-text-secondary uppercase tracking-tight">Accounts</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Real-time Feed & Health Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {chartsLoading ? (
          <motion.div variants={itemVariants} className="lg:col-span-2 glass-card p-8 animate-pulse">
            <div className="flex items-center justify-between mb-10">
              <div>
                <div className="h-8 bg-surface-variant rounded-lg w-48 mb-2"></div>
                <div className="h-4 bg-surface-variant/70 rounded-lg w-64"></div>
              </div>
              <div className="h-6 bg-surface-variant rounded-lg w-24"></div>
            </div>
            <div className="space-y-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-start gap-6">
                  <div className="w-12 h-12 bg-surface-variant/50 rounded-lg"></div>
                  <div className="flex-grow pt-1 space-y-2">
                    <div className="h-4 bg-surface-variant/70 rounded-lg w-80"></div>
                    <div className="h-3 bg-surface-variant/50 rounded-lg w-48"></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="h-12 bg-surface-variant/50 rounded-lg mt-10"></div>
          </motion.div>
        ) : (
          <motion.div variants={itemVariants} className="lg:col-span-2 glass-card p-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="heading-2 tracking-tight">System Vitality Feed</h3>
                <p className="text-xs text-page-desc mt-1">Real-time infrastructure & onboarding events</p>
              </div>
              <div className="px-3 py-1.5 bg-primary/10 text-primary text-micro font-black rounded-full uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                Live Now
              </div>
            </div>
            
            <div className="space-y-8 relative before:absolute before:left-6 before:top-2 before:bottom-2 before:w-[1px] before:bg-border">
              {[
                { type: 'success', text: 'New Enterprise "TechVibe Inc." onboarded.', time: '2h ago', icon: Building2 },
                { type: 'warning', text: 'Bulk disbursement of ₹240k pending audit.', time: '4h ago', icon: Clock },
                { type: 'success', text: 'Cloud Server Migration (Node-42) completed.', time: '6h ago', icon: ShieldCheck },
                { type: 'error', text: 'Subscription renewal failed for "Global Logist."', time: '12h ago', icon: AlertCircle },
              ].map((event, i) => (
                <div key={i} className="flex items-start gap-6 group relative z-10">
                  <div className={cn(
                    "w-12 h-12 rounded-sm flex items-center justify-center flex-shrink-0 transition-all group-hover:scale-110 shadow-sm border border-border/50",
                    event.type === 'success' ? "bg-success/10 text-success" :
                    event.type === 'warning' ? "bg-warning/10 text-warning" : "bg-error/10 text-error"
                  )}>
                    <event.icon size={22} />
                  </div>
                  <div className="flex-grow pt-1">
                    <p className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors leading-snug">
                      {event.text}
                    </p>
                    <p className="text-micro font-bold text-text-secondary mt-1 tracking-wide uppercase">
                      {event.time} • System Intelligence
                    </p>
                  </div>
                  <button className="self-center p-2 rounded-sm bg-surface-variant opacity-0 group-hover:opacity-100 transition-all">
                    <ArrowRight size={16} className="text-muted" />
                  </button>
                </div>
              ))}
            </div>
            
            <button 
              onClick={() => router.push('/payroll')}
              className="w-full mt-10 py-4 text-xs font-black text-text-secondary uppercase tracking-widest hover:text-primary hover:bg-primary/5 rounded-sm transition-all border border-dashed border-border"
            >
              Enter Audit Control Center
            </button>
          </motion.div>
        )}

        {chartsLoading ? (
          <motion.div variants={itemVariants} className="glass-card p-8 flex flex-col group animate-pulse">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="h-8 bg-surface-variant rounded-lg w-40 mb-2"></div>
                <div className="h-4 bg-surface-variant/70 rounded-lg w-48"></div>
              </div>
              <div className="w-12 h-12 bg-surface-variant/50 rounded-lg"></div>
            </div>
            <div className="space-y-6 flex-grow">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="h-4 bg-surface-variant/70 rounded-lg w-24"></div>
                    <div className="h-4 bg-surface-variant/70 rounded-lg w-12"></div>
                  </div>
                  <div className="h-1.5 w-full bg-surface-variant/50 rounded-lg"></div>
                </div>
              ))}
            </div>
            <div className="mt-8 h-20 bg-surface-variant/50 rounded-lg"></div>
          </motion.div>
        ) : (
          <motion.div variants={itemVariants} className="glass-card p-8 flex flex-col group relative overflow-hidden bg-gradient-to-br from-secondary/90 to-primary/10 border-none shadow-premium">
            <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(59,163,139,0.4),transparent_70%)] animate-pulse" />
            </div>

            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-black text-white tracking-tighter">System Health</h3>
                  <p className="text-label text-white/50 mt-1">Platform Integrity Status</p>
                </div>
                <div className="p-3 bg-white/10 backdrop-blur-md rounded-sm border border-white/10 shadow-sm">
                  <Activity size={24} className="text-primary-light animate-pulse" />
                </div>
              </div>

              <div className="space-y-6 flex-grow">
                {[
                  { label: 'CPU Load', value: 24, icon: Cpu, color: 'primary' },
                  { label: 'Database', value: 92, icon: Database, color: 'success' },
                  { label: 'Cloud Latency', value: 12, icon: Globe, color: 'accent' },
                ].map((metric) => (
                  <div key={metric.label} className="space-y-2">
                    <div className="flex justify-between items-center text-label text-white/60">
                      <div className="flex items-center gap-2">
                        <metric.icon size={14} className="text-white/40" />
                        <span>{metric.label}</span>
                      </div>
                      <span className="text-white">{metric.value}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${metric.value}%` }}
                        transition={{ duration: 1.5, ease: "circOut" }}
                        className={cn(
                          "h-full rounded-full",
                          metric.color === 'primary' ? "bg-primary" : 
                          metric.color === 'success' ? "bg-success" : "bg-accent"
                        )} 
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-4 bg-white/5 rounded-sm border border-white/10 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-micro font-black text-white/40 uppercase tracking-widest">Global Status</span>
                  <span className="text-micro font-black text-success uppercase">Optimal</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-success rounded-full shadow-[0_0_8px_#22C55E]" />
                  <p className="text-xs font-bold text-white">All subsystems nominal</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Calendar Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {chartsLoading ? (
          <motion.div variants={itemVariants} className="lg:col-span-3 glass-card p-4 sm:p-6 md:p-8 animate-pulse">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-8 mb-6 sm:mb-10">
              <div>
                <div className="h-8 bg-surface-variant rounded-lg w-48 mb-2"></div>
                <div className="h-4 bg-surface-variant/70 rounded-lg w-64"></div>
              </div>
              <div className="flex gap-4">
                <div className="h-6 bg-surface-variant rounded-lg w-24"></div>
                <div className="h-6 bg-surface-variant rounded-lg w-24"></div>
              </div>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 sm:gap-10">
              <div className="xl:col-span-3">
                <div className="grid grid-cols-7 gap-1 sm:gap-2 md:gap-4 mb-4 sm:mb-6">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className="h-4 bg-surface-variant/50 rounded-lg"></div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1 sm:gap-2 md:gap-4">
                  {Array.from({ length: 31 }).map((_, i) => (
                    <div key={i} className="aspect-square bg-surface-variant/50 rounded-lg"></div>
                  ))}
                </div>
              </div>
              <div className="space-y-6 border-t border-border pt-6 xl:border-t-0 xl:border-l xl:border-border xl:pt-0 xl:pl-6 2xl:pl-10">
                <div className="h-4 bg-surface-variant/70 rounded-lg w-32"></div>
                {[1, 2].map((i) => (
                  <div key={i} className="h-20 bg-surface-variant/50 rounded-lg"></div>
                ))}
                <div className="h-12 bg-surface-variant/50 rounded-lg mt-4"></div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div variants={itemVariants} className="lg:col-span-3 glass-card p-4 sm:p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-8 mb-6 sm:mb-10">
              <div>
                <h3 className="heading-2">Platform Calendar</h3>
                <p className="text-sm text-page-desc mt-1">Upcoming disbursements & audits</p>
              </div>
              <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span className="text-xs font-bold text-text-secondary">Payroll Run</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-accent" />
                  <span className="text-xs font-bold text-text-secondary">System Audit</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 sm:gap-10">
              <div className="xl:col-span-3">
                <div className="grid grid-cols-7 gap-1 sm:gap-2 md:gap-4 mb-4 sm:mb-6">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                    <span key={d} className="text-[9px] sm:text-micro font-black text-muted text-center uppercase tracking-[0.1em] sm:tracking-[0.2em]">{d}</span>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1 sm:gap-2 md:gap-4">
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                    <div 
                      key={d} 
                      className={cn(
                        "aspect-square flex flex-col items-center justify-center rounded-sm sm:rounded-sm md:rounded-sm text-xs sm:text-sm font-bold transition-all cursor-pointer border border-transparent hover:border-primary/20 hover:bg-primary/5",
                        d === new Date().getDate() ? "bg-primary text-white shadow-xl shadow-primary/20" : "text-text-primary",
                        [1, 15, 28].includes(d) && d !== new Date().getDate() && "relative after:absolute after:bottom-2 after:w-1.5 after:h-1.5 after:bg-accent after:rounded-full"
                      )}
                    >
                      {d}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-6 border-t border-border pt-6 xl:border-t-0 xl:border-l xl:border-border xl:pt-0 xl:pl-6 2xl:pl-10">
                <h4 className="text-xs font-black text-text-secondary uppercase tracking-widest">Upcoming tomorrow</h4>
                {[
                  { title: 'TechVibe Payroll', amount: '₹382,500', time: '09:00 AM', icon: Wallet, color: 'primary' },
                  { title: 'Global Audit', amount: 'Manual Check', time: '02:00 PM', icon: ShieldCheck, color: 'accent' },
                ].map((event, i) => (
                  <div key={i} className="p-5 bg-surface-variant rounded-sm border border-border/50 group hover:border-primary/30 transition-all cursor-default">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "p-3 rounded-sm shadow-sm",
                        event.color === 'primary' ? "bg-primary/10 text-primary" :
                        event.color === 'accent' ? "bg-accent/10 text-accent" :
                        event.color === 'success' ? "bg-success/10 text-success" :
                        event.color === 'warning' ? "bg-warning/10 text-warning" :
                        event.color === 'error' ? "bg-error/10 text-error" :
                        "bg-primary/10 text-primary"
                      )}>
                        <event.icon size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-text-primary group-hover:text-primary transition-colors">{event.title}</p>
                        <p className="text-label font-bold text-text-secondary mt-1">{event.time} • {event.amount}</p>
                      </div>
                    </div>
                  </div>
                ))}
                <button className="w-full py-4 text-label text-text-secondary hover:text-primary transition-colors flex items-center justify-center gap-2 border border-dashed border-border rounded-sm mt-4">
                  <Plus size={14} />
                  Add Platform Event
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Quick Action Modal */}
      <Modal 
        isOpen={isQuickActionOpen} 
        onClose={() => setIsQuickActionOpen(false)}
        title="Intelligence Quick Actions"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-2">
          {quickActions.map((action) => (
            <motion.button 
              key={action.name}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (action.name === 'Process Payroll') router.push('/payroll');
                setIsQuickActionOpen(false);
              }}
              className="flex items-center gap-4 p-5 glass-card hover:border-primary/30 transition-all text-left group shadow-sm"
            >
              <div className={cn(
                "w-12 h-12 rounded-sm flex items-center justify-center transition-all group-hover:scale-110 shadow-sm",
                action.color === 'primary' ? "bg-primary/10 text-primary" :
                action.color === 'accent' ? "bg-accent/10 text-accent" :
                action.color === 'success' ? "bg-success/10 text-success" :
                action.color === 'warning' ? "bg-warning/10 text-warning" :
                action.color === 'error' ? "bg-error/10 text-error" :
                "bg-primary/10 text-primary"
              )}>
                <action.icon size={24} />
              </div>
              <div>
                <p className="text-sm font-black text-text-primary uppercase tracking-tight">{action.name}</p>
                <p className="text-label font-bold text-text-secondary mt-1">{action.desc}</p>
              </div>
              <ArrowRight size={16} className="ml-auto text-muted group-hover:text-primary transition-all group-hover:translate-x-1" />
            </motion.button>
          ))}
        </div>
        <div className="mt-8 p-6 bg-surface-variant/50 rounded-sm border border-dashed border-border text-center">
          <p className="text-xs font-bold text-text-secondary">More advanced controls are available in specific module settings.</p>
        </div>
      </Modal>
    </motion.div>
  );
};

export default DashboardPage;
