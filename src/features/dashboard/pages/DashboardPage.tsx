'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import Modal from '@/components/Modal';

const revenueData = [
  { name: 'Jan', value: 400000, active: 380000 },
  { name: 'Feb', value: 300000, active: 290000 },
  { name: 'Mar', value: 500000, active: 480000 },
  { name: 'Apr', value: 450000, active: 440000 },
  { name: 'May', value: 600000, active: 580000 },
  { name: 'Jun', value: 550000, active: 540000 },
  { name: 'Jul', value: 700000, active: 680000 },
];

const subscriptionData = [
  { name: 'Enterprise', value: 450, color: '#1E293B' },
  { name: 'Pro', value: 380, color: '#F4B860' },
  { name: 'Basic', value: 220, color: '#3BA38B' },
];

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
      "absolute -right-8 -top-8 w-24 h-24 rounded-full blur-2xl opacity-20 transition-transform group-hover:scale-150 duration-700",
      `bg-${color}`
    )} />
    
    <div className="flex items-center justify-between relative z-10">
      <div className={cn(
        "p-3 rounded-2xl transition-all duration-300 group-hover:scale-110 shadow-sm",
        `bg-${color}/10 text-${color}`
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
              "h-8 flex items-center justify-center rounded-xl text-xs font-bold transition-all cursor-pointer",
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
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('May 2024');

  const quickActions = [
    { name: 'Add Company', icon: Building2, color: 'primary', desc: 'Onboard a new enterprise' },
    { name: 'Process Payroll', icon: Wallet, color: 'success', desc: 'Disburse monthly salaries' },
    { name: 'Generate Report', icon: FileText, color: 'accent', desc: 'Export system analytics' },
    { name: 'System Audit', icon: ShieldCheck, color: 'warning', desc: 'Run security protocols' },
  ];

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8 pb-10"
    >
      {/* Header Section */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="heading-1 bg-clip-text text-transparent bg-gradient-to-r from-text-primary to-muted">
            Platform Intelligence
          </h1>
          <p className="text-page-desc mt-1 max-w-2xl">
            Global ecosystem overview: Real-time monitoring of companies, workforce, and financial health.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <button 
              onClick={() => setIsCalendarOpen(!isCalendarOpen)}
              className="flex items-center gap-2 px-4 py-2.5 bg-surface-variant border border-border rounded-2xl text-sm font-semibold text-text-secondary hover:text-primary transition-all hover:shadow-lg active:scale-95"
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
                          "py-2 rounded-xl text-xs font-bold transition-all",
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
        </div>
      </motion.div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard title="Total Companies" value="1,284" icon={Building2} change="12.5" isPositive={true} color="primary" />
        <KPICard title="Platform Workforce" value="45.9k" icon={Users} change="8.2" isPositive={true} color="secondary" />
        <div onClick={() => router.push('/payroll')} className="cursor-pointer">
          <KPICard title="Manual Audits" value="12" icon={ShieldCheck} change="4.1" isPositive={false} color="warning" />
        </div>
        <KPICard title="Monthly Revenue" value="₹2.4M" icon={IndianRupee} change="18.7" isPositive={true} color="success" />
      </div>

      {/* Main Analytics Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
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

          <div className="h-[350px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
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
                    borderRadius: '20px', 
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
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-card p-8 flex flex-col group">
          <h3 className="heading-2 mb-2">Subscription Mix</h3>
          <p className="text-sm text-text-secondary mb-8 font-medium">Platform-wide plan adoption</p>
          
          <div className="h-64 w-full relative mb-10">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={subscriptionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={95}
                  paddingAngle={10}
                  dataKey="value"
                  stroke="none"
                  animationDuration={1500}
                >
                  {subscriptionData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color} 
                      className="outline-none"
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-stat-value">1,050</span>
              <span className="text-label text-text-secondary">Active Plans</span>
            </div>
          </div>

          <div className="space-y-4 mt-auto">
            {subscriptionData.map((item) => (
              <div key={item.name} className="flex items-center justify-between p-4 rounded-2xl bg-surface-variant group/item hover:bg-surface transition-all border border-transparent hover:border-border shadow-sm">
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
      </div>

      {/* Real-time Feed & Health Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                  "w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all group-hover:scale-110 shadow-sm border border-border/50",
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
                <button className="self-center p-2 rounded-xl bg-surface-variant opacity-0 group-hover:opacity-100 transition-all">
                  <ArrowRight size={16} className="text-muted" />
                </button>
              </div>
            ))}
          </div>
          
          <button 
            onClick={() => router.push('/payroll')}
            className="w-full mt-10 py-4 text-xs font-black text-text-secondary uppercase tracking-widest hover:text-primary hover:bg-primary/5 rounded-2xl transition-all border border-dashed border-border"
          >
            Enter Audit Control Center
          </button>
        </motion.div>

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
              <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 shadow-sm">
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

            <div className="mt-8 p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
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
      </div>

      {/* Calendar Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                      "aspect-square flex flex-col items-center justify-center rounded-xl sm:rounded-2xl md:rounded-3xl text-xs sm:text-sm font-bold transition-all cursor-pointer border border-transparent hover:border-primary/20 hover:bg-primary/5",
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
                <div key={i} className="p-5 bg-surface-variant rounded-3xl border border-border/50 group hover:border-primary/30 transition-all cursor-default">
                  <div className="flex items-center gap-4">
                    <div className={cn("p-3 rounded-2xl shadow-sm", `bg-${event.color}/10 text-${event.color}`)}>
                      <event.icon size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-text-primary group-hover:text-primary transition-colors">{event.title}</p>
                      <p className="text-label font-bold text-text-secondary mt-1">{event.time} • {event.amount}</p>
                    </div>
                  </div>
                </div>
              ))}
              <button className="w-full py-4 text-label text-text-secondary hover:text-primary transition-colors flex items-center justify-center gap-2 border border-dashed border-border rounded-2xl mt-4">
                <Plus size={14} />
                Add Platform Event
              </button>
            </div>
          </div>
        </motion.div>
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
                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 shadow-sm",
                `bg-${action.color}/10 text-${action.color}`
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
        <div className="mt-8 p-6 bg-surface-variant/50 rounded-2xl border border-dashed border-border text-center">
          <p className="text-xs font-bold text-text-secondary">More advanced controls are available in specific module settings.</p>
        </div>
      </Modal>
    </motion.div>
  );
};

export default DashboardPage;
