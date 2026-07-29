import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  Calendar,
  Filter,
  Download,
  Award,
  Building2,
  User as UserIcon,
  X,
  RefreshCw,
  Zap,
  Sparkles,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import { cn } from '@/utils/cn';
import { 
  getCommissionDashboard, 
  getCommissionTransactions,
  type CommissionDashboardStats,
  type CommissionTransaction 
} from '@/services/commissionService';
import { fetchStores } from '@/services/storeService';
import { fetchHopkidEmployeeList } from '@/services/employeeService';
import { toast } from 'sonner';
import SuperAdminHeader from '@/components/SuperAdminHeader';

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

export default function CommissionDashboard() {
  const [stats, setStats] = useState<CommissionDashboardStats | null>(null);
  const [transactions, setTransactions] = useState<CommissionTransaction[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStore, setSelectedStore] = useState<string>('');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [dateRange, setDateRange] = useState('month');

  // Filter stores
  const filteredStores = stores;

  // Filter employees based on selected store's name
  const selectedStoreName = stores.find(s => s.id.toString() === selectedStore)?.name;

  const filteredEmployees = selectedStore && selectedStoreName
    ? employees.filter(emp => emp.branchName === selectedStoreName)
    : employees;

  const handleStoreChange = (storeId: string) => {
    setSelectedStore(storeId);
    setSelectedEmployee('');
  };

  useEffect(() => {
    loadDashboardData();
  }, [selectedStore, selectedEmployee, dateRange]);

  useEffect(() => {
    loadDropdownData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const params: any = {};
      if (selectedStore) params.storeId = selectedStore;
      if (selectedEmployee) params.employeeId = selectedEmployee;
      
      if (dateRange === 'today') {
        const today = new Date();
        params.startDate = today.toISOString().split('T')[0];
        params.endDate = today.toISOString().split('T')[0];
      } else if (dateRange === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        params.startDate = weekAgo.toISOString().split('T')[0];
        params.endDate = new Date().toISOString().split('T')[0];
      } else if (dateRange === 'month') {
        const monthStart = new Date();
        monthStart.setDate(1);
        params.startDate = monthStart.toISOString().split('T')[0];
        params.endDate = new Date().toISOString().split('T')[0];
      }

      const [statsRes, transactionsRes] = await Promise.all([
        getCommissionDashboard(params),
        getCommissionTransactions(params),
      ]);

      setStats(statsRes.stats);
      setTransactions(transactionsRes.transactions);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load commission data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadDropdownData = async () => {
    try {
      const [storesRes, employeesRes] = await Promise.all([
        fetchStores().catch((err) => {
          console.error('Failed to load stores:', err);
          return [];
        }),
        fetchHopkidEmployeeList().catch((err) => {
          console.error('Failed to load Hopkid employees:', err);
          return null;
        })
      ]);
      setStores(Array.isArray(storesRes) ? storesRes : []);
      setEmployees(employeesRes?.data || []);
    } catch (error) {
      console.error('Failed to load dropdown data:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
      currencyDisplay: 'symbol',
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const isApproved = status === 'APPROVED';
    const isPending = status === 'PENDING';
    const isPaid = status === 'PAID';
    const isRejected = status === 'REJECTED';

    return (
      <span className={cn(
        "px-3 py-1 rounded-full text-[10.5px] font-black uppercase tracking-wider inline-flex items-center gap-1.5 border shadow-sm",
        isPaid && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
        isApproved && "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
        isPending && "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 animate-pulse",
        isRejected && "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
      )}>
        <span className={cn(
          "w-1.5 h-1.5 rounded-full",
          isPaid && "bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]",
          isApproved && "bg-blue-500",
          isPending && "bg-amber-500 animate-ping",
          isRejected && "bg-rose-500"
        )} />
        {status}
      </span>
    );
  };

  const handleExportDashboard = () => {
    if (!transactions || transactions.length === 0) {
      toast.error('No transactions available to export');
      return;
    }

    const headers = ['Invoice / Bill No', 'Employee Name', 'Store', 'Sale Amount (INR)', 'Commission Amount (INR)', 'Status', 'Date'];
    const rows = transactions.map(t => [
      t.invoiceNumber || t.billId || '',
      `${t.employee?.firstName || ''} ${t.employee?.lastName || ''}`.trim(),
      t.store?.name || '',
      t.saleAmount || 0,
      t.commissionAmount || 0,
      t.status || '',
      t.createdAt ? new Date(t.createdAt).toLocaleDateString('en-IN') : ''
    ]);

    const csvRows = [
      headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(','),
      ...rows.map(row => row.map(val => `"${String(val ?? '').replace(/"/g, '""')}"`).join(','))
    ];
    
    const blob = new Blob(['\ufeff' + csvRows.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `commission_dashboard_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('Commission report exported successfully');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center gap-3 text-text-secondary font-medium">
          <RefreshCw className="h-5 w-5 animate-spin text-primary" />
          <span>Loading commission intelligence dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-10 text-text-primary animate-fadeIn"
    >
      {/* Header Banner */}
      <SuperAdminHeader
        title="Commission Intelligence"
        subtitle="Track workforce sales performance, review store commission payouts, and monitor real-time distribution trends."
        badgeText="Sales Remuneration & Payouts"
        badgeIcon={Sparkles}
        stats={[
          { label: 'Today\'s Commission', value: formatCurrency(stats?.today.commission || 0), icon: DollarSign, trend: `${stats?.today.transactions || 0} Txns`, trendUp: true },
          { label: 'Monthly Commission', value: formatCurrency(stats?.month.commission || 0), icon: TrendingUp, badge: 'Verified' },
          { label: 'Pending Approval', value: formatCurrency(stats?.pending.commission || 0), icon: Clock, trend: `${stats?.pending.transactions || 0} Txns`, trendUp: false },
          { label: 'Paid Commission', value: formatCurrency(stats?.paid.commission || 0), icon: CheckCircle, badge: 'Disbursed' }
        ]}
      >
        <button 
          onClick={handleExportDashboard}
          className="btn-primary group relative overflow-hidden shadow-xl shadow-primary/25 hover:shadow-primary/40 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider justify-center flex items-center gap-2.5 transition-all duration-300 active:scale-95"
        >
          <span className="p-1 rounded-lg bg-white/20 group-hover:rotate-12 transition-transform">
            <Download size={14} />
          </span>
          <span>Export CSV Report</span>
        </button>
      </SuperAdminHeader>

      {/* Filter Control Toolbar */}
      <motion.div
        variants={itemVariants}
        className="glass-card p-5 rounded-2xl border border-border/60 dark:border-white/10 shadow-lg backdrop-blur-2xl bg-surface/90 dark:bg-slate-900/90"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Filter className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-sm font-black text-text-primary uppercase tracking-tight">Analytics Filters</h4>
              <p className="text-[11px] font-medium text-text-secondary">Refine data by store location, sales representative, or timeframe</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Select value={selectedStore} onValueChange={handleStoreChange}>
              <SelectTrigger className="w-48 bg-surface-variant/60 dark:bg-white/[0.05] border border-border/50 dark:border-white/10 rounded-xl text-xs font-bold outline-none">
                <SelectValue placeholder="All Stores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Stores</SelectItem>
                {filteredStores.map((store) => (
                  <SelectItem key={store.id} value={store.id.toString()}>
                    {store.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedEmployee} onValueChange={setSelectedEmployee} disabled={!!selectedStore && filteredEmployees.length === 0}>
              <SelectTrigger className="w-52 bg-surface-variant/60 dark:bg-white/[0.05] border border-border/50 dark:border-white/10 rounded-xl text-xs font-bold outline-none">
                <SelectValue placeholder={!!selectedStore && filteredEmployees.length === 0 ? "No employees" : "All Representatives"} />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                <SelectItem value="">All Representatives</SelectItem>
                {filteredEmployees.map((emp) => (
                  <SelectItem key={emp.employeeID} value={emp.employeeCode} className="py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-black">
                        {emp.employeeName?.[0] || 'E'}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-text-primary">
                          {emp.employeeName}
                        </span>
                        <span className="text-[10px] text-text-secondary font-mono">
                          {emp.employeeCode}
                        </span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-1 p-1 bg-surface-variant/60 dark:bg-white/[0.05] rounded-xl border border-border/50 dark:border-white/10">
              {[
                { key: 'today', label: 'Today' },
                { key: 'week', label: 'Week' },
                { key: 'month', label: 'Month' }
              ].map((range) => (
                <button
                  key={range.key}
                  onClick={() => setDateRange(range.key)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-black rounded-lg transition-all uppercase tracking-wider",
                    dateRange === range.key
                      ? "bg-primary text-white shadow-md shadow-primary/25"
                      : "text-text-secondary hover:text-text-primary hover:bg-surface/50"
                  )}
                >
                  {range.label}
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedStore('');
                setSelectedEmployee('');
                setDateRange('month');
              }}
              className="px-3.5 py-2 rounded-xl border border-border/50 dark:border-white/10 text-xs font-bold text-text-secondary hover:text-text-primary"
            >
              <X className="h-3.5 w-3.5 mr-1" />
              Reset
            </Button>
          </div>
        </div>

        {/* Active Filter Chips */}
        {(selectedStore || selectedEmployee || dateRange !== 'month') && (
          <div className="mt-4 pt-3 border-t border-border/40 dark:border-white/10 flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-text-secondary mr-1">Active:</span>
            {selectedStore && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-xs font-bold text-primary">
                <Building2 className="h-3 w-3" />
                {stores.find(s => s.id.toString() === selectedStore)?.name}
                <button onClick={() => setSelectedStore('')} className="hover:text-primary/70">
                  <X className="h-3 w-3 ml-0.5" />
                </button>
              </span>
            )}
            {selectedEmployee && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-xs font-bold text-primary">
                <UserIcon className="h-3 w-3" />
                {employees.find(e => e.employeeCode === selectedEmployee)?.employeeName || selectedEmployee}
                <button onClick={() => setSelectedEmployee('')} className="hover:text-primary/70">
                  <X className="h-3 w-3 ml-0.5" />
                </button>
              </span>
            )}
            {dateRange !== 'month' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-xs font-bold text-primary">
                <Calendar className="h-3 w-3" />
                {dateRange === 'today' ? 'Today' : 'This Week'}
                <button onClick={() => setDateRange('month')} className="hover:text-primary/70">
                  <X className="h-3 w-3 ml-0.5" />
                </button>
              </span>
            )}
          </div>
        )}
      </motion.div>

      {/* Grid: Top Performers Leaderboard & Recent Transactions */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Top Performers Leaderboard Card */}
        <motion.div
          variants={itemVariants}
          className="glass-card rounded-2xl border border-border/60 dark:border-white/10 bg-surface/90 dark:bg-slate-900/90 backdrop-blur-2xl p-6 shadow-xl flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/50 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-500/15 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-500/20 shadow-sm">
                  <Award size={22} />
                </div>
                <div>
                  <h3 className="heading-2 text-lg font-black text-text-primary">Top Performers</h3>
                  <p className="text-[11px] font-medium text-text-secondary mt-0.5">Leading sales representatives this cycle</p>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full text-[10px] font-black uppercase tracking-wider border border-amber-500/20">
                Ranked
              </span>
            </div>

            <div className="space-y-3.5">
              {stats?.topPerformers.map((performer, index) => (
                <div 
                  key={index}
                  className="p-4 rounded-xl bg-surface-variant/40 dark:bg-slate-950/40 border border-border/50 dark:border-white/10 flex items-center justify-between group hover:border-primary/40 transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 shadow-sm border",
                      index === 0 && "bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 border-amber-300",
                      index === 1 && "bg-gradient-to-br from-slate-300 to-slate-400 text-slate-950 border-slate-200",
                      index === 2 && "bg-gradient-to-br from-amber-700 to-orange-600 text-white border-amber-600",
                      index > 2 && "bg-surface-variant dark:bg-white/10 text-text-secondary border-border/40"
                    )}>
                      #{index + 1}
                    </div>
                    <div>
                      <span className="font-black text-text-primary block text-sm group-hover:text-primary transition-colors">
                        {performer.employee?.firstName} {performer.employee?.lastName}
                      </span>
                      <span className="font-mono text-[10px] font-bold text-text-secondary bg-surface-variant/80 dark:bg-white/[0.06] px-2 py-0.5 rounded border border-border/50 dark:border-white/10">
                        {performer.employee?.employeeCode}
                      </span>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <p className="text-sm font-black text-primary">
                      {formatCurrency(performer.totalCommission)}
                    </p>
                    <p className="text-[10px] font-semibold text-text-secondary">
                      Sales: {formatCurrency(performer.totalSales)}
                    </p>
                  </div>
                </div>
              ))}

              {(!stats?.topPerformers || stats.topPerformers.length === 0) && (
                <div className="text-center text-text-secondary py-12 font-medium text-xs">
                  No top performer data recorded for this selection.
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-border/40 dark:border-white/10 flex items-center justify-between text-[11px] font-bold text-text-secondary">
            <span>Commission Tier Standard</span>
            <span className="text-primary font-black font-mono">Auto Calculated</span>
          </div>
        </motion.div>

        {/* Recent Transactions Table */}
        <motion.div
          variants={itemVariants}
          className="xl:col-span-2 glass-card rounded-2xl border border-border/60 dark:border-white/10 bg-surface/90 dark:bg-slate-900/90 backdrop-blur-2xl overflow-hidden shadow-xl"
        >
          <div className="p-6 border-b border-border/50 dark:border-white/10 flex items-center justify-between bg-surface-variant/20 dark:bg-slate-950/20">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 text-primary rounded-xl border border-primary/20 shadow-sm">
                <Calendar size={20} />
              </div>
              <div>
                <h3 className="heading-2 text-lg font-black text-text-primary">Recent Transactions</h3>
                <p className="text-[11px] font-medium text-text-secondary mt-0.5">Live store sales and earned commissions feed</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-text-secondary bg-surface-variant/60 dark:bg-white/[0.05] px-3 py-1 rounded-xl border border-border/50 dark:border-white/10">
              {transactions.length} Records
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-variant/40 dark:bg-slate-950/40 border-b border-border/50 dark:border-white/10">
                  <th className="px-6 py-4 text-[10.5px] font-black uppercase tracking-widest text-text-secondary">Invoice / Bill</th>
                  <th className="px-6 py-4 text-[10.5px] font-black uppercase tracking-widest text-text-secondary">Representative</th>
                  <th className="px-6 py-4 text-[10.5px] font-black uppercase tracking-widest text-text-secondary">Store</th>
                  <th className="px-6 py-4 text-[10.5px] font-black uppercase tracking-widest text-text-secondary text-right">Sale Amount</th>
                  <th className="px-6 py-4 text-[10.5px] font-black uppercase tracking-widest text-text-secondary text-right">Commission</th>
                  <th className="px-6 py-4 text-[10.5px] font-black uppercase tracking-widest text-text-secondary">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 dark:divide-white/10">
                {transactions.slice(0, 10).map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-surface-variant/30 dark:hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4 font-mono text-xs font-bold text-text-primary">
                      <span className="bg-surface-variant/80 dark:bg-white/[0.06] px-2.5 py-1 rounded-lg border border-border/50 dark:border-white/10">
                        {transaction.invoiceNumber || transaction.billId || `TXN-${transaction.id}`}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-xs shrink-0">
                          {transaction.employee?.firstName ? transaction.employee.firstName.charAt(0) : 'E'}
                        </div>
                        <span className="font-bold text-text-primary text-xs group-hover:text-primary transition-colors">
                          {transaction.employee?.firstName} {transaction.employee?.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-text-secondary">
                      {transaction.store?.name || 'Main Branch'}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-xs font-black text-text-primary">
                      {formatCurrency(transaction.saleAmount)}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-xs font-black text-primary">
                      {formatCurrency(transaction.commissionAmount)}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(transaction.status)}
                    </td>
                  </tr>
                ))}

                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center text-text-secondary py-12 font-medium text-xs">
                      No recent commission transactions found for the active filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
