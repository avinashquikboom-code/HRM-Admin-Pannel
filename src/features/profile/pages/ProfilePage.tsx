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
      <motion.div variants={itemVariants} className="relative rounded-[32px] overflow-hidden glass-card border border-border shadow-2xl group">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-dark to-secondary opacity-90 transition-opacity duration-500" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay" />
        
        <div className="relative z-10 px-6 sm:px-12 py-10 sm:py-16 flex flex-col sm:flex-row items-center sm:items-start gap-8">
          <div className="relative group/avatar">
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full p-2 bg-white/10 backdrop-blur-md shadow-2xl border border-white/20">
              <div className="w-full h-full rounded-full bg-surface-variant flex items-center justify-center overflow-hidden">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <UserIcon size={70} className="text-muted" />
                )}
              </div>
            </div>
            <button
              onClick={() => router.push(`${profileBasePath}/edit`)}
              className="absolute -bottom-2 -right-2 sm:bottom-0 sm:right-0 p-3.5 rounded-2xl bg-white text-primary shadow-xl border border-white/40 hover:scale-110 transition-transform active:scale-95"
              title="Change Avatar"
            >
              <Camera size={20} />
            </button>
          </div>

          <div className="flex-1 text-center sm:text-left pt-2">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/20 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest border border-white/10 mb-4 shadow-inner">
                <Shield size={12} />
                {user?.role?.replace('_', ' ') || 'Super Administrator'}
              </span>
              <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-2">
                {user?.name || profile?.fullName || 'Administrator'}
              </h1>
              <p className="text-white/80 text-sm sm:text-base max-w-2xl font-medium leading-relaxed">
                {user?.bio || profile?.bio || 'Overseeing system architecture, managing global entity provisions, and maintaining network security protocols.'}
              </p>
            </motion.div>
          </div>

          <div className="flex sm:flex-col gap-3 w-full sm:w-auto mt-6 sm:mt-0">
            <button
              onClick={() => router.push(`${profileBasePath}/edit`)}
              className="flex-1 sm:flex-none px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white text-sm font-bold transition-all shadow-lg text-center"
            >
              Edit Configuration
            </button>
            <button
              onClick={() => setIsSignOutModalOpen(true)}
              className="flex-1 sm:flex-none px-6 py-3.5 rounded-2xl bg-error hover:bg-error/90 text-white border border-error-dark/20 text-sm font-bold transition-all shadow-lg shadow-error/20 text-center"
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
            <div key={idx} className="glass-card p-6 flex items-center gap-5 group hover:border-primary/30 transition-colors">
              <div className={`p-4 rounded-2xl bg-${stat.color}/10 text-${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-micro font-black uppercase tracking-widest text-text-secondary">{stat.label}</p>
                <p className="text-lg font-bold text-text-primary mt-1">{stat.value}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Identity Module */}
        <motion.div variants={itemVariants} className="md:col-span-2 lg:col-span-2 glass-card p-8 group">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                <UserIcon size={20} />
              </div>
              <h2 className="text-xl font-black text-text-primary">Identity Matrix</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-6">
            <div className="space-y-2 p-4 rounded-2xl bg-surface-variant/50 border border-border/50 hover:border-primary/20 transition-colors">
              <div className="flex items-center gap-2 text-text-secondary mb-1">
                <Mail size={16} />
                <span className="text-xs font-black uppercase tracking-widest">Email Vector</span>
              </div>
              <div className="text-base font-bold text-text-primary break-all">{user?.email || profile?.email}</div>
            </div>

            <div className="space-y-2 p-4 rounded-2xl bg-surface-variant/50 border border-border/50 hover:border-primary/20 transition-colors">
              <div className="flex items-center gap-2 text-text-secondary mb-1">
                <Phone size={16} />
                <span className="text-xs font-black uppercase tracking-widest">Comms Link</span>
              </div>
              <div className="text-base font-bold text-text-primary">{user?.phone || profile?.phone || 'Encrypted (Not set)'}</div>
            </div>

            <div className="space-y-2 p-4 rounded-2xl bg-surface-variant/50 border border-border/50 hover:border-primary/20 transition-colors">
              <div className="flex items-center gap-2 text-text-secondary mb-1">
                <Globe size={16} />
                <span className="text-xs font-black uppercase tracking-widest">Time Zone</span>
              </div>
              <div className="text-base font-bold text-text-primary">{profile?.timezoneLabel || 'Asia/Kolkata'}</div>
            </div>

            <div className="space-y-2 p-4 rounded-2xl bg-surface-variant/50 border border-border/50 hover:border-primary/20 transition-colors">
              <div className="flex items-center gap-2 text-text-secondary mb-1">
                <Calendar size={16} />
                <span className="text-xs font-black uppercase tracking-widest">Creation Date</span>
              </div>
              <div className="text-base font-bold text-text-primary">Epoch Origins (Legacy)</div>
            </div>
          </div>
        </motion.div>

        {/* Security Telemetry */}
        <motion.div variants={itemVariants} className="md:col-span-1 lg:col-span-1 glass-card p-8 flex flex-col">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 rounded-xl bg-accent/10 text-accent">
              <Activity size={20} />
            </div>
            <h2 className="text-xl font-black text-text-primary">Telemetry</h2>
          </div>

          <div className="flex-1 space-y-6">
            <div className="relative pl-6 border-l-2 border-border pb-6">
              <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 border-surface ${security?.twoFactorEnabled ? 'bg-success' : 'bg-warning'}`} />
              <p className="text-xs font-black uppercase tracking-widest text-text-secondary mb-1">Authentication</p>
              <p className="text-sm font-bold text-text-primary">{security?.twoFactorEnabled ? '2FA Enforced' : 'Vulnerable (2FA Off)'}</p>
            </div>

            <div className="relative pl-6 border-l-2 border-border pb-6">
              <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 border-surface bg-primary" />
              <p className="text-xs font-black uppercase tracking-widest text-text-secondary mb-1">Last Login Date</p>
              <p className="text-sm font-bold text-text-primary">
                {security?.lastLoginAt ? formatLastLogin(security.lastLoginAt) : 'No logs recorded'}
              </p>
            </div>

            <div className="relative pl-6">
              <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 border-surface bg-muted" />
              <p className="text-xs font-black uppercase tracking-widest text-text-secondary mb-1">Access Vector</p>
              <p className="text-sm font-bold text-text-primary flex items-center gap-2">
                <MapPin size={14} className="text-muted" />
                {security?.lastLoginLocation || 'Unknown Node'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Command Line / Action Center */}
        <motion.div variants={itemVariants} className="md:col-span-3 lg:col-span-2 glass-card p-8 bg-surface-variant overflow-hidden relative group">
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-700" />
          
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-surface rounded-lg text-primary shadow-sm">
                  <Cpu size={18} />
                </div>
                <h3 className="text-lg font-black text-text-primary">System Integrity</h3>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed max-w-lg mb-8">
                Your administrative privileges grant full access to infrastructure parameters. Use caution when modifying core tables or suspending active entities.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <button className="flex items-center gap-2 px-5 py-3 rounded-xl bg-surface border border-border text-sm font-bold text-text-primary hover:text-primary hover:border-primary/30 transition-all shadow-sm">
                <Key size={16} /> Update Passkey
              </button>
              <button className="flex items-center gap-2 px-5 py-3 rounded-xl bg-surface border border-border text-sm font-bold text-text-primary hover:text-primary hover:border-primary/30 transition-all shadow-sm">
                <History size={16} /> Audit Logs
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
