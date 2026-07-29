"use client";

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { sendNotificationToEmployee } from '@/services/notificationService';
import { useApi } from '@/hooks/useApi';
import PayrollAttendanceModal from '../components/PayrollAttendanceModal';
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
  Plus,
  Zap
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
import SuperAdminHeader from '@/components/SuperAdminHeader';

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
    const val = payload[0].value;
    return (
      <div className="p-4 rounded-xl border border-border/80 dark:border-white/15 shadow-2xl backdrop-blur-2xl bg-surface/95 dark:bg-slate-900/95 min-w-[210px] text-text-primary animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between gap-3 mb-2 border-b border-border/40 pb-2">
          <p className="text-[11px] font-black text-text-secondary uppercase tracking-widest">{label} 2024</p>
          <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            <TrendingUp size={11} /> +14.2%
          </span>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-text-secondary font-medium">Disbursed Volume</p>
          <p className="text-xl font-black text-primary font-mono tracking-tight">
            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val)}
          </p>
          <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">vs prior cycle avg</p>
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
  const [chartTimeframe, setChartTimeframe] = useState<'1M' | '3M' | '5M' | '1Y'>('5M');

  const displayedChartData = (() => {
    if (chartTimeframe === '1M') return trendData.slice(-2);
    if (chartTimeframe === '3M') return trendData.slice(-3);
    if (chartTimeframe === '1Y') return [
      { name: 'Nov', amount: 1900000, trend: 1400000 },
      { name: 'Dec', amount: 2200000, trend: 1600000 },
      ...trendData,
    ];
    return trendData;
  })();

  // New Payslips states
  const [activeSubTab, setActiveSubTab] = useState<'slips'>('slips');
  const [slipsList, setSlipsList] = useState<any[]>([]);
  const [isSlipsLoading, setIsSlipsLoading] = useState(false);
  const [selectedSlip, setSelectedSlip] = useState<any | null>(null);
  const [isSlipModalOpen, setIsSlipModalOpen] = useState(false);
  // Default slip month = current month
  const [slipMonth, setSlipMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // Salary Advances state
  const [mainTab, setMainTab] = useState<'slips' | 'advances'>('slips');
  const [advancesList, setAdvancesList] = useState<any[]>([]);
  const [isAdvancesLoading, setIsAdvancesLoading] = useState(false);
  const [advanceFilter, setAdvanceFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'PAID_OFF' | 'REJECTED'>('ALL');
  const [selectedAdvance, setSelectedAdvance] = useState<any | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewMonths, setReviewMonths] = useState<number>(4);
  const [reviewNote, setReviewNote] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const loadAdvancesData = useCallback(async () => {
    setIsAdvancesLoading(true);
    try {
      const res = await api.get<{ success: boolean; advances: any[] }>('/api/payroll/admin/advances');
      if (res.data.success) {
        setAdvancesList(res.data.advances);
      }
    } catch (err) {
      console.error('Failed to load salary advances:', err);
    } finally {
      setIsAdvancesLoading(false);
    }
  }, []);

  const handleReviewAdvance = async (action: 'APPROVE' | 'REJECT') => {
    if (!selectedAdvance) return;
    setIsSubmittingReview(true);
    try {
      const res = await api.put<{ success: boolean; message: string }>(
        `/api/payroll/admin/advances/${selectedAdvance.id}/review`,
        {
          action,
          months: reviewMonths,
          reviewNote,
        }
      );
      if (res.data.success) {
        toast.success(res.data.message || 'Salary advance reviewed successfully!');
        setIsReviewModalOpen(false);
        setSelectedAdvance(null);
        await loadAdvancesData();
      }
    } catch (err: any) {
      console.error('Review advance error:', err);
      toast.error(err?.response?.data?.message || 'Failed to process advance review.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

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
      const statsRes = await api.get<{ success: boolean; stats: any; trend: any[] }>('/api/payroll/admin/stats');
      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
        setTrendData(statsRes.data.trend);
      }

      const runsRes = await api.get<{ success: boolean; runs: any[] }>('/api/payroll/admin/runs');
      if (runsRes.data.success) {
        setRunsList(runsRes.data.runs);
      }

      const slipsRes = await api.get<{ success: boolean; slips: any[] }>(`/api/payroll/admin/slips?month=${slipMonth}`);
      if (slipsRes.data.success) {
        setSlipsList(slipsRes.data.slips);
      }

      await loadAdvancesData();
    } catch (err) {
      console.error('Failed to load payroll data:', err);
    } finally {
      setIsPageLoading(false);
      setIsSlipsLoading(false);
    }
  }, [slipMonth]);

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
      await api.post('/api/payroll/admin/disburse');

      // Send salary credit notifications to all employees in the current slip list
      const notifyAll = slipsList.map((slip) =>
        sendNotificationToEmployee({
          employeeId: slip.id,
          title: '💰 Salary Credited',
          body: `Your salary of ₹${slip.netSalary?.toLocaleString('en-IN') ?? ''} for ${slipMonth} has been disbursed to your account. Please check your bank.`,
          category: 'salary',
          actionType: 'salary_disbursed',
        }).catch((err) =>
          console.warn(`[Payroll] Notification failed for employee ${slip.id}:`, err)
        )
      );
      await Promise.allSettled(notifyAll);

      toast.success('Disbursement completed successfully!');
      setIsProcessModalOpen(false);
      await loadPayrollData();
    } catch (err) {
      console.error('Disbursement execution failed:', err);
      toast.error('Disbursement failed. Please verify pool balances and try again.');
    } finally {
      setIsDisbursing(false);
    }
  };

  const handleApproveSlip = async (employeeId: number) => {
    try {
      const [year, month] = slipMonth.split('-').map(Number);
      await api.post('/api/payroll/admin/slips/approve', { employeeId, month, year });

      // Refresh slips list to get updated net salary
      const slipsRes = await api.get<{ success: boolean; slips: any[] }>(`/api/payroll/admin/slips?month=${slipMonth}`);
      if (slipsRes.data.success) {
        setSlipsList(slipsRes.data.slips);

        // Send notification to this specific employee
        const updatedSlip = slipsRes.data.slips.find((s: any) => s.id === employeeId);
        const monthLabel = new Date(year, month - 1, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
        const netDisplay = updatedSlip?.netSalary
          ? `₹${updatedSlip.netSalary.toLocaleString('en-IN')}`
          : 'your salary';
        await sendNotificationToEmployee({
          employeeId,
          title: '🧾 Salary Slip Generated',
          body: `Your salary slip for ${monthLabel} has been approved. Net pay: ${netDisplay}. View it in your Employee Portal.`,
          category: 'salary',
          actionType: 'salary_slip_generated',
        }).catch((err) =>
          console.warn(`[Payroll] Slip notification failed for employee ${employeeId}:`, err)
        );
      }

      toast.success('Salary slip approved and generated successfully!');
    } catch (err) {
      console.error('Failed to approve slip:', err);
      toast.error('Failed to approve salary slip.');
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

  const filteredAdvances = advancesList.filter(adv => {
    const matchesSearch = (adv.employeeName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (adv.employeeCode || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = advanceFilter === 'ALL' || adv.status === advanceFilter;
    return matchesSearch && matchesFilter;
  });

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
      className="space-y-8 pb-10 text-text-primary animate-fadeIn"
    >
      <SuperAdminHeader
        title="Payroll Governance"
        subtitle="Strategic oversight of fund flows, compliance standards, salary slips generation, and platform-wide disbursement operations."
        badgeText="Corporate Treasury & Remuneration"
        badgeIcon={Wallet}
        stats={[
          { 
            label: 'Total Volume (MTD)', 
            value: `₹${stats.mtdVolume.toLocaleString('en-IN')}`, 
            icon: Wallet,
            trend: '+12.4%',
            trendUp: true
          },
          { 
            label: 'Total Disbursed', 
            value: `₹${stats.disbursed.toLocaleString('en-IN')}`, 
            icon: CheckCircle2,
            badge: 'Verified'
          },
          { 
            label: 'Pending Approval', 
            value: `₹${stats.pending.toLocaleString('en-IN')}`, 
            icon: Clock,
            trend: '2 Runs',
            trendUp: false
          },
          { 
            label: 'Critical Errors', 
            value: stats.errors > 0 ? `${stats.errors} Batches` : '0 Batches', 
            icon: ShieldCheck,
            badge: 'System Healthy'
          },
        ]}
      >
        <button 
          onClick={() => setIsProcessModalOpen(true)}
          className="btn-primary group relative overflow-hidden shadow-xl shadow-primary/25 hover:shadow-primary/40 px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider justify-center flex items-center gap-2.5 transition-all duration-300 active:scale-95"
        >
          <span className="p-1 rounded-lg bg-white/20 group-hover:rotate-12 transition-transform">
            <Wallet size={16} />
          </span>
          <span>Bulk Process</span>
        </button>
      </SuperAdminHeader>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <motion.div 
          variants={itemVariants}
          className="xl:col-span-2 glass-card p-6 md:p-8 relative overflow-hidden group shadow-premium rounded-2xl border border-border/60 dark:border-white/10"
        >
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-1000" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 relative z-10">
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="heading-2 text-xl md:text-2xl font-black text-text-primary">Platform Disbursement Volume</h3>
                <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  <TrendingUp size={12} />
                  +14.2% Growth
                </span>
              </div>
              <p className="text-xs text-text-secondary mt-1 font-medium">Global payroll distribution trends over recent billing cycles</p>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 p-1 bg-surface-variant/60 dark:bg-white/[0.05] rounded-xl border border-border/50 dark:border-white/10 backdrop-blur-md">
                {(['1M', '3M', '5M', '1Y'] as const).map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setChartTimeframe(tf)}
                    className={cn(
                      "px-3 py-1 text-[11px] font-black rounded-lg transition-all",
                      chartTimeframe === tf
                        ? "bg-primary text-white shadow-md shadow-primary/20"
                        : "text-text-secondary hover:text-text-primary hover:bg-surface/50"
                    )}
                  >
                    {tf}
                  </button>
                ))}
              </div>
              <button className="p-2.5 rounded-xl border border-border/50 dark:border-white/10 bg-surface-variant/40 hover:bg-surface-variant text-text-secondary hover:text-text-primary transition-all">
                <Download size={15} />
              </button>
            </div>
          </div>

          <ChartContainer heightClassName="h-[340px]" className="relative z-10">
              <AreaChart data={displayedChartData}>
                <defs>
                  <linearGradient id="payrollGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0D9488" stopOpacity={0.45}/>
                    <stop offset="95%" stopColor="#0D9488" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: 'var(--text-secondary)', fontSize: 11, fontWeight: 800}} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: 'var(--text-secondary)', fontSize: 11, fontWeight: 800}}
                  tickFormatter={(value) => `₹${value/1000000}M`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#0D9488" 
                  strokeWidth={3.5}
                  fillOpacity={1} 
                  fill="url(#payrollGradient)" 
                  animationDuration={1800}
                  animationEasing="ease-in-out"
                />
              </AreaChart>
          </ChartContainer>
        </motion.div>

        <div className="flex flex-col gap-6">
          <motion.div 
            variants={itemVariants}
            whileHover={{ scale: 1.01 }}
            className="rounded-2xl p-7 bg-gradient-to-br from-[#0F766E] via-[#0D9488] to-[#115E59] text-white border border-teal-500/20 shadow-2xl relative overflow-hidden group h-full flex flex-col justify-between"
          >
            {/* Animated Radial Glow */}
            <motion.div 
              animate={{ 
                scale: [1, 1.25, 1],
                opacity: [0.2, 0.4, 0.2]
              }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="absolute -right-24 -top-24 w-96 h-96 bg-teal-300/25 rounded-full blur-[100px] pointer-events-none"
            />
            
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="p-3.5 bg-black/25 backdrop-blur-2xl rounded-xl group-hover:rotate-6 group-hover:scale-110 transition-all duration-500 border border-white/20 shadow-inner">
                    <IndianRupee size={28} className="text-teal-200" />
                  </div>
                  <div className="px-3.5 py-1.5 bg-black/30 backdrop-blur-2xl rounded-full text-[10px] font-black tracking-widest flex items-center gap-2 border border-white/20 shadow-sm text-white uppercase">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_12px_#34d399]" />
                    Active Liquidity
                  </div>
                </div>

                <div className="pt-4">
                  <p className="text-teal-100/70 text-[10.5px] font-black tracking-widest uppercase mb-1">Global Disbursement Pool</p>
                  <h3 className="text-4xl md:text-5xl font-black tracking-tight font-mono text-white group-hover:text-teal-100 transition-colors duration-500">
                    ₹24,842,100
                  </h3>
                </div>
              </div>
              
              <div className="pt-8">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider">
                    <span className="text-teal-100/80">Pool Utilization</span>
                    <span className="text-teal-200 font-mono">75.4%</span>
                  </div>
                  <div className="h-3 bg-black/30 rounded-full overflow-hidden p-0.5 border border-white/20 shadow-inner">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '75.4%' }}
                      transition={{ duration: 1.8, delay: 0.3, ease: "circOut" }}
                      className="h-full bg-gradient-to-r from-teal-300 via-emerald-300 to-green-200 rounded-full shadow-[0_0_18px_rgba(45,212,191,0.6)]"
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-teal-100/70 font-semibold pt-1">
                    <span>Buffer Reserved: ₹6.1M</span>
                    <span>Target: 80% Max</span>
                  </div>
                </div>

                <div className="mt-8 flex items-center gap-3">
                  <button className="flex-1 py-3.5 bg-white/20 hover:bg-white/30 border border-white/30 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 shadow-xl backdrop-blur-md flex items-center justify-center gap-2">
                    <Zap size={14} />
                    <span>Rebalance Pool</span>
                  </button>
                  <button className="p-3.5 bg-black/30 hover:bg-white/20 backdrop-blur-2xl border border-white/20 rounded-xl transition-all active:scale-95 shadow-sm text-white">
                    <ArrowUpRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            variants={itemVariants} 
            whileHover={{ x: 6 }}
            className="rounded-2xl p-5 border border-amber-500/25 hover:border-amber-500/50 bg-amber-500/[0.04] dark:bg-amber-500/[0.06] flex items-center justify-between group cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md relative overflow-hidden"
          >
            <div className="absolute right-0 top-0 w-24 h-24 bg-amber-500/10 blur-2xl rounded-full" />
            <div className="flex items-center gap-4 relative z-10">
              <div className="p-3.5 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 group-hover:rotate-12 group-hover:scale-110 transition-all shadow-sm border border-amber-500/20">
                <Clock size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-black text-text-primary uppercase tracking-tight">Manual Audit Queue</p>
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                </div>
                <p className="text-[11px] font-bold text-text-secondary mt-0.5 uppercase tracking-wider">12 runs awaiting approval</p>
              </div>
            </div>
            <div className="w-10 h-10 bg-surface dark:bg-white/10 rounded-xl flex items-center justify-center text-text-secondary group-hover:bg-primary group-hover:text-white transition-all shadow-sm border border-border/60 dark:border-white/10 relative z-10">
              <ArrowRight size={18} />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Pending Salary Advance Requests Alert Banner */}
      {advancesList.filter(a => a.status === 'PENDING').length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg backdrop-blur-md"
        >
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-amber-500/20 text-amber-400 rounded-md border border-amber-500/30">
              <Wallet size={24} className="animate-bounce" />
            </div>
            <div>
              <h4 className="text-sm font-black uppercase tracking-wider text-amber-300">
                {advancesList.filter(a => a.status === 'PENDING').length} Pending Salary Advance Request(s)
              </h4>
              <p className="text-xs font-medium text-amber-200/80 mt-0.5">
                Employees have submitted new salary advance & EMI applications awaiting your review and approval.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => { setMainTab('advances'); loadAdvancesData(); }}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-md transition-all shadow-md active:scale-95 shrink-0"
          >
            Review Advances Now →
          </button>
        </motion.div>
      )}

      {/* Navigation Subtabs Bar */}
      <div className="flex flex-wrap items-center gap-4 bg-slate-900/60 p-2 rounded-xl border border-white/10 backdrop-blur-md">
        <button
          type="button"
          onClick={() => setMainTab('slips')}
          className={cn(
            "px-6 py-4 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center gap-3 border shadow-md flex-1 sm:flex-none justify-center",
            mainTab === 'slips'
              ? "bg-primary text-white border-primary shadow-primary/30"
              : "bg-surface-variant/40 text-text-secondary border-transparent hover:text-text-primary hover:bg-surface-variant/80"
          )}
        >
          <IndianRupee size={18} />
          Employee Payslips Manager
        </button>
        <button
          type="button"
          onClick={() => { setMainTab('advances'); loadAdvancesData(); }}
          className={cn(
            "px-6 py-4 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center gap-3 border shadow-md relative flex-1 sm:flex-none justify-center",
            mainTab === 'advances'
              ? "bg-primary text-white border-primary shadow-primary/30"
              : "bg-surface-variant/40 text-text-secondary border-transparent hover:text-text-primary hover:bg-surface-variant/80"
          )}
        >
          <Wallet size={18} />
          Salary Advances & EMI Governance
          {advancesList.filter(a => a.status === 'PENDING').length > 0 ? (
            <span className="ml-2 px-2.5 py-0.5 bg-amber-400 text-slate-950 text-[10px] font-black rounded-full shadow-sm animate-pulse">
              {advancesList.filter(a => a.status === 'PENDING').length} PENDING
            </span>
          ) : (
            <span className="ml-2 px-2 py-0.5 bg-slate-800 text-slate-300 text-[10px] font-black rounded-full border border-white/10">
              {advancesList.length} Total
            </span>
          )}
        </button>
      </div>

      {/* Employee Payslips or Advances Table */}
      <motion.div variants={itemVariants} className="glass-card overflow-hidden shadow-premium">
          <div className="p-8 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <h3 className="heading-2">{mainTab === 'slips' ? 'Employee Payslips Manager' : 'Salary Advance & EMI Requests'}</h3>
              <p className="text-sm text-page-desc mt-1">
                {mainTab === 'slips' 
                  ? 'Generate, approve, and track salary slips for individual workforce members'
                  : 'Manage employee salary advance applications, define EMI payback periods (2, 4, 6 months), and track repayment'}
              </p>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-grow sm:flex-grow-0 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Search employees..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-11 pr-4 py-3.5 bg-surface-variant border-none rounded-sm text-xs outline-none focus:ring-4 focus:ring-primary/10 transition-all w-full sm:w-72 font-black uppercase tracking-widest text-text-primary"
                />
              </div>
            </div>
          </div>
          
          {mainTab === 'slips' ? (
            isSlipsLoading ? (
              <div className="p-8">
                <TableSkeleton rows={5} columns={6} />
              </div>
            ) : (
              <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-variant/50">
                    <th className="px-4 sm:px-6 md:px-8 py-5 sm:py-6 text-micro font-black uppercase tracking-[0.2em] text-text-secondary border-b border-border">Employee Code</th>
                    <th className="px-4 sm:px-6 md:px-8 py-5 sm:py-6 text-micro font-black uppercase tracking-[0.2em] text-text-secondary border-b border-border">Employee Name</th>
                    <th className="px-4 sm:px-6 md:px-8 py-5 sm:py-6 text-micro font-black uppercase tracking-[0.2em] text-text-secondary border-b border-border">Designation & Dept</th>
                    <th className="px-4 sm:px-6 md:px-8 py-5 sm:py-6 text-micro font-black uppercase tracking-[0.2em] text-text-secondary border-b border-border">Net Salary</th>
                    <th className="px-4 sm:px-6 md:px-8 py-5 sm:py-6 text-micro font-black uppercase tracking-[0.2em] text-text-secondary border-b border-border">Status</th>
                    <th className="px-4 sm:px-6 md:px-8 py-5 sm:py-6 text-micro font-black uppercase tracking-[0.2em] text-text-secondary border-b border-border text-right">Actions</th>
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
                        <span className="font-mono text-micro font-black text-text-secondary bg-slate-900 px-3 py-1.5 rounded-sm border border-white/5 shadow-sm group-hover:border-primary/30 transition-colors">
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
                          "px-4 py-2 rounded-sm text-label inline-flex items-center gap-2.5 transition-all border shadow-sm",
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
                              className="px-4 py-2 bg-primary/20 text-primary border border-primary/20 hover:bg-primary hover:text-white rounded-sm text-xs font-black uppercase tracking-wider transition-all active:scale-95"
                            >
                              Approve & Generate
                            </button>
                          ) : (
                            <button 
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setSelectedSlip(slip); setIsSlipModalOpen(true); }}
                              className="px-4 py-2 bg-success/20 text-success border border-success/20 hover:bg-success hover:text-white rounded-sm text-xs font-black uppercase tracking-wider transition-all active:scale-95"
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
          )
          ) : (
            <div className="overflow-x-auto">
              <div className="p-4 bg-surface-variant/30 border-b border-border flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Filter:</span>
                  {(['ALL', 'PENDING', 'APPROVED', 'PAID_OFF', 'REJECTED'] as const).map(filter => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setAdvanceFilter(filter)}
                      className={cn(
                        "px-3.5 py-1.5 rounded-sm text-micro font-black uppercase tracking-wider transition-all",
                        advanceFilter === filter
                          ? "bg-primary text-white shadow-sm"
                          : "bg-surface text-text-secondary border border-border hover:text-text-primary"
                      )}
                    >
                      {filter === 'PAID_OFF' ? 'Paid Off' : filter}
                    </button>
                  ))}
                </div>
                <div className="text-xs font-bold text-text-secondary">
                  Showing <span className="font-black text-text-primary">{filteredAdvances.length}</span> request(s)
                </div>
              </div>

              {isAdvancesLoading ? (
                <div className="p-8">
                  <TableSkeleton rows={5} columns={7} />
                </div>
              ) : filteredAdvances.length === 0 ? (
                <div className="p-16 text-center">
                  <Wallet size={44} className="mx-auto text-text-secondary/40 mb-3" />
                  <p className="text-sm font-bold text-text-secondary">No salary advance records match the selected filter.</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-variant/50">
                      <th className="px-6 py-5 text-micro font-black uppercase tracking-[0.2em] text-text-secondary border-b border-border">Employee</th>
                      <th className="px-6 py-5 text-micro font-black uppercase tracking-[0.2em] text-text-secondary border-b border-border">Advance Amount</th>
                      <th className="px-6 py-5 text-micro font-black uppercase tracking-[0.2em] text-text-secondary border-b border-border">EMI Plan</th>
                      <th className="px-6 py-5 text-micro font-black uppercase tracking-[0.2em] text-text-secondary border-b border-border">Paid / Remaining</th>
                      <th className="px-6 py-5 text-micro font-black uppercase tracking-[0.2em] text-text-secondary border-b border-border">EMI Progress</th>
                      <th className="px-6 py-5 text-micro font-black uppercase tracking-[0.2em] text-text-secondary border-b border-border">Status</th>
                      <th className="px-6 py-5 text-micro font-black uppercase tracking-[0.2em] text-text-secondary border-b border-border text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredAdvances.map((adv) => (
                      <tr key={adv.id} className="hover:bg-surface-variant/30 transition-colors">
                        <td className="px-6 py-5">
                          <div>
                            <span className="font-black text-text-primary block">{adv.employeeName}</span>
                            <span className="font-mono text-micro text-text-secondary bg-slate-900 px-2 py-0.5 rounded border border-white/5">{adv.employeeCode}</span>
                            <span className="text-xs font-medium text-text-secondary ml-2">{adv.designation}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 font-mono font-black text-emerald-500 text-sm">
                          ₹{adv.amount.toLocaleString('en-IN')}
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-text-primary">₹{adv.monthlyEmi.toLocaleString('en-IN')} / month</span>
                            <span className="text-micro font-bold text-text-secondary uppercase">{adv.months} EMI Installments</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-emerald-500">Paid: ₹{adv.paidAmount.toLocaleString('en-IN')}</span>
                            <span className="text-xs font-bold text-amber-500">Remaining: ₹{adv.remainingAmount.toLocaleString('en-IN')}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="w-32">
                            <div className="flex justify-between text-[10px] font-bold text-text-secondary mb-1">
                              <span>{adv.paidEmis} / {adv.months} EMIs</span>
                              <span>{Math.round((adv.paidEmis / (adv.months || 1)) * 100)}%</span>
                            </div>
                            <div className="h-2 w-full bg-surface-variant rounded-full overflow-hidden">
                              <div
                                className="h-full bg-emerald-500 rounded-full transition-all"
                                style={{ width: `${Math.min(100, (adv.paidEmis / (adv.months || 1)) * 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className={cn(
                            "px-3 py-1 rounded-sm text-micro font-black uppercase tracking-wider inline-flex items-center gap-1.5 border shadow-sm",
                            adv.status === 'APPROVED' && "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
                            adv.status === 'PENDING' && "bg-warning/10 text-warning border-warning/20 animate-pulse",
                            adv.status === 'PAID_OFF' && "bg-blue-500/10 text-blue-400 border-blue-500/20",
                            adv.status === 'REJECTED' && "bg-rose-500/10 text-rose-400 border-rose-500/20"
                          )}>
                            {adv.status === 'APPROVED' && <CheckCircle2 size={12} />}
                            {adv.status === 'PENDING' && <Clock size={12} />}
                            {adv.status === 'PAID_OFF' && <ShieldCheck size={12} />}
                            {adv.status}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          {adv.status === 'PENDING' ? (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedAdvance(adv);
                                setReviewMonths(adv.months || 4);
                                setReviewNote('');
                                setIsReviewModalOpen(true);
                              }}
                              className="px-3.5 py-2 bg-primary text-white hover:bg-primary/90 rounded-sm text-xs font-bold uppercase tracking-wider transition-all shadow-sm active:scale-95"
                            >
                              Review & Set EMI
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedAdvance(adv);
                                setReviewMonths(adv.months || 4);
                                setReviewNote(adv.reviewNote || '');
                                setIsReviewModalOpen(true);
                              }}
                              className="px-3 py-1.5 bg-surface-variant hover:bg-surface-variant/80 text-text-secondary rounded-sm text-xs font-bold uppercase tracking-wider border border-border"
                            >
                              View Details
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </motion.div>

      {/* View Payslip Modal */}
      <Modal
        isOpen={isSlipModalOpen}
        onClose={() => setIsSlipModalOpen(false)}
        title="Employee Salary Slip"
        maxWidth="max-w-5xl"
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
                onClick={(e) => {
                  try {
                    e.currentTarget.showPicker();
                  } catch (err) {}
                }}
                className="px-4 py-2 bg-slate-800/80 border border-white/10 rounded-sm text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all cursor-pointer"
              />
            </div>

            <style>{`
              @media print {
                @page {
                  size: A4 landscape;
                  margin: 10mm;
                }
                html, body {
                  overflow: visible !important;
                  height: auto !important;
                }
                body * {
                  visibility: hidden !important;
                }
                #salary-slip-print, #salary-slip-print * {
                  visibility: visible !important;
                }
                /* Flatten modal wrapper/backdrop to avoid fixed positioning & overflow clipping in print */
                div[class*="fixed"], div[class*="relative"], div[class*="overflow"], div[class*="absolute"] {
                  position: static !important;
                  overflow: visible !important;
                  max-height: none !important;
                  height: auto !important;
                  transform: none !important;
                  opacity: 1 !important;
                }
                #salary-slip-print {
                  position: absolute !important;
                  left: 0 !important;
                  top: 0 !important;
                  width: 100% !important;
                  margin: 0 !important;
                  padding: 0 !important;
                  box-sizing: border-box !important;
                }
                /* Print specific style resets */
                .print-bg-white {
                  background-color: #ffffff !important;
                  background-image: none !important;
                }
                .print-text-dark {
                  color: #0f172a !important;
                }
                .print-text-muted {
                  color: #475569 !important;
                }
                .print-border {
                  border-color: #cbd5e1 !important;
                }
                .print-divide > * + * {
                  border-color: #cbd5e1 !important;
                }
                .print-bg-emerald {
                  background-color: #f0fdf4 !important;
                  border-color: #bbf7d0 !important;
                }
                .print-text-emerald {
                  color: #15803d !important;
                }
                .print-bg-rose {
                  background-color: #fff1f2 !important;
                  border-color: #fecdd3 !important;
                }
                .print-text-rose {
                  color: #b91c1c !important;
                }
                .print-bg-primary {
                  background-color: #f8fafc !important;
                  border-color: #cbd5e1 !important;
                }
                .print-text-primary {
                  color: #0d9488 !important;
                }
              }
            `}</style>

            {/* ── SALARY SLIP DOCUMENT ── */}
            <div className="border border-white/10 rounded-sm overflow-hidden bg-slate-950/60 shadow-2xl print-bg-white print-border">

              {/* Company Header */}
              <div className="bg-gradient-to-r from-primary/25 via-teal-500/15 to-emerald-500/10 border-b border-white/10 px-8 py-6 flex items-center justify-between print-bg-white print-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-sm bg-primary flex items-center justify-center shadow-lg shadow-primary/40">
                    <Wallet size={20} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white tracking-tight print-text-dark">HRM</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest print-text-muted">Human Resources · Payroll Division</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest print-text-muted">Salary Slip</p>
                  <p className="text-sm font-black text-primary mt-0.5 print-text-primary">{monthLabel}</p>
                  <p className="text-[10px] font-mono text-slate-500 mt-1 print-text-muted">
                    DOC: QB-PAY-{selectedSlip.employeeCode}-{yr}{String(mo).padStart(2, '0')}
                  </p>
                </div>
              </div>

              <div className="p-8 space-y-6">

                {/* Info & Attendance Row side-by-side in landscape */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Employee Info Grid */}
                  <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-4 border border-white/8 rounded-sm p-6 print-border">
                    {([
                      ['Employee Name',   selectedSlip.name],
                      ['Employee Code',   selectedSlip.employeeCode],
                      ['Designation',     selectedSlip.designation],
                      ['Department',      selectedSlip.department],
                      ['Office / Branch', selectedSlip.office],
                      ['Pay Period',      monthLabel],
                    ] as [string, string][]).map(([label, value]) => (
                      <div key={label} className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest print-text-muted">{label}</span>
                        <span className="text-sm font-bold text-white print-text-dark">{value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Attendance Details Summary */}
                  <div className="border border-white/10 rounded-sm overflow-hidden flex flex-col justify-between p-5 bg-white/3 print-border print-bg-white">
                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 print-text-muted">Attendance Summary</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { label: 'Working Days', value: slipAttendance?.workingDays ?? 0, numColor: 'text-slate-100 print-text-dark' },
                          { label: 'Present',      value: slipAttendance?.present     ?? 0, numColor: 'text-emerald-400 print-text-emerald' },
                          { label: 'Absent',       value: slipAttendance?.absent      ?? 0, numColor: 'text-rose-400 print-text-rose' },
                          { label: 'Half Day',     value: slipAttendance?.halfDay     ?? 0, numColor: 'text-blue-400 print-text-dark' },
                          { label: 'Late',         value: slipAttendance?.late        ?? 0, numColor: 'text-amber-400 print-text-dark' },
                          { label: 'Leave',        value: slipAttendance?.leave       ?? 0, numColor: 'text-purple-400 print-text-dark' },
                        ].map(({ label, value, numColor }) => (
                          <div key={label} className="flex flex-col items-center justify-center p-2 rounded bg-white/5 border border-white/5 print-border print-bg-white">
                            <span className={`text-lg font-black font-mono leading-none ${numColor}`}>{value}</span>
                            <span className="text-[8px] font-bold text-slate-500 mt-1 text-center tracking-tight print-text-muted">{label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Earnings & Deductions side-by-side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* Earnings */}
                  <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-sm overflow-hidden print-bg-emerald print-border">
                    <div className="bg-emerald-500/10 px-5 py-3 border-b border-emerald-500/15 print-bg-emerald print-border">
                      <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest print-text-emerald">Earnings</h4>
                    </div>
                    <div className="divide-y divide-white/5 print-divide">
                      {([
                        ['Basic Salary',              basic],
                        ['House Rent Allowance (HRA)', hra],
                        ['Transport Allowance (TA)',   ta],
                        ['Special Allowance',          special],
                      ] as [string, number][]).map(([label, amt]) => (
                        <div key={label} className="flex justify-between items-center px-5 py-3">
                          <span className="text-xs font-medium text-slate-400 print-text-muted">{label}</span>
                          <span className="text-xs font-black text-white font-mono print-text-dark">₹ {amt.toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                      <div className="flex justify-between items-center px-5 py-3 bg-emerald-500/10 print-bg-emerald print-border">
                        <span className="text-xs font-black text-emerald-400 uppercase tracking-wider print-text-emerald">Gross Earnings</span>
                        <span className="text-sm font-black text-emerald-400 font-mono print-text-emerald">₹ {grossEarnings.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Deductions */}
                  <div className="bg-rose-500/5 border border-rose-500/15 rounded-sm overflow-hidden print-bg-rose print-border">
                    <div className="bg-rose-500/10 px-5 py-3 border-b border-rose-500/15 print-bg-rose print-border">
                      <h4 className="text-[10px] font-black text-rose-400 uppercase tracking-widest print-text-rose">Deductions</h4>
                    </div>
                    <div className="divide-y divide-white/5 print-divide">
                      {([
                        ['Provident Fund (EPF 12%)', pf],
                        ['Professional Tax (PT)',    pt],
                        ['TDS / Income Tax',         tds],
                      ] as [string, number][]).map(([label, amt]) => (
                        <div key={label} className="flex justify-between items-center px-5 py-3">
                          <span className="text-xs font-medium text-slate-400 print-text-muted">{label}</span>
                          <span className="text-xs font-black text-white font-mono print-text-dark">₹ {amt.toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                      <div className="flex justify-between items-center px-5 py-3 bg-rose-500/10 print-bg-rose print-border">
                        <span className="text-xs font-black text-rose-400 uppercase tracking-wider print-text-rose">Total Deductions</span>
                        <span className="text-sm font-black text-rose-400 font-mono print-text-rose">₹ {totalDeductions.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Net Pay Banner */}
                <div className="bg-gradient-to-r from-primary/20 to-teal-500/10 border border-primary/25 rounded-sm px-7 py-5 flex items-center justify-between print-bg-primary print-border">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest print-text-muted">Net Payable Amount</p>
                    <p className="text-3xl font-black text-primary mt-1 font-mono print-text-primary">₹ {netPay.toLocaleString('en-IN')}</p>
                    <p className="text-[10px] font-medium text-slate-400 mt-1 italic print-text-muted">{netInWords}</p>
                  </div>
                  <div className="text-right">
                    <span className="px-3 py-1.5 bg-success/15 text-success text-[10px] font-black rounded-full uppercase border border-success/25 print-bg-emerald print-text-emerald print-border">Approved</span>
                    <p className="text-[10px] font-mono text-slate-500 mt-2 print-text-muted">Paid via: Bank Transfer</p>
                  </div>
                </div>

                {/* Signature lines */}
                <div className="grid grid-cols-2 gap-8 pt-4 border-t border-white/5 print-border">
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest print-text-muted">Employee Acknowledgement</p>
                    <div className="h-8 border-b border-dashed border-white/10 print-border" />
                    <p className="text-[10px] text-slate-600 print-text-dark">{selectedSlip.name} · {selectedSlip.employeeCode}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest print-text-muted">Authorised Signatory</p>
                    <div className="h-8 border-b border-dashed border-white/10 print-border" />
                    <p className="text-[10px] text-slate-600 print-text-dark">HR Department · HRM</p>
                  </div>
                </div>

                <p className="text-center text-[9px] text-slate-600 pt-2 print-text-muted">
                  This is a computer-generated salary slip and does not require a physical signature. · {monthLabel}
                </p>
              </div>
            </div>

            {/* Action buttons (hidden on print) */}
            <div className="flex justify-end gap-3 print:hidden">
              <button
                type="button"
                onClick={() => setIsSlipModalOpen(false)}
                className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 rounded-sm text-xs font-black uppercase tracking-wider transition-all active:scale-95"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handlePrintSlip}
                className="px-7 py-3 bg-primary hover:bg-primary/90 text-white rounded-sm text-xs font-black uppercase tracking-wider transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-primary/25"
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
        title="Payroll & Attendance Management"
      >
        <PayrollAttendanceModal 
          onClose={() => setIsProcessModalOpen(false)}
          onBulkDisburse={handleBulkDisburse}
          isDisbursing={isDisbursing}
        />
      </Modal>

      {/* Salary Advance Review Modal */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title="Salary Advance Approval & EMI Setup"
      >
        {selectedAdvance && (
          <div className="space-y-5 p-2">
            <div className="p-4 bg-surface-variant/40 border border-border rounded-sm space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Employee Name:</span>
                <span className="text-sm font-black text-text-primary">{selectedAdvance.employeeName} ({selectedAdvance.employeeCode})</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Requested Advance Amount:</span>
                <span className="text-base font-black text-emerald-500 font-mono">₹{selectedAdvance.amount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Reason for Advance:</span>
                <span className="text-xs font-semibold text-text-primary italic">"{selectedAdvance.reason}"</span>
              </div>
            </div>

            {selectedAdvance.status === 'PENDING' ? (
              <>
                <div className="space-y-2">
                  <label className="block text-xs font-black text-text-secondary uppercase tracking-wider">
                    Select EMI Tenure (Payback Months)
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[2, 3, 4, 6].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setReviewMonths(m)}
                        className={cn(
                          "py-2.5 rounded-sm text-xs font-black uppercase tracking-wider border transition-all",
                          reviewMonths === m
                            ? "bg-primary text-white border-primary shadow-md"
                            : "bg-surface text-text-secondary border border-border hover:border-primary/50"
                        )}
                      >
                        {m} Months
                      </button>
                    ))}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs font-bold text-text-secondary">Or Custom Months:</span>
                    <input
                      type="number"
                      min={1}
                      max={24}
                      value={reviewMonths}
                      onChange={(e) => setReviewMonths(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-24 p-2 bg-surface border border-border rounded-sm text-xs font-bold text-text-primary"
                    />
                  </div>
                </div>

                {/* Calculation Summary Card */}
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-sm space-y-1.5">
                  <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Calculated Payroll EMI</p>
                  <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                    ₹{Math.round(selectedAdvance.amount / (reviewMonths || 1)).toLocaleString('en-IN')} <span className="text-xs font-bold">/ month</span>
                  </p>
                  <p className="text-xs font-medium text-text-secondary">
                    ₹{Math.round(selectedAdvance.amount / (reviewMonths || 1)).toLocaleString('en-IN')} will be automatically deducted from monthly salary for {reviewMonths} consecutive months.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-black text-text-secondary uppercase tracking-wider">
                    Review Note / Remarks
                  </label>
                  <textarea
                    rows={2}
                    value={reviewNote}
                    onChange={(e) => setReviewNote(e.target.value)}
                    placeholder="Enter approval note or rejection reason..."
                    className="w-full p-2.5 bg-surface border border-border rounded-sm text-xs font-medium outline-none focus:border-primary"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    disabled={isSubmittingReview}
                    onClick={() => handleReviewAdvance('REJECT')}
                    className="px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/30 rounded-sm text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50"
                  >
                    Reject Request
                  </button>
                  <button
                    type="button"
                    disabled={isSubmittingReview}
                    onClick={() => handleReviewAdvance('APPROVE')}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-sm text-xs font-bold uppercase tracking-wider transition-all shadow-md disabled:opacity-50 flex items-center gap-2"
                  >
                    <CheckCircle2 size={16} />
                    Approve Advance & Start EMI
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-4 pt-2">
                <div className="p-4 bg-surface-variant/30 border border-border rounded-sm space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-text-secondary">Status:</span>
                    <span className="text-xs font-black uppercase px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-500">{selectedAdvance.status}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-text-secondary">Approved Monthly EMI:</span>
                    <span className="text-sm font-black text-text-primary font-mono">₹{selectedAdvance.monthlyEmi} / month</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-text-secondary">EMI Installments:</span>
                    <span className="text-xs font-bold text-text-primary">{selectedAdvance.paidEmis} of {selectedAdvance.months} Paid</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-text-secondary">Remaining Balance:</span>
                    <span className="text-sm font-black text-amber-500 font-mono">₹{selectedAdvance.remainingAmount}</span>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsReviewModalOpen(false)}
                    className="px-4 py-2 bg-surface-variant text-text-secondary text-xs font-bold uppercase tracking-wider rounded-sm border border-border"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </motion.div>
  );
};

export default PayrollPage;
