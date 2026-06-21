'use client';

import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import LoginLocationBanner from '@/components/LoginLocationBanner';
import SidebarResponsiveInit from '@/components/SidebarResponsiveInit';
import { usePathname } from 'next/navigation';

export default function AdminRouteLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <SidebarResponsiveInit />
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div id="app-content-area" className="relative flex flex-col flex-1 min-w-0 overflow-y-auto overflow-x-hidden">
        {/* Header */}
        <Header portal="platform_admin" />

        {/* Page Content */}
        <main className="flex-grow p-3 sm:p-4 md:p-6 lg:p-8">
          <LoginLocationBanner />
          <div key={pathname}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
