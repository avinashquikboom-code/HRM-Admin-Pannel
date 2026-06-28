import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Search,
  Filter,
  Download,
  FileText,
  TrendingUp,
  DollarSign,
  Calendar,
  BarChart3
} from 'lucide-react';
import { 
  getCommissionDashboard,
  getCommissionTransactions,
  type CommissionDashboardStats,
  type CommissionTransaction 
} from '@/services/commissionService';
import { fetchOffices } from '@/services/officeService';
import { fetchEmployees } from '@/services/employeeService';
import { toast } from 'sonner';

export default function CommissionReports() {
  const [stats, setStats] = useState<CommissionDashboardStats | null>(null);
  const [transactions, setTransactions] = useState<CommissionTransaction[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStore, setSelectedStore] = useState<string>('');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('month');
  const [reportType, setReportType] = useState<string>('summary');

  useEffect(() => {
    loadReportData();
    loadDropdownData();
  }, [selectedStore, selectedEmployee, selectedPeriod]);

  const loadReportData = async () => {
    setIsLoading(true);
    try {
      const params: any = {};
      if (selectedStore) params.storeId = selectedStore;
      if (selectedEmployee) params.employeeId = selectedEmployee;
      
      if (selectedPeriod === 'today') {
        const today = new Date();
        params.startDate = today.toISOString().split('T')[0];
        params.endDate = today.toISOString().split('T')[0];
      } else if (selectedPeriod === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        params.startDate = weekAgo.toISOString().split('T')[0];
        params.endDate = new Date().toISOString().split('T')[0];
      } else if (selectedPeriod === 'month') {
        const monthStart = new Date();
        monthStart.setDate(1);
        params.startDate = monthStart.toISOString().split('T')[0];
        params.endDate = new Date().toISOString().split('T')[0];
      } else if (selectedPeriod === 'quarter') {
        const quarterStart = new Date();
        const currentMonth = quarterStart.getMonth();
        const quarterStartMonth = Math.floor(currentMonth / 3) * 3;
        quarterStart.setMonth(quarterStartMonth, 1);
        params.startDate = quarterStart.toISOString().split('T')[0];
        params.endDate = new Date().toISOString().split('T')[0];
      } else if (selectedPeriod === 'year') {
        const yearStart = new Date();
        yearStart.setMonth(0, 1);
        params.startDate = yearStart.toISOString().split('T')[0];
        params.endDate = new Date().toISOString().split('T')[0];
      }

      const [statsRes, transactionsRes] = await Promise.all([
        getCommissionDashboard(params),
        getCommissionTransactions(params),
      ]);

      setStats(statsRes.stats);
      setTransactions(transactionsRes.transactions);
    } catch (error) {
      console.error('Failed to load report data:', error);
      toast.error('Failed to load commission report data');
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

  const handleExport = (format: string) => {
    toast.info(`Exporting report as ${format.toUpperCase()}...`);
    // TODO: Implement export functionality
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getPeriodLabel = (period: string) => {
    const labels: Record<string, string> = {
      today: 'Today',
      week: 'This Week',
      month: 'This Month',
      quarter: 'This Quarter',
      year: 'This Year',
    };
    return labels[period] || period;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Loading commission reports...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Commission Reports</h1>
          <p className="text-muted-foreground mt-1">
            Analyze commission performance and trends
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleExport('pdf')}>
            <FileText className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('excel')}>
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">Summary Report</SelectItem>
                  <SelectItem value="detailed">Detailed Report</SelectItem>
                  <SelectItem value="employee">Employee-wise</SelectItem>
                  <SelectItem value="store">Store-wise</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Period</Label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Store</Label>
              <Select value={selectedStore} onValueChange={setSelectedStore}>
                <SelectTrigger>
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
            </div>
            <div className="space-y-2">
              <Label>Employee</Label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger>
                  <SelectValue placeholder="All Employees" />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  <SelectItem value="">All Employees</SelectItem>
                  {employees.map((emp) => (
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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Commission</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats?.month.commission || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {getPeriodLabel(selectedPeriod)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats?.month.sales || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.month.transactions || 0} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats?.pending.commission || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.pending.transactions || 0} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Commission</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats?.paid.commission || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.paid.transactions || 0} transactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Top Performers - {getPeriodLabel(selectedPeriod)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Employee Code</TableHead>
                <TableHead className="text-right">Total Sales</TableHead>
                <TableHead className="text-right">Commission Earned</TableHead>
                <TableHead className="text-right">Commission Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats?.topPerformers.map((performer, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Badge variant={index === 0 ? 'default' : index === 1 ? 'secondary' : 'outline'}>
                      #{index + 1}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {performer.employee?.firstName} {performer.employee?.lastName}
                  </TableCell>
                  <TableCell>{performer.employee?.employeeCode}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(performer.totalSales)}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(performer.totalCommission)}
                  </TableCell>
                  <TableCell className="text-right">
                    {performer.totalSales > 0 
                      ? ((performer.totalCommission / performer.totalSales) * 100).toFixed(2) + '%'
                      : '0%'}
                  </TableCell>
                </TableRow>
              ))}
              {(!stats?.topPerformers || stats.topPerformers.length === 0) && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No data available for this period
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detailed Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Transaction Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Invoice</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Store</TableHead>
                <TableHead className="text-right">Sale Amount</TableHead>
                <TableHead className="text-right">Commission</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.slice(0, 20).map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    {new Date(transaction.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="font-medium">
                    {transaction.invoiceNumber || transaction.billId || '-'}
                  </TableCell>
                  <TableCell>
                    {transaction.employee?.firstName} {transaction.employee?.lastName}
                  </TableCell>
                  <TableCell>{transaction.store?.name || '-'}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(transaction.saleAmount)}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(transaction.commissionAmount)}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      className={
                        transaction.status === 'PAID' ? 'bg-green-100 text-green-800' :
                        transaction.status === 'APPROVED' ? 'bg-blue-100 text-blue-800' :
                        transaction.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }
                    >
                      {transaction.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {transactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No transactions found for this period
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
