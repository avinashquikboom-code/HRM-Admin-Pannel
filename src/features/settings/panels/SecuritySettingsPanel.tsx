'use client';

import { Eye, Globe, Lock, Smartphone } from 'lucide-react';
import SettingsSection from '@/features/settings/components/SettingsSection';
import SettingsToggle from '@/features/settings/components/SettingsToggle';

interface SecuritySettingsPanelProps {
  twoFactor: boolean;
  sessionLock: boolean;
  auditLogs: boolean;
  ipRestriction: boolean;
  onTwoFactorChange: (value: boolean) => void;
  onSessionLockChange: (value: boolean) => void;
  onAuditLogsChange: (value: boolean) => void;
  onIpRestrictionChange: (value: boolean) => void;
}

export default function SecuritySettingsPanel({
  twoFactor,
  sessionLock,
  auditLogs,
  ipRestriction,
  onTwoFactorChange,
  onSessionLockChange,
  onAuditLogsChange,
  onIpRestrictionChange,
}: SecuritySettingsPanelProps) {
  return (
    <SettingsSection
      title="Security"
      description="Protect Super Admin and platform admin accounts with these policies."
      icon={Lock}
    >
      <div className="space-y-3">
        <SettingsToggle
          title="Require two-factor authentication"
          description="Super Admins must verify with OTP or an authenticator app at login."
          enabled={twoFactor}
          onChange={onTwoFactorChange}
        />
        <SettingsToggle
          title="Lock inactive sessions"
          description="Automatically sign out users after 30 minutes of inactivity."
          enabled={sessionLock}
          onChange={onSessionLockChange}
        />
        <SettingsToggle
          title="Keep audit logs"
          description="Record sign-ins, permission changes, and sensitive admin actions."
          enabled={auditLogs}
          onChange={onAuditLogsChange}
        />
        <SettingsToggle
          title="Restrict login by IP range"
          description="Only allow admin logins from approved office IP addresses."
          enabled={ipRestriction}
          onChange={onIpRestrictionChange}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        {[
          { icon: Smartphone, label: '2FA methods', value: 'SMS, Authenticator' },
          { icon: Globe, label: 'Session timeout', value: '30 minutes' },
          { icon: Eye, label: 'Log retention', value: '90 days' },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-sm border border-border/60 bg-surface-variant/25 p-4"
          >
            <item.icon size={16} className="text-primary mb-2" />
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted">
              {item.label}
            </p>
            <p className="text-sm font-semibold text-text-primary mt-1">
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </SettingsSection>
  );
}
