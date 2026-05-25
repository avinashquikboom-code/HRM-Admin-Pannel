"use client";

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
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
  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8 pb-10"
    >
      {/* Header Section */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="heading-1 bg-clip-text text-transparent bg-gradient-to-r from-text-primary to-primary">Ecosystem Intelligence</h1>
          <p className="text-text-secondary mt-1 font-medium">Deep dive into platform growth, revenue, and workforce analytics.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-3 bg-surface border border-border rounded-2xl text-xs font-black uppercase tracking-widest text-text-secondary hover:text-primary transition-all duration-300 hover:shadow-lg">
            <Calendar size={18} />
            Fiscal May 2024
          </button>
          <button className="btn-primary shadow-xl shadow-primary/20 px-8 py-3.5">
            <Download size={18} />
            Export Data
          </button>
        </div>
      </motion.div>

      {/* High-Level Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Active Workforce', value: '84,942', trend: '+12.5%', icon: Users, color: 'primary' },
          { label: 'Average Retention', value: '94.2%', trend: '+2.1%', icon: UserCheck, color: 'success' },
          { label: 'New Seats (MTD)', value: '4,281', trend: '+18.7%', icon: UserPlus, color: 'accent' },
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
            <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-1">{stat.label}</p>
            <h3 className="text-3xl font-black text-text-primary tracking-tight">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Employee Trend */}
        <motion.div variants={itemVariants} className="lg:col-span-2 glass-card p-10 group relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
          
          <div className="flex items-center justify-between mb-10 relative z-10">
            <div>
              <h3 className="text-2xl font-black text-text-primary tracking-tight">Workforce Expansion</h3>
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
          <div className="h-[350px] relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
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
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Workforce Health - Pie Chart */}
        <motion.div variants={itemVariants} className="glass-card p-10 flex flex-col">
          <h3 className="text-xl font-black text-text-primary tracking-tight mb-2">Workforce Lifecycle</h3>
          <p className="text-xs text-text-secondary font-medium mb-10">Employee health & state distribution</p>
          
          <div className="h-[250px] w-full mb-8">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={employeeRetentionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {employeeRetentionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-4 mt-auto">
            {employeeRetentionData.map((item, index) => (
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
        <motion.div variants={itemVariants} className="lg:col-span-3 glass-card p-10">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h3 className="text-2xl font-black text-text-primary tracking-tight">Enterprise Scaling</h3>
              <p className="text-sm text-text-secondary font-medium italic">Revenue vs Employee growth correlation across the ecosystem</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-6 py-3 bg-surface-variant text-text-primary font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-surface transition-all border border-border">Daily</button>
              <button className="px-6 py-3 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20">Weekly</button>
            </div>
          </div>
          
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border" opacity={0.3} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 10, fontWeight: 900}} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 10, fontWeight: 900}} />
                <Tooltip cursor={{fill: 'rgba(59, 163, 139, 0.05)', radius: 16}} />
                <Bar dataKey="employees" fill="#3BA38B" radius={[12, 12, 0, 0]} barSize={40} />
                <Bar dataKey="revenue" fill="#F4B860" radius={[12, 12, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <motion.div variants={itemVariants} className="glass-card p-10 bg-gradient-to-br from-primary to-primary-dark text-white border-none overflow-hidden relative group">
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-white/10 rounded-full blur-[120px] group-hover:bg-white/20 transition-all duration-700" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 text-center md:text-left">
            <div className="w-16 h-16 rounded-[28px] bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/20 mx-auto md:mx-0">
              <Activity size={32} className="text-primary-light" />
            </div>
            <h3 className="text-3xl font-black tracking-tighter">AI-Driven Predictive Onboarding</h3>
            <p className="text-white/70 max-w-xl font-medium leading-relaxed">
              Our neural models project a 24% increase in seat allocation for the next quarter based on current ecosystem trends.
            </p>
          </div>
          <button className="px-12 py-5 bg-white text-primary font-black uppercase tracking-[0.2em] text-[10px] rounded-[28px] shadow-2xl hover:bg-primary-light hover:text-white transition-all active:scale-95">
            Execute Strategy <ChevronRight size={16} className="inline ml-1" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AnalyticsPage;
