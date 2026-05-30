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
import { useRouter, usePathname } from 'next/navigation';
import SignOutModal from '@/components/SignOutModal';
import { useAdminProfile } from '@/hooks/useAdminProfile';
import { formatLastLogin } from '@/lib/profileMapper';
import { getProfileBasePath, isSuperAdminPath } from '@/lib/portals';

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
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);

  const handleSignOut = () => {
    setIsSignOutModalOpen(false);
  };

  if (isLoading && !user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 size={40} className="animate-spin text-primary" />
        <p className="text-sm font-bold text-text-secondary uppercase tracking-widest">
          Loading profile...
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

  const stats = [
    {
      label: 'Clearance',
      value: security?.clearanceLabel || 'Level 1',
      icon: ShieldCheck,
      accent: 'bg-primary/10 text-primary',
    },
    {
      label: 'Two-Factor',
      value: security?.twoFactorEnabled ? 'Enabled' : 'Disabled',
      icon: Lock,
      accent: security?.twoFactorEnabled ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning',
    },
    {
      label: 'Last Access',
      value: security?.lastLoginAt ? formatLastLogin(security.lastLoginAt) : 'Unknown',
      icon: History,
      accent: 'bg-surface-variant text-text-primary',
    },
  ];

  return (
    <motion.div 
      initial={false}
      animate="visible"
      variants={containerVariants}
      className="max-w-6xl mx-auto space-y-8 pb-10"
    >
      {error && (
        <div className="rounded-2xl bg-warning/10 border border-warning/20 px-4 py-3 text-sm font-medium text-warning">
          {error}
        </div>
      )}

      <motion.div variants={itemVariants} className="glass-card overflow-hidden border-none shadow-2xl">
        <div className="relative overflow-hidden">
          <div className="h-48 bg-gradient-to-r from-primary via-primary-dark to-secondary relative">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
          </div>
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-surface to-transparent" />
        </div>

        <div className="px-8 pb-10 pt-6">
          <div className="flex flex-col lg:flex-row items-center gap-6 lg:items-end">
            <div className="relative">
              <div className="w-40 h-40 rounded-full bg-surface p-2 shadow-2xl border border-border overflow-hidden">
                <div className="w-full h-full rounded-full bg-surface-variant flex items-center justify-center overflow-hidden border border-border/50">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon size={90} className="text-muted" />
                  )}
                </div>
              </div>
              <button
                onClick={() => router.push(`${profileBasePath}/edit`)}
                className="absolute -bottom-3 right-0 inline-flex items-center justify-center w-12 h-12 rounded-3xl bg-white text-primary shadow-lg border border-border hover:bg-surface transition-all"
                aria-label="Edit profile"
              >
                <Camera size={20} />
              </button>
            </div>

            <div className="flex-1 text-center lg:text-left">
              <p className="text-micro font-black uppercase tracking-[0.4em] text-text-secondary">Administrator profile</p>
              <h1 className="mt-4 text-4xl font-black text-text-primary leading-tight">
                {user?.name || profile?.fullName || 'Admin'}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-text-secondary">
                {user?.bio || profile?.bio || 'Manage your personal identity, permissions, and access settings across the admin panel from one secure location.'}
              </p>
              <div className="mt-6 flex flex-wrap justify-center lg:justify-start gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-variant px-4 py-2 text-sm font-semibold text-text-primary">
                  <ShieldCheck size={14} /> {user?.role?.replace('_', ' ') || 'Administrator'}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-variant px-4 py-2 text-sm font-semibold text-text-primary">
                  <Globe size={14} /> {profile?.timezoneLabel || 'Asia/Kolkata'}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3 w-full lg:w-auto">
              <button
                onClick={() => router.push(`${profileBasePath}/edit`)}
                className="rounded-3xl bg-surface border border-border px-6 py-3 text-sm font-bold text-text-primary hover:bg-surface-variant transition-all"
              >
                Edit Profile
              </button>
              <button
                onClick={() => setIsSignOutModalOpen(true)}
                className="rounded-3xl bg-error text-white px-6 py-3 text-sm font-bold hover:bg-error/90 transition-all"
              >
                Sign Out
              </button>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
                <div className={`inline-flex items-center justify-center rounded-3xl p-3 ${stat.accent}`}>
                  <stat.icon size={18} />
                </div>
                <p className="mt-4 text-xs uppercase tracking-[0.35em] text-text-secondary font-black">{stat.label}</p>
                <p className="mt-2 text-lg font-bold text-text-primary">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-8">
          <motion.div variants={itemVariants} className="glass-card p-8">
            <div className="flex items-start justify-between gap-4 mb-8">
              <div>
                <h2 className="text-xl font-black text-text-primary">Identity Details</h2>
                <p className="text-sm text-text-secondary mt-2">Essential account and contact information for your admin profile.</p>
              </div>
              <button
                onClick={() => router.push(`${profileBasePath}/edit`)}
                className="rounded-3xl border border-border bg-surface px-4 py-2 text-sm font-semibold text-text-primary hover:bg-surface-variant transition-all"
              >
                Edit details
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="text-micro font-black uppercase tracking-[0.3em] text-text-secondary">Full name</div>
                <div className="text-lg font-bold text-text-primary">{user?.name || profile?.fullName}</div>
              </div>
              <div className="space-y-4">
                <div className="text-micro font-black uppercase tracking-[0.3em] text-text-secondary">Email address</div>
                <div className="text-lg font-bold text-text-primary">{user?.email || profile?.email}</div>
              </div>
              <div className="space-y-4">
                <div className="text-micro font-black uppercase tracking-[0.3em] text-text-secondary">Phone number</div>
                <div className="text-lg font-bold text-text-primary">{user?.phone || profile?.phone || 'Not set'}</div>
              </div>
              <div className="space-y-4">
                <div className="text-micro font-black uppercase tracking-[0.3em] text-text-secondary">Time zone</div>
                <div className="text-lg font-bold text-text-primary">{profile?.timezoneLabel || 'Asia/Kolkata'}</div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="glass-card p-8">
            <h2 className="text-xl font-black text-text-primary mb-5">Profile Overview</h2>
            <p className="text-sm leading-7 text-text-secondary">
              {user?.bio || profile?.bio || 'Add a brief professional summary to keep your panel identity informative and approachable.'}
            </p>
          </motion.div>
        </div>

        <div className="space-y-8">
          <motion.div variants={itemVariants} className="glass-card p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-black text-text-primary">Security Center</h2>
                <p className="text-sm text-text-secondary mt-2">Manage your access controls and recent activity.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-3xl border border-border bg-surface p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-black uppercase tracking-[0.3em] text-text-secondary">Two-factor authentication</p>
                    <p className="mt-2 text-base font-bold text-text-primary">{security?.twoFactorEnabled ? 'Enabled' : 'Disabled'}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.2em] ${security?.twoFactorEnabled ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                    {security?.twoFactorStatus || (security?.twoFactorEnabled ? 'Active' : 'Inactive')}
                  </span>
                </div>
              </div>

              <div className="rounded-3xl border border-border bg-surface p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-black uppercase tracking-[0.3em] text-text-secondary">Latest login</p>
                    <p className="mt-2 text-base font-bold text-text-primary">
                      {security?.lastLoginAt ? formatLastLogin(security.lastLoginAt) : 'No login recorded'}
                    </p>
                  </div>
                  <div className="text-right text-sm text-text-secondary">
                    {security?.lastLoginLocation || 'Unknown location'}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {!hideLoginTracking && (
            <motion.div variants={itemVariants} className="glass-card p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-black text-text-primary">Access Log</h2>
                  <p className="text-sm text-text-secondary mt-2">Review your most recent authenticated session.</p>
                </div>
                <button className="text-sm font-black uppercase tracking-[0.25em] text-primary hover:underline">View all</button>
              </div>
              <div className="rounded-[32px] border border-border bg-surface p-6">
                {security?.lastLoginAt ? (
                  <div className="flex items-start gap-4">
                    <div className="mt-1 w-4 h-4 rounded-full bg-primary shadow-sm" />
                    <div>
                      <p className="text-sm font-bold text-text-primary">Latest session</p>
                      <p className="mt-2 text-sm text-text-secondary">{formatLastLogin(security.lastLoginAt)}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.2em] text-text-secondary font-black">{security.lastLoginLocation}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-text-secondary">No access logs available.</p>
                )}
              </div>
            </motion.div>
          )}

          <motion.div variants={itemVariants} className="glass-card p-8 bg-gradient-to-br from-primary to-primary-dark text-white border-none overflow-hidden relative group">
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
        </div>
      </div>

      <motion.div variants={itemVariants} className="glass-card p-8 border-dashed border-2 border-border text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-surface border border-border">
          <UserIcon size={32} className="text-muted" />
        </div>
        <p className="text-sm font-black uppercase tracking-[0.4em] text-text-secondary mb-3">Delegate Access</p>
        <p className="text-sm leading-7 text-text-secondary mb-6">
          Add a secondary administrator to share critical workflows and maintain continuity during high-priority operations.
        </p>
        <button className="rounded-3xl bg-surface border border-border px-6 py-3 text-sm font-bold text-text-primary hover:bg-surface-variant transition-all">
          Add Delegate
        </button>
      </motion.div>

      <SignOutModal 
        isOpen={isSignOutModalOpen} 
        onClose={() => setIsSignOutModalOpen(false)} 
        onConfirm={handleSignOut} 
      />
    </motion.div>
  );
};

export default ProfilePage;
