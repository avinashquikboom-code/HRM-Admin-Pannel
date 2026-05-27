'use client';

import SuperAdminSidebar from '@/components/SuperAdminSidebar';
import Header from '@/components/Header';
import LoginLocationBanner from '@/components/LoginLocationBanner';
import SidebarResponsiveInit from '@/components/SidebarResponsiveInit';
import { usePathname } from 'next/navigation';

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <SidebarResponsiveInit />
      <SuperAdminSidebar />

      <div className="relative flex flex-col flex-1 min-w-0 overflow-y-auto overflow-x-hidden">
        <Header portal="super_admin" />

        <main className="flex-grow p-3 sm:p-4 md:p-6 lg:p-8">
          <LoginLocationBanner />
          <div key={pathname}>{children}</div>
        </main>
      </div>
    </div>
  );
}
