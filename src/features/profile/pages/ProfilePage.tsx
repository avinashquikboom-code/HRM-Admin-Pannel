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
  Loader2
} from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import { useRouter } from 'next/navigation';
import SignOutModal from '@/components/SignOutModal';
import { useAdminProfile } from '@/hooks/useAdminProfile';
import { formatLastLogin } from '@/lib/profileMapper';

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
  const { user, profile, isLoading, error } = useAdminProfile();
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);

  const handleSignOut = () => {
    setIsSignOutModalOpen(false);
  };

  if (isLoading && !user?.profile) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 size={40} className="animate-spin text-primary" />
        <p className="text-sm font-bold text-text-secondary uppercase tracking-widest">
          Loading profile...
        </p>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <p className="text-sm font-bold text-error">{error}</p>
      </div>
    );
  }

  const security = profile?.security;

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-5xl mx-auto space-y-8 pb-10"
    >
      {/* Profile Header */}
      <motion.div variants={itemVariants} className="glass-card overflow-hidden border-none shadow-2xl">
        <div className="h-48 bg-gradient-to-br from-primary via-primary-dark to-secondary relative">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
        </div>
        
        <div className="px-8 pb-8">
          <div className="relative flex flex-col md:flex-row items-center md:items-end gap-6 -mt-24">
            <div className="relative group">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="w-44 h-44 rounded-full bg-surface p-2 shadow-2xl border border-border"
              >
                <div className="w-full h-full rounded-full bg-surface-variant flex items-center justify-center overflow-hidden border border-border/50">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon size={80} className="text-muted" />
                  )}
                </div>
              </motion.div>
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => router.push('/profile/edit')}
                className="absolute bottom-2 right-2 p-3.5 bg-primary text-white rounded-2xl shadow-xl hover:bg-primary-dark transition-all border-4 border-surface"
              >
                <Camera size={20} />
              </motion.button>
            </div>
            
            <div className="flex-grow pt-4 md:pt-0 text-center md:text-left">
              <h1 className="text-4xl font-black text-text-primary tracking-tight">
                {user?.name || profile?.fullName || 'Admin'}
              </h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-3">
                <div className="px-4 py-1.5 bg-surface-variant border border-border rounded-full flex items-center gap-2">
                  <ShieldCheck size={16} className="text-primary" />
                  <span className="text-[10px] font-black text-text-primary uppercase tracking-[0.2em]">
                    {user?.role?.replace('_', ' ') || 'Administrator'}
                  </span>
                </div>
                <div className="px-4 py-1.5 bg-surface-variant border border-border rounded-full flex items-center gap-2">
                  <Globe size={14} className="text-text-secondary" />
                  <span className="text-[10px] font-bold text-text-primary uppercase tracking-widest">
                    {profile?.timezoneLabel || 'Global Ops'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6 md:mt-0">
              <button 
                onClick={() => router.push('/profile/edit')}
                className="px-6 py-2.5 bg-surface border border-border text-text-primary font-bold rounded-xl hover:bg-surface-variant transition-all shadow-sm text-sm"
              >
                Edit
              </button>
              <button 
                onClick={() => setIsSignOutModalOpen(true)}
                className="px-6 py-2.5 bg-error text-white font-bold rounded-xl shadow-lg shadow-error/10 hover:bg-error/90 transition-all text-sm"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-8">
          <motion.div variants={itemVariants} className="glass-card p-10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <UserIcon size={120} className="text-primary" />
            </div>
            
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Activity size={20} />
              </div>
              <h3 className="text-xl font-black text-text-primary uppercase tracking-tight">Identity Registry</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em] flex items-center gap-2">
                  <UserIcon size={12} /> Full Name
                </label>
                <p className="text-lg font-bold text-text-primary">{user?.name || profile?.fullName}</p>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em] flex items-center gap-2">
                  <Mail size={12} /> Email Address
                </label>
                <p className="text-lg font-bold text-text-primary">{user?.email || profile?.email}</p>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em] flex items-center gap-2">
                  <Phone size={12} /> Contact Number
                </label>
                <p className="text-lg font-bold text-text-primary">{user?.phone || profile?.phone}</p>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em] flex items-center gap-2">
                  <Shield size={12} /> Authorization
                </label>
                <div className="flex items-center gap-2 text-success font-black text-sm">
                  <div className="w-2.5 h-2.5 rounded-full bg-success animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                  {security?.clearanceLabel || 'L5 ACCESS'} • VERIFIED
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="glass-card p-10">
            <h3 className="text-xl font-black text-text-primary uppercase tracking-tight mb-6">Strategic Profile</h3>
            <p className="text-base text-text-secondary leading-relaxed font-medium">
              {user?.bio || profile?.bio}
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="glass-card p-10 space-y-8">
            <h3 className="text-xl font-black text-text-primary uppercase tracking-tight">Security Protocols</h3>
            <div className="grid grid-cols-1 gap-4">
              {[
                {
                  label: 'Master Password',
                  desc: 'Secure credential configured for admin access',
                  icon: Lock,
                  action: 'Rotate',
                },
                {
                  label: 'Biometric 2FA',
                  desc: security?.twoFactorEnabled
                    ? 'Hardware-level authentication active'
                    : 'Two-factor authentication disabled',
                  icon: Shield,
                  status: security?.twoFactorStatus,
                  action: 'Configure',
                },
                {
                  label: 'Last Login',
                  desc: security?.lastLoginAt
                    ? `${formatLastLogin(security.lastLoginAt)} • ${security.lastLoginLocation}`
                    : 'No recent login recorded',
                  icon: Smartphone,
                  action: 'Review',
                },
              ].map((item) => (
                <motion.button 
                  key={item.label} 
                  whileHover={{ x: 8, backgroundColor: 'var(--surface-variant)' }}
                  className="w-full flex items-center justify-between p-5 rounded-[24px] transition-all group border border-border/50 hover:border-primary/30"
                >
                  <div className="flex items-center gap-5 text-left">
                    <div className="p-4 bg-surface-variant rounded-2xl group-hover:bg-primary/10 group-hover:text-primary transition-colors border border-border group-hover:border-primary/20">
                      <item.icon size={22} />
                    </div>
                    <div>
                      <p className="text-base font-bold text-text-primary group-hover:text-primary transition-colors">{item.label}</p>
                      <p className="text-xs text-text-secondary mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {item.status && (
                      <span className="text-[10px] font-black bg-success/10 text-success px-3 py-1 rounded-full uppercase tracking-widest border border-success/20 shadow-sm">
                        {item.status}
                      </span>
                    )}
                    <div className="flex items-center gap-1 text-[11px] font-black text-primary uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.action} <ChevronRight size={14} />
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Column: Activity */}
        <div className="space-y-8">
          <motion.div variants={itemVariants} className="glass-card p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-sm font-black text-text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                <History size={16} className="text-primary" />
                Access Logs
              </h3>
              <button className="text-[10px] font-black text-primary uppercase hover:underline">View All</button>
            </div>
            <div className="space-y-8 relative">
              <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-border/50" />
              {security?.lastLoginAt ? (
                <div className="flex gap-6 relative group cursor-default">
                  <div className="w-6 h-6 rounded-full border-4 border-surface bg-primary z-10 flex-shrink-0 flex items-center justify-center shadow-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                  <div className="flex-grow">
                    <p className="text-sm font-bold text-text-primary">Latest session</p>
                    <div className="flex flex-col gap-0.5 mt-1">
                      <p className="text-[10px] text-text-secondary font-medium">
                        {formatLastLogin(security.lastLoginAt)}
                      </p>
                      <p className="text-[9px] text-muted font-bold uppercase tracking-wider">
                        {security.lastLoginLocation}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-text-secondary">No access logs available.</p>
              )}
            </div>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            className="glass-card p-8 bg-gradient-to-br from-primary to-primary-dark text-white border-none overflow-hidden relative group"
          >
            <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700" />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-6 border border-white/20">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-lg font-black mb-2 tracking-tight uppercase">Admin Hotline</h3>
              <p className="text-sm text-white/80 leading-relaxed mb-8 font-medium">
                Direct access to our senior engineering team for emergency platform support.
              </p>
              <button className="w-full py-4 bg-white text-primary hover:bg-primary-light hover:text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-2xl active:scale-95">
                Initiate Secure Call
              </button>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="glass-card p-6 bg-surface-variant/50 border-dashed border-2 border-border flex flex-col items-center justify-center text-center py-10">
            <div className="w-16 h-16 rounded-3xl bg-surface flex items-center justify-center mb-4 border border-border">
              <UserIcon size={32} className="text-muted" />
            </div>
            <p className="text-xs font-bold text-text-secondary mb-2">Secondary Admin</p>
            <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Add Delegate</button>
          </motion.div>
        </div>
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
