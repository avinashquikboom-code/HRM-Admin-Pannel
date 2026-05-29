'use client';

import { useState } from 'react';
import {
  Bell,
  Globe,
  Key,
  Shield,
  Users,
} from 'lucide-react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import SettingsHero from '@/features/settings/components/SettingsHero';
import SettingsSidebar, {
  type SettingsTab,
  type SettingsTabId,
} from '@/features/settings/components/SettingsSidebar';
import GeneralSettingsPanel from '@/features/settings/panels/GeneralSettingsPanel';
import AccessSettingsPanel from '@/features/settings/panels/AccessSettingsPanel';
import SecuritySettingsPanel from '@/features/settings/panels/SecuritySettingsPanel';
import NotificationsSettingsPanel, {
  defaultNotificationPreferences,
} from '@/features/settings/panels/NotificationsSettingsPanel';
import ApiSettingsPanel from '@/features/settings/panels/ApiSettingsPanel';

const tabs: SettingsTab[] = [
  {
    id: 'general',
    label: 'General',
    description: 'Platform name, email, and locale',
    icon: Globe,
  },
  {
    id: 'access',
    label: 'Access & roles',
    description: 'Admin users and permissions',
    icon: Users,
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
  const [saveMessage, setSaveMessage] = useState('');

  const [platformName, setPlatformName] = useState('Super HRM');
  const [supportEmail, setSupportEmail] = useState('admin@hrm.com');
  const [currency, setCurrency] = useState('INR');
  const [locale, setLocale] = useState('en');

  const [twoFactor, setTwoFactor] = useState(true);
  const [sessionLock, setSessionLock] = useState(true);
  const [auditLogs, setAuditLogs] = useState(true);
  const [ipRestriction, setIpRestriction] = useState(false);

  const [notifications, setNotifications] = useState(
    defaultNotificationPreferences
  );

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage('');
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsSaving(false);
    setSaveMessage('Your settings were saved successfully.');
    setTimeout(() => setSaveMessage(''), 4000);
  };

  const handleNotificationToggle = (
    eventKey: string,
    channel: 'email' | 'push',
    enabled: boolean
  ) => {
    setNotifications((prev) => ({
      ...prev,
      [eventKey]: {
        ...prev[eventKey],
        [channel]: enabled,
      },
    }));
  };

  const renderPanel = () => {
    switch (activeTab) {
      case 'general':
        return (
          <GeneralSettingsPanel
            platformName={platformName}
            supportEmail={supportEmail}
            currency={currency}
            locale={locale}
            onPlatformNameChange={setPlatformName}
            onSupportEmailChange={setSupportEmail}
            onCurrencyChange={setCurrency}
            onLocaleChange={setLocale}
          />
        );
      case 'access':
        return <AccessSettingsPanel />;
      case 'security':
        return (
          <SecuritySettingsPanel
            twoFactor={twoFactor}
            sessionLock={sessionLock}
            auditLogs={auditLogs}
            ipRestriction={ipRestriction}
            onTwoFactorChange={setTwoFactor}
            onSessionLockChange={setSessionLock}
            onAuditLogsChange={setAuditLogs}
            onIpRestrictionChange={setIpRestriction}
          />
        );
      case 'notifications':
        return (
          <NotificationsSettingsPanel
            preferences={notifications}
            onToggle={handleNotificationToggle}
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
      <motion.div variants={itemVariants}>
        <SettingsHero
          onSave={handleSave}
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
    </motion.div>
  );
}
