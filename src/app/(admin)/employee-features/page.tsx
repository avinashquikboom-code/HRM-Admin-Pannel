import React from 'react';
import EmployeeFeaturesView from '@/features/access-control/components/EmployeeFeaturesView';

export default function EmployeeFeaturesPage() {
  return (
    <div className="p-6 h-full bg-gray-50/50">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Feature Access Management</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage granular feature access for employees (e.g., punch, remote work, shifts) and approve requests.
        </p>
      </div>
      <EmployeeFeaturesView />
    </div>
  );
}
