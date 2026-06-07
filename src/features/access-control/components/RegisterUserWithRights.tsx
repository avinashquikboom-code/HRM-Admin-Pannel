'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, UserPlus, Loader2, CheckSquare, Square, RotateCcw, Building } from 'lucide-react';
import PasswordInput from '@/components/PasswordInput';
import { registerUser, type RegisterRole } from '@/services/authService';
import { getAuthSession } from '@/lib/authStorage';
import type { PortalType } from '@/lib/portals';
import { ROLE_ACCESS, getModuleDefsForManager } from '@/lib/roleAccess';
import {
  buildInitialUserPermissions,
} from '@/lib/userPermissions';
import { cn } from '@/utils/cn';
import { fetchHRDepartments } from '@/services/hrService';

interface RegisterUserWithRightsProps {
  managerPortal: 'super_admin' | 'platform_admin';
  /** Fixed role for this registration flow */
  registerRole: RegisterRole;
  /** Which module set to assign */
  targetPortal: PortalType;
  compact?: boolean;
  allowRoleSelection?: boolean;
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
  allowRoleSelection = false,
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
  const [selectedRole, setSelectedRole] = useState<RegisterRole>(registerRole);
  const [departmentId, setDepartmentId] = useState<number | undefined>();
  const [departments, setDepartments] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<Record<string, boolean>>(() =>
    buildInitialUserPermissions(targetPortal)
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setPermissions(buildInitialUserPermissions(targetPortal));
  }, [targetPortal]);

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const depts = await fetchHRDepartments();
        setDepartments(depts);
      } catch (err) {
        console.error('Failed to load departments:', err);
      }
    };
    loadDepartments();
  }, []);

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
      const result = await registerUser({
        email: normalizedEmail,
        password,
        role: selectedRole,
        departmentId,
      });

      // TODO: Save user permissions via backend API
      // saveUserPermissionRecord(...)

      setSuccess(
        `${result.user.email} registered as ${selectedRole} with ${enabled} module rights assigned.`
      );

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
        <h2 className="text-xl font-black text-white tracking-tight">{copy.title}</h2>
        <p className="text-xs text-slate-400 mt-1.5 font-medium">{copy.description}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-2xl bg-rose-500/10 border border-rose-500/20 px-4.5 py-3.5 text-xs font-semibold text-rose-450">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 px-4.5 py-3.5 text-xs font-semibold text-emerald-450">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-4.5 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-primary transition-colors w-5 h-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
                className="w-full pl-13 pr-4 py-4 bg-slate-950/40 border border-white/5 hover:border-white/10 focus:border-primary/30 rounded-2xl outline-none transition-all text-xs font-semibold text-white placeholder-slate-500 disabled:opacity-60"
                placeholder="newuser@company.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Account Password</label>
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
              minLength={8}
              inputClassName="bg-slate-950/40 border-white/5 hover:border-white/10 focus:border-primary/30 text-white shadow-none py-4 text-xs"
              placeholder="Password@123"
              autoComplete="new-password"
            />
          </div>
        </div>

        {allowRoleSelection && (
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">User Role</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as RegisterRole)}
              disabled={isLoading}
              className="w-full px-4 py-4 bg-slate-950/40 border border-white/5 hover:border-white/10 focus:border-primary/30 rounded-2xl outline-none transition-all text-xs font-semibold text-white disabled:opacity-60 cursor-pointer"
            >
              {managerPortal === 'super_admin' ? (
                <>
                  <option value="HR">HR Manager</option>
                  <option value="ADMIN">Admin</option>
                </>
              ) : (
                <>
                  <option value="EMPLOYEE">Employee</option>
                  <option value="HR">HR Manager</option>
                </>
              )}
            </select>
          </div>
        )}

        {managerPortal === 'platform_admin' && (
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Department</label>
            <div className="relative group">
              <Building className="absolute left-4.5 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-primary transition-colors w-5 h-5" />
              <select
                value={departmentId || ''}
                onChange={(e) => setDepartmentId(e.target.value ? parseInt(e.target.value) : undefined)}
                disabled={isLoading}
                className="w-full pl-13 pr-4 py-4 bg-slate-950/40 border border-white/5 hover:border-white/10 focus:border-primary/30 rounded-2xl outline-none transition-all text-xs font-semibold text-white disabled:opacity-60 cursor-pointer"
              >
                <option value="">Select Department (Optional)</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div className="rounded-[2rem] border border-white/5 bg-slate-950/20 p-5 sm:p-7 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-white">
                Assign {access.label} rights
              </p>
              <p className="text-xs text-slate-400 mt-1 font-semibold">
                {enabled} of {total} modules selected for this user
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={selectAll}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/50 border border-white/5 hover:border-primary/20 text-xs font-bold text-slate-350 cursor-pointer"
              >
                <CheckSquare size={13} />
                All
              </button>
              <button
                type="button"
                onClick={clearAll}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/50 border border-white/5 hover:border-primary/20 text-xs font-bold text-slate-350 cursor-pointer"
              >
                <Square size={13} />
                None
              </button>
              <button
                type="button"
                onClick={resetDefaults}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/50 border border-white/5 hover:border-primary/20 text-xs font-bold text-slate-400 cursor-pointer"
              >
                <RotateCcw size={13} />
                Defaults
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {Object.entries(grouped).map(([group, modules]) => (
              <div key={group}>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2.5 ml-1">
                  {group}
                </p>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {modules.map((module) => (
                    <label
                      key={module.id}
                      className={cn(
                        'flex items-start gap-4.5 p-4 rounded-2xl border cursor-pointer transition-all group',
                        permissions[module.id]
                          ? 'border-primary/25 bg-primary/5 text-primary shadow-[0_8px_20px_-6px_rgba(59,163,139,0.15)]'
                          : 'border-white/5 bg-slate-950/30 hover:border-white/10 hover:bg-slate-950/50'
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={permissions[module.id] ?? false}
                        onChange={(e) => toggleModule(module.id, e.target.checked)}
                        className="mt-0.5 w-4.5 h-4.5 rounded accent-primary shrink-0 cursor-pointer"
                      />
                      <span className="min-w-0">
                        <span className={cn(
                          "text-sm font-bold transition-colors block",
                          permissions[module.id] ? "text-primary" : "text-white group-hover:text-primary-light"
                        )}>
                          {module.label}
                        </span>
                        <span className="text-xs text-slate-450 block mt-1 leading-relaxed">{module.description}</span>
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
          className="w-full py-4.5 bg-primary hover:bg-primary-dark text-white font-black uppercase tracking-wider text-xs rounded-2xl shadow-xl shadow-primary/30 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Registering Account...
            </>
          ) : (
            <>
              <UserPlus size={18} />
              Register user with selected rights
            </>
          )}
        </motion.button>
      </form>
    </div>
  );
}
