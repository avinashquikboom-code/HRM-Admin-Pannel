"use client";

import { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Check, 
  X, 
  Plus, 
  User, 
  FileText, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Search,
  Filter,
  UserCheck
} from 'lucide-react';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import Modal from '@/components/Modal';
import TableSkeleton from '@/components/TableSkeleton';

import { 
  mockLeaveRequests as initialLeaveRequests, 
  mockLeaveBalances, 
  mockHolidays 
} from '@/data/mockData';

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
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

const LeavePage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [leaveRequests, setLeaveRequests] = useState(initialLeaveRequests);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');

  // Form State
  const [employeeName, setEmployeeName] = useState('Sarah Johnson');
  const [leaveType, setLeaveType] = useState('Casual Leave');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Handlers
  const handleApprove = (id: string) => {
    setLeaveRequests(prev => prev.map(req => 
      req.id === id ? { ...req, status: 'Approved' } : req
    ));
  };

  const handleReject = (id: string) => {
    setLeaveRequests(prev => prev.map(req => 
      req.id === id ? { ...req, status: 'Rejected' } : req
    ));
  };

  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason) return;

    const newRequest = {
      id: `LR-${Math.floor(100 + Math.random() * 900)}`,
      employeeName,
      type: leaveType,
      startDate,
      endDate,
      reason,
      status: 'Pending'
    };

    setLeaveRequests(prev => [newRequest, ...prev]);
    setIsApplyModalOpen(false);

    // Reset Form
    setStartDate('');
    setEndDate('');
    setReason('');
  };

  // Stats Counters
  const totalRequests = leaveRequests.length;
  const pendingRequests = leaveRequests.filter(r => r.status === 'Pending').length;
  const approvedRequests = leaveRequests.filter(r => r.status === 'Approved').length;

  const filteredRequests = leaveRequests.filter(req => {
    const matchesSearch = req.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          req.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || req.type === filterType;
    return matchesSearch && matchesType;
  });

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
          <h1 className="heading-1">Leave Governance</h1>
          <p className="text-text-secondary mt-1">Orchestrate time-off allocations, leave balance records, and holiday cycles.</p>
        </div>
        <button 
          onClick={() => setIsApplyModalOpen(true)}
          className="btn-primary shadow-lg shadow-primary/20"
        >
          <Plus size={20} />
          Apply Time-Off
        </button>
      </motion.div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Leave Requests', value: totalRequests, icon: FileText, color: 'primary', bg: 'bg-primary/10' },
          { label: 'Pending Approvals', value: pendingRequests, icon: Clock, color: 'warning', bg: 'bg-warning/10' },
          { label: 'Approved Requests', value: approvedRequests, icon: CheckCircle2, color: 'success', bg: 'bg-success/10' },
          { label: 'Upcoming Holidays', value: mockHolidays.length, icon: CalendarIcon, color: 'accent', bg: 'bg-accent/10' },
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

      {/* Mid Section: Balance Sheet & Holidays */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Leave Balance Sheet */}
        <motion.div variants={itemVariants} className="xl:col-span-2 glass-card p-8 space-y-6 relative overflow-hidden group">
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-1000" />
          <div>
            <h3 className="heading-2">Leave Balance Ledger</h3>
            <p className="text-sm text-text-secondary mt-1">Summary of active allowances per employee</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-variant/50">
                  <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-widest border-b border-border">Employee</th>
                  <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-widest border-b border-border text-center">Casual</th>
                  <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-widest border-b border-border text-center">Sick</th>
                  <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-widest border-b border-border text-center">Earned</th>
                  <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-widest border-b border-border text-center">Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {mockLeaveBalances.map((bal) => (
                  <tr key={bal.employeeId} className="hover:bg-surface-variant/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-xs">
                          {bal.name.substring(0, 2)}
                        </div>
                        <span className="font-bold text-text-primary">{bal.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-text-primary tabular-nums">{bal.casual}</td>
                    <td className="px-6 py-4 text-center font-bold text-text-primary tabular-nums">{bal.sick}</td>
                    <td className="px-6 py-4 text-center font-bold text-text-primary tabular-nums">{bal.earned}</td>
                    <td className="px-6 py-4 text-center font-bold text-text-primary tabular-nums">{bal.paid}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Corporate Holidays */}
        <motion.div variants={itemVariants} className="glass-card p-8 space-y-6">
          <div>
            <h3 className="heading-2">Holiday Calendar</h3>
            <p className="text-sm text-text-secondary mt-1">Official scheduled corporate holidays</p>
          </div>
          
          <div className="space-y-4">
            {mockHolidays.map((hol, idx) => (
              <div 
                key={idx} 
                className="flex items-center justify-between p-4 rounded-2xl bg-surface-variant group hover:bg-surface border border-transparent hover:border-border transition-all shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-primary/10 rounded-xl text-primary transition-transform group-hover:scale-110">
                    <CalendarIcon size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors">{hol.name}</p>
                    <p className="text-[10px] text-text-secondary uppercase font-bold tracking-widest">{hol.date}</p>
                  </div>
                </div>
                <span className={cn(
                  "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border",
                  hol.type === 'National' ? 'bg-success/10 text-success border-success/10' :
                  hol.type === 'Gazetted' ? 'bg-primary/10 text-primary border-primary/10' : 'bg-accent/10 text-accent border-accent/10'
                )}>
                  {hol.type}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Filter and Table Section */}
      <motion.div variants={itemVariants} className="space-y-6">
        <div className="flex flex-col xl:flex-row gap-4 items-center justify-between glass-card p-4">
          <div className="relative w-full xl:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search request logs..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-surface-variant border border-transparent focus:border-primary/20 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 transition-all font-medium"
            />
          </div>
          <div className="flex items-center gap-3 w-full xl:w-auto">
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full xl:w-48 bg-surface-variant border border-transparent hover:border-primary/10 rounded-2xl px-4 py-3 text-sm outline-none font-bold text-text-secondary cursor-pointer transition-all"
            >
              <option value="All">All Types</option>
              <option value="Casual Leave">Casual Leave</option>
              <option value="Sick Leave">Sick Leave</option>
              <option value="Paid Leave">Paid Leave</option>
            </select>
          </div>
        </div>

        {/* Requests Table */}
        {isLoading ? (
          <div className="glass-card p-8">
            <TableSkeleton rows={3} columns={5} />
          </div>
        ) : (
          <motion.div variants={itemVariants} className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-variant/50 border-b border-border">
                    <th className="px-8 py-5 text-xs font-bold text-text-secondary uppercase tracking-widest">Requester</th>
                    <th className="px-8 py-5 text-xs font-bold text-text-secondary uppercase tracking-widest">Type</th>
                    <th className="px-8 py-5 text-xs font-bold text-text-secondary uppercase tracking-widest text-center">Period</th>
                    <th className="px-8 py-5 text-xs font-bold text-text-secondary uppercase tracking-widest">Reason</th>
                    <th className="px-8 py-5 text-xs font-bold text-text-secondary uppercase tracking-widest">Status</th>
                    <th className="px-8 py-5 text-xs font-bold text-text-secondary uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <AnimatePresence mode="popLayout">
                    {filteredRequests.map((req) => (
                      <motion.tr 
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        key={req.id}
                        className="hover:bg-surface-variant/30 transition-colors group cursor-default"
                      >
                        <td className="px-8 py-6">
                          <span className="font-black text-text-primary group-hover:text-primary transition-colors tracking-tight">
                            {req.employeeName}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <span className="text-xs font-bold text-text-secondary">{req.type}</span>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <span className="font-mono text-xs font-black text-muted bg-surface-variant px-2.5 py-1.5 rounded-xl border border-border shadow-sm">
                            {req.startDate} to {req.endDate}
                          </span>
                        </td>
                        <td className="px-8 py-6 font-medium text-text-secondary max-w-xs truncate">{req.reason}</td>
                        <td className="px-8 py-6">
                          <span className={cn(
                            "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-2 border shadow-sm",
                            req.status === 'Approved' ? "bg-success/10 text-success border-success/10" : 
                            req.status === 'Rejected' ? "bg-error/10 text-error border-error/10" : "bg-warning/10 text-warning border-warning/10"
                          )}>
                            <span className={cn(
                              "w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentColor]",
                              req.status === 'Approved' ? "bg-success" : 
                              req.status === 'Rejected' ? "bg-error" : "bg-warning animate-pulse"
                            )} />
                            {req.status}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          {req.status === 'Pending' ? (
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => handleApprove(req.id)}
                                className="p-2 bg-success/10 hover:bg-success hover:text-white rounded-xl text-success transition-all shadow-sm active:scale-90"
                                title="Approve Request"
                              >
                                <Check size={18} />
                              </button>
                              <button 
                                onClick={() => handleReject(req.id)}
                                className="p-2 bg-error/10 hover:bg-error hover:text-white rounded-xl text-error transition-all shadow-sm active:scale-90"
                                title="Reject Request"
                              >
                                <X size={18} />
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs font-bold text-muted select-none">No Action Required</span>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Apply Leave Modal */}
      <Modal isOpen={isApplyModalOpen} onClose={() => setIsApplyModalOpen(false)} title="Apply Time-Off Allocation">
        <form onSubmit={handleApplyLeave} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] ml-1">Employee Profile</label>
            <select 
              value={employeeName}
              onChange={(e) => setEmployeeName(e.target.value)}
              className="w-full px-6 py-4 bg-surface-variant/50 border-2 border-transparent focus:border-primary/20 rounded-[20px] outline-none text-sm font-bold text-text-primary cursor-pointer transition-all"
            >
              {mockLeaveBalances.map(bal => (
                <option key={bal.employeeId} value={bal.name}>{bal.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] ml-1">Time-Off Tier</label>
            <select 
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
              className="w-full px-6 py-4 bg-surface-variant/50 border-2 border-transparent focus:border-primary/20 rounded-[20px] outline-none text-sm font-bold text-text-primary cursor-pointer transition-all"
            >
              <option value="Casual Leave">Casual Leave</option>
              <option value="Sick Leave">Sick Leave</option>
              <option value="Paid Leave">Paid Leave</option>
              <option value="Earned Leave">Earned Leave</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] ml-1">Start Date</label>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full px-6 py-4 bg-surface-variant/50 border-2 border-transparent focus:border-primary/20 rounded-[20px] outline-none text-sm font-bold text-text-primary transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] ml-1">End Date</label>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="w-full px-6 py-4 bg-surface-variant/50 border-2 border-transparent focus:border-primary/20 rounded-[20px] outline-none text-sm font-bold text-text-primary transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] ml-1">Reason for Request</label>
            <textarea 
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide a detailed justification for the time-off..."
              required
              className="w-full px-6 py-4 bg-surface-variant/50 border-2 border-transparent focus:border-primary/20 rounded-[20px] outline-none text-sm font-bold text-text-primary transition-all placeholder:text-muted/60"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              type="button" 
              onClick={() => setIsApplyModalOpen(false)}
              className="flex-1 px-6 py-4 bg-surface-variant rounded-[20px] text-xs font-black uppercase tracking-widest text-text-secondary hover:bg-border transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="flex-1 btn-primary py-4 rounded-[20px] shadow-lg shadow-primary/25"
            >
              Submit Allocation
            </button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};

export default LeavePage;
