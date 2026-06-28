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
  Eye
} from 'lucide-react';
import { 
  getCommissionTransactions,
  approveCommissionTransaction,
  rejectCommissionTransaction,
  type CommissionTransaction 
} from '@/services/commissionService';
import { fetchOffices } from '@/services/officeService';
import { fetchEmployees } from '@/services/employeeService';
import { toast } from 'sonner';

export default function CommissionTransactions() {
  const [transactions, setTransactions] = useState<CommissionTransaction[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStore, setSelectedStore] = useState<string>('');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<CommissionTransaction | null>(null);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadTransactions();
    loadDropdownData();
  }, [selectedStore, selectedEmployee, selectedStatus]);

  const loadTransactions = async () => {
    setIsLoading(true);
    try {
      const params: any = {};
      if (selectedStore) params.storeId = selectedStore;
      if (selectedEmployee) params.employeeId = selectedEmployee;
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
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
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
    </div>
  );
}
