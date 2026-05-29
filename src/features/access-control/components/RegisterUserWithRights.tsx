'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, UserPlus, Loader2, CheckSquare, Square, RotateCcw } from 'lucide-react';
import PasswordInput from '@/components/PasswordInput';
import { registerUser, type RegisterRole } from '@/services/authService';
import { getAuthSession } from '@/lib/authStorage';
import { isDevAuthSession } from '@/lib/devAuth';
import type { PortalType } from '@/lib/portals';
import { ROLE_ACCESS, getModuleDefsForManager } from '@/lib/roleAccess';
import {
  buildInitialUserPermissions,
  saveUserPermissionRecord,
} from '@/lib/userPermissions';
import { cn } from '@/utils/cn';

interface RegisterUserWithRightsProps {
  managerPortal: 'super_admin' | 'platform_admin';
  /** Fixed role for this registration flow */
  registerRole: RegisterRole;
  /** Which module set to assign */
  targetPortal: PortalType;
  compact?: boolean;
}

const CONFIG = {
  super_admin: {
    title: 'Register Admin & assign rights',
    description:
      'Create a new HR Admin account and choose which Admin modules they can access.',
    roleLabel: 'HR Admin',
  },
  platform_admin: {
    title: 'Register Employee & assign rights',
    description:
      'Create a new employee account and choose which self-service modules they can access.',
    roleLabel: 'Employee',
  },
};

function groupModules(modules: typeof ROLE_ACCESS.platform_admin.moduleDefs) {
  return modules.reduce<Record<string, typeof modules>>((groups, module) => {
    if (!groups[module.group]) groups[module.group] = [];
    groups[module.group].push(module);
    return groups;
  }, {});
}

export default function RegisterUserWithRights({
  managerPortal,
  registerRole,
  targetPortal,
  compact = false,
}: RegisterUserWithRightsProps) {
  const copy = CONFIG[managerPortal];
  const access = ROLE_ACCESS[targetPortal];
  const visibleModules = useMemo(
    () => getModuleDefsForManager(targetPortal, managerPortal),
    [targetPortal, managerPortal]
  );
  const adminSession = getAuthSession(managerPortal);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [permissions, setPermissions] = useState<Record<string, boolean>>(() =>
    buildInitialUserPermissions(targetPortal)
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setPermissions(buildInitialUserPermissions(targetPortal));
  }, [targetPortal]);

  const grouped = useMemo(() => groupModules(visibleModules), [visibleModules]);
  const enabled = visibleModules.filter((module) => permissions[module.id]).length;
  const total = visibleModules.length;

  const toggleModule = (moduleId: string, checked: boolean) => {
    setPermissions((current) => ({ ...current, [moduleId]: checked }));
  };

  const selectAll = () => {
    const next: Record<string, boolean> = {};
    for (const module of visibleModules) next[module.id] = true;
    setPermissions(next);
  };

  const clearAll = () => {
    const next: Record<string, boolean> = {};
    for (const module of visibleModules) next[module.id] = false;
    setPermissions(next);
  };

  const resetDefaults = () => {
    setPermissions(buildInitialUserPermissions(targetPortal));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    const normalizedEmail = email.trim().toLowerCase();

    try {
      if (adminSession && !isDevAuthSession()) {
        const result = await registerUser({
          email: normalizedEmail,
          password,
          role: registerRole,
        });

        saveUserPermissionRecord({
          email: normalizedEmail,
          role: registerRole,
          portal: targetPortal,
          permissions,
          updatedAt: new Date().toISOString(),
        });

        setSuccess(
          `${result.user.email} registered with ${enabled} module rights assigned.`
        );
      } else {
        saveUserPermissionRecord({
          email: normalizedEmail,
          role: registerRole,
          portal: targetPortal,
          permissions,
          updatedAt: new Date().toISOString(),
        });

        setSuccess(
          `${normalizedEmail} registered with ${enabled} module rights assigned.`
        );
      }

      setEmail('');
      setPassword('');
      resetDefaults();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="register-user-rights" className={cn(!compact && 'scroll-mt-8')}>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-text-primary">{copy.title}</h2>
        <p className="text-sm text-text-secondary mt-1">{copy.description}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-2xl bg-error/10 border border-error/20 px-4 py-3 text-sm font-medium text-error">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-2xl bg-success/10 border border-success/20 px-4 py-3 text-sm font-medium text-success">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-text-primary mb-2 ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted w-5 h-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
                className="w-full pl-12 pr-4 py-3.5 bg-surface-variant border-none rounded-2xl outline-none focus:ring-2 focus:ring-primary/50 text-text-primary disabled:opacity-60"
                placeholder="newuser@company.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-text-primary mb-2 ml-1">Password</label>
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
              minLength={8}
              inputClassName="bg-surface-variant shadow-none py-3.5"
              placeholder="Password@123"
              autoComplete="new-password"
            />
          </div>
        </div>

        <div className="rounded-[24px] border border-border/70 bg-surface-variant/30 p-5 sm:p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-text-primary">
                Assign {access.label} rights
              </p>
              <p className="text-xs text-text-secondary mt-1">
                {enabled} of {total} modules selected for this user
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={selectAll}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface border border-border text-xs font-bold text-text-primary"
              >
                <CheckSquare size={13} />
                All
              </button>
              <button
                type="button"
                onClick={clearAll}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface border border-border text-xs font-bold text-text-primary"
              >
                <Square size={13} />
                None
              </button>
              <button
                type="button"
                onClick={resetDefaults}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface border border-border text-xs font-bold text-text-secondary"
              >
                <RotateCcw size={13} />
                Defaults
              </button>
            </div>
          </div>

          <div className="space-y-5">
            {Object.entries(grouped).map(([group, modules]) => (
              <div key={group}>
                <p className="text-label text-text-secondary uppercase tracking-[0.15em] mb-2 ml-1">
                  {group}
                </p>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                  {modules.map((module) => (
                    <label
                      key={module.id}
                      className={cn(
                        'flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all',
                        permissions[module.id]
                          ? 'border-primary/25 bg-primary/5'
                          : 'border-border/60 bg-surface/50 hover:bg-surface-variant/40'
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={permissions[module.id] ?? false}
                        onChange={(e) => toggleModule(module.id, e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded accent-primary shrink-0"
                      />
                      <span className="min-w-0">
                        <span className="text-sm font-semibold text-text-primary block">
                          {module.label}
                        </span>
                        <span className="text-xs text-text-secondary">{module.description}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <motion.button
          type="submit"
          disabled={isLoading}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-2xl shadow-xl shadow-primary/30 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Registering...
            </>
          ) : (
            <>
              <UserPlus size={20} />
              Register user with selected rights
            </>
          )}
        </motion.button>
      </form>
    </div>
  );
}
