'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { sendNotificationToEmployee } from '@/services/notificationService';
import { 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Receipt, 
  IndianRupee, 
  Filter, 
  Eye, 
  Check, 
  X, 
  AlertCircle,
  Car,
  Utensils,
  ShoppingBag,
  Stethoscope,
  Fuel,
  FileText,
  User,
  Building2,
  Calendar,
  Loader2,
  RefreshCw
} from 'lucide-react';
import Modal from '@/components/Modal';
import TableSkeleton from '@/components/TableSkeleton';
import PaginationFooter from '@/components/PaginationFooter';
import { cn } from '@/utils/cn';

export interface ExpenseClaim {
  id: number;
  employeeId: string; // Employee code
  employeeName: string;
  department: string;
  category: string;
  amount: number;
  description: string;
  date: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedOn: string;
  reviewedBy?: string | null;
  reviewNote?: string | null;
  hasReceipt: boolean;
  receiptUrl?: string | null;
  receiptPdfUrl?: string | null;
}

interface ExpenseClaimsTabProps {
  onDataLoaded?: (expenses: ExpenseClaim[]) => void;
}

const CATEGORY_ICONS: Record<string, any> = {
  Travel: Car,
  Food: Utensils,
  Supplies: ShoppingBag,
  Medical: Stethoscope,
  Fuel: Fuel,
  General: FileText,
};

export default function ExpenseClaimsTab({ onDataLoaded }: ExpenseClaimsTabProps) {
  const [expenses, setExpenses] = useState<ExpenseClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Review Modal state
  const [selectedExpense, setSelectedExpense] = useState<ExpenseClaim | null>(null);
  const [reviewAction, setReviewAction] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [reviewNote, setReviewNote] = useState('');
  const [reviewerName, setReviewerName] = useState('HR Admin');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // View Details Modal state
  const [detailExpense, setDetailExpense] = useState<ExpenseClaim | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const onDataLoadedRef = useRef(onDataLoaded);
  useEffect(() => {
    onDataLoadedRef.current = onDataLoaded;
  }, [onDataLoaded]);

  const fetchExpenses = useCallback(async () => {
    // Only show full skeleton on initial load when expenses list is empty
    if (expenses.length === 0) {
      setLoading(true);
    }
    try {
      const res = await api.get<{ success: boolean; expenses: ExpenseClaim[] }>('/api/hr/expenses');
      if (res.data.success) {
        const list = res.data.expenses || [];
        setExpenses(list);
        if (onDataLoadedRef.current) {
          onDataLoadedRef.current(list);
        }
      }
    } catch (err) {
      console.error('Failed to fetch expense claims:', err);
      toast.error('Failed to load expense claims.');
    } finally {
      setLoading(false);
    }
  }, [expenses.length]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const handleOpenReview = (claim: ExpenseClaim, action: 'APPROVE' | 'REJECT') => {
    setSelectedExpense(claim);
    setReviewAction(action);
    setReviewNote(action === 'APPROVE' ? 'Expense claim verified and approved for reimbursement.' : 'Expense claim rejected.');
    setIsReviewModalOpen(true);
  };

  const handleOpenDetails = (claim: ExpenseClaim) => {
    setDetailExpense(claim);
    setIsDetailModalOpen(true);
  };

  const handleDownloadReceipt = (claim?: ExpenseClaim | string | null) => {
    let url: string | null = null;
    if (typeof claim === 'string') {
      url = claim;
    } else if (claim && typeof claim === 'object') {
      url = claim.receiptPdfUrl || `/api/hr/expenses/${claim.id}/receipt/pdf`;
    }
    if (!url) {
      toast.error('Receipt PDF not available for this claim.');
      return;
    }
    let fullUrl = url;
    if (!url.startsWith('http')) {
      const base = api.defaults.baseURL || '';
      fullUrl = base ? `${base}${url.startsWith('/') ? '' : '/'}${url}` : `/api${url.startsWith('/') ? '' : '/'}${url}`;
    }
    window.open(fullUrl, '_blank');
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExpense) return;

    setIsSubmitting(true);
    const endpoint = reviewAction === 'APPROVE'
      ? `/api/hr/expenses/${selectedExpense.id}/approve`
      : `/api/hr/expenses/${selectedExpense.id}/reject`;

    try {
      const res = await api.put<{ success: boolean; message: string; expense: any; receiptPdfUrl?: string }>(endpoint, {
        reviewerName: reviewerName || 'HR Admin',
        reviewNote,
        status: reviewAction === 'APPROVE' ? 'APPROVED' : 'REJECTED',
      });

      if (res.data.success) {
        const generatedReceipt = res.data.receiptPdfUrl || res.data.expense?.receiptPdfUrl;

        toast.success(
          reviewAction === 'APPROVE'
            ? `Expense claim ₹${selectedExpense.amount.toLocaleString('en-IN')} approved successfully!${generatedReceipt ? ' Receipt PDF generated.' : ''}`
            : `Expense claim rejected.`
        );

        if (generatedReceipt) {
          handleDownloadReceipt(generatedReceipt);
        }

        // Send push notification to employee
        try {
          const empNumId = parseInt(selectedExpense.employeeId.replace(/\D/g, ''), 10) || 1;
          await sendNotificationToEmployee({
            employeeId: empNumId,
            title: reviewAction === 'APPROVE' ? '🧾 Expense Reimbursement Approved' : '❌ Expense Claim Rejected',
            body: reviewAction === 'APPROVE'
              ? `Your expense claim of ₹${selectedExpense.amount.toLocaleString('en-IN')} for ${selectedExpense.category} has been approved.${generatedReceipt ? ' [Download Receipt]' : ''}`
              : `Your expense claim of ₹${selectedExpense.amount.toLocaleString('en-IN')} for ${selectedExpense.category} was rejected. Note: ${reviewNote}`,
            category: 'expense',
            actionType: 'expense_reviewed',
          });
        } catch (notifErr) {
          console.warn('[ExpenseClaimsTab] Employee notification failed:', notifErr);
        }

        setIsReviewModalOpen(false);
        setSelectedExpense(null);
        await fetchExpenses();
      }
    } catch (err: any) {
      console.error('Expense review error:', err);
      toast.error(err.response?.data?.message || 'Failed to submit expense review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, categoryFilter]);

  // Metrics
  const pendingClaims = expenses.filter(e => e.status === 'PENDING');
  const approvedClaims = expenses.filter(e => e.status === 'APPROVED');
  const rejectedClaims = expenses.filter(e => e.status === 'REJECTED');

  const pendingTotalAmount = pendingClaims.reduce((sum, e) => sum + (e.amount || 0), 0);
  const approvedTotalAmount = approvedClaims.reduce((sum, e) => sum + (e.amount || 0), 0);

  // Filtered List
  const filteredExpenses = expenses.filter(claim => {
    const matchesStatus = statusFilter === 'ALL' || claim.status === statusFilter;
    const matchesCategory = categoryFilter === 'ALL' || claim.category.toLowerCase() === categoryFilter.toLowerCase();
    const query = searchTerm.toLowerCase().trim();
    const matchesSearch = !query || 
      claim.employeeName.toLowerCase().includes(query) ||
      claim.employeeId.toLowerCase().includes(query) ||
      claim.department.toLowerCase().includes(query) ||
      claim.category.toLowerCase().includes(query) ||
      claim.description.toLowerCase().includes(query);

    return matchesStatus && matchesCategory && matchesSearch;
  });

  const totalPages = Math.ceil(filteredExpenses.length / pageSize) || 1;
  const paginatedExpenses = filteredExpenses.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const categories = Array.from(new Set(expenses.map(e => e.category))).filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Upper Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => setStatusFilter('ALL')}
          className={cn(
            "p-5 rounded-2xl border transition-all cursor-pointer shadow-md backdrop-blur-xl relative overflow-hidden",
            statusFilter === 'ALL'
              ? "bg-primary/10 border-primary/50 ring-2 ring-primary/30"
              : "bg-surface/80 dark:bg-slate-900/80 border-border/60 dark:border-white/10 hover:border-primary/30"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-primary">All Expense Records</span>
            <div className="p-2 rounded-xl bg-primary/15 text-primary border border-primary/20">
              <Receipt size={18} />
            </div>
          </div>
          <p className="text-2xl font-black text-text-primary mt-2 font-mono">
            {expenses.length} Total
          </p>
          <p className="text-xs font-bold text-text-secondary mt-1">
            Complete Claims Audit History
          </p>
        </div>

        <div 
          onClick={() => setStatusFilter('PENDING')}
          className={cn(
            "p-5 rounded-2xl border transition-all cursor-pointer shadow-md backdrop-blur-xl relative overflow-hidden",
            statusFilter === 'PENDING'
              ? "bg-amber-500/10 border-amber-500/50 dark:border-amber-400/50 ring-2 ring-amber-500/30"
              : "bg-surface/80 dark:bg-slate-900/80 border-border/60 dark:border-white/10 hover:border-amber-500/30"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-500">Requested Claims</span>
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-500 border border-amber-500/20">
              <Clock size={18} className="animate-pulse" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-500 mt-2 font-mono">
            ₹{pendingTotalAmount.toLocaleString('en-IN')}
          </p>
          <p className="text-xs font-bold text-text-secondary mt-1">
            {pendingClaims.length} Claim(s) Awaiting Review
          </p>
        </div>

        <div 
          onClick={() => setStatusFilter('APPROVED')}
          className={cn(
            "p-5 rounded-2xl border transition-all cursor-pointer shadow-md backdrop-blur-xl relative overflow-hidden",
            statusFilter === 'APPROVED'
              ? "bg-emerald-500/10 border-emerald-500/50 dark:border-emerald-400/50 ring-2 ring-emerald-500/30"
              : "bg-surface/80 dark:bg-slate-900/80 border-border/60 dark:border-white/10 hover:border-emerald-500/30"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-500">Reimbursed History</span>
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-500 border border-emerald-500/20">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-500 mt-2 font-mono">
            ₹{approvedTotalAmount.toLocaleString('en-IN')}
          </p>
          <p className="text-xs font-bold text-text-secondary mt-1">
            {approvedClaims.length} Approved Expense Claim(s)
          </p>
        </div>

        <div 
          onClick={() => setStatusFilter('REJECTED')}
          className={cn(
            "p-5 rounded-2xl border transition-all cursor-pointer shadow-md backdrop-blur-xl relative overflow-hidden",
            statusFilter === 'REJECTED'
              ? "bg-rose-500/10 border-rose-500/50 dark:border-rose-400/50 ring-2 ring-rose-500/30"
              : "bg-surface/80 dark:bg-slate-900/80 border-border/60 dark:border-white/10 hover:border-rose-500/30"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-500">Declined History</span>
            <div className="p-2 rounded-xl bg-rose-500/15 text-rose-500 border border-rose-500/20">
              <XCircle size={18} />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-500 mt-2 font-mono">
            {rejectedClaims.length}
          </p>
          <p className="text-xs font-bold text-text-secondary mt-1">
            Declined Expense Claims
          </p>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-surface/80 dark:bg-slate-900/80 border border-border/60 dark:border-white/10 backdrop-blur-xl shadow-lg">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {[
            { id: 'ALL', label: 'All Expenses', count: expenses.length, color: 'primary' },
            { id: 'PENDING', label: 'Requested Claims', count: pendingClaims.length, color: 'amber' },
            { id: 'APPROVED', label: 'Reimbursed History', count: approvedClaims.length, color: 'emerald' },
            { id: 'REJECTED', label: 'Declined History', count: rejectedClaims.length, color: 'rose' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-2 border",
                statusFilter === tab.id
                  ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                  : "bg-surface-variant/40 dark:bg-slate-800/40 text-text-secondary border-border/40 hover:text-text-primary hover:bg-surface-variant/80"
              )}
            >
              <span>{tab.label}</span>
              <span className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-mono font-bold",
                statusFilter === tab.id ? "bg-white/20 text-white" : "bg-border/40 text-text-secondary"
              )}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Category filter */}
        <div className="flex items-center gap-3">
          <div className="relative flex-grow sm:flex-grow-0 min-w-[200px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary w-4 h-4" />
            <input
              type="text"
              placeholder="Search employee, category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-border/60 dark:border-white/10 bg-surface/60 dark:bg-slate-950/60 text-text-primary text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
              >
                <X size={13} />
              </button>
            )}
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-border/60 dark:border-white/10 bg-surface/60 dark:bg-slate-950/60 text-text-primary text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="ALL">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <button
            onClick={fetchExpenses}
            title="Refresh expense list"
            className="p-2.5 rounded-xl border border-border/60 dark:border-white/10 bg-surface/60 dark:bg-slate-950/60 text-text-secondary hover:text-text-primary hover:bg-surface transition-all"
          >
            <RefreshCw size={15} className={loading ? "animate-spin text-primary" : ""} />
          </button>
        </div>
      </div>

      {/* Main Expense Claims Table */}
      <div className="rounded-2xl border border-border/60 dark:border-white/10 bg-surface/90 dark:bg-slate-900/90 backdrop-blur-2xl overflow-hidden shadow-xl">
        {loading && expenses.length === 0 ? (
          <div className="p-6">
            <TableSkeleton rows={6} columns={7} />
          </div>
        ) : filteredExpenses.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto border border-primary/20">
              <Receipt size={32} />
            </div>
            <h4 className="text-base font-black text-text-primary">No Expense Claims Found</h4>
            <p className="text-xs text-text-secondary max-w-sm mx-auto font-medium">
              {statusFilter === 'PENDING'
                ? 'There are currently no requested expense claims awaiting review.'
                : 'No expense records matched your active filter criteria.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/50 dark:border-white/10 bg-surface-variant/30 dark:bg-slate-950/40 text-[10.5px] font-black text-text-secondary uppercase tracking-wider">
                  <th className="py-4 px-6">Employee</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Claim Amount</th>
                  <th className="py-4 px-6">Expense Date</th>
                  <th className="py-4 px-6">Receipt</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 dark:divide-white/5 text-xs font-medium">
                {paginatedExpenses.map((claim) => {
                  const IconComp = CATEGORY_ICONS[claim.category] || FileText;

                  return (
                    <tr 
                      key={claim.id}
                      className="hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors group"
                    >
                      {/* Employee Info */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary font-black flex items-center justify-center border border-primary/20 text-xs shrink-0 shadow-inner">
                            {claim.employeeName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-text-primary group-hover:text-primary transition-colors">
                              {claim.employeeName}
                            </p>
                            <div className="flex items-center gap-2 text-[10px] text-text-secondary mt-0.5">
                              <span className="font-mono text-primary/80 font-bold">{claim.employeeId}</span>
                              <span>•</span>
                              <span>{claim.department}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-6">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-variant/50 dark:bg-slate-800/50 border border-border/50 dark:border-white/10 text-xs font-bold text-text-primary">
                          <IconComp size={13} className="text-primary" />
                          <span>{claim.category}</span>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="py-4 px-6">
                        <div className="font-mono font-black text-sm text-text-primary">
                          ₹{claim.amount.toLocaleString('en-IN')}
                        </div>
                        {claim.description && (
                          <p className="text-[10.5px] text-text-secondary truncate max-w-[200px]" title={claim.description}>
                            {claim.description}
                          </p>
                        )}
                      </td>

                      {/* Dates */}
                      <td className="py-4 px-6">
                        <div className="text-text-primary font-bold">
                          {new Date(claim.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                        <p className="text-[10px] text-text-secondary">
                          Submitted {new Date(claim.submittedOn).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                        </p>
                      </td>

                      {/* Receipt Status */}
                      <td className="py-4 px-6">
                        {claim.hasReceipt ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10.5px] font-bold border border-emerald-500/20">
                            <Receipt size={12} />
                            <span>Attached</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-500/10 text-slate-500 text-[10.5px] font-medium border border-slate-500/20">
                            <span>No Receipt</span>
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        {claim.status === 'PENDING' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[10.5px] font-black border border-amber-500/30 uppercase tracking-wider animate-pulse">
                            <Clock size={12} />
                            <span>Requested</span>
                          </span>
                        )}
                        {claim.status === 'APPROVED' && (
                          <div>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10.5px] font-black border border-emerald-500/30 uppercase tracking-wider">
                              <CheckCircle2 size={12} />
                              <span>Reimbursed</span>
                            </span>
                            {claim.reviewedBy && (
                              <p className="text-[9.5px] text-text-secondary mt-1">
                                Approved by {claim.reviewedBy}
                              </p>
                            )}
                          </div>
                        )}
                        {claim.status === 'REJECTED' && (
                          <div>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 text-[10.5px] font-black border border-rose-500/30 uppercase tracking-wider">
                              <XCircle size={12} />
                              <span>Declined</span>
                            </span>
                            {claim.reviewedBy && (
                              <p className="text-[9.5px] text-text-secondary mt-1">
                                Rejected by {claim.reviewedBy}
                              </p>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {claim.status === 'PENDING' ? (
                            <>
                              <button
                                onClick={() => handleOpenReview(claim, 'APPROVE')}
                                className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1 shadow-md transition-all active:scale-95"
                              >
                                <Check size={13} />
                                <span>Approve</span>
                              </button>
                              <button
                                onClick={() => handleOpenReview(claim, 'REJECT')}
                                className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/30 font-bold text-xs flex items-center gap-1 transition-all active:scale-95"
                              >
                                <X size={13} />
                                <span>Reject</span>
                              </button>
                            </>
                          ) : (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleDownloadReceipt(claim)}
                                className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500 text-emerald-600 dark:text-emerald-400 hover:text-white font-bold text-xs border border-emerald-500/30 flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                                title="Download Approval Receipt PDF"
                              >
                                <FileText size={13} />
                                <span>Receipt PDF</span>
                              </button>
                              <button
                                onClick={() => handleOpenDetails(claim)}
                                className="px-3 py-1.5 rounded-xl bg-surface-variant/60 hover:bg-surface-variant text-text-primary font-bold text-xs border border-border/50 dark:border-white/10 flex items-center gap-1.5 transition-all"
                              >
                                <Eye size={13} className="text-primary" />
                                <span>Audit Details</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination Footer */}
            <PaginationFooter
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredExpenses.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              itemLabel="expense claims"
            />
          </div>
        )}
      </div>

      {/* Review Modal */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title={reviewAction === 'APPROVE' ? 'Approve Expense Claim' : 'Reject Expense Claim'}
      >
        {selectedExpense && (
          <form onSubmit={handleSubmitReview} className="space-y-5 p-2">
            {/* Claim Summary Box */}
            <div className="p-4 rounded-xl bg-surface-variant/40 dark:bg-slate-950/40 border border-border/50 dark:border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-secondary font-bold">Employee</span>
                <span className="text-xs text-text-primary font-black">{selectedExpense.employeeName} ({selectedExpense.employeeId})</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-secondary font-bold">Category & Date</span>
                <span className="text-xs text-text-primary font-bold">{selectedExpense.category} • {new Date(selectedExpense.date).toLocaleDateString('en-IN')}</span>
              </div>
              <div className="flex items-center justify-between border-t border-border/40 pt-2">
                <span className="text-xs text-text-secondary font-bold">Reimbursement Amount</span>
                <span className="text-lg font-black font-mono text-primary">₹{selectedExpense.amount.toLocaleString('en-IN')}</span>
              </div>
              {selectedExpense.description && (
                <div className="pt-1 text-xs text-text-secondary italic">
                  "{selectedExpense.description}"
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-text-primary uppercase tracking-wider">
                Reviewer Name
              </label>
              <input
                type="text"
                required
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border/60 dark:border-white/10 bg-surface dark:bg-slate-950 text-text-primary text-xs font-medium focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-text-primary uppercase tracking-wider">
                Review Note / Remark
              </label>
              <textarea
                rows={3}
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                placeholder="Enter remarks or approval notes for employee..."
                className="w-full px-4 py-2.5 rounded-xl border border-border/60 dark:border-white/10 bg-surface dark:bg-slate-950 text-text-primary text-xs font-medium focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/40">
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(false)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-text-secondary hover:bg-surface-variant/60 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-white shadow-lg flex items-center gap-2 transition-all active:scale-95",
                  reviewAction === 'APPROVE'
                    ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20"
                    : "bg-rose-600 hover:bg-rose-700 shadow-rose-600/20"
                )}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    {reviewAction === 'APPROVE' ? <Check size={14} /> : <X size={14} />}
                    <span>Confirm {reviewAction === 'APPROVE' ? 'Approval' : 'Rejection'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* View Audit Details Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Expense Claim Details & Audit Log"
      >
        {detailExpense && (
          <div className="space-y-4 p-2">
            <div className="p-4 rounded-2xl bg-surface-variant/40 dark:bg-slate-950/40 border border-border/50 dark:border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-black text-text-primary">{detailExpense.employeeName}</h4>
                  <p className="text-xs text-text-secondary">{detailExpense.employeeId} • {detailExpense.department}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black font-mono text-primary">₹{detailExpense.amount.toLocaleString('en-IN')}</p>
                  <span className="text-[10.5px] font-bold text-text-secondary">{detailExpense.category}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/40 text-xs">
                <div>
                  <span className="text-text-secondary block text-[10px] font-bold uppercase">Expense Date</span>
                  <span className="font-bold text-text-primary">{new Date(detailExpense.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                </div>
                <div>
                  <span className="text-text-secondary block text-[10px] font-bold uppercase">Submission Date</span>
                  <span className="font-bold text-text-primary">{new Date(detailExpense.submittedOn).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                </div>
              </div>

              {detailExpense.description && (
                <div className="pt-2 border-t border-border/40">
                  <span className="text-text-secondary block text-[10px] font-bold uppercase">Purpose / Description</span>
                  <p className="text-xs text-text-primary font-medium mt-0.5">{detailExpense.description}</p>
                </div>
              )}

              {detailExpense.receiptUrl && (
                <div className="pt-2 border-t border-border/40">
                  <span className="text-text-secondary block text-[10px] font-bold uppercase mb-1">Attached Receipt Photo</span>
                  <div className="rounded-xl overflow-hidden border border-border/60 bg-black/20 p-1 max-h-56 flex items-center justify-center">
                    <img 
                      src={detailExpense.receiptUrl} 
                      alt="Expense Receipt" 
                      className="max-h-52 object-contain rounded-lg shadow-sm"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-surface-variant/20 dark:bg-slate-900/40 border border-border/50 dark:border-white/10 space-y-2">
              <span className="text-xs font-black text-text-primary uppercase tracking-wider block">Audit Trail</span>
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-secondary font-bold">Status</span>
                <span className={cn(
                  "font-black uppercase text-[10.5px] px-2.5 py-0.5 rounded-full",
                  detailExpense.status === 'APPROVED' ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30" : "bg-rose-500/20 text-rose-500 border border-rose-500/30"
                )}>
                  {detailExpense.status}
                </span>
              </div>
              {detailExpense.reviewedBy && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-secondary font-bold">Reviewed By</span>
                  <span className="font-bold text-text-primary">{detailExpense.reviewedBy}</span>
                </div>
              )}
              {detailExpense.reviewNote && (
                <div className="pt-1 text-xs text-text-secondary">
                  <span className="font-bold block text-[10px] uppercase">Reviewer Note:</span>
                  <p className="font-medium text-text-primary italic mt-0.5">"{detailExpense.reviewNote}"</p>
                </div>
              )}
              {detailExpense.receiptPdfUrl && (
                <div className="pt-2 border-t border-border/40 flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Approval Receipt PDF Available</span>
                  <button
                    onClick={() => handleDownloadReceipt(detailExpense.receiptPdfUrl)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all"
                  >
                    <FileText size={14} />
                    <span>Download Receipt PDF</span>
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => handleDownloadReceipt(detailExpense)}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <FileText size={14} />
                <span>Download Official Receipt PDF</span>
              </button>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-xs uppercase tracking-wider"
              >
                Close Audit Details
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
