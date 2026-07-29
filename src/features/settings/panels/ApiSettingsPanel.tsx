'use client';

import { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, Save, Loader2, CheckCircle2, ShieldAlert, MapPin, Cloud } from 'lucide-react';
import { toast } from 'sonner';
import SettingsSection from '@/features/settings/components/SettingsSection';
import { fetchSettings, updateSettings } from '@/services/settingsService';

export default function ApiSettingsPanel() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showKeys, setShowKeys] = useState(false);

  const [integrations, setIntegrations] = useState({
    hopkidApiUrl: 'https://hopkidapi.3dweb.in/api/Employee/GetEmployeeList',
    hopkidApiKey: 'HOPKID-MOBILE-ACCESS-API-KEY',
    mobileApiKey: 'HOPKID-MOBILE-ACCESS-API-KEY',
    firebaseServerKey: '',
    googleMapsApiKey: '',
    awsAccessKeyId: '',
    awsSecretAccessKey: '',
    awsRegion: 'ap-south-1',
    awsBucketName: '',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await fetchSettings();
      const integrationsData = res.settings?.integrations || (res.settings as any) || {};
      setIntegrations({
        hopkidApiUrl: integrationsData.hopkidApiUrl || 'https://hopkidapi.3dweb.in/api/Employee/GetEmployeeList',
        hopkidApiKey: integrationsData.hopkidApiKey || 'HOPKID-MOBILE-ACCESS-API-KEY',
        mobileApiKey: integrationsData.mobileApiKey || 'HOPKID-MOBILE-ACCESS-API-KEY',
        firebaseServerKey: integrationsData.firebaseServerKey || '',
        googleMapsApiKey: integrationsData.googleMapsApiKey || '',
        awsAccessKeyId: integrationsData.awsAccessKeyId || '',
        awsSecretAccessKey: integrationsData.awsSecretAccessKey || '',
        awsRegion: integrationsData.awsRegion || 'ap-south-1',
        awsBucketName: integrationsData.awsBucketName || '',
      });
    } catch (err: any) {
      console.warn('[ApiSettingsPanel] Failed to load remote integration settings, using default state:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateSettings('integrations', integrations);
      toast.success('Integration API Keys updated successfully! Server environment restarted dynamically in DB.');
    } catch (err: any) {
      console.error('Save integration keys error:', err);
      toast.error(err?.message || 'Failed to save integration keys.');
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    'w-full px-4 py-3 bg-surface-variant/50 border border-border rounded-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all text-xs font-mono font-semibold text-text-primary';
  const labelCls =
    'block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2';

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="animate-spin text-primary" size={24} />
      </div>
    );
  }

  return (
    <SettingsSection
      title="API Keys & External Integrations"
      description="Manage live system API keys and integration endpoints directly. Changes apply immediately without editing .env files or restarting backend servers."
      icon={Key}
    >
      <form onSubmit={handleSave} className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-sm">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={20} className="text-primary" />
            <div>
              <p className="text-xs font-bold text-text-primary">Dynamic Hot-Reloading Active</p>
              <p className="text-[11px] text-text-secondary">Saved API keys update in database real-time. No server restart required.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowKeys((prev) => !prev)}
            className="px-3 py-1.5 bg-surface-variant hover:bg-surface-variant/80 border border-border rounded-sm text-xs font-bold flex items-center gap-1.5 text-text-secondary transition-all"
          >
            {showKeys ? <EyeOff size={14} /> : <Eye size={14} />}
            {showKeys ? 'Hide Secret Keys' : 'Reveal Secret Keys'}
          </button>
        </div>

        {/* HopKid Employee API Settings */}
        <div className="p-5 border border-border/70 rounded-sm bg-surface-variant/20 space-y-4">
          <div className="flex items-center justify-between border-b border-border/50 pb-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-text-primary flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              HopKid Portal Employee Integration
            </h4>
          </div>

          <div>
            <label className={labelCls}>HopKid Employee API Endpoint URL</label>
            <input
              type="text"
              required
              value={integrations.hopkidApiUrl}
              onChange={(e) => setIntegrations((prev) => ({ ...prev, hopkidApiUrl: e.target.value }))}
              className={inputCls}
              placeholder="https://hopkidapi.3dweb.in/api/Employee/GetEmployeeList"
            />
          </div>

          <div>
            <label className={labelCls}>HopKid External API Access Key (x-api-key)</label>
            <input
              type={showKeys ? 'text' : 'password'}
              required
              value={integrations.hopkidApiKey}
              onChange={(e) => setIntegrations((prev) => ({ ...prev, hopkidApiKey: e.target.value }))}
              className={inputCls}
              placeholder="Enter HopKid API Key"
            />
          </div>
        </div>

        {/* Mobile & Push Notifications Keys */}
        <div className="p-5 border border-border/70 rounded-sm bg-surface-variant/20 space-y-4">
          <h4 className="text-xs font-black uppercase tracking-wider text-text-primary border-b border-border/50 pb-3">
            Mobile App & Authorization Keys
          </h4>

          <div>
            <label className={labelCls}>Mobile App Authorization Key (x-api-key)</label>
            <input
              type={showKeys ? 'text' : 'password'}
              required
              value={integrations.mobileApiKey}
              onChange={(e) => setIntegrations((prev) => ({ ...prev, mobileApiKey: e.target.value }))}
              className={inputCls}
              placeholder="Enter Mobile API Key"
            />
            <p className="text-[11px] text-text-secondary mt-1">Used by Flutter mobile app to authorize API requests.</p>
          </div>

          <div>
            <label className={labelCls}>Firebase FCM Push Notification Key</label>
            <input
              type={showKeys ? 'text' : 'password'}
              value={integrations.firebaseServerKey}
              onChange={(e) => setIntegrations((prev) => ({ ...prev, firebaseServerKey: e.target.value }))}
              className={inputCls}
              placeholder="Enter Firebase FCM Key (Optional)"
            />
          </div>
        </div>

        {/* Google Maps API Key */}
        <div className="p-5 border border-border/70 rounded-sm bg-surface-variant/20 space-y-4">
          <div className="flex items-center justify-between border-b border-border/50 pb-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-text-primary flex items-center gap-2">
              <MapPin size={16} className="text-rose-500" />
              Google Maps & Geofencing API
            </h4>
          </div>

          <div>
            <label className={labelCls}>Google Maps API Key</label>
            <input
              type={showKeys ? 'text' : 'password'}
              value={integrations.googleMapsApiKey}
              onChange={(e) => setIntegrations((prev) => ({ ...prev, googleMapsApiKey: e.target.value }))}
              className={inputCls}
              placeholder="AIzaSy..."
            />
            <p className="text-[11px] text-text-secondary mt-1">Used for Geofencing validation, Live Location Tracking, and Address Geocoding APIs.</p>
          </div>
        </div>

        {/* AWS S3 Cloud Storage Integration */}
        <div className="p-5 border border-border/70 rounded-sm bg-surface-variant/20 space-y-4">
          <div className="flex items-center justify-between border-b border-border/50 pb-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-text-primary flex items-center gap-2">
              <Cloud size={16} className="text-amber-500" />
              AWS S3 Cloud Storage
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>AWS Access Key ID</label>
              <input
                type={showKeys ? 'text' : 'password'}
                value={integrations.awsAccessKeyId}
                onChange={(e) => setIntegrations((prev) => ({ ...prev, awsAccessKeyId: e.target.value }))}
                className={inputCls}
                placeholder="AKIA..."
              />
            </div>

            <div>
              <label className={labelCls}>AWS Secret Access Key</label>
              <input
                type={showKeys ? 'text' : 'password'}
                value={integrations.awsSecretAccessKey}
                onChange={(e) => setIntegrations((prev) => ({ ...prev, awsSecretAccessKey: e.target.value }))}
                className={inputCls}
                placeholder="Enter AWS Secret Key"
              />
            </div>

            <div>
              <label className={labelCls}>AWS Region</label>
              <input
                type="text"
                value={integrations.awsRegion}
                onChange={(e) => setIntegrations((prev) => ({ ...prev, awsRegion: e.target.value }))}
                className={inputCls}
                placeholder="ap-south-1"
              />
            </div>

            <div>
              <label className={labelCls}>S3 Bucket Name</label>
              <input
                type="text"
                value={integrations.awsBucketName}
                onChange={(e) => setIntegrations((prev) => ({ ...prev, awsBucketName: e.target.value }))}
                className={inputCls}
                placeholder="hopkid-hrm-bucket"
              />
            </div>
          </div>
          <p className="text-[11px] text-text-secondary mt-1">Used for storing payslip PDFs, employee avatars, expense receipts, and document attachments.</p>
        </div>

        {/* Warning Banner */}
        <div className="p-4 rounded-sm border border-warning/30 bg-warning/5 flex items-start gap-3">
          <ShieldAlert size={18} className="text-warning shrink-0 mt-0.5" />
          <p className="text-xs text-text-secondary leading-relaxed">
            <strong className="text-text-primary">Super Admin Access Only:</strong> Changes made here immediately override environment variables across all sync background workers and mobile authorization middleware without needing server reboots.
          </p>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary py-3 px-6 text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-primary/10 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving Integration Keys...
              </>
            ) : (
              <>
                <Save size={16} />
                Save Integration Keys
              </>
            )}
          </button>
        </div>
      </form>
    </SettingsSection>
  );
}
