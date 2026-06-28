import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Clock, 
  CheckCircle, 
  Users,
  Calendar,
  Filter,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Award,
  BarChart3,
  PieChart,
  Building2,
  User as UserIcon,
  X,
  RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { 
  getCommissionDashboard, 
  getCommissionTransactions,
  type CommissionDashboardStats,
  type CommissionTransaction 
} from '@/services/commissionService';
import { fetchOffices } from '@/services/officeService';
import { fetchEmployees } from '@/services/employeeService';
import { toast } from 'sonner';
import StatCard from '@/features/dashboard/components/StatCard';
import SuperAdminHeader from '@/components/SuperAdminHeader';

export default function CommissionDashboard() {
  const [stats, setStats] = useState<CommissionDashboardStats | null>(null);
  const [transactions, setTransactions] = useState<CommissionTransaction[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStore, setSelectedStore] = useState<string>('');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [dateRange, setDateRange] = useState('month');

  // Filter employees based on selected store
  const filteredEmployees = selectedStore 
    ? employees.filter(emp => emp.officeId?.toString() === selectedStore)
    : employees;

  // Reset employee selection when store changes
  const handleStoreChange = (storeId: string) => {
    setSelectedStore(storeId);
    setSelectedEmployee(''); // Clear employee selection when store changes
  };

  useEffect(() => {
    loadDashboardData();
    loadDropdownData();
  }, [selectedStore, selectedEmployee, dateRange]);

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
        fetchOffices(),
        fetchEmployees(),
      ]);
      setStores(Array.isArray(storesRes) ? storesRes : []);
      setEmployees(Array.isArray(employeesRes) ? employeesRes : employeesRes?.employees || []);
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
    const variants: Record<string, any> = {
      PENDING: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
      APPROVED: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      REJECTED: 'bg-red-500/10 text-red-600 border-red-500/20',
      PAID: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    };
    return (
      <Badge className={cn(variants[status] || 'bg-gray-500/10 text-gray-600 border-gray-500/20', 'border font-semibold')}>
        {status}
      </Badge>
    );
  };


  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Loading commission data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <SuperAdminHeader
        title="Commission Dashboard"
        subtitle="Track and manage employee commissions across all stores with real-time analytics and performance insights."
        badgeText="Commission Management"
        badgeIcon={DollarSign}
        stats={[
          { label: 'Today\'s Commission', value: formatCurrency(stats?.today.commission || 0), icon: DollarSign },
          { label: 'Monthly Commission', value: formatCurrency(stats?.month.commission || 0), icon: TrendingUp },
          { label: 'Pending Approval', value: formatCurrency(stats?.pending.commission || 0), icon: Clock },
          { label: 'Paid Commission', value: formatCurrency(stats?.paid.commission || 0), icon: CheckCircle }
        ]}
      >
        <Button variant="outline" size="sm" className="font-semibold">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </SuperAdminHeader>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-4"
      >
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-primary" />
            <span className="text-xs font-black uppercase tracking-wider text-text-primary">Filters</span>
          </div>
          
          <div className="h-6 w-px bg-border/50" />
          
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <Select value={selectedStore} onValueChange={handleStoreChange}>
              <SelectTrigger className="w-40 bg-surface-variant border border-border/60 hover:border-primary/30 transition-all text-xs font-semibold">
                <SelectValue placeholder="All Stores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Stores</SelectItem>
                {stores.map((store) => (
                  <SelectItem key={store.id} value={store.id.toString()}>
                    {store.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedEmployee} onValueChange={setSelectedEmployee} disabled={!!selectedStore && filteredEmployees.length === 0}>
              <SelectTrigger className="w-48 bg-surface-variant border border-border/60 hover:border-primary/30 transition-all text-xs font-semibold disabled:opacity-50">
                <SelectValue placeholder={!!selectedStore && filteredEmployees.length === 0 ? "No employees" : "All Employees"} />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                <SelectItem value="">All Employees</SelectItem>
                {filteredEmployees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id.toString()} className="py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                        {emp.firstName?.[0]}{emp.lastName?.[0]}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-text-primary">
                          {emp.firstName} {emp.lastName}
                        </span>
                        <span className="text-[10px] text-text-secondary">
                          {emp.employeeCode || emp.id}
                        </span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-32 bg-surface-variant border border-border/60 hover:border-primary/30 transition-all text-xs font-semibold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              size="sm"
              className="font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20" 
              onClick={loadDashboardData}
            >
              <Filter className="h-3 w-3 mr-1" />
              Apply
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedStore('');
                setSelectedEmployee('');
                setDateRange('month');
              }}
              className="text-xs font-semibold text-text-secondary hover:text-text-primary"
            >
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={loadDashboardData}
              className="h-8 w-8 border border-border/60 hover:border-primary/30"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Active Filters Display */}
        {(selectedStore || selectedEmployee || dateRange !== 'month') && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3 pt-3 border-t border-border/40"
          >
            <div className="flex flex-wrap gap-2">
              {selectedStore && (
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-xs font-semibold text-primary">
                  <Building2 className="h-3 w-3" />
                  {stores.find(s => s.id.toString() === selectedStore)?.name}
                  <button
                    onClick={() => setSelectedStore('')}
                    className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              {selectedEmployee && (
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-xs font-semibold text-primary">
                  <UserIcon className="h-3 w-3" />
                  {employees.find(e => e.id.toString() === selectedEmployee)?.firstName} {employees.find(e => e.id.toString() === selectedEmployee)?.lastName}
                  <button
                    onClick={() => setSelectedEmployee('')}
                    className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              {dateRange !== 'month' && (
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-xs font-semibold text-primary">
                  <Calendar className="h-3 w-3" />
                  {dateRange === 'today' ? 'Today' : 'This Week'}
                  <button
                    onClick={() => setDateRange('month')}
                    className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Today's Commission"
          value={formatCurrency(stats?.today.commission || 0)}
          sub={`${stats?.today.transactions || 0} transactions`}
          icon={DollarSign}
          tone="primary"
        />
        <StatCard
          label="Monthly Commission"
          value={formatCurrency(stats?.month.commission || 0)}
          sub={`${formatCurrency(stats?.month.sales || 0)} total sales`}
          icon={TrendingUp}
          tone="success"
        />
        <StatCard
          label="Pending Approval"
          value={formatCurrency(stats?.pending.commission || 0)}
          sub={`${stats?.pending.transactions || 0} transactions`}
          icon={Clock}
          tone="warning"
        />
        <StatCard
          label="Paid Commission"
          value={formatCurrency(stats?.paid.commission || 0)}
          sub={`${stats?.paid.transactions || 0} transactions`}
          icon={CheckCircle}
          tone="success"
        />
      </div>

      {/* Top Performers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="border-2 border-border/60 bg-surface/50">
          <CardHeader className="border-b border-border/40">
            <CardTitle className="flex items-center gap-3 text-xl font-black">
              <div className="p-2 bg-gradient-to-br from-amber-500/20 to-amber-500/5 rounded-xl">
                <Award className="h-5 w-5 text-amber-500" />
              </div>
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow className="border-border/60">
                  <TableHead className="text-xs font-black uppercase tracking-wider text-text-secondary">Employee</TableHead>
                  <TableHead className="text-xs font-black uppercase tracking-wider text-text-secondary">Employee Code</TableHead>
                  <TableHead className="text-xs font-black uppercase tracking-wider text-text-secondary text-right">Total Sales</TableHead>
                  <TableHead className="text-xs font-black uppercase tracking-wider text-text-secondary text-right">Commission</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats?.topPerformers.map((performer, index) => (
                  <TableRow key={index} className="border-border/40 hover:bg-surface-variant/50 transition-colors">
                    <TableCell className="font-semibold text-text-primary">
                      <div className="flex items-center gap-3">
                        <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold', index === 0 ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white' : index === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-slate-700' : index === 2 ? 'bg-gradient-to-br from-orange-300 to-orange-500 text-white' : 'bg-surface-variant text-text-secondary')}>
                          {index + 1}
                        </div>
                        {performer.employee?.firstName} {performer.employee?.lastName}
                      </div>
                    </TableCell>
                    <TableCell className="text-text-secondary font-medium">{performer.employee?.employeeCode}</TableCell>
                    <TableCell className="text-right font-bold text-text-primary">
                      {formatCurrency(performer.totalSales)}
                    </TableCell>
                    <TableCell className="text-right font-black text-primary">
                      {formatCurrency(performer.totalCommission)}
                    </TableCell>
                  </TableRow>
                ))}
                {(!stats?.topPerformers || stats.topPerformers.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-text-secondary py-8">
                      No data available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card className="border-2 border-border/60 bg-surface/50">
          <CardHeader className="border-b border-border/40">
            <CardTitle className="flex items-center gap-3 text-xl font-black">
              <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow className="border-border/60">
                  <TableHead className="text-xs font-black uppercase tracking-wider text-text-secondary">Invoice</TableHead>
                  <TableHead className="text-xs font-black uppercase tracking-wider text-text-secondary">Employee</TableHead>
                  <TableHead className="text-xs font-black uppercase tracking-wider text-text-secondary">Store</TableHead>
                  <TableHead className="text-xs font-black uppercase tracking-wider text-text-secondary text-right">Sale Amount</TableHead>
                  <TableHead className="text-xs font-black uppercase tracking-wider text-text-secondary text-right">Commission</TableHead>
                  <TableHead className="text-xs font-black uppercase tracking-wider text-text-secondary">Status</TableHead>
                  <TableHead className="text-xs font-black uppercase tracking-wider text-text-secondary">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.slice(0, 10).map((transaction) => (
                  <TableRow key={transaction.id} className="border-border/40 hover:bg-surface-variant/50 transition-colors">
                    <TableCell className="font-semibold text-text-primary">{transaction.invoiceNumber || transaction.billId || '-'}</TableCell>
                    <TableCell className="text-text-secondary font-medium">
                      {transaction.employee?.firstName} {transaction.employee?.lastName}
                    </TableCell>
                    <TableCell className="text-text-secondary font-medium">{transaction.store?.name || '-'}</TableCell>
                    <TableCell className="text-right font-bold text-text-primary">
                      {formatCurrency(transaction.saleAmount)}
                    </TableCell>
                    <TableCell className="text-right font-black text-primary">
                      {formatCurrency(transaction.commissionAmount)}
                    </TableCell>
                    <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                    <TableCell className="text-text-secondary font-medium">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
                {transactions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-text-secondary py-8">
                      No transactions found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
