'use client';

import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface SettingsSectionProps {
  title: string;
  description?: string;
  icon: LucideIcon;
  children: ReactNode;
  action?: ReactNode;
}

export default function SettingsSection({
  title,
  description,
  icon: Icon,
  children,
  action,
}: SettingsSectionProps) {
  return (
    <section className="rounded-sm border border-border/60 bg-surface p-5 sm:p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="rounded-sm bg-primary/10 p-3 text-primary shrink-0">
            <Icon size={20} />
          </div>
          <div>
            <h3 className="heading-2">{title}</h3>
            {description && (
              <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

interface SettingsFieldProps {
  label: string;
  hint?: string;
  children: ReactNode;
}

export function SettingsField({ label, hint, children }: SettingsFieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-muted">{hint}</p>}
    </div>
  );
}

export const settingsInputClass =
  'w-full rounded-sm border border-border/60 bg-surface-variant/50 px-4 py-3 text-sm font-medium text-text-primary outline-none focus:border-primary/30 focus:ring-2 focus:ring-primary/10 transition-all';

export const settingsSelectClass =
  'w-full rounded-sm border border-border/60 bg-surface-variant/50 px-4 py-3 text-sm font-medium text-text-primary outline-none focus:border-primary/30 focus:ring-2 focus:ring-primary/10 transition-all cursor-pointer';
