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
  Zap,
  Receipt,
  RefreshCw
} from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import TableSkeleton from '@/components/TableSkeleton';
import PaginationFooter from '@/components/PaginationFooter';
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
import Modal from '@/components/Modal';
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
  const totalDaysInMonth = yr && mo ? new Date(yr, mo, 0).getDate() : 30;
  const totalMonths   = slip.totalMonths ?? 1;
  const monthLabel    = new Date(yr, mo - 1, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  const monthShort    = new Date(yr, mo - 1, 1).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }).replace(' ', '-');
  const netInWords    = numToWords(netPay) + ' Rupees Only';
  return { basic, hra, ta, special, grossEarnings, pf, pt, tds, totalDeductions, netPay, yr, mo, totalDaysInMonth, totalMonths, monthLabel, monthShort, netInWords };
}
// ───────────────────────────────────────────────────────────────────────────

import SalaryStructureTab from '../components/SalaryStructureTab';
import ExpenseClaimsTab, { ExpenseClaim } from '../components/ExpenseClaimsTab';
import { SalarySlip } from '@/components/SalarySlip/SalarySlip';

const PayrollPage = () => {
  const [stats, setStats] = useState<any>({ mtdVolume: 0, disbursed: 0, pending: 0, errors: 0 });
  const [trendData, setTrendData] = useState<any[]>([]);
  const [runsList, setRunsList] = useState<any[]>([]);
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
  const [mainTab, setMainTab] = useState<'slips' | 'advances' | 'expenses' | 'structure'>('slips');
  const [expensesList, setExpensesList] = useState<ExpenseClaim[]>([]);
  const [advancesList, setAdvancesList] = useState<any[]>([]);
  const [isAdvancesLoading, setIsAdvancesLoading] = useState(false);
  const [advanceFilter, setAdvanceFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'PAID_OFF' | 'REJECTED'>('ALL');
  const [selectedAdvance, setSelectedAdvance] = useState<any | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewMonths, setReviewMonths] = useState<number>(4);
  const [reviewNote, setReviewNote] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Slips pagination state
  const [slipsPage, setSlipsPage] = useState(1);
  const [slipsPageSize, setSlipsPageSize] = useState(10);

  // Advances pagination state
  const [advancesPage, setAdvancesPage] = useState(1);
  const [advancesPageSize, setAdvancesPageSize] = useState(10);

  useEffect(() => {
    setSlipsPage(1);
  }, [searchTerm, slipMonth]);

  useEffect(() => {
    setAdvancesPage(1);
  }, [searchTerm, advanceFilter]);

  const loadAdvancesData = useCallback(async () => {
    setIsAdvancesLoading(true);
    try {
      const res = await api.get<any>('/api/payroll/admin/advances');
      const list = res.data?.advances || res.data?.data || res.data?.records || (Array.isArray(res.data) ? res.data : []);
      setAdvancesList(Array.isArray(list) ? list : []);
    } catch (err) {
      console.warn('Failed to load salary advances:', err);
      setAdvancesList([]);
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
      console.warn('Review advance error:', err);
      toast.error(err?.response?.data?.message || 'Failed to process advance review.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const [slipAttendance, setSlipAttendance] = useState<{
    totalDaysInMonth?: number;
    workingDays: number;
    present: number;
    absent: number;
    halfDay: number;
    late: number;
    leave: number;
  } | null>(null);

  const handleExpensesLoaded = useCallback((list: ExpenseClaim[]) => {
    setExpensesList(list);
  }, []);

  const loadExpensesData = useCallback(async () => {
    try {
      const res = await api.get<any>('/api/hr/expenses');
      const list = res.data?.expenses || (Array.isArray(res.data) ? res.data : []);
      setExpensesList(Array.isArray(list) ? list : []);
    } catch (err) {
      console.warn('Failed to load expense claims:', err);
      setExpensesList([]);
    }
  }, []);

  const loadPayrollData = useCallback(async () => {
    setIsPageLoading(true);
    setIsSlipsLoading(true);
    try {
      const [statsRes, runsRes, slipsRes] = await Promise.allSettled([
        api.get<any>('/api/payroll/admin/stats'),
        api.get<any>('/api/payroll/admin/runs'),
        api.get<any>(`/api/payroll/admin/slips?month=${slipMonth}`),
        loadAdvancesData(),
        loadExpensesData()
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value.data) {
        const sData = statsRes.value.data.stats || statsRes.value.data.data || statsRes.value.data;
        if (sData) setStats(sData);
        if (statsRes.value.data.trend) setTrendData(statsRes.value.data.trend);
      }
      if (runsRes.status === 'fulfilled' && runsRes.value.data) {
        const rList = runsRes.value.data.runs || runsRes.value.data.data || (Array.isArray(runsRes.value.data) ? runsRes.value.data : []);
        if (Array.isArray(rList) && rList.length > 0) setRunsList(rList);
      }

      let fetchedSlips: any[] = [];
      if (slipsRes.status === 'fulfilled' && slipsRes.value.data) {
        fetchedSlips = slipsRes.value.data.slips || slipsRes.value.data.data || slipsRes.value.data.records || (Array.isArray(slipsRes.value.data) ? slipsRes.value.data : []);
      }

      setSlipsList(Array.isArray(fetchedSlips) ? fetchedSlips : []);
    } catch (err) {
      console.warn('Failed to load payroll data:', err);
      setSlipsList([]);
    } finally {
      setIsPageLoading(false);
      setIsSlipsLoading(false);
    }
  }, [slipMonth, loadAdvancesData, loadExpensesData]);

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
        const [yrStr, moStr] = slipMonth.split('-');
        const calcDays = yrStr && moStr ? new Date(parseInt(yrStr), parseInt(moStr), 0).getDate() : 30;

        const res = await api.get<{ success: boolean; details: any[] }>(
          `/api/admin/reports/attendance-details?month=${slipMonth}`
        );
        if (res.data.success) {
          const empRecord = res.data.details.find(
            (d: any) => d.employeeCode === selectedSlip.employeeCode
          );
          if (empRecord) {
            setSlipAttendance({
              totalDaysInMonth: calcDays,
              workingDays: empRecord.totalDays || 26,
              present: empRecord.present || 0,
              absent: empRecord.absent || 0,
              halfDay: empRecord.halfDay || 0,
              late: empRecord.late || 0,
              leave: empRecord.leave || 0,
            });
          } else {
            setSlipAttendance({
              totalDaysInMonth: calcDays,
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

  const slipsTotalPages = Math.ceil(filteredSlips.length / slipsPageSize) || 1;
  const paginatedSlips = filteredSlips.slice(
    (slipsPage - 1) * slipsPageSize,
    slipsPage * slipsPageSize
  );

  const advancesTotalPages = Math.ceil(filteredAdvances.length / advancesPageSize) || 1;
  const paginatedAdvances = filteredAdvances.slice(
    (advancesPage - 1) * advancesPageSize,
    advancesPage * advancesPageSize
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

  // Dynamic stats calculation from loaded API data (slipsList & advancesList & stats)
  const totalVolumeAmount = slipsList.length > 0
    ? slipsList.reduce((acc, s) => acc + (s.netSalary || s.baseSalary || 0), 0)
    : (stats?.mtdVolume || 0);

  const totalDisbursedAmount = slipsList.length > 0
    ? slipsList.filter(s => s.status === 'Approved').reduce((acc, s) => acc + (s.netSalary || s.baseSalary || 0), 0)
    : (stats?.disbursed || 0);

  const pendingAdvancesCount = advancesList.filter(a => a.status === 'PENDING').length;

  const formatAmountDisplay = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)}L`;
    }
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-10 text-text-primary animate-fadeIn"
    >
      {/* Redesigned Header Banner */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-2xl border border-border/60 dark:border-white/10 bg-surface/90 dark:bg-slate-900/90 backdrop-blur-2xl p-6 md:p-8 shadow-lg dark:shadow-2xl transition-all duration-300"
      >
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full filter blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute -bottom-24 -left-12 w-80 h-80 bg-teal-500/10 rounded-full filter blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left Title & Subtitle */}
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/15 via-emerald-500/10 to-teal-500/15 border border-primary/30 text-primary text-[10.5px] font-black px-3.5 py-1.5 rounded-full uppercase tracking-widest shadow-sm backdrop-blur-md">
              <Wallet size={13} className="animate-pulse text-primary" />
              <span>Payroll Governance & Financial Operations</span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-text-primary tracking-tight leading-tight">
              Payroll Governance 
            </h1>
            <p className="text-xs md:text-sm text-text-secondary font-medium leading-relaxed">
              Strategic oversight of fund flows, salary slips generation, bulk disbursement, and salary advance EMI management.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button 
                type="button"
                onClick={() => {
                  toast.info('Refreshing payroll records...');
                  window.location.reload();
                }}
                disabled={isLoading}
                className="btn-secondary group relative overflow-hidden px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider justify-center flex items-center gap-2 transition-all duration-300 active:scale-95 border border-border/60 cursor-pointer"
                title="Refresh Payroll Data"
              >
                <RefreshCw size={15} className={cn(isLoading && "animate-spin")} />
                <span>Refresh</span>
              </button>
              <button 
                onClick={() => setIsProcessModalOpen(true)}
                className="btn-primary group relative overflow-hidden shadow-xl shadow-primary/25 hover:shadow-primary/40 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider justify-center flex items-center gap-2.5 transition-all duration-300 active:scale-95"
              >
                <span className="p-1 rounded-lg bg-white/20 group-hover:rotate-12 transition-transform">
                  <Zap size={15} />
                </span>
                <span>Bulk Process Expenses Report</span>
              </button>

              <div className="flex items-center gap-2 bg-surface-variant/50 dark:bg-slate-950/40 px-3.5 py-2.5 rounded-xl border border-border/50 dark:border-white/10 backdrop-blur-md">
                <Clock size={14} className="text-text-secondary" />
                <span className="text-xs font-bold text-text-secondary">Cycle:</span>
                <input
                  type="month"
                  value={slipMonth}
                  onChange={(e) => setSlipMonth(e.target.value)}
                  className="bg-transparent text-xs font-black text-text-primary outline-none cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Right Dynamic Summary Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3 gap-3.5 shrink-0">
            <div className="bg-surface-variant/40 dark:bg-slate-950/40 border border-border/50 dark:border-white/10 p-4 rounded-xl backdrop-blur-xl shadow-inner">
              <div className="flex items-center gap-1.5 text-[10px] font-black text-text-secondary uppercase tracking-wider mb-1">
                <Wallet size={12} className="text-primary" />
                <span>Monthly Volume</span>
              </div>
              <p className="text-lg md:text-xl font-black text-text-primary font-mono tracking-tight">
                {formatAmountDisplay(totalVolumeAmount)}
              </p>
              <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 inline-block mt-1">
                {slipsList.length > 0 ? `${slipsList.length} Total Slips` : 'Live API Data'}
              </span>
            </div>

            <div className="bg-surface-variant/40 dark:bg-slate-950/40 border border-border/50 dark:border-white/10 p-4 rounded-xl backdrop-blur-xl shadow-inner">
              <div className="flex items-center gap-1.5 text-[10px] font-black text-text-secondary uppercase tracking-wider mb-1">
                <CheckCircle2 size={12} className="text-emerald-500" />
                <span>Disbursed</span>
              </div>
              <p className="text-lg md:text-xl font-black text-text-primary font-mono tracking-tight">
                {formatAmountDisplay(totalDisbursedAmount)}
              </p>
              <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 inline-block mt-1">
                {slipsList.length > 0 ? `${slipsList.filter(s => s.status === 'Approved').length} Disbursed` : 'Verified'}
              </span>
            </div>

            <div className="bg-surface-variant/40 dark:bg-slate-950/40 border border-border/50 dark:border-white/10 p-4 rounded-xl backdrop-blur-xl shadow-inner col-span-2 sm:col-span-1 lg:col-span-1 xl:col-span-1">
              <div className="flex items-center gap-1.5 text-[10px] font-black text-text-secondary uppercase tracking-wider mb-1">
                <ShieldCheck size={12} className="text-amber-500" />
                <span>Advances Req</span>
              </div>
              <p className="text-lg md:text-xl font-black text-amber-500 font-mono tracking-tight">
                {pendingAdvancesCount} Pending
              </p>
              <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 inline-block mt-1">
                {advancesList.length > 0 ? `${advancesList.length} Total Requests` : 'Needs Review'}
              </span>
            </div>
          </div>
        </div>
      </motion.div>




      {/* Pending Expense Claims Alert Banner */}
      {expensesList.filter(e => e.status === 'PENDING').length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 text-emerald-900 dark:text-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl backdrop-blur-xl relative overflow-hidden"
        >
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-3 bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-xl border border-emerald-500/30 shadow-inner flex items-center justify-center shrink-0">
              <Receipt size={24} className="animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs md:text-sm font-black uppercase tracking-wider text-emerald-950 dark:text-emerald-300">
                  {expensesList.filter(e => e.status === 'PENDING').length} Pending Expense Reimbursement Claim(s)
                </h4>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-900 dark:text-emerald-300 text-[10px] font-black border border-emerald-500/40 animate-pulse">
                  Review Required
                </span>
              </div>
              <p className="text-xs font-semibold text-emerald-900/90 dark:text-emerald-200/80 mt-0.5">
                Employees have submitted new expense reimbursement claims awaiting HR review and approval.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => { setMainTab('expenses'); loadExpensesData(); }}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg active:scale-95 shrink-0 border border-emerald-400/30 flex items-center gap-2 relative z-10 cursor-pointer"
          >
            <span>Review Expenses Now</span>
            <ArrowRight size={14} />
          </button>
        </motion.div>
      )}

      {/* Pending Salary Advance Requests Alert Banner */}
      {advancesList.filter(a => a.status === 'PENDING').length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl backdrop-blur-xl relative overflow-hidden"
        >
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-3 bg-amber-500/20 text-amber-700 dark:text-amber-400 rounded-xl border border-amber-500/30 shadow-inner flex items-center justify-center shrink-0">
              <Wallet size={24} className="animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs md:text-sm font-black uppercase tracking-wider text-amber-950 dark:text-amber-300">
                  {advancesList.filter(a => a.status === 'PENDING').length} Pending Salary Advance Request(s)
                </h4>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-900 dark:text-amber-300 text-[10px] font-black border border-amber-500/40 animate-pulse">
                  Action Required
                </span>
              </div>
              <p className="text-xs font-semibold text-amber-900/90 dark:text-amber-200/80 mt-0.5">
                Employees have submitted new salary advance & EMI applications awaiting your review and approval.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => { setMainTab('advances'); loadAdvancesData(); }}
            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 dark:bg-amber-600 dark:hover:bg-amber-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg active:scale-95 shrink-0 border border-amber-400/30 flex items-center gap-2 relative z-10 cursor-pointer"
          >
            <span>Review Advances Now</span>
            <ArrowRight size={14} />
          </button>
        </motion.div>
      )}

      {/* Navigation Subtabs Bar */}
      <div className="flex flex-wrap items-center gap-2 bg-surface-variant/40 dark:bg-slate-900/60 p-1.5 rounded-2xl border border-border/60 dark:border-white/10 backdrop-blur-xl shadow-lg">
        <button
          type="button"
          onClick={() => setMainTab('slips')}
          className={cn(
            "px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2.5 flex-1 sm:flex-none justify-center border",
            mainTab === 'slips'
              ? "bg-primary text-white border-primary shadow-lg shadow-primary/25"
              : "bg-transparent text-text-secondary border-transparent hover:text-text-primary hover:bg-surface/50"
          )}
        >
          <IndianRupee size={16} />
          <span>Employee Payslips Manager</span>
        </button>
        <button
          type="button"
          onClick={() => { setMainTab('advances'); loadAdvancesData(); }}
          className={cn(
            "px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2.5 relative flex-1 sm:flex-none justify-center border",
            mainTab === 'advances'
              ? "bg-primary text-white border-primary shadow-lg shadow-primary/25"
              : "bg-transparent text-text-secondary border-transparent hover:text-text-primary hover:bg-surface/50"
          )}
        >
          <Wallet size={16} />
          <span>Salary Advances & EMI Governance</span>
          {advancesList.filter(a => a.status === 'PENDING').length > 0 ? (
            <span className="ml-1.5 px-2 py-0.5 bg-amber-400 text-slate-950 text-[10px] font-black rounded-full shadow-sm animate-pulse">
              {advancesList.filter(a => a.status === 'PENDING').length} PENDING
            </span>
          ) : (
            <span className="ml-1.5 px-2 py-0.5 bg-surface-variant dark:bg-white/10 text-text-secondary text-[10px] font-black rounded-full border border-border/50 dark:border-white/10">
              {advancesList.length} Total
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => { setMainTab('expenses'); loadExpensesData(); }}
          className={cn(
            "px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2.5 relative flex-1 sm:flex-none justify-center border",
            mainTab === 'expenses'
              ? "bg-primary text-white border-primary shadow-lg shadow-primary/25"
              : "bg-transparent text-text-secondary border-transparent hover:text-text-primary hover:bg-surface/50"
          )}
        >
          <Receipt size={16} />
          <span>Expense Claims & History</span>
          {expensesList.filter(e => e.status === 'PENDING').length > 0 ? (
            <span className="ml-1.5 px-2 py-0.5 bg-amber-400 text-slate-950 text-[10px] font-black rounded-full shadow-sm animate-pulse">
              {expensesList.filter(e => e.status === 'PENDING').length} REQ
            </span>
          ) : (
            <span className="ml-1.5 px-2 py-0.5 bg-surface-variant dark:bg-white/10 text-text-secondary text-[10px] font-black rounded-full border border-border/50 dark:border-white/10">
              {expensesList.length} Total
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setMainTab('structure')}
          className={cn(
            "px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2.5 flex-1 sm:flex-none justify-center border",
            mainTab === 'structure'
              ? "bg-primary text-white border-primary shadow-lg shadow-primary/25"
              : "bg-transparent text-text-secondary border-transparent hover:text-text-primary hover:bg-surface/50"
          )}
        >
          <ShieldCheck size={16} />
          <span>Salary Structure & Components</span>
        </button>
      </div>

      {/* Employee Payslips, Advances, Expense Claims, or Salary Structure Table */}
      {mainTab === 'structure' ? (
        <motion.div variants={itemVariants} className="glass-card rounded-2xl border border-border/60 dark:border-white/10 bg-surface/90 dark:bg-slate-900/90 backdrop-blur-2xl overflow-hidden shadow-xl">
          <SalaryStructureTab />
        </motion.div>
      ) : mainTab === 'expenses' ? (
        <motion.div variants={itemVariants} className="glass-card rounded-2xl border border-border/60 dark:border-white/10 bg-surface/90 dark:bg-slate-900/90 backdrop-blur-2xl p-6 md:p-8 overflow-hidden shadow-xl">
          <ExpenseClaimsTab onDataLoaded={handleExpensesLoaded} />
        </motion.div>
      ) : (
        <motion.div variants={itemVariants} className="glass-card rounded-2xl border border-border/60 dark:border-white/10 bg-surface/90 dark:bg-slate-900/90 backdrop-blur-2xl overflow-hidden shadow-xl">
          <div className="p-6 md:p-8 border-b border-border/50 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-surface-variant/20 dark:bg-slate-950/20">
            <div>
              <h3 className="heading-2 text-xl font-black text-text-primary">
                {mainTab === 'slips' ? 'Employee Payslips Manager' : 'Salary Advance & EMI Requests'}
              </h3>
              <p className="text-xs text-text-secondary mt-1 font-medium">
                {mainTab === 'slips' 
                  ? 'Generate, approve, and track salary slips for individual workforce members'
                  : 'Manage employee salary advance applications, define EMI payback periods (2, 4, 6 months), and track repayment'}
              </p>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-grow sm:flex-grow-0 group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Search employees..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2.5 bg-surface-variant/60 dark:bg-white/[0.05] border border-border/50 dark:border-white/10 rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary/30 transition-all w-full sm:w-72 font-semibold text-text-primary placeholder:text-text-secondary"
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
                  <tr className="bg-surface-variant/40 dark:bg-slate-950/40 border-b border-border/50 dark:border-white/10">
                    <th className="px-6 py-4 text-[10.5px] font-black uppercase tracking-widest text-text-secondary">Employee Code</th>
                    <th className="px-6 py-4 text-[10.5px] font-black uppercase tracking-widest text-text-secondary">Employee Name</th>
                    <th className="px-6 py-4 text-[10.5px] font-black uppercase tracking-widest text-text-secondary">Designation & Dept</th>
                    <th className="px-6 py-4 text-[10.5px] font-black uppercase tracking-widest text-text-secondary">Net Salary</th>
                    <th className="px-6 py-4 text-[10.5px] font-black uppercase tracking-widest text-text-secondary">Status</th>
                    <th className="px-6 py-4 text-[10.5px] font-black uppercase tracking-widest text-text-secondary text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 dark:divide-white/10">
                  {paginatedSlips.map((slip) => (
                    <motion.tr 
                      key={slip.id}
                      variants={itemVariants}
                      className="hover:bg-surface-variant/30 dark:hover:bg-white/[0.02] transition-colors group cursor-pointer"
                    >
                      <td className="px-6 py-5">
                        <span className="font-mono text-xs font-black text-text-secondary bg-surface-variant/80 dark:bg-white/[0.06] px-3 py-1 rounded-lg border border-border/50 dark:border-white/10 shadow-sm group-hover:border-primary/40 transition-colors">
                          {slip.employeeCode}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-xs shrink-0 group-hover:scale-105 transition-transform">
                            {slip.name ? slip.name.charAt(0) : 'E'}
                          </div>
                          <div>
                            <span className="font-black text-text-primary tracking-tight group-hover:text-primary transition-colors block text-sm">{slip.name}</span>
                            <span className="text-[11px] font-medium text-text-secondary">{slip.office}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-text-primary">{slip.designation}</span>
                          <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mt-0.5">{slip.department}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-primary font-mono tracking-tight">₹{slip.netSalary.toLocaleString('en-IN')}</span>
                          <span className="text-[10px] font-medium text-text-secondary mt-0.5">Base: ₹{slip.baseSalary.toLocaleString('en-IN')}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider inline-flex items-center gap-2 border shadow-sm",
                          slip.status === 'Approved' 
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" 
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                        )}>
                          <span className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            slip.status === 'Approved' ? "bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" : "bg-amber-500"
                          )} />
                          {slip.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {slip.status === 'Pending Approval' ? (
                            <button 
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handleApproveSlip(slip.id); }}
                              className="px-4 py-2 bg-primary text-white hover:bg-primary/90 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-primary/20 active:scale-95"
                            >
                              Approve & Generate
                            </button>
                          ) : (
                            <button 
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setSelectedSlip(slip); setIsSlipModalOpen(true); }}
                              className="px-4 py-2 bg-surface-variant/80 hover:bg-surface-variant text-text-primary border border-border/60 dark:border-white/10 rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95"
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

              {/* Slips Pagination Footer */}
              <PaginationFooter
                currentPage={slipsPage}
                totalPages={slipsTotalPages}
                totalItems={filteredSlips.length}
                pageSize={slipsPageSize}
                onPageChange={setSlipsPage}
                onPageSizeChange={setSlipsPageSize}
                itemLabel="payslips"
              />
            </div>
          )
          ) : (
            <div className="overflow-x-auto">
              <div className="p-4 bg-surface-variant/30 dark:bg-slate-950/30 border-b border-border/50 dark:border-white/10 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-text-secondary uppercase tracking-wider mr-1">Filter:</span>
                  {(['ALL', 'PENDING', 'APPROVED', 'PAID_OFF', 'REJECTED'] as const).map(filter => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setAdvanceFilter(filter)}
                      className={cn(
                        "px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border",
                        advanceFilter === filter
                          ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                          : "bg-surface/60 text-text-secondary border-border/50 dark:border-white/10 hover:text-text-primary hover:bg-surface"
                      )}
                    >
                      {filter === 'PAID_OFF' ? 'Paid Off' : filter}
                    </button>
                  ))}
                </div>
                <div className="text-xs font-bold text-text-secondary">
                  Showing <span className="font-black text-text-primary font-mono">{filteredAdvances.length}</span> request(s)
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
                <>
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-variant/40 dark:bg-slate-950/40 border-b border-border/50 dark:border-white/10">
                        <th className="px-6 py-4 text-[10.5px] font-black uppercase tracking-widest text-text-secondary">Employee</th>
                        <th className="px-6 py-4 text-[10.5px] font-black uppercase tracking-widest text-text-secondary">Advance Amount</th>
                        <th className="px-6 py-4 text-[10.5px] font-black uppercase tracking-widest text-text-secondary">EMI Plan</th>
                        <th className="px-6 py-4 text-[10.5px] font-black uppercase tracking-widest text-text-secondary">Paid / Remaining</th>
                        <th className="px-6 py-4 text-[10.5px] font-black uppercase tracking-widest text-text-secondary">EMI Progress</th>
                        <th className="px-6 py-4 text-[10.5px] font-black uppercase tracking-widest text-text-secondary">Status</th>
                        <th className="px-6 py-4 text-[10.5px] font-black uppercase tracking-widest text-text-secondary text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 dark:divide-white/10">
                      {paginatedAdvances.map((adv) => (
                        <tr key={adv.id} className="hover:bg-surface-variant/30 dark:hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-600 dark:text-teal-400 font-black text-xs shrink-0">
                                {adv.employeeName ? adv.employeeName.charAt(0) : 'A'}
                              </div>
                              <div>
                                <span className="font-black text-text-primary block text-sm">{adv.employeeName}</span>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="font-mono text-[10px] font-black text-text-secondary bg-surface-variant/80 dark:bg-white/[0.06] px-2 py-0.5 rounded border border-border/50 dark:border-white/10">{adv.employeeCode}</span>
                                  <span className="text-[11px] font-medium text-text-secondary">{adv.designation}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
                            ₹{adv.amount.toLocaleString('en-IN')}
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex flex-col">
                              <span className="text-xs font-black text-text-primary font-mono">₹{adv.monthlyEmi.toLocaleString('en-IN')} / mo</span>
                              <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mt-0.5">{adv.months} EMI Installments</span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex flex-col font-mono text-xs">
                              <span className="font-bold text-emerald-600 dark:text-emerald-400">Paid: ₹{adv.paidAmount.toLocaleString('en-IN')}</span>
                              <span className="font-bold text-amber-600 dark:text-amber-400">Rem: ₹{adv.remainingAmount.toLocaleString('en-IN')}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="w-36">
                              <div className="flex justify-between text-[10px] font-black text-text-secondary mb-1 uppercase tracking-wider">
                                <span>{adv.paidEmis} / {adv.months} EMIs</span>
                                <span className="font-mono">{Math.round((adv.paidEmis / (adv.months || 1)) * 100)}%</span>
                              </div>
                              <div className="h-2.5 w-full bg-surface-variant dark:bg-white/10 rounded-full overflow-hidden p-0.5 border border-border/40 dark:border-white/10">
                                <div
                                  className="h-full bg-gradient-to-r from-teal-400 to-emerald-500 rounded-full transition-all shadow-sm"
                                  style={{ width: `${Math.min(100, (adv.paidEmis / (adv.months || 1)) * 100)}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <span className={cn(
                              "px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider inline-flex items-center gap-1.5 border shadow-sm",
                              adv.status === 'APPROVED' && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
                              adv.status === 'PENDING' && "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 animate-pulse",
                              adv.status === 'PAID_OFF' && "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
                              adv.status === 'REJECTED' && "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
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
                                className="px-4 py-2 bg-primary text-white hover:bg-primary/90 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-primary/20 active:scale-95"
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
                                className="px-4 py-2 bg-surface-variant/80 hover:bg-surface-variant text-text-primary rounded-xl text-xs font-black uppercase tracking-wider border border-border/60 dark:border-white/10 transition-all active:scale-95"
                              >
                                View Details
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Advances Pagination Footer */}
                  <PaginationFooter
                    currentPage={advancesPage}
                    totalPages={advancesTotalPages}
                    totalItems={filteredAdvances.length}
                    pageSize={advancesPageSize}
                    onPageChange={setAdvancesPage}
                    onPageSizeChange={setAdvancesPageSize}
                    itemLabel="advance requests"
                  />
                </>
              )}
            </div>
          )}
        </motion.div>
      )}

      {/* View Payslip Modal */}
      <Modal
        isOpen={isSlipModalOpen}
        onClose={() => setIsSlipModalOpen(false)}
        title="Employee Salary Slip"
        maxWidth="max-w-5xl"
      >
        {selectedSlip && (
          <div className="space-y-4 p-2 text-slate-100 print:text-black" id="salary-slip-print">
            {/* Month selector (hidden on print) */}
            <div className="flex items-center gap-4 print:hidden pb-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Select Salary Month</label>
              <input
                type="month"
                value={slipMonth}
                onChange={e => setSlipMonth(e.target.value)}
                onClick={(e) => {
                  try {
                    e.currentTarget.showPicker();
                  } catch (err) {}
                }}
                className="px-4 py-2 bg-slate-800/80 border border-white/10 rounded-xl text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all cursor-pointer"
              />
            </div>

            <SalarySlip
              selectedSlip={selectedSlip}
              slipAttendance={slipAttendance}
              slipData={slipData}
              monthLabel={monthLabel}
              monthShort={monthShort}
              onPrint={handlePrintSlip}
            />
          </div>
        )}
      </Modal>



      {/* Process Payroll Modal */}
      <Modal 
        isOpen={isProcessModalOpen} 
        onClose={() => setIsProcessModalOpen(false)}
        title="Expenses Report & Attendance Management"
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
