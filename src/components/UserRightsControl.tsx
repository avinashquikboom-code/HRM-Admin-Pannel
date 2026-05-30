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
    tab: 'bg-secondary text-white shadow-md shadow-secondary/20',
    ring: 'ring-secondary/30',
    badge: 'bg-secondary/10 text-secondary border-secondary/20',
    progress: 'bg-secondary',
    checkbox: 'accent-secondary',
  },
  primary: {
    tab: 'bg-primary text-white shadow-md shadow-primary/20',
    ring: 'ring-primary/30',
    badge: 'bg-primary/10 text-primary border-primary/20',
    progress: 'bg-primary',
    checkbox: 'accent-primary',
  },
  accent: {
    tab: 'bg-accent text-secondary shadow-md shadow-accent/20',
    ring: 'ring-accent/30',
    badge: 'bg-accent/15 text-secondary border-accent/25',
    progress: 'bg-accent',
    checkbox: 'accent-accent',
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
        'flex items-start gap-4 p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer',
        disabled && 'cursor-default opacity-80',
        checked
          ? cn('border-transparent shadow-sm', styles.badge)
          : 'border-border/70 bg-surface/50 hover:border-border hover:bg-surface-variant/40'
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange?.(event.target.checked)}
        className={cn(
          'mt-0.5 w-5 h-5 rounded-md border-2 border-border shrink-0 cursor-pointer disabled:cursor-default',
          styles.checkbox
        )}
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-text-primary">{module.label}</p>
        <p className="text-xs text-text-secondary mt-1 leading-relaxed">{module.description}</p>
      </div>
      {checked && (
        <CheckCircle2
          size={18}
          className={cn(
            'shrink-0 mt-0.5',
            accent === 'secondary' && 'text-secondary',
            accent === 'primary' && 'text-primary',
            accent === 'accent' && 'text-accent'
          )}
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
    <div className="rounded-[24px] border border-border/60 bg-surface-variant/25 p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className={cn('p-2.5 rounded-xl border', styles.badge)}>
            <Icon size={18} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-text-primary">{access.label}</h4>
            <p className="text-xs text-text-secondary">{enabled}/{total} modules enabled</p>
          </div>
        </div>
      </div>
      {managedBy && (
        <p className="text-xs font-medium text-warning mb-4 rounded-xl bg-warning/10 border border-warning/20 px-3 py-2">
          {managedBy}
        </p>
      )}
      <div className="space-y-2">
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
            'grid gap-2 p-2 rounded-[20px] bg-surface-variant/80 max-w-xl',
            roleOptions.length === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
          )}
        >
          {roleOptions.map((roleId) => {
            const role = ROLE_ACCESS[roleId];
            const roleStyles = ACCENT[role.accent];
            const counts = countEnabledModules(roleId, permissions, managerPortal);
            return (
              <button
                key={roleId}
                type="button"
                onClick={() => setSelectedRole(roleId)}
                className={cn(
                  'flex flex-col items-start px-4 py-3.5 rounded-2xl text-left transition-all',
                  selectedRole === roleId
                    ? roleStyles.tab
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface/70'
                )}
              >
                <span className="text-sm font-bold">{role.label}</span>
                <span
                  className={cn(
                    'text-[11px] mt-1 font-medium',
                    selectedRole === roleId ? 'text-white/75' : 'text-text-secondary'
                  )}
                >
                  {counts.enabled}/{counts.total} active
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
          <div className={cn('rounded-[28px] border p-5 sm:p-7', styles.badge)}>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
              <div>
                <p className="text-micro font-black uppercase tracking-[0.2em] text-text-secondary mb-1">
                  {access.label} permissions
                </p>
                <h4 className="text-lg font-bold text-text-primary">
                  {enabled} of {total} modules enabled
                </h4>
              </div>
              {canEditSelected && showSaveActions && (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={selectAll}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface border border-border text-xs font-bold text-text-primary hover:border-primary/30 transition-colors"
                  >
                    <CheckSquare size={14} />
                    Select all
                  </button>
                  <button
                    type="button"
                    onClick={deselectAll}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface border border-border text-xs font-bold text-text-primary hover:border-primary/30 transition-colors"
                  >
                    <Square size={14} />
                    Clear all
                  </button>
                  <button
                    type="button"
                    onClick={resetRole}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface border border-border text-xs font-bold text-text-secondary hover:text-primary transition-colors"
                  >
                    <RotateCcw size={14} />
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-colors disabled:opacity-50"
                  >
                    <Save size={14} />
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              )}
            </div>

            <div className="h-2 w-full rounded-full bg-surface/80 overflow-hidden mb-6">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className={cn('h-full rounded-full', styles.progress)}
              />
            </div>

            {savedMessage && (
              <div className="mb-5 rounded-2xl bg-success/10 border border-success/20 px-4 py-3 text-sm font-medium text-success">
                {savedMessage}
              </div>
            )}

            <div className="space-y-6">
              {Object.entries(groupedModules).map(([group, modules]) => (
                <div key={group}>
                  <p className="text-label text-text-secondary uppercase tracking-[0.18em] mb-3 ml-1">
                    {group}
                  </p>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
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
            <div className="space-y-4">
              <div>
                <p className="text-micro font-black text-text-secondary uppercase tracking-[0.2em]">
                  Hierarchy preview
                </p>
                <p className="text-sm text-text-secondary mt-1">
                  See how permissions flow to the next role level.
                </p>
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
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
    <div className="rounded-2xl border border-border/60 bg-surface-variant/30 px-4 py-4 space-y-3">
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
