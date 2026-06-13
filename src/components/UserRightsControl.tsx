'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  LayoutDashboard,
  User,
  CheckSquare,
  Square,
  RotateCcw,
  Save,
  CheckCircle2,
} from 'lucide-react';
import type { PortalType } from '@/lib/portals';
import {
  ROLE_ACCESS,
  countEnabledModules,
  getDefaultRolePermissions,
  getHierarchyPreview,
  getManagedRolesForPortal,
  getModuleDefsForManager,
  loadRolePermissions,
  saveManagedRolePermissions,
  fetchRolePermissionsAsync,
  saveManagedRolePermissionsAsync,
  canManageRole,
  type AccessModuleDef,
  type RoleAccessInfo,
  type RolePermissionsMap,
} from '@/lib/roleAccess';
import { cn } from '@/utils/cn';

const PORTAL_ICONS: Record<PortalType, typeof ShieldCheck> = {
  super_admin: ShieldCheck,
  platform_admin: LayoutDashboard,
  employee: User,
};

const ACCENT = {
  secondary: {
    tab: 'bg-violet-600 text-white shadow-lg shadow-violet-500/20 border-violet-500/30',
    ring: 'ring-violet-500/30',
    badge: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    progress: 'bg-violet-500',
    checkbox: 'accent-violet-500',
  },
  primary: {
    tab: 'bg-primary text-white shadow-lg shadow-primary/20 border-primary/30',
    ring: 'ring-primary/30',
    badge: 'bg-primary/10 text-primary border-primary/20',
    progress: 'bg-primary',
    checkbox: 'accent-primary',
  },
  accent: {
    tab: 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 border-amber-400/30',
    ring: 'ring-amber-500/30',
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    progress: 'bg-amber-500',
    checkbox: 'accent-amber-500',
  },
};

function groupModules(modules: AccessModuleDef[]) {
  return modules.reduce<Record<string, AccessModuleDef[]>>((groups, module) => {
    if (!groups[module.group]) groups[module.group] = [];
    groups[module.group].push(module);
    return groups;
  }, {});
}

function PermissionCheckbox({
  module,
  checked,
  disabled,
  onChange,
  accent,
}: {
  module: AccessModuleDef;
  checked: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
  accent: keyof typeof ACCENT;
}) {
  const styles = ACCENT[accent];

  return (
    <label
      className={cn(
        'flex items-start gap-4 p-4 sm:p-5 rounded-sm border transition-all cursor-pointer group',
        disabled && 'cursor-default opacity-85',
        checked
          ? 'border-primary/30 bg-primary/5 text-primary shadow-[0_8px_20px_-6px_rgba(59,163,139,0.15)]'
          : 'border-white/5 bg-slate-950/30 hover:border-white/10 hover:bg-slate-950/50'
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange?.(event.target.checked)}
        className={cn(
          'mt-0.5 w-5 h-5 rounded-md border-2 border-slate-650 shrink-0 cursor-pointer disabled:cursor-default',
          styles.checkbox
        )}
      />
      <div className="min-w-0 flex-1">
        <p className={cn(
          "text-sm font-bold transition-colors",
          checked ? "text-primary" : "text-white group-hover:text-primary-light"
        )}>{module.label}</p>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">{module.description}</p>
      </div>
      {checked && (
        <CheckCircle2
          size={18}
          className="shrink-0 mt-0.5 text-primary animate-scaleIn"
        />
      )}
    </label>
  );
}

function ReadOnlyModuleList({
  access,
  permissions,
  managedBy,
  managerPortal,
}: {
  access: RoleAccessInfo;
  permissions: RolePermissionsMap;
  managedBy?: string;
  managerPortal?: PortalType;
}) {
  const Icon = PORTAL_ICONS[access.portal];
  const styles = ACCENT[access.accent];
  const visibleModules = getModuleDefsForManager(access.portal, managerPortal);
  const { enabled, total } = countEnabledModules(
    access.portal,
    permissions,
    managerPortal
  );

  return (
    <div className="rounded-[24px] border border-white/5 bg-slate-950/20 p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className={cn('p-2.5 rounded-sm border', styles.badge)}>
            <Icon size={18} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">{access.label}</h4>
            <p className="text-xs text-slate-400 mt-0.5">{enabled}/{total} modules enabled</p>
          </div>
        </div>
      </div>
      {managedBy && (
        <p className="text-xs font-semibold text-amber-400 mb-4 rounded-sm bg-amber-500/10 border border-amber-500/20 px-3 py-2 leading-relaxed">
          {managedBy}
        </p>
      )}
      <div className="space-y-2.5">
        {visibleModules.map((module) => (
          <PermissionCheckbox
            key={module.id}
            module={module}
            checked={permissions[access.portal][module.id] ?? true}
            disabled
            accent={access.accent}
          />
        ))}
      </div>
    </div>
  );
}

interface UserRightsControlProps {
  /** Who is editing — Super Admin or Admin (HR). */
  managerPortal: PortalType;
  defaultRole?: PortalType;
  roleOptions?: PortalType[];
  showRolePicker?: boolean;
  showLowerRoles?: boolean;
  showSaveActions?: boolean;
  title?: string;
  description?: string;
}

export default function UserRightsControl({
  managerPortal,
  defaultRole,
  roleOptions: roleOptionsProp,
  showRolePicker = true,
  showLowerRoles = true,
  showSaveActions = true,
  title = 'User Rights Control',
  description = 'Toggle checkboxes to grant or revoke module access for each role.',
}: UserRightsControlProps) {
  const roleOptions = roleOptionsProp ?? getManagedRolesForPortal(managerPortal);
  const initialRole =
    defaultRole && roleOptions.includes(defaultRole) ? defaultRole : roleOptions[0];

  const [selectedRole, setSelectedRole] = useState<PortalType>(initialRole);
  const [permissions, setPermissions] = useState<RolePermissionsMap>(() =>
    getDefaultRolePermissions()
  );
  const [savedMessage, setSavedMessage] = useState('');

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchRolePermissionsAsync().then(setPermissions);
  }, []);

  const access = ROLE_ACCESS[selectedRole];
  const visibleModules = useMemo(
    () => getModuleDefsForManager(selectedRole, managerPortal),
    [selectedRole, managerPortal]
  );
  const hierarchyPreview = showLowerRoles
    ? getHierarchyPreview(managerPortal, selectedRole)
    : [];
  const canEditSelected = canManageRole(managerPortal, selectedRole);
  const styles = ACCENT[access.accent];
  const { enabled, total } = countEnabledModules(
    selectedRole,
    permissions,
    managerPortal
  );
  const groupedModules = useMemo(
    () => groupModules(visibleModules),
    [visibleModules]
  );
  const progress = total > 0 ? Math.round((enabled / total) * 100) : 0;

  const setModule = (moduleId: string, checked: boolean) => {
    setPermissions((current) => ({
      ...current,
      [selectedRole]: {
        ...current[selectedRole],
        [moduleId]: checked,
      },
    }));
    setSavedMessage('');
  };

  const selectAll = () => {
    const next = { ...permissions[selectedRole] };
    for (const module of visibleModules) next[module.id] = true;
    setPermissions((current) => ({ ...current, [selectedRole]: next }));
    setSavedMessage('');
  };

  const deselectAll = () => {
    const next = { ...permissions[selectedRole] };
    for (const module of visibleModules) next[module.id] = false;
    setPermissions((current) => ({ ...current, [selectedRole]: next }));
    setSavedMessage('');
  };

  const resetRole = () => {
    const defaults = getDefaultRolePermissions();
    setPermissions((current) => ({
      ...current,
      [selectedRole]: defaults[selectedRole],
    }));
    setSavedMessage('');
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveManagedRolePermissionsAsync(managerPortal, permissions);
      setSavedMessage(
        managerPortal === 'super_admin'
          ? 'Admin permissions saved successfully.'
          : 'Employee permissions saved successfully.'
      );
      window.setTimeout(() => setSavedMessage(''), 3000);
    } catch (e) {
      setSavedMessage('Failed to save permissions.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {(title || description) && (
        <div>
          {title ? <h3 className="heading-2">{title}</h3> : null}
          {description ? (
            <p className="text-sm text-text-secondary font-medium mt-1">{description}</p>
          ) : null}
        </div>
      )}

      {showRolePicker && roleOptions.length > 1 && (
        <div
          className={cn(
            'grid gap-2 p-2 rounded-[1.5rem] bg-slate-950/40 border border-white/5 max-w-xl',
            roleOptions.length === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
          )}
        >
          {roleOptions.map((roleId) => {
            const role = ROLE_ACCESS[roleId];
            const roleStyles = ACCENT[role.accent];
            const counts = countEnabledModules(roleId, permissions, managerPortal);
            const isSelected = selectedRole === roleId;
            return (
              <button
                key={roleId}
                type="button"
                onClick={() => setSelectedRole(roleId)}
                className={cn(
                  'flex flex-col items-start px-4.5 py-3.5 rounded-sm text-left transition-all duration-300 cursor-pointer',
                  isSelected
                    ? roleStyles.tab
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                )}
              >
                <span className="text-xs font-black uppercase tracking-wider">{role.label}</span>
                <span
                  className={cn(
                    'text-[10px] mt-1 font-bold',
                    isSelected ? 'text-white/75' : 'text-slate-500'
                  )}
                >
                  {counts.enabled} of {counts.total} modules active
                </span>
              </button>
            );
          })}
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={selectedRole}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="space-y-5"
        >
          <div className="rounded-[2rem] border border-white/5 bg-slate-950/20 p-5 sm:p-7">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 mb-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">
                  {access.label} permissions matrix
                </p>
                <h4 className="text-lg font-black text-white">
                  {enabled} of {total} operational modules enabled
                </h4>
              </div>
              {canEditSelected && showSaveActions && (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={selectAll}
                    className="inline-flex items-center gap-1.5 px-4.5 py-2.5 rounded-sm bg-slate-900/50 border border-white/5 hover:border-primary/20 text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer"
                  >
                    <CheckSquare size={14} className="text-slate-400" />
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={deselectAll}
                    className="inline-flex items-center gap-1.5 px-4.5 py-2.5 rounded-sm bg-slate-900/50 border border-white/5 hover:border-primary/20 text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer"
                  >
                    <Square size={14} className="text-slate-400" />
                    Clear All
                  </button>
                  <button
                    type="button"
                    onClick={resetRole}
                    className="inline-flex items-center gap-1.5 px-4.5 py-2.5 rounded-sm bg-slate-900/50 border border-white/5 hover:border-primary/20 text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer"
                  >
                    <RotateCcw size={14} className="text-slate-400" />
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-sm bg-primary text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <Save size={14} />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>

            <div className="h-2 w-full rounded-full bg-slate-950/40 overflow-hidden mb-6">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className={cn('h-full rounded-full', styles.progress)}
              />
            </div>

            {savedMessage && (
              <div className="mb-6 rounded-sm bg-emerald-500/10 border border-emerald-500/20 px-4.5 py-3.5 text-xs font-semibold text-emerald-400">
                {savedMessage}
              </div>
            )}

            <div className="space-y-7">
              {Object.entries(groupedModules).map(([group, modules]) => (
                <div key={group}>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.18em] mb-3.5 ml-1">
                    {group}
                  </p>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-3.5">
                    {modules.map((module) => (
                      <PermissionCheckbox
                        key={module.id}
                        module={module}
                        checked={permissions[selectedRole][module.id] ?? true}
                        disabled={!canEditSelected}
                        onChange={(checked) => setModule(module.id, checked)}
                        accent={access.accent}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {hierarchyPreview.length > 0 && (
            <div className="space-y-5 pt-4">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Hierarchy preview flow
                </p>
                <p className="text-xs text-slate-500 mt-1 font-semibold leading-relaxed">
                  Verify down-stream permission delegation parameters.
                </p>
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                {hierarchyPreview.map((preview) => (
                  <ReadOnlyModuleList
                    key={preview.access.portal}
                    access={preview.access}
                    permissions={permissions}
                    managedBy={preview.managedBy}
                  />
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}


export function UserRightsPreview({ portal }: { portal: PortalType }) {
  const access = ROLE_ACCESS[portal];
  const permissions = loadRolePermissions();
  const enabledModules = access.moduleDefs.filter(
    (module) => permissions[portal][module.id] ?? true
  );

  return (
    <div className="rounded-sm border border-border/60 bg-surface-variant/30 px-4 py-4 space-y-3">
      <p className="text-xs font-bold text-text-primary">
        This user will access ({access.label})
      </p>
      <div className="space-y-2">
        {enabledModules.map((module) => (
          <label
            key={module.id}
            className="flex items-center gap-3 text-sm text-text-secondary"
          >
            <input
              type="checkbox"
              checked
              readOnly
              className="w-4 h-4 rounded border-border accent-primary"
            />
            <span className="font-medium">{module.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
