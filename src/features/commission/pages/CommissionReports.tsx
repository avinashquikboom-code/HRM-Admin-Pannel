import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Filter, 
  Download, 
  BarChart3, 
  Building2, 
  User as UserIcon, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Sparkles,
  RefreshCw,
  X,
  Search
} from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { fetchStores } from '@/services/storeService';
import { getCommissionTransactions } from '@/services/commissionService';
import { toast } from 'sonner';
import SuperAdminHeader from '@/components/SuperAdminHeader';
import { cn } from '@/utils/cn';

export default function CommissionReports() {
  const [stores, setStores] = useState<any[]>([]);
  const [reportData, setReportData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedStore, setSelectedStore] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('day');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredReportData = reportData.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    const empName = (item.employeeName || '').toLowerCase();
    const empCode = (item.employeeCode || '').toLowerCase();
    const branch = (item.branchName || '').toLowerCase();
    return empName.includes(q) || empCode.includes(q) || branch.includes(q);
  });
  
  // Default to past 30 days
  const [startDate, setStartDate] = useState<string>(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  useEffect(() => {
    loadStores();
  }, []);

  useEffect(() => {
    loadReportData();
  }, [selectedStore, selectedPeriod, startDate, endDate]);

  const loadStores = async () => {
    try {
      const res = await fetchStores();
      setStores(Array.isArray(res) ? res : []);
    } catch (error) {
      console.error('Failed to load stores:', error);
    }
  };

  const loadReportData = async () => {
    setIsLoading(true);
    try {
      let url = `/api/commission/report?from=${startDate}&to=${endDate}&groupBy=${selectedPeriod}`;
      if (selectedStore && selectedStore !== 'all') {
        url += `&storeId=${selectedStore}`;
      }
      
      try {
        const res = await api.get(url);
        const list = res.data?.data || res.data?.reports || res.data?.records || (Array.isArray(res.data) ? res.data : null);
        if (Array.isArray(list) && list.length > 0) {
          setReportData(list);
          return;
        }
      } catch (err) {
        console.warn('[CommissionReports] Primary report API offline, compiling from transactions:', err);
      }

      // Fallback: Compile aggregated report from commission transactions service
      const txnsRes = await getCommissionTransactions({
        storeId: selectedStore !== 'all' ? selectedStore : undefined,
        startDate,
        endDate,
      });

      const txns = txnsRes.transactions || [];
      if (txns.length > 0) {
        const reportMap = new Map<string, any>();

        txns.forEach((t) => {
          const empCode = t.employee?.employeeCode || `EMP-${t.employeeId}`;
          const empName = t.employee?.firstName ? `${t.employee.firstName} ${t.employee.lastName || ''}`.trim() : 'Employee';
          const branchName = t.store?.name || 'Main Branch';
          const periodStart = t.createdAt ? t.createdAt.split('T')[0] : startDate;

          const key = `${empCode}_${periodStart}`;
          const existing = reportMap.get(key) || {
            periodStart,
            periodEnd: periodStart,
            employeeCode: empCode,
            employeeName: empName,
            branchName,
            netSales: 0,
            commissionRate: t.commissionPercent || 5,
            commissionAmount: 0,
          };

          existing.netSales += t.saleAmount || 0;
          existing.commissionAmount += t.commissionAmount || 0;
          reportMap.set(key, existing);
        });

        setReportData(Array.from(reportMap.values()));
      } else {
        setReportData([]);
      }
    } catch (error) {
      console.error('Failed to load report data:', error);
      setReportData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!filteredReportData || filteredReportData.length === 0) {
      toast.error('No data to export');
      return;
    }

    const headers = ['Period', 'Employee Code', 'Employee Name', 'Branch', 'Net Sales (INR)', 'Commission Rate (%)', 'Commission Amount (INR)'];
    const rows = filteredReportData.map(item => [
      item.periodStart === item.periodEnd 
        ? item.periodStart 
        : `${item.periodStart} to ${item.periodEnd}`,
      item.employeeCode || '',
      item.employeeName || '',
      item.branchName || '',
      item.netSales || 0,
      item.commissionRate || 0,
      item.commissionAmount || 0
    ]);

    const csvRows = [
      headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(','),
      ...rows.map(row => row.map(val => `"${String(val ?? '').replace(/"/g, '""')}"`).join(','))
    ];
    
    const blob = new Blob(['\ufeff' + csvRows.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `commission_report_${startDate}_to_${endDate}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Commission report exported successfully');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
      currencyDisplay: 'symbol',
    }).format(amount);
  };

  const totalSalesSum = filteredReportData.reduce((sum, item) => sum + (item.netSales || 0), 0);
  const totalCommissionSum = filteredReportData.reduce((sum, item) => sum + (item.commissionAmount || 0), 0);
  const avgRate = filteredReportData.length > 0 ? (filteredReportData.reduce((sum, item) => sum + (item.commissionRate || 0), 0) / filteredReportData.length).toFixed(1) : '0';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8 pb-10 text-text-primary"
    >
      {/* SuperAdminHeader */}
      <SuperAdminHeader
        title="Commission Reports & Analytics"
        subtitle="Generate detailed ledger statements, store sales breakdowns, and employee remuneration audit reports."
        badgeText="Financial Reports & Summaries"
        badgeIcon={BarChart3}
        stats={[
          { label: 'Total Report Sales', value: formatCurrency(totalSalesSum), icon: TrendingUp, trend: 'Gross' },
          { label: 'Total Commission Payout', value: formatCurrency(totalCommissionSum), icon: DollarSign, badge: 'Calculated' },
          { label: 'Avg Commission Rate', value: `${avgRate}%`, icon: Sparkles, trend: 'Standard' }
        ]}
      >
        <button 
          onClick={handleExportCSV}
          className="btn-primary group relative overflow-hidden shadow-xl shadow-primary/25 hover:shadow-primary/40 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider justify-center flex items-center gap-2.5 transition-all duration-300 active:scale-95"
        >
          <span className="p-1 rounded-lg bg-white/20 group-hover:rotate-12 transition-transform">
            <Download size={14} />
          </span>
          <span>Export CSV Statement</span>
        </button>
      </SuperAdminHeader>

      {/* Filters Card */}
      <div className="glass-card p-6 rounded-2xl border border-border/60 dark:border-white/10 shadow-xl backdrop-blur-2xl bg-surface/90 dark:bg-slate-900/90">
        <div className="flex items-center justify-between mb-5 pb-4 border-b border-border/50 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Filter className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-sm font-black text-text-primary uppercase tracking-tight">Report Generator Filters</h4>
              <p className="text-[11px] font-medium text-text-secondary">Specify parameters to customize remuneration audit reports</p>
            </div>
          </div>

          {(selectedStore !== 'all' || selectedPeriod !== 'day' || searchQuery !== '') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedStore('all');
                setSelectedPeriod('day');
                setSearchQuery('');
              }}
              className="px-3.5 py-1.5 rounded-xl border border-border/50 dark:border-white/10 text-xs font-bold text-text-secondary hover:text-text-primary"
            >
              <X className="h-3.5 w-3.5 mr-1" />
              Reset Filters
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-text-secondary">Search Representative / Branch</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-secondary" />
              <Input
                type="text"
                placeholder="Search name, code, store..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-8 bg-surface-variant/60 dark:bg-white/[0.05] border border-border/50 dark:border-white/10 rounded-xl text-xs font-bold"
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
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-text-secondary">Store Location</Label>
            <Select value={selectedStore} onValueChange={setSelectedStore}>
              <SelectTrigger className="bg-surface-variant/60 dark:bg-white/[0.05] border border-border/50 dark:border-white/10 rounded-xl text-xs font-bold">
                <SelectValue placeholder="All Stores" />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                <SelectItem value="all">All Stores</SelectItem>
                {stores.map((store) => (
                  <SelectItem key={store.id} value={store.id.toString()}>
                    {store.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-text-secondary">Grouping Frequency</Label>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="bg-surface-variant/60 dark:bg-white/[0.05] border border-border/50 dark:border-white/10 rounded-xl text-xs font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Daily Breakdown</SelectItem>
                <SelectItem value="week">Weekly Breakdown</SelectItem>
                <SelectItem value="month">Monthly Summary</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-text-secondary">From Date</Label>
            <Input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)} 
              className="bg-surface-variant/60 dark:bg-white/[0.05] border border-border/50 dark:border-white/10 rounded-xl text-xs font-bold"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-text-secondary">To Date</Label>
            <Input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)} 
              className="bg-surface-variant/60 dark:bg-white/[0.05] border border-border/50 dark:border-white/10 rounded-xl text-xs font-bold"
            />
          </div>
        </div>
      </div>

      {/* Report Table Card */}
      <div className="glass-card rounded-2xl border border-border/60 dark:border-white/10 bg-surface/90 dark:bg-slate-900/90 backdrop-blur-2xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-border/50 dark:border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-variant/20 dark:bg-slate-950/20">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 text-primary rounded-xl border border-primary/20 shadow-sm">
              <BarChart3 size={20} />
            </div>
            <div>
              <h3 className="heading-2 text-lg font-black text-text-primary">Commission Statement Ledger</h3>
              <p className="text-[11px] font-medium text-text-secondary mt-0.5">Verified employee sales and corresponding commission earned</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs font-mono font-bold">
            <div className="bg-surface-variant/60 dark:bg-white/[0.05] px-3.5 py-1.5 rounded-xl border border-border/50 dark:border-white/10">
              <span className="text-text-secondary uppercase text-[10px]">Net Sales: </span>
              <span className="text-text-primary font-black ml-1">{formatCurrency(totalSalesSum)}</span>
            </div>
            <div className="bg-primary/10 px-3.5 py-1.5 rounded-xl border border-primary/20">
              <span className="text-primary uppercase text-[10px]">Total Commission: </span>
              <span className="text-primary font-black ml-1">{formatCurrency(totalCommissionSum)}</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-16 gap-3 text-text-secondary font-medium">
              <RefreshCw className="h-5 w-5 animate-spin text-primary" />
              <span>Generating commission statement report...</span>
            </div>
          ) : filteredReportData.length === 0 ? (
            <div className="text-center py-16 text-text-secondary font-medium text-xs">
              No commission records found matching the selected filter criteria.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-variant/40 dark:bg-slate-950/40 border-b border-border/50 dark:border-white/10">
                  <th className="px-6 py-4 text-[10.5px] font-black uppercase tracking-widest text-text-secondary">Period</th>
                  <th className="px-6 py-4 text-[10.5px] font-black uppercase tracking-widest text-text-secondary">Representative</th>
                  <th className="px-6 py-4 text-[10.5px] font-black uppercase tracking-widest text-text-secondary">Branch / Store</th>
                  <th className="px-6 py-4 text-[10.5px] font-black uppercase tracking-widest text-text-secondary text-right">Net Sales</th>
                  <th className="px-6 py-4 text-[10.5px] font-black uppercase tracking-widest text-text-secondary text-right">Rate</th>
                  <th className="px-6 py-4 text-[10.5px] font-black uppercase tracking-widest text-text-secondary text-right">Commission Earned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 dark:divide-white/10">
                {filteredReportData.map((item, index) => (
                  <tr key={index} className="hover:bg-surface-variant/30 dark:hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4 font-mono text-xs font-bold text-text-primary">
                      <span className="bg-surface-variant/80 dark:bg-white/[0.06] px-2.5 py-1 rounded-lg border border-border/50 dark:border-white/10">
                        {item.periodStart === item.periodEnd 
                          ? item.periodStart 
                          : `${item.periodStart} to ${item.periodEnd}`}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-xs shrink-0">
                          {item.employeeName ? item.employeeName.charAt(0) : 'E'}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-text-primary text-xs group-hover:text-primary transition-colors">
                            {item.employeeName}
                          </span>
                          <span className="font-mono text-[10px] text-text-secondary">
                            {item.employeeCode}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-text-secondary">
                      {item.branchName || 'Main Branch'}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-xs font-black text-text-primary">
                      {formatCurrency(item.netSales)}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-xs font-bold text-text-secondary">
                      <span className="px-2 py-0.5 bg-surface-variant/80 dark:bg-white/[0.06] rounded border border-border/50 dark:border-white/10">
                        {item.commissionRate}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-xs font-black text-primary">
                      {formatCurrency(item.commissionAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </motion.div>
  );
}
