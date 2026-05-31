"use client";

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { isDevAuthSession } from '@/lib/devAuth';
import TableSkeleton from '@/components/TableSkeleton';

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { motion, Variants } from 'framer-motion';
import { 
  Download, 
  Calendar, 
  Filter, 
  TrendingUp, 
  Users, 
  UserCheck, 
  UserPlus, 
  Activity,
  ArrowUpRight,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/utils/cn';
import ChartContainer from '@/components/ChartContainer';

const data = [
  { name: 'Week 1', revenue: 4000, employees: 2400, companies: 2400 },
  { name: 'Week 2', revenue: 3000, employees: 3398, companies: 2210 },
  { name: 'Week 3', revenue: 2000, employees: 5800, companies: 2290 },
  { name: 'Week 4', revenue: 2780, employees: 3908, companies: 2000 },
  { name: 'Week 5', revenue: 1890, employees: 4800, companies: 2181 },
  { name: 'Week 6', revenue: 2390, employees: 6800, companies: 2500 },
  { name: 'Week 7', revenue: 3490, employees: 8300, companies: 2100 },
];

const employeeRetentionData = [
  { name: 'Active', value: 85 },
  { name: 'Probation', value: 10 },
  { name: 'Offboarding', value: 5 },
];

const COLORS = ['#3BA38B', '#F4B860', '#EF4444'];

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

const AnalyticsPage = () => {
  const [stats, setStats] = useState<any>({
    totalEmployees: 84942,
    activeEmployees: 80000,
    onLeaveEmployees: 4942,
    averageRetention: '94.2%',
    totalPresentToday: 4281,
  });
  const [chartData, setChartData] = useState<any[]>(data);
  const [retentionData, setRetentionData] = useState<any[]>(employeeRetentionData);
  const [isPageLoading, setIsPageLoading] = useState(true);

  const loadAnalyticsData = useCallback(async () => {
    setIsPageLoading(true);
    try {
      if (isDevAuthSession()) {
        setStats({
          totalEmployees: 84942,
          activeEmployees: 80000,
          onLeaveEmployees: 4942,
          averageRetention: '94.2%',
          totalPresentToday: 4281,
        });
        setChartData(data);
        setRetentionData(employeeRetentionData);
      } else {
        const res = await api.get<{
          success: boolean;
          totalEmployees: number;
          activeEmployees: number;
          onLeaveEmployees: number;
          averageRetention: string;
          presentToday: number;
          data: any[];
          employeeRetentionData: any[];
        }>('/api/admin/analytics/overview');
        
        if (res.data.success) {
          setStats({
            totalEmployees: res.data.totalEmployees,
            activeEmployees: res.data.activeEmployees,
            onLeaveEmployees: res.data.onLeaveEmployees,
            averageRetention: res.data.averageRetention,
            totalPresentToday: res.data.presentToday,
          });
          setChartData(res.data.data);
          setRetentionData(res.data.employeeRetentionData);
        }
      }
    } catch (err) {
      console.error('Failed to load analytics overview:', err);
    } finally {
      setIsPageLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalyticsData();
  }, [loadAnalyticsData]);

  if (isPageLoading) {
    return (
      <div className="space-y-8 pb-10">
        <div className="h-20 w-1/3 bg-surface-variant rounded-2xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass-card p-8 space-y-4">
              <div className="h-6 w-24 bg-surface-variant rounded-md animate-pulse" />
              <div className="h-10 w-36 bg-surface-variant rounded-md animate-pulse" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 glass-card p-8">
            <TableSkeleton rows={4} columns={1} />
          </div>
          <div className="glass-card p-8">
            <TableSkeleton rows={4} columns={1} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8 pb-10 text-slate-100 animate-fadeIn"
    >
      {/* Title Header Command hub */}
      <motion.div variants={itemVariants} className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-slate-900/90 to-slate-950/95 backdrop-blur-xl p-8 md:p-10 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div className="absolute -top-12 -right-12 w-96 h-96 bg-primary/10 rounded-full filter blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute -bottom-24 -left-12 w-80 h-80 bg-emerald-500/5 rounded-full filter blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/20 to-emerald-500/10 border border-primary/30 text-primary text-[10px] font-black px-3.5 py-1.5 rounded-full uppercase tracking-widest shadow-inner">
            <TrendingUp size={12} className="text-primary animate-pulse" />
            Ecosystem Intelligence & Analytics
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-none">
            Ecosystem <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-teal-400 to-emerald-400">Intelligence</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-400 font-medium max-w-xl leading-relaxed">
            Deep dive into platform growth, workforce constraints, active retention curves, and revenue patterns.
          </p>
        </div>

        <div className="relative z-10 shrink-0 flex items-center gap-3">
          <button className="btn-primary shadow-xl shadow-primary/20 hover:shadow-primary/30 px-6.5 py-4 shrink-0 rounded-2xl text-xs font-black uppercase tracking-wider justify-center">
            <Download size={18} />
            Export Data
          </button>
        </div>
      </motion.div>

      {/* High-Level Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Active Workforce', value: stats.totalEmployees.toLocaleString(), trend: '+12.5%', icon: Users, color: 'primary' },
          { label: 'Average Retention', value: stats.averageRetention, trend: '+2.1%', icon: UserCheck, color: 'success' },
          { label: 'New Seats (MTD)', value: stats.totalPresentToday.toLocaleString(), trend: '+18.7%', icon: UserPlus, color: 'accent' },
        ].map((stat) => (
          <motion.div key={stat.label} variants={itemVariants} className="glass-card p-8 group hover:border-primary/30 transition-all cursor-default relative overflow-hidden">
            <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <stat.icon size={64} />
            </div>
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-3 rounded-2xl", `bg-${stat.color}/10 text-${stat.color}`)}>
                <stat.icon size={22} />
              </div>
              <span className="text-xs font-black text-success bg-success/10 px-2.5 py-1 rounded-full">{stat.trend}</span>
            </div>
            <p className="text-label text-text-secondary tracking-[0.2em] mb-1">{stat.label}</p>
            <h3 className="text-stat-value">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Employee Trend */}
        <motion.div variants={itemVariants} className="lg:col-span-2 glass-card p-6 sm:p-8 md:p-10 group relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
          
          <div className="flex items-center justify-between mb-10 relative z-10">
            <div>
              <h3 className="heading-2">Workforce Expansion</h3>
              <p className="text-sm text-text-secondary font-medium italic">Global employee registration & seat allocation metrics</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-xs font-bold text-primary">
                <div className="w-2 h-2 rounded-full bg-primary" />
                Active Seats
              </div>
              <button className="p-3 bg-surface-variant rounded-xl text-muted hover:text-primary transition-colors"><Filter size={18} /></button>
            </div>
          </div>
          <ChartContainer heightClassName="h-[350px]" className="relative z-10">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorEmployees" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3BA38B" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3BA38B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border" opacity={0.3} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 10, fontWeight: 900}} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 10, fontWeight: 900}} />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '24px', 
                    border: 'none', 
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(20px)',
                    padding: '16px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="employees" 
                  stroke="#3BA38B" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorEmployees)"
                  animationDuration={2500}
                />
              </AreaChart>
          </ChartContainer>
        </motion.div>

        {/* Workforce Health - Pie Chart */}
        <motion.div variants={itemVariants} className="glass-card p-6 sm:p-8 md:p-10 flex flex-col">
          <h3 className="text-xl font-black text-text-primary tracking-tight mb-2">Workforce Lifecycle</h3>
          <p className="text-xs text-text-secondary font-medium mb-10">Employee health & state distribution</p>
          
          <ChartContainer heightClassName="h-[250px]" className="mb-8">
              <PieChart>
                <Pie
                  data={retentionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {retentionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
          </ChartContainer>

          <div className="space-y-4 mt-auto">
            {retentionData.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between p-4 bg-surface-variant/50 rounded-2xl border border-border/50 group hover:border-primary/20 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                  <span className="text-sm font-black text-text-primary">{item.name}</span>
                </div>
                <span className="text-sm font-black text-text-secondary">{item.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Industry Distribution */}
        <motion.div variants={itemVariants} className="lg:col-span-3 glass-card p-6 sm:p-8 md:p-10">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h3 className="heading-2">Enterprise Scaling</h3>
              <p className="text-sm text-text-secondary font-medium italic">Revenue vs Employee growth correlation across the ecosystem</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-6 py-3 bg-surface-variant text-text-primary text-label rounded-xl hover:bg-surface transition-all border border-border">Daily</button>
              <button className="px-6 py-3 bg-primary text-white text-label rounded-xl shadow-lg shadow-primary/20">Weekly</button>
            </div>
          </div>
          
          <ChartContainer heightClassName="h-[400px]">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border" opacity={0.3} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 10, fontWeight: 900}} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 10, fontWeight: 900}} />
                <Tooltip cursor={{fill: 'rgba(59, 163, 139, 0.05)', radius: 16}} />
                <Bar dataKey="employees" fill="#3BA38B" radius={[12, 12, 0, 0]} barSize={40} />
                <Bar dataKey="revenue" fill="#F4B860" radius={[12, 12, 0, 0]} barSize={40} />
              </BarChart>
          </ChartContainer>
        </motion.div>
      </div>

      <motion.div variants={itemVariants} className="glass-card p-6 sm:p-8 md:p-10 bg-gradient-to-br from-primary to-primary-dark text-white border-none overflow-hidden relative group">
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-white/10 rounded-full blur-[120px] group-hover:bg-white/20 transition-all duration-700" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 text-center md:text-left">
            <div className="w-16 h-16 rounded-[28px] bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/20 mx-auto md:mx-0">
              <Activity size={32} className="text-primary-light" />
            </div>
            <h3 className="text-xl font-semibold tracking-tight">AI-Driven Predictive Onboarding</h3>
            <p className="text-white/70 max-w-xl font-medium leading-relaxed">
              Our neural models project a 24% increase in seat allocation for the next quarter based on current ecosystem trends.
            </p>
          </div>
          <button className="px-12 py-5 bg-white text-primary text-label tracking-[0.2em] rounded-[28px] shadow-2xl hover:bg-primary-light hover:text-white transition-all active:scale-95">
            Execute Strategy <ChevronRight size={16} className="inline ml-1" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AnalyticsPage;
