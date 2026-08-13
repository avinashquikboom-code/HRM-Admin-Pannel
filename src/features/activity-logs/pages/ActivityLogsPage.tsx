'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { api } from '@/lib/api';
import SuperAdminHeader from '@/components/SuperAdminHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  RefreshCw,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Code2,
  Copy,
  Check,
  Zap,
  ChevronLeft,
  ChevronRight,
  Webhook,
  SlidersHorizontal,
  X,
  User,
  Shield,
  Smartphone,
  Cpu,
  Eye,
  FileText,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';

export interface ActivityLogItem {
  id: string;
  actorId?: string | null;
  actorName?: string | null;
  actorRole?: string | null;
  source: string;
  action: string;
  entityType?: string | null;
  entityId?: string | null;
  description?: string | null;
  metadata?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  status: string;
  createdAt: string;
}

/* ─── Source Badges ─── */
const sourceConfig: Record<string, { label: string; bg: string; text: string; border: string; icon: any }> = {
  ADMIN_PANEL: { label: 'Admin Panel', bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-500/25', icon: Shield },
  SUPER_ADMIN: { label: 'Super Admin', bg: 'bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-500/25', icon: Shield },
  HR_ADMIN: { label: 'HR Admin', bg: 'bg-teal-500/10', text: 'text-teal-600 dark:text-teal-400', border: 'border-teal-500/25', icon: Shield },
  MOBILE: { label: 'Mobile App', bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-500/25', icon: Smartphone },
  HOPKID_WEBHOOK: { label: 'HopKid Webhook', bg: 'bg-sky-500/10', text: 'text-sky-600 dark:text-sky-400', border: 'border-sky-500/25', icon: Webhook },
  SYSTEM: { label: 'System', bg: 'bg-slate-500/10', text: 'text-slate-600 dark:text-slate-400', border: 'border-slate-500/25', icon: Cpu },
};

/* ─── Status Badges ─── */
const statusConfig: Record<string, { color: string; dot: string }> = {
  SUCCESS: {
    color: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/25 dark:text-emerald-400',
    dot: 'bg-emerald-500',
  },
  FAILED: {
    color: 'bg-rose-500/10 text-rose-700 border-rose-500/25 dark:text-rose-400',
    dot: 'bg-rose-500',
  },
  PENDING: {
    color: 'bg-amber-500/10 text-amber-700 border-amber-500/25 dark:text-amber-400',
    dot: 'bg-amber-500 animate-pulse',
  },
};

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Detail Modal
  const [selectedLog, setSelectedLog] = useState<ActivityLogItem | null>(null);
  const [copiedPayload, setCopiedPayload] = useState(false);

  const fetchActivityLogs = async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        limit,
      };
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (sourceFilter !== 'ALL') params.source = sourceFilter;
      if (roleFilter !== 'ALL') params.role = roleFilter;
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;

      const res = await api.get('/api/admin/activity-logs', { params });
      if (res.data?.success) {
        setLogs(res.data.data || []);
        if (res.data.pagination) {
          setTotalCount(res.data.pagination.total || 0);
          setTotalPages(res.data.pagination.totalPages || 1);
        }
      }
    } catch (err: any) {
      toast.error('Failed to fetch activity logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivityLogs();
  }, [page, limit, sourceFilter, roleFilter, statusFilter, fromDate, toDate]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchActivityLogs();
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSourceFilter('ALL');
    setRoleFilter('ALL');
    setStatusFilter('ALL');
    setFromDate('');
    setToDate('');
    setPage(1);
  };

  // KPI Calculations
  const kpis = useMemo(() => {
    let adminCount = 0;
    let mobileCount = 0;
    let webhookCount = 0;
    let systemCount = 0;

    logs.forEach((log) => {
      const src = log.source?.toUpperCase();
      if (src === 'ADMIN_PANEL' || src === 'SUPER_ADMIN' || src === 'HR_ADMIN') adminCount++;
      else if (src === 'MOBILE') mobileCount++;
      else if (src === 'HOPKID_WEBHOOK') webhookCount++;
      else if (src === 'SYSTEM') systemCount++;
    });

    return {
      total: totalCount,
      admin: adminCount,
      mobile: mobileCount,
      webhook: webhookCount,
      system: systemCount,
    };
  }, [logs, totalCount]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPayload(true);
    toast.success('Log metadata copied to clipboard');
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  const formatJson = (raw?: string | null) => {
    if (!raw) return 'No metadata payload';
    try {
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
      return JSON.stringify(parsed, null, 2);
    } catch {
      return String(raw);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 p-4 lg:p-8 space-y-6">
      <SuperAdminHeader
        title="Central Activity & Audit Logs"
        subtitle="Unified real-time audit timeline across Super Admin, HR Admin, Mobile App, HopKid Webhooks, and System processes."
      />

      {/* KPI Cards */}
      <div className="grid grid-[#12] grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-white/80 dark:bg-zinc-900/80 border-slate-200 dark:border-zinc-800 backdrop-blur-md">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-zinc-400">Total Audit Logs</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-zinc-100 mt-1">{kpis.total}</h3>
            </div>
            <div className="p-3 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-xl">
              <Activity className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-zinc-900/80 border-slate-200 dark:border-zinc-800 backdrop-blur-md">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-zinc-400">Admin Actions</p>
              <h3 className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">{kpis.admin}</h3>
            </div>
            <div className="p-3 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl">
              <Shield className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-zinc-900/80 border-slate-200 dark:border-zinc-800 backdrop-blur-md">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-zinc-400">Mobile Activity</p>
              <h3 className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{kpis.mobile}</h3>
            </div>
            <div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
              <Smartphone className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-zinc-900/80 border-slate-200 dark:border-zinc-800 backdrop-blur-md">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-zinc-400">HopKid Webhooks</p>
              <h3 className="text-2xl font-bold text-sky-600 dark:text-sky-400 mt-1">{kpis.webhook}</h3>
            </div>
            <div className="p-3 bg-sky-500/10 text-sky-600 dark:text-sky-400 rounded-xl">
              <Webhook className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-zinc-900/80 border-slate-200 dark:border-zinc-800 backdrop-blur-md">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-zinc-400">System Events</p>
              <h3 className="text-2xl font-bold text-slate-700 dark:text-zinc-300 mt-1">{kpis.system}</h3>
            </div>
            <div className="p-3 bg-slate-500/10 text-slate-600 dark:text-slate-400 rounded-xl">
              <Cpu className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <Card className="bg-white/80 dark:bg-zinc-900/80 border-slate-200 dark:border-zinc-800 backdrop-blur-md">
        <CardContent className="p-4 space-y-4">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            {/* Search Input */}
            <div className="relative sm:col-span-2">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <Input
                placeholder="Search actor, action, description, ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-slate-50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700"
              />
            </div>

            {/* Source Filter */}
            <Select value={sourceFilter} onValueChange={(val) => { setSourceFilter(val); setPage(1); }}>
              <SelectTrigger className="bg-slate-50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Sources</SelectItem>
                <SelectItem value="ADMIN_PANEL">Admin Panel</SelectItem>
                <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                <SelectItem value="HR_ADMIN">HR Admin</SelectItem>
                <SelectItem value="MOBILE">Mobile App</SelectItem>
                <SelectItem value="HOPKID_WEBHOOK">HopKid Webhook</SelectItem>
                <SelectItem value="SYSTEM">System</SelectItem>
              </SelectContent>
            </Select>

            {/* Role Filter */}
            <Select value={roleFilter} onValueChange={(val) => { setRoleFilter(val); setPage(1); }}>
              <SelectTrigger className="bg-slate-50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Roles</SelectItem>
                <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                <SelectItem value="HR_ADMIN">HR Admin</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="EMPLOYEE">Employee</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setPage(1); }}>
              <SelectTrigger className="bg-slate-50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="SUCCESS">Success</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
              </SelectContent>
            </Select>

            {/* Refresh */}
            <Button
              type="button"
              variant="outline"
              onClick={fetchActivityLogs}
              className="bg-slate-50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </form>

          {/* Date range & Reset */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200 dark:border-zinc-800 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-500">From:</span>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
                  className="px-2 py-1 rounded bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">To:</span>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => { setToDate(e.target.value); setPage(1); }}
                  className="px-2 py-1 rounded bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200"
                />
              </div>
            </div>

            {(searchTerm || sourceFilter !== 'ALL' || roleFilter !== 'ALL' || statusFilter !== 'ALL' || fromDate || toDate) && (
              <Button variant="ghost" size="sm" onClick={handleResetFilters} className="text-slate-500 hover:text-rose-500">
                <X className="w-3.5 h-3.5 mr-1" />
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card className="bg-white/80 dark:bg-zinc-900/80 border-slate-200 dark:border-zinc-800 backdrop-blur-md overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-100/70 dark:bg-zinc-800/50">
              <TableRow>
                <TableHead className="w-[180px]">Date & Time</TableHead>
                <TableHead className="w-[140px]">Source</TableHead>
                <TableHead className="w-[180px]">Actor & Role</TableHead>
                <TableHead className="w-[200px]">Action</TableHead>
                <TableHead className="w-[150px]">Entity</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-[100px] text-center">Status</TableHead>
                <TableHead className="w-[80px] text-right">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-slate-500 dark:text-zinc-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-teal-500" />
                    Fetching activity audit logs...
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-slate-500 dark:text-zinc-400">
                    <Activity className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-zinc-600" />
                    No activity logs match your filter criteria.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => {
                  const srcMeta = sourceConfig[log.source?.toUpperCase()] || sourceConfig.SYSTEM;
                  const SrcIcon = srcMeta.icon;
                  const stMeta = statusConfig[log.status?.toUpperCase()] || statusConfig.SUCCESS;

                  return (
                    <TableRow key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30">
                      {/* Date & Time */}
                      <TableCell className="text-xs font-mono text-slate-600 dark:text-zinc-400 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </TableCell>

                      {/* Source */}
                      <TableCell>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${srcMeta.bg} ${srcMeta.text} ${srcMeta.border}`}>
                          <SrcIcon className="w-3 h-3" />
                          {srcMeta.label}
                        </span>
                      </TableCell>

                      {/* Actor & Role */}
                      <TableCell>
                        <div className="space-y-0.5">
                          <div className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                            {log.actorName || 'System'}
                          </div>
                          {log.actorRole && (
                            <div className="text-[10px] uppercase font-mono text-slate-400 dark:text-zinc-500">
                              {log.actorRole}
                            </div>
                          )}
                        </div>
                      </TableCell>

                      {/* Action */}
                      <TableCell>
                        <span className="font-mono text-xs font-bold text-slate-900 dark:text-zinc-100">
                          {log.action}
                        </span>
                      </TableCell>

                      {/* Entity & ID */}
                      <TableCell className="text-xs text-slate-600 dark:text-zinc-400">
                        {log.entityType ? (
                          <div>
                            <span className="font-medium text-slate-800 dark:text-zinc-300">{log.entityType}</span>
                            {log.entityId && (
                              <span className="block text-[10px] font-mono text-slate-400 truncate max-w-[120px]" title={log.entityId}>
                                #{log.entityId}
                              </span>
                            )}
                          </div>
                        ) : (
                          '—'
                        )}
                      </TableCell>

                      {/* Description */}
                      <TableCell className="text-xs text-slate-600 dark:text-zinc-300 max-w-[280px] truncate" title={log.description || ''}>
                        {log.description || '—'}
                      </TableCell>

                      {/* Status */}
                      <TableCell className="text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${stMeta.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${stMeta.dot}`} />
                          {log.status}
                        </span>
                      </TableCell>

                      {/* Details Modal Trigger */}
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedLog(log)}
                          className="h-7 w-7 p-0 text-slate-400 hover:text-teal-500"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            Showing <span className="font-semibold text-slate-800 dark:text-zinc-200">{logs.length}</span> of{' '}
            <span className="font-semibold text-slate-800 dark:text-zinc-200">{totalCount}</span> log entries
          </div>

          <div className="flex items-center gap-2">
            <Select value={String(limit)} onValueChange={(v) => { setLimit(parseInt(v, 10)); setPage(1); }}>
              <SelectTrigger className="h-8 w-20 bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 / page</SelectItem>
                <SelectItem value="20">20 / page</SelectItem>
                <SelectItem value="50">50 / page</SelectItem>
                <SelectItem value="100">100 / page</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="px-2">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Log Detail Modal */}
      <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent className="max-w-2xl bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-zinc-100">
              <FileText className="w-5 h-5 text-teal-500" />
              Activity Audit Detail
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Immutable system audit record ID: {selectedLog?.id}
            </DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-200 dark:border-zinc-700">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-medium">Source</span>
                  <span className="font-semibold text-slate-800 dark:text-zinc-200">{selectedLog.source}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-medium">Action</span>
                  <span className="font-mono font-bold text-teal-600 dark:text-teal-400">{selectedLog.action}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-medium">Actor</span>
                  <span className="font-semibold text-slate-800 dark:text-zinc-200">{selectedLog.actorName || 'System'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-medium">Role</span>
                  <span className="font-mono text-slate-600 dark:text-zinc-400">{selectedLog.actorRole || 'N/A'}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-slate-500 font-medium">Description:</span>
                <p className="p-2.5 bg-slate-100 dark:bg-zinc-800 rounded-lg text-slate-800 dark:text-zinc-200 font-mono text-xs">
                  {selectedLog.description || 'No description provided'}
                </p>
              </div>

              {/* Metadata / Raw Payload Viewer */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium flex items-center gap-1">
                    <Code2 className="w-3.5 h-3.5 text-teal-500" />
                    Metadata / Raw Payload:
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(formatJson(selectedLog.metadata))}
                    className="h-6 text-[11px] text-slate-500 hover:text-teal-500"
                  >
                    {copiedPayload ? <Check className="w-3 h-3 mr-1 text-emerald-500" /> : <Copy className="w-3 h-3 mr-1" />}
                    {copiedPayload ? 'Copied' : 'Copy Payload'}
                  </Button>
                </div>
                <pre className="p-3 bg-zinc-950 text-emerald-400 font-mono text-[11px] rounded-xl overflow-x-auto max-h-60 border border-zinc-800">
                  {formatJson(selectedLog.metadata)}
                </pre>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedLog(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
