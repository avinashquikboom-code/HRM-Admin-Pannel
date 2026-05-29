'use client';

import Link from 'next/link';
import { ChevronRight, UserPlus, Users } from 'lucide-react';
import { cn } from '@/utils/cn';
import UserRightsControl from '@/components/UserRightsControl';
import { SUPER_ADMIN_MANAGED_ROLES } from '@/lib/roleAccess';
import { SUPER_ADMIN_PREFIX } from '@/lib/portals';
import SettingsSection from '@/features/settings/components/SettingsSection';

const ADMIN_USERS = [
  {
    name: 'Sarah Jenkins',
    email: 's.jenkins@hrm.com',
    role: 'Platform Admin',
    status: 'Active' as const,
    initials: 'SJ',
  },
  {
    name: 'Marcus Chen',
    email: 'm.chen@hrm.com',
    role: 'Platform Admin',
    status: 'Active' as const,
    initials: 'MC',
  },
  {
    name: 'Elena Rodriguez',
    email: 'e.rod@hrm.com',
    role: 'Platform Admin',
    status: 'Pending' as const,
    initials: 'ER',
  },
];

export default function AccessSettingsPanel() {
  return (
    <div className="space-y-6">
      <SettingsSection
        title="Admin users"
        description="People with elevated access to manage companies and HR operations."
        icon={Users}
        action={
          <Link
            href="/users/register"
            className="btn-primary py-2.5 px-4 text-sm shrink-0"
          >
            <UserPlus size={16} />
            Register user
          </Link>
        }
      >
        <div className="space-y-3">
          {ADMIN_USERS.map((admin) => (
            <div
              key={admin.email}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-border/60 bg-surface-variant/25 px-4 py-4"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xs font-black shrink-0">
                  {admin.initials}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-text-primary truncate">
                    {admin.name}
                  </p>
                  <p className="text-xs text-text-secondary truncate">
                    {admin.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 sm:gap-4 pl-[52px] sm:pl-0">
                <span className="text-xs font-medium text-text-secondary hidden sm:inline">
                  {admin.role}
                </span>
                <span
                  className={cn(
                    'rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide',
                    admin.status === 'Active'
                      ? 'bg-success/10 text-success'
                      : 'bg-warning/10 text-warning'
                  )}
                >
                  {admin.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </SettingsSection>

      <SettingsSection
        title="Admin permissions"
        description="Choose which modules HR admins can access on the platform."
        icon={UserPlus}
        action={
          <Link
            href={`${SUPER_ADMIN_PREFIX}/user-rights`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline shrink-0"
          >
            Open full page
            <ChevronRight size={14} />
          </Link>
        }
      >
        <UserRightsControl
          managerPortal="super_admin"
          roleOptions={SUPER_ADMIN_MANAGED_ROLES}
          defaultRole="platform_admin"
          title="HR Admin module access"
          description="Toggle modules available to platform administrators."
          showSaveActions
          showLowerRoles={false}
        />
      </SettingsSection>
    </div>
  );
}
