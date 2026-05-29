'use client';

import type { ReactNode } from 'react';
import { Bell, Mail, Smartphone } from 'lucide-react';
import { cn } from '@/utils/cn';
import SettingsSection from '@/features/settings/components/SettingsSection';

interface NotificationChannel {
  email: boolean;
  push: boolean;
}

interface NotificationsSettingsPanelProps {
  preferences: Record<string, NotificationChannel>;
  onToggle: (
    eventKey: string,
    channel: 'email' | 'push',
    enabled: boolean
  ) => void;
}

const NOTIFICATION_GROUPS = [
  {
    category: 'Companies',
    events: [
      { key: 'new_company', label: 'New company registration' },
      { key: 'verification', label: 'Verification status changes' },
    ],
  },
  {
    category: 'Billing',
    events: [
      { key: 'renewal', label: 'Subscription renewals' },
      { key: 'payment_failed', label: 'Failed payments' },
    ],
  },
  {
    category: 'Platform',
    events: [
      { key: 'admin_login', label: 'New admin sign-in from unknown device' },
      { key: 'rights_change', label: 'Permission updates' },
    ],
  },
];

function ChannelButton({
  active,
  onClick,
  children,
  title,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cn(
        'rounded-xl p-2 transition-colors',
        active
          ? 'bg-primary/10 text-primary'
          : 'text-muted hover:bg-surface-variant hover:text-text-secondary'
      )}
    >
      {children}
    </button>
  );
}

export default function NotificationsSettingsPanel({
  preferences,
  onToggle,
}: NotificationsSettingsPanelProps) {
  return (
    <SettingsSection
      title="Notifications"
      description="Choose how you want to be alerted about important platform events."
      icon={Bell}
    >
      <div className="space-y-8">
        {NOTIFICATION_GROUPS.map((group) => (
          <div key={group.category}>
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-3">
              {group.category}
            </h4>
            <div className="space-y-2">
              {group.events.map((event) => {
                const channels = preferences[event.key] ?? {
                  email: false,
                  push: false,
                };
                return (
                  <div
                    key={event.key}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-border/60 bg-surface-variant/25 px-4 py-3.5"
                  >
                    <span className="text-sm font-medium text-text-primary">
                      {event.label}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      <ChannelButton
                        title="Email"
                        active={channels.email}
                        onClick={() =>
                          onToggle(event.key, 'email', !channels.email)
                        }
                      >
                        <Mail size={16} />
                      </ChannelButton>
                      <ChannelButton
                        title="Push"
                        active={channels.push}
                        onClick={() =>
                          onToggle(event.key, 'push', !channels.push)
                        }
                      >
                        <Smartphone size={16} />
                      </ChannelButton>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </SettingsSection>
  );
}

export const defaultNotificationPreferences: Record<
  string,
  NotificationChannel
> = {
  new_company: { email: true, push: true },
  verification: { email: true, push: false },
  renewal: { email: true, push: true },
  payment_failed: { email: true, push: true },
  admin_login: { email: true, push: true },
  rights_change: { email: false, push: true },
};
