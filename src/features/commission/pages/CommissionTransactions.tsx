import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { 
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Calendar,
  Eye,
  Download,
  RefreshCw
} from 'lucide-react';
import { 
  getCommissionDashboard,
  getCommissionTransactions,
  getTransactionDifferences,
  approveCommissionTransaction,
  rejectCommissionTransaction,
  getTransactionNetContribution,
  formatBillIdDisplay,
  formatInvoiceDisplay,
  type CommissionTransaction 
} from '@/services/commissionService';
import { fetchStores } from '@/services/storeService';
import { fetchEmployees } from '@/services/employeeService';
import Modal from '@/components/Modal';
import { toast } from 'sonner';
import { cn } from '@/utils/cn';

export default function CommissionTransactions() {
  const [transactions, setTransactions] = useState<CommissionTransaction[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStore, setSelectedStore] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<CommissionTransaction | null>(null);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [notes, setNotes] = useState('');

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

  const handleExportCSV = () => {
    if (!filteredTransactions || filteredTransactions.length === 0) {
      toast.error('No transactions available to export');
      return;
    }

    const headers = ['Invoice / Bill No', 'Employee Name', 'Store', 'Sale Amount (INR)', 'Commission Amount (INR)', 'Status', 'Date'];
    const rows = filteredTransactions.map(t => [
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
    link.download = `commission_transactions_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('Transactions exported successfully');
  };

  useEffect(() => {
    loadTransactions();
    loadDropdownData();
  }, [selectedStore, selectedStatus]);

  const loadTransactions = async () => {
    setIsLoading(true);
    try {
      const params: any = {};
      if (selectedStore) params.storeId = selectedStore;
      if (selectedStatus) params.status = selectedStatus;
      if (selectedStatus) params.status = selectedStatus;

      const response = await getCommissionTransactions(params);
      setTransactions(response.transactions);
    } catch (error) {
      console.error('Failed to load transactions:', error);
      toast.error('Failed to load commission transactions');
    } finally {
      setIsLoading(false);
    }
  };

  const loadDropdownData = async () => {
    try {
      const storesRes = await fetchStores().catch(() => []);
      setStores(Array.isArray(storesRes) ? storesRes : []);
    } catch (error) {
      console.error('Failed to load dropdown data:', error);
    }
  };

  const handleApprove = async () => {
    if (!selectedTransaction) return;
    
    try {
      await approveCommissionTransaction(selectedTransaction.id.toString(), notes);
      toast.success('Commission transaction approved successfully');
      setIsApproveDialogOpen(false);
      setNotes('');
      setSelectedTransaction(null);
      loadTransactions();
    } catch (error) {
      console.error('Failed to approve transaction:', error);
      toast.error('Failed to approve commission transaction');
    }
  };

  const handleReject = async () => {
    if (!selectedTransaction) return;
    
    try {
      await rejectCommissionTransaction(selectedTransaction.id.toString(), notes);
      toast.success('Commission transaction rejected successfully');
      setIsRejectDialogOpen(false);
      setNotes('');
      setSelectedTransaction(null);
      loadTransactions();
    } catch (error) {
      console.error('Failed to reject transaction:', error);
      toast.error('Failed to reject commission transaction');
    }
  };

  const openApproveDialog = (transaction: CommissionTransaction) => {
    setSelectedTransaction(transaction);
    setNotes('');
    setIsApproveDialogOpen(true);
  };

  const openRejectDialog = (transaction: CommissionTransaction) => {
    setSelectedTransaction(transaction);
    setNotes('');
    setIsRejectDialogOpen(true);
  };

  const formatCurrency = (amount: number) => {
    const num = Number(amount || 0);
    const hasFractions = num % 1 !== 0;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: hasFractions ? 2 : 0,
      maximumFractionDigits: 2,
      currencyDisplay: 'symbol',
    }).format(num);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-blue-100 text-blue-800',
      REJECTED: 'bg-red-100 text-red-800',
      PAID: 'bg-green-100 text-green-800',
    };
    const icons: Record<string, any> = {
      PENDING: <Clock className="h-3 w-3" />,
      APPROVED: <CheckCircle className="h-3 w-3" />,
      REJECTED: <XCircle className="h-3 w-3" />,
      PAID: <CheckCircle className="h-3 w-3" />,
    };
    return (
      <Badge className={variants[status] || 'bg-gray-100 text-gray-800'}>
        {icons[status]}
        <span className="ml-1">{status}</span>
      </Badge>
    );
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const emp = transaction.employee;
    const empName = emp ? `${emp.firstName || ''} ${emp.lastName || ''}`.trim().toLowerCase() : '';
    const empCode = emp ? String(emp.employeeCode || '').toLowerCase() : '';
    const storeName = String(transaction.store?.name || emp?.store?.name || '').toLowerCase();
    const inv = String(transaction.invoiceNumber || transaction.billId || transaction.billNumber || '').toLowerCase();
    return empName.includes(term) || empCode.includes(term) || storeName.includes(term) || inv.includes(term);
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Loading commission transactions...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Commission Transactions</h1>
          <p className="text-muted-foreground mt-1">
            Review and manage commission transactions
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="font-semibold flex items-center gap-2"
          onClick={handleExportCSV}
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Store</Label>
              <Select value={selectedStore || 'all'} onValueChange={(val) => setSelectedStore(val === 'all' ? '' : val)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Stores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stores</SelectItem>
                  {stores.map((store) => (
                    <SelectItem key={store.id} value={store.id.toString()}>
                      {store.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={selectedStatus || 'all'} onValueChange={(val) => setSelectedStatus(val === 'all' ? '' : val)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by invoice or employee..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredTransactions.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredTransactions.filter(t => t.status === 'PENDING').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredTransactions.filter(t => t.status === 'APPROVED').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Commission</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(filteredTransactions.reduce((sum, t) => sum + getTransactionNetContribution(t).netCommission, 0))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bill ID</TableHead>
                <TableHead>Invoice</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Store</TableHead>
                <TableHead className="text-right">Sale Amount</TableHead>
                <TableHead className="text-right">Commission</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-bold font-mono text-primary">
                    #{formatBillIdDisplay(transaction)}
                  </TableCell>
                  <TableCell className="font-medium font-mono text-xs text-muted-foreground">
                    {formatInvoiceDisplay(transaction)}
                  </TableCell>
                  <TableCell 
                    className="cursor-pointer hover:text-primary transition-colors font-medium"
                    onClick={() => handleEmployeeClick(transaction.employee)}
                    title="Click to view monthly commission details"
                  >
                    {transaction.employee?.firstName} {transaction.employee?.lastName}
                  </TableCell>
                  <TableCell>{transaction.store?.name || '-'}</TableCell>
                  <TableCell className="text-right">
                    <span className="font-medium block">
                      {formatCurrency(transaction.newAmount || transaction.saleAmount)}
                    </span>
                    {transaction.oldAmount && Number(transaction.oldAmount) > 0 && Number(transaction.oldAmount) !== Number(transaction.newAmount || transaction.saleAmount) ? (
                      <span className="text-[10px] text-muted-foreground font-normal block">
                        Old: {formatCurrency(transaction.oldAmount)}
                      </span>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    <span className="font-bold text-primary block">
                      {formatCurrency(transaction.newCommission !== undefined && transaction.newCommission !== null && transaction.newCommission !== 0 ? transaction.newCommission : transaction.commissionAmount)}
                    </span>
                    {transaction.oldCommission && Number(transaction.oldCommission) > 0 && Number(transaction.oldCommission) !== Number(transaction.newCommission || transaction.commissionAmount) ? (
                      <span className="text-[10px] text-muted-foreground font-normal block">
                        Old: {formatCurrency(transaction.oldCommission)} (
                        {Number(transaction.newCommission || transaction.commissionAmount) - Number(transaction.oldCommission) >= 0 ? '+' : ''}
                        {formatCurrency(Number(transaction.newCommission || transaction.commissionAmount) - Number(transaction.oldCommission))})
                      </span>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{transaction.commissionType}</Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                  <TableCell>
                    {new Date(transaction.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {transaction.status === 'PENDING' && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openApproveDialog(transaction)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openRejectDialog(transaction)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredTransactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="text-center text-muted-foreground">
                    No transactions found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Approve Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Commission Transaction</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Transaction Amount</p>
              <p className="text-2xl font-bold">
                {selectedTransaction && formatCurrency(selectedTransaction.commissionAmount)}
              </p>
            </div>
            <div className="space-y-2">
              <Label>Notes (Optional)</Label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes for this approval..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Commission Transaction</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Transaction Amount</p>
              <p className="text-2xl font-bold">
                {selectedTransaction && formatCurrency(selectedTransaction.commissionAmount)}
              </p>
            </div>
            <div className="space-y-2">
              <Label>Reason for Rejection *</Label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Please provide a reason for rejection..."
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleReject} className="bg-red-600 hover:bg-red-700">
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Employee Monthly Commission Intelligence Modal */}
      <Modal
        isOpen={empCommissionModalOpen}
        onClose={() => setEmpCommissionModalOpen(false)}
        title="Employee Monthly Commission Intelligence"
        maxWidth="max-w-6xl"
      >
        {selectedEmpForCommission && (
          <div className="p-6 space-y-6">
            {/* Employee Profile Header */}
            <div className="flex items-center justify-between p-4 bg-muted/50 border border-border rounded-2xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center font-black text-primary text-lg">
                  {selectedEmpForCommission.firstName?.[0] || 'E'}
                </div>
                <div>
                  <h3 className="text-lg font-black text-foreground">
                    {selectedEmpForCommission.firstName} {selectedEmpForCommission.lastName}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-xs font-bold text-muted-foreground bg-muted px-2.5 py-0.5 rounded border border-border">
                      {selectedEmpForCommission.employeeCode || `ID: ${selectedEmpForCommission.id}`}
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground">
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
              <div className="py-12 text-center text-xs font-bold text-muted-foreground flex items-center justify-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin text-primary" />
                <span>Fetching monthly commission statistics...</span>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-muted/30 border border-border rounded-xl">
                    <span className="text-[10px] font-black uppercase text-muted-foreground">Monthly Commission</span>
                    <p className="text-lg font-black text-primary font-mono mt-1">
                      {formatCurrency(empCommissionStats?.month?.commission || 0)}
                    </p>
                    <span className="text-[9px] font-bold text-muted-foreground">Current Month Earned</span>
                  </div>
                  <div className="p-4 bg-muted/30 border border-border rounded-xl">
                    <span className="text-[10px] font-black uppercase text-muted-foreground">Monthly Sales</span>
                    <p className="text-lg font-black text-foreground font-mono mt-1">
                      {formatCurrency(empCommissionStats?.month?.sales || 0)}
                    </p>
                    <span className="text-[9px] font-bold text-muted-foreground">{empCommissionStats?.month?.transactions || 0} Total Sales</span>
                  </div>
                  <div className="p-4 bg-muted/30 border border-border rounded-xl">
                    <span className="text-[10px] font-black uppercase text-muted-foreground">Pending Payout</span>
                    <p className="text-lg font-black text-amber-500 font-mono mt-1">
                      {formatCurrency(empCommissionStats?.pending?.commission || 0)}
                    </p>
                    <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400">Awaiting Settlement</span>
                  </div>
                  <div className="p-4 bg-muted/30 border border-border rounded-xl">
                    <span className="text-[10px] font-black uppercase text-muted-foreground">Disbursed Paid</span>
                    <p className="text-lg font-black text-emerald-500 font-mono mt-1">
                      {formatCurrency(empCommissionStats?.paid?.commission || 0)}
                    </p>
                    <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400">Settled to Salary</span>
                  </div>
                </div>

                {/* Monthly Transactions List */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-black uppercase tracking-wider text-foreground">
                      Monthly Commission Transactions ({empCommissionTxns.length})
                    </h4>
                    <span className="text-[11px] font-bold text-muted-foreground font-mono">
                      Filtered by logged-in period
                    </span>
                  </div>
                  <div className="max-h-80 overflow-y-auto overflow-x-auto rounded-xl border border-border w-full min-w-0 max-w-full box-border scrollbar-thin">
                    <table className="w-full text-left border-collapse min-w-[980px]">
                      <thead>
                        <tr className="bg-muted/40 border-b border-border sticky top-0 backdrop-blur-md z-10">
                          <th className="px-3 py-3 text-[10px] font-black uppercase text-muted-foreground whitespace-nowrap">BILL / INVOICE</th>
                          <th className="px-3 py-3 text-[10px] font-black uppercase text-muted-foreground whitespace-nowrap">DATE</th>
                          <th className="px-3 py-3 text-[10px] font-black uppercase text-muted-foreground text-right whitespace-nowrap">SALE AMOUNT</th>
                          <th className="px-3 py-3 text-[10px] font-black uppercase text-muted-foreground text-right whitespace-nowrap">OLD BILL AMOUNT</th>
                          <th className="px-3 py-3 text-[10px] font-black uppercase text-muted-foreground text-right whitespace-nowrap">DIFFERENCE AMOUNT</th>
                          <th className="px-3 py-3 text-[10px] font-black uppercase text-muted-foreground text-right whitespace-nowrap">NEW BILL AMOUNT</th>
                          <th className="px-3 py-3 text-[10px] font-black uppercase text-muted-foreground text-right whitespace-nowrap">OLD BILL COMMISSION</th>
                          <th className="px-3 py-3 text-[10px] font-black uppercase text-muted-foreground text-right whitespace-nowrap">COMMISSION DIFFERENCE</th>
                          <th className="px-3 py-3 text-[10px] font-black uppercase text-muted-foreground text-right whitespace-nowrap">NEW BILL COMMISSION</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {empCommissionTxns.map((t) => {
                          const { saleAmt, oldBillAmt, newBillAmt, diffAmt, oldBillComm, newBillComm, commDiff } = getTransactionDifferences(t);

                          return (
                            <tr key={t.id} className="hover:bg-muted/30">
                              {/* 1. BILL / INVOICE */}
                              <td className="px-3 py-3 font-mono text-xs font-bold whitespace-nowrap">
                                {formatInvoiceDisplay(t)}
                              </td>

                              {/* 2. DATE */}
                              <td className="px-3 py-3 text-xs text-muted-foreground whitespace-nowrap">
                                {t.createdAt ? new Date(t.createdAt).toLocaleDateString('en-IN') : '-'}
                              </td>

                              {/* 3. SALE AMOUNT */}
                              <td className="px-3 py-3 text-right font-mono text-xs font-bold whitespace-nowrap">
                                {formatCurrency(saleAmt)}
                              </td>

                              {/* 4. OLD BILL AMOUNT */}
                              <td className="px-3 py-3 text-right font-mono text-xs font-medium text-muted-foreground whitespace-nowrap">
                                {oldBillAmt !== null ? (
                                  formatCurrency(oldBillAmt)
                                ) : (
                                  <span className="text-muted-foreground/50 font-normal">—</span>
                                )}
                              </td>

                              {/* 5. DIFFERENCE AMOUNT */}
                              <td className="px-3 py-3 text-right font-mono text-xs font-bold whitespace-nowrap">
                                {diffAmt !== null ? (
                                  <span className={cn(
                                    diffAmt > 0 && "text-emerald-600 dark:text-emerald-400 font-extrabold",
                                    diffAmt < 0 && "text-rose-600 dark:text-rose-400 font-extrabold",
                                    diffAmt === 0 && "text-muted-foreground"
                                  )}>
                                    {diffAmt > 0 ? `+${formatCurrency(diffAmt)}` : diffAmt < 0 ? `-${formatCurrency(Math.abs(diffAmt))}` : formatCurrency(0)}
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground/50 font-normal">—</span>
                                )}
                              </td>

                              {/* 6. NEW BILL AMOUNT */}
                              <td className="px-3 py-3 text-right font-mono text-xs font-bold text-foreground whitespace-nowrap">
                                {formatCurrency(newBillAmt)}
                              </td>

                              {/* 7. OLD BILL COMMISSION */}
                              <td className="px-3 py-3 text-right font-mono text-xs font-medium text-muted-foreground whitespace-nowrap">
                                {oldBillComm !== null ? (
                                  formatCurrency(oldBillComm)
                                ) : (
                                  <span className="text-muted-foreground/50 font-normal">—</span>
                                )}
                              </td>

                              {/* 8. COMMISSION DIFFERENCE */}
                              <td className="px-3 py-3 text-right font-mono text-xs font-bold whitespace-nowrap">
                                {commDiff !== null ? (
                                  <span className={cn(
                                    commDiff > 0 && "text-emerald-600 dark:text-emerald-400 font-extrabold",
                                    commDiff < 0 && "text-rose-600 dark:text-rose-400 font-extrabold",
                                    commDiff === 0 && "text-muted-foreground"
                                  )}>
                                    {commDiff > 0 ? `+${formatCurrency(commDiff)}` : commDiff < 0 ? `-${formatCurrency(Math.abs(commDiff))}` : formatCurrency(0)}
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground/50 font-normal">—</span>
                                )}
                              </td>

                              {/* 9. NEW BILL COMMISSION */}
                              <td className="px-3 py-3 text-right font-mono text-xs font-black text-primary whitespace-nowrap">
                                {formatCurrency(newBillComm)}
                              </td>
                            </tr>
                          );
                        })}
                        {empCommissionTxns.length === 0 && (
                          <tr>
                            <td colSpan={9} className="text-center py-8 text-sm text-muted-foreground">
                              No commission transactions found for this employee.
                            </td>
                          </tr>
                        )}
                      </tbody>
                      {empCommissionTxns.length > 0 && (
                        <tfoot className="bg-muted/60 border-t-2 border-border sticky bottom-0 backdrop-blur-md font-mono text-xs font-bold z-10">
                          <tr>
                            <td colSpan={2} className="px-3 py-2.5 uppercase text-[11px] font-black text-foreground">
                              Total ({empCommissionTxns.length})
                            </td>
                            {/* SALE AMOUNT total */}
                            <td className="px-3 py-2.5 text-right font-black text-foreground whitespace-nowrap">
                              {formatCurrency(empCommissionTxns.reduce((acc, t) => acc + Number(t.saleAmount || 0), 0))}
                            </td>
                            {/* OLD BILL AMOUNT total */}
                            <td className="px-3 py-2.5 text-right font-semibold text-muted-foreground whitespace-nowrap">
                              {(() => {
                                let hasAnyOld = false;
                                const sumOld = empCommissionTxns.reduce((acc, t) => {
                                  const { oldBillAmt } = getTransactionDifferences(t);
                                  if (oldBillAmt !== null) {
                                    hasAnyOld = true;
                                    return acc + oldBillAmt;
                                  }
                                  return acc;
                                }, 0);
                                return hasAnyOld ? formatCurrency(sumOld) : '—';
                              })()}
                            </td>
                            {/* DIFFERENCE AMOUNT total */}
                            <td className="px-3 py-2.5 text-right font-black whitespace-nowrap">
                              {(() => {
                                let hasAnyDiff = false;
                                const totalDiff = empCommissionTxns.reduce((acc, t) => {
                                  const { diffAmt } = getTransactionDifferences(t);
                                  if (diffAmt !== null) {
                                    hasAnyDiff = true;
                                    return acc + diffAmt;
                                  }
                                  return acc;
                                }, 0);
                                if (!hasAnyDiff) return <span className="text-muted-foreground/50 font-normal">—</span>;
                                return (
                                  <span className={cn(
                                    totalDiff > 0 && "text-emerald-600 dark:text-emerald-400 font-extrabold",
                                    totalDiff < 0 && "text-rose-600 dark:text-rose-400 font-extrabold",
                                    totalDiff === 0 && "text-muted-foreground"
                                  )}>
                                    {totalDiff > 0 ? `+${formatCurrency(totalDiff)}` : totalDiff < 0 ? `-${formatCurrency(Math.abs(totalDiff))}` : formatCurrency(0)}
                                  </span>
                                );
                              })()}
                            </td>
                            {/* NEW BILL AMOUNT total */}
                            <td className="px-3 py-2.5 text-right font-black text-foreground whitespace-nowrap">
                              {formatCurrency(empCommissionTxns.reduce((acc, t) => {
                                const { newBillAmt } = getTransactionDifferences(t);
                                return acc + newBillAmt;
                              }, 0))}
                            </td>
                            {/* OLD BILL COMMISSION total */}
                            <td className="px-3 py-2.5 text-right font-semibold text-muted-foreground whitespace-nowrap">
                              {(() => {
                                let hasAnyOldComm = false;
                                const sumOldComm = empCommissionTxns.reduce((acc, t) => {
                                  const { oldBillComm } = getTransactionDifferences(t);
                                  if (oldBillComm !== null) {
                                    hasAnyOldComm = true;
                                    return acc + oldBillComm;
                                  }
                                  return acc;
                                }, 0);
                                return hasAnyOldComm ? formatCurrency(sumOldComm) : '—';
                              })()}
                            </td>
                            {/* COMMISSION DIFFERENCE total */}
                            <td className="px-3 py-2.5 text-right font-black whitespace-nowrap">
                              {(() => {
                                let hasAnyCommDiff = false;
                                const totalCommDiff = empCommissionTxns.reduce((acc, t) => {
                                  const { commDiff } = getTransactionDifferences(t);
                                  if (commDiff !== null) {
                                    hasAnyCommDiff = true;
                                    return acc + commDiff;
                                  }
                                  return acc;
                                }, 0);
                                if (!hasAnyCommDiff) return <span className="text-muted-foreground/50 font-normal">—</span>;
                                return (
                                  <span className={cn(
                                    totalCommDiff > 0 && "text-emerald-600 dark:text-emerald-400 font-extrabold",
                                    totalCommDiff < 0 && "text-rose-600 dark:text-rose-400 font-extrabold",
                                    totalCommDiff === 0 && "text-muted-foreground"
                                  )}>
                                    {totalCommDiff > 0 ? `+${formatCurrency(totalCommDiff)}` : totalCommDiff < 0 ? `-${formatCurrency(Math.abs(totalCommDiff))}` : formatCurrency(0)}
                                  </span>
                                );
                              })()}
                            </td>
                            {/* NEW BILL COMMISSION total */}
                            <td className="px-3 py-2.5 text-right font-black text-primary whitespace-nowrap">
                              {formatCurrency(empCommissionTxns.reduce((acc, t) => {
                                const { newBillComm } = getTransactionDifferences(t);
                                return acc + newBillComm;
                              }, 0))}
                            </td>
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
