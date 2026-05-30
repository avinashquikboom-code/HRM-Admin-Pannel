"use client";

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { isDevAuthSession } from '@/lib/devAuth';
import Modal from '@/components/Modal';
import { 
  FileText, 
  Download, 
  Search, 
  Filter, 
  Calendar,
  FileSpreadsheet,
  FileCheck2,
  TrendingUp,
  Clock,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import { cn } from '@/utils/cn';
import TableSkeleton from '@/components/TableSkeleton';

const reports = [
  { id: 1, name: 'Monthly Payroll Summary - April 2024', type: 'Payroll', format: 'PDF', date: '01 May 2024', size: '2.4 MB', status: 'Verified' },
  { id: 2, name: 'Platform Revenue Report - Q1 2024', type: 'Financial', format: 'Excel', date: '15 Apr 2024', size: '1.8 MB', status: 'Verified' },
  { id: 3, name: 'Global Attendance Audit', type: 'Attendance', format: 'CSV', date: '10 Apr 2024', size: '4.2 MB', status: 'Pending' },
  { id: 4, name: 'Company Onboarding Analytics', type: 'System', format: 'PDF', date: '02 Apr 2024', size: '1.2 MB', status: 'Verified' },
  { id: 5, name: 'Tax Compliance Report', type: 'Compliance', format: 'PDF', date: '28 Mar 2024', size: '3.1 MB', status: 'Verified' },
];

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

const ReportsPage = () => {
  const [reportList, setReportList] = useState<any[]>(reports);
  const [isPageLoading, setIsPageLoading] = useState(true);
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [formatFilter, setFormatFilter] = useState('All');

  // Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newReportName, setNewReportName] = useState('');
  const [newReportType, setNewReportType] = useState('Payroll');
  const [newReportFormat, setNewReportFormat] = useState('PDF');
  const [isGenerating, setIsGenerating] = useState(false);

  const loadReportsData = useCallback(async () => {
    setIsPageLoading(true);
    try {
      if (isDevAuthSession()) {
        setReportList(reports);
      } else {
        const res = await api.get<{ success: boolean; reports: any[] }>('/api/admin/reports');
        if (res.data.success) {
          setReportList(res.data.reports);
        }
      }
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setIsPageLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReportsData();
  }, [loadReportsData]);

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      if (isDevAuthSession()) {
        const mockNew = {
          id: reportList.length + 1,
          name: newReportName || `Custom Generated ${newReportType} Report`,
          type: newReportType,
          format: newReportFormat,
          date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
          size: `${(Math.random() * 4 + 1).toFixed(1)} MB`,
          status: 'Verified'
        };
        setReportList(prev => [mockNew, ...prev]);
      } else {
        await api.post('/api/admin/reports/generate', {
          name: newReportName,
          type: newReportType,
          format: newReportFormat
        });
        await loadReportsData();
      }
      setIsCreateOpen(false);
      setNewReportName('');
    } catch (err) {
      console.error('Report generation failed:', err);
      alert('Report generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredReports = reportList.filter(rep => {
    const matchesSearch = rep.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          rep.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'All' || rep.type === typeFilter;
    const matchesFormat = formatFilter === 'All' || rep.format === formatFilter;
    return matchesSearch && matchesType && matchesFormat;
  });

  const isLoading = isPageLoading;

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8 pb-10"
    >
      {/* Header Section */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="heading-1 bg-clip-text text-transparent bg-gradient-to-r from-text-primary via-primary to-primary-light">
            Intelligence Center
          </h1>
          <p className="text-page-desc mt-1 max-w-2xl">
            Access, generate, and manage platform-wide analytics and compliance documentation.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-3 bg-surface border border-border rounded-2xl text-sm font-bold text-text-secondary hover:text-primary transition-all hover:shadow-lg active:scale-95">
            <Clock size={18} />
            History
          </button>
          <button 
            onClick={() => setIsCreateOpen(true)}
            className="btn-primary group shadow-xl shadow-primary/20"
          >
            <FileCheck2 size={20} className="group-hover:scale-110 transition-transform" />
            Generate Intelligence
          </button>
        </div>
      </motion.div>

      {/* Quick Access Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Intelligence', value: '1,284', icon: FileText, color: 'primary', trend: '+12%', bg: 'bg-primary/10' },
          { label: 'Cloud Exports', value: '156', icon: Download, color: 'success', trend: '+5%', bg: 'bg-success/10' },
          { label: 'Scheduled Tasks', value: '12', icon: Calendar, color: 'accent', trend: 'Steady', bg: 'bg-accent/10' },
          { label: 'Custom Blueprints', value: '45', icon: FileSpreadsheet, color: 'secondary', trend: '+2', bg: 'bg-secondary/10' },
        ].map((stat, i) => (
          <motion.div 
            key={i} 
            variants={itemVariants}
            whileHover={{ y: -5 }}
            className="glass-card p-6 relative overflow-hidden group cursor-default"
          >
            <div className={cn("absolute -right-4 -top-4 w-24 h-24 rounded-full blur-2xl opacity-20 transition-all group-hover:opacity-40", `bg-${stat.color}`)} />
            
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300", stat.bg, `text-${stat.color}`)}>
                <stat.icon size={24} />
              </div>
              <span className={cn(
                "text-micro font-black px-2 py-1 rounded-lg uppercase tracking-tighter",
                stat.trend.startsWith('+') ? "bg-success/10 text-success" : "bg-surface-variant text-muted"
              )}>
                {stat.trend}
              </span>
            </div>
            <div className="relative z-10">
              <p className="text-sm font-bold text-text-secondary uppercase tracking-wider">{stat.label}</p>
              <h3 className="text-stat-value mt-1">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filter Bar */}
      <motion.div variants={itemVariants} className="flex flex-col xl:flex-row gap-4 items-center justify-between glass-card p-4">
        <div className="relative w-full xl:w-[450px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search documentation, metadata, or report ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-surface-variant border border-transparent focus:border-primary/20 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 transition-all font-medium"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          <select 
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="flex-grow sm:flex-grow-0 bg-surface-variant border border-transparent hover:border-primary/10 rounded-2xl px-5 py-3.5 text-sm outline-none font-bold text-text-secondary cursor-pointer transition-all"
          >
            <option value="All">Classification: All</option>
            <option value="Payroll">Payroll</option>
            <option value="Financial">Financial</option>
            <option value="Attendance">Attendance</option>
            <option value="System">System</option>
            <option value="Compliance">Compliance</option>
          </select>
          <select 
            value={formatFilter}
            onChange={(e) => setFormatFilter(e.target.value)}
            className="flex-grow sm:flex-grow-0 bg-surface-variant border border-transparent hover:border-primary/10 rounded-2xl px-5 py-3.5 text-sm outline-none font-bold text-text-secondary cursor-pointer transition-all"
          >
            <option value="All">Format: All</option>
            <option value="PDF">PDF</option>
            <option value="Excel">Excel</option>
            <option value="CSV">CSV</option>
          </select>
          <button className="flex items-center gap-2 px-5 py-3.5 bg-surface-variant rounded-2xl text-sm font-bold text-text-secondary hover:text-primary transition-all border border-transparent hover:border-primary/10 flex-grow sm:flex-grow-0 justify-center">
            <Filter size={18} />
            Advanced
          </button>
        </div>
      </motion.div>

      {/* Reports List */}
      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <div className="glass-card p-8">
            <TableSkeleton rows={5} columns={4} />
          </div>
        ) : (
          filteredReports.map((report) => (
            <motion.div 
              key={report.id}
              variants={itemVariants}
              whileHover={{ x: 10 }}
              className="glass-card p-5 hover:border-primary/40 transition-all group cursor-pointer border-l-4 border-l-transparent hover:border-l-primary"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className={cn(
                    "w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black text-micro shadow-sm transition-transform group-hover:scale-110",
                    report.format === 'PDF' ? 'bg-error/10 text-error' : 
                    report.format === 'Excel' ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'
                  )}>
                    <FileText size={20} className="mb-0.5" />
                    {report.format}
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-text-primary group-hover:text-primary transition-colors tracking-tight">
                      {report.name}
                    </h4>
                    <div className="flex flex-wrap items-center gap-y-2 gap-x-6 mt-1.5">
                      <span className="text-xs font-bold text-text-secondary flex items-center gap-2">
                        <Calendar size={14} className="text-muted" />
                        {report.date}
                      </span>
                      <span className="text-xs font-bold text-text-secondary flex items-center gap-2">
                        <ShieldCheck size={14} className="text-primary" />
                        {report.type}
                      </span>
                      <span className="text-xs font-bold text-muted flex items-center gap-2">
                        <TrendingUp size={14} />
                        {report.size}
                      </span>
                      <span className={cn(
                        "text-micro font-black px-2 py-0.5 rounded-lg uppercase tracking-widest",
                        report.status === 'Verified' ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                      )}>
                        {report.status}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 self-end lg:self-center">
                  <button className="flex items-center gap-2 px-4 py-2 bg-surface-variant text-text-secondary hover:text-primary hover:bg-primary/5 rounded-xl text-xs font-bold transition-all border border-transparent hover:border-primary/10">
                    Preview
                  </button>
                  <button className="p-3 bg-surface-variant text-muted hover:text-white hover:bg-primary rounded-xl transition-all shadow-sm active:scale-90 group-hover:shadow-md">
                    <Download size={20} />
                  </button>
                  <button className="p-3 bg-surface-variant text-muted hover:text-text-primary rounded-xl transition-all">
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Pagination Footer */}
      <motion.div variants={itemVariants} className="flex items-center justify-between p-6 glass-card mt-8">
        <p className="text-sm text-text-secondary font-bold">
          Archiving <span className="text-text-primary">1,284</span> intelligence assets
        </p>
        <div className="flex items-center gap-3">
          <button className="px-5 py-2.5 bg-surface-variant rounded-xl text-xs font-black text-text-secondary hover:text-primary transition-all disabled:opacity-50" disabled>PREV</button>
          <div className="flex items-center gap-1">
            {[1, 2, 3, '...', 12].map((p, i) => (
              <button key={i} className={cn(
                "w-10 h-10 rounded-xl text-xs font-black transition-all",
                p === 1 ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-text-secondary hover:bg-surface-variant"
              )}>
                {p}
              </button>
            ))}
          </div>
          <button className="px-5 py-2.5 bg-surface-variant rounded-xl text-xs font-black text-text-secondary hover:text-primary transition-all">NEXT</button>
        </div>
      </motion.div>

      {/* Create Report Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Generate Custom Intelligence Blueprint">
        <form onSubmit={handleGenerateReport} className="space-y-6">
          <div className="space-y-2">
            <label className="text-label text-text-secondary tracking-[0.2em] ml-1">Report Blueprint Name</label>
            <input 
              type="text" 
              placeholder="e.g. Q2 Compliance Audit Ledger"
              value={newReportName}
              onChange={(e) => setNewReportName(e.target.value)}
              required
              className="w-full px-6 py-4 bg-surface-variant/50 border-2 border-transparent focus:border-primary/20 rounded-[20px] outline-none text-sm font-bold text-text-primary transition-all placeholder:text-muted/60"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-label text-text-secondary tracking-[0.2em] ml-1">Classification Category</label>
              <select 
                value={newReportType}
                onChange={(e) => setNewReportType(e.target.value)}
                className="w-full px-6 py-4 bg-surface-variant/50 border-2 border-transparent focus:border-primary/20 rounded-[20px] outline-none text-sm font-bold text-text-primary cursor-pointer transition-all"
              >
                <option value="Payroll">Payroll & Taxes</option>
                <option value="Financial">Financial Assets</option>
                <option value="Attendance">Attendance Ledger</option>
                <option value="System">System Metrics</option>
                <option value="Compliance">Compliance Audit</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-label text-text-secondary tracking-[0.2em] ml-1">Output Format</label>
              <select 
                value={newReportFormat}
                onChange={(e) => setNewReportFormat(e.target.value)}
                className="w-full px-6 py-4 bg-surface-variant/50 border-2 border-transparent focus:border-primary/20 rounded-[20px] outline-none text-sm font-bold text-text-primary cursor-pointer transition-all"
              >
                <option value="PDF">PDF Document</option>
                <option value="Excel">Excel Ledger</option>
                <option value="CSV">CSV Dataset</option>
              </select>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              type="button" 
              onClick={() => setIsCreateOpen(false)}
              className="flex-1 px-6 py-4 bg-surface-variant rounded-[20px] text-xs font-black uppercase tracking-widest text-text-secondary hover:bg-border transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isGenerating}
              className="flex-1 btn-primary py-4 rounded-[20px] shadow-lg shadow-primary/25 disabled:opacity-50 cursor-pointer"
            >
              {isGenerating ? 'Generating...' : 'Confirm Generation'}
            </button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};

export default ReportsPage;
