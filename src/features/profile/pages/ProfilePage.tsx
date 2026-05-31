"use client";

import { useState } from 'react';
import { 
  User as UserIcon, 
  Shield, 
  Camera, 
  Lock, 
  LogOut,
  ChevronRight,
  ShieldCheck,
  Smartphone,
  Mail,
  Phone,
  Globe,
  Activity,
  History,
  Loader2,
  Key,
  Calendar,
  MapPin,
  Cpu
} from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import SignOutModal from '@/components/SignOutModal';
import { useAdminProfile } from '@/hooks/useAdminProfile';
import { formatLastLogin } from '@/lib/profileMapper';
import { getProfileBasePath, isSuperAdminPath, getLoginPathForPortal } from '@/lib/portals';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { cn } from '@/utils/cn';

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

const ProfilePage = () => {
  const router = useRouter();
  const pathname = usePathname();
  const profileBasePath = getProfileBasePath(pathname);
  const hideLoginTracking = isSuperAdminPath(pathname);
  const { user, profile, isLoading, error } = useAdminProfile();
  const dispatch = useAppDispatch();
  const { portal } = useAppSelector((state) => state.auth);
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);

  const handleSignOut = () => {
    setIsSignOutModalOpen(false);
    dispatch(logout());
    const resolvedPortal = portal ?? (isSuperAdminPath(pathname) ? 'super_admin' : 'platform_admin');
    router.push(getLoginPathForPortal(resolvedPortal));
  };

  if (isLoading && !user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 size={40} className="animate-spin text-primary" />
        <p className="text-sm font-bold text-text-secondary uppercase tracking-widest">
          Loading identity...
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <p className="text-sm font-bold text-error">{error || 'Profile unavailable.'}</p>
      </div>
    );
  }

  const security = profile?.security;

  const quickStats = [
    { label: 'Security Clearance', value: security?.clearanceLabel || 'Level 1', icon: ShieldCheck, color: 'primary' },
    { label: '2FA Status', value: security?.twoFactorEnabled ? 'Active' : 'Inactive', icon: Lock, color: security?.twoFactorEnabled ? 'success' : 'warning' },
    { label: 'Network Zone', value: profile?.timezoneLabel || 'Global', icon: Globe, color: 'accent' },
  ];

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-7xl mx-auto space-y-6 pb-12"
    >
      {error && (
        <div className="rounded-2xl bg-warning/10 border border-warning/20 px-4 py-3 text-sm font-medium text-warning">
          {error}
        </div>
      )}

      {/* Hero Header Section */}
      <motion.div variants={itemVariants} className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-slate-900/90 to-slate-950/95 backdrop-blur-xl p-8 md:p-12 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 animate-fadeIn">
        <div className="absolute -top-12 -right-12 w-96 h-96 bg-primary/10 rounded-full filter blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute -bottom-24 -left-12 w-80 h-80 bg-emerald-500/5 rounded-full filter blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 w-full">
          <div className="relative group/avatar">
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full p-2 bg-white/10 backdrop-blur-md shadow-2xl border border-white/20 relative overflow-hidden group-hover/avatar:border-primary/40 transition-colors duration-500">
              <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden">
                {user?.avatar && user.avatar !== '/favicon.svg' ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover group-hover/avatar:scale-110 transition-transform duration-700" />
                ) : (
                  <UserIcon size={70} className="text-slate-400" />
                )}
              </div>
            </div>
            <button
              onClick={() => router.push(`${profileBasePath}/edit`)}
              className="absolute -bottom-1 -right-1 p-3.5 rounded-2xl bg-white text-slate-900 shadow-xl border border-white/40 hover:scale-110 transition-transform active:scale-95 cursor-pointer"
              title="Change Avatar"
            >
              <Camera size={18} />
            </button>
          </div>

          <div className="flex-1 text-center md:text-left space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary/20 backdrop-blur-md text-primary text-[10px] font-black uppercase tracking-widest border border-primary/30 shadow-inner">
              <Shield size={12} className="animate-pulse" />
              {user?.role?.replace('_', ' ') || 'Super Administrator'}
            </span>
            <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-none">
              {user?.name || profile?.fullName || 'Administrator'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 font-medium max-w-xl leading-relaxed">
              {user?.bio || profile?.bio || 'Overseeing system architecture, managing global entity provisions, and maintaining network security protocols.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-3 w-full md:w-auto shrink-0 relative z-20">
            <button
              onClick={() => router.push(`${profileBasePath}/edit`)}
              className="flex-grow py-4 px-6 bg-white/10 hover:bg-white/15 backdrop-blur-2xl border border-white/10 rounded-2xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 text-center text-white cursor-pointer"
            >
              Edit Configuration
            </button>
            <button
              onClick={() => setIsSignOutModalOpen(true)}
              className="flex-grow py-4 px-6 bg-error/20 hover:bg-error/30 text-error border border-error/20 hover:border-error/45 rounded-2xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 text-center cursor-pointer"
            >
              Terminate Session
            </button>
          </div>
        </div>
      </motion.div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        
        {/* Quick Stats - Span full width on small, 1 col on large */}
        <motion.div variants={itemVariants} className="md:col-span-3 lg:col-span-1 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-6">
          {quickStats.map((stat, idx) => (
            <div key={idx} className="glass-card p-6 flex items-center gap-5 group hover:border-primary/50 transition-all relative overflow-hidden shadow-premium cursor-default">
              <div 
                className="absolute -right-4 -top-4 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none"
                style={{ background: 'rgba(59, 163, 139, 0.25)' }}
              />
              <div className={cn(
                "p-3.5 rounded-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm",
                stat.color === 'primary' ? 'bg-primary/10 text-primary' :
                stat.color === 'success' ? 'bg-success/10 text-success' :
                stat.color === 'warning' ? 'bg-warning/10 text-warning' : 'bg-accent/10 text-accent'
              )}>
                <stat.icon size={22} />
              </div>
              <div className="relative z-10">
                <p className="text-micro font-black uppercase tracking-widest text-text-secondary">{stat.label}</p>
                <p className="text-lg font-bold text-white mt-0.5">{stat.value}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Identity Module */}
        <motion.div variants={itemVariants} className="md:col-span-2 lg:col-span-2 bg-slate-900/40 border border-white/5 shadow-2xl backdrop-blur-md rounded-[28px] p-8 group relative overflow-hidden">
          <div className="absolute -left-10 -top-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary shadow-sm border border-primary/10">
                <UserIcon size={20} />
              </div>
              <h2 className="text-xl font-black text-white">Identity Matrix</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-6 relative z-10">
            <div className="space-y-1 p-4 rounded-2xl bg-slate-950/40 border border-white/5 hover:border-primary/20 transition-all shadow-sm group/item">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <Mail size={14} className="group-hover/item:text-primary transition-colors" />
                <span className="text-micro font-black uppercase tracking-widest">Email Vector</span>
              </div>
              <div className="text-sm font-bold text-white break-all">{user?.email || profile?.email}</div>
            </div>

            <div className="space-y-1 p-4 rounded-2xl bg-slate-950/40 border border-white/5 hover:border-primary/20 transition-all shadow-sm group/item">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <Phone size={14} className="group-hover/item:text-primary transition-colors" />
                <span className="text-micro font-black uppercase tracking-widest">Comms Link</span>
              </div>
              <div className="text-sm font-bold text-white">{user?.phone || profile?.phone || 'Encrypted (Not set)'}</div>
            </div>

            <div className="space-y-1 p-4 rounded-2xl bg-slate-950/40 border border-white/5 hover:border-primary/20 transition-all shadow-sm group/item">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <Globe size={14} className="group-hover/item:text-primary transition-colors" />
                <span className="text-micro font-black uppercase tracking-widest">Time Zone</span>
              </div>
              <div className="text-sm font-bold text-white">{profile?.timezoneLabel || 'Asia/Kolkata'}</div>
            </div>

            <div className="space-y-1 p-4 rounded-2xl bg-slate-950/40 border border-white/5 hover:border-primary/20 transition-all shadow-sm group/item">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <Calendar size={14} className="group-hover/item:text-primary transition-colors" />
                <span className="text-micro font-black uppercase tracking-widest">Creation Date</span>
              </div>
              <div className="text-sm font-bold text-white">Epoch Origins (Legacy)</div>
            </div>
          </div>
        </motion.div>

        {/* Security Telemetry */}
        <motion.div variants={itemVariants} className="md:col-span-1 lg:col-span-1 bg-slate-900/40 border border-white/5 shadow-2xl backdrop-blur-md rounded-[28px] p-8 flex flex-col group relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-accent/5 rounded-full blur-3xl pointer-events-none animate-pulse" />
          <div className="flex items-center gap-3 mb-8 relative z-10">
            <div className="p-2.5 rounded-xl bg-accent/10 text-accent shadow-sm border border-accent/10">
              <Activity size={20} />
            </div>
            <h2 className="text-xl font-black text-white">Telemetry</h2>
          </div>

          <div className="flex-1 space-y-6 relative z-10">
            <div className="relative pl-6 border-l-2 border-white/10 pb-6 group-hover:border-primary/20 transition-colors">
              <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 border-slate-950 ${security?.twoFactorEnabled ? 'bg-success shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-warning shadow-[0_0_10px_rgba(245,158,11,0.5)]'}`} />
              <p className="text-micro font-black uppercase tracking-widest text-slate-400 mb-1">Authentication</p>
              <p className="text-sm font-bold text-white">{security?.twoFactorEnabled ? '2FA Enforced' : 'Vulnerable (2FA Off)'}</p>
            </div>

            <div className="relative pl-6 border-l-2 border-white/10 pb-6">
              <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 border-slate-950 bg-primary shadow-[0_0_10px_rgba(59,163,139,0.5)]" />
              <p className="text-micro font-black uppercase tracking-widest text-slate-400 mb-1">Last Login Date</p>
              <p className="text-sm font-bold text-white">
                {security?.lastLoginAt ? formatLastLogin(security.lastLoginAt) : 'No logs recorded'}
              </p>
            </div>

            <div className="relative pl-6">
              <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 border-slate-950 bg-slate-600" />
              <p className="text-micro font-black uppercase tracking-widest text-slate-400 mb-1">Access Vector</p>
              <p className="text-sm font-bold text-white flex items-center gap-2">
                <MapPin size={14} className="text-slate-400" />
                {security?.lastLoginLocation || 'Unknown Node'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Command Line / Action Center */}
        <motion.div variants={itemVariants} className="md:col-span-3 lg:col-span-2 bg-slate-900/40 border border-white/5 shadow-2xl backdrop-blur-md rounded-[28px] p-8 overflow-hidden relative group">
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-700 pointer-events-none" />
          
          <div className="relative z-10 flex flex-col h-full justify-between space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-primary shadow-sm group-hover:scale-110 transition-transform">
                  <Cpu size={20} />
                </div>
                <h3 className="text-lg font-black text-white">System Integrity</h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-lg">
                Your administrative privileges grant full access to infrastructure parameters. Use caution when modifying core tables or suspending active entities.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-black uppercase tracking-wider text-white hover:text-primary transition-all shadow-sm active:scale-95 cursor-pointer">
                <Key size={14} /> Update Passkey
              </button>
              <button className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-black uppercase tracking-wider text-white hover:text-primary transition-all shadow-sm active:scale-95 cursor-pointer">
                <History size={14} /> Audit Logs
              </button>
            </div>
          </div>
        </motion.div>

      </div>

      <SignOutModal 
        isOpen={isSignOutModalOpen} 
        onClose={() => setIsSignOutModalOpen(false)} 
        onConfirm={handleSignOut} 
      />
    </motion.div>
  );
};

export default ProfilePage;
