"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { 
  CheckSquare, 
  Plus, 
  Clock, 
  AlertCircle, 
  ArrowRight, 
  CheckCircle,
  Play,
  RotateCcw,
  User,
  SlidersHorizontal,
  Search,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import Modal from '@/components/Modal';
import ConfirmModal from '@/components/ConfirmModal';
import TableSkeleton from '@/components/TableSkeleton';
import TaskCommentsPanel from '@/features/tasks/components/TaskCommentsPanel';

import { api } from '@/lib/api';
import { useEmployees } from '@/hooks/useEmployees';
import SuperAdminHeader from '@/components/SuperAdminHeader';
import { useAppSelector } from '@/store/hooks';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

const columnNames = ['To Do', 'In Progress', 'Under Review', 'Completed'] as const;
type TaskStatus = typeof columnNames[number];

const TasksPage = () => {
  const portal = useAppSelector((state) => state.auth.portal);
  const isEmployee = portal === 'employee';

  const [isLoading, setIsLoading] = useState(true);
  const [tasks, setTasks] = useState<any[]>([]);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [priority, setPriority] = useState('High');
  const [deadline, setDeadline] = useState('');
  const [description, setDescription] = useState('');
  const { employees } = useEmployees(!isEmployee);

  const loadTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const endpoint = isEmployee ? '/api/employee/tasks' : '/api/super-admin/tasks';
      const res = await api.get<{ success: boolean; tasks: any[] }>(endpoint);
      if (res.data.success) {
        if (isEmployee) {
          const mapped = res.data.tasks.map((t: any) => {
            const rawStatus = (t.status || '').toUpperCase();
            const statusStr = rawStatus === 'COMPLETED' ? 'Completed' :
                              rawStatus === 'UNDERREVIEW' || rawStatus === 'UNDER_REVIEW' ? 'Under Review' :
                              rawStatus === 'INPROGRESS' || rawStatus === 'IN_PROGRESS' ? 'In Progress' :
                              rawStatus === 'OVERDUE' ? 'Overdue' : 'To Do';

            const progressVal = statusStr === 'Completed' ? 100 :
                                statusStr === 'Under Review' ? 90 :
                                statusStr === 'In Progress' ? 40 : 0;

            const rawPriority = (t.priority || '').toLowerCase();
            const priorityStr = rawPriority === 'high' ? 'High' : rawPriority === 'medium' ? 'Medium' : 'Low';

            let deadlineStr = '';
            try {
              if (t.dueDate) {
                const d = new Date(t.dueDate);
                if (!isNaN(d.getTime())) {
                  deadlineStr = d.toISOString().split('T')[0];
                }
              }
            } catch (e) {
              deadlineStr = '';
            }

            return {
              id: t.id,
              title: t.title || '',
              description: t.description || '',
              assignee: t.assignedToName || 'Unassigned',
              assigneeId: t.assignedToId || '',
              priority: priorityStr,
              status: statusStr,
              deadline: deadlineStr,
              projectName: t.projectName || 'General',
              progress: progressVal,
            };
          });
          setTasks(mapped);
        } else {
          setTasks(res.data.tasks);
        }
      }
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isEmployee]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const displayEmployees = useMemo(() => {
    return employees.map(emp => ({
      id: String(emp.id),
      name: `${emp.firstName} ${emp.lastName}`,
      code: emp.employeeCode
    }));
  }, [employees]);

  useEffect(() => {
    if (displayEmployees.length > 0 && !assigneeId) {
      setAssigneeId(displayEmployees[0].id);
    }
  }, [displayEmployees, assigneeId]);

  const handleStatusChange = async (taskId: string, nextStatus: TaskStatus) => {
    try {
      if (isEmployee) {
        let employeeStatus = 'todo';
        if (nextStatus === 'In Progress') {
          employeeStatus = 'inProgress';
        } else if (nextStatus === 'Under Review') {
          employeeStatus = 'underReview';
        } else if (nextStatus === 'Completed') {
          employeeStatus = 'completed';
        }
        await api.put(`/api/employee/tasks/${taskId}`, {
          status: employeeStatus
        });
      } else {
        const nextProgress = nextStatus === 'Completed' ? 100 : nextStatus === 'Under Review' ? 90 : nextStatus === 'In Progress' ? 40 : 0;
        await api.put(`/api/super-admin/tasks/${taskId}`, {
          status: nextStatus,
          progress: nextProgress
        });
      }
      await loadTasks();
    } catch (err) {
      console.error('Failed to update task status:', err);
      toast.error(err instanceof Error ? err.message : 'Operation failed');
    }
  };

  const handleAssignTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !deadline || !description || !assigneeId) return;

    try {
      const selectedEmp = displayEmployees.find(emp => emp.id === assigneeId);
      if (!selectedEmp) {
        toast.error('Please select an assignee.');
        return;
      }

      await api.post('/api/super-admin/tasks', {
        title,
        description,
        assigneeId: selectedEmp.id,
        priority: priority.toLowerCase(),
        deadline,
        projectName: 'General'
      });

      await loadTasks();
      setIsAssignModalOpen(false);

      // Reset Form
      setTitle('');
      setDescription('');
      setDeadline('');
      setPriority('High');
    } catch (err) {
      console.error('Failed to assign task:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to assign task');
    }
  };

  const handleDeleteTask = (taskId: string) => {
    setDeletingTaskId(taskId);
  };

  const executeDeleteTask = async () => {
    if (!deletingTaskId) return;

    try {
      await api.delete(`/api/super-admin/tasks/${deletingTaskId}`);
      await loadTasks();
    } catch (err) {
      console.error('Failed to delete task:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to delete task');
    }
    setDeletingTaskId(null);
  };

  // KPIs Calculations
  const totalTasks = tasks.length;
  const inProgressCount = tasks.filter(t => t.status === 'In Progress').length;
  const underReviewCount = tasks.filter(t => t.status === 'Under Review').length;
  const completedCount = tasks.filter(t => t.status === 'Completed').length;
  const activeSprintCount = inProgressCount + underReviewCount;
  const completionRate = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  const selectedTask = tasks.find((task) => task.id === selectedTaskId) ?? null;

  const filteredTasks = tasks.filter(t =>
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.assignee.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8 pb-10 text-slate-100 animate-fadeIn"
    >
      <SuperAdminHeader
        title={isEmployee ? "My Tasks" : "Task Orchestration"}
        subtitle={isEmployee ? "Track your assigned deliverables, update status, and manage deadlines." : "Assign deliverable tasks, track real-time project velocities, manage employee capacities, and monitor deadlines."}
        badgeText={isEmployee ? "My Velocity & Deliverables" : "Corporate Velocity & Execution"}
        badgeIcon={CheckSquare}
        stats={[
          { label: isEmployee ? 'Total Assigned' : 'Total Sprint Deliverables', value: totalTasks.toString(), icon: CheckSquare },
          { label: isEmployee ? 'In Progress' : 'Active Sprint Tasks', value: activeSprintCount.toString(), icon: Play },
          { label: 'Completed', value: completedCount.toString(), icon: CheckCircle2 },
          { label: isEmployee ? 'Completion Rate' : 'Sprint Completion Velocity', value: `${completionRate}%`, icon: SlidersHorizontal }
        ]}
      >
        {!isEmployee && (
          <button 
            onClick={() => setIsAssignModalOpen(true)}
            className="btn-primary group shadow-xl shadow-primary/20 flex items-center gap-2"
          >
            <Plus size={18} className="group-hover:rotate-12 transition-transform" />
            Assign Task
          </button>
        )}
      </SuperAdminHeader>

      
      {/* Search Bar */}
      <motion.div variants={itemVariants} className="flex flex-col xl:flex-row gap-4 items-center justify-between glass-card p-4">
        <div className="relative w-full xl:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search deliverables, descriptions, assignees..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-surface-variant border border-transparent focus:border-primary/20 rounded-sm outline-none focus:ring-4 focus:ring-primary/5 transition-all font-medium"
          />
        </div>
      </motion.div>

      {/* Task Kanban Columns Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass-card p-6 space-y-4">
              <div className="h-6 w-24 bg-surface-variant rounded-md animate-pulse" />
              <TableSkeleton rows={2} columns={1} />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
          {columnNames.map((colName) => {
            const columnTasks = filteredTasks.filter(t => t.status === colName);
            
            return (
              <motion.div 
                key={colName}
                variants={itemVariants}
                className="flex flex-col bg-slate-900/40 border border-white/5 shadow-2xl backdrop-blur-md rounded-[28px] p-4 space-y-4 min-h-[500px]"
              >
                {/* Column Title */}
                <div className="flex items-center justify-between px-3 py-1">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "w-2 h-2 rounded-full",
                      colName === 'To Do' ? 'bg-muted animate-pulse' :
                      colName === 'In Progress' ? 'bg-primary animate-pulse' :
                      colName === 'Under Review' ? 'bg-accent animate-pulse' : 'bg-success animate-pulse'
                    )} />
                    <h3 className="text-sm font-black text-text-primary uppercase tracking-wider">{colName}</h3>
                  </div>
                  <span className="font-mono text-xs font-black text-muted bg-surface-variant px-2.5 py-0.5 rounded-lg border border-border shadow-sm">
                    {columnTasks.length}
                  </span>
                </div>

                {/* Column Items */}
                <div className="space-y-4 overflow-y-auto no-scrollbar flex-grow">
                  <AnimatePresence mode="popLayout">
                    {columnTasks.map((task) => (
                      <motion.div 
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        key={task.id}
                        onClick={() => !isEmployee && setSelectedTaskId(task.id)}
                        className={cn(
                          "glass-card p-5 border border-border/60 relative overflow-hidden bg-surface transition-all duration-300 group",
                          !isEmployee ? "hover:border-primary/50 hover:shadow-[0_0_20px_rgba(59,163,139,0.12)] hover:-translate-y-1 cursor-pointer" : "cursor-default"
                        )}
                      >
                        {/* Background Overlay */}
                        <div className={cn(
                          "absolute -right-12 -top-12 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-15 transition-opacity duration-500",
                          task.priority === 'High' ? 'bg-error' : task.priority === 'Medium' ? 'bg-warning' : 'bg-success'
                        )} />

                        {/* Card Header: Task ID & Priority */}
                        <div className="flex items-center justify-between mb-3 relative z-10">
                          <span className="font-mono text-micro font-black text-muted uppercase tracking-widest">{task.id}</span>
                          <span className={cn(
                            "px-2.5 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-wider border",
                            task.priority === 'High' ? 'bg-error/10 text-error border-error/10' :
                            task.priority === 'Medium' ? 'bg-warning/10 text-warning border-warning/10' : 'bg-success/10 text-success border-success/10'
                          )}>
                            {task.priority} Priority
                          </span>
                        </div>

                        {/* Title & Description */}
                        <div className="space-y-1 relative z-10 mb-4">
                          <h4 className="text-sm font-black text-text-primary group-hover:text-primary transition-colors leading-tight tracking-tight">
                            {task.title}
                          </h4>
                          <p className="text-xs text-text-secondary line-clamp-2 leading-normal">
                            {task.description}
                          </p>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-1 mb-4">
                          <div className="flex justify-between items-center text-micro font-black uppercase tracking-widest text-muted">
                            <span>Progress</span>
                            <span>{task.progress}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-surface-variant rounded-full overflow-hidden border border-border/20">
                            <div 
                              className={cn(
                                "h-full rounded-full transition-all duration-500",
                                task.status === 'Completed' ? 'bg-success' : 'bg-primary'
                              )} 
                              style={{ width: `${task.progress}%` }}
                            />
                          </div>
                        </div>

                        {/* Assignee & Footer */}
                        <div className="flex items-center justify-between pt-3 border-t border-border/40 relative z-10">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-micro font-bold border border-primary/10 shadow-sm">
                              {task.assignee.substring(0, 2)}
                            </div>
                            <span className="text-micro font-bold text-text-secondary">{task.assignee}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Clock size={12} className="text-muted" />
                            <span className="text-micro font-black text-muted tracking-tight">{task.deadline}</span>
                          </div>
                        </div>

                        {/* Status Progression Controls */}
                        <div className="mt-4 pt-3 border-t border-border/40 flex justify-between items-center">
                          {!isEmployee ? (
                            <button 
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTask(task.id);
                              }}
                              className="p-1.5 bg-error/10 text-error hover:bg-error hover:text-white rounded-lg transition-all border border-error/10 active:scale-95 animate-transition"
                              title="Delete Task"
                            >
                              <Trash2 size={12} />
                            </button>
                          ) : (
                            <div />
                          )}
                          <div className="flex gap-1.5">
                            {colName !== 'To Do' && (
                              <button 
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const prevIdx = columnNames.indexOf(colName) - 1;
                                  handleStatusChange(task.id, columnNames[prevIdx]);
                                }}
                                className="p-1.5 bg-surface-variant text-muted hover:text-text-primary rounded-lg transition-colors border border-border/20 active:scale-95"
                                title="Regress Status"
                              >
                                <RotateCcw size={12} />
                              </button>
                            )}
                            {colName !== 'Completed' && (
                              <button 
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const nextIdx = columnNames.indexOf(colName) + 1;
                                  handleStatusChange(task.id, columnNames[nextIdx]);
                                }}
                                className="p-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg transition-all border border-primary/10 active:scale-95 flex items-center gap-1 text-label tracking-wider px-2"
                              >
                                <span>Next</span>
                                <ArrowRight size={10} />
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Assign Task Modal */}
      <Modal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} title="Assign Sprint Deliverable">
        <form onSubmit={handleAssignTask} className="space-y-6">
          <div className="space-y-2">
            <label className="text-label text-text-secondary tracking-[0.2em] ml-1">Task Title</label>
            <input 
              type="text" 
              placeholder="e.g. Optimize Ledger API Endpoints"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-6 py-4 bg-surface-variant/50 border-2 border-transparent focus:border-primary/20 rounded-[20px] outline-none text-sm font-bold text-text-primary transition-all placeholder:text-muted/60"
            />
          </div>

          <div className="space-y-2">
            <label className="text-label text-text-secondary tracking-[0.2em] ml-1">Assignee</label>
            <select 
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="w-full px-6 py-4 bg-surface-variant/50 border-2 border-transparent focus:border-primary/20 rounded-[20px] outline-none text-sm font-bold text-text-primary cursor-pointer transition-all"
            >
              {displayEmployees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.code})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-label text-text-secondary tracking-[0.2em] ml-1">Priority Tier</label>
              <select 
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-6 py-4 bg-surface-variant/50 border-2 border-transparent focus:border-primary/20 rounded-[20px] outline-none text-sm font-bold text-text-primary cursor-pointer transition-all"
              >
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-label text-text-secondary tracking-[0.2em] ml-1">Target Deadline</label>
              <input 
                type="date" 
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                onClick={(e) => {
                  try {
                    e.currentTarget.showPicker();
                  } catch (err) {}
                }}
                required
                className="w-full px-6 py-4 bg-surface-variant/50 border-2 border-transparent focus:border-primary/20 rounded-[20px] outline-none text-sm font-bold text-text-primary transition-all cursor-pointer"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-label text-text-secondary tracking-[0.2em] ml-1">Deliverable Description</label>
            <textarea 
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="State the core parameters and goals for this deliverable..."
              required
              className="w-full px-6 py-4 bg-surface-variant/50 border-2 border-transparent focus:border-primary/20 rounded-[20px] outline-none text-sm font-bold text-text-primary transition-all placeholder:text-muted/60"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              type="button" 
              onClick={() => setIsAssignModalOpen(false)}
              className="flex-1 px-6 py-4 bg-surface-variant rounded-[20px] text-xs font-black uppercase tracking-widest text-text-secondary hover:bg-border transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="flex-1 btn-primary py-4 rounded-[20px] shadow-lg shadow-primary/25"
            >
              Confirm Assignment
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={Boolean(selectedTask)}
        onClose={() => setSelectedTaskId(null)}
        title={selectedTask ? `${selectedTask.id} · Comments` : 'Task Comments'}
      >
        {selectedTask && (
          <TaskCommentsPanel
            taskId={selectedTask.id}
            taskTitle={selectedTask.title}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingTaskId}
        onClose={() => setDeletingTaskId(null)}
        onConfirm={executeDeleteTask}
        title="Delete Task?"
        message="Are you sure you want to delete this task? This action cannot be undone."
        confirmText="Delete Task"
      />
    </motion.div>
  );
};

export default TasksPage;
