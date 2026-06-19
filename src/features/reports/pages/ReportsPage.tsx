"use client";

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
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
  ShieldCheck,
  IndianRupee,
  Users,
  CheckCircle2,
  XCircle,
  Percent,
  Briefcase,
  Building,
  Info
} from 'lucide-react';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import TableSkeleton from '@/components/TableSkeleton';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import ChartContainer from '@/components/ChartContainer';


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

  // Report Preview Details State
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [reportDetails, setReportDetails] = useState<any | null>(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);

  const handlePreviewReport = async (report: any) => {
    setSelectedReport(report);
    setIsPreviewOpen(true);
    setIsDetailsLoading(true);
    setReportDetails(null);

    let monthQuery = '';
    try {
      const parts = report.date.split(' ');
      if (parts.length >= 3) {
        const monthNames = {
          Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
          Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12'
        };
        const year = parts[2];
        const monthName = parts[1];
        const monthNum = monthNames[monthName as keyof typeof monthNames] || '05';
        monthQuery = `${year}-${monthNum}`;
      }
    } catch (e) {
      monthQuery = new Date().toISOString().slice(0, 7);
    }

    if (!monthQuery) {
      monthQuery = new Date().toISOString().slice(0, 7);
    }

    try {
      if (report.type === 'Payroll') {
        const res = await api.get(`/api/admin/reports/payroll-details?month=${monthQuery}`);
        if (res.data.success) {
          setReportDetails(res.data);
        }
      } else if (report.type === 'Attendance') {
        const res = await api.get(`/api/admin/reports/attendance-details?month=${monthQuery}`);
        if (res.data.success) {
          setReportDetails(res.data);
        }
      }
    } catch (err) {
      console.error('Failed to load report details:', err);
    } finally {
      setIsDetailsLoading(false);
    }
  };

  const loadReportsData = useCallback(async () => {
    setIsPageLoading(true);
    try {
      const res = await api.get<{ success: boolean; reports: any[] }>('/api/admin/reports');
      if (res.data.success) {
        setReportList(res.data.reports);
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
      await api.post('/api/admin/reports/generate', {
        name: newReportName,
        type: newReportType,
        format: newReportFormat
      });
      await loadReportsData();
      setIsCreateOpen(false);
      setNewReportName('');
    } catch (err) {
      console.error('Report generation failed:', err);
      alert('Report generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadReport = async (report: any) => {
    try {
      let monthQuery = '';
      try {
        const parts = report.date.split(' ');
        if (parts.length >= 3) {
          const monthNames = {
            Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
            Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12'
          };
          const year = parts[2];
          const monthName = parts[1];
          const monthNum = monthNames[monthName as keyof typeof monthNames] || '05';
          monthQuery = `${year}-${monthNum}`;
        }
      } catch (e) {
        monthQuery = new Date().toISOString().slice(0, 7);
      }

      if (!monthQuery) {
        monthQuery = new Date().toISOString().slice(0, 7);
      }

      if (report.type === 'Payroll') {
        const token = localStorage.getItem('super_hrm_token') || localStorage.getItem('hrm_token') || '';
        const baseUrl = typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_API_URL || 'http://69.62.80.20:5004');
        const url = `${baseUrl}/api/admin/reports/attendance/download?month=${monthQuery}&token=${token}`;
        window.open(url, '_blank');
      } else if (report.type === 'Attendance') {
        const token = localStorage.getItem('super_hrm_token') || localStorage.getItem('hrm_token') || '';
        const baseUrl = typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_API_URL || 'http://69.62.80.20:5004');
        const url = `${baseUrl}/api/admin/reports/attendance/download?month=${monthQuery}&token=${token}`;
        window.open(url, '_blank');
      } else if (report.type === 'Leave') {
        const token = localStorage.getItem('super_hrm_token') || localStorage.getItem('hrm_token') || '';
        const baseUrl = typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_API_URL || 'http://69.62.80.20:5004');
        const url = `${baseUrl}/api/admin/leaves/report/download?token=${token}`;
        window.open(url, '_blank');
      } else {
        alert('Download not available for this report type yet.');
      }
    } catch (error) {
      console.error('Failed to download report:', error);
      alert('Failed to download report. Please try again.');
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
      className="space-y-8 pb-10 text-text-primary animate-fadeIn"
    >
      {/* Title Header Command hub */}
      <motion.div variants={itemVariants} className="relative overflow-hidden rounded-[2.5rem] border border-border/50 dark:border-white/10 bg-surface dark:bg-gradient-to-br dark:from-slate-900/90 dark:to-slate-950/95 backdrop-blur-xl p-8 md:p-10 shadow-sm dark:shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div className="absolute -top-12 -right-12 w-96 h-96 bg-primary/10 rounded-full filter blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute -bottom-24 -left-12 w-80 h-80 bg-emerald-500/5 rounded-full filter blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/20 to-emerald-500/10 border border-primary/30 text-primary text-[10px] font-black px-3.5 py-1.5 rounded-full uppercase tracking-widest shadow-inner">
            <FileSpreadsheet size={12} className="text-primary animate-pulse" />
            Corporate Audit & Compliance Center
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-text-primary tracking-tight leading-none">
            Intelligence <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-teal-400 to-emerald-400">Center</span>
          </h1>
          <p className="text-xs md:text-sm text-text-secondary font-medium max-w-xl leading-relaxed">
            Access, generate, and manage platform-wide compliance audits, financial velocity files, and custom blueprints.
          </p>
        </div>

        <div className="relative z-10 shrink-0 flex items-center gap-3">
          <button 
            onClick={() => setIsCreateOpen(true)}
            className="btn-primary shadow-xl shadow-primary/20 hover:shadow-primary/30 px-6.5 py-4 shrink-0 rounded-sm text-xs font-black uppercase tracking-wider justify-center animate-transition"
          >
            <FileCheck2 size={18} />
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
              <div className={cn("w-12 h-12 rounded-sm flex items-center justify-center transition-transform group-hover:scale-110 duration-300", stat.bg, `text-${stat.color}`)}>
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
            className="w-full pl-12 pr-4 py-3.5 bg-surface-variant border border-transparent focus:border-primary/20 rounded-sm outline-none focus:ring-4 focus:ring-primary/5 transition-all font-medium"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          <select 
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="flex-grow sm:flex-grow-0 bg-surface-variant border border-transparent hover:border-primary/10 rounded-sm px-5 py-3.5 text-sm outline-none font-bold text-text-secondary cursor-pointer transition-all"
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
            className="flex-grow sm:flex-grow-0 bg-surface-variant border border-transparent hover:border-primary/10 rounded-sm px-5 py-3.5 text-sm outline-none font-bold text-text-secondary cursor-pointer transition-all"
          >
            <option value="All">Format: All</option>
            <option value="PDF">PDF</option>
            <option value="Excel">Excel</option>
            <option value="CSV">CSV</option>
          </select>
          <button className="flex items-center gap-2 px-5 py-3.5 bg-surface-variant rounded-sm text-sm font-bold text-text-secondary hover:text-primary transition-all border border-transparent hover:border-primary/10 flex-grow sm:flex-grow-0 justify-center">
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
              onClick={() => handlePreviewReport(report)}
              className="glass-card p-5 hover:border-primary/40 transition-all group cursor-pointer border-l-4 border-l-transparent hover:border-l-primary"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className={cn(
                    "w-14 h-14 rounded-sm flex flex-col items-center justify-center font-black text-micro shadow-sm transition-transform group-hover:scale-110",
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
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePreviewReport(report);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-surface-variant text-text-secondary hover:text-primary hover:bg-primary/5 rounded-sm text-xs font-bold transition-all border border-transparent hover:border-primary/10"
                  >
                    Preview
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadReport(report);
                    }}
                    className="p-3 bg-surface-variant text-muted hover:text-white hover:bg-primary rounded-sm transition-all shadow-sm active:scale-90 group-hover:shadow-md"
                  >
                    <Download size={20} />
                  </button>
                  <button className="p-3 bg-surface-variant text-muted hover:text-text-primary rounded-sm transition-all">
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
          <button className="px-5 py-2.5 bg-surface-variant rounded-sm text-xs font-black text-text-secondary hover:text-primary transition-all disabled:opacity-50" disabled>PREV</button>
          <div className="flex items-center gap-1">
            {[1, 2, 3, '...', 12].map((p, i) => (
              <button key={i} className={cn(
                "w-10 h-10 rounded-sm text-xs font-black transition-all",
                p === 1 ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-text-secondary hover:bg-surface-variant"
              )}>
                {p}
              </button>
            ))}
          </div>
          <button className="px-5 py-2.5 bg-surface-variant rounded-sm text-xs font-black text-text-secondary hover:text-primary transition-all">NEXT</button>
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

      {/* Immersive Report Preview Modal */}
      <Modal 
        isOpen={isPreviewOpen} 
        onClose={() => setIsPreviewOpen(false)} 
        title={`${selectedReport?.name || 'Report Detail'} Preview`}
      >
        <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-2 no-scrollbar">
          {isDetailsLoading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-text-secondary font-bold animate-pulse">Assembling live intelligence ledger...</p>
            </div>
          ) : reportDetails ? (
            <div className="space-y-8 animate-fadeIn">
              {/* Dynamic Metadata Badge Info bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-4.5 bg-slate-900/60 border border-white/5 rounded-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-sm bg-primary/10 text-primary flex items-center justify-center font-bold">
                    {selectedReport?.format}
                  </div>
                  <div>
                    <span className="block text-xs text-text-secondary font-bold">Classification Classification</span>
                    <span className="text-sm font-black text-white">{selectedReport?.type} Report</span>
                  </div>
                </div>
                <div>
                  <span className="block text-xs text-text-secondary font-bold text-right">Audit Date</span>
                  <span className="text-sm font-black text-white">{selectedReport?.date}</span>
                </div>
                <div>
                  <span className="block text-xs text-text-secondary font-bold text-right">Database Integrity</span>
                  <span className="text-micro font-black px-2.5 py-1 rounded bg-success/15 border border-success/20 text-success uppercase tracking-widest">
                    {selectedReport?.status}
                  </span>
                </div>
              </div>

              {/* REPORT TYPE: Payroll */}
              {selectedReport?.type === 'Payroll' && (
                <div className="space-y-8">
                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: 'Active Payroll Headcount', value: reportDetails.summary.totalEmployees, icon: Users, color: 'primary', bg: 'bg-primary/10' },
                      { label: 'Gross Salary Volume', value: `₹${reportDetails.summary.totalGrossVolume.toLocaleString('en-IN')}`, icon: IndianRupee, color: 'success', bg: 'bg-success/10' },
                      { label: 'Aggregate Deductions', value: `₹${reportDetails.summary.totalDeductions.toLocaleString('en-IN')}`, icon: Info, color: 'error', bg: 'bg-error/10' },
                      { label: 'Net Disbursed Funds', value: `₹${reportDetails.summary.totalNetVolume.toLocaleString('en-IN')}`, icon: TrendingUp, color: 'accent', bg: 'bg-accent/10' }
                    ].map((card, idx) => (
                      <div key={idx} className="glass-card p-5 relative overflow-hidden group border border-white/5 bg-slate-950/50">
                        <div className="flex items-center justify-between mb-3">
                          <div className={cn("w-10 h-10 rounded-sm flex items-center justify-center text-sm font-black", card.bg, `text-${card.color}`)}>
                            <card.icon size={18} />
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{card.label}</p>
                        <h4 className="text-xl font-black text-white mt-1 tracking-tight">{card.value}</h4>
                      </div>
                    ))}
                  </div>

                  {/* Department Payout Breakdown Chart */}
                  {reportDetails.departmentBreakdown && reportDetails.departmentBreakdown.length > 0 && (
                    <div className="glass-card p-6 border border-white/5 bg-slate-900/30">
                      <h4 className="text-sm font-black uppercase tracking-widest text-white mb-4 flex items-center gap-2">
                        <Building size={16} className="text-primary" />
                        Departmental Payout Breakdown
                      </h4>
                      <ChartContainer heightClassName="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={reportDetails.departmentBreakdown} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                            <defs>
                              <linearGradient id="payoutBarGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#3BA38B" stopOpacity={0.95}/>
                                <stop offset="100%" stopColor="#10B981" stopOpacity={0.2}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.1} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10}} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10}} />
                            <Tooltip 
                              cursor={{fill: 'rgba(255, 255, 255, 0.02)', radius: 8}}
                              contentStyle={{ 
                                borderRadius: '0px', 
                                border: '1px solid rgba(255, 255, 255, 0.08)', 
                                backgroundColor: '#0F172A',
                                color: '#F1F5F9',
                                fontSize: '11px'
                              }}
                            />
                            <Bar dataKey="totalNet" name="Net Payout (₹)" fill="url(#payoutBarGradient)" radius={[6, 6, 0, 0]} barSize={32} />
                          </BarChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </div>
                  )}

                  {/* Detailed Employee Payout Table */}
                  {reportDetails.details && reportDetails.details.length > 0 && (
                    <div className="glass-card overflow-hidden border border-white/5 bg-slate-950/40">
                      <div className="p-5 border-b border-white/5">
                        <h4 className="text-sm font-black uppercase tracking-widest text-white">Employee Compensation Register</h4>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-white/[0.02]">
                              <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase border-b border-white/5">Employee</th>
                              <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase border-b border-white/5">Department</th>
                              <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase border-b border-white/5">Base Salary</th>
                              <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase border-b border-white/5">Allowance</th>
                              <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase border-b border-white/5">Deductions</th>
                              <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase border-b border-white/5 text-right">Net Salary</th>
                              <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase border-b border-white/5 text-right">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {reportDetails.details.map((slip: any) => (
                              <tr key={slip.id} className="hover:bg-white/[0.02] transition-colors">
                                <td className="px-5 py-4">
                                  <span className="block font-bold text-sm text-white">{slip.name}</span>
                                  <span className="text-[10px] text-slate-400 font-semibold">{slip.employeeCode} • {slip.designation}</span>
                                </td>
                                <td className="px-5 py-4 text-xs font-bold text-slate-300">{slip.department}</td>
                                <td className="px-5 py-4 text-xs font-bold text-slate-300">₹{slip.baseSalary.toLocaleString('en-IN')}</td>
                                <td className="px-5 py-4 text-xs font-bold text-success">+₹{slip.allowance.toLocaleString('en-IN')}</td>
                                <td className="px-5 py-4 text-xs font-bold text-error">-₹{slip.deductions.toLocaleString('en-IN')}</td>
                                <td className="px-5 py-4 text-right font-black text-xs text-white">₹{slip.netSalary.toLocaleString('en-IN')}</td>
                                <td className="px-5 py-4 text-right">
                                  <span className={cn(
                                    "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border shadow-sm",
                                    slip.status === 'Approved' ? 'bg-success/10 text-success border-success/10' : 'bg-warning/10 text-warning border-warning/10'
                                  )}>
                                    {slip.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* REPORT TYPE: Attendance */}
              {selectedReport?.type === 'Attendance' && (
                <div className="space-y-8">
                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {[
                      { label: 'Overall Presence Rate', value: `${reportDetails.summary.avgAttendanceRate}%`, icon: Percent, color: 'primary', bg: 'bg-primary/10' },
                      { label: 'On-time Shifts', value: reportDetails.summary.totalPresent, icon: CheckCircle2, color: 'success', bg: 'bg-success/10' },
                      { label: 'Late Clock-ins', value: reportDetails.summary.totalLate, icon: Clock, color: 'warning', bg: 'bg-warning/10' },
                      { label: 'Absent Counts', value: reportDetails.summary.totalAbsent, icon: XCircle, color: 'error', bg: 'bg-error/10' },
                      { label: 'Leave allocations', value: reportDetails.summary.totalLeave, icon: Calendar, color: 'accent', bg: 'bg-accent/10' }
                    ].map((card, idx) => (
                      <div key={idx} className="glass-card p-5 relative overflow-hidden group border border-white/5 bg-slate-950/50">
                        <div className="flex items-center justify-between mb-3">
                          <div className={cn("w-10 h-10 rounded-sm flex items-center justify-center text-sm font-black", card.bg, `text-${card.color}`)}>
                            <card.icon size={18} />
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{card.label}</p>
                        <h4 className="text-xl font-black text-white mt-1 tracking-tight">{card.value}</h4>
                      </div>
                    ))}
                  </div>

                  {/* Monthly daily trend chart */}
                  {reportDetails.trend && reportDetails.trend.length > 0 && (
                    <div className="glass-card p-6 border border-white/5 bg-slate-900/30">
                      <h4 className="text-sm font-black uppercase tracking-widest text-white mb-4 flex items-center gap-2">
                        <TrendingUp size={16} className="text-primary animate-pulse" />
                        Daily Presence Frequency Timeline
                      </h4>
                      <ChartContainer heightClassName="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={reportDetails.trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                              <linearGradient id="attendanceAreaGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#3BA38B" stopOpacity={0.8}/>
                                <stop offset="100%" stopColor="#3BA38B" stopOpacity={0.05}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.1} />
                            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10}} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10}} />
                            <Tooltip 
                              contentStyle={{ 
                                borderRadius: '0px', 
                                border: '1px solid rgba(255, 255, 255, 0.08)', 
                                backgroundColor: '#0F172A',
                                color: '#F1F5F9',
                                fontSize: '11px'
                              }}
                            />
                            <Area type="monotone" dataKey="present" name="Present (Log)" stroke="#3BA38B" strokeWidth={2} fill="url(#attendanceAreaGradient)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </div>
                  )}

                  {/* Detailed Employee Attendance Table */}
                  {reportDetails.details && reportDetails.details.length > 0 && (
                    <div className="glass-card overflow-hidden border border-white/5 bg-slate-950/40">
                      <div className="p-5 border-b border-white/5">
                        <h4 className="text-sm font-black uppercase tracking-widest text-white">Workforce Presence Timeline Register</h4>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-white/[0.02]">
                              <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase border-b border-white/5">Employee</th>
                              <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase border-b border-white/5">Department</th>
                              <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase border-b border-white/5 text-center">Present</th>
                              <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase border-b border-white/5 text-center">Late</th>
                              <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase border-b border-white/5 text-center">Absent</th>
                              <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase border-b border-white/5 text-center">Leave</th>
                              <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase border-b border-white/5 text-right">Attendance Rate</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {reportDetails.details.map((emp: any) => (
                              <tr key={emp.id} className="hover:bg-white/[0.02] transition-colors">
                                <td className="px-5 py-4">
                                  <span className="block font-bold text-sm text-white">{emp.name}</span>
                                  <span className="text-[10px] text-slate-400 font-semibold">{emp.employeeCode} • {emp.designation}</span>
                                </td>
                                <td className="px-5 py-4 text-xs font-bold text-slate-300">{emp.department}</td>
                                <td className="px-5 py-4 text-xs font-bold text-center text-success">{emp.present}d</td>
                                <td className="px-5 py-4 text-xs font-bold text-center text-warning">{emp.late}d</td>
                                <td className="px-5 py-4 text-xs font-bold text-center text-error">{emp.absent}d</td>
                                <td className="px-5 py-4 text-xs font-bold text-center text-accent">{emp.leave}d</td>
                                <td className="px-5 py-4 text-right">
                                  <div className="flex items-center justify-end gap-2.5">
                                    <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                      <div 
                                        className={cn(
                                          "h-full rounded-full transition-all duration-500",
                                          emp.attendanceRate >= 90 ? 'bg-success' : emp.attendanceRate >= 80 ? 'bg-warning' : 'bg-error'
                                        )}
                                        style={{ width: `${emp.attendanceRate}%` }}
                                      />
                                    </div>
                                    <span className="text-xs font-black text-white tabular-nums">{emp.attendanceRate}%</span>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* REPORT TYPE: Others fallback */}
              {selectedReport?.type !== 'Payroll' && selectedReport?.type !== 'Attendance' && (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center text-muted">
                    <ShieldCheck size={32} />
                  </div>
                  <div className="space-y-1.5 max-w-sm">
                    <h4 className="text-base font-black text-white">General Intelligence Ledger Verified</h4>
                    <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                      The integrity hash for this classification asset has been successfully verified. Click below to download or print this report directly.
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons in Modal footer */}
              <div className="flex gap-4 pt-4 border-t border-white/5">
                <button 
                  onClick={() => setIsPreviewOpen(false)}
                  className="flex-1 px-6 py-4 bg-slate-900 border border-white/10 rounded-[20px] text-xs font-black uppercase tracking-widest text-text-secondary hover:bg-slate-800 transition-all text-center"
                >
                  Close Preview
                </button>
                <button 
                  onClick={() => {
                    alert('Exporting data ledger...');
                  }}
                  className="flex-1 btn-primary py-4 rounded-[20px] shadow-lg shadow-primary/25 text-center flex justify-center items-center gap-2"
                >
                  <Download size={16} />
                  Download Complete Asset
                </button>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-sm font-medium text-text-secondary">
              Failed to load report ledger. Please verify backend connection.
            </div>
          )}
        </div>
      </Modal>
    </motion.div>
  );
};

export default ReportsPage;
