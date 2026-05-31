"use client";

import { useState, useEffect, useCallback } from 'react';
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
  Sparkles,
  ShieldCheck,
  WalletCards,
  Building2,
  CalendarClock,
  Loader2,
  AlertTriangle,
  Settings2
} from 'lucide-react';
import { motion, Variants } from 'framer-motion';
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
import Modal from '@/components/Modal';
import { useLoadingData } from '@/hooks/useLoadingData';
import { useCompanyStats } from '@/hooks/useCompanyStats';
import {
  fetchSubscriptions, updateSubscription, fetchPricingPlans, updatePricingPlan,
  type Subscription, type PricingPlan
} from '@/services/subscriptionService';

const revenueData = [
  { name: 'Jan', value: 450000, churn: 12000 },
  { name: 'Feb', value: 520000, churn: 15000 },
  { name: 'Mar', value: 480000, churn: 18000 },
  { name: 'Apr', value: 610000, churn: 14000 },
  { name: 'May', value: 720000, churn: 11000 },
  { name: 'Jun', value: 850000, churn: 9000 },
];

// planDistribution is now computed dynamically from subscriptions data below

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
  const { isLoading: isStaticLoading } = useLoadingData(600);
  const { stats, isLoading: isStatsLoading, refetch: refetchStats } = useCompanyStats();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  // Subscription integration states
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoadingSubs, setIsLoadingSubs] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [planFilter, setPlanFilter] = useState('All');

  // Pricing Plans states
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
  const [isPricingLoading, setIsPricingLoading] = useState(true);
  // Pricing Edit Modal
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);
  const [editMonthly, setEditMonthly] = useState('');
  const [editYearly, setEditYearly] = useState('');
  const [editSeats, setEditSeats] = useState('');
  const [isSavingPrice, setIsSavingPrice] = useState(false);
  const [priceSaveSuccess, setPriceSaveSuccess] = useState('');

  // Subscription Edit Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);
  const [modalPlan, setModalPlan] = useState('Basic');
  const [modalCycle, setModalCycle] = useState('monthly');
  const [modalStatus, setModalStatus] = useState('Paid');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadSubscriptionsData = useCallback(async () => {
    setIsLoadingSubs(true);
    try {
      const data = await fetchSubscriptions();
      setSubscriptions(data);
    } catch (err) {
      console.error('Failed to load subscriptions:', err);
    } finally {
      setIsLoadingSubs(false);
    }
  }, []);

  const loadPricingPlans = useCallback(async () => {
    setIsPricingLoading(true);
    try {
      const data = await fetchPricingPlans();
      setPricingPlans(data);
    } catch (err) {
      console.error('Failed to load pricing plans:', err);
    } finally {
      setIsPricingLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSubscriptionsData();
    loadPricingPlans();
  }, [loadSubscriptionsData, loadPricingPlans]);

  const handleOpenPricingEdit = (plan: PricingPlan) => {
    setEditingPlan(plan);
    setEditMonthly(plan.monthlyPrice.toString());
    setEditYearly(plan.yearlyPrice.toString());
    setEditSeats(plan.seatsLabel);
    setPriceSaveSuccess('');
    setIsPricingModalOpen(true);
  };

  const handleSavePricing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;
    const monthly = parseFloat(editMonthly);
    const yearly = parseFloat(editYearly);
    if (isNaN(monthly) || monthly < 0 || isNaN(yearly) || yearly < 0) {
      alert('Please enter valid non-negative prices.');
      return;
    }
    setIsSavingPrice(true);
    try {
      const result = await updatePricingPlan(editingPlan.id, {
        monthlyPrice: monthly,
        yearlyPrice: yearly,
        seatsLabel: editSeats,
      });
      // Update local state immediately
      setPricingPlans(prev =>
        prev.map(p => p.id === editingPlan.id ? result.pricingPlan : p)
      );
      setPriceSaveSuccess(result.message);
      setTimeout(() => {
        setIsPricingModalOpen(false);
        setEditingPlan(null);
        setPriceSaveSuccess('');
      }, 1200);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update pricing');
    } finally {
      setIsSavingPrice(false);
    }
  };

  // Helper to format price as ₹ string from pricingPlans
  const getPlanPrice = (planName: string, cycle: 'monthly' | 'yearly') => {
    const p = pricingPlans.find(pl => pl.name.toLowerCase() === planName.toLowerCase());
    if (!p) return cycle === 'monthly' ? '₹1,200' : '₹12,000';
    const val = cycle === 'monthly' ? p.monthlyPrice : p.yearlyPrice;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const handleOpenConfigure = (sub: Subscription) => {
    setSelectedSub(sub);
    setModalPlan(sub.plan);
    setModalCycle(sub.billingCycle);
    setModalStatus(sub.status);
    setIsModalOpen(true);
  };

  const handleOpenConfigureForPlan = (planName: string) => {
    if (subscriptions.length > 0) {
      const firstWithPlan = subscriptions.find(s => s.plan.toLowerCase() === planName.toLowerCase());
      if (firstWithPlan) {
        handleOpenConfigure(firstWithPlan);
        return;
      }
      setSelectedSub(subscriptions[0]);
    } else {
      setSelectedSub(null);
    }
    setModalPlan(planName);
    setModalCycle('monthly');
    setModalStatus('Paid');
    setIsModalOpen(true);
  };

  const handleSaveSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub) {
      alert('Please select a company/subscription to configure.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await updateSubscription(selectedSub.id, {
        plan: modalPlan,
        billingCycle: modalCycle,
        invoiceStatus: modalStatus
      });
      
      // Refresh backend datasets and hook metrics
      await loadSubscriptionsData();
      await refetchStats();
      
      setIsModalOpen(false);
      setSelectedSub(null);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Failed to update subscription');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = isStaticLoading || isStatsLoading || isLoadingSubs;

  const basicCount = stats?.planMix?.find((p) => p.name === 'Basic')?.count ?? 20;
  const proCount = stats?.planMix?.find((p) => p.name === 'Pro')?.count ?? 380;
  const enterpriseCount = stats?.planMix?.find((p) => p.name === 'Enterprise')?.count ?? 45;

  const planConfigs = [
    {
      name: 'Basic',
      features: ['Standard dashboard analytics', 'Up to 5 geofences', 'Email support', '1-year logs retention'],
      activeHires: `${basicCount} ${basicCount === 1 ? 'Company' : 'Companies'}`,
      color: 'from-emerald-500/20 to-emerald-500/5',
      accent: 'emerald',
      badgeColor: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      buttonVariant: 'secondary',
    },
    {
      name: 'Pro',
      features: ['Real-time live location tracking', 'Unlimited geofencing alerts', '24/7 priority support', 'Custom report building', 'SSO & Multi-admin access'],
      activeHires: `${proCount} ${proCount === 1 ? 'Company' : 'Companies'}`,
      color: 'from-amber-500/20 to-amber-500/5',
      accent: 'amber',
      badgeColor: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      buttonVariant: 'primary',
      isPopular: true,
    },
    {
      name: 'Enterprise',
      features: ['Dedicated account architect', 'Custom backend API pipelines', 'Tailored hardware integrations', 'Unlimited logs & backups', 'Whiteglove data onboarding'],
      activeHires: `${enterpriseCount} ${enterpriseCount === 1 ? 'Company' : 'Companies'}`,
      color: 'from-indigo-500/20 to-indigo-500/5',
      accent: 'indigo',
      badgeColor: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
      buttonVariant: 'secondary',
    }
  ];
  // Merge with live DB pricing data
  const mergedPlanConfigs = planConfigs.map(pc => {
    const dbPlan = pricingPlans.find(p => p.name.toLowerCase() === pc.name.toLowerCase());
    return {
      ...pc,
      monthlyPrice: dbPlan ? `₹${dbPlan.monthlyPrice.toLocaleString('en-IN')}` : getPlanPrice(pc.name, 'monthly'),
      yearlyPrice: dbPlan ? `₹${dbPlan.yearlyPrice.toLocaleString('en-IN')}` : getPlanPrice(pc.name, 'yearly'),
      seats: dbPlan?.seatsLabel || '',
      desc: dbPlan?.description || '',
      dbPlan,
    };
  });

  // Map real subscription data to list
  const activeInvoices = subscriptions.length > 0 
    ? subscriptions.map(s => ({
        id: s.invoiceId,
        company: s.company,
        plan: s.plan,
        amount: s.amount,
        status: s.status,
        date: s.joiningDate,
        rawSub: s
      }))
    : (stats?.recentInvoices ?? recentInvoices).map(s => ({ ...s, rawSub: null }));

  // Filters and Searching implementation
  const filteredInvoices = activeInvoices.filter(inv => {
    const matchesSearch = searchQuery === '' || 
      inv.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.id.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesPlan = planFilter === 'All' || 
      inv.plan.toLowerCase() === planFilter.toLowerCase();
      
    const matchesStatus = statusFilter === 'All' || 
      inv.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesPlan && matchesStatus;
  });

  const activePlanMix = stats?.planMix?.map((p: { name: string; percent: number; color: string }) => ({
    name: p.name,
    value: p.percent,
    color: p.color === 'bg-primary' ? '#6366F1' : p.color === 'bg-accent' ? '#F59E0B' : '#10B981'
  })) ?? (() => {
    const counts: Record<string, number> = {};
    subscriptions.forEach((s) => {
      counts[s.plan] = (counts[s.plan] || 0) + 1;
    });
    const total = subscriptions.length || 1;
    const colors: Record<string, string> = { Enterprise: '#6366F1', Pro: '#F59E0B', Basic: '#10B981' };
    return Object.entries(counts).map(([name, value]) => ({
      name,
      value: Math.round((value / total) * 100),
      color: colors[name] || '#64748B',
    }));
  })();

  const revenueVal = stats ? `₹${stats.monthlyRevenue.toLocaleString('en-IN')}` : '₹8,42,500';
  const seatsVal = stats ? stats.globalSeats.toLocaleString('en-IN') : '1,284';

  const summaryCards = [
    { label: 'Monthly Revenue', value: revenueVal, icon: IndianRupee, color: 'primary', trend: '+14.5%', glow: 'bg-indigo-500/10', detail: '₹96k projected uplift' },
    { label: 'Active Licenses', value: seatsVal, icon: Users, color: 'secondary', trend: '+5.2%', glow: 'bg-amber-500/10', detail: '445 seats added this quarter' },
    { label: 'Net Churn Rate', value: '1.2%', icon: Percent, color: 'error', trend: '-0.4%', glow: 'bg-rose-500/10', detail: 'Lowest in 6 months' },
    { label: 'Customer LTV', value: '₹14,200', icon: CreditCard, color: 'success', trend: '+8.1%', glow: 'bg-emerald-500/10', detail: 'Healthy expansion revenue' },
  ];

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-12 max-w-7xl mx-auto"
    >
      <motion.div 
        variants={itemVariants}
        className="relative overflow-hidden rounded-[36px] border border-border/50 bg-gradient-to-br from-primary/15 via-surface to-amber-500/10 p-6 sm:p-8 shadow-sm"
      >
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="relative z-10 grid grid-cols-1 gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-center">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-2 text-xs font-black uppercase tracking-widest text-primary">
              <Sparkles size={14} />
              Super Admin Billing Console
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-text-primary animate-text-reveal">
              Subscription Control Center
            </h1>
            <p className="text-page-desc mt-3 max-w-2xl">
              Monitor recurring revenue, manage platform tiers, track invoices, and identify expansion opportunities across all companies.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button 
                onClick={() => {
                  if (subscriptions.length > 0) {
                    handleOpenConfigure(subscriptions[0]);
                  } else {
                    setIsModalOpen(true);
                  }
                }}
                className="btn-primary group shadow-xl shadow-primary/20 flex items-center gap-2"
              >
                <WalletCards size={18} className="group-hover:rotate-12 transition-transform" />
                Manage Billing
              </button>
              <button className="flex items-center gap-2.5 px-5 py-3 bg-surface/80 hover:bg-surface border border-border rounded-2xl text-sm font-bold text-text-secondary hover:text-primary transition-all duration-300 hover:shadow-md active:scale-95">
                <Download size={18} />
                Export Report
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Collections', value: '98.7%', icon: ShieldCheck },
              { label: 'Companies', value: stats ? stats.totalEntities.toString() : '445', icon: Building2 },
              { label: 'Renewals Due', value: '28', icon: CalendarClock },
              { label: 'ARR Run Rate', value: stats ? `₹${(stats.monthlyRevenue * 12 / 100000).toFixed(1)}L` : '₹1.01Cr', icon: TrendingUp },
            ].map((item) => (
              <div key={item.label} className="rounded-3xl border border-border/50 bg-surface/70 p-4 shadow-sm backdrop-blur-xl">
                <item.icon size={20} className="mb-4 text-primary" />
                <p className="text-2xl font-black text-text-primary tracking-tight">{item.value}</p>
                <p className="mt-1 text-[11px] font-bold uppercase tracking-widest text-text-secondary">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryCards.map((stat) => (
          <motion.div
            key={stat.label}
            variants={itemVariants}
            whileHover={{ y: -5, scale: 1.01 }}
            className="glass-card p-5 group hover:border-primary/30 transition-all duration-300 cursor-default relative overflow-hidden"
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
              <p className="mt-3 text-xs font-semibold text-muted">{stat.detail}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
          variants={itemVariants} 
          className="glass-card p-6 md:p-8 lg:col-span-2 relative overflow-hidden group border border-border/40 hover:border-primary/30 transition-colors duration-500"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] rounded-full mix-blend-screen pointer-events-none transition-opacity duration-500 group-hover:opacity-100 opacity-50" />
          
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8 relative z-10">
            <div>
              <h3 className="heading-2">Revenue Momentum</h3>
              <p className="text-sm text-muted mt-1.5 font-medium">Monthly Recurring Revenue (MRR) performance overview</p>
            </div>
            <div className="flex bg-surface-variant/50 p-1.5 rounded-xl border border-border/50">
              <select className="bg-transparent text-sm font-bold text-text-primary px-3 py-1 outline-none border-none cursor-pointer">
                <option>Last 6 Months</option>
                <option>Last 12 Months</option>
              </select>
            </div>
          </div>

          <ChartContainer heightClassName="h-[280px]">
            <AreaChart data={stats?.revenueHistory || revenueData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
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
                  data={activePlanMix}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={8}
                  dataKey="value"
                  animationDuration={1500}
                  stroke="none"
                >
                  {activePlanMix.map((entry: { color: string }, index: number) => (
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
            {activePlanMix.map((plan: { name: string; value: number; color: string }) => (
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

      <motion.div variants={itemVariants} className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-[28px] border border-border/50 bg-surface/40 p-5">
          <div>
            <h3 className="heading-2 flex items-center gap-2">
              <Sparkles className="text-amber-500" size={22} />
              Subscription Plans
            </h3>
            <p className="text-sm text-text-secondary mt-0.5">Configure platform-wide pricing models and company-level license allocation.</p>
          </div>
          
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {mergedPlanConfigs.map((plan) => (
            <motion.div
              key={plan.name}
              whileHover={{ y: -8, scale: 1.01 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "glass-card p-7 flex flex-col relative border overflow-hidden min-h-[460px]",
                plan.isPopular ? "border-amber-500/50 shadow-2xl shadow-amber-500/10 lg:-translate-y-3" : "border-border/50 shadow-sm"
              )}
            >
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
                <div className="flex items-center justify-between gap-3">
                  <span className={cn("px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border", plan.badgeColor)}>
                    {plan.name} Tier
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted">{plan.activeHires}</span>
                </div>
                <div className="flex items-baseline gap-1 mt-6">
                  {isPricingLoading ? (
                    <div className="h-10 w-28 bg-surface-variant/60 animate-pulse rounded-xl" />
                  ) : (
                    <>
                      <span className="text-4xl font-black text-text-primary tracking-tight">
                        {billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice}
                      </span>
                      <span className="text-xs font-bold text-text-secondary">
                        /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                      </span>
                    </>
                  )}
                </div>
                {plan.seats && <p className="text-[11px] font-bold text-text-secondary mt-1.5">{plan.seats}</p>}
                {plan.desc && <p className="text-xs text-text-secondary mt-4 leading-relaxed font-medium">{plan.desc}</p>}
              </div>

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

              <div className="relative z-10 border-t border-border/40 pt-6 mt-auto flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs font-bold text-text-secondary">
                  <span>Utilization:</span>
                  <span className="text-text-primary font-black">{plan.activeHires}</span>
                </div>
                <div className="flex gap-2">
                  {/* Edit Pricing — Super Admin only */}
                  {plan.dbPlan && (
                    <button
                      onClick={() => handleOpenPricingEdit(plan.dbPlan!)}
                      title="Edit Plan Pricing"
                      className="p-3.5 rounded-2xl bg-surface-variant hover:bg-indigo-500/10 hover:text-indigo-500 border border-border/60 hover:border-indigo-500/30 transition-all duration-300 active:scale-95"
                    >
                      <Settings2 size={15} />
                    </button>
                  )}
                  <button 
                    onClick={() => handleOpenConfigureForPlan(plan.name)}
                    className={cn(
                      "flex-1 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 active:scale-98 flex items-center justify-center gap-2",
                      plan.buttonVariant === 'primary' 
                        ? "bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20" 
                        : "bg-surface-variant hover:bg-surface-variant/80 text-text-primary border border-border/60"
                    )}
                  >
                    Configure
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 pr-4 py-3 bg-surface-variant/60 border border-border/40 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:bg-surface transition-all w-full sm:w-64 font-bold text-text-primary placeholder:text-muted"
              />
            </div>
            
            <select 
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="bg-surface border border-border/60 rounded-2xl px-4 py-2.5 text-xs font-black uppercase tracking-widest text-text-secondary outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
            >
              <option value="All">Plan: All</option>
              <option value="Basic">Basic</option>
              <option value="Pro">Pro</option>
              <option value="Enterprise">Enterprise</option>
            </select>

            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-surface border border-border/60 rounded-2xl px-4 py-2.5 text-xs font-black uppercase tracking-widest text-text-secondary outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
            >
              <option value="All">Status: All</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Overdue">Overdue</option>
            </select>
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
                {filteredInvoices.map((invoice, idx) => (
                  <motion.tr 
                    key={invoice.id || idx}
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
                      <button 
                        onClick={() => invoice.rawSub && handleOpenConfigure(invoice.rawSub)}
                        className="p-2 bg-surface hover:bg-surface-variant border border-border/80 hover:border-border rounded-xl transition-all shadow-sm"
                      >
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

      {/* ===== Pricing Edit Modal (Super Admin) ===== */}
      <Modal
        isOpen={isPricingModalOpen}
        onClose={() => {
          setIsPricingModalOpen(false);
          setEditingPlan(null);
          setPriceSaveSuccess('');
        }}
        title={`Edit ${editingPlan?.name ?? ''} Plan Pricing`}
      >
        <form onSubmit={handleSavePricing} className="space-y-6 p-2">
          {/* Plan badge */}
          {editingPlan && (
            <div className={cn(
              "p-4 rounded-2xl border flex items-center gap-3",
              editingPlan.name === 'Enterprise' ? "bg-indigo-500/10 border-indigo-500/20" :
              editingPlan.name === 'Pro' ? "bg-amber-500/10 border-amber-500/20" : "bg-emerald-500/10 border-emerald-500/20"
            )}>
              <Settings2 className={cn(
                "w-6 h-6 shrink-0",
                editingPlan.name === 'Enterprise' ? "text-indigo-500" :
                editingPlan.name === 'Pro' ? "text-amber-500" : "text-emerald-500"
              )} />
              <div>
                <p className={cn(
                  "text-[10px] font-black uppercase tracking-wider",
                  editingPlan.name === 'Enterprise' ? "text-indigo-500" :
                  editingPlan.name === 'Pro' ? "text-amber-500" : "text-emerald-500"
                )}>Editing Pricing</p>
                <p className="text-sm font-bold text-text-primary">{editingPlan.name} Plan — Platform-wide pricing</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-widest ml-1">Monthly Price (₹)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary font-black text-sm">₹</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={editMonthly}
                  onChange={e => setEditMonthly(e.target.value)}
                  required
                  placeholder="e.g. 1200"
                  className="w-full pl-8 pr-5 py-4 bg-surface-variant border-none rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 text-sm font-black text-text-primary tabular-nums"
                />
              </div>
              <p className="text-[10px] text-muted ml-1">Charged per company per month</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-widest ml-1">Yearly Price (₹)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary font-black text-sm">₹</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={editYearly}
                  onChange={e => setEditYearly(e.target.value)}
                  required
                  placeholder="e.g. 12000"
                  className="w-full pl-8 pr-5 py-4 bg-surface-variant border-none rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 text-sm font-black text-text-primary tabular-nums"
                />
              </div>
              <p className="text-[10px] text-muted ml-1">Charged per company per year</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-widest ml-1">Seat Limit Label</label>
            <input
              type="text"
              value={editSeats}
              onChange={e => setEditSeats(e.target.value)}
              placeholder="e.g. Up to 50 active seats"
              className="w-full px-5 py-4 bg-surface-variant border-none rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 text-sm font-bold text-text-primary"
            />
          </div>

          {/* Savings indicator */}
          {editMonthly && editYearly && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
              <p className="text-xs font-bold text-emerald-600">
                💡 Yearly saves{' '}
                <strong>
                  ₹{Math.max(0, parseFloat(editMonthly || '0') * 12 - parseFloat(editYearly || '0')).toLocaleString('en-IN')}
                </strong>{' '}
                ({Math.round(Math.max(0, (1 - parseFloat(editYearly || '0') / (parseFloat(editMonthly || '0') * 12)) * 100))}% off)
                vs monthly billing
              </p>
            </div>
          )}

          {priceSaveSuccess && (
            <div className="p-4 bg-success/10 border border-success/20 rounded-2xl flex items-center gap-3">
              <ShieldCheck className="text-success w-5 h-5 shrink-0" />
              <p className="text-xs font-bold text-success">{priceSaveSuccess}</p>
            </div>
          )}

          <div className="pt-2 flex gap-4">
            <button
              type="button"
              onClick={() => { setIsPricingModalOpen(false); setEditingPlan(null); }}
              className="flex-1 py-4 bg-surface-variant text-text-secondary text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-surface border border-border transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSavingPrice}
              className="flex-2 py-4 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all disabled:opacity-50 flex items-center justify-center gap-3 px-8"
            >
              {isSavingPrice ? (
                <><Loader2 size={16} className="animate-spin" />Saving...</>
              ) : (
                <><ShieldCheck size={18} />Update Pricing</>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* ===== Configure Company Subscription Modal ===== */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedSub(null);
        }}
        title="Adjust Subscription Plan"
      >
        <form onSubmit={handleSaveSubscription} className="space-y-6 p-2">
          {selectedSub ? (
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-2xl flex items-center gap-3">
              <Building2 className="text-primary w-6 h-6 shrink-0" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-primary">Selected Company</p>
                <p className="text-sm font-bold text-text-primary">{selectedSub.company}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-widest ml-1">Select Company</label>
              <select
                onChange={(e) => {
                  const sub = subscriptions.find(s => s.id === e.target.value);
                  setSelectedSub(sub || null);
                }}
                className="w-full px-5 py-4 bg-surface-variant border-none rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 text-sm font-bold text-text-primary"
                defaultValue=""
              >
                <option value="" disabled>Choose Company</option>
                {subscriptions.map(s => (
                  <option key={s.id} value={s.id}>{s.company} (Tier: {s.plan})</option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-widest ml-1">Subscription Plan</label>
              <select
                value={modalPlan}
                onChange={(e) => setModalPlan(e.target.value)}
                className="w-full px-5 py-4 bg-surface-variant border-none rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 text-sm font-bold uppercase tracking-wider text-text-primary"
              >
                <option value="Basic">Basic Plan ({getPlanPrice('Basic', 'monthly')}/mo)</option>
                <option value="Pro">Pro Plan ({getPlanPrice('Pro', 'monthly')}/mo)</option>
                <option value="Enterprise">Enterprise Plan ({getPlanPrice('Enterprise', 'monthly')}/mo)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-widest ml-1">Billing Cycle</label>
              <select
                value={modalCycle}
                onChange={(e) => setModalCycle(e.target.value)}
                className="w-full px-5 py-4 bg-surface-variant border-none rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 text-sm font-bold uppercase tracking-wider text-text-primary"
              >
                <option value="monthly">Monthly Recurring</option>
                <option value="yearly">Yearly Commitment</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-widest ml-1">Payment Status</label>
            <select
              value={modalStatus}
              onChange={(e) => setModalStatus(e.target.value)}
              className="w-full px-5 py-4 bg-surface-variant border-none rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 text-sm font-bold uppercase tracking-wider text-text-primary"
            >
              <option value="Paid">Paid (Current)</option>
              <option value="Pending">Pending Invoice</option>
              <option value="Overdue">Overdue / Suspended</option>
            </select>
          </div>

          {modalStatus === 'Overdue' && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex gap-3 text-rose-500 items-start">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-xs font-semibold leading-relaxed">
                Marking a company's subscription status as <strong>Overdue</strong> may lock features or flag administrative attention cards in the dashboards.
              </p>
            </div>
          )}

          <div className="pt-6 flex gap-4">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setSelectedSub(null);
              }}
              className="flex-1 py-4 bg-surface-variant text-text-secondary text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-surface border border-border transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-2 py-4 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all disabled:opacity-50 flex items-center justify-center gap-3 px-8"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};

export default SubscriptionsPage;
