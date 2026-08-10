'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Filter, 
  RefreshCw,
  AlertCircle,
  FileText,
  UserCheck,
  UserX,
  History, ChevronLeft, ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import Modal from '@/components/Modal';

interface CorrectionRequest {
  id: string;
  employeeId: string;
  date?: string;
  attendanceDate?: string;
  dateToCorrect?: string;
  currentStatus: string;
  requestedStatus: string;
  reason: string;
  status: string; // PENDING, APPROVED, REJECTED
  appliedOn: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNote?: string;
  employee?: {
    id: number | string;
    employeeCode: string;
    name: string;
    designation: string;
    officeName: string;
    departmentName: string;
  };
}

export default function AttendanceCorrectionsTab() {
  const [requests, setRequests] = useState<CorrectionRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal review state
  const [selectedRequest, setSelectedRequest] = useState<CorrectionRequest | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchCorrections = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get<{ success: boolean; requests: CorrectionRequest[] }>(
        '/api/hr/attendance/correction-requests',
        { params: { status: statusFilter } }
      );
      if (response.data.success) {
        setRequests(response.data.requests || []);
      }
    } catch (err) {
      console.error('Failed to fetch attendance corrections:', err);
      toast.error('Failed to load attendance correction requests.');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchCorrections();
  }, [fetchCorrections]);
  
  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchTerm]);

  const handleAction = async (status: 'APPROVED' | 'REJECTED') => {
    if (!selectedRequest) return;
    setIsSubmitting(true);
    try {
      const response = await api.patch(
        `/api/hr/attendance/correction-requests/${selectedRequest.id}`,
        {
          status,
          reviewNote: reviewNote.trim() || undefined,
        }
      );
      if (response.data.success) {
        toast.success(`Request ${status.toLowerCase()} successfully.`);
        setSelectedRequest(null);
        setReviewNote('');
        fetchCorrections();
      }
    } catch (err: any) {
      console.error('Review correction error:', err);
      toast.error(err.response?.data?.message || 'Failed to review request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const counts = {
    ALL: requests.length,
    PENDING: requests.filter(r => r.status === 'PENDING').length,
    APPROVED: requests.filter(r => r.status === 'APPROVED').length,
    REJECTED: requests.filter(r => r.status === 'REJECTED').length,
  };

  const filteredRequests = requests.filter(r => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    const name = r.employee?.name || r.employeeId;
    const code = r.employee?.employeeCode || '';
    const reason = r.reason || '';
    return (
      name.toLowerCase().includes(term) ||
      code.toLowerCase().includes(term) ||
      reason.toLowerCase().includes(term)
    );
  });

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / itemsPerPage));
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Filters & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-border bg-surface rounded-sm">
        <div className="flex items-center gap-2 overflow-x-auto">
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-sm text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                statusFilter === st
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-surface-variant text-text-secondary hover:text-text-primary'
              }`}
            >
              {st}
              <span className={`px-1.5 min-w-4 h-4 rounded-full text-[10px] flex items-center justify-center ${
                statusFilter === st ? "bg-white/20 text-white" : "bg-border text-text-secondary"
              }`}>
                {counts[st as keyof typeof counts]}
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
            <input
              type="text"
              placeholder="Search employee, reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-1.5 bg-surface-variant border border-border rounded-sm text-xs font-bold text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 w-full sm:w-64"
            />
          </div>
          <button
            onClick={() => fetchCorrections()}
            className="p-2 border border-border bg-surface hover:bg-surface-variant rounded-sm text-text-secondary hover:text-text-primary transition-all cursor-pointer"
            title="Refresh List"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Requests Table */}
      <div className="border border-border bg-surface rounded-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs font-bold text-text-secondary uppercase tracking-widest flex items-center justify-center gap-2">
            <RefreshCw className="animate-spin text-primary" size={20} />
            Loading correction requests...
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="p-12 text-center">
            <FileText size={32} className="mx-auto text-text-secondary opacity-40 mb-2" />
            <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">
              No attendance correction requests found.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-variant/40 border-b border-border">
                    <th className="px-4 py-3.5 text-[9px] font-black text-text-secondary uppercase tracking-widest">Employee</th>
                    <th className="px-4 py-3.5 text-[9px] font-black text-text-secondary uppercase tracking-widest">Date to Correct</th>
                    <th className="px-4 py-3.5 text-[9px] font-black text-text-secondary uppercase tracking-widest">Current Status</th>
                    <th className="px-4 py-3.5 text-[9px] font-black text-text-secondary uppercase tracking-widest">Requested Status</th>
                    <th className="px-4 py-3.5 text-[9px] font-black text-text-secondary uppercase tracking-widest">Reason</th>
                    <th className="px-4 py-3.5 text-[9px] font-black text-text-secondary uppercase tracking-widest">Status</th>
                    <th className="px-4 py-3.5 text-[9px] font-black text-text-secondary uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {paginatedRequests.map((r) => (
                    <tr key={r.id} className="hover:bg-surface-variant/20 transition-colors">
                      <td className="px-4 py-3.5">
                        <div>
                          <p className="text-xs font-black text-text-primary">{r.employee?.name || r.employeeId}</p>
                          <p className="text-[10px] font-bold text-text-secondary">{r.employee?.employeeCode} • {r.employee?.designation}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-xs font-bold text-text-primary tabular-nums">
                        {(() => {
                          const rawDate = r.date || r.attendanceDate || r.dateToCorrect;
                          if (!rawDate) return 'N/A';
                          const parsedDate = new Date(rawDate);
                          return !isNaN(parsedDate.getTime())
                            ? parsedDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                            : 'N/A';
                        })()}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 rounded-sm text-[10px] font-black uppercase bg-surface-variant text-text-secondary border border-border">
                          {r.currentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 rounded-sm text-[10px] font-black uppercase bg-primary/10 text-primary border border-primary/20">
                          {r.requestedStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs font-semibold text-text-secondary max-w-[200px] truncate" title={r.reason}>
                        {r.reason}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2 py-0.5 rounded-sm text-[10px] font-black uppercase ${
                          r.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                          r.status === 'REJECTED' ? 'bg-error/10 text-error border border-error/20' :
                          'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        {r.status === 'PENDING' ? (
                          <button
                            onClick={() => {
                              setSelectedRequest(r);
                              setReviewNote('');
                            }}
                            className="px-3 py-1 bg-primary hover:bg-primary-dark text-white rounded-sm text-xs font-bold transition-all cursor-pointer shadow-sm"
                          >
                            Review
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedRequest(r);
                              setReviewNote(r.reviewNote || '');
                            }}
                            className="px-3 py-1 bg-surface-variant text-text-secondary hover:text-text-primary rounded-sm text-xs font-bold transition-all cursor-pointer"
                          >
                            Details
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-surface">
                <span className="text-xs text-text-secondary font-medium">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredRequests.length)} of {filteredRequests.length}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1 border border-border bg-surface hover:bg-surface-variant rounded-sm text-text-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-xs font-bold text-text-primary min-w-[3rem] text-center">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1 border border-border bg-surface hover:bg-surface-variant rounded-sm text-text-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Review Modal */}
      <Modal
        isOpen={selectedRequest !== null}
        onClose={() => setSelectedRequest(null)}
        title={selectedRequest?.status === 'PENDING' ? 'Review Correction Request' : 'Correction Request Audit Details'}
      >
        {selectedRequest && (
          <div className="space-y-4">
            <div className="p-4 bg-surface-variant/40 border border-border rounded-sm space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-sm font-black text-text-primary">{selectedRequest.employee?.name || selectedRequest.employeeId}</h4>
                  <p className="text-xs font-semibold text-text-secondary">{selectedRequest.employee?.employeeCode} • {selectedRequest.employee?.designation}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-sm text-[10px] font-black uppercase ${
                  selectedRequest.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-500' :
                  selectedRequest.status === 'REJECTED' ? 'bg-error/10 text-error' :
                  'bg-amber-500/10 text-amber-500'
                }`}>
                  {selectedRequest.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-border/50 font-bold">
                <div>
                  <span className="text-text-secondary">Target Date:</span>
                  <p className="text-text-primary">
                    {(() => {
                      const rawDate = selectedRequest.date || selectedRequest.attendanceDate || selectedRequest.dateToCorrect;
                      if (!rawDate) return 'N/A';
                      const parsedDate = new Date(rawDate);
                      return !isNaN(parsedDate.getTime())
                        ? parsedDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                        : 'N/A';
                    })()}
                  </p>
                </div>
                <div>
                  <span className="text-text-secondary">Requested Status:</span>
                  <p className="text-primary">{selectedRequest.requestedStatus}</p>
                </div>
              </div>

              <div className="pt-2">
                <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Reason Provided</span>
                <p className="text-xs font-semibold text-text-primary bg-surface p-2.5 rounded-sm border border-border mt-1">
                  {selectedRequest.reason}
                </p>
              </div>
            </div>

            {selectedRequest.status === 'PENDING' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-text-primary mb-1">
                    Review Note / Remarks
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter review note (optional)..."
                    value={reviewNote}
                    onChange={(e) => setReviewNote(e.target.value)}
                    className="w-full p-2.5 bg-surface-variant border border-border rounded-sm text-xs font-bold text-text-primary outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <button
                    onClick={() => handleAction('REJECTED')}
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-error/10 hover:bg-error/20 text-error border border-error/30 rounded-sm text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <UserX size={14} />
                    Reject Request
                  </button>
                  <button
                    onClick={() => handleAction('APPROVED')}
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-sm text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    <UserCheck size={14} />
                    Approve & Update Attendance
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-surface-variant/20 rounded-sm border border-border text-xs space-y-1">
                <p className="font-bold text-text-primary">Reviewed By: {selectedRequest.reviewedBy || 'HR'}</p>
                <p className="text-text-secondary">Reviewed At: {selectedRequest.reviewedAt ? new Date(selectedRequest.reviewedAt).toLocaleString() : '—'}</p>
                <p className="text-text-secondary">Note: {selectedRequest.reviewNote || 'No review note provided.'}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
