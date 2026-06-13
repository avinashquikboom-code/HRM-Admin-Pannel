'use client';

import { Save, Settings } from 'lucide-react';

interface SettingsHeroProps {
  onSave: () => void;
  isSaving?: boolean;
  saveMessage?: string;
}

export default function SettingsHero({
  onSave,
  isSaving,
  saveMessage,
}: SettingsHeroProps) {
  return (
    <div className="relative overflow-hidden rounded-sm border border-primary/15 bg-gradient-to-br from-secondary via-primary-dark to-primary p-6 sm:p-8 text-white shadow-premium">
      <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-16 -left-8 h-40 w-40 rounded-full bg-accent/15 blur-3xl" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider backdrop-blur-sm">
            <Settings size={12} />
            Platform settings
          </div>
          <h1 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight">
            Settings
          </h1>
          <p className="mt-2 text-sm sm:text-base text-white/75 max-w-xl leading-relaxed">
            Configure platform defaults, security, notifications, and admin
            access for your Super HRM workspace.
          </p>
          {saveMessage && (
            <p className="mt-3 text-sm font-medium text-emerald-200">
              {saveMessage}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className="inline-flex items-center justify-center gap-2 rounded-sm bg-white px-5 py-3 text-sm font-semibold text-primary shadow-lg hover:bg-white/95 transition-all disabled:opacity-60 shrink-0"
        >
          <Save size={16} className={isSaving ? 'animate-pulse' : ''} />
          {isSaving ? 'Saving...' : 'Save changes'}
        </button>
      </div>
    </div>
  );
}
