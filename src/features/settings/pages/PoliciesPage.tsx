'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  RefreshCw,
  Save,
  Calendar,
  Clock,
  Users,
} from 'lucide-react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { cn } from '@/utils/cn';
import SuperAdminHeader from '@/components/SuperAdminHeader';
import SettingsSidebar, {
  type SettingsTab,
  type SettingsTabId,
} from '@/features/settings/components/SettingsSidebar';
import AttendancePolicyPanel from '@/features/settings/panels/AttendancePolicyPanel';
import LeavePolicyPanel from '@/features/settings/panels/LeavePolicyPanel';
import HolidaysPanel from '@/features/settings/panels/HolidaysPanel';
import { fetchSettings, updateSettings, type AdminSettings } from '@/services/settingsService';
import { type Office } from '@/services/officeService';

const tabs: SettingsTab[] = [
  {
    id: 'attendance-policy',
    label: 'Attendance Policy',
    description: 'Check-in rules, working hours, and thresholds',
    icon: Clock,
  },
  {
    id: 'leave-policy',
    label: 'Leave Policy',
    description: 'Leave types, limits, and approval rules',
    icon: Users,
  },
  {
    id: 'holidays',
    label: 'Holidays',
    description: 'Company holidays and calendar configuration',
    icon: Calendar,
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

export default function PoliciesPage() {
  const [activeTab, setActiveTab] = useState<SettingsTabId>('attendance-policy');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [saveMessage, setSaveMessage] = useState('');
  const [isDirty, setIsDirty] = useState(false);

  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [offices, setOffices] = useState<Office[]>([]);
  const [selectedOfficeId, setSelectedOfficeId] = useState<string>('default');

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetchSettings();
      setSettings(response.settings);
      setIsDirty(false);

      const { fetchOffices } = await import('@/services/officeService');
      const officesData = await fetchOffices();
      setOffices(officesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load policies');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Auto-dismiss save message after 3 seconds
  useEffect(() => {
    if (!saveMessage) return;
    const t = setTimeout(() => setSaveMessage(''), 3000);
    return () => clearTimeout(t);
  }, [saveMessage]);

  // Save only on explicit button click — no loadSettings() call to avoid full re-render
  const handleSaveCurrentTab = async () => {
    if (!settings) return;
    setIsSaving(true);
    setSaveMessage('');
    setError('');
    try {
      const isOfficeSelected = selectedOfficeId !== 'default';
      const selectedOffice = offices.find(o => o.id === selectedOfficeId);

      if (activeTab === 'attendance-policy' && isOfficeSelected && selectedOffice) {
        // Save office-specific policy
        const { updateOffice } = await import('@/services/officeService');
        const payload = {
          name: selectedOffice.name,
          address: selectedOffice.address,
          latitude: selectedOffice.latitude,
          longitude: selectedOffice.longitude,
          idealRadiusMeters: selectedOffice.idealRadiusMeters,
          maxPunchRadiusMeters: selectedOffice.maxPunchRadiusMeters,
          isActive: selectedOffice.isActive,
          subscriptionPlan: selectedOffice.subscriptionPlan,
          billingCycle: selectedOffice.billingCycle,
          invoiceStatus: selectedOffice.invoiceStatus,
          workingHoursStart: selectedOffice.workingHoursStart,
          workingHoursEnd: selectedOffice.workingHoursEnd,
          workingDays: selectedOffice.workingDays,
        };
        const response = await updateOffice(selectedOffice.id, payload);
        setSaveMessage(response.message);
        // Update local offices list without full reload
        const { fetchOffices } = await import('@/services/officeService');
        const refreshed = await fetchOffices();
        setOffices(refreshed);
      } else if (activeTab === 'attendance-policy') {
        const [attnResp, compResp] = await Promise.all([
          updateSettings('attendance', settings.attendance),
          updateSettings('company', settings.company),
        ]);
        setSaveMessage(attnResp.message || compResp.message || 'Settings saved.');
      } else if (activeTab === 'leave-policy') {
        const response = await updateSettings('leave', settings.leave);
        setSaveMessage(response.message || 'Leave policy saved.');
      }
      setIsDirty(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Local-only state updaters (no API call, no page reload) ───────────────

  const updateCompanySettings = (updates: Partial<AdminSettings['company']>) => {
    if (!settings) return;
    setSettings(prev => prev ? { ...prev, company: { ...prev.company, ...updates } } : prev);
    setIsDirty(true);
  };

  const updateAttendanceSettings = (updates: Partial<AdminSettings['attendance']>) => {
    if (!settings) return;
    setSettings(prev => prev ? { ...prev, attendance: { ...prev.attendance, ...updates } } : prev);
    setIsDirty(true);
  };

  const updateLeaveSettings = (updates: Partial<AdminSettings['leave']>) => {
    if (!settings) return;
    setSettings(prev => prev ? { ...prev, leave: { ...prev.leave, ...updates } } : prev);
    setIsDirty(true);
  };

  // ─── Office policy — local update only, saved on button click ─────────────

  const updateOfficeWorkingHours = (start: string, end: string) => {
    setOffices(prev => prev.map(o =>
      o.id === selectedOfficeId ? { ...o, workingHoursStart: start, workingHoursEnd: end } : o
    ));
    setIsDirty(true);
  };

  const updateOfficeWorkingDays = (days: string[]) => {
    setOffices(prev => prev.map(o =>
      o.id === selectedOfficeId ? { ...o, workingDays: days } : o
    ));
    setIsDirty(true);
  };

  const renderPanel = () => {
    const defaultSettings: AdminSettings = {
      company: {
        name: settings?.company.name || 'QuickBoom HRM',
        logo: settings?.company.logo || '',
        timezone: settings?.company.timezone || 'Asia/Kolkata',
        workingDays: settings?.company.workingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        workingHours: settings?.company.workingHours || { start: '09:00', end: '18:00' },
      },
      attendance: {
        lateThreshold: settings?.attendance.lateThreshold || 10,
        halfDayThreshold: settings?.attendance.halfDayThreshold || 180,
        autoMarkAbsent: settings?.attendance.autoMarkAbsent ?? true,
        absentThreshold: settings?.attendance.absentThreshold || 240,
      },
      leave: {
        casualLeavePerYear: settings?.leave.casualLeavePerYear || 12,
        sickLeavePerYear: settings?.leave.sickLeavePerYear || 10,
        earnedLeavePerYear: settings?.leave.earnedLeavePerYear || 15,
        requireApproval: settings?.leave.requireApproval ?? true,
        maxConsecutiveDays: settings?.leave.maxConsecutiveDays || 5,
      },
      notifications: {
        emailEnabled: settings?.notifications.emailEnabled ?? true,
        smsEnabled: settings?.notifications.smsEnabled ?? false,
        pushEnabled: settings?.notifications.pushEnabled ?? true,
        dailyReports: settings?.notifications.dailyReports ?? true,
        weeklyReports: settings?.notifications.weeklyReports ?? true,
      },
      payroll: {
        processingDay: settings?.payroll.processingDay || 25,
        currency: settings?.payroll.currency || 'INR',
        includeTax: settings?.payroll.includeTax ?? true,
        includeProvidentFund: settings?.payroll.includeProvidentFund ?? true,
      },
    };

    const currentSettings = settings || defaultSettings;

    switch (activeTab) {
      case 'attendance-policy': {
        const isOfficeSelected = selectedOfficeId !== 'default';
        const selectedOffice = offices.find(o => o.id === selectedOfficeId);

        const currentWorkingHours = isOfficeSelected && selectedOffice
          ? { start: selectedOffice.workingHoursStart, end: selectedOffice.workingHoursEnd }
          : currentSettings.company.workingHours;

        const currentWorkingDays = isOfficeSelected && selectedOffice
          ? selectedOffice.workingDays
          : currentSettings.company.workingDays;

        return (
          <div className="space-y-6">
            {/* Office Selector Dropdown */}
            <div className="glass-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-text-primary uppercase tracking-wider">Configure Policy For</h4>
                <p className="text-xs text-text-secondary">Select default company-wide policy or a specific office override</p>
              </div>
              <select
                value={selectedOfficeId}
                onChange={(e) => setSelectedOfficeId(e.target.value)}
                className="px-4 py-2.5 bg-slate-800 border border-white/10 rounded-lg text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-primary/40 min-w-[200px]"
              >
                <option value="default">Default Company Policy</option>
                {offices.map(office => (
                  <option key={office.id} value={office.id}>
                    {office.name}
                  </option>
                ))}
              </select>
            </div>

            <AttendancePolicyPanel
              lateThreshold={currentSettings.attendance.lateThreshold}
              halfDayThreshold={currentSettings.attendance.halfDayThreshold}
              absentThreshold={currentSettings.attendance.absentThreshold}
              autoMarkAbsent={currentSettings.attendance.autoMarkAbsent}
              workingHours={currentWorkingHours}
              workingDays={currentWorkingDays}
              onLateThresholdChange={(value) => updateAttendanceSettings({ lateThreshold: value })}
              onHalfDayThresholdChange={(value) => updateAttendanceSettings({ halfDayThreshold: value })}
              onAbsentThresholdChange={(value) => updateAttendanceSettings({ absentThreshold: value })}
              onAutoMarkAbsentChange={(value) => updateAttendanceSettings({ autoMarkAbsent: value })}
              onWorkingHoursChange={(start, end) => {
                if (isOfficeSelected) {
                  updateOfficeWorkingHours(start, end);
                } else {
                  updateCompanySettings({ workingHours: { start, end } });
                }
              }}
              onWorkingDaysChange={(days) => {
                if (isOfficeSelected) {
                  updateOfficeWorkingDays(days);
                } else {
                  updateCompanySettings({ workingDays: days });
                }
              }}
            />
          </div>
        );
      }
      case 'leave-policy':
        return (
          <LeavePolicyPanel
            leaveTypes={currentSettings.leave.leaveTypes}
            onLeaveTypesChange={(newLeaveTypes) => {
              const casual = newLeaveTypes.find(lt => lt.code === 'CL')?.daysPerYear ?? 12;
              const sick = newLeaveTypes.find(lt => lt.code === 'SL')?.daysPerYear ?? 10;
              const earned = newLeaveTypes.find(lt => lt.code === 'EL')?.daysPerYear ?? 15;
              updateLeaveSettings({
                leaveTypes: newLeaveTypes,
                casualLeavePerYear: casual,
                sickLeavePerYear: sick,
                earnedLeavePerYear: earned,
              });
            }}
            requireApproval={currentSettings.leave.requireApproval}
            maxConsecutiveDays={currentSettings.leave.maxConsecutiveDays}
            onRequireApprovalChange={(value) => updateLeaveSettings({ requireApproval: value })}
            onMaxConsecutiveDaysChange={(value) => updateLeaveSettings({ maxConsecutiveDays: value })}
          />
        );
      case 'holidays':
        return <HolidaysPanel />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6 pb-10 text-text-primary"
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

          <SuperAdminHeader
            title="Company Policies"
            subtitle="Configure organization-wide rules for attendance tracking, leave limits, working hours, and calendar holidays."
            badgeText="Policy Management"
            badgeIcon={Shield}
            stats={[
              { label: 'Attendance Rules', value: '4 Rules', icon: Clock },
              { label: 'Leave Limits', value: `${settings?.leave?.leaveTypes?.length || 6} Types`, icon: Users },
              { label: 'Calendar Year', value: new Date().getFullYear().toString(), icon: Calendar }
            ]}
          >
            <button
              onClick={handleSaveCurrentTab}
              disabled={isSaving || !isDirty}
              className="btn-primary group shadow-xl shadow-primary/20 flex items-center gap-2 disabled:opacity-60"
            >
              <Save size={18} className={cn(isSaving && 'animate-spin')} />
              {isSaving ? 'Saving...' : isDirty ? 'Save Policy Settings' : 'Saved ✓'}
            </button>
          </SuperAdminHeader>

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
