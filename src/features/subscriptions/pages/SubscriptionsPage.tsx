"use client";

import { 
  CreditCard, 
  TrendingUp, 
  Filter,
  Download,
  Search,
  ArrowRight,
  IndianRupee,
  Users,
  Percent
} from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { cn } from '@/utils/cn';
import TableSkeleton from '@/components/TableSkeleton';
import { useLoadingData } from '@/hooks/useLoadingData';


const revenueData = [
  { name: 'Jan', value: 450000, churn: 12000 },
  { name: 'Feb', value: 520000, churn: 15000 },
  { name: 'Mar', value: 480000, churn: 18000 },
  { name: 'Apr', value: 610000, churn: 14000 },
  { name: 'May', value: 720000, churn: 11000 },
  { name: 'Jun', value: 850000, churn: 9000 },
];

const planDistribution = [
  { name: 'Enterprise', value: 45, color: '#1E293B' },
  { name: 'Pro', value: 35, color: '#F4B860' },
  { name: 'Basic', value: 20, color: '#3BA38B' },
];

const recentInvoices = [
  { 
    id: 'INV-2024-001', 
    company: 'TechVibe Inc.', 
    plan: 'Enterprise', 
    amount: '₹12,400', 
    status: 'Paid', 
    date: '28 Apr 2024' 
  },
  { 
    id: 'INV-2024-002', 
    company: 'Global Logistics', 
    plan: 'Pro', 
    amount: '₹4,500', 
    status: 'Pending', 
    date: '30 Apr 2024' 
  },
  { 
    id: 'INV-2024-003', 
    company: 'EcoWare Solutions', 
    plan: 'Basic', 
    amount: '₹1,200', 
    status: 'Overdue', 
    date: '01 May 2024' 
  },
  { 
    id: 'INV-2024-004', 
    company: 'Innovate Digital', 
    plan: 'Pro', 
    amount: '₹4,500', 
    status: 'Paid', 
    date: '02 May 2024' 
  },
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

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-4 border-none shadow-2xl backdrop-blur-xl bg-surface/80">
        <p className="text-xs font-bold text-muted uppercase tracking-widest mb-2">{label}</p>
        <div className="space-y-1">
          <p className="text-lg font-black text-primary">
            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(payload[0].value)}
          </p>
          <p className="text-micro font-bold text-text-secondary flex items-center gap-1 uppercase">
            <TrendingUp size={10} className="text-success" />
            +14% vs last month
          </p>
        </div>
      </div>
    );
  }
  return null;
};


const SubscriptionsPage = () => {
  const { isLoading } = useLoadingData(800);


  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-10"
    >
      {/* Header Section */}
      <motion.div 
        variants={itemVariants}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div>
          <h1 className="heading-1 bg-clip-text text-transparent bg-gradient-to-r from-text-primary to-muted">
            Subscriptions & Revenue
          </h1>
          <p className="text-page-desc mt-1 max-w-2xl">
            Strategic oversight of platform MRR, churn dynamics, and company-level billing cycles.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-3 bg-surface border border-border rounded-2xl text-sm font-bold text-text-secondary hover:text-primary transition-all hover:shadow-lg active:scale-95">
            <Download size={18} />
            Financial Audit
          </button>
          <button className="btn-primary group shadow-xl shadow-primary/20">
            <CreditCard size={20} className="group-hover:rotate-12 transition-transform" />
            Payout Controls
          </button>
        </div>
      </motion.div>


      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Monthly Revenue', value: '₹842,500', icon: IndianRupee, color: 'primary', trend: '+14.5%' },
          { label: 'Active Licenses', value: '1,284', icon: Users, color: 'secondary', trend: '+5.2%' },
          { label: 'Net Churn Rate', value: '1.2%', icon: Percent, color: 'error', trend: '-0.4%' },
          { label: 'Customer LTV', value: '₹14,200', icon: CreditCard, color: 'success', trend: '+8.1%' },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            variants={itemVariants}
            whileHover={{ y: -5 }}
            className="glass-card p-6 group hover:border-primary/50 transition-all cursor-default relative overflow-hidden"
          >
            <div className={cn(
              "absolute -right-4 -top-4 w-24 h-24 rounded-full blur-3xl opacity-10 group-hover:opacity-30 transition-all duration-700",
              stat.color === 'primary' ? "bg-primary" :
              stat.color === 'secondary' ? "bg-secondary" :
              stat.color === 'error' ? "bg-error" : "bg-success"
            )} />
            
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className={cn(
                "p-3 rounded-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-sm",
                stat.color === 'primary' ? "bg-primary/10 text-primary" :
                stat.color === 'secondary' ? "bg-secondary/10 text-secondary" :
                stat.color === 'error' ? "bg-error/10 text-error" : "bg-success/10 text-success"
              )}>
                <stat.icon size={24} />
              </div>
              <div className={cn(
                "flex items-center gap-1 px-2.5 py-1 rounded-lg text-micro font-black tracking-wider uppercase",
                stat.trend.startsWith('+') ? "bg-success/10 text-success" : "bg-error/10 text-error"
              )}>
                <TrendingUp size={12} className={cn(!stat.trend.startsWith('+') && "rotate-180")} />
                {stat.trend}
              </div>
            </div>
            <div className="relative z-10">
              <p className="text-xs font-bold text-muted uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-stat-value mt-1">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>


      {/* Revenue Analytics & Plan Distribution */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <motion.div variants={itemVariants} className="xl:col-span-2 glass-card p-8 relative overflow-hidden group">
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-1000" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 relative z-10">
            <div>
              <h3 className="heading-2">Revenue Growth Engine</h3>
              <p className="text-sm text-page-desc mt-1">Monthly Recurring Revenue (MRR) performance analysis</p>
            </div>
            <select className="bg-surface-variant border-none rounded-xl px-4 py-2 text-sm outline-none font-semibold text-text-secondary focus:ring-2 focus:ring-primary/20 self-start sm:self-center cursor-pointer">
              <option>Last 6 Months</option>
              <option>Year to Date</option>
            </select>
          </div>

          <div className="h-[350px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3BA38B" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3BA38B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: 'var(--text-secondary)', fontSize: 10, fontWeight: 900}} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: 'var(--text-secondary)', fontSize: 10, fontWeight: 900}}
                  tickFormatter={(value) => `₹${value/1000}k`}
                />
                <Tooltip 
                  cursor={{stroke: '#3BA38B', strokeWidth: 2}} 
                  content={<CustomTooltip />}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3BA38B" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#revenueGradient)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-card p-8 flex flex-col">
          <h3 className="heading-2 mb-2">Plan Distribution</h3>
          <p className="text-sm text-text-secondary mb-8 font-medium">Revenue share by subscription tier</p>
          
          <div className="h-64 w-full relative mb-8">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={planDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={8}
                  dataKey="value"
                  animationDuration={1500}
                  stroke="none"
                >
                  {planDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} className="outline-none" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    backgroundColor: 'var(--surface)',
                    backdropFilter: 'blur(8px)',
                    color: 'var(--text-primary)'
                  }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-stat-valueer">100%</span>
              <span className="text-label text-text-secondary">Revenue</span>
            </div>
          </div>

          <div className="space-y-4 mt-auto">
            {planDistribution.map((plan) => (
              <div key={plan.name} className="flex items-center justify-between p-3 rounded-2xl bg-surface-variant group hover:bg-surface transition-all border border-transparent hover:border-border shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: plan.color }} />
                  <span className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors">{plan.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-text-primary">{plan.value}%</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Invoices Table */}
      <motion.div variants={itemVariants} className="glass-card overflow-hidden">
        <div className="p-8 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h3 className="heading-2">Recent Subscriptions</h3>
            <p className="text-sm text-page-desc mt-1">Real-time billing activity across the platform</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-grow sm:flex-grow-0">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search invoices..." 
                className="pl-11 pr-4 py-3 bg-surface-variant border-none rounded-2xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all w-full sm:w-64 font-bold text-text-primary"
              />
            </div>
            <button className="p-3 bg-surface-variant hover:bg-border/50 rounded-2xl text-text-secondary transition-all active:scale-95 border border-border/50">
              <Filter size={20} />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="p-8">
            <TableSkeleton rows={5} columns={6} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-variant/50">
                  <th className="px-8 py-5 text-label text-muted border-b border-border">Invoice ID</th>
                  <th className="px-8 py-5 text-label text-muted border-b border-border">Company</th>
                  <th className="px-8 py-5 text-label text-muted border-b border-border">Plan</th>
                  <th className="px-8 py-5 text-label text-muted border-b border-border">Amount</th>
                  <th className="px-8 py-5 text-label text-muted border-b border-border">Status</th>
                  <th className="px-8 py-5 text-label text-muted border-b border-border text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentInvoices.map((invoice) => (
                  <motion.tr 
                    key={invoice.id}
                    variants={itemVariants}
                    className="hover:bg-surface-variant/30 transition-colors group cursor-pointer"
                  >
                    <td className="px-8 py-6">
                      <span className="font-mono text-micro font-black text-muted bg-surface-variant px-2.5 py-1.5 rounded-xl border border-border shadow-sm">
                        {invoice.id}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-black text-xs group-hover:scale-110 transition-all duration-300 shadow-sm border border-primary/10">
                          {invoice.company.substring(0, 2)}
                        </div>
                        <span className="font-black text-text-primary tracking-tight group-hover:text-primary transition-colors">{invoice.company}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={cn(
                        "text-micro font-black px-3 py-1 rounded-xl uppercase tracking-widest border",
                        invoice.plan === 'Enterprise' ? "bg-secondary text-white border-secondary" :
                        invoice.plan === 'Pro' ? "bg-accent/10 text-accent border-accent/10" : "bg-primary/10 text-primary border-primary/10"
                      )}>
                        {invoice.plan}
                      </span>
                    </td>
                    <td className="px-8 py-6 font-black text-text-primary tracking-tight tabular-nums">{invoice.amount}</td>
                    <td className="px-8 py-6">
                      <span className={cn(
                        "px-4 py-1.5 rounded-xl text-label inline-flex items-center gap-2 border shadow-sm",
                        invoice.status === 'Paid' ? "bg-success/10 text-success border-success/10" : 
                        invoice.status === 'Overdue' ? "bg-error/10 text-error border-error/10" : "bg-warning/10 text-warning border-warning/10"
                      )}>
                        <span className={cn(
                          "w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentColor]",
                          invoice.status === 'Paid' ? "bg-success" : 
                          invoice.status === 'Overdue' ? "bg-error animate-pulse" : "bg-warning"
                        )} />
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button className="p-2.5 hover:bg-surface-variant rounded-xl transition-all border border-transparent hover:border-border shadow-sm">
                        <ArrowRight size={20} className="text-muted group-hover:text-primary transition-colors" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default SubscriptionsPage;
