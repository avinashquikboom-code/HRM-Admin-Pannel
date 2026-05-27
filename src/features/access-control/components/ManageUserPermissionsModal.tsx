'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ShieldCheck, CheckCircle2, Save, X, RotateCcw, CheckSquare, Square } from 'lucide-react';
import { ROLE_ACCESS } from '@/lib/roleAccess';
import { cn } from '@/utils/cn';
import {
  getUserPermissionRecord,
  saveUserPermissionRecord,
  buildInitialUserPermissions,
  countUserEnabledModules,
} from '@/lib/userPermissions';
import type { PlatformUser } from '@/services/userService';
import type { PortalType } from '@/lib/portals';
import type { RegisterRole } from '@/services/authService';

interface ManageUserPermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: PlatformUser | null;
  onSaved: (message: string) => void;
}

function groupModules(modules: typeof ROLE_ACCESS.platform_admin.moduleDefs) {
  return modules.reduce<Record<string, typeof modules>>((groups, module) => {
    if (!groups[module.group]) groups[module.group] = [];
    groups[module.group].push(module);
    return groups;
  }, {});
}

export default function ManageUserPermissionsModal({
  isOpen,
  onClose,
  user,
  onSaved,
}: ManageUserPermissionsModalProps) {
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [success, setSuccess] = useState('');

  const targetPortal = useMemo<PortalType | null>(() => {
    if (!user) return null;
    if (user.role === 'ADMIN' || user.role === 'HR') return 'platform_admin';
    return 'employee';
  }, [user]);

  const access = useMemo(() => {
    if (!targetPortal) return null;
    return ROLE_ACCESS[targetPortal];
  }, [targetPortal]);

  // Load existing or default permissions
  useEffect(() => {
    if (!user || !targetPortal) return;
    const existing = getUserPermissionRecord(user.email);
    if (existing) {
      setPermissions(existing.permissions);
    } else {
      setPermissions(buildInitialUserPermissions(targetPortal));
    }
    setSuccess('');
  }, [user, targetPortal]);

  const grouped = useMemo(() => {
    if (!access) return {};
    return groupModules(access.moduleDefs);
  }, [access]);

  const { enabled, total } = useMemo(() => {
    if (!targetPortal) return { enabled: 0, total: 0 };
    return countUserEnabledModules(targetPortal, permissions);
  }, [targetPortal, permissions]);

  const progress = total > 0 ? Math.round((enabled / total) * 100) : 0;

  if (!isOpen || !user || !targetPortal || !access) return null;

  const toggleModule = (moduleId: string, checked: boolean) => {
    setPermissions((current) => ({ ...current, [moduleId]: checked }));
  };

  const selectAll = () => {
    const next: Record<string, boolean> = {};
    for (const module of access.moduleDefs) next[module.id] = true;
    setPermissions(next);
  };

  const clearAll = () => {
    const next: Record<string, boolean> = {};
    for (const module of access.moduleDefs) next[module.id] = false;
    setPermissions(next);
  };

  const resetDefaults = () => {
    setPermissions(buildInitialUserPermissions(targetPortal));
  };

  const handleSave = () => {
    const roleMapping: Record<string, RegisterRole> = {
      ADMIN: 'HR',
      HR: 'HR',
      EMPLOYEE: 'EMPLOYEE',
    };

    saveUserPermissionRecord({
      email: user.email.toLowerCase(),
      role: roleMapping[user.role] || 'EMPLOYEE',
      portal: targetPortal,
      permissions,
      updatedAt: new Date().toISOString(),
    });

    onSaved(`Custom rights for ${user.email} saved successfully!`);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop glass */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        />

        {/* Modal content */}
        <motion.div
          initial={{ scale: 0.95, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 20, opacity: 0 }}
          transition={{ type: 'spring', duration: 0.4 }}
          className="relative w-full max-w-4xl bg-surface border border-border/80 rounded-[28px] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden z-10"
        >
          {/* Header */}
          <div className="flex items-start justify-between p-6 sm:p-8 border-b border-border/60">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-sm shrink-0 border border-primary/10">
                {user.name.split(' ').map((n) => n[0]).join('')}
              </div>
              <div className="min-w-0">
                <h3 className="text-xl font-black text-text-primary tracking-tight truncate">
                  Custom Rights: {user.name}
                </h3>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  <span className="inline-flex items-center gap-1 text-xs text-text-secondary">
                    <Mail size={12} className="text-muted" />
                    {user.email}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-border" />
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-primary/10 text-primary uppercase tracking-wider">
                    {user.role}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-surface-variant hover:bg-border text-text-secondary hover:text-text-primary rounded-xl transition-all"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 p-6 sm:p-8 overflow-y-auto space-y-6">
            <div className="rounded-2xl bg-surface-variant/40 border border-border/50 p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-text-primary">
                    Assign {access.label} Custom Overrides
                  </h4>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Configure individual access modules. System default permissions are loaded as fallback.
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={selectAll}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface border border-border text-[11px] font-bold text-text-primary hover:border-primary/30 transition-colors"
                  >
                    <CheckSquare size={13} />
                    All
                  </button>
                  <button
                    type="button"
                    onClick={clearAll}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface border border-border text-[11px] font-bold text-text-primary hover:border-primary/30 transition-colors"
                  >
                    <Square size={13} />
                    None
                  </button>
                  <button
                    type="button"
                    onClick={resetDefaults}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface border border-border text-[11px] font-bold text-text-secondary hover:text-primary transition-colors"
                  >
                    <RotateCcw size={13} />
                    Defaults
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-text-secondary">{enabled} of {total} Modules enabled</span>
                  <span className="text-primary">{progress}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-surface overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full rounded-full bg-primary"
                  />
                </div>
              </div>
            </div>

            {/* Modules Checkbox Matrix */}
            <div className="space-y-6">
              {Object.entries(grouped).map(([group, modules]) => (
                <div key={group}>
                  <p className="text-xs font-bold text-text-secondary uppercase tracking-[0.18em] mb-3 ml-1">
                    {group}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {modules.map((module) => {
                      const checked = permissions[module.id] ?? false;
                      return (
                        <label
                          key={module.id}
                          className={cn(
                            'flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all',
                            checked
                              ? 'border-transparent bg-primary/5 text-primary shadow-sm'
                              : 'border-border/60 bg-surface/50 hover:bg-surface-variant/40'
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => toggleModule(module.id, e.target.checked)}
                            className="mt-0.5 w-4.5 h-4.5 rounded accent-primary shrink-0 cursor-pointer"
                          />
                          <span className="min-w-0 flex-1">
                            <span className="text-sm font-bold text-text-primary block">
                              {module.label}
                            </span>
                            <span className="text-xs text-text-secondary block mt-0.5 leading-relaxed">
                              {module.description}
                            </span>
                          </span>
                          {checked && (
                            <CheckCircle2 size={16} className="text-primary shrink-0 mt-0.5" />
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 p-6 sm:p-8 bg-surface-variant/30 border-t border-border/60">
            <button
              onClick={onClose}
              className="btn-secondary py-3 px-5 text-sm rounded-xl font-bold"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="btn-primary shadow-lg shadow-primary/20 py-3 px-6 text-sm rounded-xl font-bold"
            >
              <Save size={16} />
              Save Custom Rights
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
