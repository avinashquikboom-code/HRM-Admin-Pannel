'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Bell,
  Globe,
  Key,
  Shield,
  RefreshCw,
  Save,
} from 'lucide-react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { api, getApiErrorMessage } from '@/lib/api';
import SettingsHero from '@/features/settings/components/SettingsHero';
import SettingsSidebar, {
  type SettingsTab,
  type SettingsTabId,
} from '@/features/settings/components/SettingsSidebar';
import GeneralSettingsPanel from '@/features/settings/panels/GeneralSettingsPanel';
import SecuritySettingsPanel from '@/features/settings/panels/SecuritySettingsPanel';
import NotificationsSettingsPanel, {
  defaultNotificationPreferences,
} from '@/features/settings/panels/NotificationsSettingsPanel';
import ApiSettingsPanel from '@/features/settings/panels/ApiSettingsPanel';
import {
  fetchSettings,
  updateSettings,
  type AdminSettings,
} from '@/services/settingsService';

const tabs: SettingsTab[] = [
  {
    id: 'general',
    label: 'General',
    description: 'Platform name, email, and locale',
    icon: Globe,
  },

  {
    id: 'security',
    label: 'Security',
    description: 'Authentication and audit policies',
    icon: Shield,
  },
  {
    id: 'notifications',
    label: 'Notifications',
    description: 'Email and push alert preferences',
    icon: Bell,
  },
  {
    id: 'api',
    label: 'API keys',
    description: 'Integration credentials',
    icon: Key,
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 120, damping: 18 },
  },
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTabId>('general');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [saveMessage, setSaveMessage] = useState('');

  const [settings, setSettings] = useState<AdminSettings | null>(null);

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetchSettings();
      setSettings(response.settings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSaveSettings = async (category: string, updatedSettings: any) => {
    setIsSaving(true);
    setSaveMessage('');
    try {
      const response = await updateSettings(category, updatedSettings);
      setSaveMessage(response.message);
      // Refresh settings to get the latest data
      await loadSettings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update settings');
    } finally {
      setIsSaving(false);
    }
  };

  // Helper functions to update specific settings
  const updateCompanySettings = (updates: Partial<AdminSettings['company']>) => {
    if (!settings) return;
    const newSettings = { ...settings, company: { ...settings.company, ...updates } };
    setSettings(newSettings);
    handleSaveSettings('company', newSettings.company);
  };

  const updateAttendanceSettings = (updates: Partial<AdminSettings['attendance']>) => {
    if (!settings) return;
    const newSettings = { ...settings, attendance: { ...settings.attendance, ...updates } };
    setSettings(newSettings);
    handleSaveSettings('attendance', newSettings.attendance);
  };

  const updateLeaveSettings = (updates: Partial<AdminSettings['leave']>) => {
    if (!settings) return;
    const newSettings = { ...settings, leave: { ...settings.leave, ...updates } };
    setSettings(newSettings);
    handleSaveSettings('leave', newSettings.leave);
  };

  const updateNotificationSettings = (updates: Partial<AdminSettings['notifications']>) => {
    if (!settings) return;
    const newSettings = { ...settings, notifications: { ...settings.notifications, ...updates } };
    setSettings(newSettings);
    handleSaveSettings('notifications', newSettings.notifications);
  };

  const updatePayrollSettings = (updates: Partial<AdminSettings['payroll']>) => {
    if (!settings) return;
    const newSettings = { ...settings, payroll: { ...settings.payroll, ...updates } };
    setSettings(newSettings);
    handleSaveSettings('payroll', newSettings.payroll);
  };

  const renderPanel = () => {
    if (!settings) return null;

    switch (activeTab) {
      case 'general':
        return (
          <GeneralSettingsPanel
            platformName={settings.company.name}
            supportEmail="" // This would come from settings in a real implementation
            currency={settings.payroll.currency}
            locale="en" // This would come from settings in a real implementation
            onPlatformNameChange={(value) => updateCompanySettings({ name: value })}
            onSupportEmailChange={(value) => console.log('Support email update:', value)}
            onCurrencyChange={(value) => updatePayrollSettings({ currency: value })}
            onLocaleChange={(value) => console.log('Locale update:', value)}
          />
        );
      case 'security':
        return (
          <SecuritySettingsPanel
            twoFactor={true} // This would come from settings in a real implementation
            sessionLock={true} // This would come from settings in a real implementation
            auditLogs={true} // This would come from settings in a real implementation
            ipRestriction={false} // This would come from settings in a real implementation
            onTwoFactorChange={(value) => console.log('2FA update:', value)}
            onSessionLockChange={(value) => console.log('Session lock update:', value)}
            onAuditLogsChange={(value) => console.log('Audit logs update:', value)}
            onIpRestrictionChange={(value) => console.log('IP restriction update:', value)}
          />
        );
      case 'notifications':
        return (
          <NotificationsSettingsPanel
            preferences={{
              login: { email: settings.notifications.emailEnabled, push: settings.notifications.pushEnabled },
              payroll: { email: settings.notifications.emailEnabled, push: false },
              leave: { email: settings.notifications.emailEnabled, push: settings.notifications.pushEnabled },
              reports: { email: settings.notifications.dailyReports, push: false },
            }}
            onToggle={(eventKey, channel, enabled) => {
              if (channel === 'email') {
                updateNotificationSettings({ emailEnabled: enabled });
              } else if (channel === 'push') {
                updateNotificationSettings({ pushEnabled: enabled });
              }
            }}
          />
        );
      case 'api':
        return <ApiSettingsPanel />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6 pb-10"
    >
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {error && (
            <motion.div variants={itemVariants} className="glass-card p-6 text-center">
              <p className="text-error mb-4">{error}</p>
              <button 
                onClick={loadSettings}
                className="text-primary font-bold hover:underline flex items-center gap-2 mx-auto"
              >
                <RefreshCw size={16} />
                Try Again
              </button>
            </motion.div>
          )}

          {saveMessage && (
            <motion.div variants={itemVariants} className="glass-card p-4 text-center bg-emerald-500/10 border-emerald-500/20">
              <p className="text-emerald-600 font-medium">{saveMessage}</p>
            </motion.div>
          )}

          <motion.div variants={itemVariants}>
            <SettingsHero
              onSave={() => console.log('Save triggered from hero')}
              isSaving={isSaving}
              saveMessage={saveMessage}
            />
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <motion.div variants={itemVariants} className="lg:col-span-4 xl:col-span-3">
          <SettingsSidebar
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </motion.div>

        <motion.div variants={itemVariants} className="lg:col-span-8 xl:col-span-9">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {renderPanel()}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
        </>
      )}
    </motion.div>
  );
}

