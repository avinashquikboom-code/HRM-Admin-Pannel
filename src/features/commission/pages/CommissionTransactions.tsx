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
  Download
} from 'lucide-react';
import { 
  getCommissionDashboard,
  getCommissionTransactions,
  approveCommissionTransaction,
  rejectCommissionTransaction,
  type CommissionTransaction 
} from '@/services/commissionService';
import { fetchStores } from '@/services/storeService';
import { fetchEmployees } from '@/services/employeeService';
import Modal from '@/components/Modal';
import { toast } from 'sonner';

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
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
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
    const matchesSearch = 
      (transaction.invoiceNumber && transaction.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (transaction.billId && transaction.billId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (transaction.employee?.firstName && transaction.employee.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (transaction.employee?.lastName && transaction.employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
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
              {formatCurrency(filteredTransactions.reduce((sum, t) => sum + t.commissionAmount, 0))}
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
                  <TableCell className="font-medium">
                    {transaction.invoiceNumber || transaction.billId || '-'}
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
                    {formatCurrency(transaction.saleAmount)}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(transaction.commissionAmount)}
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
                  <TableCell colSpan={9} className="text-center text-muted-foreground">
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
        maxWidth="max-w-4xl"
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
                  <h3 className="text-lg font-black text-text-primary">
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
              <Badge className="bg-primary/10 text-primary border-primary/20">Monthly Breakdown</Badge>
            </div>

            {empCommissionLoading ? (
              <div className="py-12 text-center text-sm font-bold text-muted-foreground flex items-center justify-center gap-2">
                <Clock className="h-4 w-4 animate-spin text-primary" />
                <span>Fetching monthly commission data...</span>
              </div>
            ) : (
              <>
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-muted/40 border border-border rounded-xl">
                    <span className="text-[10px] font-black uppercase text-muted-foreground">Monthly Commission</span>
                    <p className="text-xl font-black text-primary font-mono mt-1">
                      {formatCurrency(empCommissionStats?.month?.commission || 0)}
                    </p>
                    <span className="text-[9px] font-bold text-muted-foreground">{empCommissionStats?.month?.transactions || 0} sales this month</span>
                  </div>
                  <div className="p-4 bg-muted/40 border border-border rounded-xl">
                    <span className="text-[10px] font-black uppercase text-muted-foreground">Monthly Sales</span>
                    <p className="text-xl font-black font-mono mt-1">
                      {formatCurrency(empCommissionStats?.month?.sales || 0)}
                    </p>
                    <span className="text-[9px] font-bold text-muted-foreground">Total revenue generated</span>
                  </div>
                  <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-xl">
                    <span className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400">Pending Payout</span>
                    <p className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono mt-1">
                      {formatCurrency(empCommissionStats?.pending?.commission || 0)}
                    </p>
                    <span className="text-[9px] font-bold text-amber-600/70 dark:text-amber-500/70">Awaiting settlement</span>
                  </div>
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 rounded-xl">
                    <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400">Total Paid</span>
                    <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                      {formatCurrency(empCommissionStats?.paid?.commission || 0)}
                    </p>
                    <span className="text-[9px] font-bold text-emerald-600/70 dark:text-emerald-500/70">Disbursed to salary</span>
                  </div>
                </div>

                {/* Transactions Table */}
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-foreground mb-3">
                    All Commission Transactions ({empCommissionTxns.length})
                  </h4>
                  <div className="max-h-72 overflow-y-auto rounded-xl border border-border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Bill / Invoice</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className="text-right">Sale Amount</TableHead>
                          <TableHead className="text-right">Commission</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {empCommissionTxns.map((t) => (
                          <TableRow key={t.id}>
                            <TableCell className="font-mono text-xs font-bold">
                              {t.invoiceNumber || t.billId || `TXN-${t.id}`}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {t.createdAt ? new Date(t.createdAt).toLocaleDateString('en-IN') : '-'}
                            </TableCell>
                            <TableCell className="text-right font-mono text-xs font-bold">
                              {formatCurrency(t.saleAmount)}
                            </TableCell>
                            <TableCell className="text-right font-mono text-xs font-black text-primary">
                              {formatCurrency(t.commissionAmount)}
                            </TableCell>
                            <TableCell>{getStatusBadge(t.status)}</TableCell>
                          </TableRow>
                        ))}
                        {empCommissionTxns.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-sm text-muted-foreground">
                              No commission transactions found for this employee.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
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
