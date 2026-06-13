'use client';

import Link from 'next/link';
import { ChevronRight, UserPlus, Users } from 'lucide-react';
import { cn } from '@/utils/cn';
import UserRightsControl from '@/components/UserRightsControl';
import { SUPER_ADMIN_MANAGED_ROLES } from '@/lib/roleAccess';
import { SUPER_ADMIN_PREFIX } from '@/lib/portals';
import SettingsSection from '@/features/settings/components/SettingsSection';

import { useEffect, useState } from 'react';
import { fetchPlatformUsers, updateUserStatus, type PlatformUser } from '@/services/userService';

function getRoleLabel(role: string): string {
  switch (role) {
    case 'SUPER_ADMIN': return 'Super Admin';
    case 'ADMIN': return 'Admin';
    case 'HR': return 'HR Manager';
    case 'PLATFORM_ADMIN': return 'Platform Admin';
    default: return role;
  }
}

function getInitials(name: string): string {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export default function AccessSettingsPanel() {
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUsers() {
      try {
        const users = await fetchPlatformUsers();
        const admins = users
          .filter((u) => u.role !== 'EMPLOYEE')
          .map((u) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: getRoleLabel(u.role),
            status: u.isActive ? 'Active' : 'Pending',
            initials: getInitials(u.name),
          }));
        setAdminUsers(admins);
      } catch (err) {
        console.error('Failed to load admin users:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadUsers();
  }, []);

  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const toggleUserStatus = async (userId: number, currentStatus: string) => {
    try {
      setUpdatingId(userId);
      const nextStatusActive = currentStatus === 'Pending';
      await updateUserStatus(userId, nextStatusActive);
      setAdminUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? { ...u, status: nextStatusActive ? 'Active' : 'Pending' }
            : u
        )
      );
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <SettingsSection
        title="Admin users"
        description="People with elevated access to manage companies and HR operations."
        icon={Users}
        action={
          <Link
            href="/users/register?portal=super_admin"
            className="btn-primary py-2.5 px-4 text-sm shrink-0"
          >
            <UserPlus size={16} />
            Register user
          </Link>
        }
      >
        <div className="space-y-3">
          {isLoading ? (
            <div className="flex justify-center p-4">
              <span className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : adminUsers.length === 0 ? (
            <p className="text-sm text-text-secondary text-center py-4">No admin users found.</p>
          ) : (
            adminUsers.map((admin) => (
              <div
                key={admin.email}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-sm border border-border/60 bg-surface-variant/25 px-4 py-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-sm bg-primary/10 text-primary flex items-center justify-center text-xs font-black shrink-0">
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
                  <button
                    onClick={() => toggleUserStatus(admin.id, admin.status)}
                    disabled={updatingId === admin.id}
                    className={cn(
                      'rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide transition-all disabled:opacity-50 hover:brightness-110 active:scale-95',
                      admin.status === 'Active'
                        ? 'bg-success/10 text-success border border-success/20'
                        : 'bg-warning/10 text-warning border border-warning/20'
                    )}
                  >
                    {updatingId === admin.id ? 'Updating...' : admin.status}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </SettingsSection>

    </div>
  );
}
