"use client";

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { 
  Wallet, 
  TrendingUp, 
  CheckCircle2, 
  Clock,
  ArrowUpRight,
  Filter,
  Download,
  Search,
  MoreVertical,
  ArrowRight,
  IndianRupee,
  Users,
  X,
  ShieldCheck,
  Plus
} from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import TableSkeleton from '@/components/TableSkeleton';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  AreaChart,
  Area
} from 'recharts';
import { cn } from '@/utils/cn';
import ChartContainer from '@/components/ChartContainer';
import { useLoadingData } from '@/hooks/useLoadingData';
import Modal from '@/components/Modal';

const payrollStats = [
  { name: 'Jan', amount: 2400000, trend: 1500000 },
  { name: 'Feb', amount: 2100000, trend: 1800000 },
  { name: 'Mar', amount: 2800000, trend: 2100000 },
  { name: 'Apr', amount: 2600000, trend: 2400000 },
  { name: 'May', amount: 3200000, trend: 2800000 },
];

const recentPayrollRuns = [
  { 
    id: 'PR-9041', 
    company: 'TechVibe Inc.', 
    employees: 450, 
    totalAmount: '₹382,500', 
    status: 'Completed', 
    date: '28 Apr 2024' 
  },
  { 
    id: 'PR-9042', 
    company: 'Global Logistics', 
    employees: 1200, 
    totalAmount: '₹744,000', 
    status: 'Processing', 
    date: '30 Apr 2024' 
  },
  { 
    id: 'PR-9043', 
    company: 'EcoWare Solutions', 
    employees: 85, 
    totalAmount: '₹66,300', 
    status: 'Failed', 
    date: '01 May 2024' 
  },
  { 
    id: 'PR-9044', 
    company: 'Innovate Digital', 
    employees: 320, 
    totalAmount: '₹176,000', 
    status: 'Pending Approval', 
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
      <div className="glass-card p-4 border-none shadow-2xl backdrop-blur-xl bg-surface/80 dark:bg-surface-variant/80">
        <p className="text-label text-muted mb-2">{label}</p>
        <div className="space-y-1">
          <p className="text-lg font-black text-primary">
            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(payload[0].value)}
          </p>
          <div className="flex items-center gap-2">
             <div className="flex items-center gap-1 text-micro font-black text-success uppercase tracking-tighter">
                <TrendingUp size={12} />
                +14.2%
             </div>
             <span className="text-micro font-bold text-text-secondary uppercase">vs last cycle</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

// ─── Module-level salary helpers ──────────────────────────────────────────
const ones = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
const tens = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];

function numToWords(n: number): string {
  if (n === 0) return 'Zero';
  if (n < 0)   return 'Minus ' + numToWords(-n);
  if (n < 20)  return ones[n];
  if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
  if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + numToWords(n % 100) : '');
  if (n < 100000) return numToWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + numToWords(n % 1000) : '');
  if (n < 10000000) return numToWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + numToWords(n % 100000) : '');
  return numToWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + numToWords(n % 10000000) : '');
}

function computeSlipData(slip: any, slipMonth: string) {
  const basic         = slip.baseSalary;
  const hra           = Math.round(basic * 0.40);
  const ta            = Math.round(basic * 0.10);
  const special       = Math.max(0, slip.allowance - hra - ta);
  const grossEarnings = basic + hra + ta + special;
  const pf            = Math.round(basic * 0.12);
  const pt            = 200;
  const tds           = Math.max(0, slip.deductions - pf - pt);
  const totalDeductions = pf + pt + tds;
  const netPay        = grossEarnings - totalDeductions;
  const [yr, mo]      = slipMonth.split('-').map(Number);
  const monthLabel    = new Date(yr, mo - 1, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  const monthShort    = new Date(yr, mo - 1, 1).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }).replace(' ', '-');
  const netInWords    = numToWords(netPay) + ' Rupees Only';
  return { basic, hra, ta, special, grossEarnings, pf, pt, tds, totalDeductions, netPay, yr, mo, monthLabel, monthShort, netInWords };
}
// ───────────────────────────────────────────────────────────────────────────

const PayrollPage = () => {
  const [stats, setStats] = useState<any>({ mtdVolume: 4128400, disbursed: 3842100, pending: 210450, errors: 0 });
  const [trendData, setTrendData] = useState<any[]>(payrollStats);
  const [runsList, setRunsList] = useState<any[]>(recentPayrollRuns);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  const [isDisbursing, setIsDisbursing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // New Payslips states
  const [activeSubTab, setActiveSubTab] = useState<'batches' | 'slips'>('batches');
  const [slipsList, setSlipsList] = useState<any[]>([]);
  const [isSlipsLoading, setIsSlipsLoading] = useState(false);
  const [selectedSlip, setSelectedSlip] = useState<any | null>(null);
  const [isSlipModalOpen, setIsSlipModalOpen] = useState(false);
  // Default slip month = current month
  const [slipMonth, setSlipMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const [slipAttendance, setSlipAttendance] = useState<{
    workingDays: number;
    present: number;
    absent: number;
    halfDay: number;
    late: number;
    leave: number;
  } | null>(null);

  const loadPayrollData = useCallback(async () => {
    setIsPageLoading(true);
    setIsSlipsLoading(true);
    try {
      const statsRes = await api.get<{ success: boolean; stats: any; trend: any[] }>('/api/admin/payroll/stats');
      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
        setTrendData(statsRes.data.trend);
      }

      const runsRes = await api.get<{ success: boolean; runs: any[] }>('/api/admin/payroll/runs');
      if (runsRes.data.success) {
        setRunsList(runsRes.data.runs);
      }

      const slipsRes = await api.get<{ success: boolean; slips: any[] }>('/api/admin/payroll/slips');
      if (slipsRes.data.success) {
        setSlipsList(slipsRes.data.slips);
      }
    } catch (err) {
      console.error('Failed to load payroll data:', err);
    } finally {
      setIsPageLoading(false);
      setIsSlipsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPayrollData();
  }, [loadPayrollData]);

  useEffect(() => {
    if (!selectedSlip) {
      setSlipAttendance(null);
      return;
    }

    const fetchAttendance = async () => {
      try {
        const res = await api.get<{ success: boolean; details: any[] }>(
          `/api/admin/reports/attendance-details?month=${slipMonth}`
        );
        if (res.data.success) {
          const empRecord = res.data.details.find(
            (d: any) => d.employeeCode === selectedSlip.employeeCode
          );
          if (empRecord) {
            setSlipAttendance({
              workingDays: empRecord.totalDays || 26,
              present: empRecord.present || 0,
              absent: empRecord.absent || 0,
              halfDay: empRecord.halfDay || 0,
              late: empRecord.late || 0,
              leave: empRecord.leave || 0,
            });
          } else {
            setSlipAttendance({
              workingDays: 26,
              present: 26,
              absent: 0,
              halfDay: 0,
              late: 0,
              leave: 0,
            });
          }
        }
      } catch (err) {
        console.error('Failed to fetch slip attendance details:', err);
      }
    };

    fetchAttendance();
  }, [selectedSlip, slipMonth]);

  const handleBulkDisburse = async () => {
    setIsDisbursing(true);
    try {
      await api.post('/api/admin/payroll/disburse');
      alert('Disbursement completed successfully!');
      setIsProcessModalOpen(false);
      await loadPayrollData();
    } catch (err) {
      console.error('Disbursement execution failed:', err);
      alert('Disbursement failed. Please verify pool balances and try again.');
    } finally {
      setIsDisbursing(false);
    }
  };

  const handleApproveSlip = async (employeeId: number) => {
    try {
      await api.post('/api/admin/payroll/slips/approve', { employeeId });
      const slipsRes = await api.get<{ success: boolean; slips: any[] }>('/api/admin/payroll/slips');
      if (slipsRes.data.success) {
        setSlipsList(slipsRes.data.slips);
      }
      alert('Salary slip approved and generated successfully!');
    } catch (err) {
      console.error('Failed to approve slip:', err);
      alert('Failed to approve salary slip.');
    }
  };

  const filteredRuns = runsList.filter(run => 
    run.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    run.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSlips = slipsList.filter(slip => 
    slip.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    slip.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    slip.designation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isLoading = isPageLoading;

  // Pre-compute slip data outside JSX (avoids function declarations in JSX expressions)
  const slipData = selectedSlip ? computeSlipData(selectedSlip, slipMonth) : null;
  const {
    basic = 0,
    hra = 0,
    ta = 0,
    special = 0,
    grossEarnings = 0,
    pf = 0,
    pt = 0,
    tds = 0,
    totalDeductions = 0,
    netPay = 0,
    yr = 0,
    mo = 0,
    monthLabel = '',
    monthShort = '',
    netInWords = ''
  } = slipData || {};

  // Print handler — sets document.title to drive PDF filename
  const handlePrintSlip = () => {
    if (!selectedSlip || !slipData) return;
    const prev = document.title;
    const safeName = selectedSlip.name.replace(/\s+/g, '-');
    document.title = `SalarySlip_${selectedSlip.employeeCode}_${safeName}_${monthShort}`;
    window.print();
    setTimeout(() => { document.title = prev; }, 1500);
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-10 text-slate-100 animate-fadeIn"
    >
      {/* Title Header Command hub */}
      <motion.div variants={itemVariants} className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-slate-900/90 to-slate-950/95 backdrop-blur-xl p-8 md:p-10 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div className="absolute -top-12 -right-12 w-96 h-96 bg-primary/10 rounded-full filter blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute -bottom-24 -left-12 w-80 h-80 bg-emerald-500/5 rounded-full filter blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/20 to-emerald-500/10 border border-primary/30 text-primary text-[10px] font-black px-3.5 py-1.5 rounded-full uppercase tracking-widest shadow-inner">
            <Wallet size={12} className="text-primary animate-pulse" />
            Corporate Treasury & Remuneration
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-none">
            Payroll <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-teal-400 to-emerald-400">Governance</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-400 font-medium max-w-xl leading-relaxed">
            Strategic oversight of fund flows, compliance standards, salary slips generation, and platform-wide disbursement operations.
          </p>
        </div>

        <div className="relative z-10 shrink-0 flex items-center gap-3">
          <button 
            onClick={() => setIsProcessModalOpen(true)}
            className="btn-primary shadow-xl shadow-primary/20 hover:shadow-primary/30 px-6.5 py-4 shrink-0 rounded-2xl text-xs font-black uppercase tracking-wider justify-center"
          >
            <Wallet size={18} />
            Bulk Process
          </button>
        </div>
      </motion.div>

      {/* Tab Navigation Controls */}
      <motion.div variants={itemVariants} className="flex overflow-x-auto gap-2 p-1.5 bg-slate-950/40 border border-white/5 rounded-2xl no-scrollbar max-w-lg">
        {[
          { id: 'batches', label: 'Disbursement Batches', icon: Wallet },
          { id: 'slips', label: 'Employee Payslips', icon: Users },
        ].map((tab) => {
          const isSelected = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider shrink-0 transition-all duration-300 cursor-pointer",
                isSelected 
                  ? "bg-primary text-white shadow-lg shadow-primary/25 border-primary/30" 
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </motion.div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Volume (MTD)', value: `₹${stats.mtdVolume.toLocaleString('en-IN')}`, icon: Wallet, color: 'primary', trend: '+12.5%', glowColor: 'rgba(59, 163, 139, 0.3)' },
          { label: 'Total Disbursed', value: `₹${stats.disbursed.toLocaleString('en-IN')}`, icon: CheckCircle2, color: 'success', trend: '+8.2%', glowColor: 'rgba(34, 197, 94, 0.3)' },
          { label: 'Pending Approval', value: `₹${stats.pending.toLocaleString('en-IN')}`, icon: Clock, color: 'warning', trend: '-2.4%', glowColor: 'rgba(245, 158, 11, 0.3)' },
          { label: 'Critical Errors', value: stats.errors > 0 ? `${stats.errors} Batches` : '0 Batches', icon: IndianRupee, color: 'error', trend: stats.errors > 0 ? 'CRITICAL' : 'SECURE', glowColor: 'rgba(239, 68, 68, 0.3)' },
        ].map((stat) => (
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
                "p-3.5 rounded-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm",
                `bg-${stat.color}/10 text-${stat.color}`
              )}>
                <stat.icon size={22} />
              </div>
              <span className={cn(
                "text-micro font-black px-2.5 py-1.5 rounded-xl uppercase tracking-wider border shadow-sm",
                stat.trend.startsWith('+') || stat.trend === 'SECURE' ? "bg-success/10 text-success border-success/10" : 
                stat.trend.startsWith('-') ? "bg-warning/10 text-warning border-warning/10" : "bg-error/20 text-error border-error/20 animate-pulse"
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

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <motion.div 
          variants={itemVariants}
          className="xl:col-span-2 glass-card p-8 relative overflow-hidden group shadow-premium"
        >
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-1000" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 relative z-10">
            <div>
              <h3 className="heading-2">Platform Disbursement Volume</h3>
              <p className="text-sm text-page-desc mt-1 italic">Global payroll distribution trends over the last 5 months</p>
            </div>
            <div className="flex items-center gap-3 text-success text-label tracking-[0.15em] bg-success/10 px-5 py-2.5 rounded-2xl self-start sm:self-center border border-success/10 shadow-sm">
              <TrendingUp size={16} />
              +14.2% SYSTEM GROWTH
            </div>
          </div>

          <ChartContainer heightClassName="h-[350px]" className="relative z-10">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="payrollGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3BA38B" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3BA38B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: 'var(--text-secondary)', fontSize: 10, fontWeight: 900}} 
                  dy={15}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: 'var(--text-secondary)', fontSize: 10, fontWeight: 900}}
                  tickFormatter={(value) => `₹${value/1000000}M`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#3BA38B" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#payrollGradient)" 
                  animationDuration={2500}
                  animationEasing="ease-in-out"
                />
              </AreaChart>
          </ChartContainer>
        </motion.div>

        <div className="flex flex-col gap-6">
          <motion.div 
            variants={itemVariants}
            whileHover={{ scale: 1.01 }}
            className="glass-card p-8 bg-gradient-to-br from-secondary to-primary-dark text-white border-none shadow-2xl relative overflow-hidden group h-full flex flex-col justify-between"
          >
            {/* Animated Radial Glow */}
            <motion.div 
              animate={{ 
                scale: [1, 1.3, 1],
                opacity: [0.2, 0.4, 0.2]
              }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="absolute -right-20 -top-20 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none"
            />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="p-4 bg-white/5 backdrop-blur-2xl rounded-2xl group-hover:rotate-6 group-hover:scale-110 transition-all duration-500 border border-white/10 shadow-sm">
                  <IndianRupee size={32} className="text-primary" />
                </div>
                <div className="px-4 py-1.5 bg-white/5 backdrop-blur-2xl rounded-full text-micro font-black tracking-[0.2em] flex items-center gap-2 border border-white/10 shadow-sm">
                  <span className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_12px_#3BA38B]" />
                  ACTIVE LIQUIDITY
                </div>
              </div>
              
              <div className="mt-auto pt-10">
                <p className="text-white/40 text-micro font-black tracking-[0.2em] uppercase mb-2">Global Disbursement Pool</p>
                <h3 className="text-5xl font-black mb-8 tracking-tighter tabular-nums text-white group-hover:text-primary transition-colors duration-500">₹24,842,100</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-micro font-black uppercase tracking-[0.2em]">
                    <span className="text-white/60">Pool utilization</span>
                    <span className="text-primary">75.4%</span>
                  </div>
                  <div className="h-2.5 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/10 shadow-sm">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '75.4%' }}
                      transition={{ duration: 2, delay: 0.5, ease: "circOut" }}
                      className="h-full bg-gradient-to-r from-primary/50 to-primary rounded-full shadow-[0_0_20px_rgba(59,163,139,0.5)]"
                    />
                  </div>
                </div>
                <div className="mt-10 flex items-center gap-3">
                  <button className="flex-1 py-4 bg-primary text-white text-micro font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-primary-light transition-all active:scale-95 shadow-xl shadow-primary/30">
                    Rebalance Pool
                  </button>
                  <button className="p-4 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl hover:bg-white/10 transition-all active:scale-95 shadow-sm">
                    <ArrowUpRight size={20} className="text-white" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            variants={itemVariants} 
            whileHover={{ x: 8 }}
            className="glass-card p-6 flex items-center justify-between group hover:border-warning/50 transition-all cursor-pointer overflow-hidden relative shadow-premium"
          >
            <div className="absolute right-0 top-0 w-24 h-24 bg-warning/5 blur-3xl rounded-full" />
            <div className="flex items-center gap-5 relative z-10">
              <div className="p-4 rounded-2xl bg-warning/10 text-warning group-hover:rotate-12 group-hover:scale-110 transition-all shadow-sm">
                <Clock size={24} />
              </div>
              <div>
                <p className="text-sm font-black text-text-primary uppercase tracking-tight">Manual Audit Queue</p>
                <p className="text-micro font-bold text-text-secondary mt-1 uppercase tracking-widest">12 runs awaiting approval</p>
              </div>
            </div>
            <div className="w-12 h-12 bg-surface-variant rounded-2xl flex items-center justify-center text-text-secondary group-hover:bg-primary group-hover:text-white transition-all shadow-sm border border-border relative z-10">
              <ArrowRight size={20} />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Tab Content selection */}
      {activeSubTab === 'batches' ? (
        <motion.div variants={itemVariants} className="glass-card overflow-hidden shadow-premium">
          <div className="p-8 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <h3 className="heading-2">Recent Payroll Cycles</h3>
              <p className="text-sm text-page-desc mt-1">Global audit stream of recent disbursement batches</p>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-grow sm:flex-grow-0 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Search batches..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-11 pr-4 py-3.5 bg-surface-variant border-none rounded-2xl text-xs outline-none focus:ring-4 focus:ring-primary/10 transition-all w-full sm:w-72 font-black uppercase tracking-widest text-text-primary"
                />
              </div>
              <button className="p-3.5 bg-surface-variant hover:bg-surface border border-border rounded-2xl text-text-secondary transition-all active:scale-95 hover:border-primary/30 shadow-sm">
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
                    <th className="px-4 sm:px-6 md:px-8 py-5 sm:py-6 text-micro font-black uppercase tracking-[0.2em] text-muted border-b border-border">Batch Identity</th>
                    <th className="px-4 sm:px-6 md:px-8 py-5 sm:py-6 text-micro font-black uppercase tracking-[0.2em] text-muted border-b border-border">Company</th>
                    <th className="px-4 sm:px-6 md:px-8 py-5 sm:py-6 text-micro font-black uppercase tracking-[0.2em] text-muted border-b border-border">Operational Scale</th>
                    <th className="px-4 sm:px-6 md:px-8 py-5 sm:py-6 text-micro font-black uppercase tracking-[0.2em] text-muted border-b border-border">Total Volume</th>
                    <th className="px-4 sm:px-6 md:px-8 py-5 sm:py-6 text-micro font-black uppercase tracking-[0.2em] text-muted border-b border-border">Status</th>
                    <th className="px-4 sm:px-6 md:px-8 py-5 sm:py-6 text-micro font-black uppercase tracking-[0.2em] text-muted border-b border-border text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredRuns.map((run) => (
                    <motion.tr 
                      key={run.id}
                      variants={itemVariants}
                      className="hover:bg-surface-variant transition-colors group cursor-pointer"
                    >
                      <td className="px-8 py-7">
                        <span className="font-mono text-micro font-black text-muted bg-surface-variant px-3 py-1.5 rounded-xl border border-border shadow-sm group-hover:border-primary/30 transition-colors">
                          {run.id}
                        </span>
                      </td>
                      <td className="px-8 py-7">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-black text-xs group-hover:scale-110 transition-all duration-500 shadow-sm border border-primary/10">
                            {run.company.substring(0, 2)}
                          </div>
                          <div>
                            <span className="font-black text-text-primary tracking-tight group-hover:text-primary transition-colors block">{run.company}</span>
                            <span className="text-label font-bold text-text-secondary">{run.date}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-7">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <Users size={14} className="text-primary" />
                            <span className="text-sm font-black text-text-primary">{run.employees}</span>
                          </div>
                          <span className="text-micro font-bold text-text-secondary uppercase tracking-[0.1em] mt-1">Managed Seats</span>
                        </div>
                      </td>
                      <td className="px-8 py-7">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-text-primary tracking-tighter">{run.totalAmount}</span>
                          <span className="text-label font-bold text-text-secondary mt-1">Disbursed</span>
                        </div>
                      </td>
                      <td className="px-8 py-7">
                        <span className={cn(
                          "px-4 py-2 rounded-2xl text-label inline-flex items-center gap-2.5 transition-all border shadow-sm",
                          run.status === 'Completed' ? "bg-success/10 text-success border-success/10" : 
                          run.status === 'Failed' ? "bg-error/10 text-error border-error/10" : "bg-warning/10 text-warning border-warning/10"
                        )}>
                          <span className={cn(
                            "w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]",
                            run.status === 'Completed' ? "bg-success" : 
                            run.status === 'Failed' ? "bg-error animate-pulse" : "bg-warning"
                          )} />
                          {run.status}
                        </span>
                      </td>
                      <td className="px-8 py-7 text-right">
                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                          <button className="p-3 bg-surface border border-border text-muted hover:text-primary hover:border-primary/50 rounded-2xl transition-all shadow-sm hover:shadow-md">
                            <Download size={18} />
                          </button>
                          <button className="p-3 bg-surface border border-border text-muted hover:text-text-primary rounded-2xl transition-all shadow-sm">
                            <MoreVertical size={18} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {!isLoading && (
            <div className="p-8 bg-surface-variant/50 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                <p className="text-label text-text-secondary tracking-[0.2em]">Global Audit Stream Live</p>
              </div>
              <div className="flex items-center gap-3">
                <button className="px-6 py-3 bg-surface border border-border rounded-2xl text-label text-text-secondary disabled:opacity-30 hover:shadow-md transition-all active:scale-95" disabled>Previous Cycle</button>
                <button className="px-6 py-3 bg-surface border border-border rounded-2xl text-label text-text-secondary hover:shadow-md hover:text-primary transition-all active:scale-95">Next Cycle</button>
              </div>
            </div>
          )}
        </motion.div>
      ) : (
        <motion.div variants={itemVariants} className="glass-card overflow-hidden shadow-premium">
          <div className="p-8 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <h3 className="heading-2">Employee Payslips Manager</h3>
              <p className="text-sm text-page-desc mt-1">Generate, approve, and track salary slips for individual workforce members</p>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-grow sm:flex-grow-0 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Search employees..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-11 pr-4 py-3.5 bg-surface-variant border-none rounded-2xl text-xs outline-none focus:ring-4 focus:ring-primary/10 transition-all w-full sm:w-72 font-black uppercase tracking-widest text-text-primary"
                />
              </div>
            </div>
          </div>
          
          {isSlipsLoading ? (
            <div className="p-8">
              <TableSkeleton rows={5} columns={6} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-variant/50">
                    <th className="px-4 sm:px-6 md:px-8 py-5 sm:py-6 text-micro font-black uppercase tracking-[0.2em] text-muted border-b border-border">Employee Code</th>
                    <th className="px-4 sm:px-6 md:px-8 py-5 sm:py-6 text-micro font-black uppercase tracking-[0.2em] text-muted border-b border-border">Employee Name</th>
                    <th className="px-4 sm:px-6 md:px-8 py-5 sm:py-6 text-micro font-black uppercase tracking-[0.2em] text-muted border-b border-border">Designation & Dept</th>
                    <th className="px-4 sm:px-6 md:px-8 py-5 sm:py-6 text-micro font-black uppercase tracking-[0.2em] text-muted border-b border-border">Net Salary</th>
                    <th className="px-4 sm:px-6 md:px-8 py-5 sm:py-6 text-micro font-black uppercase tracking-[0.2em] text-muted border-b border-border">Status</th>
                    <th className="px-4 sm:px-6 md:px-8 py-5 sm:py-6 text-micro font-black uppercase tracking-[0.2em] text-muted border-b border-border text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredSlips.map((slip) => (
                    <motion.tr 
                      key={slip.id}
                      variants={itemVariants}
                      className="hover:bg-surface-variant/30 transition-colors group cursor-pointer"
                    >
                      <td className="px-8 py-7">
                        <span className="font-mono text-micro font-black text-muted bg-slate-900 px-3 py-1.5 rounded-xl border border-white/5 shadow-sm group-hover:border-primary/30 transition-colors">
                          {slip.employeeCode}
                        </span>
                      </td>
                      <td className="px-8 py-7">
                        <div>
                          <span className="font-black text-text-primary tracking-tight group-hover:text-primary transition-colors block">{slip.name}</span>
                          <span className="text-label font-bold text-text-secondary">{slip.office}</span>
                        </div>
                      </td>
                      <td className="px-8 py-7">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-text-primary">{slip.designation}</span>
                          <span className="text-micro font-bold text-text-secondary uppercase tracking-[0.1em] mt-1">{slip.department}</span>
                        </div>
                      </td>
                      <td className="px-8 py-7">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-primary tracking-tighter">₹{slip.netSalary.toLocaleString('en-IN')}</span>
                          <span className="text-label font-bold text-text-secondary mt-1">₹{slip.baseSalary.toLocaleString('en-IN')} Base</span>
                        </div>
                      </td>
                      <td className="px-8 py-7">
                        <span className={cn(
                          "px-4 py-2 rounded-2xl text-label inline-flex items-center gap-2.5 transition-all border shadow-sm",
                          slip.status === 'Approved' ? "bg-success/10 text-success border-success/10" : "bg-warning/10 text-warning border-warning/10"
                        )}>
                          <span className={cn(
                            "w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]",
                            slip.status === 'Approved' ? "bg-success animate-pulse" : "bg-warning"
                          )} />
                          {slip.status}
                        </span>
                      </td>
                      <td className="px-8 py-7 text-right">
                        <div className="flex items-center justify-end gap-3">
                          {slip.status === 'Pending Approval' ? (
                            <button 
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handleApproveSlip(slip.id); }}
                              className="px-4 py-2 bg-primary/20 text-primary border border-primary/20 hover:bg-primary hover:text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95"
                            >
                              Approve & Generate
                            </button>
                          ) : (
                            <button 
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setSelectedSlip(slip); setIsSlipModalOpen(true); }}
                              className="px-4 py-2 bg-success/20 text-success border border-success/20 hover:bg-success hover:text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95"
                            >
                              View & Download
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}

      {/* View Payslip Modal */}
      <Modal
        isOpen={isSlipModalOpen}
        onClose={() => setIsSlipModalOpen(false)}
        title="Employee Salary Slip"
      >
        {selectedSlip && slipData && (
          <div className="space-y-6 p-2 text-slate-100 print:text-black" id="salary-slip-print">
            {/* Month selector (hidden on print) */}
            <div className="flex items-center gap-4 print:hidden">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Salary Month</label>
              <input
                type="month"
                value={slipMonth}
                onChange={e => setSlipMonth(e.target.value)}
                className="px-4 py-2 bg-slate-800/80 border border-white/10 rounded-xl text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
              />
            </div>

            {/* ── SALARY SLIP DOCUMENT ── */}
            <div className="border border-white/10 rounded-3xl overflow-hidden bg-slate-950/60 shadow-2xl">

              {/* Company Header */}
              <div className="bg-gradient-to-r from-primary/25 via-teal-500/15 to-emerald-500/10 border-b border-white/10 px-8 py-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/40">
                    <Wallet size={20} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white tracking-tight">HRM</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Human Resources · Payroll Division</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Salary Slip</p>
                  <p className="text-sm font-black text-primary mt-0.5">{monthLabel}</p>
                  <p className="text-[10px] font-mono text-slate-500 mt-1">
                    DOC: QB-PAY-{selectedSlip.employeeCode}-{yr}{String(mo).padStart(2, '0')}
                  </p>
                </div>
              </div>

              <div className="p-8 space-y-6">

                {/* Employee Info Grid */}
                <div className="grid grid-cols-2 gap-x-12 gap-y-4 border border-white/8 rounded-2xl p-6">
                  {([
                    ['Employee Name',   selectedSlip.name],
                    ['Employee Code',   selectedSlip.employeeCode],
                    ['Designation',     selectedSlip.designation],
                    ['Department',      selectedSlip.department],
                    ['Office / Branch', selectedSlip.office],
                    ['Pay Period',      monthLabel],
                  ] as [string, string][]).map(([label, value]) => (
                    <div key={label} className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
                      <span className="text-sm font-bold text-white">{value}</span>
                    </div>
                  ))}
                </div>

                {/* Attendance Details Summary — always visible, ?? 0 fallback until data loads */}
                <div className="border border-white/10 rounded-2xl overflow-hidden">
                  <div className="grid grid-cols-6 divide-x divide-white/10">
                    {[
                      { label: 'Working Days', value: slipAttendance?.workingDays ?? 0, numColor: 'text-slate-100' },
                      { label: 'Present',      value: slipAttendance?.present     ?? 0, numColor: 'text-emerald-400' },
                      { label: 'Absent',       value: slipAttendance?.absent      ?? 0, numColor: 'text-rose-400' },
                      { label: 'Half Day',     value: slipAttendance?.halfDay     ?? 0, numColor: 'text-blue-400' },
                      { label: 'Late',         value: slipAttendance?.late        ?? 0, numColor: 'text-amber-400' },
                      { label: 'Leave',        value: slipAttendance?.leave       ?? 0, numColor: 'text-purple-400' },
                    ].map(({ label, value, numColor }) => (
                      <div key={label} className="flex flex-col items-center justify-center py-5 px-3 bg-white/3 hover:bg-white/6 transition-colors">
                        <span className={`text-2xl font-black font-mono leading-none ${numColor}`}>{value}</span>
                        <span className="text-[10px] font-bold text-slate-400 mt-2 text-center tracking-wide">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Earnings & Deductions side-by-side */}
                <div className="grid grid-cols-2 gap-6">

                  {/* Earnings */}
                  <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-2xl overflow-hidden">
                    <div className="bg-emerald-500/10 px-5 py-3 border-b border-emerald-500/15">
                      <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Earnings</h4>
                    </div>
                    <div className="divide-y divide-white/5">
                      {([
                        ['Basic Salary',              basic],
                        ['House Rent Allowance (HRA)', hra],
                        ['Transport Allowance (TA)',   ta],
                        ['Special Allowance',          special],
                      ] as [string, number][]).map(([label, amt]) => (
                        <div key={label} className="flex justify-between items-center px-5 py-3">
                          <span className="text-xs font-medium text-slate-400">{label}</span>
                          <span className="text-xs font-black text-white font-mono">₹ {amt.toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                      <div className="flex justify-between items-center px-5 py-3 bg-emerald-500/10">
                        <span className="text-xs font-black text-emerald-400 uppercase tracking-wider">Gross Earnings</span>
                        <span className="text-sm font-black text-emerald-400 font-mono">₹ {grossEarnings.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Deductions */}
                  <div className="bg-rose-500/5 border border-rose-500/15 rounded-2xl overflow-hidden">
                    <div className="bg-rose-500/10 px-5 py-3 border-b border-rose-500/15">
                      <h4 className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Deductions</h4>
                    </div>
                    <div className="divide-y divide-white/5">
                      {([
                        ['Provident Fund (EPF 12%)', pf],
                        ['Professional Tax (PT)',    pt],
                        ['TDS / Income Tax',         tds],
                      ] as [string, number][]).map(([label, amt]) => (
                        <div key={label} className="flex justify-between items-center px-5 py-3">
                          <span className="text-xs font-medium text-slate-400">{label}</span>
                          <span className="text-xs font-black text-white font-mono">₹ {amt.toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                      <div className="flex justify-between items-center px-5 py-3 bg-rose-500/10">
                        <span className="text-xs font-black text-rose-400 uppercase tracking-wider">Total Deductions</span>
                        <span className="text-sm font-black text-rose-400 font-mono">₹ {totalDeductions.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Net Pay Banner */}
                <div className="bg-gradient-to-r from-primary/20 to-teal-500/10 border border-primary/25 rounded-2xl px-7 py-5 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Net Payable Amount</p>
                    <p className="text-3xl font-black text-primary mt-1 font-mono">₹ {netPay.toLocaleString('en-IN')}</p>
                    <p className="text-[10px] font-medium text-slate-400 mt-1 italic">{netInWords}</p>
                  </div>
                  <div className="text-right">
                    <span className="px-3 py-1.5 bg-success/15 text-success text-[10px] font-black rounded-full uppercase border border-success/25">Approved</span>
                    <p className="text-[10px] font-mono text-slate-500 mt-2">Paid via: Bank Transfer</p>
                  </div>
                </div>

                {/* Signature lines */}
                <div className="grid grid-cols-2 gap-8 pt-4 border-t border-white/5">
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Employee Acknowledgement</p>
                    <div className="h-8 border-b border-dashed border-white/10" />
                    <p className="text-[10px] text-slate-600">{selectedSlip.name} · {selectedSlip.employeeCode}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Authorised Signatory</p>
                    <div className="h-8 border-b border-dashed border-white/10" />
                    <p className="text-[10px] text-slate-600">HR Department · HRM</p>
                  </div>
                </div>

                <p className="text-center text-[9px] text-slate-600 pt-2">
                  This is a computer-generated salary slip and does not require a physical signature. · {monthLabel}
                </p>
              </div>
            </div>

            {/* Action buttons (hidden on print) */}
            <div className="flex justify-end gap-3 print:hidden">
              <button
                type="button"
                onClick={() => setIsSlipModalOpen(false)}
                className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 rounded-2xl text-xs font-black uppercase tracking-wider transition-all active:scale-95"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handlePrintSlip}
                className="px-7 py-3 bg-primary hover:bg-primary/90 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-primary/25"
              >
                <Download size={14} />
                Download PDF
              </button>
            </div>
          </div>
        )}
      </Modal>



      {/* Process Payroll Modal */}
      <Modal 
        isOpen={isProcessModalOpen} 
        onClose={() => setIsProcessModalOpen(false)}
        title="Execute Bulk Disbursement"
      >
        <div className="space-y-8 p-2">
          <div className="p-6 bg-surface-variant/50 rounded-3xl border border-border/50">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-sm font-black uppercase tracking-widest text-text-primary">Batch Summary</h4>
              <span className="px-3 py-1 bg-primary/10 text-primary text-micro font-black rounded-full uppercase tracking-widest border border-primary/10">Draft Batch #882</span>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-label text-muted">Total Entities</p>
                <p className="text-xl font-black text-text-primary">12 Companies</p>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-label text-muted">Total Employees</p>
                <p className="text-xl font-black text-text-primary">4,842 Seats</p>
              </div>
              <div className="space-y-1">
                <p className="text-label text-muted">Total Volume</p>
                <p className="text-xl font-black text-primary">₹1,248,500</p>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-label text-muted">Est. Gas Fees</p>
                <p className="text-xl font-black text-text-secondary">₹142.50</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-label text-text-secondary ml-1">Confirmation Protocol</h4>
            <div className="space-y-3">
              {[
                'Verify all entity compliance certificates',
                'Synchronize with global liquidity pool',
                'Enable multi-signature audit trail',
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-surface rounded-2xl border border-border/50 group hover:border-primary/30 transition-all shadow-sm">
                  <div className="w-6 h-6 rounded-lg bg-surface-variant border border-border flex items-center justify-center text-muted group-hover:bg-primary/10 group-hover:text-primary transition-all">
                    <CheckCircle2 size={16} />
                  </div>
                  <span className="text-sm font-bold text-text-primary">{step}</span>
                </div>
              ))}
            </div>
          </div>

          <button 
            disabled={isDisbursing}
            onClick={handleBulkDisburse}
            className="w-full py-4 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all flex items-center justify-center gap-3 mt-8 disabled:opacity-55 cursor-pointer"
          >
            <ShieldCheck size={20} className={cn(isDisbursing && "animate-spin")} />
            {isDisbursing ? 'Processing Disbursement...' : 'Initiate Disbursement Protocol'}
          </button>
        </div>
      </Modal>
    </motion.div>
  );
};

export default PayrollPage;
