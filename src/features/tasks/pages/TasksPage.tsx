"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import {
  CheckSquare,
  Plus,
  Clock,
  AlertTriangle,
  CheckCircle2,
  SlidersHorizontal,
  Search,
  Play,
  XCircle,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  User,
  Camera,
  Sparkles,
} from 'lucide-react';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { cn } from '@/utils/cn';
import Modal from '@/components/Modal';
import TableSkeleton from '@/components/TableSkeleton';
import SuperAdminHeader from '@/components/SuperAdminHeader';
import SearchableSelect from '@/components/SearchableSelect';
import { useAppSelector } from '@/store/hooks';
import { useEmployees } from '@/hooks/useEmployees';
import {
  fetchTasks,
  fetchTaskStats,
  createTask,
  FIXED_TASK_TEMPLATES,
  type HrTask,
  type HrTaskStatus,
  type HrPriority,
  type TaskStats,
} from '@/services/taskService';

// ─── Variants ────────────────────────────────────────────────────────────────

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 18 } },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<HrTaskStatus, string> = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

const STATUS_STYLES: Record<HrTaskStatus, string> = {
  PENDING:     'bg-warning/10 text-warning border-warning/20',
  IN_PROGRESS: 'bg-primary/10 text-primary border-primary/20',
  COMPLETED:   'bg-success/10 text-success border-success/20',
  CANCELLED:   'bg-muted/10 text-muted border-muted/20',
};

const PRIORITY_STYLES: Record<HrPriority, string> = {
  HIGH:   'bg-error/10 text-error border-error/20',
  MEDIUM: 'bg-warning/10 text-warning border-warning/20',
  LOW:    'bg-success/10 text-success border-success/20',
};

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  } catch { return '—'; }
}

// ─── Component ───────────────────────────────────────────────────────────────

const TasksPage = () => {
  const router = useRouter();
  const portal = useAppSelector((s) => s.auth.portal);

  // ── Data state
  const [tasks, setTasks]       = useState<HrTask[]>([]);
  const [stats, setStats]       = useState<TaskStats | null>(null);
  const [isLoading, setIsLoading]   = useState(true);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const PAGE_SIZE = 20;

  // ── Filter state
  const [search, setSearch]         = useState('');
  const [filterStatus, setFilterStatus]   = useState<HrTaskStatus | ''>('');
  const [filterPriority, setFilterPriority] = useState<HrPriority | ''>('');
  const [filterEmployee, setFilterEmployee] = useState('');
  const [filterFrom, setFilterFrom]     = useState('');
  const [filterTo, setFilterTo]       = useState('');

  // ── Create modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating]         = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'MEDIUM' as HrPriority,
    dueDate: '',
    requiresPhoto: false,
  });

  // ── Employee directory (for selects)
  const { employees } = useEmployees({ limit: 2000 });
  const empOptions = useMemo(
    () =>
      employees.map((e) => {
        const idVal = e.employeeID || e.employeeCode || String(e.id);
        const codeStr = e.employeeCode ? ` (${e.employeeCode})` : '';
        const nameStr = `${e.firstName ?? ''} ${e.lastName ?? ''}`.trim() || `Employee #${e.id}`;
        return {
          value: idVal,
          label: `${nameStr}${codeStr}`,
        };
      }),
    [employees]
  );
  const empFilterOptions = useMemo(
    () => [{ value: '', label: 'All Employees' }, ...empOptions],
    [empOptions]
  );

  // ── Load data
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [res, statsRes] = await Promise.all([
        fetchTasks({
          page,
          limit: PAGE_SIZE,
          search: search || undefined,
          status: filterStatus || undefined,
          priority: filterPriority || undefined,
          assignedTo: filterEmployee || undefined,
          from: filterFrom || undefined,
          to: filterTo || undefined,
        }),
        fetchTaskStats(),
      ]);
      setTasks(res.data);
      setTotal(res.meta.total);
      setStats(statsRes);
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : 'Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  }, [page, search, filterStatus, filterPriority, filterEmployee, filterFrom, filterTo]);

  useEffect(() => { loadData(); }, [loadData]);

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1); }, [search, filterStatus, filterPriority, filterEmployee, filterFrom, filterTo]);

  // ── Create handler
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.assignedTo) return;
    setCreating(true);
    try {
      await createTask({
        title: form.title,
        description: form.description || undefined,
        assignedTo: form.assignedTo,
        priority: form.priority,
        dueDate: form.dueDate || undefined,
        requiresPhoto: form.requiresPhoto,
      });
      toast.success('Task created successfully');
      setIsCreateOpen(false);
      setForm({ title: '', description: '', assignedTo: '', priority: 'MEDIUM', dueDate: '', requiresPhoto: false });
      loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create task');
    } finally {
      setCreating(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8 pb-10"
    >
      {/* ── Header ── */}
      <SuperAdminHeader
        title="Task Management"
        subtitle="Assign, monitor, and track deliverables across your workforce."
        badgeText="HR Task Control"
        badgeIcon={CheckSquare}
        stats={[
          { label: 'Total Tasks',  value: String(stats?.assigned   ?? 0), icon: CheckSquare   },
          { label: 'In Progress',  value: String(stats?.inProgress ?? 0), icon: Play          },
          { label: 'Completed',    value: String(stats?.completed  ?? 0), icon: CheckCircle2  },
          { label: 'Overdue',      value: String(stats?.overdue    ?? 0), icon: AlertTriangle  },
        ]}
      >
        <button
          onClick={() => setIsCreateOpen(true)}
          className="btn-primary group shadow-xl shadow-primary/20 flex items-center gap-2"
          id="create-task-btn"
        >
          <Plus size={18} className="group-hover:rotate-12 transition-transform" />
          Assign Task
        </button>
      </SuperAdminHeader>

      {/* ── Filter Bar ── */}
      <motion.div variants={itemVariants} className="glass-card p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative xl:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 bg-surface-variant border border-transparent focus:border-primary/20 rounded-lg outline-none text-sm font-medium transition-all"
            />
          </div>

          {/* Employee filter */}
          <SearchableSelect
            options={empFilterOptions}
            value={filterEmployee}
            onChange={(val) => setFilterEmployee(val)}
            placeholder="All Employees"
            className="w-full"
          />

          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as HrTaskStatus | '')}
            className="w-full px-3 py-2.5 bg-surface-variant border border-transparent focus:border-primary/20 rounded-lg outline-none text-sm font-medium cursor-pointer transition-all"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          {/* Priority filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as HrPriority | '')}
            className="w-full px-3 py-2.5 bg-surface-variant border border-transparent focus:border-primary/20 rounded-lg outline-none text-sm font-medium cursor-pointer transition-all"
          >
            <option value="">All Priorities</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        {/* Date range */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2 text-xs text-muted">
            <CalendarDays size={14} />
            <span>Due date range:</span>
          </div>
          <input
            type="date"
            value={filterFrom}
            onChange={(e) => setFilterFrom(e.target.value)}
            className="px-3 py-2 bg-surface-variant border border-transparent focus:border-primary/20 rounded-lg outline-none text-sm font-medium cursor-pointer transition-all"
          />
          <span className="text-muted text-xs self-center">to</span>
          <input
            type="date"
            value={filterTo}
            onChange={(e) => setFilterTo(e.target.value)}
            className="px-3 py-2 bg-surface-variant border border-transparent focus:border-primary/20 rounded-lg outline-none text-sm font-medium cursor-pointer transition-all"
          />
          {(filterFrom || filterTo) && (
            <button
              onClick={() => { setFilterFrom(''); setFilterTo(''); }}
              className="text-xs text-muted hover:text-error transition-colors flex items-center gap-1"
            >
              <XCircle size={12} /> Clear dates
            </button>
          )}
        </div>
      </motion.div>

      {/* ── Table ── */}
      <motion.div variants={itemVariants} className="glass-card overflow-hidden">
        {isLoading ? (
          <div className="p-6">
            <TableSkeleton rows={8} columns={6} />
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
            <CheckSquare size={48} className="text-muted/30" />
            <p className="text-text-secondary font-semibold">No tasks found</p>
            <p className="text-xs text-muted">Try adjusting your filters or assign a new task.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 text-xs text-muted uppercase tracking-wider">
                  <th className="px-6 py-4 text-left font-black">Title</th>
                  <th className="px-4 py-4 text-left font-black">Assignee</th>
                  <th className="px-4 py-4 text-left font-black">Priority</th>
                  <th className="px-4 py-4 text-left font-black">Due Date</th>
                  <th className="px-4 py-4 text-left font-black">Status</th>
                  <th className="px-4 py-4 text-left font-black">Action</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {tasks.map((task) => (
                    <motion.tr
                      key={task.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      onClick={() => router.push(`/tasks/${task.id}`)}
                      className={cn(
                        'border-b border-border/30 hover:bg-surface-variant/50 cursor-pointer transition-colors group',
                        task.overdue && 'bg-error/3 hover:bg-error/8'
                      )}
                    >
                      {/* Title */}
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-2 max-w-xs">
                          {task.overdue && (
                            <AlertTriangle size={13} className="text-error mt-0.5 flex-shrink-0" />
                          )}
                          <div>
                            <p className="font-bold text-text-primary group-hover:text-primary transition-colors leading-tight line-clamp-1 flex items-center gap-1.5">
                              {task.title}
                              {task.requiresPhoto && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-black" title="Photo proof required">
                                  <Camera size={10} /> Photo
                                </span>
                              )}
                            </p>
                            {task.description && (
                              <p className="text-xs text-muted mt-0.5 line-clamp-1">{task.description}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Assignee */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-black border border-primary/10 flex-shrink-0">
                            {task.assigneeName?.substring(0, 2).toUpperCase() ?? 'UN'}
                          </div>
                          <span className="font-semibold text-text-secondary text-xs whitespace-nowrap">
                            {task.assigneeName}
                          </span>
                        </div>
                      </td>

                      {/* Priority */}
                      <td className="px-4 py-4">
                        <span className={cn(
                          'px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border',
                          PRIORITY_STYLES[task.priority]
                        )}>
                          {task.priority}
                        </span>
                      </td>

                      {/* Due date */}
                      <td className="px-4 py-4">
                        <div className={cn(
                          'flex items-center gap-1.5 text-xs font-semibold',
                          task.overdue ? 'text-error' : 'text-text-secondary'
                        )}>
                          <Clock size={11} />
                          {formatDate(task.dueDate)}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        <span className={cn(
                          'px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border whitespace-nowrap',
                          STATUS_STYLES[task.status]
                        )}>
                          {STATUS_LABELS[task.status]}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-4 py-4">
                        <button
                          onClick={(e) => { e.stopPropagation(); router.push(`/tasks/${task.id}`); }}
                          className="text-xs text-primary hover:underline font-semibold"
                        >
                          View →
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}

        {/* ── Pagination ── */}
        {!isLoading && total > PAGE_SIZE && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border/30">
            <span className="text-xs text-muted">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total} tasks
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="p-1.5 rounded-lg bg-surface-variant border border-border/30 text-muted hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="text-xs font-bold text-text-secondary px-1">
                {page} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="p-1.5 rounded-lg bg-surface-variant border border-border/30 text-muted hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* ── Create Task Modal ── */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Assign New Task"
      >
        <form onSubmit={handleCreate} className="space-y-5">
          {/* Preset Task Templates Selector */}
          <div className="space-y-1.5 bg-surface-variant/40 p-3 rounded-2xl border border-primary/10">
            <label className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-1">
              <Sparkles size={13} /> Select Fixed / Preset Task Template
            </label>
            <select
              onChange={(e) => {
                const selected = FIXED_TASK_TEMPLATES.find((t) => t.id === e.target.value);
                if (selected) {
                  setForm((f) => ({
                    ...f,
                    title: selected.title,
                    description: selected.description,
                    priority: selected.priority,
                    requiresPhoto: selected.requiresPhoto,
                  }));
                }
              }}
              defaultValue=""
              className="w-full px-4 py-2.5 bg-surface-variant border border-transparent focus:border-primary/20 rounded-xl outline-none text-xs font-bold text-text-primary cursor-pointer"
            >
              <option value="" disabled>-- Choose a Pre-defined Task --</option>
              {FIXED_TASK_TEMPLATES.map((tmpl) => (
                <option key={tmpl.id} value={tmpl.id}>
                  {tmpl.title} {tmpl.requiresPhoto ? '(📸 Photo Proof)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-label text-text-secondary tracking-[0.15em] ml-1">Task Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              required
              placeholder="e.g. Complete monthly attendance report"
              className="w-full px-5 py-3.5 bg-surface-variant/60 border-2 border-transparent focus:border-primary/20 rounded-2xl outline-none text-sm font-bold text-text-primary transition-all placeholder:text-muted/50"
            />
          </div>

          {/* Assignee */}
          <div className="space-y-1.5">
            <label className="text-label text-text-secondary tracking-[0.15em] ml-1">Assign To *</label>
            <SearchableSelect
              options={empOptions}
              value={form.assignedTo}
              onChange={(val) => setForm((f) => ({ ...f, assignedTo: val }))}
              placeholder="Select employee..."
            />
          </div>

          {/* Priority + Due date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-label text-text-secondary tracking-[0.15em] ml-1">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as HrPriority }))}
                className="w-full px-5 py-3.5 bg-surface-variant/60 border-2 border-transparent focus:border-primary/20 rounded-2xl outline-none text-sm font-bold text-text-primary cursor-pointer transition-all"
              >
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-label text-text-secondary tracking-[0.15em] ml-1">Due Date</label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                onClick={(e) => { try { (e.currentTarget as any).showPicker(); } catch {} }}
                className="w-full px-5 py-3.5 bg-surface-variant/60 border-2 border-transparent focus:border-primary/20 rounded-2xl outline-none text-sm font-bold text-text-primary cursor-pointer transition-all"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-label text-text-secondary tracking-[0.15em] ml-1">Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Describe the task scope and expectations..."
              className="w-full px-5 py-3.5 bg-surface-variant/60 border-2 border-transparent focus:border-primary/20 rounded-2xl outline-none text-sm font-bold text-text-primary transition-all placeholder:text-muted/50 resize-none"
            />
          </div>

          {/* Requires Photo Proof Checkbox */}
          <label className="flex items-center gap-3 p-3 bg-surface-variant/40 rounded-xl cursor-pointer border border-border/30 hover:border-primary/20 transition-all">
            <input
              type="checkbox"
              checked={form.requiresPhoto}
              onChange={(e) => setForm((f) => ({ ...f, requiresPhoto: e.target.checked }))}
              className="w-4 h-4 rounded text-primary accent-primary cursor-pointer"
            />
            <div className="flex items-center gap-2">
              <Camera size={16} className="text-primary" />
              <div>
                <p className="text-xs font-bold text-text-primary">Requires Photo Proof from Employee</p>
                <p className="text-[11px] text-muted">Employee must click & upload a photo to mark this task complete</p>
              </div>
            </div>
          </label>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="flex-1 px-5 py-3.5 bg-surface-variant rounded-2xl text-xs font-black uppercase tracking-widest text-text-secondary hover:bg-border transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="flex-1 btn-primary py-3.5 rounded-2xl shadow-lg shadow-primary/20 disabled:opacity-60"
            >
              {creating ? 'Creating…' : 'Assign Task'}
            </button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};

export default TasksPage;
