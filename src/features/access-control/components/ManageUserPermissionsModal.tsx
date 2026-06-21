'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ShieldCheck, CheckCircle2, Save, X, RotateCcw, CheckSquare, Square } from 'lucide-react';
import { ROLE_ACCESS, getModuleDefsForManager } from '@/lib/roleAccess';
import { cn } from '@/utils/cn';
import { api, getApiErrorMessage } from '@/lib/api';
import {
  buildInitialUserPermissions,
} from '@/lib/userPermissions';
import type { PlatformUser } from '@/services/userService';
import type { PortalType } from '@/lib/portals';

interface ManageUserPermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: PlatformUser | null;
  onSaved: (message: string) => void;
  managerPortal?: PortalType;
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
  managerPortal = 'platform_admin',
}: ManageUserPermissionsModalProps) {
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const targetPortal = useMemo<PortalType | null>(() => {
    if (!user) return null;
    if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') return 'super_admin';
    if (user.role === 'HR') return 'platform_admin';
    return 'employee';
  }, [user]);

  const access = useMemo(() => {
    if (!targetPortal) return null;
    return ROLE_ACCESS[targetPortal];
  }, [targetPortal]);

  // Load existing or default permissions
  useEffect(() => {
    let isMounted = true;

    async function loadPermissions() {
      if (!user || !targetPortal) return;
      
      setIsLoading(true);
      try {
        const { data } = await api.get(`/api/permissions/user/${user.id}`);
        if (isMounted) {
          if (data && Object.keys(data).length > 0) {
            setPermissions(data);
          } else {
            setPermissions(buildInitialUserPermissions(targetPortal));
          }
          setSuccess('');
        }
      } catch (error) {
        console.error('Failed to load user permissions', error);
        if (isMounted) {
          setPermissions(buildInitialUserPermissions(targetPortal));
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadPermissions();

    return () => {
      isMounted = false;
    };
  }, [user, targetPortal]);

  const visibleModules = useMemo(() => {
    if (!targetPortal) return [];
    return getModuleDefsForManager(targetPortal, managerPortal);
  }, [targetPortal, managerPortal]);

  const grouped = useMemo(() => {
    return groupModules(visibleModules);
  }, [visibleModules]);

  const { enabled, total } = useMemo(() => {
    if (!targetPortal) return { enabled: 0, total: 0 };
    const enabledCount = visibleModules.filter(
      (module) => permissions[module.id]
    ).length;
    return { enabled: enabledCount, total: visibleModules.length };
  }, [targetPortal, permissions, visibleModules]);

  const progress = total > 0 ? Math.round((enabled / total) * 100) : 0;

  if (!isOpen || !user || !targetPortal || !access) return null;

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

  const handleSave = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      await api.put(`/api/permissions/user/${user.id}`, { permissions });
      onSaved(`Custom rights for ${user.email} saved successfully!`);
      onClose();
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to save user permissions'));
    } finally {
      setIsSaving(false);
    }
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
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Modal content */}
        <motion.div
          initial={{ scale: 0.95, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 20, opacity: 0 }}
          transition={{ type: 'spring', duration: 0.4 }}
          className="relative w-full max-w-4xl bg-slate-900 border border-white/10 rounded-[2rem] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden z-10 text-slate-100"
        >
          {/* Header */}
          <div className="flex items-start justify-between p-6 sm:p-8 border-b border-white/5">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-12 h-12 rounded-sm bg-primary/20 text-primary flex items-center justify-center font-black text-sm shrink-0 border border-primary/30" style={{ boxShadow: '0 4px 12px -3px rgba(59,163,139,0.2)' }}>
                {user.name.split(' ').map((n) => n[0]).join('')}
              </div>
              <div className="min-w-0">
                <h3 className="text-xl font-black text-white tracking-tight truncate">
                  Custom Rights: {user.name}
                </h3>
                <div className="flex flex-wrap items-center gap-2.5 mt-1.5">
                  <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                    <Mail size={12} className="text-slate-500" />
                    {user.email}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-white/10" />
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-primary/20 text-primary uppercase tracking-wider">
                    {user.role}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-sm transition-all cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 p-6 sm:p-8 overflow-y-auto space-y-6">
            <div className="rounded-sm bg-slate-950/20 border border-white/5 p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-white">
                    Assign {access.label} Custom Overrides
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 font-medium leading-relaxed">
                    Configure individual access modules. System default permissions are loaded as fallback.
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={selectAll}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-sm bg-slate-900/50 border border-white/5 hover:border-primary/20 text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer"
                  >
                    <CheckSquare size={13} />
                    All
                  </button>
                  <button
                    type="button"
                    onClick={clearAll}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-sm bg-slate-900/50 border border-white/5 hover:border-primary/20 text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer"
                  >
                    <Square size={13} />
                    None
                  </button>
                  <button
                    type="button"
                    onClick={resetDefaults}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-sm bg-slate-900/50 border border-white/5 hover:border-primary/20 text-xs font-bold text-slate-450 hover:text-white transition-all cursor-pointer"
                  >
                    <RotateCcw size={13} />
                    Defaults
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-400">{enabled} of {total} Modules enabled</span>
                  <span className="text-primary">{progress}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-950/40 overflow-hidden">
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
                  <p className="text-xs font-black text-slate-400 uppercase tracking-[0.18em] mb-3 ml-1">
                    {group}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {modules.map((module) => {
                      const checked = permissions[module.id] ?? false;
                      return (
                        <label
                          key={module.id}
                          className={cn(
                            'flex items-start gap-4.5 p-4 rounded-sm border cursor-pointer transition-all group',
                            checked
                              ? 'border-primary/25 bg-primary/5 text-primary shadow-[0_8px_20px_-6px_rgba(59,163,139,0.15)]'
                              : 'border-white/5 bg-slate-950/30 hover:border-white/10 hover:bg-slate-950/50'
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => toggleModule(module.id, e.target.checked)}
                            className="mt-0.5 w-4.5 h-4.5 rounded accent-primary shrink-0 cursor-pointer"
                          />
                          <span className="min-w-0 flex-1">
                            <span className={cn(
                              "text-sm font-bold transition-colors block",
                              checked ? "text-primary" : "text-white group-hover:text-primary-light"
                            )}>
                              {module.label}
                            </span>
                            <span className="text-xs text-slate-400 block mt-1 leading-relaxed">
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
          <div className="flex items-center justify-end gap-3 p-6 sm:p-8 bg-slate-950/20 border-t border-white/5">
            <button
              onClick={onClose}
              disabled={isSaving}
              className="btn-secondary bg-white/5 hover:bg-white/10 border border-white/5 py-3 px-5 text-sm rounded-sm font-bold disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || isLoading}
              className="btn-primary shadow-lg shadow-primary/20 py-3 px-6 text-sm rounded-sm font-black uppercase tracking-wider disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Custom Rights
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
