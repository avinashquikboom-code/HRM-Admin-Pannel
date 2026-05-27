'use client';

import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { ShieldCheck, UserPlus, Users, CheckSquare, Layers } from 'lucide-react';
import UserRightsControl from '@/components/UserRightsControl';
import RegisterUserWithRights from '@/features/access-control/components/RegisterUserWithRights';
import {
  SUPER_ADMIN_MANAGED_ROLES,
  ADMIN_MANAGED_ROLES,
  countEnabledModules,
  getManagedRolesForPortal,
  loadRolePermissions,
} from '@/lib/roleAccess';
import { useEffect, useState } from 'react';

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
  const [stats, setStats] = useState({
    roles: config.managedRoles.length,
    modules: 0,
    enabled: 0,
  });

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

      <motion.div variants={itemVariants} className="glass-card p-5 sm:p-7 lg:p-9">
        <RegisterUserWithRights
          managerPortal={variant}
          registerRole={variant === 'super_admin' ? 'HR' : 'EMPLOYEE'}
          targetPortal={variant === 'super_admin' ? 'platform_admin' : 'employee'}
        />
      </motion.div>
    </motion.div>
  );
}
