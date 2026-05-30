import { Suspense } from 'react';
import LocationPage from '@/features/location/pages/LocationPage';

export default function SuperAdminLocationPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs font-bold text-text-secondary uppercase tracking-widest animate-pulse">Loading Live Location...</div>}>
      <LocationPage />
    </Suspense>
  );
}
