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
  SlidersHorizontal,
  Edit,
  Trash2
} from 'lucide-react';
import UserRightsControl from '@/components/UserRightsControl';
import TableSkeleton from '@/components/TableSkeleton';
import ConfirmModal from '@/components/ConfirmModal';
import { toast } from 'sonner';

import ManageUserPermissionsModal from '@/features/access-control/components/ManageUserPermissionsModal';
import LinkUserToOfficeModal from '@/features/access-control/components/LinkUserToOfficeModal';
import { usePlatformUsers } from '@/hooks/usePlatformUsers';
import { deletePlatformUser, type PlatformUser } from '@/services/userService';
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
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [userToLink, setUserToLink] = useState<PlatformUser | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<PlatformUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
      const counts = countEnabledModules(role, permissions, config.managerPortal);
      modules += counts.total;
      enabled += counts.enabled;
    }

    setStats({ roles: config.managedRoles.length, modules, enabled });
  }, [config.managedRoles]);

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      await deletePlatformUser(userToDelete.id);
      toast.success(`User ${userToDelete.name} deleted successfully!`);
      setUserActionSuccess(`User ${userToDelete.name} deleted successfully!`);
      refetchUsers();
    } catch (err) {
      console.error('Failed to delete user:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to delete user.');
    } finally {
      setIsDeleting(false);
      setDeleteConfirmOpen(false);
      setUserToDelete(null);
    }
  };

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
      case 'SUPER_ADMIN':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'HR':
        return 'bg-violet-500/10 text-violet-400 border-violet-500/20';
      case 'EMPLOYEE':
        return 'bg-primary/10 text-primary border-primary/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-white/5';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN':
      case 'SUPER_ADMIN':
        return 'Super Admin';
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
      className="space-y-8 pb-16 text-text-primary animate-fadeIn"
    >
      {/* 1. Header Command Hub with Glowing Ambient Effects */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-sm border border-border/50 dark:border-white/10 bg-surface dark:bg-gradient-to-br dark:from-slate-900/90 dark:to-slate-950/95 backdrop-blur-xl p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8"
      >
        <div className="absolute -top-12 -right-12 w-96 h-96 bg-primary/10 rounded-full filter blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute -bottom-24 -left-12 w-80 h-80 bg-emerald-500/5 rounded-full filter blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/20 to-emerald-500/10 border border-primary/30 text-primary text-[10px] font-black px-3.5 py-1.5 rounded-full uppercase tracking-widest">
            <ShieldCheck size={12} className="text-primary animate-pulse" />
            Security & permission control
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-text-primary tracking-tight leading-none">
            {config.title.split(' ')[0]} <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-teal-400 to-emerald-400">{config.title.split(' ').slice(1).join(' ')}</span>
          </h1>
          <p className="text-xs md:text-sm text-text-secondary font-medium max-w-2xl leading-relaxed">
            {config.description}
          </p>
        </div>
        
        {variant === 'super_admin' && (
          <Link
            href="/users/register"
            className="relative z-10 btn-primary px-6.5 py-4 shrink-0 rounded-sm text-xs font-black uppercase tracking-wider self-start md:self-auto"
          >
            <UserPlus size={16} />
            Register User
          </Link>
        )}
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          {
            label: 'Roles you manage',
            value: stats.roles,
            icon: Users,
            color: 'from-blue-500/20 to-indigo-500/10 border-blue-500/30 text-blue-500',
          },
          {
            label: 'Total modules',
            value: stats.modules,
            icon: Layers,
            color: 'from-primary/20 to-teal-500/10 border-primary/30 text-primary',
          },
          {
            label: 'Enabled access',
            value: stats.enabled,
            icon: CheckSquare,
            color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-500',
          },
        ].map((stat) => (
          <div 
            key={stat.label} 
            className="relative overflow-hidden rounded-sm border border-border bg-surface p-6 flex items-center gap-5 group hover:bg-surface-variant/10 transition-all duration-300"
          >
            <div 
              className={`w-12 h-12 rounded-sm flex items-center justify-center shrink-0 bg-gradient-to-br border ${stat.color}`}
            >
              <stat.icon size={20} className="group-hover:scale-110 transition-transform duration-300" />
            </div>
            <div>
              <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest leading-none">{stat.label}</p>
              <p className="text-3xl font-black text-text-primary mt-1.5 tracking-tight">{stat.value}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* 3. Module Checklist Control Panel */}
      <motion.div variants={itemVariants} className="relative overflow-hidden rounded-sm border border-border bg-surface p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center gap-5 mb-8 pb-6 border-b border-border">
          <div className="w-12 h-12 rounded-sm bg-gradient-to-br from-primary/20 to-teal-500/10 border border-primary/30 text-primary flex items-center justify-center shrink-0">
            <ShieldCheck size={22} />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-black text-text-primary tracking-tight">{config.panelTitle}</h2>
            <p className="text-xs text-text-secondary mt-1 font-medium">{config.panelDescription}</p>
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
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">Platform Users & Custom Overrides</h2>
            <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">
              View all registered users on the system, check active configurations, and assign individual custom overrides.
            </p>
          </div>
          <button
            type="button"
            onClick={() => refetchUsers()}
            className="p-3 bg-slate-900/50 hover:bg-slate-800 text-slate-300 hover:text-white rounded-sm border border-white/5 transition-all active:scale-95 self-end sm:self-auto cursor-pointer"
            title="Refresh users directory"
          >
            <RefreshCw size={16} className={cn(isUsersLoading && 'animate-spin')} />
          </button>
        </div>

        {usersError && (
          <div className="rounded-sm bg-rose-500/10 border border-rose-500/20 px-4.5 py-3.5 text-xs font-semibold text-rose-400 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span>{usersError}</span>
            <button
              type="button"
              onClick={() => refetchUsers()}
              className="text-[10px] font-black uppercase tracking-widest hover:text-white shrink-0"
            >
              Retry
            </button>
          </div>
        )}

        {userActionSuccess && (
          <div className="rounded-sm bg-emerald-500/10 border border-emerald-500/20 px-4.5 py-3.5 text-xs font-semibold text-emerald-400">
            {userActionSuccess}
          </div>
        )}

        {/* Searching & Filters */}
        <div className="flex flex-col xl:flex-row gap-4 items-center justify-between border border-white/5 bg-slate-900/40 p-4.5 rounded-sm backdrop-blur-xl">
          <div className="relative w-full xl:w-96 group">
            <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-primary transition-colors w-5 h-5" />
            <input 
              type="text"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Search users by name or email..." 
              className="w-full pl-13 pr-4 py-3.5 bg-slate-950/40 border border-white/5 hover:border-white/10 focus:border-primary/30 rounded-sm outline-none transition-all text-xs font-semibold text-white placeholder-slate-500"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full sm:w-48 bg-slate-950/40 border border-white/5 hover:border-white/10 focus:border-primary/30 rounded-sm px-4 py-3.5 text-xs outline-none font-bold text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <option value="All" className="bg-slate-900 text-white">All System Roles</option>
              <option value="ADMIN" className="bg-slate-900 text-white">System Admins</option>
              <option value="HR" className="bg-slate-900 text-white">HR Admins</option>
              <option value="EMPLOYEE" className="bg-slate-900 text-white">Portal Users</option>
            </select>
            <select
              value={profileFilter}
              onChange={(e) => setProfileFilter(e.target.value)}
              className="w-full sm:w-48 bg-slate-950/40 border border-white/5 hover:border-white/10 focus:border-primary/30 rounded-sm px-4 py-3.5 text-xs outline-none font-bold text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <option value="All" className="bg-slate-900 text-white">All Connection States</option>
              <option value="Linked" className="bg-slate-900 text-white">Linked Profiles</option>
              <option value="Unlinked" className="bg-slate-900 text-white">Unlinked Accounts</option>
            </select>
          </div>
        </div>

        {/* Users Table / List */}
        {isUsersLoading ? (
          <div className="relative overflow-hidden rounded-sm border border-white/5 bg-slate-900/40 p-8 backdrop-blur-xl">
            <TableSkeleton rows={4} columns={5} />
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-sm border border-white/5 bg-slate-900/40 backdrop-blur-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/30 border-b border-white/5">
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">User Details</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">System Role</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Profile Link</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Created Date</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((userItem) => {
                      const initials = userItem.name.split(' ').map((n) => n[0]).join('').toUpperCase();
                      return (
                        <tr 
                          key={userItem.id}
                          className="hover:bg-white/[0.02] transition-colors group"
                        >
                          <td className="px-6 py-4.5">
                            <div className="flex items-center gap-4">
                              <div className="w-11 h-11 rounded-sm bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 text-primary font-black flex items-center justify-center text-sm shrink-0 group-hover:scale-105 transition-all duration-300">
                                {initials || 'U'}
                              </div>
                              <div className="min-w-0">
                                <span className="font-bold text-white block truncate group-hover:text-primary transition-colors">
                                  {userItem.name}
                                </span>
                                <span className="text-xs text-slate-400 block truncate mt-1">
                                  {userItem.email}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4.5 text-center">
                            <span className={cn(
                              "px-3 py-1.5 rounded-sm text-[10px] font-black uppercase tracking-wider border",
                              getRoleBadgeClass(userItem.role)
                            )}>
                              {getRoleLabel(userItem.role)}
                            </span>
                          </td>
                          <td className="px-6 py-4.5 text-center">
                            {userItem.hasEmployeeProfile ? (
                              <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-sm">
                                <UserCheck size={12} />
                                Linked
                              </span>
                            ) : (
                              <div className="flex flex-col items-center gap-1.5">
                                <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 bg-white/5 border border-white/5 px-3 py-1.5 rounded-sm">
                                  <UserX size={12} />
                                  Unlinked
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setUserToLink(userItem);
                                    setIsLinkModalOpen(true);
                                  }}
                                  className="text-[10px] font-bold text-primary hover:text-primary-dark transition-colors cursor-pointer hover:underline"
                                >
                                  Link to Office
                                </button>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4.5 text-xs font-bold text-slate-400">
                            <div className="flex items-center gap-2">
                              <Calendar size={14} className="text-slate-500" />
                              <span>{formatRegisteredDate(userItem.registeredAt)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4.5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedUser(userItem);
                                  setIsCustomModalOpen(true);
                                }}
                                className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-sm border border-white/5 transition-all cursor-pointer"
                                title="Edit user permissions"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setUserToDelete(userItem);
                                  setDeleteConfirmOpen(true);
                                }}
                                disabled={isDeleting}
                                className="p-1.5 bg-slate-900 hover:bg-rose-500/10 text-slate-300 hover:text-rose-500 rounded-sm border border-white/5 transition-all cursor-pointer"
                                title="Delete user"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-xs font-bold text-slate-500 uppercase tracking-widest bg-slate-900/20">
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


      <ManageUserPermissionsModal
        isOpen={isCustomModalOpen}
        user={selectedUser}
        managerPortal={config.managerPortal}
        onClose={() => {
          setIsCustomModalOpen(false);
          setSelectedUser(null);
        }}
        onSaved={(msg) => {
          setUserActionSuccess(msg);
          refetchUsers();
        }}
      />

      <LinkUserToOfficeModal
        isOpen={isLinkModalOpen}
        user={userToLink}
        onClose={() => {
          setIsLinkModalOpen(false);
          setUserToLink(null);
        }}
        onLinked={() => {
          refetchUsers();
        }}
      />

      <ConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteUser}
        title="Delete Platform User"
        message={userToDelete ? `Are you sure you want to delete "${userToDelete.name}"? This will permanently remove their user credentials and any associated employee profiles.` : 'Are you sure you want to delete this user?'}
        confirmText={isDeleting ? 'Deleting...' : 'Delete'}
        cancelText="Cancel"
      />
    </motion.div>
  );
}

