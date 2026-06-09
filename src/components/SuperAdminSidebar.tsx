'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleSidebar, setSidebarOpen } from '@/store/slices/sidebarSlice';
import { logout } from '@/store/slices/authSlice';
import SignOutModal from './SignOutModal';
import {
  User,
  ChevronLeft,
  ChevronRight,
  LogOut,
  type LucideIcon,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getLoginPathForPortal, SUPER_ADMIN_PREFIX } from '@/lib/portals';
import { useIsMobile } from '@/hooks/useIsMobile';
import { SUPER_ADMIN_MENU_ITEMS } from '@/lib/sidebarMenus';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface MenuItem {
  name: string;
  icon: LucideIcon;
  path: string;
  moduleId: string;
}

function NavItem({
  item,
  isActive,
  isOpen,
  onNavigate,
}: {
  item: MenuItem;
  isActive: boolean;
  isOpen: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={item.path}
      onClick={onNavigate}
      data-active={isActive ? 'true' : undefined}
      className={cn(
        'sidebar-nav-item group',
        !isOpen && 'sidebar-nav-item-collapsed'
      )}
    >
      <item.icon
        className="w-[18px] h-[18px] flex-shrink-0 shrink-0"
        style={{ color: isActive ? '#14B8A6' : '#94A3B8' }}
      />
      {isOpen && (
        <motion.span
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          style={{ whiteSpace: 'nowrap' }}
        >
          {item.name}
        </motion.span>
      )}
      {!isOpen && (
        <div
          className="absolute left-full ml-3 px-2.5 py-1.5 text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[999] shadow-xl"
          style={{ backgroundColor: '#1E293B', color: '#F8FAFC', border: '1px solid #334155', fontSize: '12px' }}
        >
          {item.name}
        </div>
      )}
    </Link>
  );
}

const SuperAdminSidebar = () => {
  const { isOpen } = useAppSelector((state) => state.sidebar);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'editor';
  const isMobile = useIsMobile();
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);

  const isItemActive = (itemPath: string) => {
    const [pathPart, queryPart] = itemPath.split('?');
    if (pathname !== pathPart) return false;
    if (!queryPart) return true;
    const urlParams = new URLSearchParams(queryPart);
    const tabParam = urlParams.get('tab');
    return tabParam === currentTab;
  };

  const closeMobileSidebar = () => {
    if (isMobile) dispatch(setSidebarOpen(false));
  };

  const handleSignOut = () => {
    setIsSignOutModalOpen(false);
    dispatch(logout());
    router.push(getLoginPathForPortal('super_admin'));
  };

  const isProfileActive =
    pathname === `${SUPER_ADMIN_PREFIX}/profile` ||
    pathname === `${SUPER_ADMIN_PREFIX}/profile/edit`;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-all duration-300"
          onClick={() => dispatch(toggleSidebar())}
        />
      )}

      <motion.aside
        initial={false}
        animate={{
          width: isOpen ? 260 : isMobile ? 0 : 68,
          x: isMobile && !isOpen ? -260 : 0,
        }}
        className={cn(
          'sidebar-panel fixed md:relative border-r z-50',
          !isOpen && 'md:items-center'
        )}
        style={{ borderRightColor: '#1E293B' }}
      >
        <div className="sidebar-brand-wrap">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/30">
            <span className="text-white font-semibold text-sm">HRM</span>
          </div>
          {isOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-w-0">
              <p className="sidebar-brand leading-tight">Super HRM</p>
              <p style={{ fontSize: '11px', fontWeight: 500, color: '#14B8A6', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '4px' }}>
                Ecosystem Control
              </p>
            </motion.div>
          )}
        </div>

        <nav className="sidebar-nav">
          {SUPER_ADMIN_MENU_ITEMS.map((item) => (
            <NavItem
              key={item.path}
              item={item}
              isActive={isItemActive(item.path)}
              isOpen={isOpen}
              onNavigate={closeMobileSidebar}
            />
          ))}
        </nav>

        <div className="sidebar-footer">
          <Link
            href={`${SUPER_ADMIN_PREFIX}/profile`}
            onClick={closeMobileSidebar}
            data-active={isProfileActive ? 'true' : undefined}
            className={cn(
              'sidebar-nav-item group',
              !isOpen && 'sidebar-nav-item-collapsed'
            )}
          >
            <User
              className="w-[18px] h-[18px] flex-shrink-0 shrink-0"
              style={{ color: isProfileActive ? '#14B8A6' : '#94A3B8' }}
            />
            {isOpen && <span style={{ whiteSpace: 'nowrap' }}>Profile</span>}
          </Link>
        </div>

        <div className="sidebar-footer">
          <button
            type="button"
            onClick={() => dispatch(toggleSidebar())}
            className={cn(
              'sidebar-nav-item hidden md:flex',
              !isOpen && 'sidebar-nav-item-collapsed'
            )}
          >
            {isOpen ? <ChevronLeft className="w-[18px] h-[18px]" /> : <ChevronRight className="w-[18px] h-[18px]" />}
            {isOpen && <span style={{ whiteSpace: 'nowrap' }}>Collapse Menu</span>}
          </button>

          <button
            type="button"
            onClick={() => setIsSignOutModalOpen(true)}
            className={cn(
              'sidebar-nav-item',
              !isOpen && 'sidebar-nav-item-collapsed'
            )}
            style={{ color: '#EF4444' }}
          >
            <LogOut className="w-[18px] h-[18px]" />
            {isOpen && <span style={{ whiteSpace: 'nowrap', color: '#EF4444' }}>Sign Out</span>}
          </button>
        </div>

        <SignOutModal
          isOpen={isSignOutModalOpen}
          onClose={() => setIsSignOutModalOpen(false)}
          onConfirm={handleSignOut}
        />
      </motion.aside>
    </>
  );
};

export default SuperAdminSidebar;
