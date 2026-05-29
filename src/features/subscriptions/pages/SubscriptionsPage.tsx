"use client";

import { useState } from 'react';
import { 
  CreditCard, 
  TrendingUp, 
  Filter,
  Download,
  Search,
  ArrowRight,
  IndianRupee,
  Users,
  Percent,
  Check,
  Zap,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell
} from 'recharts';
import { cn } from '@/utils/cn';
import ChartContainer from '@/components/ChartContainer';
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
  { name: 'Enterprise', value: 45, color: '#6366F1' },
  { name: 'Pro', value: 35, color: '#F59E0B' },
  { name: 'Basic', value: 20, color: '#10B981' },
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
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
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
      <div className="glass-card p-4 border border-border/50 shadow-2xl backdrop-blur-xl bg-surface/90 rounded-2xl">
        <p className="text-micro font-black text-muted uppercase tracking-widest mb-1.5">{label}</p>
        <div className="space-y-0.5">
          <p className="text-lg font-black text-text-primary">
            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(payload[0].value)}
          </p>
          <p className="text-micro font-bold text-success flex items-center gap-1 uppercase tracking-wider">
            <TrendingUp size={10} />
            +14% vs last month
          </p>
        </div>
      </div>
    );
  }
  return null;
};

const SubscriptionsPage = () => {
  const { isLoading } = useLoadingData(600);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const pricingPlans = [
    {
      name: 'Basic',
      monthlyPrice: '₹1,200',
      yearlyPrice: '₹12,000',
      seats: 'Up to 50 active seats',
      desc: 'Essential features for growing startups.',
      features: ['Standard dashboard analytics', 'Up to 5 geofences', 'Email support', '1-year logs retention'],
      activeHires: '20 Companies',
      color: 'from-emerald-500/20 to-emerald-500/5',
      badgeColor: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      buttonVariant: 'secondary',
    },
    {
      name: 'Pro',
      monthlyPrice: '₹4,500',
      yearlyPrice: '₹45,000',
      seats: 'Up to 250 active seats',
      desc: 'Advanced controls for professional enterprises.',
      features: ['Real-time live location tracking', 'Unlimited geofencing alerts', '24/7 priority support', 'Custom report building', 'SSO & Multi-admin access'],
      activeHires: '380 Companies',
      color: 'from-amber-500/20 to-amber-500/5',
      badgeColor: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      buttonVariant: 'primary',
      isPopular: true,
    },
    {
      name: 'Enterprise',
      monthlyPrice: '₹12,400',
      yearlyPrice: '₹124,000',
      seats: 'Unlimited seats & servers',
      desc: 'State-of-the-art power for global organizations.',
      features: ['Dedicated account architect', 'Custom backend API pipelines', 'Tailored hardware integrations', 'Unlimited logs & backups', 'Whiteglove data onboarding'],
      activeHires: '45 Companies',
      color: 'from-indigo-500/20 to-indigo-500/5',
      badgeColor: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
      buttonVariant: 'secondary',
    }
  ];

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-10 pb-12 max-w-7xl mx-auto"
    >
      {/* Header Section */}
      <motion.div 
        variants={itemVariants}
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-surface/30 backdrop-blur-md p-6 rounded-[32px] border border-border/50 shadow-sm"
      >
        <div>
          <h1 className="heading-1 bg-clip-text text-transparent bg-gradient-to-r from-text-primary via-text-primary to-muted">
            Subscription Ecosystem
          </h1>
          <p className="text-page-desc mt-1 max-w-2xl">
            Strategic oversight of platform MRR, tier distribution, active licensing, and global company billing cycles.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button className="flex items-center gap-2.5 px-5 py-3 bg-surface hover:bg-surface-variant/50 border border-border rounded-2xl text-sm font-bold text-text-secondary hover:text-primary transition-all duration-300 hover:shadow-md active:scale-95">
            <Download size={18} />
            Financial Audit
          </button>
          <button className="btn-primary group shadow-xl shadow-primary/20 flex items-center gap-2">
            <CreditCard size={18} className="group-hover:rotate-12 transition-transform" />
            Payout Controls
          </button>
        </div>
      </motion.div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Monthly Revenue', value: '₹842,500', icon: IndianRupee, color: 'primary', trend: '+14.5%', glow: 'bg-indigo-500/10' },
          { label: 'Active Licenses', value: '1,284', icon: Users, color: 'secondary', trend: '+5.2%', glow: 'bg-amber-500/10' },
          { label: 'Net Churn Rate', value: '1.2%', icon: Percent, color: 'error', trend: '-0.4%', glow: 'bg-rose-500/10' },
          { label: 'Customer LTV', value: '₹14,200', icon: CreditCard, color: 'success', trend: '+8.1%', glow: 'bg-emerald-500/10' },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            variants={itemVariants}
            whileHover={{ y: -5, scale: 1.01 }}
            className="glass-card p-6 group hover:border-primary/30 transition-all duration-300 cursor-default relative overflow-hidden"
          >
            <div className={cn("absolute -right-4 -top-4 w-28 h-28 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-all duration-700", stat.glow)} />
            
            <div className="flex items-center justify-between mb-5 relative z-10">
              <div className={cn(
                "p-3 rounded-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-sm",
                stat.color === 'primary' ? "bg-indigo-500/10 text-indigo-500" :
                stat.color === 'secondary' ? "bg-amber-500/10 text-amber-500" :
                stat.color === 'error' ? "bg-rose-500/10 text-rose-500" : "bg-emerald-500/10 text-emerald-500"
              )}>
                <stat.icon size={22} />
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
              <p className="text-xs font-bold text-text-secondary uppercase tracking-wider">{stat.label}</p>
              <h3 className="text-3xl font-black text-text-primary tracking-tight mt-1">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Charts Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Area Chart */}
        <motion.div 
          variants={itemVariants} 
          className="lg:col-span-2 glass-card p-6 sm:p-8 relative overflow-hidden group border border-border/50 shadow-sm"
        >
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-colors duration-1000" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 relative z-10">
            <div>
              <h3 className="heading-2">Revenue Growth Engine</h3>
              <p className="text-sm text-text-secondary mt-0.5">Monthly Recurring Revenue (MRR) performance overview</p>
            </div>
            <select className="bg-surface-variant border border-border/40 rounded-xl px-4 py-2.5 text-sm outline-none font-bold text-text-secondary focus:ring-2 focus:ring-primary/20 self-start sm:self-center cursor-pointer">
              <option>Last 6 Months</option>
              <option>Year to Date</option>
            </select>
          </div>

          <ChartContainer heightClassName="h-[360px]" className="relative z-10">
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.35}/>
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" strokeOpacity={0.6} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: 'var(--text-secondary)', fontSize: 11, fontWeight: 700}} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: 'var(--text-secondary)', fontSize: 11, fontWeight: 700}}
                tickFormatter={(value) => `₹${value/1000}k`}
              />
              <Tooltip 
                cursor={{stroke: '#6366F1', strokeWidth: 1.5, strokeDasharray: '4 4'}} 
                content={<CustomTooltip />}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#6366F1" 
                strokeWidth={3.5} 
                fillOpacity={1} 
                fill="url(#revenueGradient)" 
                animationDuration={1800}
              />
            </AreaChart>
          </ChartContainer>
        </motion.div>

        {/* Plan Distribution Chart */}
        <motion.div 
          variants={itemVariants} 
          className="glass-card p-6 sm:p-8 relative overflow-hidden group border border-border/50 shadow-sm flex flex-col justify-between"
        >
          <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/10 transition-colors duration-1000" />
          
          <div className="relative z-10 mb-6">
            <h3 className="heading-2">Plan Distribution</h3>
            <p className="text-sm text-text-secondary mt-0.5">Share by subscription tier</p>
          </div>

          <div className="relative mb-6 flex items-center justify-center">
            <ChartContainer heightClassName="h-60" className="w-full">
              <PieChart>
                <Pie
                  data={planDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={8}
                  dataKey="value"
                  animationDuration={1500}
                  stroke="none"
                >
                  {planDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} className="outline-none hover:opacity-85 transition-opacity" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: '1px solid var(--border)', 
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                    backgroundColor: 'var(--surface)',
                    color: 'var(--text-primary)'
                  }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                />
              </PieChart>
            </ChartContainer>
            <div className="absolute flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-black text-text-primary tracking-tight">100%</span>
              <span className="text-xs font-bold text-text-secondary uppercase tracking-widest mt-0.5">Revenue</span>
            </div>
          </div>

          <div className="space-y-3 relative z-10 mt-auto">
            {planDistribution.map((plan) => (
              <div 
                key={plan.name} 
                className="flex items-center justify-between p-3.5 rounded-2xl bg-surface-variant/30 hover:bg-surface-variant/70 border border-border/40 hover:border-border transition-all duration-300 group/item cursor-default shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-3.5 h-3.5 rounded-full shadow-inner" style={{ backgroundColor: plan.color }} />
                  <span className="text-sm font-bold text-text-primary group-hover/item:text-primary transition-colors">{plan.name}</span>
                </div>
                <span className="text-sm font-black text-text-primary">{plan.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Pricing Comparison Panel */}
      <motion.div variants={itemVariants} className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-6">
          <div>
            <h3 className="heading-2 flex items-center gap-2">
              <Sparkles className="text-amber-500" size={22} />
              Subscription Tiers Configuration
            </h3>
            <p className="text-sm text-text-secondary mt-0.5">Explore platform-wide pricing models and company-level licenses allocation.</p>
          </div>
          
          {/* Billing cycle toggler */}
          <div className="flex items-center gap-2.5 p-1 bg-surface-variant/40 border border-border/60 rounded-2xl self-start sm:self-center">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 active:scale-95",
                billingCycle === 'monthly' ? "bg-primary text-white shadow-md shadow-primary/20" : "text-text-secondary hover:text-text-primary"
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 active:scale-95 flex items-center gap-1.5",
                billingCycle === 'yearly' ? "bg-primary text-white shadow-md shadow-primary/20" : "text-text-secondary hover:text-text-primary"
              )}
            >
              Yearly
              <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-wider border border-emerald-500/20">
                -17%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {pricingPlans.map((plan) => (
            <motion.div
              key={plan.name}
              whileHover={{ y: -8, scale: 1.01 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "glass-card p-8 flex flex-col relative border overflow-hidden",
                plan.isPopular ? "border-amber-500/40 shadow-xl shadow-amber-500/5" : "border-border/50 shadow-sm"
              )}
            >
              {/* Radial gradient background based on plan theme */}
              <div className={cn("absolute inset-0 bg-gradient-to-b opacity-40 pointer-events-none", plan.color)} />
              
              {plan.isPopular && (
                <div className="absolute top-0 right-0">
                  <div className="bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest py-1.5 px-6 rounded-bl-2xl shadow-md border-l border-b border-amber-600/30 flex items-center gap-1">
                    <Zap size={10} className="fill-current" />
                    Popular Tier
                  </div>
                </div>
              )}

              <div className="relative z-10 mb-6">
                <span className={cn("px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border", plan.badgeColor)}>
                  {plan.name} Tier
                </span>
                <div className="flex items-baseline gap-1 mt-6">
                  <span className="text-4xl font-black text-text-primary tracking-tight">
                    {billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice}
                  </span>
                  <span className="text-xs font-bold text-text-secondary">
                    /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                  </span>
                </div>
                <p className="text-[11px] font-bold text-text-secondary mt-1.5">{plan.seats}</p>
                <p className="text-xs text-text-secondary mt-4 leading-relaxed font-medium">{plan.desc}</p>
              </div>

              {/* Features List */}
              <div className="relative z-10 space-y-3.5 mb-8 border-t border-border/40 pt-6 mt-auto">
                <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Included privileges</p>
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <div className="p-0.5 bg-indigo-500/10 text-indigo-500 rounded-md mt-0.5">
                      <Check size={12} strokeWidth={3} />
                    </div>
                    <span className="text-xs font-semibold text-text-primary leading-tight">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Bottom Card Meta / Button */}
              <div className="relative z-10 border-t border-border/40 pt-6 mt-auto flex flex-col gap-4">
                <div className="flex items-center justify-between text-xs font-bold text-text-secondary">
                  <span>Current Utilization:</span>
                  <span className="text-text-primary font-black">{plan.activeHires}</span>
                </div>
                <button 
                  className={cn(
                    "w-full py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 active:scale-98 flex items-center justify-center gap-2",
                    plan.buttonVariant === 'primary' 
                      ? "bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20" 
                      : "bg-surface-variant hover:bg-surface-variant/80 text-text-primary border border-border/60"
                  )}
                >
                  Configure Tier
                  <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent Invoices Table */}
      <motion.div variants={itemVariants} className="glass-card overflow-hidden border border-border/50 shadow-sm">
        <div className="p-6 sm:p-8 border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10">
            <h3 className="heading-2">Recent Subscriptions</h3>
            <p className="text-sm text-text-secondary mt-0.5">Real-time platform invoice activity and customer accounts logs.</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto relative z-10">
            <div className="relative flex-grow sm:flex-grow-0">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search invoices..." 
                className="pl-11 pr-4 py-3 bg-surface-variant/60 border border-border/40 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:bg-surface transition-all w-full sm:w-64 font-bold text-text-primary placeholder:text-muted"
              />
            </div>
            <button className="p-3 bg-surface hover:bg-surface-variant/50 rounded-2xl text-text-secondary border border-border hover:shadow-md transition-all active:scale-95 flex-shrink-0">
              <Filter size={18} />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="p-8">
            <TableSkeleton rows={4} columns={6} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-variant/20">
                  <th className="px-6 sm:px-8 py-4 text-xs font-bold uppercase tracking-widest text-text-secondary border-b border-border/50">Invoice ID</th>
                  <th className="px-6 sm:px-8 py-4 text-xs font-bold uppercase tracking-widest text-text-secondary border-b border-border/50">Company Name</th>
                  <th className="px-6 sm:px-8 py-4 text-xs font-bold uppercase tracking-widest text-text-secondary border-b border-border/50">Licensing Tier</th>
                  <th className="px-6 sm:px-8 py-4 text-xs font-bold uppercase tracking-widest text-text-secondary border-b border-border/50">Amount Due</th>
                  <th className="px-6 sm:px-8 py-4 text-xs font-bold uppercase tracking-widest text-text-secondary border-b border-border/50">Bill Cycle</th>
                  <th className="px-6 sm:px-8 py-4 text-xs font-bold uppercase tracking-widest text-text-secondary border-b border-border/50">Payment Status</th>
                  <th className="px-6 sm:px-8 py-4 text-xs font-bold uppercase tracking-widest text-text-secondary border-b border-border/50 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {recentInvoices.map((invoice) => (
                  <motion.tr 
                    key={invoice.id}
                    variants={itemVariants}
                    className="hover:bg-surface-variant/20 transition-all duration-200 group cursor-pointer"
                  >
                    <td className="px-6 sm:px-8 py-5">
                      <span className="font-mono text-micro font-black text-text-secondary bg-surface border border-border/80 px-2.5 py-1.5 rounded-xl shadow-inner group-hover:border-primary/20 transition-all">
                        {invoice.id}
                      </span>
                    </td>
                    <td className="px-6 sm:px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-indigo-500/5 text-indigo-500 font-black text-xs flex items-center justify-center group-hover:scale-105 transition-all duration-300 shadow-sm border border-indigo-500/10">
                          {invoice.company.substring(0, 2)}
                        </div>
                        <span className="font-bold text-text-primary group-hover:text-primary transition-colors">{invoice.company}</span>
                      </div>
                    </td>
                    <td className="px-6 sm:px-8 py-5">
                      <span className={cn(
                        "text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider border",
                        invoice.plan === 'Enterprise' ? "bg-indigo-500/10 text-indigo-500 border-indigo-500/20" :
                        invoice.plan === 'Pro' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                      )}>
                        {invoice.plan}
                      </span>
                    </td>
                    <td className="px-6 sm:px-8 py-5 font-black text-text-primary tracking-tight tabular-nums">{invoice.amount}</td>
                    <td className="px-6 sm:px-8 py-5 text-xs font-bold text-text-secondary">{invoice.date}</td>
                    <td className="px-6 sm:px-8 py-5">
                      <span className={cn(
                        "px-3 py-1.5 rounded-xl text-micro font-bold uppercase tracking-widest inline-flex items-center gap-1.5 border shadow-inner",
                        invoice.status === 'Paid' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : 
                        invoice.status === 'Overdue' ? "bg-rose-500/10 text-rose-500 border-rose-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                      )}>
                        <span className={cn(
                          "w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentColor]",
                          invoice.status === 'Paid' ? "bg-emerald-500" : 
                          invoice.status === 'Overdue' ? "bg-rose-500 animate-pulse" : "bg-amber-500"
                        )} />
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 sm:px-8 py-5 text-right">
                      <button className="p-2 bg-surface hover:bg-surface-variant border border-border/80 hover:border-border rounded-xl transition-all shadow-sm">
                        <ArrowRight size={16} className="text-text-secondary group-hover:text-primary transition-all group-hover:translate-x-0.5" />
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
