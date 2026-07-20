"use client";

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { motion, Variants } from 'framer-motion';
import {
  ArrowLeft,
  CheckSquare,
  AlertTriangle,
  Clock,
  User,
  Save,
  XCircle,
  History,
  ChevronRight,
  Edit3,
  CalendarDays,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useEmployees } from '@/hooks/useEmployees';
import TableSkeleton from '@/components/TableSkeleton';
import {
  fetchTask,
  fetchTaskHistory,
  updateTask,
  type HrTask,
  type HrTaskUpdate,
  type HrPriority,
  type HrTaskStatus,
} from '@/services/taskService';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 18 } },
};

const STATUS_LABELS: Record<HrTaskStatus, string> = {
  PENDING:     'Pending',
  IN_PROGRESS: 'In Progress',
  COMPLETED:   'Completed',
  CANCELLED:   'Cancelled',
};

const STATUS_STYLES: Record<HrTaskStatus, string> = {
  PENDING:     'bg-warning/10 text-warning border-warning/20',
  IN_PROGRESS: 'bg-primary/10 text-primary border-primary/20',
  COMPLETED:   'bg-success/10 text-success border-success/20',
  CANCELLED:   'bg-muted/10 text-muted border-muted/20',
};

const STATUS_FLOW: HrTaskStatus[] = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];

const PRIORITY_STYLES: Record<HrPriority, string> = {
  HIGH:   'bg-error/10 text-error border-error/20',
  MEDIUM: 'bg-warning/10 text-warning border-warning/20',
  LOW:    'bg-success/10 text-success border-success/20',
};

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return '—'; }
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ─── Component ───────────────────────────────────────────────────────────────

interface Props { taskId: string; }

const TaskDetailPage = ({ taskId }: Props) => {
  const router = useRouter();

  // ── Data
  const [task,    setTask]    = useState<HrTask | null>(null);
  const [history, setHistory] = useState<HrTaskUpdate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);

  // ── Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [editForm,  setEditForm]  = useState({
    title:       '',
    description: '',
    assignedTo:  '',
    priority:    'MEDIUM' as HrPriority,
    dueDate:     '',
  });

  // ── Status change
  const [savingStatus, setSavingStatus] = useState(false);
  const [statusComment, setStatusComment] = useState('');
  const [showCommentFor, setShowCommentFor] = useState<HrTaskStatus | null>(null);

  // ── Employee directory
  const { employees } = useEmployees({ limit: 500 });
  const empOptions = employees
    .filter((e) => e.employeeID)
    .map((e) => ({ value: e.employeeID!, label: `${e.firstName} ${e.lastName} (${e.employeeCode})` }));

  // ── Load
  const loadTask = useCallback(async () => {
    setIsLoading(true);
    try {
      const t = await fetchTask(taskId);
      setTask(t);
      setEditForm({
        title:       t.title,
        description: t.description ?? '',
        assignedTo:  t.assignedTo,
        priority:    t.priority,
        dueDate:     t.dueDate ? t.dueDate.split('T')[0] : '',
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load task');
    } finally {
      setIsLoading(false);
    }
  }, [taskId]);

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const h = await fetchTaskHistory(taskId);
      setHistory(h);
    } catch { /* silently ignore */ }
    finally { setHistoryLoading(false); }
  }, [taskId]);

  useEffect(() => {
    loadTask();
    loadHistory();
  }, [loadTask, loadHistory]);

  // ── Save edits
  const handleSave = async () => {
    if (!task || !editForm.title || !editForm.assignedTo) return;
    setSaving(true);
    try {
      await updateTask(taskId, {
        title:       editForm.title,
        description: editForm.description || undefined,
        assignedTo:  editForm.assignedTo,
        priority:    editForm.priority,
        dueDate:     editForm.dueDate || null,
      });
      toast.success('Task updated');
      setIsEditing(false);
      loadTask();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  // ── Status change
  const handleStatusChange = async (newStatus: HrTaskStatus) => {
    if (!task) return;
    if (newStatus === task.status) return;

    setSavingStatus(true);
    try {
      await updateTask(taskId, {
        status:  newStatus,
        comment: statusComment || undefined,
      });
      toast.success(`Status → ${STATUS_LABELS[newStatus]}`);
      setShowCommentFor(null);
      setStatusComment('');
      loadTask();
      loadHistory();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setSavingStatus(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <TableSkeleton rows={6} columns={2} />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <XCircle size={48} className="text-muted/30" />
        <p className="text-text-secondary font-semibold">Task not found</p>
        <button onClick={() => router.back()} className="btn-primary text-sm">
          ← Go Back
        </button>
      </div>
    );
  }

  const currentStatusIdx = STATUS_FLOW.indexOf(task.status);
  const nextStatus       = currentStatusIdx < STATUS_FLOW.length - 1 ? STATUS_FLOW[currentStatusIdx + 1] : null;
  const prevStatus       = currentStatusIdx > 0 ? STATUS_FLOW[currentStatusIdx - 1] : null;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8 pb-12 max-w-5xl"
    >
      {/* ── Back + Title ── */}
      <motion.div variants={itemVariants} className="flex items-center gap-4">
        <button
          onClick={() => router.push('/tasks')}
          className="p-2 rounded-xl bg-surface-variant hover:bg-border transition-colors text-muted hover:text-text-primary"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs text-muted">{task.id.slice(0, 8).toUpperCase()}</span>
            {task.overdue && (
              <span className="flex items-center gap-1 text-[10px] font-black text-error bg-error/10 border border-error/20 px-2 py-0.5 rounded-lg uppercase tracking-wider">
                <AlertTriangle size={10} /> Overdue
              </span>
            )}
          </div>
          <h1 className="text-xl font-black text-text-primary mt-0.5 leading-tight truncate">{task.title}</h1>
        </div>
        <button
          onClick={() => setIsEditing((v) => !v)}
          className={cn(
            'p-2 rounded-xl transition-colors border',
            isEditing
              ? 'bg-primary/10 text-primary border-primary/20'
              : 'bg-surface-variant text-muted hover:text-text-primary border-border/30'
          )}
          title={isEditing ? 'Cancel edit' : 'Edit task'}
        >
          <Edit3 size={16} />
        </button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left col: detail + edit form ── */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">

          {/* Task details card */}
          <div className="glass-card p-6 space-y-5">
            {isEditing ? (
              /* ── Edit form ── */
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted">Edit Task</h3>

                <div className="space-y-1.5">
                  <label className="text-label text-text-secondary tracking-[0.15em] ml-1">Title *</label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                    className="w-full px-4 py-3 bg-surface-variant/70 border-2 border-transparent focus:border-primary/20 rounded-xl outline-none text-sm font-bold text-text-primary transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-label text-text-secondary tracking-[0.15em] ml-1">Assign To *</label>
                  <select
                    value={editForm.assignedTo}
                    onChange={(e) => setEditForm((f) => ({ ...f, assignedTo: e.target.value }))}
                    className="w-full px-4 py-3 bg-surface-variant/70 border-2 border-transparent focus:border-primary/20 rounded-xl outline-none text-sm font-bold text-text-primary cursor-pointer transition-all"
                  >
                    {empOptions.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-label text-text-secondary tracking-[0.15em] ml-1">Priority</label>
                    <select
                      value={editForm.priority}
                      onChange={(e) => setEditForm((f) => ({ ...f, priority: e.target.value as HrPriority }))}
                      className="w-full px-4 py-3 bg-surface-variant/70 border-2 border-transparent focus:border-primary/20 rounded-xl outline-none text-sm font-bold text-text-primary cursor-pointer transition-all"
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
                      value={editForm.dueDate}
                      onChange={(e) => setEditForm((f) => ({ ...f, dueDate: e.target.value }))}
                      className="w-full px-4 py-3 bg-surface-variant/70 border-2 border-transparent focus:border-primary/20 rounded-xl outline-none text-sm font-bold text-text-primary cursor-pointer transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-label text-text-secondary tracking-[0.15em] ml-1">Description</label>
                  <textarea
                    rows={4}
                    value={editForm.description}
                    onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                    className="w-full px-4 py-3 bg-surface-variant/70 border-2 border-transparent focus:border-primary/20 rounded-xl outline-none text-sm font-bold text-text-primary transition-all resize-none"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 px-4 py-3 bg-surface-variant rounded-xl text-xs font-black uppercase tracking-widest text-text-secondary hover:bg-border transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 btn-primary py-3 rounded-xl shadow-md disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    <Save size={14} />
                    {saving ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              </div>
            ) : (
              /* ── Read view ── */
              <div className="space-y-5">
                <div>
                  <p className="text-xs text-muted font-semibold uppercase tracking-wider mb-1">Description</p>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {task.description || <span className="italic text-muted">No description provided.</span>}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ── Status Flow Controls ── */}
          <div className="glass-card p-5 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted">Status Progression</h3>

            {/* Progress bar */}
            <div className="flex items-center gap-2">
              {STATUS_FLOW.map((s, idx) => (
                <div key={s} className="flex items-center gap-2 flex-1">
                  <div className={cn(
                    'flex-1 h-1.5 rounded-full transition-all',
                    idx <= currentStatusIdx ? 'bg-primary' : 'bg-surface-variant'
                  )} />
                  {idx < STATUS_FLOW.length - 1 && (
                    <ChevronRight size={12} className="text-muted flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-2 flex-wrap">
              {prevStatus && (
                <button
                  onClick={() => { setShowCommentFor(prevStatus); setStatusComment(''); }}
                  className="px-4 py-2 bg-surface-variant rounded-xl text-xs font-black text-text-secondary hover:bg-border transition-colors border border-border/30"
                >
                  ← {STATUS_LABELS[prevStatus]}
                </button>
              )}
              {nextStatus && (
                <button
                  onClick={() => { setShowCommentFor(nextStatus); setStatusComment(''); }}
                  className="px-4 py-2 btn-primary rounded-xl text-xs flex items-center gap-1.5"
                >
                  {STATUS_LABELS[nextStatus]} →
                </button>
              )}
              {task.status !== 'CANCELLED' && (
                <button
                  onClick={() => { setShowCommentFor('CANCELLED'); setStatusComment(''); }}
                  className="px-4 py-2 bg-error/10 text-error rounded-xl text-xs font-black border border-error/20 hover:bg-error/20 transition-colors ml-auto"
                >
                  Cancel Task
                </button>
              )}
            </div>

            {/* Comment input for status change */}
            {showCommentFor && (
              <div className="border-t border-border/30 pt-4 space-y-3">
                <p className="text-xs font-semibold text-text-secondary">
                  Comment for moving to <strong>{STATUS_LABELS[showCommentFor]}</strong> (optional)
                </p>
                <textarea
                  rows={2}
                  value={statusComment}
                  onChange={(e) => setStatusComment(e.target.value)}
                  placeholder="Add context for this status change…"
                  className="w-full px-4 py-2.5 bg-surface-variant/70 border border-border/30 focus:border-primary/20 rounded-xl outline-none text-sm text-text-primary transition-all resize-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowCommentFor(null)}
                    className="px-3 py-2 bg-surface-variant rounded-lg text-xs font-bold text-muted hover:bg-border transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleStatusChange(showCommentFor)}
                    disabled={savingStatus}
                    className="px-4 py-2 btn-primary rounded-lg text-xs disabled:opacity-60"
                  >
                    {savingStatus ? 'Saving…' : 'Confirm'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* ── Right col: meta + history ── */}
        <div className="space-y-6">
          {/* Meta card */}
          <motion.div variants={itemVariants} className="glass-card p-5 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted">Task Info</h3>

            <MetaRow icon={<CheckSquare size={13} />} label="Status">
              <span className={cn('px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border', STATUS_STYLES[task.status])}>
                {STATUS_LABELS[task.status]}
              </span>
            </MetaRow>

            <MetaRow icon={<SlidersIcon />} label="Priority">
              <span className={cn('px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border', PRIORITY_STYLES[task.priority])}>
                {task.priority}
              </span>
            </MetaRow>

            <MetaRow icon={<User size={13} />} label="Assigned To">
              <span className="text-xs font-semibold text-text-secondary">{task.assigneeName}</span>
            </MetaRow>

            {task.assignerName && (
              <MetaRow icon={<User size={13} />} label="Assigned By">
                <span className="text-xs font-semibold text-text-secondary">{task.assignerName}</span>
              </MetaRow>
            )}

            <MetaRow icon={<Clock size={13} />} label="Due Date">
              <span className={cn('text-xs font-semibold', task.overdue ? 'text-error' : 'text-text-secondary')}>
                {formatDate(task.dueDate)}
              </span>
            </MetaRow>

            <MetaRow icon={<CalendarDays size={13} />} label="Created">
              <span className="text-xs text-text-secondary">{formatDate(task.createdAt)}</span>
            </MetaRow>
          </motion.div>

          {/* History timeline */}
          <motion.div variants={itemVariants} className="glass-card p-5 space-y-4">
            <div className="flex items-center gap-2">
              <History size={14} className="text-muted" />
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted">History</h3>
            </div>

            {historyLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-surface-variant animate-pulse mt-1.5 flex-shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 w-24 bg-surface-variant rounded animate-pulse" />
                      <div className="h-2.5 w-32 bg-surface-variant rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : history.length === 0 ? (
              <p className="text-xs text-muted italic">No history yet.</p>
            ) : (
              <div className="relative space-y-0">
                {/* Vertical line */}
                <div className="absolute left-[5px] top-2 bottom-2 w-px bg-border/40" />

                {history.map((h, idx) => (
                  <div key={h.id} className="flex gap-3 pb-4 last:pb-0 relative">
                    {/* Dot */}
                    <div className={cn(
                      'w-3 h-3 rounded-full border-2 flex-shrink-0 mt-0.5 z-10',
                      h.newStatus === 'COMPLETED'   ? 'bg-success border-success' :
                      h.newStatus === 'IN_PROGRESS' ? 'bg-primary border-primary' :
                      h.newStatus === 'CANCELLED'   ? 'bg-error border-error'   :
                                                      'bg-warning border-warning'
                    )} />

                    <div className="flex-1 min-w-0">
                      {/* Actor + time */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-black text-text-primary truncate">{h.byName}</span>
                        <span className="text-[9px] text-muted flex-shrink-0">{relativeTime(h.at)}</span>
                      </div>

                      {/* Status change */}
                      <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                        {h.oldStatus && (
                          <>
                            <span className={cn('text-[9px] px-1.5 py-0.5 rounded font-bold border', STATUS_STYLES[h.oldStatus])}>
                              {STATUS_LABELS[h.oldStatus]}
                            </span>
                            <ChevronRight size={8} className="text-muted" />
                          </>
                        )}
                        <span className={cn('text-[9px] px-1.5 py-0.5 rounded font-bold border', STATUS_STYLES[h.newStatus])}>
                          {STATUS_LABELS[h.newStatus]}
                        </span>
                      </div>

                      {/* Comment */}
                      {h.comment && (
                        <p className="text-[10px] text-muted mt-1 leading-tight italic">"{h.comment}"</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Helper sub-components ────────────────────────────────────────────────────

function MetaRow({
  icon,
  label,
  children,
}: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-1.5 text-muted text-xs font-semibold">
        {icon}
        {label}
      </div>
      {children}
    </div>
  );
}

function SlidersIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" /><line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" /><line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" /><line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" />
    </svg>
  );
}

export default TaskDetailPage;
