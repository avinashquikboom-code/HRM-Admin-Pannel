'use client';

import { Globe } from 'lucide-react';
import SettingsSection, {
  SettingsField,
  settingsInputClass,
  settingsSelectClass,
} from '@/features/settings/components/SettingsSection';

interface GeneralSettingsPanelProps {
  platformName: string;
  supportEmail: string;
  currency: string;
  locale: string;
  onPlatformNameChange: (value: string) => void;
  onSupportEmailChange: (value: string) => void;
  onCurrencyChange: (value: string) => void;
  onLocaleChange: (value: string) => void;
}

export default function GeneralSettingsPanel({
  platformName,
  supportEmail,
  currency,
  locale,
  onPlatformNameChange,
  onSupportEmailChange,
  onCurrencyChange,
  onLocaleChange,
}: GeneralSettingsPanelProps) {
  return (
    <SettingsSection
      title="General"
      description="Basic platform identity and regional defaults used across the admin panel."
      icon={Globe}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <SettingsField label="Platform name" hint="Shown in emails and admin headers">
          <input
            type="text"
            value={platformName}
            onChange={(e) => onPlatformNameChange(e.target.value)}
            className={settingsInputClass}
          />
        </SettingsField>

        <SettingsField label="Support email" hint="Contact address for company admins">
          <input
            type="email"
            value={supportEmail}
            onChange={(e) => onSupportEmailChange(e.target.value)}
            className={settingsInputClass}
          />
        </SettingsField>

        <SettingsField label="Default currency">
          <select
            value={currency}
            onChange={(e) => onCurrencyChange(e.target.value)}
            className={settingsSelectClass}
          >
            <option value="INR">INR — Indian Rupee (₹)</option>
            <option value="USD">USD — US Dollar ($)</option>
            <option value="EUR">EUR — Euro (€)</option>
          </select>
        </SettingsField>

        <SettingsField label="Default language">
          <select
            value={locale}
            onChange={(e) => onLocaleChange(e.target.value)}
            className={settingsSelectClass}
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
          </select>
        </SettingsField>
      </div>
    </SettingsSection>
  );
}
