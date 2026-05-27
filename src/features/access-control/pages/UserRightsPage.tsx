'use client';

import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { 
  ShieldCheck, 
  UserPlus, 
  Users, 
  CheckSquare, 
  Layers,
  Search,
  Filter,
  UserCheck,
  UserX,
  ShieldAlert,
  Calendar,
  Lock,
  RefreshCw,
  SlidersHorizontal
} from 'lucide-react';
import UserRightsControl from '@/components/UserRightsControl';
import TableSkeleton from '@/components/TableSkeleton';
import RegisterUserWithRights from '@/features/access-control/components/RegisterUserWithRights';
import ManageUserPermissionsModal from '@/features/access-control/components/ManageUserPermissionsModal';
import { usePlatformUsers } from '@/hooks/usePlatformUsers';
import type { PlatformUser } from '@/services/userService';
import { cn } from '@/utils/cn';
import {
  SUPER_ADMIN_MANAGED_ROLES,
  ADMIN_MANAGED_ROLES,
  countEnabledModules,
  getManagedRolesForPortal,
  loadRolePermissions,
} from '@/lib/roleAccess';
import { useEffect, useState, useMemo } from 'react';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const itemVariants: Variants = {
  hidden: { y: 16, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 100, damping: 15 },
  },
};

interface UserRightsPageProps {
  variant: 'super_admin' | 'platform_admin';
}

const PAGE_CONFIG = {
  super_admin: {
    label: 'Super Admin',
    title: 'Admin Rights Control',
    description:
      'Configure what Admin (HR) can access in the platform.',
    managerPortal: 'super_admin' as const,
    managedRoles: SUPER_ADMIN_MANAGED_ROLES,
    defaultRole: 'platform_admin' as const,
    panelTitle: 'Admin (HR) permissions',
    panelDescription:
      'Use checkboxes to grant or revoke Admin module access, then click Save.',
    accentClass: 'bg-secondary/10 text-secondary',
  },
  platform_admin: {
    label: 'Admin Panel',
    title: 'Employee Rights Control',
    description:
      'Configure what employees can access in the self-service portal. Super Admin controls your Admin permissions.',
    managerPortal: 'platform_admin' as const,
    managedRoles: ADMIN_MANAGED_ROLES,
    defaultRole: 'employee' as const,
    panelTitle: 'Employee permissions',
    panelDescription:
      'Toggle checkboxes to grant or revoke employee module access, then click Save.',
    accentClass: 'bg-primary/10 text-primary',
  },
};

export default function UserRightsPage({ variant }: UserRightsPageProps) {
  const config = PAGE_CONFIG[variant];
  const { users, isLoading: isUsersLoading, error: usersError, refetch: refetchUsers } = usePlatformUsers();
  
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [profileFilter, setProfileFilter] = useState('All');
  const [selectedUser, setSelectedUser] = useState<PlatformUser | null>(null);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [userActionSuccess, setUserActionSuccess] = useState('');

  const [stats, setStats] = useState({
    roles: config.managedRoles.length,
    modules: 0,
    enabled: 0,
  });

  useEffect(() => {
    if (userActionSuccess) {
      const timer = setTimeout(() => setUserActionSuccess(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [userActionSuccess]);

  useEffect(() => {
    const permissions = loadRolePermissions();
    let modules = 0;
    let enabled = 0;

    for (const role of config.managedRoles) {
      const counts = countEnabledModules(role, permissions);
      modules += counts.total;
      enabled += counts.enabled;
    }

    setStats({ roles: config.managedRoles.length, modules, enabled });
  }, [config.managedRoles]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
                            u.email.toLowerCase().includes(userSearch.toLowerCase());
      const matchesRole = roleFilter === 'All' || u.role === roleFilter;
      const matchesProfile = 
        profileFilter === 'All' ||
        (profileFilter === 'Linked' && u.hasEmployeeProfile) ||
        (profileFilter === 'Unlinked' && !u.hasEmployeeProfile);
      
      return matchesSearch && matchesRole && matchesProfile;
    });
  }, [users, userSearch, roleFilter, profileFilter]);

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-error/10 text-error border-error/20';
      case 'HR':
        return 'bg-secondary/10 text-secondary border-secondary/20';
      case 'EMPLOYEE':
        return 'bg-primary/10 text-primary border-primary/20';
      default:
        return 'bg-muted/10 text-muted border-border';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'System Admin';
      case 'HR':
        return 'HR Admin';
      case 'EMPLOYEE':
        return 'Portal User';
      default:
        return role;
    }
  };

  const formatRegisteredDate = (dateString: string) => {
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return '—';
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8 pb-10"
    >
      <motion.div
        variants={itemVariants}
        className="flex flex-col xl:flex-row xl:items-end justify-between gap-6"
      >
        <div className="max-w-3xl">
          <p className="text-label text-primary mb-1">{config.label}</p>
          <h1 className="heading-1">{config.title}</h1>
          <p className="text-page-desc mt-2">{config.description}</p>
        </div>
        <Link
          href="#register-user-rights"
          className="btn-primary shadow-xl shadow-primary/20 px-6 py-3.5 shrink-0 self-start xl:self-auto"
        >
          <UserPlus size={18} />
          Register User
        </Link>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            label: 'Roles you manage',
            value: stats.roles,
            icon: Users,
            tone: 'text-primary bg-primary/10',
          },
          {
            label: 'Total modules',
            value: stats.modules,
            icon: Layers,
            tone: 'text-secondary bg-secondary/10',
          },
          {
            label: 'Enabled access',
            value: stats.enabled,
            icon: CheckSquare,
            tone: 'text-accent bg-accent/15',
          },
        ].map((stat) => (
          <div key={stat.label} className="glass-card p-5 sm:p-6 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${stat.tone}`}>
              <stat.icon size={22} />
            </div>
            <div>
              <p className="text-sm text-text-secondary font-medium">{stat.label}</p>
              <p className="text-stat-value mt-0.5">{stat.value}</p>
            </div>
          </div>
        ))}
      </motion.div>

      <motion.div variants={itemVariants} className="glass-card p-5 sm:p-7 lg:p-9">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-8 pb-6 border-b border-border/60">
          <div className={`p-3.5 rounded-2xl shrink-0 ${config.accentClass}`}>
            <ShieldCheck size={24} />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-text-primary">{config.panelTitle}</h2>
            <p className="text-sm text-text-secondary mt-1">{config.panelDescription}</p>
          </div>
        </div>

        <UserRightsControl
          managerPortal={config.managerPortal}
          defaultRole={config.defaultRole}
          roleOptions={getManagedRolesForPortal(config.managerPortal)}
          title=""
          description=""
          showSaveActions
          showLowerRoles={false}
        />
      </motion.div>

      {/* Platform Users & Custom Overrides Directory */}
      <motion.div variants={itemVariants} className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-section-title">Platform Users & Custom Overrides</h2>
            <p className="text-page-desc mt-1">
              View all registered users on the system, check active configurations, and assign individual custom overrides.
            </p>
          </div>
          <button
            type="button"
            onClick={() => refetchUsers()}
            className="p-3 bg-surface-variant hover:bg-border text-text-primary rounded-2xl transition-all shadow-sm active:scale-95 self-end sm:self-auto"
            title="Refresh users directory"
          >
            <RefreshCw size={18} className={cn(isUsersLoading && 'animate-spin')} />
          </button>
        </div>

        {usersError && (
          <div className="rounded-2xl bg-error/10 border border-error/20 px-4 py-3 text-sm font-medium text-error flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span>{usersError}</span>
            <button
              type="button"
              onClick={() => refetchUsers()}
              className="text-xs font-bold uppercase tracking-widest hover:underline shrink-0"
            >
              Retry
            </button>
          </div>
        )}

        {userActionSuccess && (
          <div className="rounded-2xl bg-success/10 border border-success/20 px-4 py-3 text-sm font-medium text-success">
            {userActionSuccess}
          </div>
        )}

        {/* Searching & Filters */}
        <div className="flex flex-col xl:flex-row gap-4 items-center justify-between glass-card p-4">
          <div className="relative w-full xl:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted w-5 h-5" />
            <input 
              type="text"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Search users by name or email..." 
              className="w-full pl-12 pr-4 py-3 bg-surface-variant border border-transparent focus:border-primary/20 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 transition-all text-sm font-medium"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full sm:w-48 bg-surface-variant border border-transparent rounded-2xl px-4 py-3 text-xs outline-none font-bold text-text-secondary cursor-pointer"
            >
              <option value="All">All Roles</option>
              <option value="ADMIN">System Admins</option>
              <option value="HR">HR Admins</option>
              <option value="EMPLOYEE">Portal Users</option>
            </select>
            <select
              value={profileFilter}
              onChange={(e) => setProfileFilter(e.target.value)}
              className="w-full sm:w-48 bg-surface-variant border border-transparent rounded-2xl px-4 py-3 text-xs outline-none font-bold text-text-secondary cursor-pointer"
            >
              <option value="All">All Profile Status</option>
              <option value="Linked">Linked to Profile</option>
              <option value="Unlinked">No Profile</option>
            </select>
          </div>
        </div>

        {/* Users Table / List */}
        {isUsersLoading ? (
          <div className="glass-card p-8">
            <TableSkeleton rows={4} columns={5} />
          </div>
        ) : (
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-variant/50 border-b border-border">
                    <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">User</th>
                    <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider text-center">System Role</th>
                    <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider text-center">Profile Match</th>
                    <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Registered</th>
                    <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider text-right">Access Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((userItem) => {
                      const initials = userItem.name.split(' ').map((n) => n[0]).join('').toUpperCase();
                      return (
                        <tr 
                          key={userItem.id}
                          className="hover:bg-surface-variant/20 transition-colors group"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10 text-primary font-bold flex items-center justify-center text-sm shrink-0 group-hover:scale-105 transition-transform">
                                {initials || 'U'}
                              </div>
                              <div className="min-w-0">
                                <span className="font-bold text-text-primary block truncate group-hover:text-primary transition-colors">
                                  {userItem.name}
                                </span>
                                <span className="text-xs text-text-secondary block truncate mt-0.5">
                                  {userItem.email}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={cn(
                              "px-3 py-1 rounded-full text-micro font-bold border",
                              getRoleBadgeClass(userItem.role)
                            )}>
                              {getRoleLabel(userItem.role)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {userItem.hasEmployeeProfile ? (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-success bg-success/5 border border-success/15 px-2.5 py-1 rounded-full">
                                <UserCheck size={12} />
                                Linked
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-muted bg-surface border border-border px-2.5 py-1 rounded-full">
                                <UserX size={12} />
                                No Profile
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-xs font-bold text-text-secondary">
                            <div className="flex items-center gap-1.5">
                              <Calendar size={13} className="text-muted" />
                              <span>{formatRegisteredDate(userItem.registeredAt)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedUser(userItem);
                                setIsCustomModalOpen(true);
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-surface hover:border-primary/30 text-xs font-bold text-text-secondary hover:text-primary transition-colors"
                            >
                              <SlidersHorizontal size={12} />
                              Manage Custom Access
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-sm font-semibold text-text-secondary">
                        No registered platform users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </motion.div>

      <motion.div variants={itemVariants} className="glass-card p-5 sm:p-7 lg:p-9">
        <RegisterUserWithRights
          managerPortal={variant}
          registerRole={variant === 'super_admin' ? 'HR' : 'EMPLOYEE'}
          targetPortal={variant === 'super_admin' ? 'platform_admin' : 'employee'}
        />
      </motion.div>

      <ManageUserPermissionsModal
        isOpen={isCustomModalOpen}
        user={selectedUser}
        onClose={() => {
          setIsCustomModalOpen(false);
          setSelectedUser(null);
        }}
        onSaved={(msg) => {
          setUserActionSuccess(msg);
          refetchUsers();
        }}
      />
    </motion.div>
  );
}
