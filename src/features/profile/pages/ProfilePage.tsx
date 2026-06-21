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
  Mail,
  Phone,
  Globe,
  Activity,
  History,
  Loader2,
  Key,
  Calendar,
  MapPin,
  Cpu,
  Pencil,
  Fingerprint,
  ShieldAlert
} from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import SignOutModal from '@/components/SignOutModal';
import UpdatePasswordModal from '@/components/UpdatePasswordModal';
import { useAdminProfile } from '@/hooks/useAdminProfile';
import { formatLastLogin } from '@/lib/profileMapper';
import { getProfileBasePath, isSuperAdminPath, getLoginPathForPortal } from '@/lib/portals';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { cn } from '@/utils/cn';
import SuperAdminHeader from '@/components/SuperAdminHeader';

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
  const [isUpdatePasswordModalOpen, setIsUpdatePasswordModalOpen] = useState(false);

  const handleSignOut = () => {
    setIsSignOutModalOpen(false);
    console.log('🚪 [PROFILE] Sign out initiated for user:', user?.email);
    dispatch(logout());
    const resolvedPortal = portal ?? (isSuperAdminPath(pathname) ? 'super_admin' : 'platform_admin');
    router.push(getLoginPathForPortal(resolvedPortal));
  };

  if (isLoading && !user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 size={40} className="animate-spin text-primary" />
        <p className="text-sm font-bold text-text-secondary uppercase tracking-widest">Loading identity...</p>
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
    { label: 'Security Clearance', value: security?.clearanceLabel || 'Level 5', icon: ShieldCheck, color: 'primary' },
    { label: '2FA Status', value: security?.twoFactorEnabled ? 'Active' : 'Inactive', icon: Lock, color: security?.twoFactorEnabled ? 'success' : 'warning' },
    { label: 'Network Zone', value: profile?.timezoneLabel || 'Global', icon: Globe, color: 'accent' },
    { label: 'Last Login', value: security?.lastLoginAt ? formatLastLogin(security.lastLoginAt) : 'No logs', icon: Activity, color: 'primary' },
  ];

  const memberSinceYear = profile?.createdAt 
    ? new Date(profile.createdAt).getFullYear().toString() 
    : 'N/A';

  const identityFields = [
    { label: 'Full Name', value: user?.name || profile?.fullName || 'Administrator', icon: UserIcon },
    { label: 'Email Address', value: user?.email || profile?.email || 'N/A', icon: Mail },
    { label: 'Phone Number', value: user?.phone || profile?.phone || 'Not set', icon: Phone },
    { label: 'Time Zone', value: profile?.timezoneLabel || 'Asia/Kolkata', icon: Globe },
    { label: 'Account Role', value: user?.role?.replace('_', ' ') || 'Super Administrator', icon: Shield },
    { label: 'Member Since', value: memberSinceYear, icon: Calendar },
  ];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8 pb-12"
    >
      {error && (
        <div className="rounded-sm bg-warning/10 border border-warning/20 px-4 py-3 text-sm font-medium text-warning">
          {error}
        </div>
      )}

      <SuperAdminHeader
        title={user?.name || profile?.fullName || 'Administrator'}
        subtitle={user?.bio || profile?.bio || 'Overseeing system architecture, managing global entity provisions, and maintaining network security protocols.'}
        badgeText={user?.role?.replace('_', ' ') || 'Super Administrator'}
        badgeIcon={Shield}
        stats={quickStats.map(stat => ({
          label: stat.label,
          value: stat.value,
          icon: stat.icon
        }))}
      >
        <button
          onClick={() => router.push(`${profileBasePath}/edit`)}
          className="btn-primary group shadow-xl shadow-primary/20 flex items-center gap-2"
        >
          <Pencil size={18} className="group-hover:rotate-12 transition-transform" />
          Edit Profile
        </button>
      </SuperAdminHeader>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column - Avatar, Security, & Activity */}
        <div className="lg:col-span-4 space-y-6">

          {/* Avatar Card */}
          <motion.div variants={itemVariants} className="glass-card p-8 text-center relative overflow-hidden group">
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none group-hover:bg-primary/10 transition-colors duration-700" />

            <div className="relative inline-block mb-6">
              <div className="w-32 h-32 rounded-full p-1.5 bg-gradient-to-br from-primary/20 to-transparent shadow-2xl border border-white/10 relative overflow-hidden">
                <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden">
                  {user?.avatar && user.avatar !== '/favicon.svg' ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <UserIcon size={60} className="text-slate-400" />
                  )}
                </div>
              </div>
              <button
                onClick={() => router.push(`${profileBasePath}/edit`)}
                className="absolute -bottom-1 -right-1 p-2.5 rounded-sm bg-primary text-white shadow-lg border border-primary/30 hover:scale-110 transition-transform active:scale-95 cursor-pointer"
                title="Change Avatar"
              >
                <Camera size={16} />
              </button>
            </div>

            <h3 className="text-xl font-black text-text-primary mb-1">{user?.name || profile?.fullName}</h3>
            <p className="text-sm text-text-secondary font-medium mb-4">{user?.email || profile?.email}</p>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-widest">
              <ShieldCheck size={12} />
              {security?.clearanceLabel || 'Level 5 Clearance'}
            </div>
          </motion.div>

          {/* Security Status Card */}
          <motion.div variants={itemVariants} className="glass-card p-6 space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-sm bg-accent/10 text-accent border border-accent/10">
                <ShieldAlert size={18} />
              </div>
              <h3 className="text-sm font-black text-text-primary uppercase tracking-widest">Security Status</h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-sm bg-surface-variant/50 border border-border/50">
                <div className="flex items-center gap-3">
                  <Fingerprint size={16} className="text-primary" />
                  <span className="text-sm font-bold text-text-primary">2FA Authentication</span>
                </div>
                <span className={cn(
                  "text-xs font-black px-2.5 py-1 rounded-full uppercase tracking-wider",
                  security?.twoFactorEnabled ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                )}>
                  {security?.twoFactorEnabled ? 'Active' : 'Inactive'}
                </span>
              </div>

              {!hideLoginTracking && (
                <div className="flex items-center justify-between p-3 rounded-sm bg-surface-variant/50 border border-border/50">
                  <div className="flex items-center gap-3">
                    <MapPin size={16} className="text-primary" />
                    <span className="text-sm font-bold text-text-primary">Last Access</span>
                  </div>
                  <span className="text-xs font-black text-text-secondary">{security?.lastLoginLocation || 'Unknown'}</span>
                </div>
              )}
            </div>
          </motion.div>

        </div>

        {/* Right Column - Identity & Actions */}
        <div className="lg:col-span-8 space-y-6">

          {/* Identity Information */}
          <motion.div variants={itemVariants} className="glass-card p-8 relative overflow-hidden">
            <div className="absolute -left-10 -top-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between mb-6 relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-sm bg-primary/10 text-primary shadow-sm border border-primary/10">
                  <UserIcon size={20} />
                </div>
                <h2 className="text-xl font-black text-text-primary">Identity Information</h2>
              </div>
              <button
                onClick={() => router.push(`${profileBasePath}/edit`)}
                className="flex items-center gap-2 px-4 py-2 bg-surface-variant hover:bg-border border border-border/50 text-xs font-black uppercase tracking-wider text-text-primary hover:text-primary transition-all active:scale-95"
              >
                <Pencil size={14} /> Edit
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
              {identityFields.map((field, idx) => (
                <div key={idx} className="flex items-start gap-4 p-4 rounded-sm bg-surface-variant/30 border border-border/30 hover:border-primary/20 transition-all group/item">
                  <div className="p-2.5 rounded-sm bg-primary/10 text-primary shadow-sm group-hover/item:scale-110 transition-transform">
                    <field.icon size={18} />
                  </div>
                  <div>
                    <p className="text-micro font-black uppercase tracking-widest text-text-secondary mb-1">{field.label}</p>
                    <p className="text-sm font-bold text-text-primary">{field.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Action Center */}
          <motion.div variants={itemVariants} className="glass-card p-6 sm:p-8 relative overflow-hidden group">
            <div className="absolute -right-16 -top-16 w-64 h-64 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-700 pointer-events-none" />

            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3 border-b border-border/30 pb-4">
                <div className="p-2.5 rounded-sm bg-primary/10 text-primary border border-primary/20">
                  <Cpu size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-text-primary uppercase tracking-widest">System Actions</h3>
                  <p className="text-xs text-text-secondary mt-1">Manage your account security, view audit logs, or sign out.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Update Password Tile */}
                <div
                  onClick={() => setIsUpdatePasswordModalOpen(true)}
                  className="group/tile p-5 rounded-sm bg-surface-variant/30 border border-border/30 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 cursor-pointer flex gap-4 items-start"
                >
                  <div className="p-3 rounded-sm bg-primary/10 text-primary border border-primary/20 group-hover/tile:bg-primary group-hover/tile:text-always-white transition-all duration-300 shadow-sm shrink-0">
                    <Key size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-text-primary group-hover/tile:text-primary transition-colors">Update Password</h4>
                    <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                      Modify your account login credentials and security protocols.
                    </p>
                  </div>
                </div>

                {/* Sign Out Tile */}
                <div
                  onClick={() => setIsSignOutModalOpen(true)}
                  className="group/tile p-5 rounded-sm bg-surface-variant/30 border border-border/30 hover:border-error/30 hover:bg-error/5 transition-all duration-300 cursor-pointer flex gap-4 items-start"
                >
                  <div className="p-3 rounded-sm bg-error/10 text-error border border-error/20 group-hover/tile:bg-error group-hover/tile:text-always-white transition-all duration-300 shadow-sm shrink-0">
                    <LogOut size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-text-primary group-hover/tile:text-error transition-colors">Sign Out</h4>
                    <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                      Securely terminate your current session and exit the panel.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <SignOutModal
        isOpen={isSignOutModalOpen}
        onClose={() => setIsSignOutModalOpen(false)}
        onConfirm={handleSignOut}
      />

      <UpdatePasswordModal
        isOpen={isUpdatePasswordModalOpen}
        onClose={() => setIsUpdatePasswordModalOpen(false)}
      />
    </motion.div>
  );
};

export default ProfilePage;
