"use client";

import { useState, useEffect } from 'react';
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
  CheckCircle2
} from 'lucide-react';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import Modal from '@/components/Modal';
import TableSkeleton from '@/components/TableSkeleton';
import TaskCommentsPanel from '@/features/tasks/components/TaskCommentsPanel';

import { mockTasks as initialTasks, mockEmployees } from '@/data/mockData';

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
  const [isLoading, setIsLoading] = useState(true);
  const [tasks, setTasks] = useState(initialTasks);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [assignee, setAssignee] = useState('Sarah Johnson');
  const [priority, setPriority] = useState('High');
  const [deadline, setDeadline] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleStatusChange = (taskId: string, nextStatus: TaskStatus) => {
    setTasks(prev => prev.map(t => 
      t.id === taskId 
        ? { ...t, status: nextStatus, progress: nextStatus === 'Completed' ? 100 : nextStatus === 'Under Review' ? 90 : nextStatus === 'In Progress' ? 40 : 0 } 
        : t
    ));
  };

  const handleAssignTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !deadline || !description) return;

    const newTask = {
      id: `TSK-${Math.floor(200 + Math.random() * 800)}`,
      title,
      description,
      assignee,
      priority,
      status: 'To Do' as TaskStatus,
      deadline,
      progress: 0
    };

    setTasks(prev => [...prev, newTask]);
    setIsAssignModalOpen(false);

    // Reset Form
    setTitle('');
    setDescription('');
    setDeadline('');
    setPriority('High');
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
      className="space-y-8 pb-10"
    >
      {/* Header Section */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="heading-1">Task Orchestrator</h1>
          <p className="text-text-secondary mt-1">Assign deliverables, monitor project velocities, and manage deadlines.</p>
        </div>
        <button 
          onClick={() => setIsAssignModalOpen(true)}
          className="btn-primary shadow-lg shadow-primary/20"
        >
          <Plus size={20} />
          Assign Task
        </button>
      </motion.div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Sprint Deliverables', value: totalTasks, icon: CheckSquare, color: 'primary', bg: 'bg-primary/10' },
          { label: 'Active Sprint Tasks', value: activeSprintCount, icon: Play, color: 'secondary', bg: 'bg-secondary/10' },
          { label: 'Completed Deliverables', value: completedCount, icon: CheckCircle2, color: 'success', bg: 'bg-success/10' },
          { label: 'Sprint Completion Velocity', value: `${completionRate}%`, icon: SlidersHorizontal, color: 'accent', bg: 'bg-accent/10' },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            variants={itemVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="glass-card p-6 relative overflow-hidden group"
          >
            <div className={cn("absolute -right-4 -top-4 w-24 h-24 rounded-full blur-2xl opacity-10 transition-transform group-hover:scale-150 duration-700", `bg-${stat.color}`)} />
            <div className="flex items-center gap-4 relative z-10">
              <div className={cn("p-4 rounded-2xl transition-transform group-hover:scale-110 duration-300", stat.bg, `text-${stat.color}`)}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-text-secondary uppercase tracking-wider">{stat.label}</p>
                <p className="text-3xl font-black text-text-primary mt-1 tracking-tight">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Search Bar */}
      <motion.div variants={itemVariants} className="flex flex-col xl:flex-row gap-4 items-center justify-between glass-card p-4">
        <div className="relative w-full xl:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search deliverables, descriptions, assignees..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-surface-variant border border-transparent focus:border-primary/20 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 transition-all font-medium"
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
                className="flex flex-col bg-surface/40 dark:bg-surface-variant/10 rounded-[28px] border border-border/40 p-4 space-y-4 min-h-[500px]"
              >
                {/* Column Title */}
                <div className="flex items-center justify-between px-3 py-1">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "w-2 h-2 rounded-full",
                      colName === 'To Do' ? 'bg-muted' :
                      colName === 'In Progress' ? 'bg-primary' :
                      colName === 'Under Review' ? 'bg-accent' : 'bg-success'
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
                        onClick={() => setSelectedTaskId(task.id)}
                        className="glass-card p-5 border border-border/60 hover:border-primary/30 transition-all duration-300 group cursor-pointer relative overflow-hidden bg-surface"
                      >
                        {/* Background Overlay */}
                        <div className={cn(
                          "absolute -right-12 -top-12 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-500",
                          task.priority === 'High' ? 'bg-error' : task.priority === 'Medium' ? 'bg-warning' : 'bg-success'
                        )} />

                        {/* Card Header: Task ID & Priority */}
                        <div className="flex items-center justify-between mb-3 relative z-10">
                          <span className="font-mono text-[9px] font-black text-muted uppercase tracking-widest">{task.id}</span>
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
                          <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-muted">
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
                            <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px] border border-primary/10 shadow-sm">
                              {task.assignee.substring(0, 2)}
                            </div>
                            <span className="text-[10px] font-bold text-text-secondary">{task.assignee}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Clock size={12} className="text-muted" />
                            <span className="text-[9px] font-black text-muted tracking-tight">{task.deadline}</span>
                          </div>
                        </div>

                        {/* Status Progression Controls */}
                        <div className="mt-4 pt-3 border-t border-border/40 flex justify-end gap-1.5">
                          {colName !== 'To Do' && (
                            <button 
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
                              onClick={(e) => {
                                e.stopPropagation();
                                const nextIdx = columnNames.indexOf(colName) + 1;
                                handleStatusChange(task.id, columnNames[nextIdx]);
                              }}
                              className="p-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg transition-all border border-primary/10 active:scale-95 flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2"
                            >
                              <span>Next</span>
                              <ArrowRight size={10} />
                            </button>
                          )}
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
            <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] ml-1">Task Title</label>
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
            <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] ml-1">Assignee</label>
            <select 
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              className="w-full px-6 py-4 bg-surface-variant/50 border-2 border-transparent focus:border-primary/20 rounded-[20px] outline-none text-sm font-bold text-text-primary cursor-pointer transition-all"
            >
              {mockEmployees.map(emp => (
                <option key={emp.id} value={emp.name}>{emp.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] ml-1">Priority Tier</label>
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
              <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] ml-1">Target Deadline</label>
              <input 
                type="date" 
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
                className="w-full px-6 py-4 bg-surface-variant/50 border-2 border-transparent focus:border-primary/20 rounded-[20px] outline-none text-sm font-bold text-text-primary transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] ml-1">Deliverable Description</label>
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
    </motion.div>
  );
};

export default TasksPage;
