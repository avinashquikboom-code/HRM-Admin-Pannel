'use client';

import React, { useEffect, useState, useMemo } from 'react';
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
  IndianRupee,
  Building2,
  ChevronLeft,
  ChevronRight,
  Webhook,
  TrendingUp,
  AlertCircle,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

/* ─── helpers ─── */
const statusConfig: Record<string, { color: string; dot: string }> = {
  SUCCESS: {
    color: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/25 dark:text-emerald-400',
    dot: 'bg-emerald-500',
  },
  FAILED: {
    color: 'bg-rose-500/10 text-rose-700 border-rose-500/25 dark:text-rose-400',
    dot: 'bg-rose-500',
  },
  PROCESSING: {
    color: 'bg-amber-500/10 text-amber-700 border-amber-500/25 dark:text-amber-400',
    dot: 'bg-amber-500 animate-pulse',
  },
};

const getStatusCfg = (s: string) =>
  statusConfig[s?.toUpperCase()] ?? statusConfig['PROCESSING'];

function initials(name: string) {
  if (!name || name === 'N/A') return '?';
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

/* ─── component ─── */
export default function WebhookLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [storeFilter, setStoreFilter] = useState('ALL');
  const [eventFilter, setEventFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedPayload, setSelectedPayload] = useState<any>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  useEffect(() => { setCurrentPage(1); }, [statusFilter, storeFilter, eventFilter, searchQuery]);

  useEffect(() => {
    fetchStats();
    fetchLogs();
  }, [statusFilter]);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/webhook/stats');
      if (res.ok) setStats((await res.json()).data);
    } catch (e) { console.error(e); }
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const url = statusFilter === 'ALL'
        ? '/api/webhook/logs'
        : `/api/webhook/logs?status=${statusFilter}`;
      const res = await fetch(url);
      if (res.ok) setLogs((await res.json()).data || []);
    } catch (_e) {
      toast.error('Failed to load webhook logs');
    } finally {
      setLoading(false);
    }
  };

  const storeOptions = useMemo(() => {
    const names = logs.map((l) => l.storeName).filter((n): n is string => !!n && n !== 'N/A');
    return ['ALL', ...Array.from(new Set(names)).sort()];
  }, [logs]);

  const eventOptions = useMemo(() => {
    const types = logs.map((l) => l.eventType).filter((t): t is string => !!t);
    return ['ALL', ...Array.from(new Set(types)).sort()];
  }, [logs]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (storeFilter !== 'ALL' && log.storeName !== storeFilter) return false;
      if (eventFilter !== 'ALL' && log.eventType !== eventFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          String(log.billId || '').toLowerCase().includes(q) ||
          String(log.customerName || '').toLowerCase().includes(q) ||
          String(log.employeeName || '').toLowerCase().includes(q) ||
          String(log.storeName || '').toLowerCase().includes(q) ||
          String(log.eventType || '').toLowerCase().includes(q) ||
          String(log.amount || '').includes(q)
        );
      }
      return true;
    });
  }, [logs, storeFilter, eventFilter, searchQuery]);

  const totalPages = Math.ceil(filteredLogs.length / pageSize) || 1;
  const paginatedLogs = useMemo(
    () => filteredLogs.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [filteredLogs, currentPage]
  );

  const activeFilterCount = [
    storeFilter !== 'ALL',
    eventFilter !== 'ALL',
    searchQuery.trim() !== '',
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    setStoreFilter('ALL');
    setEventFilter('ALL');
    setSearchQuery('');
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Copied!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatPayload = (raw: any) => {
    if (!raw) return '{}';
    if (typeof raw === 'string') {
      try { return JSON.stringify(JSON.parse(raw), null, 2); } catch { return raw; }
    }
    return JSON.stringify(raw, null, 2);
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10 px-1">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-indigo-500/5 via-background to-violet-500/5 p-6 rounded-2xl border shadow-xs">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
            <Webhook className="h-5 w-5 text-indigo-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-foreground">HopKid Webhook Logs</h1>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 dark:text-emerald-400">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                Live
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Real-time POS sales events &amp; automated commission stream
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => { fetchStats(); fetchLogs(); toast.info('Refreshing…'); }}
          disabled={loading}
          className="flex items-center gap-2 shadow-xs shrink-0"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-primary' : 'text-muted-foreground'}`} />
          Refresh
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-background shadow-xs hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Total Events</p>
              <p className="text-2xl font-extrabold text-foreground tracking-tight mt-0.5">{(stats?.total ?? 0).toLocaleString()}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Logged sales events</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
              <Activity className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-background shadow-xs hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Successful</p>
              <p className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400 tracking-tight mt-0.5">{(stats?.success ?? 0).toLocaleString()}</p>
              <p className="text-[11px] text-emerald-600/80 font-medium mt-0.5">{stats?.successRate ?? '—'} success rate</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-rose-500/20 bg-gradient-to-br from-rose-500/5 to-background shadow-xs hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">Failed</p>
              <p className="text-2xl font-extrabold text-rose-700 dark:text-rose-400 tracking-tight mt-0.5">{(stats?.failed ?? 0).toLocaleString()}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Needs attention</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
              <AlertCircle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-violet-500/20 bg-gradient-to-br from-violet-500/5 to-background shadow-xs hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider">Total Volume</p>
              <p className="text-2xl font-extrabold text-violet-700 dark:text-violet-400 tracking-tight mt-0.5 truncate">₹{(stats?.totalAmount ?? 0).toLocaleString('en-IN')}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Aggregated sales</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-600 dark:text-violet-400 shrink-0">
              <TrendingUp className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="border shadow-sm rounded-2xl overflow-hidden">

        {/* Filter Bar */}
        <div className="p-4 border-b bg-muted/20 space-y-3">
          <div className="flex flex-wrap items-center gap-2.5">

            {/* Status tabs */}
            <div className="flex items-center gap-0.5 p-1 bg-background rounded-xl border shadow-xs">
              {['ALL', 'SUCCESS', 'FAILED', 'PROCESSING'].map((s) => {
                const active = statusFilter === s;
                const cfg = s !== 'ALL' ? getStatusCfg(s) : null;
                return (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                      active
                        ? 'bg-foreground text-background shadow-xs'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                    }`}
                  >
                    {cfg && (
                      <span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-background' : cfg.dot.replace(' animate-pulse', '')}`} />
                    )}
                    {s}
                    {s === 'ALL' && (
                      <span className="ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] bg-muted font-mono">{logs.length}</span>
                    )}
                    {s === 'SUCCESS' && (stats?.success ?? 0) > 0 && (
                      <span className="ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-mono">{stats.success}</span>
                    )}
                    {s === 'FAILED' && (stats?.failed ?? 0) > 0 && (
                      <span className="ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] bg-rose-500/15 text-rose-700 dark:text-rose-300 font-mono">{stats.failed}</span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="h-5 w-px bg-border hidden sm:block" />

            {/* Store filter */}
            <Select value={storeFilter} onValueChange={setStoreFilter}>
              <SelectTrigger className="h-9 w-44 text-xs rounded-lg border-muted bg-background">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Building2 className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                  <SelectValue placeholder="All Stores" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {storeOptions.map((s) => (
                  <SelectItem key={s} value={s} className="text-xs">
                    {s === 'ALL' ? 'All Stores' : s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Event Type filter */}
            <Select value={eventFilter} onValueChange={setEventFilter}>
              <SelectTrigger className="h-9 w-48 text-xs rounded-lg border-muted bg-background">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Zap className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                  <SelectValue placeholder="All Event Types" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {eventOptions.map((e) => (
                  <SelectItem key={e} value={e} className="text-xs font-mono">
                    {e === 'ALL' ? 'All Event Types' : e}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Search */}
            <div className="relative flex-1 min-w-[180px] max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search invoice, customer, employee…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs rounded-lg border-muted bg-background focus-visible:ring-1"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Clear filters */}
            {activeFilterCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-rose-500/10 text-rose-600 border border-rose-500/20 hover:bg-rose-500/20 transition-colors"
              >
                <SlidersHorizontal className="h-3 w-3" />
                Clear {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''}
              </button>
            )}
          </div>

          <p className="text-[11px] text-muted-foreground font-medium">
            Showing{' '}
            <span className="font-bold text-foreground">{filteredLogs.length}</span> of{' '}
            <span className="font-bold text-foreground">{logs.length}</span> webhook events
          </p>
        </div>

        {/* Table */}
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30 border-b">
                  <TableHead className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground py-3 pl-5">Event Type</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground py-3">Bill / Invoice ID</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground py-3">Customer</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground py-3">Employee</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground py-3">Store / Branch</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground py-3 text-right">Amount</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground py-3 text-center">Status</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground py-3">Received At</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground py-3 text-center pr-5">Payload</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {paginatedLogs.length > 0 ? (
                  paginatedLogs.map((log) => {
                    const cfg = getStatusCfg(log.status || 'PROCESSING');
                    const empInit = initials(log.employeeName);
                    const custInit = initials(log.customerName);

                    return (
                      <TableRow key={log.id} className="group hover:bg-muted/25 transition-colors border-b border-border/40">

                        {/* Event Type */}
                        <TableCell className="pl-5 py-3.5">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-mono text-[11px] font-semibold border border-indigo-500/15 whitespace-nowrap">
                            <Zap className="h-2.5 w-2.5 shrink-0" />
                            {log.eventType || 'invoice.created'}
                          </span>
                        </TableCell>

                        {/* Bill ID */}
                        <TableCell className="py-3.5">
                          {log.billId ? (
                            <div className="inline-flex items-center gap-1.5">
                              <code className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-muted border text-foreground tracking-wide">
                                {log.billId}
                              </code>
                              <button
                                onClick={() => copyToClipboard(log.billId, log.id)}
                                className="opacity-0 group-hover:opacity-100 p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                                title="Copy Bill ID"
                              >
                                {copiedId === log.id
                                  ? <Check className="h-3 w-3 text-emerald-500" />
                                  : <Copy className="h-3 w-3" />}
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground/40 font-mono">—</span>
                          )}
                        </TableCell>

                        {/* Customer */}
                        <TableCell className="py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-[10px] font-bold text-sky-700 dark:text-sky-300 shrink-0">
                              {custInit}
                            </div>
                            <span className="text-xs font-medium text-foreground max-w-[100px] truncate" title={log.customerName || ''}>
                              {log.customerName || <span className="text-muted-foreground/40">N/A</span>}
                            </span>
                          </div>
                        </TableCell>

                        {/* Employee */}
                        <TableCell className="py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-[10px] font-bold text-violet-700 dark:text-violet-300 shrink-0">
                              {empInit}
                            </div>
                            <span className="text-xs font-semibold text-foreground max-w-[100px] truncate" title={log.employeeName || ''}>
                              {log.employeeName && log.employeeName !== 'N/A'
                                ? log.employeeName
                                : <span className="text-muted-foreground/40 font-normal">N/A</span>}
                            </span>
                          </div>
                        </TableCell>

                        {/* Store */}
                        <TableCell className="py-3.5">
                          {log.storeName && log.storeName !== 'N/A' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-500/8 text-blue-700 dark:text-blue-300 text-[11px] font-medium border border-blue-500/15">
                              <Building2 className="h-3 w-3 shrink-0" />
                              <span className="max-w-[90px] truncate" title={log.storeName}>{log.storeName}</span>
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground/40 font-mono">—</span>
                          )}
                        </TableCell>

                        {/* Amount */}
                        <TableCell className="text-right py-3.5">
                          <span className="font-bold text-sm text-foreground tabular-nums whitespace-nowrap">
                            ₹{(log.amount || 0).toLocaleString('en-IN')}
                          </span>
                        </TableCell>

                        {/* Status */}
                        <TableCell className="text-center py-3.5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border whitespace-nowrap ${cfg.color}`}>
                            <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${cfg.dot}`} />
                            {log.status || 'PROCESSING'}
                          </span>
                        </TableCell>

                        {/* Received At */}
                        <TableCell className="py-3.5">
                          <div className="text-[11px] leading-tight">
                            <div className="font-semibold text-foreground whitespace-nowrap">
                              {new Date(log.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </div>
                            <div className="text-muted-foreground tabular-nums">
                              {new Date(log.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </div>
                          </div>
                        </TableCell>

                        {/* Action */}
                        <TableCell className="text-center pr-5 py-3.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedPayload(log)}
                            className="h-7 w-7 p-0 rounded-lg opacity-40 group-hover:opacity-100 hover:bg-indigo-500/10 hover:text-indigo-600 transition-all"
                            title="View Payload"
                          >
                            <Code2 className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-16 text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="h-14 w-14 rounded-2xl bg-muted/60 border flex items-center justify-center">
                          <Code2 className="h-7 w-7 opacity-30" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">
                            {loading ? 'Fetching webhook logs…' : 'No events match your filters'}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {loading ? 'Please wait' : 'Try adjusting your search or filter settings'}
                          </p>
                        </div>
                        {activeFilterCount > 0 && !loading && (
                          <button onClick={clearAllFilters} className="text-xs text-primary underline underline-offset-2">
                            Clear all filters
                          </button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {filteredLogs.length > pageSize && (
            <div className="px-5 py-3.5 border-t flex flex-col sm:flex-row items-center justify-between gap-3 bg-muted/10">
              <p className="text-xs text-muted-foreground">
                Showing{' '}
                <span className="font-bold text-foreground">{Math.min((currentPage - 1) * pageSize + 1, filteredLogs.length)}</span>
                {' '}–{' '}
                <span className="font-bold text-foreground">{Math.min(currentPage * pageSize, filteredLogs.length)}</span>
                {' '}of{' '}
                <span className="font-bold text-foreground">{filteredLogs.length}</span> events
              </p>
              <div className="flex items-center gap-1.5">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="h-8 w-8 p-0">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                  .reduce<(number | string)[]>((acc, p, i, arr) => {
                    if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('…');
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    typeof p === 'string' ? (
                      <span key={`ellipsis-${i}`} className="px-1.5 text-muted-foreground text-xs">…</span>
                    ) : (
                      <Button
                        key={p}
                        variant={currentPage === p ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(p)}
                        className="h-8 w-8 p-0 text-xs"
                      >
                        {p}
                      </Button>
                    )
                  )}
                <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="h-8 w-8 p-0">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payload Inspector Modal */}
      <Dialog open={!!selectedPayload} onOpenChange={(open) => !open && setSelectedPayload(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <div className="h-7 w-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <Code2 className="h-4 w-4 text-indigo-500" />
              </div>
              Webhook Payload Inspector
            </DialogTitle>
            <DialogDescription className="text-xs">
              Raw JSON received for Bill ID:{' '}
              <code className="font-mono text-foreground font-bold bg-muted px-1.5 py-0.5 rounded">
                {selectedPayload?.billId || 'N/A'}
              </code>
            </DialogDescription>
          </DialogHeader>

          {selectedPayload && (
            <div className="space-y-4 my-1">
              {/* Meta grid */}
              <div className="grid grid-cols-3 gap-2 text-xs p-4 bg-muted/30 rounded-xl border">
                {[
                  { label: 'Event', value: selectedPayload.eventType, mono: true, cls: '' },
                  { label: 'Sale Amount', value: `₹${(selectedPayload.amount || 0).toLocaleString('en-IN')}`, mono: false, cls: 'text-emerald-600 dark:text-emerald-400' },
                  { label: 'Status', value: selectedPayload.status, mono: false, cls: '' },
                  { label: 'Employee', value: (selectedPayload.employeeName && selectedPayload.employeeName !== 'N/A') ? selectedPayload.employeeName : 'N/A', mono: false, cls: '' },
                  { label: 'Customer', value: selectedPayload.customerName || 'N/A', mono: false, cls: '' },
                  { label: 'Store / Branch', value: (selectedPayload.storeName && selectedPayload.storeName !== 'N/A') ? selectedPayload.storeName : 'N/A', mono: false, cls: 'text-blue-600 dark:text-blue-400' },
                ].map(({ label, value, mono, cls }) => (
                  <div key={label} className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">{label}</span>
                    <span className={`font-semibold truncate block text-foreground ${mono ? 'font-mono' : ''} ${cls}`}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Error banner */}
              {selectedPayload.errorMessage && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 rounded-xl text-xs flex gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block mb-0.5">Processing Error</span>
                    <span>{selectedPayload.errorMessage}</span>
                  </div>
                </div>
              )}

              {/* JSON viewer */}
              <div className="relative">
                <pre className="p-4 bg-slate-950 text-slate-100 rounded-xl text-[11px] font-mono max-h-72 overflow-y-auto leading-relaxed border border-slate-800 shadow-inner">
                  {formatPayload(selectedPayload.payload)}
                </pre>
                <button
                  onClick={() => copyToClipboard(formatPayload(selectedPayload.payload), 'modal-json')}
                  className="absolute top-3 right-3 px-2.5 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md border border-slate-700 flex items-center gap-1.5 transition-colors"
                >
                  {copiedId === 'modal-json'
                    ? <><Check className="h-3 w-3 text-emerald-400" /> Copied!</>
                    : <><Copy className="h-3 w-3" /> Copy JSON</>}
                </button>
              </div>
            </div>
          )}

          <DialogFooter showCloseButton />
        </DialogContent>
      </Dialog>
    </div>
  );
}
