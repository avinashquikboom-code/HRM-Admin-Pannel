'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Database,
  AlertTriangle,
  RefreshCw,
  Trash2,
  Filter,
  CheckSquare,
  Square,
  ShieldAlert,
  History,
  Info,
  Calendar,
  Building,
  User,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import SearchableSelect from '@/components/SearchableSelect';
import TableSkeleton from '@/components/TableSkeleton';

const WHITELISTED_TABLES = [
  { id: 'Attendance', label: 'Attendance / Punches', desc: 'Clock-in, clock-out, & punch logs' },
  { id: 'Leaves', label: 'Leaves / Requests', desc: 'Employee leave & absence requests' },
  { id: 'Payroll', label: 'Payroll & Advances', desc: 'Employee payslips & salary advance records' },
  { id: 'Sales', label: 'Sales & Commissions', desc: 'Commission transactions & sales ledger' },
  { id: 'Breaks', label: 'Breaks & Logs', desc: 'Employee break records & duration telemetry' },
  { id: 'ShiftRequests', label: 'Shift Requests', desc: 'Pending & processed shift change requests' },
  { id: 'Tasks', label: 'Tasks & Updates', desc: 'Assigned tasks & execution status logs' },
  { id: 'Notifications', label: 'Notifications', desc: 'In-app & push alert logs' },
];

export default function DataManagementPanel() {
  const [activeSubTab, setActiveSubTab] = useState<'reset' | 'logs'>('reset');

  // Whitelisted Table Checkboxes
  const [selectedTables, setSelectedTables] = useState<string[]>(['Attendance', 'Leaves']);

  // Filters
  const [branches, setBranches] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [attendanceStatus, setAttendanceStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Dry-run & Execution state
  const [isDryRunning, setIsDryRunning] = useState(false);
  const [dryRunPreview, setDryRunPreview] = useState<Array<{ table: string; rowCount: number }> | null>(null);
  const [confirmToken, setConfirmToken] = useState<string | null>(null);
  const [tokenExpiresAt, setTokenExpiresAt] = useState<string | null>(null);

  // Modal State
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmInput, setConfirmInput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);

  // Backup & Audit Log state
  const [backupStatus, setBackupStatus] = useState<any>(null);
  const [resetLogs, setResetLogs] = useState<any[]>([]);
  const [isLogsLoading, setIsLogsLoading] = useState(false);

  // Load dropdown options (Offices & Employees)
  const loadOptions = useCallback(async () => {
    try {
      const [officesRes, empRes, backupRes] = await Promise.allSettled([
        api.get('/api/admin/offices'),
        api.get('/api/admin/employees?limit=2000'),
        api.get('/api/superadmin/backup-status'),
      ]);

      if (officesRes.status === 'fulfilled') {
        const offList = officesRes.value.data?.offices || officesRes.value.data?.data || [];
        setBranches(Array.isArray(offList) ? offList : []);
      }

      if (empRes.status === 'fulfilled') {
        const empList = empRes.value.data?.employees || empRes.value.data?.data || [];
        setEmployees(Array.isArray(empList) ? empList : []);
      }

      if (backupRes.status === 'fulfilled') {
        setBackupStatus(backupRes.value.data);
      }
    } catch (err) {
      console.error('Failed to load reset options:', err);
    }
  }, []);

  const loadLogs = useCallback(async () => {
    setIsLogsLoading(true);
    try {
      const res = await api.get('/api/superadmin/reset/logs');
      setResetLogs(res.data?.logs || []);
    } catch (err) {
      console.error('Failed to load reset logs:', err);
    } finally {
      setIsLogsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOptions();
    if (activeSubTab === 'logs') {
      loadLogs();
    }
  }, [activeSubTab, loadOptions, loadLogs]);

  const toggleTable = (id: string) => {
    setSelectedTables((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
    setDryRunPreview(null);
    setConfirmToken(null);
  };

  const handleSelectAll = () => {
    if (selectedTables.length === WHITELISTED_TABLES.length) {
      setSelectedTables([]);
    } else {
      setSelectedTables(WHITELISTED_TABLES.map((t) => t.id));
    }
    setDryRunPreview(null);
    setConfirmToken(null);
  };

  // Perform Dry-Run Preview
  const handleDryRun = async () => {
    if (selectedTables.length === 0) {
      toast.error('Please select at least one table to reset.');
      return;
    }

    setIsDryRunning(true);
    setDryRunPreview(null);
    setConfirmToken(null);

    try {
      const res = await api.post('/api/superadmin/reset/dry-run', {
        tables: selectedTables,
        filters: {
          branchId: selectedBranch || undefined,
          employeeId: selectedEmployee || undefined,
          attendanceStatus: attendanceStatus || undefined,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
        },
      });

      if (res.data.success) {
        setDryRunPreview(res.data.preview);
        setConfirmToken(res.data.confirmToken);
        setTokenExpiresAt(res.data.expiresAt);
        toast.success('Dry-run calculation completed!');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Failed to execute dry-run preview.');
    } finally {
      setIsDryRunning(false);
    }
  };

  // Execute Reset Action
  const handleExecuteReset = async () => {
    if (confirmInput.toUpperCase() !== 'RESET') {
      toast.error('Please type "RESET" in capital letters to confirm.');
      return;
    }
    if (!confirmToken) {
      toast.error('Missing confirmation token. Run dry-run preview first.');
      return;
    }

    setIsExecuting(true);
    try {
      const res = await api.post('/api/superadmin/reset/execute', {
        confirmToken,
        tables: selectedTables,
        filters: {
          branchId: selectedBranch || undefined,
          employeeId: selectedEmployee || undefined,
          attendanceStatus: attendanceStatus || undefined,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
        },
      });

      if (res.data.success) {
        const totalDeleted = res.data.results.reduce(
          (sum: number, r: any) => sum + r.rowsDeleted,
          0
        );
        toast.success(`Data reset completed! ${totalDeleted} total row(s) deleted.`);
        setIsConfirmModalOpen(false);
        setConfirmInput('');
        setDryRunPreview(null);
        setConfirmToken(null);
        loadOptions();
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Failed to execute data reset.');
    } finally {
      setIsExecuting(false);
    }
  };

  const employeeOptions = [
    { value: '', label: 'All Employees' },
    ...employees.map((e) => ({
      value: String(e.id),
      label: `${e.firstName} ${e.lastName} (${e.employeeCode || `ID #${e.id}`})`,
    })),
  ];

  return (
    <div className="space-y-6">
      {/* ── Tabs & Subheader ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-text-primary flex items-center gap-2">
            <Database className="w-5 h-5 text-error" />
            Data Management & System Reset
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Selective table data resets with dry-run previews, filter controls, and audit trails.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-surface-variant p-1 rounded-xl border border-border/50">
          <button
            onClick={() => setActiveSubTab('reset')}
            className={`px-4 py-2 text-xs font-extrabold rounded-lg transition-all flex items-center gap-2 ${
              activeSubTab === 'reset'
                ? 'bg-primary text-white shadow-md'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Database size={14} /> Reset Controls
          </button>
          <button
            onClick={() => setActiveSubTab('logs')}
            className={`px-4 py-2 text-xs font-extrabold rounded-lg transition-all flex items-center gap-2 ${
              activeSubTab === 'logs'
                ? 'bg-primary text-white shadow-md'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <History size={14} /> Audit Trail Log
          </button>
        </div>
      </div>

      {/* ── Warning Banner ── */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3.5">
        <ShieldAlert className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-sm font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider">
            ⚠️ Irreversible Operation Warning
          </h4>
          <p className="text-xs text-text-secondary leading-relaxed">
            Data reset operations permanently remove records from selected database tables matching specified filters. Take a database backup before proceeding. User accounts and security profiles are hard-locked and protected against deletion.
          </p>
          {backupStatus?.lastBackupAt && (
            <p className="text-[11px] font-bold text-text-secondary flex items-center gap-1.5 pt-1">
              <Clock size={12} className="text-emerald-500" /> System Backup Health:{' '}
              <span className="text-emerald-500 font-mono">
                {new Date(backupStatus.lastBackupAt).toLocaleString()}
              </span>
            </p>
          )}
        </div>
      </div>

      {activeSubTab === 'reset' ? (
        <div className="space-y-6">
          {/* ── Section 1: Table Selector ── */}
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <div>
                <h3 className="text-sm font-black text-text-primary uppercase tracking-wider flex items-center gap-2">
                  1. Select Whitelisted Tables to Reset
                </h3>
                <p className="text-xs text-text-secondary">
                  Choose specific system modules. Authentication and User tables are strictly forbidden.
                </p>
              </div>

              <button
                onClick={handleSelectAll}
                className="text-xs font-extrabold text-primary hover:underline flex items-center gap-1.5"
              >
                {selectedTables.length === WHITELISTED_TABLES.length ? (
                  <>
                    <CheckSquare size={14} /> Deselect All
                  </>
                ) : (
                  <>
                    <Square size={14} /> Select All Whitelisted
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {WHITELISTED_TABLES.map((t) => {
                const isSelected = selectedTables.includes(t.id);
                return (
                  <div
                    key={t.id}
                    onClick={() => toggleTable(t.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'bg-error/5 border-error/40 shadow-sm'
                        : 'bg-surface-variant/40 border-border/40 hover:border-border'
                    }`}
                  >
                    <div className="mt-0.5">
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5 text-error" />
                      ) : (
                        <Square className="w-5 h-5 text-text-secondary" />
                      )}
                    </div>
                    <div>
                      <p
                        className={`text-sm font-extrabold ${
                          isSelected ? 'text-error' : 'text-text-primary'
                        }`}
                      >
                        {t.label}
                      </p>
                      <p className="text-xs text-text-secondary mt-0.5">{t.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Section 2: Filters ── */}
          <div className="glass-card p-6 space-y-4">
            <div className="border-b border-border/40 pb-3">
              <h3 className="text-sm font-black text-text-primary uppercase tracking-wider flex items-center gap-2">
                <Filter size={16} className="text-primary" /> 2. Optional Target Filters
              </h3>
              <p className="text-xs text-text-secondary">
                Restrict deletion to a specific branch office, employee, or date range. Leave empty to apply globally across selected tables.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {/* Branch Filter */}
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1.5 flex items-center gap-1.5">
                  <Building size={13} /> Branch / Office
                </label>
                <select
                  value={selectedBranch}
                  onChange={(e) => {
                    setSelectedBranch(e.target.value);
                    setDryRunPreview(null);
                  }}
                  className="w-full px-3 py-2.5 bg-surface-variant border border-border/60 rounded-xl text-xs font-semibold outline-none focus:border-primary"
                >
                  <option value="">All Branches (Global)</option>
                  {branches.map((b) => (
                    <option key={b.id} value={String(b.id)}>
                      {b.name} ({b.code || `OFF-${b.id}`})
                    </option>
                  ))}
                </select>
              </div>

              {/* Specific Employee */}
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1.5 flex items-center gap-1.5">
                  <User size={13} /> Specific Employee
                </label>
                <SearchableSelect
                  options={employeeOptions}
                  value={selectedEmployee}
                  onChange={(val) => {
                    setSelectedEmployee(val);
                    setDryRunPreview(null);
                  }}
                  placeholder="All Employees"
                />
              </div>

              {/* Attendance Status Filter */}
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1.5 flex items-center gap-1.5">
                  <Filter size={13} /> Attendance Status
                </label>
                <select
                  value={attendanceStatus}
                  onChange={(e) => {
                    setAttendanceStatus(e.target.value);
                    setDryRunPreview(null);
                  }}
                  className="w-full px-3 py-2.5 bg-surface-variant border border-border/60 rounded-xl text-xs font-semibold outline-none focus:border-primary"
                >
                  <option value="">All Statuses (Present, Absent, etc.)</option>
                  <option value="PRESENT">PRESENT Only</option>
                  <option value="ABSENT">ABSENT Only</option>
                  <option value="HALF_DAY">HALF DAY Only</option>
                  <option value="LATE">LATE Only</option>
                </select>
              </div>

              {/* Date From */}
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1.5 flex items-center gap-1.5">
                  <Calendar size={13} /> Date From
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => {
                    setDateFrom(e.target.value);
                    setDryRunPreview(null);
                  }}
                  className="w-full px-3 py-2 bg-surface-variant border border-border/60 rounded-xl text-xs font-semibold outline-none focus:border-primary"
                />
              </div>

              {/* Date To */}
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1.5 flex items-center gap-1.5">
                  <Calendar size={13} /> Date To
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => {
                    setDateTo(e.target.value);
                    setDryRunPreview(null);
                  }}
                  className="w-full px-3 py-2 bg-surface-variant border border-border/60 rounded-xl text-xs font-semibold outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* ── Section 3: Dry Run Preview Button ── */}
          <div className="flex items-center justify-between glass-card p-6">
            <div>
              <h4 className="text-sm font-extrabold text-text-primary">
                Preview Impact (Dry Run Calculation)
              </h4>
              <p className="text-xs text-text-secondary">
                Calculates the exact row count to be deleted without modifying database data. Generates a 5-minute confirmation token.
              </p>
            </div>

            <button
              onClick={handleDryRun}
              disabled={isDryRunning || selectedTables.length === 0}
              className="btn-primary flex items-center gap-2 px-6 py-3 shadow-lg disabled:opacity-50"
            >
              {isDryRunning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Calculating Preview...
                </>
              ) : (
                <>
                  <Database size={16} /> Run Dry Run Preview
                </>
              )}
            </button>
          </div>

          {/* ── Section 4: Dry Run Preview Results Table ── */}
          {dryRunPreview && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 space-y-4 border-2 border-primary/30"
            >
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <div>
                  <h3 className="text-sm font-black text-text-primary uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-500" /> Dry Run Preview Impact Summary
                  </h3>
                  <p className="text-xs text-text-secondary">
                    Review row counts per table matching current filters before confirmation.
                  </p>
                </div>
                {tokenExpiresAt && (
                  <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-[11px] font-bold text-amber-500 flex items-center gap-1">
                    <Clock size={12} /> Confirm Token Expires: {new Date(tokenExpiresAt).toLocaleTimeString()}
                  </span>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border/50 text-muted uppercase tracking-wider">
                      <th className="px-4 py-3 text-left font-black">Target Table</th>
                      <th className="px-4 py-3 text-right font-black">Rows to be Deleted</th>
                      <th className="px-4 py-3 text-right font-black">Status Impact</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dryRunPreview.map((item) => (
                      <tr key={item.table} className="border-b border-border/30">
                        <td className="px-4 py-3 font-bold text-text-primary">{item.table}</td>
                        <td className="px-4 py-3 text-right font-extrabold text-error font-mono text-sm">
                          {item.rowCount.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-text-secondary">
                          {item.rowCount > 0 ? (
                            <span className="text-amber-500 font-bold">⚠️ Affected</span>
                          ) : (
                            <span className="text-text-secondary">No rows matching filter</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-surface-variant/50 font-black">
                      <td className="px-4 py-3 text-text-primary">TOTAL IMPACT</td>
                      <td className="px-4 py-3 text-right text-error font-mono text-base">
                        {dryRunPreview.reduce((sum, i) => sum + i.rowCount, 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right text-text-primary">Total Rows to Clear</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  onClick={() => {
                    setDryRunPreview(null);
                    setConfirmToken(null);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-border text-xs font-bold hover:bg-surface-variant"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setIsConfirmModalOpen(true)}
                  className="px-6 py-2.5 rounded-xl bg-error hover:bg-error/90 text-white text-xs font-extrabold shadow-lg flex items-center gap-2"
                >
                  <Trash2 size={14} /> Proceed to Execute Reset
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Confirmation Modal ── */}
          <AnimatePresence>
            {isConfirmModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full max-w-md bg-surface p-6 rounded-2xl border border-error/40 shadow-2xl space-y-4"
                >
                  <div className="flex items-center gap-3 text-error">
                    <AlertTriangle className="w-6 h-6 shrink-0 animate-bounce" />
                    <h3 className="text-lg font-black">Confirm Execution</h3>
                  </div>

                  <p className="text-xs text-text-secondary leading-relaxed">
                    This action will permanently delete <strong className="text-error">{dryRunPreview?.reduce((s, i) => s + i.rowCount, 0)} row(s)</strong> across {selectedTables.length} selected table(s).
                  </p>

                  <div className="p-3 bg-error/10 border border-error/30 rounded-xl space-y-1">
                    <p className="text-[11px] font-bold text-error">
                      To confirm, type <span className="font-mono underline">RESET</span> below:
                    </p>
                    <input
                      type="text"
                      placeholder="Type RESET"
                      value={confirmInput}
                      onChange={(e) => setConfirmInput(e.target.value)}
                      className="w-full px-3 py-2 bg-surface border border-error/50 rounded-lg text-xs font-mono font-bold outline-none uppercase"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => {
                        setIsConfirmModalOpen(false);
                        setConfirmInput('');
                      }}
                      className="px-4 py-2 rounded-xl border border-border text-xs font-bold hover:bg-surface-variant"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleExecuteReset}
                      disabled={confirmInput.toUpperCase() !== 'RESET' || isExecuting}
                      className="px-6 py-2 rounded-xl bg-error hover:bg-error/90 disabled:opacity-40 text-white text-xs font-black shadow-lg flex items-center gap-2"
                    >
                      {isExecuting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" /> Resetting...
                        </>
                      ) : (
                        'Confirm & Execute Reset'
                      )}
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        /* ── Audit Logs Subtab ── */
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <div>
              <h3 className="text-sm font-black text-text-primary uppercase tracking-wider flex items-center gap-2">
                <History size={16} className="text-primary" /> Permanent Reset Audit Trail Logs
              </h3>
              <p className="text-xs text-text-secondary">
                Immutable history of all data reset actions performed by SuperAdmin & HR roles.
              </p>
            </div>
            <button
              onClick={loadLogs}
              className="p-2 rounded-lg bg-surface-variant text-text-secondary hover:text-text-primary border border-border/40"
            >
              <RefreshCw size={14} className={isLogsLoading ? 'animate-spin' : ''} />
            </button>
          </div>

          {isLogsLoading ? (
            <TableSkeleton rows={5} columns={5} />
          ) : resetLogs.length === 0 ? (
            <div className="py-12 text-center text-text-secondary text-xs font-semibold">
              No reset log records found in audit history.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border/50 text-muted uppercase tracking-wider">
                    <th className="px-4 py-3 text-left font-black">Timestamp</th>
                    <th className="px-4 py-3 text-left font-black">Reset By</th>
                    <th className="px-4 py-3 text-left font-black">Tables Cleared</th>
                    <th className="px-4 py-3 text-left font-black">Rows Deleted</th>
                    <th className="px-4 py-3 text-left font-black">IP Address</th>
                  </tr>
                </thead>
                <tbody>
                  {resetLogs.map((log) => (
                    <tr key={log.id} className="border-b border-border/30 hover:bg-surface-variant/30">
                      <td className="px-4 py-3 font-mono text-text-secondary whitespace-nowrap">
                        {new Date(log.resetAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-bold text-text-primary">{log.resetBy}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {Array.isArray(log.tables) &&
                            log.tables.map((t: string) => (
                              <span
                                key={t}
                                className="px-2 py-0.5 rounded bg-error/10 text-error text-[10px] font-extrabold"
                              >
                                {t}
                              </span>
                            ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono font-extrabold text-error">
                        {typeof log.rowsDeleted === 'object'
                          ? JSON.stringify(log.rowsDeleted)
                          : String(log.rowsDeleted)}
                      </td>
                      <td className="px-4 py-3 font-mono text-text-secondary">{log.ipAddress || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
