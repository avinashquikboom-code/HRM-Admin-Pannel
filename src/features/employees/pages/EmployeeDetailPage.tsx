"use client";

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { motion, Variants } from 'framer-motion';
import {
  ArrowLeft,
  User,
  CheckSquare,
  Play,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import TableSkeleton from '@/components/TableSkeleton';
import { fetchEmployees, type AdminEmployee } from '@/services/employeeService';
import { fetchTaskStats, fetchTasks, type HrTask, type HrTaskStatus, type HrPriority, type TaskStats } from '@/services/taskService';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
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

const PRIORITY_STYLES: Record<HrPriority, string> = {
  HIGH:   'bg-error/10 text-error border-error/20',
  MEDIUM: 'bg-warning/10 text-warning border-warning/20',
  LOW:    'bg-success/10 text-success border-success/20',
};

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return '—'; }
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  /** The integer DB primary key from the URL segment */
  employeeIntId: string;
}

type Tab = 'info' | 'tasks';

const EmployeeDetailPage = ({ employeeIntId }: Props) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('tasks');

  // ── Employee data
  const [employee, setEmployee] = useState<AdminEmployee | null>(null);
  const [empLoading, setEmpLoading] = useState(true);

  // ── Task data (only loaded once employeeID is known)
  const [tasks, setTasks]   = useState<HrTask[]>([]);
  const [stats, setStats]   = useState<TaskStats | null>(null);
  const [taskLoading, setTaskLoading] = useState(false);
  const [taskTotal, setTaskTotal] = useState(0);

  // Load employee
  useEffect(() => {
    (async () => {
      setEmpLoading(true);
      try {
        // Fetch all employees and find the one matching the int ID
        // (the /api/admin/employees/:id endpoint may exist; using list+filter for robustness)
        const res = await fetchEmployees({ limit: 500 });
        const emp = res.employees.find((e) => String(e.id) === employeeIntId);
        if (emp) setEmployee(emp);
      } catch (err) {
        toast.error('Failed to load employee');
      } finally {
        setEmpLoading(false);
      }
    })();
  }, [employeeIntId]);

  // Load tasks once we have the employeeID
  const loadTasks = useCallback(async (employeeID: string) => {
    setTaskLoading(true);
    try {
      const [taskRes, statsRes] = await Promise.all([
        fetchTasks({ assignedTo: employeeID, limit: 50 }),
        fetchTaskStats(employeeID),
      ]);
      setTasks(taskRes.data);
      setTaskTotal(taskRes.meta.total);
      setStats(statsRes);
    } catch (err) {
      console.error('[EmployeeDetailPage] task load error', err);
    } finally {
      setTaskLoading(false);
    }
  }, []);

  useEffect(() => {
    if (employee?.employeeID) {
      loadTasks(employee.employeeID);
    }
  }, [employee, loadTasks]);

  if (empLoading) {
    return <div className="p-8"><TableSkeleton rows={4} columns={3} /></div>;
  }

  if (!employee) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <User size={48} className="text-muted/30" />
        <p className="text-text-secondary font-semibold">Employee not found</p>
        <button onClick={() => router.push('/employees')} className="btn-primary text-sm">
          ← Back to Employees
        </button>
      </div>
    );
  }

  const fullName = `${employee.firstName} ${employee.lastName}`.trim();

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6 pb-12 max-w-5xl"
    >
      {/* ── Back + Name ── */}
      <motion.div variants={itemVariants} className="flex items-center gap-4">
        <button
          onClick={() => router.push('/employees')}
          className="p-2 rounded-xl bg-surface-variant hover:bg-border transition-colors text-muted hover:text-text-primary"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-sm border border-primary/10">
              {fullName.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-lg font-black text-text-primary leading-tight">{fullName}</h1>
              <p className="text-xs text-muted">{employee.employeeCode} · {employee.designation ?? 'No designation'}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Tabs ── */}
      <motion.div variants={itemVariants} className="flex gap-1 bg-surface-variant p-1 rounded-xl w-fit">
        {(['tasks', 'info'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-5 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all',
              activeTab === tab
                ? 'bg-primary text-white shadow-md shadow-primary/20'
                : 'text-muted hover:text-text-primary'
            )}
          >
            {tab === 'tasks' ? '📋 Tasks' : '👤 Info'}
          </button>
        ))}
      </motion.div>

      {/* ── Tasks Tab ── */}
      {activeTab === 'tasks' && (
        <motion.div variants={itemVariants} className="space-y-6">
          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total',      value: stats?.assigned   ?? 0, icon: CheckSquare,  color: 'text-primary'  },
              { label: 'In Progress',value: stats?.inProgress ?? 0, icon: Play,         color: 'text-primary'  },
              { label: 'Completed',  value: stats?.completed  ?? 0, icon: CheckCircle2, color: 'text-success'  },
              { label: 'Overdue',    value: stats?.overdue    ?? 0, icon: AlertTriangle, color: 'text-error'   },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="glass-card p-4 flex items-center gap-3">
                <Icon size={18} className={color} />
                <div>
                  <p className={cn('text-xl font-black', color)}>{value}</p>
                  <p className="text-[10px] text-muted font-semibold uppercase tracking-wider">{label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Task list */}
          <div className="glass-card overflow-hidden">
            {!employee.employeeID ? (
              <div className="py-10 text-center text-sm text-muted">
                This employee has no HopKid employeeID — task assignment not available.
              </div>
            ) : taskLoading ? (
              <div className="p-6"><TableSkeleton rows={5} columns={4} /></div>
            ) : tasks.length === 0 ? (
              <div className="py-16 flex flex-col items-center gap-3">
                <CheckSquare size={40} className="text-muted/30" />
                <p className="text-sm text-text-secondary font-semibold">No tasks assigned yet</p>
                <button
                  onClick={() => router.push('/tasks')}
                  className="btn-primary text-xs flex items-center gap-1.5"
                >
                  <CheckSquare size={12} /> Assign a Task
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50 text-xs text-muted uppercase tracking-wider">
                      <th className="px-5 py-3.5 text-left font-black">Title</th>
                      <th className="px-4 py-3.5 text-left font-black">Priority</th>
                      <th className="px-4 py-3.5 text-left font-black">Due</th>
                      <th className="px-4 py-3.5 text-left font-black">Status</th>
                      <th className="px-4 py-3.5" />
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((task) => (
                      <tr
                        key={task.id}
                        className={cn(
                          'border-b border-border/20 hover:bg-surface-variant/40 transition-colors',
                          task.overdue && 'bg-error/3'
                        )}
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-start gap-1.5">
                            {task.overdue && <AlertTriangle size={11} className="text-error mt-0.5 flex-shrink-0" />}
                            <span className="font-semibold text-text-primary text-xs line-clamp-1">{task.title}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={cn('px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border', PRIORITY_STYLES[task.priority])}>
                            {task.priority}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className={cn('flex items-center gap-1 text-[10px] font-semibold', task.overdue ? 'text-error' : 'text-muted')}>
                            <Clock size={10} />
                            {formatDate(task.dueDate)}
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={cn('px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border', STATUS_STYLES[task.status])}>
                            {STATUS_LABELS[task.status]}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <button
                            onClick={() => router.push(`/tasks/${task.id}`)}
                            className="p-1.5 rounded-lg bg-surface-variant text-muted hover:text-primary transition-colors"
                            title="View task"
                          >
                            <ExternalLink size={11} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {taskTotal > 50 && (
                  <div className="px-5 py-3 text-xs text-muted border-t border-border/20">
                    Showing first 50 of {taskTotal} tasks —{' '}
                    <button
                      onClick={() => employee.employeeID && router.push(`/tasks?assignedTo=${employee.employeeID}`)}
                      className="text-primary hover:underline"
                    >
                      view all in Task Management
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* ── Info Tab ── */}
      {activeTab === 'info' && (
        <motion.div variants={itemVariants} className="glass-card p-6 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted">Employee Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
            {[
              { label: 'Employee Code',  value: employee.employeeCode },
              { label: 'HopKid ID',      value: employee.employeeID ?? '—' },
              { label: 'Designation',    value: employee.designation ?? '—' },
              { label: 'Department',     value: employee.department?.name ?? '—' },
              { label: 'Status',         value: employee.status },
              { label: 'Work Mode',      value: employee.workModeId ?? '—' },
              { label: 'Branch',         value: employee.branch?.name ?? '—' },
              { label: 'Store',          value: employee.store?.name ?? '—' },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center py-2 border-b border-border/20 last:border-0">
                <span className="text-xs text-muted font-semibold">{label}</span>
                <span className="text-xs text-text-secondary font-bold">{value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default EmployeeDetailPage;
