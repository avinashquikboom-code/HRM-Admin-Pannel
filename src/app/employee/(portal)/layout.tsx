'use client';

import EmployeeSidebar from '@/components/EmployeeSidebar';
import Header from '@/components/Header';
import SidebarResponsiveInit from '@/components/SidebarResponsiveInit';
import { usePathname } from 'next/navigation';

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <SidebarResponsiveInit />
      <EmployeeSidebar />
      <div className="relative flex flex-col flex-1 min-w-0 overflow-y-auto overflow-x-hidden">
        <Header portal="employee" />
        <main className="flex-grow p-3 sm:p-4 md:p-6 lg:p-8">
          <div key={pathname}>{children}</div>
        </main>
      </div>
    </div>
  );
}
