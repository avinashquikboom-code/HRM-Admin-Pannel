'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ShieldCheck, LayoutDashboard, User } from 'lucide-react';
import type { PortalType } from '@/lib/portals';
import {
  ROLE_ACCESS,
  PORTAL_ORDER,
  getLowerRoleAccess,
  type RoleAccessInfo,
} from '@/lib/roleAccess';
import { cn } from '@/utils/cn';

const PORTAL_ICONS: Record<PortalType, typeof ShieldCheck> = {
  super_admin: ShieldCheck,
  platform_admin: LayoutDashboard,
  employee: User,
};

const ACCENT = {
  secondary: {
    tab: 'bg-secondary text-white shadow-md',
    card: 'border-secondary/20 bg-secondary/5',
    badge: 'bg-secondary/10 text-secondary',
  },
  primary: {
    tab: 'bg-primary text-white shadow-md',
    card: 'border-primary/20 bg-primary/5',
    badge: 'bg-primary/10 text-primary',
  },
  accent: {
    tab: 'bg-accent text-secondary shadow-md',
    card: 'border-accent/25 bg-accent/10',
    badge: 'bg-accent/15 text-secondary',
  },
};

function ModuleGrid({ modules }: { modules: string[] }) {
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {modules.map((module) => (
        <li
          key={module}
          className="flex items-center gap-2.5 text-sm text-text-secondary"
        >
          <span className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center shrink-0">
            <Check size={12} className="text-success" />
          </span>
          <span className="font-medium">{module}</span>
        </li>
      ))}
    </ul>
  );
}

function RoleAccessCard({
  access,
  variant = 'primary',
}: {
  access: RoleAccessInfo;
  variant?: 'primary' | 'nested';
}) {
  const styles = ACCENT[access.accent];
  const Icon = PORTAL_ICONS[access.portal];

  return (
    <div
      className={cn(
        'rounded-[24px] border p-5 sm:p-6',
        variant === 'primary' ? styles.card : 'border-border/60 bg-surface-variant/30'
      )}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={cn('p-2.5 rounded-xl', styles.badge)}>
          <Icon size={18} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-text-primary">{access.label}</h4>
          <p className="text-xs text-text-secondary mt-0.5">{access.description}</p>
        </div>
      </div>
      <ModuleGrid modules={access.modules} />
    </div>
  );
}

interface UserRightsControlProps {
  /** Starting role tab — defaults to Super Admin in settings. */
  defaultRole?: PortalType;
  /** Show role picker tabs. Default true. */
  showRolePicker?: boolean;
  /** Heading override */
  title?: string;
  description?: string;
}

export default function UserRightsControl({
  defaultRole = 'super_admin',
  showRolePicker = true,
  title = 'User Rights Control',
  description = 'Module access per role — changes when you select a role below.',
}: UserRightsControlProps) {
  const [selectedRole, setSelectedRole] = useState<PortalType>(defaultRole);
  const access = ROLE_ACCESS[selectedRole];
  const lowerRoles = getLowerRoleAccess(selectedRole);
  const styles = ACCENT[access.accent];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="heading-2">{title}</h3>
        <p className="text-sm text-text-secondary font-medium mt-1">{description}</p>
      </div>

      {showRolePicker && (
        <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-surface-variant max-w-md">
          {PORTAL_ORDER.map((roleId) => {
            const role = ROLE_ACCESS[roleId];
            const roleStyles = ACCENT[role.accent];
            return (
              <button
                key={roleId}
                type="button"
                onClick={() => setSelectedRole(roleId)}
                className={cn(
                  'py-2.5 px-2 rounded-xl text-xs font-semibold transition-all',
                  selectedRole === roleId
                    ? roleStyles.tab
                    : 'text-text-secondary hover:text-text-primary'
                )}
              >
                {role.label}
              </button>
            );
          })}
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={selectedRole}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          <div className={cn('rounded-[28px] border p-6 sm:p-8', styles.card)}>
            <p className="text-micro font-black text-text-secondary uppercase tracking-[0.2em] mb-4">
              {access.label} — allowed modules
            </p>
            <RoleAccessCard access={access} variant="primary" />
          </div>

          {lowerRoles.length > 0 && (
            <div className="space-y-3">
              <p className="text-micro font-black text-text-secondary uppercase tracking-[0.2em] ml-1">
                Lower role visibility
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lowerRoles.map((lower) => (
                  <RoleAccessCard key={lower.portal} access={lower} variant="nested" />
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export function UserRightsPreview({
  portal,
}: {
  portal: PortalType;
}) {
  const access = ROLE_ACCESS[portal];
  return (
    <div className="rounded-2xl border border-border/60 bg-surface-variant/30 px-4 py-4">
      <p className="text-xs font-bold text-text-primary mb-3">
        This user will access ({access.label})
      </p>
      <ModuleGrid modules={access.modules} />
    </div>
  );
}
