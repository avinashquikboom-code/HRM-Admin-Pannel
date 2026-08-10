'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RefreshCw, Activity, CheckCircle2, XCircle, Clock, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function WebhookLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const totalPages = Math.ceil(logs.length / pageSize) || 1;
  const paginatedLogs = logs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

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
      const url = filter === 'ALL'
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">HopKid Webhook Logs</h1>
          <p className="text-sm text-muted-foreground">
            Monitor real-time sales & commission webhooks pushed from HopKid
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            fetchStats();
            fetchLogs();
          }}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-blue-50/50 border-blue-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-700">{stats?.total ?? 0}</div>
              <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Total Webhooks</div>
            </div>
            <Activity className="h-8 w-8 text-blue-400 opacity-80" />
          </CardContent>
        </Card>

        <Card className="bg-green-50/50 border-green-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-700">{stats?.success ?? 0}</div>
              <div className="text-xs font-semibold text-green-600 uppercase tracking-wide">Successful</div>
            </div>
            <CheckCircle2 className="h-8 w-8 text-green-400 opacity-80" />
          </CardContent>
        </Card>

        <Card className="bg-red-50/50 border-red-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-red-700">{stats?.failed ?? 0}</div>
              <div className="text-xs font-semibold text-red-600 uppercase tracking-wide">Failed</div>
            </div>
            <XCircle className="h-8 w-8 text-red-400 opacity-80" />
          </CardContent>
        </Card>

        <Card className="bg-purple-50/50 border-purple-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-purple-700">{stats?.successRate ?? '100%'}</div>
              <div className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Success Rate</div>
            </div>
            <Clock className="h-8 w-8 text-purple-400 opacity-80" />
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b pb-2">
        {['ALL', 'SUCCESS', 'FAILED', 'PROCESSING'].map((status) => (
          <Button
            key={status}
            variant={filter === status ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter(status)}
            className="font-semibold text-xs"
          >
            {status}
          </Button>
        ))}
      </div>

      {/* Logs Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Event Type</TableHead>
                <TableHead>Bill / Invoice ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead className="text-right">Sale Amount</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead>Received Time</TableHead>
                <TableHead>Details / Error</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedLogs.length > 0 ? (
                paginatedLogs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-muted/30">
                    <TableCell className="font-semibold">{log.eventType || 'INVOICE_CREATED'}</TableCell>
                    <TableCell className="font-mono text-sm">{log.billId || '-'}</TableCell>
                    <TableCell className="text-sm font-medium">{log.customerName || '-'}</TableCell>
                    <TableCell className="text-sm font-medium">{log.employeeName || '-'}</TableCell>
                    <TableCell className="text-right font-semibold">
                      ₹{(log.amount || 0).toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        className={
                          log.status === 'SUCCESS'
                            ? 'bg-green-100 text-green-800 border-green-200'
                            : log.status === 'FAILED'
                            ? 'bg-red-100 text-red-800 border-red-200'
                            : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                        }
                      >
                        {log.status || 'SUCCESS'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(log.createdAt).toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                      {log.errorMessage || 'Processed successfully'}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    {loading ? 'Loading webhook logs...' : 'No webhook logs found'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination Controls Bar */}
          {logs.length > 0 && (
            <div className="px-6 py-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
              <div>
                Showing <span className="font-semibold text-foreground">{Math.min((currentPage - 1) * pageSize + 1, logs.length)}</span> to{' '}
                <span className="font-semibold text-foreground">{Math.min(currentPage * pageSize, logs.length)}</span> of{' '}
                <span className="font-semibold text-foreground">{logs.length}</span> entries
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="px-2 font-mono font-semibold text-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
