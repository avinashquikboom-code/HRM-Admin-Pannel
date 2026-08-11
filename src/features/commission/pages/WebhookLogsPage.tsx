'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { api } from '@/lib/api';
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
  Hash,
  User,
  UserCheck,
  Calendar,
  CalendarDays,
  ShieldCheck,
  ShieldX,
  Timer,
  Braces,
  LayoutList,
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

/* ─── PayloadModal ─── */
interface PayloadModalProps {
  log: any;
  onClose: () => void;
  copiedId: string | null;
  onCopy: (text: string, id: string) => void;
  formatPayload: (raw: any) => string;
  getStatusCfg: (s: string) => { color: string; dot: string };
}

function PayloadModal({ log, onClose, copiedId, onCopy, formatPayload, getStatusCfg }: PayloadModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'raw'>('overview');

  if (!log) return null;

  const cfg = getStatusCfg(log.status || 'PROCESSING');
  const statusIcon =
    log.status === 'SUCCESS' ? <ShieldCheck className="h-4 w-4" /> :
    log.status === 'FAILED'  ? <ShieldX className="h-4 w-4" /> :
                               <Timer className="h-4 w-4" />;

  const statChips = [
    {
      label: 'Sale Amount',
      value: `₹${(log.amount || 0).toLocaleString('en-IN')}`,
      icon: <IndianRupee className="h-4 w-4" />,
      color: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-400',
    },
    {
      label: 'Event',
      value: log.eventType || '—',
      icon: <Zap className="h-4 w-4" />,
      color: 'bg-indigo-500/10 text-indigo-700 border-indigo-500/20 dark:text-indigo-400',
    },
    {
      label: 'Received',
      value: new Date(log.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      icon: <Calendar className="h-4 w-4" />,
      color: 'bg-sky-500/10 text-sky-700 border-sky-500/20 dark:text-sky-400',
    },
  ];

  const overviewFields = [
    { icon: <Hash className="h-3.5 w-3.5" />, label: 'Bill / Invoice ID', value: log.billId || '—', mono: true, copyId: 'modal-bill', copyText: log.billId },
    { icon: <User className="h-3.5 w-3.5" />, label: 'Customer', value: log.customerName || '—', mono: false },
    { icon: <UserCheck className="h-3.5 w-3.5" />, label: 'Employee', value: (log.employeeName && log.employeeName !== 'N/A') ? log.employeeName : '—', mono: false },
    { icon: <Building2 className="h-3.5 w-3.5" />, label: 'Store / Branch', value: (log.storeName && log.storeName !== 'N/A') ? log.storeName : '—', mono: false },
    { icon: <IndianRupee className="h-3.5 w-3.5" />, label: 'Sale Amount', value: `₹${(log.amount || 0).toLocaleString('en-IN')}`, mono: false, green: true },
    { icon: <Zap className="h-3.5 w-3.5" />, label: 'Event Type', value: log.eventType || '—', mono: true },
  ];

  return (
    <Dialog open={!!log} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl p-0 overflow-hidden gap-0 rounded-2xl border-0 shadow-2xl">

        {/* Dark header band */}
        <div className="bg-slate-950 px-6 pt-6 pb-5 relative">
          {/* Close region */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                <Braces className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold">Webhook Payload</p>
                <p className="text-white font-bold text-base leading-tight mt-0.5">
                  {log.billId ? (
                    <span className="font-mono">{log.billId}</span>
                  ) : (
                    <span className="text-slate-400">No Bill ID</span>
                  )}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors mt-0.5"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Status badge + stat chips */}
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border ${cfg.color}`}>
              {statusIcon}
              {log.status || 'PROCESSING'}
            </span>
            {statChips.map((chip) => (
              <span
                key={chip.label}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${chip.color}`}
              >
                {chip.icon}
                <span className="hidden sm:inline text-[10px] opacity-70">{chip.label}:</span>
                <span className="font-mono">{chip.value}</span>
              </span>
            ))}
          </div>

          {/* Tab bar */}
          <div className="flex items-center gap-1 mt-5 border-b border-slate-800 -mb-px">
            {[
              { id: 'overview' as const, label: 'Overview', icon: <LayoutList className="h-3.5 w-3.5" /> },
              { id: 'raw' as const, label: 'Raw JSON', icon: <Braces className="h-3.5 w-3.5" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2 text-[12px] font-semibold border-b-2 transition-all ${
                  activeTab === tab.id
                    ? 'border-indigo-400 text-indigo-300'
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="bg-background">

          {/* Overview tab */}
          {activeTab === 'overview' && (
            <div className="p-5 space-y-2.5">
              {/* Error banner */}
              {log.errorMessage && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 rounded-xl text-xs flex gap-2 mb-1">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block mb-0.5">Processing Error</span>
                    <span>{log.errorMessage}</span>
                  </div>
                </div>
              )}

              {overviewFields.map((field) => (
                <div
                  key={field.label}
                  className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl bg-muted/40 border border-border/60 hover:bg-muted/60 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-8 w-8 rounded-lg bg-background border flex items-center justify-center text-muted-foreground shrink-0">
                      {field.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                        {field.label}
                      </p>
                      <p className={`text-sm font-semibold truncate ${field.mono ? 'font-mono' : ''} ${field.green ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'}`}>
                        {field.value}
                      </p>
                    </div>
                  </div>
                  {field.copyText && (
                    <button
                      onClick={() => onCopy(field.copyText!, field.copyId!)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all shrink-0"
                      title="Copy"
                    >
                      {copiedId === field.copyId
                        ? <Check className="h-3.5 w-3.5 text-emerald-500" />
                        : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  )}
                </div>
              ))}

              <div className="pt-1">
                <p className="text-[10px] text-muted-foreground text-center">
                  Received{' '}
                  <span className="font-semibold text-foreground">
                    {new Date(log.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'medium' })}
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* Raw JSON tab */}
          {activeTab === 'raw' && (
            <div className="relative">
              {/* Toolbar */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-rose-500/70" />
                  <span className="h-3 w-3 rounded-full bg-amber-500/70" />
                  <span className="h-3 w-3 rounded-full bg-emerald-500/70" />
                  <span className="text-[11px] text-slate-500 ml-2 font-mono">webhook.payload.json</span>
                </div>
                <button
                  onClick={() => onCopy(formatPayload(log.payload), 'modal-json')}
                  className={`flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold rounded-md border transition-all ${
                    copiedId === 'modal-json'
                      ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {copiedId === 'modal-json'
                    ? <><Check className="h-3 w-3" /> Copied!</>
                    : <><Copy className="h-3 w-3" /> Copy</>}
                </button>
              </div>
              <pre className="p-5 bg-slate-950 text-slate-200 text-[11px] font-mono max-h-80 overflow-y-auto leading-relaxed scrollbar-thin scrollbar-track-slate-900 scrollbar-thumb-slate-700">
                {formatPayload(log.payload)}
              </pre>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ─── component ─── */
export default function WebhookLogsPage() {

  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [storeFilter, setStoreFilter] = useState('ALL');
  const [eventFilter, setEventFilter] = useState('ALL');
  const [monthFilter, setMonthFilter] = useState('ALL');
  const [dayFilter, setDayFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedPayload, setSelectedPayload] = useState<any>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  useEffect(() => { setCurrentPage(1); }, [statusFilter, storeFilter, eventFilter, monthFilter, dayFilter, searchQuery]);

  useEffect(() => {
    fetchStats();
    fetchLogs();
  }, [statusFilter]);

  const fetchStats = async () => {
    try {
      const res = await api.get('/api/webhook/stats', { params: { _t: Date.now() } });
      if (res.data?.data) setStats(res.data.data);
    } catch (e) { console.error(e); }
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params: any = { _t: Date.now() };
      if (statusFilter !== 'ALL') params.status = statusFilter;
      const res = await api.get('/api/webhook/logs', { params });
      if (res.data?.data) setLogs(res.data.data || []);
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

  // Month options derived from log timestamps — sorted newest first
  const monthOptions = useMemo(() => {
    const keys = logs
      .map((l) => {
        const d = new Date(l.createdAt);
        return isNaN(d.getTime()) ? null : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      })
      .filter((k): k is string => !!k);
    const unique = Array.from(new Set(keys)).sort().reverse(); // newest first
    return ['ALL', ...unique];
  }, [logs]);

  const formatMonthLabel = (key: string) => {
    if (key === 'ALL') return 'All Months';
    const [year, month] = key.split('-');
    return new Date(Number(year), Number(month) - 1, 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' });
  };

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (storeFilter !== 'ALL' && log.storeName !== storeFilter) return false;
      if (eventFilter !== 'ALL' && log.eventType !== eventFilter) return false;
      if (monthFilter !== 'ALL') {
        const d = new Date(log.createdAt);
        const key = isNaN(d.getTime())
          ? ''
          : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (key !== monthFilter) return false;
      }
      if (dayFilter !== 'ALL') {
        const d = new Date(log.createdAt || log.date);
        if (!isNaN(d.getTime())) {
          const dayIndex = d.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
          if (dayFilter === 'WEEKDAY' && (dayIndex === 0 || dayIndex === 6)) return false;
          if (dayFilter === 'WEEKEND' && (dayIndex !== 0 && dayIndex !== 6)) return false;
          const dayMap: Record<string, number> = {
            SUN: 0,
            MON: 1,
            TUE: 2,
            WED: 3,
            THU: 4,
            FRI: 5,
            SAT: 6,
          };
          if (dayMap[dayFilter] !== undefined && dayIndex !== dayMap[dayFilter]) return false;
        }
      }
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
  }, [logs, storeFilter, eventFilter, monthFilter, dayFilter, searchQuery]);

  const totalPages = Math.ceil(filteredLogs.length / pageSize) || 1;
  const paginatedLogs = useMemo(
    () => filteredLogs.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [filteredLogs, currentPage]
  );

  const activeFilterCount = [
    storeFilter !== 'ALL',
    eventFilter !== 'ALL',
    monthFilter !== 'ALL',
    dayFilter !== 'ALL',
    searchQuery.trim() !== '',
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    setStoreFilter('ALL');
    setEventFilter('ALL');
    setMonthFilter('ALL');
    setDayFilter('ALL');
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
          onClick={async () => {
            await Promise.all([fetchStats(), fetchLogs()]);
            toast.success('Webhook logs refreshed');
          }}
          disabled={loading}
          className="flex items-center gap-2 shadow-xs shrink-0 cursor-pointer"
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
        <div className="border-b bg-background/95 backdrop-blur-md p-4 space-y-3">

          {/* Row 1: Status Pills & Clear Filters Action */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Status segment group */}
            <div className="flex items-center rounded-xl border border-border/80 bg-muted/40 p-1 gap-1 flex-wrap">
              {[
                { key: 'ALL',        label: 'All Events', dot: null,            count: logs.length,         countCls: 'bg-foreground/10 text-foreground' },
                { key: 'SUCCESS',    label: 'Success',    dot: 'bg-emerald-500', count: stats?.success ?? 0, countCls: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' },
                { key: 'FAILED',     label: 'Failed',     dot: 'bg-rose-500',    count: stats?.failed  ?? 0, countCls: 'bg-rose-500/15 text-rose-700 dark:text-rose-300' },
                { key: 'PROCESSING', label: 'Processing', dot: 'bg-amber-500',   count: null,               countCls: '' },
              ].map(({ key, label, dot, count, countCls }) => {
                const active = statusFilter === key;
                return (
                  <button
                    key={key}
                    onClick={() => setStatusFilter(key)}
                    className={`relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                      active
                        ? 'bg-background text-foreground shadow-xs border border-border/80 font-bold'
                        : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                    }`}
                  >
                    {dot && (
                      <span className={`h-2 w-2 rounded-full ${active ? dot : dot + ' opacity-60'}`} />
                    )}
                    <span>{label}</span>
                    {count !== null && count > 0 && (
                      <span className={`px-2 py-0.5 rounded-full text-[10.5px] font-mono font-bold tabular-nums ${active ? countCls : 'bg-muted text-muted-foreground'}`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Clear all pill */}
            {activeFilterCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-1.5 px-3 py-1.5 h-8 rounded-lg text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-all whitespace-nowrap cursor-pointer shrink-0 ml-auto"
              >
                <X className="h-3.5 w-3.5" />
                Clear Filters ({activeFilterCount})
              </button>
            )}
          </div>

          {/* Row 2: Dropdowns & Search Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 items-center">
            {/* Store dropdown */}
            <Select value={storeFilter} onValueChange={setStoreFilter}>
              <SelectTrigger
                className={`h-9 text-xs rounded-xl border gap-2 transition-all w-full ${
                  storeFilter !== 'ALL'
                    ? 'border-blue-500/40 bg-blue-500/10 text-blue-700 dark:text-blue-300 font-semibold'
                    : 'border-border bg-background text-muted-foreground'
                }`}
              >
                <Building2 className={`h-3.5 w-3.5 shrink-0 ${storeFilter !== 'ALL' ? 'text-blue-500' : ''}`} />
                <SelectValue placeholder="All Stores" />
              </SelectTrigger>
              <SelectContent className="text-xs">
                {storeOptions.map((s) => (
                  <SelectItem key={s} value={s} className="text-xs">
                    {s === 'ALL' ? 'All Stores' : s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Event type dropdown */}
            <Select value={eventFilter} onValueChange={setEventFilter}>
              <SelectTrigger
                className={`h-9 text-xs rounded-xl border gap-2 transition-all w-full ${
                  eventFilter !== 'ALL'
                    ? 'border-indigo-500/40 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-semibold'
                    : 'border-border bg-background text-muted-foreground'
                }`}
              >
                <Zap className={`h-3.5 w-3.5 shrink-0 ${eventFilter !== 'ALL' ? 'text-indigo-500' : ''}`} />
                <SelectValue placeholder="All Event Types" />
              </SelectTrigger>
              <SelectContent className="text-xs">
                {eventOptions.map((e) => (
                  <SelectItem key={e} value={e} className="text-xs font-mono">
                    {e === 'ALL' ? 'All Event Types' : e}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Month dropdown */}
            <Select value={monthFilter} onValueChange={setMonthFilter}>
              <SelectTrigger
                className={`h-9 text-xs rounded-xl border gap-2 transition-all w-full ${
                  monthFilter !== 'ALL'
                    ? 'border-violet-500/40 bg-violet-500/10 text-violet-700 dark:text-violet-300 font-semibold'
                    : 'border-border bg-background text-muted-foreground'
                }`}
              >
                <CalendarDays className={`h-3.5 w-3.5 shrink-0 ${monthFilter !== 'ALL' ? 'text-violet-500' : ''}`} />
                <SelectValue placeholder="All Months" />
              </SelectTrigger>
              <SelectContent className="text-xs">
                {monthOptions.map((m) => (
                  <SelectItem key={m} value={m} className="text-xs">
                    {formatMonthLabel(m)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Weekday dropdown */}
            <Select value={dayFilter} onValueChange={setDayFilter}>
              <SelectTrigger
                className={`h-9 text-xs rounded-xl border gap-2 transition-all w-full ${
                  dayFilter !== 'ALL'
                    ? 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-semibold'
                    : 'border-border bg-background text-muted-foreground'
                }`}
              >
                <Calendar className={`h-3.5 w-3.5 shrink-0 ${dayFilter !== 'ALL' ? 'text-amber-500' : ''}`} />
                <SelectValue placeholder="All Weekdays" />
              </SelectTrigger>
              <SelectContent className="text-xs">
                <SelectItem value="ALL">All Weekdays</SelectItem>
                <SelectItem value="WEEKDAY">Mon - Fri (Weekdays)</SelectItem>
                <SelectItem value="WEEKEND">Sat - Sun (Weekends)</SelectItem>
                <SelectItem value="MON">Monday</SelectItem>
                <SelectItem value="TUE">Tuesday</SelectItem>
                <SelectItem value="WED">Wednesday</SelectItem>
                <SelectItem value="THU">Thursday</SelectItem>
                <SelectItem value="FRI">Friday</SelectItem>
                <SelectItem value="SAT">Saturday</SelectItem>
                <SelectItem value="SUN">Sunday</SelectItem>
              </SelectContent>
            </Select>

            {/* Search Input */}
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search invoice, employee..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`pl-9 h-9 text-xs rounded-xl transition-all ${
                  searchQuery
                    ? 'border-primary/40 bg-primary/5 ring-1 ring-primary/20'
                    : 'border-border bg-background'
                } focus-visible:ring-1 focus-visible:ring-primary/30`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Row 2 — Results summary ribbon */}
          <div className="px-4 py-2 bg-muted/20 border-t border-border/40 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] text-muted-foreground">
                Showing{' '}
                <span className="font-bold text-foreground tabular-nums">{filteredLogs.length}</span>
                {' '}of{' '}
                <span className="font-bold text-foreground tabular-nums">{logs.length}</span>
                {' '}events
              </span>

              {/* Active filter chips */}
              {storeFilter !== 'ALL' && (
                <span className="inline-flex items-center gap-1 pl-2 pr-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
                  <Building2 className="h-2.5 w-2.5" />
                  {storeFilter}
                  <button onClick={() => setStoreFilter('ALL')} className="ml-0.5 hover:text-blue-900 dark:hover:text-blue-100">
                    <X className="h-2.5 w-2.5" />
                  </button>
                </span>
              )}
              {eventFilter !== 'ALL' && (
                <span className="inline-flex items-center gap-1 pl-2 pr-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20 font-mono">
                  <Zap className="h-2.5 w-2.5" />
                  {eventFilter}
                  <button onClick={() => setEventFilter('ALL')} className="ml-0.5 hover:text-indigo-900 dark:hover:text-indigo-100">
                    <X className="h-2.5 w-2.5" />
                  </button>
                </span>
              )}
              {monthFilter !== 'ALL' && (
                <span className="inline-flex items-center gap-1 pl-2 pr-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-violet-500/10 text-violet-700 dark:text-violet-300 border border-violet-500/20">
                  <CalendarDays className="h-2.5 w-2.5" />
                  {formatMonthLabel(monthFilter)}
                  <button onClick={() => setMonthFilter('ALL')} className="ml-0.5 hover:text-violet-900 dark:hover:text-violet-100 cursor-pointer">
                    <X className="h-2.5 w-2.5" />
                  </button>
                </span>
              )}
              {dayFilter !== 'ALL' && (
                <span className="inline-flex items-center gap-1 pl-2 pr-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                  <Calendar className="h-2.5 w-2.5" />
                  {dayFilter === 'WEEKDAY' ? 'Mon-Fri' : dayFilter === 'WEEKEND' ? 'Sat-Sun' : dayFilter}
                  <button onClick={() => setDayFilter('ALL')} className="ml-0.5 hover:text-amber-900 dark:hover:text-amber-100 cursor-pointer">
                    <X className="h-2.5 w-2.5" />
                  </button>
                </span>
              )}
              {searchQuery.trim() && (
                <span className="inline-flex items-center gap-1 pl-2 pr-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
                  <Search className="h-2.5 w-2.5" />
                  "{searchQuery.trim().slice(0, 20)}{searchQuery.trim().length > 20 ? '…' : ''}"
                  <button onClick={() => setSearchQuery('')} className="ml-0.5 hover:opacity-70">
                    <X className="h-2.5 w-2.5" />
                  </button>
                </span>
              )}
            </div>

            {filteredLogs.length > 0 && (
              <span className="text-[11px] text-muted-foreground tabular-nums">
                Page{' '}
                <span className="font-semibold text-foreground">{currentPage}</span>
                {' '}/ {totalPages}
              </span>
            )}
          </div>
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
      <PayloadModal
        log={selectedPayload}
        onClose={() => setSelectedPayload(null)}
        copiedId={copiedId}
        onCopy={copyToClipboard}
        formatPayload={formatPayload}
        getStatusCfg={getStatusCfg}
      />
    </div>
  );
}
