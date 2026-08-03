'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Globe,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Calendar as CalendarIcon,
  RefreshCw,
  UserCheck,
  FileText,
  Filter,
} from 'lucide-react';
import {
  fetchHrRemoteWorkRequests,
  reviewHrRemoteWorkRequest,
  RemoteWorkRequestRecord,
} from '@/services/remoteWorkService';

export default function RemoteWorkPage() {
  const [requests, setRequests] = useState<RemoteWorkRequestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'active' | 'history'>('pending');
  const [searchTerm, setSearchTerm] = useState('');

  // Reject / Revoke Note Modal State
  const [selectedRequest, setSelectedRequest] = useState<RemoteWorkRequestRecord | null>(null);
  const [actionType, setActionType] = useState<'REJECTED' | 'REVOKED' | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchHrRemoteWorkRequests('ALL');
      setRequests(data);
    } catch (err: any) {
      console.error('Failed to load remote work requests:', err);
      setError(err.message || 'Failed to fetch remote work requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const pendingRequests = useMemo(
    () => requests.filter((r) => r.status === 'PENDING'),
    [requests]
  );

  const activeApprovedRequests = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return requests.filter((r) => {
      if (r.status !== 'APPROVED') return false;
      const fromStr = new Date(r.fromDate).toISOString().split('T')[0];
      const toStr = new Date(r.toDate).toISOString().split('T')[0];
      return todayStr >= fromStr && todayStr <= toStr;
    });
  }, [requests]);

  const historyRequests = useMemo(
    () => requests.filter((r) => r.status !== 'PENDING'),
    [requests]
  );

  const handleApprove = async (id: string) => {
    try {
      setSubmitting(true);
      await reviewHrRemoteWorkRequest(id, 'APPROVED');
      await loadData();
    } catch (err: any) {
      alert(`Error approving request: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmAction = async () => {
    if (!selectedRequest || !actionType) return;
    try {
      setSubmitting(true);
      await reviewHrRemoteWorkRequest(selectedRequest.id, actionType, reviewNote);
      setSelectedRequest(null);
      setActionType(null);
      setReviewNote('');
      await loadData();
    } catch (err: any) {
      alert(`Error updating request: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredItems = useMemo(() => {
    let list: RemoteWorkRequestRecord[] = [];
    if (activeTab === 'pending') list = pendingRequests;
    else if (activeTab === 'active') list = requests.filter((r) => r.status === 'APPROVED');
    else list = historyRequests;

    if (!searchTerm.trim()) return list;

    const term = searchTerm.toLowerCase();
    return list.filter((r) => {
      const empName = `${r.employee?.firstName || ''} ${r.employee?.lastName || ''}`.toLowerCase();
      const code = (r.employee?.employeeCode || '').toLowerCase();
      const reason = (r.reason || '').toLowerCase();
      return empName.includes(term) || code.includes(term) || reason.includes(term);
    });
  }, [activeTab, pendingRequests, requests, historyRequests, searchTerm]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Remote Work Requests</h1>
              <p className="text-slate-500 text-sm">
                Manage employee remote work permissions & geofence bypass approvals
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-amber-50/60 border border-amber-200/60 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">
              Pending Approval
            </p>
            <p className="text-3xl font-extrabold text-amber-900 mt-1">
              {pendingRequests.length}
            </p>
          </div>
          <div className="p-3 bg-amber-100 text-amber-700 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-emerald-50/60 border border-emerald-200/60 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              Active Today (Remote)
            </p>
            <p className="text-3xl font-extrabold text-emerald-900 mt-1">
              {activeApprovedRequests.length}
            </p>
          </div>
          <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Total Decisions
            </p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">
              {historyRequests.length}
            </p>
          </div>
          <div className="p-3 bg-slate-200 text-slate-700 rounded-xl">
            <FileText className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'pending'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Pending Requests
            {pendingRequests.length > 0 && (
              <span className="bg-amber-400 text-slate-900 text-xs px-2 py-0.5 rounded-full font-bold">
                {pendingRequests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'active'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Approved Requests
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'history'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All History
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search employee or reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
            <p className="text-sm font-medium">Loading remote work requests...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-rose-500 bg-rose-50/50">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
            <p className="font-semibold">{error}</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Globe className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="font-medium text-slate-600">No requests found</p>
            <p className="text-xs text-slate-400 mt-1">
              {activeTab === 'pending'
                ? 'There are no pending remote work requests to review.'
                : 'No matching records match your filter criteria.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                  <th className="py-3.5 px-4">Employee</th>
                  <th className="py-3.5 px-4">Date Range</th>
                  <th className="py-3.5 px-4">Reason</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Applied On</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredItems.map((req) => {
                  const fromStr = new Date(req.fromDate).toISOString().split('T')[0];
                  const toStr = new Date(req.toDate).toISOString().split('T')[0];
                  const appliedStr = new Date(req.appliedOn).toLocaleDateString();

                  return (
                    <tr key={req.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-semibold text-slate-900">
                          {req.employee
                            ? `${req.employee.firstName} ${req.employee.lastName}`
                            : `Employee #${req.employeeId}`}
                        </div>
                        <div className="text-xs text-slate-400">
                          {req.employee?.employeeCode || `ID: ${req.employeeId}`}{' '}
                          {req.employee?.office?.name ? `• ${req.employee.office.name}` : ''}
                        </div>
                      </td>

                      <td className="py-4 px-4 font-medium text-slate-800">
                        <div className="flex items-center gap-1.5">
                          <CalendarIcon className="w-4 h-4 text-indigo-500" />
                          <span>
                            {fromStr} <span className="text-slate-400">→</span> {toStr}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-slate-600 max-w-xs truncate">
                        {req.reason || <span className="italic text-slate-300">No reason provided</span>}
                      </td>

                      <td className="py-4 px-4">
                        {req.status === 'PENDING' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                            <Clock className="w-3.5 h-3.5" /> PENDING
                          </span>
                        )}
                        {req.status === 'APPROVED' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" /> APPROVED
                          </span>
                        )}
                        {req.status === 'REJECTED' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
                            <XCircle className="w-3.5 h-3.5" /> REJECTED
                          </span>
                        )}
                        {req.status === 'REVOKED' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-200 text-slate-800 border border-slate-300">
                            <AlertTriangle className="w-3.5 h-3.5" /> REVOKED
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-slate-500 text-xs">{appliedStr}</td>

                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {req.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleApprove(req.id)}
                                disabled={submitting}
                                className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-sm"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedRequest(req);
                                  setActionType('REJECTED');
                                  setReviewNote('');
                                }}
                                disabled={submitting}
                                className="px-3 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors shadow-sm"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {req.status === 'APPROVED' && (
                            <button
                              onClick={() => {
                                setSelectedRequest(req);
                                setActionType('REVOKED');
                                setReviewNote('');
                              }}
                              disabled={submitting}
                              className="px-3 py-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors shadow-sm"
                            >
                              Revoke
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Decision Note Modal */}
      {selectedRequest && actionType && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              {actionType === 'REJECTED' ? 'Reject Remote Work Request' : 'Revoke Remote Work Approval'}
            </h3>
            <p className="text-sm text-slate-500">
              Employee:{' '}
              <span className="font-semibold text-slate-800">
                {selectedRequest.employee
                  ? `${selectedRequest.employee.firstName} ${selectedRequest.employee.lastName}`
                  : selectedRequest.employeeId}
              </span>
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Note / Reason (Optional):
              </label>
              <textarea
                rows={3}
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                placeholder="Enter feedback for employee..."
                className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setSelectedRequest(null);
                  setActionType(null);
                }}
                className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                disabled={submitting}
                className={`px-4 py-2 text-sm font-semibold text-white rounded-xl transition-colors shadow-sm ${
                  actionType === 'REJECTED'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-amber-600 hover:bg-amber-700'
                }`}
              >
                {submitting ? 'Processing...' : `Confirm ${actionType}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
