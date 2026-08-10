'use client';

import React, { useState } from 'react';
import CommissionDashboard from '@/features/commission/pages/CommissionDashboard';
import CommissionReports from '@/features/commission/pages/CommissionReports';
import WebhookLogsPage from '@/features/commission/pages/WebhookLogsPage';
import { cn } from '@/utils/cn';

export default function CommissionPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'report' | 'webhooks'>('dashboard');

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={cn(
            "px-6 py-3 font-bold text-sm border-b-2 transition-all",
            activeTab === 'dashboard'
              ? "border-primary text-primary"
              : "border-transparent text-text-secondary hover:text-text-primary"
          )}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('report')}
          className={cn(
            "px-6 py-3 font-bold text-sm border-b-2 transition-all",
            activeTab === 'report'
              ? "border-primary text-primary"
              : "border-transparent text-text-secondary hover:text-text-primary"
          )}
        >
          Commission Report
        </button>
        <button
          onClick={() => setActiveTab('webhooks')}
          className={cn(
            "px-6 py-3 font-bold text-sm border-b-2 transition-all",
            activeTab === 'webhooks'
              ? "border-primary text-primary"
              : "border-transparent text-text-secondary hover:text-text-primary"
          )}
        >
          Webhook Audit Logs
        </button>
      </div>

      {activeTab === 'dashboard' ? (
        <CommissionDashboard />
      ) : activeTab === 'report' ? (
        <CommissionReports />
      ) : (
        <WebhookLogsPage />
      )}
    </div>
  );
}
