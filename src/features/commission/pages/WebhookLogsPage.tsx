'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  User,
  ShoppingBag,
  ArrowUpDown,
  Filter,
} from 'lucide-react';
import { toast } from 'sonner';

export default function WebhookLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [filter, setFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedPayload, setSelectedPayload] = useState<any>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchQuery]);

  useEffect(() => {
    fetchStats();
    fetchLogs();
  }, [filter]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/webhook/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching webhook stats:', error);
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const url =
        filter === 'ALL'
          ? '/api/webhook/logs'
          : `/api/webhook/logs?status=${filter}`;

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setLogs(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching webhook logs:', error);
      toast.error('Failed to load webhook logs');
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // 1. Status Filter Check
      if (filter !== 'ALL' && String(log.status || '').toUpperCase() !== filter.toUpperCase()) {
        return false;
      }

      // 2. Search Query Check
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const billId = String(log.billId || '').toLowerCase();
        const customer = String(log.customerName || '').toLowerCase();
        const employee = String(log.employeeName || '').toLowerCase();
        const eventType = String(log.eventType || '').toLowerCase();
        const amount = String(log.amount || '');
        return (
          billId.includes(query) ||
          customer.includes(query) ||
          employee.includes(query) ||
          eventType.includes(query) ||
          amount.includes(query)
        );
      }

      return true;
    });
  }, [logs, filter, searchQuery]);

  const totalPages = Math.ceil(filteredLogs.length / pageSize) || 1;
  const paginatedLogs = useMemo(() => {
    return filteredLogs.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize
    );
  }, [filteredLogs, currentPage, pageSize]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatPayload = (raw: any) => {
    if (!raw) return '{}';
    if (typeof raw === 'string') {
      try {
        return JSON.stringify(JSON.parse(raw), null, 2);
      } catch (_) {
        return raw;
      }
    }
    return JSON.stringify(raw, null, 2);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-background via-muted/30 to-background p-6 rounded-2xl border shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              HopKid Webhook Logs
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Live Endpoint Active
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time HopKid POS sales, invoice webhooks & automated commission stream
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchStats();
              fetchLogs();
              toast.info('Refreshing webhook logs...');
            }}
            disabled={loading}
            className="flex items-center gap-2 shadow-xs hover:bg-muted/60 transition-all"
          >
            <RefreshCw
              className={`h-4 w-4 ${loading ? 'animate-spin text-primary' : 'text-muted-foreground'}`}
            />
            <span>Refresh Stream</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Webhooks */}
        <Card className="relative overflow-hidden border-blue-500/20 bg-gradient-to-br from-blue-500/5 via-background to-background shadow-xs hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold text-blue-600 dark:text-blue-400 tracking-wider uppercase">
                Total Webhooks
              </p>
              <div className="text-3xl font-extrabold text-foreground tracking-tight">
                {(stats?.total ?? 0).toLocaleString()}
              </div>
              <p className="text-[11px] text-muted-foreground">Logged sales events</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
              <Activity className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Successful */}
        <Card className="relative overflow-hidden border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 via-background to-background shadow-xs hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tracking-wider uppercase">
                Processed Success
              </p>
              <div className="text-3xl font-extrabold text-emerald-700 dark:text-emerald-400 tracking-tight">
                {(stats?.success ?? 0).toLocaleString()}
              </div>
              <p className="text-[11px] text-emerald-600/80 font-medium">
                {stats?.successRate ?? '100%'} success rate
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Failed */}
        <Card className="relative overflow-hidden border-rose-500/20 bg-gradient-to-br from-rose-500/5 via-background to-background shadow-xs hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold text-rose-600 dark:text-rose-400 tracking-wider uppercase">
                Failed / Exceptions
              </p>
              <div className="text-3xl font-extrabold text-rose-700 dark:text-rose-400 tracking-tight">
                {(stats?.failed ?? 0).toLocaleString()}
              </div>
              <p className="text-[11px] text-muted-foreground">Auto-retry queue active</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
              <XCircle className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Total Volume */}
        <Card className="relative overflow-hidden border-violet-500/20 bg-gradient-to-br from-violet-500/5 via-background to-background shadow-xs hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold text-violet-600 dark:text-violet-400 tracking-wider uppercase">
                Total Webhook Volume
              </p>
              <div className="text-3xl font-extrabold text-violet-700 dark:text-violet-400 tracking-tight">
                ₹{(stats?.totalAmount ?? 0).toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-muted-foreground">Aggregated sales value</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-600 dark:text-violet-400 shrink-0">
              <IndianRupee className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="border shadow-sm rounded-2xl overflow-hidden bg-card">
        {/* Controls Header: Search & Filter Tabs */}
        <div className="p-4 sm:p-6 border-b bg-muted/20 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {['ALL', 'SUCCESS', 'FAILED', 'PROCESSING'].map((status) => {
              const isActive = filter === status;
              return (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-3.5 py-1.5 rounded-lg font-semibold text-xs transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'bg-background hover:bg-muted text-muted-foreground border'
                  }`}
                >
                  <span>{status}</span>
                  {status === 'ALL' && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-primary-foreground/20">
                      {stats?.total ?? logs.length}
                    </span>
                  )}
                  {status === 'SUCCESS' && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                      {stats?.success ?? 0}
                    </span>
                  )}
                  {status === 'FAILED' && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500/20 text-rose-700 dark:text-rose-300">
                      {stats?.failed ?? 0}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search invoice, customer, code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs rounded-lg border-muted bg-background focus-visible:ring-1"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Table Body */}
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40 border-b">
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground py-3.5">
                    Event Type
                  </TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground py-3.5">
                    Bill / Invoice ID
                  </TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground py-3.5">
                    Customer
                  </TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground py-3.5">
                    Sales Representative
                  </TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground text-right py-3.5">
                    Sale Amount
                  </TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground text-center py-3.5">
                    Status
                  </TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground py-3.5">
                    Received Time
                  </TableHead>

                  <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground text-center py-3.5">
                    Actions / Payload
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {paginatedLogs.length > 0 ? (
                  paginatedLogs.map((log) => {
                    const isSuccess = log.status === 'SUCCESS';
                    const isFailed = log.status === 'FAILED';

                    return (
                      <TableRow
                        key={log.id}
                        className="hover:bg-muted/30 transition-colors group"
                      >
                        {/* Event Type */}
                        <TableCell className="font-semibold text-xs">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-mono border border-indigo-500/20">
                            <Zap className="h-3 w-3 text-indigo-500" />
                            {log.eventType || 'INVOICE_CREATED'}
                          </span>
                        </TableCell>

                        {/* Bill / Invoice ID */}
                        <TableCell>
                          {log.billId ? (
                            <div className="inline-flex items-center gap-1.5">
                              <code className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-muted border text-foreground">
                                {log.billId}
                              </code>
                              <button
                                onClick={() =>
                                  copyToClipboard(log.billId, log.id)
                                }
                                className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-foreground transition-opacity"
                                title="Copy Bill ID"
                              >
                                {copiedId === log.id ? (
                                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                                ) : (
                                  <Copy className="h-3.5 w-3.5" />
                                )}
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              -
                            </span>
                          )}
                        </TableCell>

                        {/* Customer */}
                        <TableCell className="text-xs font-medium">
                          <div className="flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>{log.customerName || 'N/A'}</span>
                          </div>
                        </TableCell>

                        {/* Sales Representative */}
                        <TableCell className="text-xs font-medium">
                          <div className="flex items-center gap-1.5">
                            <ShoppingBag className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>{log.employeeName || 'HopKid Sales'}</span>
                          </div>
                        </TableCell>

                        {/* Sale Amount */}
                        <TableCell className="text-right">
                          <span className="font-bold text-sm text-foreground">
                            ₹{(log.amount || 0).toLocaleString('en-IN')}
                          </span>
                        </TableCell>

                        {/* Status */}
                        <TableCell className="text-center">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                              isSuccess
                                ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:text-emerald-400'
                                : isFailed
                                ? 'bg-rose-500/10 text-rose-700 border-rose-500/30 dark:text-rose-400'
                                : 'bg-amber-500/10 text-amber-700 border-amber-500/30 dark:text-amber-400'
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                isSuccess
                                  ? 'bg-emerald-500'
                                  : isFailed
                                  ? 'bg-rose-500'
                                  : 'bg-amber-500 animate-ping'
                              }`}
                            />
                            {log.status || 'SUCCESS'}
                          </span>
                        </TableCell>

                        {/* Received Time */}
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(log.createdAt).toLocaleString('en-IN', {
                            dateStyle: 'short',
                            timeStyle: 'medium',
                          })}
                        </TableCell>

                        {/* Actions / View Payload */}
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedPayload(log)}
                            className="h-7 text-xs gap-1.5 text-muted-foreground hover:text-foreground hover:bg-muted"
                          >
                            <Code2 className="h-3.5 w-3.5" />
                            <span>View Payload</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-12 text-muted-foreground"
                    >
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Code2 className="h-8 w-8 opacity-40" />
                        <p className="font-semibold text-sm">
                          {loading
                            ? 'Fetching webhook logs...'
                            : searchQuery
                            ? 'No webhook logs match your search'
                            : 'No webhook logs recorded yet'}
                        </p>
                        <p className="text-xs text-muted-foreground max-w-sm">
                          {searchQuery
                            ? 'Try searching with a different term or clear the search filter.'
                            : 'Sales pushed from HopKid POS will appear here automatically.'}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {filteredLogs.length > 0 && (
            <div className="px-6 py-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground bg-muted/10">
              <div>
                Showing{' '}
                <span className="font-bold text-foreground">
                  {Math.min(
                    (currentPage - 1) * pageSize + 1,
                    filteredLogs.length
                  )}
                </span>{' '}
                to{' '}
                <span className="font-bold text-foreground">
                  {Math.min(currentPage * pageSize, filteredLogs.length)}
                </span>{' '}
                of{' '}
                <span className="font-bold text-foreground">
                  {filteredLogs.length}
                </span>{' '}
                entries
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="h-8 text-xs"
                >
                  Previous
                </Button>
                <span className="px-2 font-mono font-semibold text-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="h-8 text-xs"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Raw Payload Inspector Modal */}
      <Dialog
        open={!!selectedPayload}
        onOpenChange={(open) => !open && setSelectedPayload(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <Code2 className="h-5 w-5 text-indigo-500" />
              <span>Webhook Payload Details</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Raw JSON payload & metadata received for Bill ID:{' '}
              <code className="font-mono text-foreground font-semibold">
                {selectedPayload?.billId || 'N/A'}
              </code>
            </DialogDescription>
          </DialogHeader>

          {selectedPayload && (
            <div className="space-y-4 my-2">
              {/* Summary Metadata */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs p-3 bg-muted/40 rounded-xl border">
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold">
                    Event
                  </span>
                  <span className="font-semibold text-foreground font-mono">
                    {selectedPayload.eventType}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold">
                    Sale Amount
                  </span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    ₹{(selectedPayload.amount || 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold">
                    Status
                  </span>
                  <span className="font-semibold text-foreground">
                    {selectedPayload.status}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold">
                    Customer
                  </span>
                  <span className="font-semibold text-foreground truncate block">
                    {selectedPayload.customerName || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Error details if failed */}
              {selectedPayload.errorMessage && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 rounded-xl text-xs">
                  <span className="font-bold block mb-0.5">Processing Error:</span>
                  <span>{selectedPayload.errorMessage}</span>
                </div>
              )}

              {/* JSON Viewer */}
              <div className="relative">
                <pre className="p-4 bg-slate-950 text-slate-100 rounded-xl text-xs font-mono max-h-80 overflow-y-auto leading-relaxed border shadow-inner">
                  {formatPayload(selectedPayload.payload)}
                </pre>
                <button
                  onClick={() =>
                    copyToClipboard(
                      formatPayload(selectedPayload.payload),
                      'modal-json'
                    )
                  }
                  className="absolute top-3 right-3 px-2 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 flex items-center gap-1 transition-colors"
                >
                  <Copy className="h-3 w-3" />
                  <span>Copy JSON</span>
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

