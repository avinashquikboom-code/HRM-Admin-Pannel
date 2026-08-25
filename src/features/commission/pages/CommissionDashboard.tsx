import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  ShieldCheck,
  Search
} from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import { cn } from '@/utils/cn';
import { 
  getCommissionDashboard, 
  getCommissionTransactions,
  syncHopkidSalesNow,
  type CommissionDashboardStats,
  type CommissionTransaction 
} from '@/services/commissionService';
import { fetchStores } from '@/services/storeService';
import { toast } from 'sonner';
import SuperAdminHeader from '@/components/SuperAdminHeader';
import Modal from '@/components/Modal';

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
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStore, setSelectedStore] = useState<string>('');
  const [dateRange, setDateRange] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Derived filtered lists
  const queryLower = searchQuery.trim().toLowerCase();

  const filteredTransactions = transactions.filter((t) => {
    if (!queryLower) return true;
    const emp = t.employee;
    const name = emp ? `${emp.firstName || ''} ${emp.lastName || ''}`.toLowerCase() : '';
    const code = emp ? String(emp.employeeCode || '').toLowerCase() : '';
    const storeName = String(t.store?.name || emp?.store?.name || '').toLowerCase();
    const inv = (t.invoiceNumber || t.billId || '').toLowerCase();
    return (
      name.includes(queryLower) ||
      code.includes(queryLower) ||
      storeName.includes(queryLower) ||
      inv.includes(queryLower)
    );
  });

  const filteredTopPerformers = (stats?.topPerformers || []).filter((p) => {
    if (!queryLower) return true;
    const emp = p.employee;
    const name = emp ? `${emp.firstName || ''} ${emp.lastName || ''}`.toLowerCase() : '';
    const code = emp ? String(emp.employeeCode || '').toLowerCase() : '';
    return name.includes(queryLower) || code.includes(queryLower);
  });

  // Pagination State for Recent Transactions
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const totalPages = Math.ceil(filteredTransactions.length / pageSize) || 1;
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStore, dateRange, pageSize]);

  // Sync sales state
  const [isSyncing, setIsSyncing] = useState(false);

  // Employee Monthly Commission Modal state
  const [selectedEmpForCommission, setSelectedEmpForCommission] = useState<any | null>(null);
  const [empCommissionModalOpen, setEmpCommissionModalOpen] = useState(false);
  const [empCommissionLoading, setEmpCommissionLoading] = useState(false);
  const [empCommissionStats, setEmpCommissionStats] = useState<any | null>(null);
  const [empCommissionTxns, setEmpCommissionTxns] = useState<any[]>([]);

  const handleEmployeeClick = async (emp: any) => {
    if (!emp) return;
    setSelectedEmpForCommission(emp);
    setEmpCommissionModalOpen(true);
    setEmpCommissionLoading(true);
    setEmpCommissionStats(null);
    setEmpCommissionTxns([]);

    try {
      const empId = emp.id || emp.employeeCode || emp.employeeID;
      const [statsRes, txnsRes] = await Promise.allSettled([
        getCommissionDashboard({ employeeId: String(empId) }),
        getCommissionTransactions({ employeeId: String(empId) }),
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value?.stats) {
        setEmpCommissionStats(statsRes.value.stats);
      }
      if (txnsRes.status === 'fulfilled' && txnsRes.value?.transactions) {
        setEmpCommissionTxns(txnsRes.value.transactions);
      }
    } catch (err) {
      console.error('Failed to load employee commission data:', err);
    } finally {
      setEmpCommissionLoading(false);
    }
  };

  const handleSyncSales = async () => {
    setIsSyncing(true);
    try {
      const res = await syncHopkidSalesNow();
      toast.success(`✅ ${res.message}`);
      // Reload dashboard with fresh data
      loadDashboardData();
    } catch (err: any) {
      toast.error(err?.message || 'HopKid sales sync failed.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Filter stores
  const filteredStores = stores;

  const handleStoreChange = (storeId: string) => {
    setSelectedStore(storeId);
  };

  useEffect(() => {
    loadDashboardData();
    // Auto-refresh every 15s to capture incoming webhooks real-time
    const interval = setInterval(() => {
      loadDashboardData();
    }, 15000);
    return () => clearInterval(interval);
  }, [selectedStore, dateRange]);

  useEffect(() => {
    loadDropdownData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const params: any = { _t: Date.now() };
      if (selectedStore && selectedStore !== 'all') params.storeId = selectedStore;
      
      const now = new Date();
      if (dateRange === 'today') {
        const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        params.startDate = dateStr;
        params.endDate = dateStr;
      } else if (dateRange === 'week') {
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        params.startDate = `${weekAgo.getFullYear()}-${String(weekAgo.getMonth() + 1).padStart(2, '0')}-${String(weekAgo.getDate()).padStart(2, '0')}`;
        params.endDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      } else if (dateRange === 'month') {
        const year = now.getFullYear();
        const month = now.getMonth();
        const monthEnd = new Date(year, month + 1, 0);
        params.startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
        params.endDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(monthEnd.getDate()).padStart(2, '0')}`;
      }

      const [statsRes, transactionsRes] = await Promise.allSettled([
        getCommissionDashboard(params),
        getCommissionTransactions(params),
      ]);

      const statsData = statsRes.status === 'fulfilled' ? statsRes.value.stats : null;
      const txnsData = transactionsRes.status === 'fulfilled' ? transactionsRes.value.transactions : [];

      setStats(statsData);
      setTransactions(txnsData || []);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDropdownData = async () => {
    try {
      const storesRes = await fetchStores().catch((err) => {
        console.error('Failed to load stores:', err);
        return [];
      });
      const list = Array.isArray(storesRes) ? storesRes : [];
      setStores(list);
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
        <button
          onClick={async () => {
            await loadDashboardData();
            toast.success('Commission data refreshed');
          }}
          disabled={isLoading}
          className="btn-secondary group relative overflow-hidden px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider justify-center flex items-center gap-2.5 transition-all duration-300 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed border border-border/60 cursor-pointer"
        >
          <span className="p-1 rounded-lg bg-muted/60 group-hover:rotate-180 transition-transform duration-500">
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          </span>
          <span>Refresh Data</span>
        </button>
        <button
          onClick={handleSyncSales}
          disabled={isSyncing}
          className="btn-secondary group relative overflow-hidden px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider justify-center flex items-center gap-2.5 transition-all duration-300 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed border border-border/60 cursor-pointer"
        >
          <span className="p-1 rounded-lg bg-muted/60 group-hover:rotate-180 transition-transform duration-500">
            <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
          </span>
          <span>{isSyncing ? 'Syncing...' : 'Sync HopKid Sales'}</span>
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
            <div className="relative min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-secondary" />
              <Input
                type="text"
                placeholder="Search employee, bill, store..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-8 bg-surface-variant/60 dark:bg-white/[0.05] border border-border/50 dark:border-white/10 rounded-xl text-xs font-bold h-9 outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            <Select value={selectedStore || 'all'} onValueChange={(val) => setSelectedStore(val === 'all' ? '' : val)}>
              <SelectTrigger className="w-52 bg-surface-variant/60 dark:bg-white/[0.05] border border-border/50 dark:border-white/10 rounded-xl text-xs font-bold outline-none h-9">
                <SelectValue placeholder="All Stores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stores</SelectItem>
                {filteredStores.map((store) => (
                  <SelectItem key={store.id} value={store.id.toString()}>
                    {store.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-1 p-1 bg-surface-variant/60 dark:bg-white/[0.05] rounded-xl border border-border/50 dark:border-white/10">
              {[
                { key: 'all', label: 'All' },
                { key: 'today', label: 'Today' },
                { key: 'week', label: 'Week' },
                { key: 'month', label: 'Month' }
              ].map((range) => (
                <button
                  key={range.key}
                  onClick={() => setDateRange(range.key)}
                  className={cn(
                    "px-3 py-1 text-xs font-black rounded-lg transition-all uppercase tracking-wider",
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
                setDateRange('all');
                setSearchQuery('');
              }}
              className="px-3.5 py-1.5 h-9 rounded-xl border border-border/50 dark:border-white/10 text-xs font-bold text-text-secondary hover:text-text-primary"
            >
              <X className="h-3.5 w-3.5 mr-1" />
              Reset
            </Button>
          </div>
        </div>

        {/* Active Filter Chips */}
        {(selectedStore || dateRange !== 'month') && (
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
              {filteredTopPerformers.map((performer, index) => (
                <div 
                  key={index}
                  onClick={() => handleEmployeeClick(performer.employee)}
                  className="p-4 rounded-xl bg-surface-variant/40 dark:bg-slate-950/40 border border-border/50 dark:border-white/10 flex items-center justify-between group hover:border-primary/40 hover:bg-surface-variant/80 transition-all duration-300 cursor-pointer"
                  title="Click to view employee monthly commission details"
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

              {filteredTopPerformers.length === 0 && (
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
              {filteredTransactions.length} {searchQuery ? `of ${transactions.length}` : ''} Records
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
                {paginatedTransactions.map((transaction) => (
                  <tr 
                    key={transaction.id} 
                    onClick={() => handleEmployeeClick(transaction.employee)}
                    className="hover:bg-surface-variant/40 dark:hover:bg-white/[0.04] transition-colors group cursor-pointer"
                    title="Click to view employee monthly commission details"
                  >
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
                    <td className="px-6 py-4 text-right font-mono text-xs">
                      <span className="font-black text-text-primary block">
                        {formatCurrency(transaction.newAmount || transaction.saleAmount)}
                      </span>
                      {Boolean(transaction.oldAmount && transaction.oldAmount > 0 && transaction.oldAmount !== (transaction.newAmount || transaction.saleAmount)) && (
                        <span className="text-[10px] text-muted-foreground block font-medium">
                          Old: {formatCurrency(transaction.oldAmount || 0)}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-xs">
                      <span className="font-black text-primary block">
                        {formatCurrency(transaction.newCommission !== undefined && transaction.newCommission !== null ? transaction.newCommission : transaction.commissionAmount)}
                      </span>
                      {Boolean(transaction.oldCommission && transaction.oldCommission > 0 && transaction.oldCommission !== (transaction.newCommission || transaction.commissionAmount)) && (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-bold">
                          Old: {formatCurrency(transaction.oldCommission || 0)} ({transaction.commissionDifference && transaction.commissionDifference >= 0 ? '+' : ''}{formatCurrency(transaction.commissionDifference || 0)})
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(transaction.status)}
                    </td>
                  </tr>
                ))}

                {filteredTransactions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center text-text-secondary py-12 font-medium text-xs">
                      No recent commission transactions found for the active filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Bar */}
          {filteredTransactions.length > 0 && (
            <div className="px-6 py-4 border-t border-border/50 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface-variant/20 dark:bg-slate-950/20 text-xs text-text-secondary font-medium">
              <div className="flex items-center gap-2">
                <span>Showing</span>
                <span className="font-bold text-text-primary">
                  {Math.min((currentPage - 1) * pageSize + 1, filteredTransactions.length)}
                </span>
                <span>to</span>
                <span className="font-bold text-text-primary">
                  {Math.min(currentPage * pageSize, filteredTransactions.length)}
                </span>
                <span>of</span>
                <span className="font-bold text-text-primary">{filteredTransactions.length}</span>
                <span>entries</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg border border-border/60 dark:border-white/10 bg-surface dark:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-variant transition-colors font-bold"
                >
                  Previous
                </button>
                <span className="px-2 font-mono font-bold text-text-primary">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg border border-border/60 dark:border-white/10 bg-surface dark:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-variant transition-colors font-bold"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Employee Monthly Commission Intelligence Modal */}
      <Modal
        isOpen={empCommissionModalOpen}
        onClose={() => setEmpCommissionModalOpen(false)}
        title="Employee Monthly Commission Intelligence"
        maxWidth="max-w-4xl"
      >
        {selectedEmpForCommission && (
          <div className="p-6 space-y-6">
            {/* Employee Profile Header */}
            <div className="flex items-center justify-between p-4 bg-surface-variant/40 dark:bg-slate-900/60 border border-border/50 dark:border-white/10 rounded-2xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/30 flex items-center justify-center font-black text-primary text-lg shadow-sm">
                  {selectedEmpForCommission.firstName?.[0] || 'E'}
                </div>
                <div>
                  <h3 className="text-lg font-black text-text-primary">
                    {selectedEmpForCommission.firstName} {selectedEmpForCommission.lastName}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-xs font-bold text-text-secondary bg-surface-variant/80 dark:bg-white/[0.06] px-2.5 py-0.5 rounded border border-border/50 dark:border-white/10">
                      {selectedEmpForCommission.employeeCode || `ID: ${selectedEmpForCommission.id}`}
                    </span>
                    <span className="text-xs font-semibold text-text-secondary">
                      {selectedEmpForCommission.store?.name || selectedEmpForCommission.designation || 'Sales Staff'}
                    </span>
                  </div>
                </div>
              </div>
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-black uppercase tracking-wider border border-primary/20">
                Monthly Breakdown
              </span>
            </div>

            {/* Monthly Stats Summary */}
            {empCommissionLoading ? (
              <div className="py-12 text-center text-xs font-bold text-text-secondary flex items-center justify-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin text-primary" />
                <span>Fetching monthly commission statistics...</span>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-surface-variant/30 dark:bg-slate-950/30 border border-border/50 dark:border-white/10 rounded-xl">
                    <span className="text-[10px] font-black uppercase text-text-secondary">Monthly Commission</span>
                    <p className="text-lg font-black text-primary font-mono mt-1">
                      {formatCurrency(empCommissionStats?.month?.commission || 0)}
                    </p>
                    <span className="text-[9px] font-bold text-text-secondary">Current Month Earned</span>
                  </div>
                  <div className="p-4 bg-surface-variant/30 dark:bg-slate-950/30 border border-border/50 dark:border-white/10 rounded-xl">
                    <span className="text-[10px] font-black uppercase text-text-secondary">Monthly Sales</span>
                    <p className="text-lg font-black text-text-primary font-mono mt-1">
                      {formatCurrency(empCommissionStats?.month?.sales || 0)}
                    </p>
                    <span className="text-[9px] font-bold text-text-secondary">{empCommissionStats?.month?.transactions || 0} Total Sales</span>
                  </div>
                  <div className="p-4 bg-surface-variant/30 dark:bg-slate-950/30 border border-border/50 dark:border-white/10 rounded-xl">
                    <span className="text-[10px] font-black uppercase text-text-secondary">Pending Payout</span>
                    <p className="text-lg font-black text-amber-500 font-mono mt-1">
                      {formatCurrency(empCommissionStats?.pending?.commission || 0)}
                    </p>
                    <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400">Awaiting Settlement</span>
                  </div>
                  <div className="p-4 bg-surface-variant/30 dark:bg-slate-950/30 border border-border/50 dark:border-white/10 rounded-xl">
                    <span className="text-[10px] font-black uppercase text-text-secondary">Disbursed Paid</span>
                    <p className="text-lg font-black text-emerald-500 font-mono mt-1">
                      {formatCurrency(empCommissionStats?.paid?.commission || 0)}
                    </p>
                    <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400">Settled to Salary</span>
                  </div>
                </div>

                {/* Monthly Transactions List */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-black text-text-primary uppercase tracking-wider">
                      Monthly Commission Transactions ({empCommissionTxns.length})
                    </h4>
                    <span className="text-[11px] font-bold text-text-secondary font-mono">
                      Filtered by logged-in period
                    </span>
                  </div>
                  <div className="max-h-72 overflow-y-auto rounded-xl border border-border/50 dark:border-white/10">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-surface-variant/40 dark:bg-slate-950/40 border-b border-border/50 dark:border-white/10 sticky top-0 backdrop-blur-md">
                          <th className="px-4 py-3 text-[10px] font-black uppercase text-text-secondary">Bill / Invoice</th>
                          <th className="px-4 py-3 text-[10px] font-black uppercase text-text-secondary">Date</th>
                          <th className="px-4 py-3 text-[10px] font-black uppercase text-text-secondary text-right">Sale Amount</th>
                          <th className="px-4 py-3 text-[10px] font-black uppercase text-text-secondary text-right">Commission</th>
                          <th className="px-4 py-3 text-[10px] font-black uppercase text-text-secondary">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40 dark:divide-white/10">
                        {empCommissionTxns.map((t) => (
                          <tr key={t.id} className="hover:bg-surface-variant/30 dark:hover:bg-white/[0.02]">
                            <td className="px-4 py-3 font-mono text-xs font-bold text-text-primary">
                              {t.invoiceNumber || t.billId || `TXN-${t.id}`}
                            </td>
                            <td className="px-4 py-3 text-xs text-text-secondary">
                              {t.createdAt ? new Date(t.createdAt).toLocaleDateString('en-IN') : '-'}
                            </td>
                            <td className="px-4 py-3 text-right font-mono text-xs">
                              <span className="font-bold text-text-primary block">
                                {formatCurrency(t.newAmount || t.saleAmount)}
                              </span>
                              {Boolean(t.oldAmount && t.oldAmount > 0 && t.oldAmount !== (t.newAmount || t.saleAmount)) && (
                                <span className="text-[10px] text-muted-foreground block">
                                  Old: {formatCurrency(t.oldAmount || 0)}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right font-mono text-xs">
                              <span className="font-black text-primary block">
                                {formatCurrency(t.newCommission !== undefined && t.newCommission !== null ? t.newCommission : t.commissionAmount)}
                              </span>
                              {Boolean(t.oldCommission && t.oldCommission > 0 && t.oldCommission !== (t.newCommission || t.commissionAmount)) && (
                                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-bold">
                                  Old: {formatCurrency(t.oldCommission || 0)} ({t.commissionDifference && t.commissionDifference >= 0 ? '+' : ''}{formatCurrency(t.commissionDifference || 0)})
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {getStatusBadge(t.status)}
                            </td>
                          </tr>
                        ))}
                        {empCommissionTxns.length === 0 && (
                          <tr>
                            <td colSpan={5} className="text-center py-8 text-xs text-text-secondary font-medium">
                              No commission transactions found for this employee.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
    </motion.div>
  );
}
