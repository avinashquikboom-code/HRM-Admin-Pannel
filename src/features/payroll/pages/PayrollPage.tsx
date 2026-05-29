"use client";

import { useState } from 'react';
import { 
  Wallet, 
  TrendingUp, 
  CheckCircle2, 
  Clock,
  ArrowUpRight,
  Filter,
  Download,
  Search,
  MoreVertical,
  ArrowRight,
  IndianRupee,
  Users,
  X,
  ShieldCheck,
  Plus
} from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import TableSkeleton from '@/components/TableSkeleton';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  AreaChart,
  Area
} from 'recharts';
import { cn } from '@/utils/cn';
import ChartContainer from '@/components/ChartContainer';
import { useLoadingData } from '@/hooks/useLoadingData';
import Modal from '@/components/Modal';

const payrollStats = [
  { name: 'Jan', amount: 2400000, trend: 1500000 },
  { name: 'Feb', amount: 2100000, trend: 1800000 },
  { name: 'Mar', amount: 2800000, trend: 2100000 },
  { name: 'Apr', amount: 2600000, trend: 2400000 },
  { name: 'May', amount: 3200000, trend: 2800000 },
];

const recentPayrollRuns = [
  { 
    id: 'PR-9041', 
    company: 'TechVibe Inc.', 
    employees: 450, 
    totalAmount: '₹382,500', 
    status: 'Completed', 
    date: '28 Apr 2024' 
  },
  { 
    id: 'PR-9042', 
    company: 'Global Logistics', 
    employees: 1200, 
    totalAmount: '₹744,000', 
    status: 'Processing', 
    date: '30 Apr 2024' 
  },
  { 
    id: 'PR-9043', 
    company: 'EcoWare Solutions', 
    employees: 85, 
    totalAmount: '₹66,300', 
    status: 'Failed', 
    date: '01 May 2024' 
  },
  { 
    id: 'PR-9044', 
    company: 'Innovate Digital', 
    employees: 320, 
    totalAmount: '₹176,000', 
    status: 'Pending Approval', 
    date: '02 May 2024' 
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
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

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-4 border-none shadow-2xl backdrop-blur-xl bg-surface/80 dark:bg-surface-variant/80">
        <p className="text-label text-muted mb-2">{label}</p>
        <div className="space-y-1">
          <p className="text-lg font-black text-primary">
            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(payload[0].value)}
          </p>
          <div className="flex items-center gap-2">
             <div className="flex items-center gap-1 text-micro font-black text-success uppercase tracking-tighter">
                <TrendingUp size={12} />
                +14.2%
             </div>
             <span className="text-micro font-bold text-text-secondary uppercase">vs last cycle</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const PayrollPage = () => {
  const { isLoading } = useLoadingData(800);
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-10"
    >
      {/* Header Section */}
      <motion.div 
        variants={itemVariants}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg text-primary shadow-sm">
              <Wallet size={18} />
            </div>
            <span className="text-micro font-black uppercase tracking-[0.2em] text-primary">Disbursement Center</span>
          </div>
          <h1 className="heading-1 bg-clip-text text-transparent bg-gradient-to-r from-text-primary to-muted">
            Payroll Monitoring
          </h1>
          <p className="text-page-desc mt-1 max-w-2xl">
            Strategic oversight of fund flows, compliance healthy, and ecosystem-wide disbursement performance.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-3 bg-surface-variant border border-border rounded-2xl text-xs font-black uppercase tracking-widest text-text-secondary hover:text-primary transition-all hover:shadow-lg active:scale-95">
            <Download size={18} />
            Audit Ledger
          </button>
          <button 
            onClick={() => setIsProcessModalOpen(true)}
            className="btn-primary group shadow-xl shadow-primary/20 px-8 py-3.5"
          >
            <Wallet size={20} className="group-hover:rotate-12 transition-transform" />
            Bulk Process
          </button>
        </div>
      </motion.div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Volume (MTD)', value: '₹4,128,400', icon: Wallet, color: 'primary', trend: '+12.5%', glowColor: 'rgba(59, 163, 139, 0.3)' },
          { label: 'Total Disbursed', value: '₹3,842,100', icon: CheckCircle2, color: 'success', trend: '+8.2%', glowColor: 'rgba(34, 197, 94, 0.3)' },
          { label: 'Pending Approval', value: '₹210,450', icon: Clock, color: 'warning', trend: '-2.4%', glowColor: 'rgba(245, 158, 11, 0.3)' },
          { label: 'Critical Errors', value: '3 Batches', icon: IndianRupee, color: 'error', trend: 'CRITICAL', glowColor: 'rgba(239, 68, 68, 0.3)' },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            variants={itemVariants}
            whileHover={{ y: -8, transition: { duration: 0.3, ease: "easeOut" } }}
            className="glass-card p-6 group hover:border-primary/50 transition-all cursor-default relative overflow-hidden shadow-premium"
          >
            {/* Radial Glow Effect */}
            <div 
              className="absolute -right-4 -top-4 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none"
              style={{ background: stat.glowColor }}
            />
            
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className={cn(
                "p-3.5 rounded-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm",
                `bg-${stat.color}/10 text-${stat.color}`
              )}>
                <stat.icon size={22} />
              </div>
              <span className={cn(
                "text-micro font-black px-2.5 py-1.5 rounded-xl uppercase tracking-wider border shadow-sm",
                stat.trend.startsWith('+') ? "bg-success/10 text-success border-success/10" : 
                stat.trend.startsWith('-') ? "bg-error/10 text-error border-error/10" : "bg-error/20 text-error border-error/20 animate-pulse"
              )}>
                {stat.trend}
              </span>
            </div>
            <div className="relative z-10">
              <p className="text-micro font-black text-text-secondary uppercase tracking-[0.15em] mb-1">{stat.label}</p>
              <h3 className="heading-2er tabular-nums">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <motion.div 
          variants={itemVariants}
          className="xl:col-span-2 glass-card p-8 relative overflow-hidden group shadow-premium"
        >
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-1000" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 relative z-10">
            <div>
              <h3 className="heading-2">Platform Disbursement Volume</h3>
              <p className="text-sm text-page-desc mt-1 italic">Global payroll distribution trends over the last 5 months</p>
            </div>
            <div className="flex items-center gap-3 text-success text-label tracking-[0.15em] bg-success/10 px-5 py-2.5 rounded-2xl self-start sm:self-center border border-success/10 shadow-sm">
              <TrendingUp size={16} />
              +14.2% SYSTEM GROWTH
            </div>
          </div>

          <ChartContainer heightClassName="h-[350px]" className="relative z-10">
              <AreaChart data={payrollStats}>
                <defs>
                  <linearGradient id="payrollGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3BA38B" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3BA38B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: 'var(--text-secondary)', fontSize: 10, fontWeight: 900}} 
                  dy={15}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: 'var(--text-secondary)', fontSize: 10, fontWeight: 900}}
                  tickFormatter={(value) => `₹${value/1000000}M`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#3BA38B" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#payrollGradient)" 
                  animationDuration={2500}
                  animationEasing="ease-in-out"
                />
              </AreaChart>
          </ChartContainer>
        </motion.div>

        <div className="flex flex-col gap-6">
          <motion.div 
            variants={itemVariants}
            whileHover={{ scale: 1.01 }}
            className="glass-card p-8 bg-gradient-to-br from-secondary to-primary-dark text-white border-none shadow-2xl relative overflow-hidden group h-full flex flex-col justify-between"
          >
            {/* Animated Radial Glow */}
            <motion.div 
              animate={{ 
                scale: [1, 1.3, 1],
                opacity: [0.2, 0.4, 0.2]
              }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="absolute -right-20 -top-20 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none"
            />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="p-4 bg-white/5 backdrop-blur-2xl rounded-2xl group-hover:rotate-6 group-hover:scale-110 transition-all duration-500 border border-white/10 shadow-sm">
                  <IndianRupee size={32} className="text-primary" />
                </div>
                <div className="px-4 py-1.5 bg-white/5 backdrop-blur-2xl rounded-full text-micro font-black tracking-[0.2em] flex items-center gap-2 border border-white/10 shadow-sm">
                  <span className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_12px_#3BA38B]" />
                  ACTIVE LIQUIDITY
                </div>
              </div>
              
              <div className="mt-auto pt-10">
                <p className="text-white/40 text-micro font-black tracking-[0.2em] uppercase mb-2">Global Disbursement Pool</p>
                <h3 className="text-5xl font-black mb-8 tracking-tighter tabular-nums text-white group-hover:text-primary transition-colors duration-500">₹24,842,100</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-micro font-black uppercase tracking-[0.2em]">
                    <span className="text-white/60">Pool utilization</span>
                    <span className="text-primary">75.4%</span>
                  </div>
                  <div className="h-2.5 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/10 shadow-sm">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '75.4%' }}
                      transition={{ duration: 2, delay: 0.5, ease: "circOut" }}
                      className="h-full bg-gradient-to-r from-primary/50 to-primary rounded-full shadow-[0_0_20px_rgba(59,163,139,0.5)]"
                    />
                  </div>
                </div>
                <div className="mt-10 flex items-center gap-3">
                  <button className="flex-1 py-4 bg-primary text-white text-micro font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-primary-light transition-all active:scale-95 shadow-xl shadow-primary/30">
                    Rebalance Pool
                  </button>
                  <button className="p-4 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl hover:bg-white/10 transition-all active:scale-95 shadow-sm">
                    <ArrowUpRight size={20} className="text-white" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            variants={itemVariants} 
            whileHover={{ x: 8 }}
            className="glass-card p-6 flex items-center justify-between group hover:border-warning/50 transition-all cursor-pointer overflow-hidden relative shadow-premium"
          >
            <div className="absolute right-0 top-0 w-24 h-24 bg-warning/5 blur-3xl rounded-full" />
            <div className="flex items-center gap-5 relative z-10">
              <div className="p-4 rounded-2xl bg-warning/10 text-warning group-hover:rotate-12 group-hover:scale-110 transition-all shadow-sm">
                <Clock size={24} />
              </div>
              <div>
                <p className="text-sm font-black text-text-primary uppercase tracking-tight">Manual Audit Queue</p>
                <p className="text-micro font-bold text-text-secondary mt-1 uppercase tracking-widest">12 runs awaiting approval</p>
              </div>
            </div>
            <div className="w-12 h-12 bg-surface-variant rounded-2xl flex items-center justify-center text-text-secondary group-hover:bg-primary group-hover:text-white transition-all shadow-sm border border-border relative z-10">
              <ArrowRight size={20} />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Recent Payroll Runs */}
      <motion.div variants={itemVariants} className="glass-card overflow-hidden shadow-premium">
        <div className="p-8 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h3 className="heading-2">Recent Payroll Cycles</h3>
            <p className="text-sm text-page-desc mt-1">Global audit stream of recent disbursement batches</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-grow sm:flex-grow-0 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search batches..." 
                className="pl-11 pr-4 py-3.5 bg-surface-variant border-none rounded-2xl text-xs outline-none focus:ring-4 focus:ring-primary/10 transition-all w-full sm:w-72 font-black uppercase tracking-widest text-text-primary"
              />
            </div>
            <button className="p-3.5 bg-surface-variant hover:bg-surface border border-border rounded-2xl text-text-secondary transition-all active:scale-95 hover:border-primary/30 shadow-sm">
              <Filter size={20} />
            </button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="p-8">
            <TableSkeleton rows={5} columns={6} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-variant/50">
                  <th className="px-4 sm:px-6 md:px-8 py-5 sm:py-6 text-micro font-black uppercase tracking-[0.2em] text-muted border-b border-border">Batch Identity</th>
                  <th className="px-4 sm:px-6 md:px-8 py-5 sm:py-6 text-micro font-black uppercase tracking-[0.2em] text-muted border-b border-border">Company</th>
                  <th className="px-4 sm:px-6 md:px-8 py-5 sm:py-6 text-micro font-black uppercase tracking-[0.2em] text-muted border-b border-border">Operational Scale</th>
                  <th className="px-4 sm:px-6 md:px-8 py-5 sm:py-6 text-micro font-black uppercase tracking-[0.2em] text-muted border-b border-border">Total Volume</th>
                  <th className="px-4 sm:px-6 md:px-8 py-5 sm:py-6 text-micro font-black uppercase tracking-[0.2em] text-muted border-b border-border">Status</th>
                  <th className="px-4 sm:px-6 md:px-8 py-5 sm:py-6 text-micro font-black uppercase tracking-[0.2em] text-muted border-b border-border text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentPayrollRuns.map((run) => (
                  <motion.tr 
                    key={run.id}
                    variants={itemVariants}
                    className="hover:bg-surface-variant transition-colors group cursor-pointer"
                  >
                    <td className="px-8 py-7">
                      <span className="font-mono text-micro font-black text-muted bg-surface-variant px-3 py-1.5 rounded-xl border border-border shadow-sm group-hover:border-primary/30 transition-colors">
                        {run.id}
                      </span>
                    </td>
                    <td className="px-8 py-7">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-black text-xs group-hover:scale-110 transition-all duration-500 shadow-sm border border-primary/10">
                          {run.company.substring(0, 2)}
                        </div>
                        <div>
                          <span className="font-black text-text-primary tracking-tight group-hover:text-primary transition-colors block">{run.company}</span>
                          <span className="text-label font-bold text-text-secondary">{run.date}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-7">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <Users size={14} className="text-primary" />
                          <span className="text-sm font-black text-text-primary">{run.employees}</span>
                        </div>
                        <span className="text-micro font-bold text-text-secondary uppercase tracking-[0.1em] mt-1">Managed Seats</span>
                      </div>
                    </td>
                    <td className="px-8 py-7">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-text-primary tracking-tighter">{run.totalAmount}</span>
                        <span className="text-label font-bold text-text-secondary mt-1">Disbursed</span>
                      </div>
                    </td>
                    <td className="px-8 py-7">
                      <span className={cn(
                        "px-4 py-2 rounded-2xl text-label inline-flex items-center gap-2.5 transition-all border shadow-sm",
                        run.status === 'Completed' ? "bg-success/10 text-success border-success/10" : 
                        run.status === 'Failed' ? "bg-error/10 text-error border-error/10" : "bg-warning/10 text-warning border-warning/10"
                      )}>
                        <span className={cn(
                          "w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]",
                          run.status === 'Completed' ? "bg-success" : 
                          run.status === 'Failed' ? "bg-error animate-pulse" : "bg-warning"
                        )} />
                        {run.status}
                      </span>
                    </td>
                    <td className="px-8 py-7 text-right">
                      <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                        <button className="p-3 bg-surface border border-border text-muted hover:text-primary hover:border-primary/50 rounded-2xl transition-all shadow-sm hover:shadow-md">
                          <Download size={18} />
                        </button>
                        <button className="p-3 bg-surface border border-border text-muted hover:text-text-primary rounded-2xl transition-all shadow-sm">
                          <MoreVertical size={18} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!isLoading && (
          <div className="p-8 bg-surface-variant/50 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
              <p className="text-label text-text-secondary tracking-[0.2em]">Global Audit Stream Live</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-6 py-3 bg-surface border border-border rounded-2xl text-label text-text-secondary disabled:opacity-30 hover:shadow-md transition-all active:scale-95" disabled>Previous Cycle</button>
              <button className="px-6 py-3 bg-surface border border-border rounded-2xl text-label text-text-secondary hover:shadow-md hover:text-primary transition-all active:scale-95">Next Cycle</button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Process Payroll Modal */}
      <Modal 
        isOpen={isProcessModalOpen} 
        onClose={() => setIsProcessModalOpen(false)}
        title="Execute Bulk Disbursement"
      >
        <div className="space-y-8 p-2">
          <div className="p-6 bg-surface-variant/50 rounded-3xl border border-border/50">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-sm font-black uppercase tracking-widest text-text-primary">Batch Summary</h4>
              <span className="px-3 py-1 bg-primary/10 text-primary text-micro font-black rounded-full uppercase tracking-widest border border-primary/10">Draft Batch #882</span>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-label text-muted">Total Entities</p>
                <p className="text-xl font-black text-text-primary">12 Companies</p>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-label text-muted">Total Employees</p>
                <p className="text-xl font-black text-text-primary">4,842 Seats</p>
              </div>
              <div className="space-y-1">
                <p className="text-label text-muted">Total Volume</p>
                <p className="text-xl font-black text-primary">₹1,248,500</p>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-label text-muted">Est. Gas Fees</p>
                <p className="text-xl font-black text-text-secondary">₹142.50</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-label text-text-secondary ml-1">Confirmation Protocol</h4>
            <div className="space-y-3">
              {[
                'Verify all entity compliance certificates',
                'Synchronize with global liquidity pool',
                'Enable multi-signature audit trail',
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-surface rounded-2xl border border-border/50 group hover:border-primary/30 transition-all shadow-sm">
                  <div className="w-6 h-6 rounded-lg bg-surface-variant border border-border flex items-center justify-center text-muted group-hover:bg-primary/10 group-hover:text-primary transition-all">
                    <CheckCircle2 size={16} />
                  </div>
                  <span className="text-sm font-bold text-text-primary">{step}</span>
                </div>
              ))}
            </div>
          </div>

          <button className="w-full py-4 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all flex items-center justify-center gap-3 mt-8">
            <ShieldCheck size={20} />
            Initiate Disbursement Protocol
          </button>
        </div>
      </Modal>
    </motion.div>
  );
};

export default PayrollPage;
