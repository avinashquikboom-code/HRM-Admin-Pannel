'use client';

import DataManagementPanel from '@/features/settings/panels/DataManagementPanel';
import SuperAdminHeader from '@/components/SuperAdminHeader';
import { Database } from 'lucide-react';

export default function DataManagementPage() {
  return (
    <div className="space-y-6 pb-12">
      <SuperAdminHeader
        title="Data Management"
        subtitle="Selective table reset controls, dry-run previews, and audit trails."
        badgeText="SuperAdmin Control"
        badgeIcon={Database}
      />
      <DataManagementPanel />
    </div>
  );
}
