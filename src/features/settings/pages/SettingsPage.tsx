"use client";

import { useState } from 'react';
import Link from 'next/link';
import { 
  Settings as SettingsIcon, 
  Shield, 
  Bell, 
  Globe, 
  Key, 
  Database,
  Save,
  ChevronRight,
  Info,
  Lock,
  Cloud,
  Layers,
  Activity,
  Cpu,
  RefreshCw,
  Mail,
  Smartphone,
  Eye,
  Terminal,
  Zap,
  Server,
  Network,
  UserPlus,
  Users,
  Search,
  MoreVertical
} from 'lucide-react';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import UserRightsControl from '@/components/UserRightsControl';
import { SUPER_ADMIN_MANAGED_ROLES } from '@/lib/roleAccess';
import { SUPER_ADMIN_PREFIX } from '@/lib/portals';

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

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('General');

  const tabs = [
    { name: 'General', icon: SettingsIcon, desc: 'Ecosystem metadata & routing' },
    { name: 'Access Control', icon: Users, desc: 'User rights & role permissions' },
    { name: 'Security', icon: Shield, desc: 'Hardened access protocols' },
    { name: 'Notifications', icon: Bell, desc: 'Signal & alert orchestration' },
    { name: 'API & Gateway', icon: Key, desc: 'Neural endpoint management' },
    { name: 'Infrastructure', icon: Database, desc: 'Global compute & storage' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'General':
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <div className="glass-card p-10 space-y-10 relative overflow-hidden group">
              <div className="absolute -right-20 -top-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
              
              <div className="flex items-center gap-4 relative z-10">
                <div className="p-4 bg-primary/10 text-primary rounded-2xl">
                  <Globe size={24} />
                </div>
                <div>
                  <h3 className="heading-2">Ecosystem Identity</h3>
                  <p className="text-sm text-text-secondary font-medium">Global metadata and platform orchestration parameters</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
                <div className="space-y-3">
                  <label className="text-label text-text-secondary tracking-[0.2em] ml-1">Platform Brand Name</label>
                  <input 
                    type="text" 
                    defaultValue="HRM Enterprise"
                    className="w-full px-6 py-4.5 bg-surface-variant/50 border-2 border-transparent focus:border-primary/20 rounded-[24px] outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold text-text-primary"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-label text-text-secondary tracking-[0.2em] ml-1">Master Support Gateway</label>
                  <input 
                    type="email" 
                    defaultValue="admin@hrm.ai"
                    className="w-full px-6 py-4.5 bg-surface-variant/50 border-2 border-transparent focus:border-primary/20 rounded-[24px] outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold text-text-primary"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-label text-text-secondary tracking-[0.2em] ml-1">Settlement Currency</label>
                  <select className="w-full px-6 py-4.5 bg-surface-variant/50 border-2 border-transparent hover:border-primary/10 rounded-[24px] outline-none focus:ring-4 focus:ring-primary/5 transition-all text-sm font-black text-text-primary cursor-pointer">
                    <option>INR - Indian Rupee (₹)</option>
                    <option>USD - United States Dollar ($)</option>
                    <option>EUR - Euro (€)</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-label text-text-secondary tracking-[0.2em] ml-1">Regional Localization</label>
                  <select className="w-full px-6 py-4.5 bg-surface-variant/50 border-2 border-transparent hover:border-primary/10 rounded-[24px] outline-none focus:ring-4 focus:ring-primary/5 transition-all text-sm font-black text-text-primary cursor-pointer">
                    <option>English (International)</option>
                    <option>Spanish (ES)</option>
                    <option>French (FR)</option>
                  </select>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 'Access Control':
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <div className="glass-card p-10 space-y-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-primary/10 text-primary rounded-2xl">
                    <UserPlus size={24} />
                  </div>
                  <div>
                    <h3 className="heading-2">Administrative Invitations</h3>
                    <p className="text-sm text-text-secondary font-medium">Grant high-level access to senior personnel</p>
                  </div>
                </div>
                <Link href="/users/register" className="btn-primary shadow-xl shadow-primary/20 px-8 py-4">
                  <UserPlus size={18} />
                  Register User
                </Link>
              </div>

              <div className="space-y-4">
                {[
                  { name: 'Sarah Jenkins', email: 's.jenkins@hrm.ai', role: 'Security Admin', status: 'Active', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' },
                  { name: 'Marcus Chen', email: 'm.chen@hrm.ai', role: 'Financial Auditor', status: 'Active', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus' },
                  { name: 'Elena Rodriguez', email: 'e.rod@hrm.ai', role: 'Compliance Officer', status: 'Pending', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena' },
                ].map((admin) => (
                  <div key={admin.email} className="flex items-center justify-between p-6 bg-surface/50 rounded-[32px] border border-border/50 hover:border-primary/20 transition-all group">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-surface-variant flex items-center justify-center overflow-hidden border border-border group-hover:scale-110 transition-transform shadow-sm">
                        <img src={admin.avatar} alt={admin.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-base font-black text-text-primary group-hover:text-primary transition-colors">{admin.name}</p>
                        <p className="text-label font-bold text-text-secondary">{admin.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-center md:text-left hidden sm:block">
                        <p className="text-label text-muted">Role Authority</p>
                        <p className="text-xs font-bold text-text-primary mt-0.5">{admin.role}</p>
                      </div>
                      <span className={cn(
                        "px-4 py-1.5 rounded-full text-label border",
                        admin.status === 'Active' ? "bg-success/10 text-success border-success/10" : "bg-warning/10 text-warning border-warning/10"
                      )}>
                        {admin.status}
                      </span>
                      <button className="p-2.5 bg-surface-variant rounded-xl text-muted hover:text-primary transition-all">
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-10 space-y-8">
              <UserRightsControl
                managerPortal="super_admin"
                roleOptions={SUPER_ADMIN_MANAGED_ROLES}
                defaultRole="platform_admin"
                title="Admin Rights Control"
                description="Configure Admin (HR) module access."
                showSaveActions
                showLowerRoles={false}
              />
              <Link
                href={`${SUPER_ADMIN_PREFIX}/user-rights`}
                className="inline-flex items-center gap-2 text-sm font-bold text-secondary hover:opacity-80 transition-colors"
              >
                Open User Rights page
              </Link>
            </div>
          </motion.div>
        );

      case 'Security':
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <div className="glass-card p-10 space-y-10">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-accent/10 text-accent rounded-2xl">
                  <Lock size={24} />
                </div>
                <div>
                  <h3 className="heading-2">Security & Governance</h3>
                  <p className="text-sm text-text-secondary font-medium">Hardened enforcement rules and neural access policies</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {[
                  { title: 'Hardened 2FA', desc: 'Enforce biometric or hardware key authentication for all Super Admins.', enabled: true, icon: Smartphone },
                  { title: 'Neural Fraud Detection', desc: 'Real-time AI monitoring of payroll disbursement anomalies.', enabled: true, icon: Activity },
                  { title: 'Session Pinning', desc: 'Lock administrative sessions to specific geographical IP ranges.', enabled: false, icon: Globe },
                  { title: 'Encrypted Audit Logs', desc: 'SHA-256 hashing for all system interaction logs.', enabled: true, icon: Eye },
                ].map((rule) => (
                  <div key={rule.title} className="flex items-center justify-between p-6 rounded-[28px] hover:bg-surface-variant transition-all border border-transparent hover:border-border group bg-surface/50">
                    <div className="flex items-center gap-5">
                      <div className={cn(
                        "p-3 rounded-2xl transition-all group-hover:scale-110",
                        rule.enabled ? "bg-primary/10 text-primary" : "bg-muted/10 text-muted"
                      )}>
                        <rule.icon size={20} />
                      </div>
                      <div>
                        <p className="text-base font-black text-text-primary group-hover:text-primary transition-colors">{rule.title}</p>
                        <p className="text-xs text-text-secondary font-medium">{rule.desc}</p>
                      </div>
                    </div>
                    <button className={cn(
                      "w-16 h-8 rounded-full transition-all relative flex items-center px-1.5",
                      rule.enabled ? "bg-primary shadow-lg shadow-primary/20" : "bg-border"
                    )}>
                      <motion.div 
                        layout
                        className="w-5 h-5 rounded-full bg-white shadow-sm"
                        animate={{ x: rule.enabled ? 32 : 0 }}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        );

      case 'Notifications':
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <div className="glass-card p-10 space-y-10">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-secondary/10 text-secondary rounded-2xl">
                  <Bell size={24} />
                </div>
                <div>
                  <h3 className="heading-2">Signal Orchestration</h3>
                  <p className="text-sm text-text-secondary font-medium">Configure global event triggers and alert routing</p>
                </div>
              </div>

              <div className="space-y-10">
                {[
                  { category: 'Financial Events', events: ['Payroll Success', 'Disbursement Failure', 'Budget Threshold Alert'] },
                  { category: 'System Operations', events: ['Node Health Warning', 'Protocol Update', 'Auth Anomaly'] },
                  { category: 'User Lifecycle', events: ['New Enterprise Registration', 'Subscription Renewal', 'Account Termination'] },
                ].map((cat) => (
                  <div key={cat.category} className="space-y-6">
                    <h4 className="text-micro font-black text-text-secondary uppercase tracking-[0.3em] ml-1">{cat.category}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {cat.events.map((event) => (
                        <div key={event} className="flex items-center justify-between p-5 bg-surface-variant/30 rounded-[24px] border border-border/50 group hover:border-primary/20 transition-all">
                          <span className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors">{event}</span>
                          <div className="flex items-center gap-3">
                            <button className="p-2 text-muted hover:text-primary transition-colors"><Mail size={16} /></button>
                            <button className="p-2 text-muted hover:text-primary transition-colors"><Smartphone size={16} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        );

      case 'API & Gateway':
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <div className="glass-card p-10 space-y-10">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-primary/10 text-primary rounded-2xl">
                  <Terminal size={24} />
                </div>
                <div>
                  <h3 className="heading-2">Endpoint Configuration</h3>
                  <p className="text-sm text-text-secondary font-medium">Manage neural API gateways and external system handshakes</p>
                </div>
              </div>

              <div className="space-y-8">
                <div className="p-8 bg-surface-variant/30 rounded-[32px] border border-border/50">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                        <Key size={22} />
                      </div>
                      <div>
                        <p className="text-xs font-black text-text-secondary uppercase tracking-widest">Master API Secret</p>
                        <p className="text-sm font-black text-text-primary mt-1 font-mono">hrm_live_••••••••••••••••••••</p>
                      </div>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                      <button className="flex-1 md:flex-none px-6 py-3 bg-white dark:bg-surface border border-border rounded-xl text-xs font-black uppercase tracking-widest text-text-secondary hover:text-primary transition-all">Reveal</button>
                      <button className="flex-1 md:flex-none px-6 py-3 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/10 hover:bg-primary-dark transition-all">Regenerate</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 'Infrastructure':
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Compute Power', value: '84%', icon: Cpu, color: 'primary' },
                { label: 'Network Throughput', value: '1.2 GB/s', icon: Network, color: 'secondary' },
                { label: 'Database Integrity', value: '100%', icon: Database, color: 'success' },
              ].map((stat) => (
                <div key={stat.label} className="glass-card p-8 group hover:border-primary/30 transition-all cursor-default">
                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm", `bg-${stat.color}/10 text-${stat.color}`)}>
                    <stat.icon size={28} />
                  </div>
                  <p className="text-label text-text-secondary tracking-[0.2em] mb-1">{stat.label}</p>
                  <h3 className="text-stat-value">{stat.value}</h3>
                </div>
              ))}
            </div>

            <div className="glass-card p-10 space-y-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
                <Server size={120} />
              </div>

              <div className="flex items-center gap-4 relative z-10">
                <div className="p-4 bg-secondary/10 text-secondary rounded-2xl">
                  <Cloud size={24} />
                </div>
                <div>
                  <h3 className="heading-2">Cloud Orchestration</h3>
                  <p className="text-sm text-text-secondary font-medium">Distributed compute clusters and global storage synchronization</p>
                </div>
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div 
      initial={false}
      animate="visible"
      variants={containerVariants}
      className="space-y-8 pb-10"
    >
      {/* Header Section */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <p className="text-label text-primary mb-1">Super Admin</p>
          <h1 className="heading-1 bg-clip-text text-transparent bg-gradient-to-r from-text-primary to-primary">
            System Configuration
          </h1>
          <p className="text-page-desc mt-1 max-w-2xl">
            Fine-tune platform protocols, security layers, and global ecosystem parameters.
          </p>
        </div>
        <button className="btn-primary group shadow-xl shadow-primary/20">
          <Save size={20} className="group-hover:scale-110 transition-transform" />
          Synchronize Changes
        </button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Tabs */}
        <motion.div variants={itemVariants} className="lg:col-span-1 space-y-3">
          <div className="glass-card p-3 sm:p-4 space-y-2">
            {tabs.map((item) => (
              <button 
                key={item.name}
                onClick={() => setActiveTab(item.name)}
                className={cn(
                  "w-full flex flex-col items-start px-5 sm:px-6 py-4 sm:py-[18px] rounded-2xl text-sm font-bold transition-all group relative overflow-hidden",
                  activeTab === item.name 
                    ? "bg-primary text-white shadow-lg shadow-primary/20" 
                    : "text-text-secondary hover:bg-surface-variant font-medium"
                )}
              >
                <div className="flex items-center gap-3 relative z-10">
                  <item.icon size={18} className={cn(activeTab === item.name ? "text-white" : "text-muted group-hover:text-primary")} />
                  {item.name}
                </div>
                <p className={cn(
                  "text-micro mt-1 font-bold ml-7 relative z-10 transition-colors",
                  activeTab === item.name ? "text-white/60" : "text-text-secondary/60"
                )}>
                  {item.desc}
                </p>
                {activeTab === item.name && (
                  <motion.div 
                    layoutId="active-tab-indicator"
                    className="absolute inset-0 bg-primary shadow-inner -z-0"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>

          <div className="glass-card p-6 mt-6 relative overflow-hidden group border-none shadow-premium bg-gradient-to-br from-secondary/90 via-secondary to-primary/20">
            {/* Animated Mesh Background */}
            <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(59,163,139,0.4),transparent_70%)] animate-pulse" />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 shadow-sm">
                  <Activity size={20} className="text-primary-light animate-pulse" />
                </div>
                <div className="px-2 py-1 bg-success/20 text-success text-[8px] font-black uppercase tracking-widest rounded-full border border-success/20 flex items-center gap-1.5 shadow-sm">
                  <span className="w-1.5 h-1.5 bg-success rounded-full shadow-[0_0_8px_#22C55E]" />
                  Operational
                </div>
              </div>
              
              <p className="text-micro font-black text-white/50 uppercase tracking-[0.2em] mb-1">System Infrastructure</p>
              <h4 className="text-lg font-semibold text-white tracking-tight">V3.4.2 <span className="text-primary-light text-xs font-medium ml-1 opacity-80 tracking-normal italic">Stable</span></h4>
              
              <div className="mt-8 space-y-4">
                {[
                  { label: 'CPU Load', value: 24, color: 'primary' },
                  { label: 'Latency', value: 12, color: 'accent' },
                  { label: 'Resource usage', value: 68, color: 'success' },
                ].map((metric) => (
                  <div key={metric.label} className="space-y-1.5">
                    <div className="flex justify-between items-center text-micro font-black uppercase tracking-widest text-white/60">
                      <span>{metric.label}</span>
                      <span className="text-white">{metric.value}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${metric.value}%` }}
                        transition={{ duration: 1.5, ease: "circOut" }}
                        className={cn(
                          "h-full rounded-full shadow-[0_0_10px_rgba(255,255,255,0.1)]",
                          metric.color === 'primary' ? "bg-primary" : 
                          metric.color === 'accent' ? "bg-accent" : "bg-success"
                        )} 
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-[8px] font-black text-white/40 uppercase tracking-[0.2em]">Uptime</p>
                  <p className="text-xs font-bold text-white mt-0.5">99.98%</p>
                </div>
                <div className="text-right">
                  <p className="text-[8px] font-black text-white/40 uppercase tracking-[0.2em]">Last Audit</p>
                  <p className="text-xs font-bold text-white mt-0.5">42m ago</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Settings Content Area */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            <div key={activeTab}>
              {renderContent()}
            </div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default SettingsPage;
