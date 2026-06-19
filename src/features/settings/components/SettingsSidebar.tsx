'use client';

import type { LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';

export type SettingsTabId =
  | 'general'
  | 'access'
  | 'security'
  | 'attendance-policy'
  | 'leave-policy'
  | 'holidays'
  | 'notifications'
  | 'api';

export interface SettingsTab {
  id: SettingsTabId;
  label: string;
  description: string;
  icon: LucideIcon;
}

interface SettingsSidebarProps {
  tabs: SettingsTab[];
  activeTab: SettingsTabId;
  onTabChange: (tab: SettingsTabId) => void;
}

export default function SettingsSidebar({
  tabs,
  activeTab,
  onTabChange,
}: SettingsSidebarProps) {
  return (
    <div className="space-y-4">
      <nav className="rounded-sm border border-border/60 bg-surface p-3 shadow-sm space-y-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'relative w-full flex items-start gap-3 rounded-sm px-4 py-3.5 text-left transition-all',
                isActive
                  ? 'bg-primary/10 border border-primary/20'
                  : 'hover:bg-surface-variant/60 border border-transparent'
              )}
            >
              <span
                className={cn(
                  'absolute inset-y-3 left-0 w-1 rounded-r-full transition-all',
                  isActive ? 'bg-primary' : 'bg-transparent'
                )}
              />
              <div
                className={cn(
                  'rounded-sm p-2.5 shrink-0',
                  isActive
                    ? 'bg-primary/15 text-primary'
                    : 'bg-surface-variant text-text-secondary'
                )}
              >
                <tab.icon size={18} />
              </div>
              <div className="min-w-0">
                <p
                  className={cn(
                    'text-sm font-semibold',
                    isActive ? 'text-primary' : 'text-text-primary'
                  )}
                >
                  {tab.label}
                </p>
                <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">
                  {tab.description}
                </p>
              </div>
            </button>
          );
        })}
      </nav>

      <div className="rounded-sm border border-border/60 bg-surface-variant/40 p-5 shadow-sm">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
          Platform info
        </p>
        <p className="mt-2 text-sm font-semibold text-text-primary">
          Super HRM v1.0
        </p>
        <p className="text-xs text-text-secondary mt-1">Production environment</p>
        <div className="mt-4 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
          <span className="text-xs font-medium text-success">All services online</span>
        </div>
      </div>
    </div>
  );
}
