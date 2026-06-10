'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { toggleSidebar, setSidebarOpen } from '../store/slices/sidebarSlice';
import { logout } from '../store/slices/authSlice';
import SignOutModal from './SignOutModal';
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  type LucideIcon,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getLoginPathForPortal } from '@/lib/portals';
import { useIsMobile } from '@/hooks/useIsMobile';
import { usePermissions } from '@/hooks/usePermissions';
import {
  PLATFORM_ADMIN_ACCOUNT_ITEMS,
  PLATFORM_ADMIN_MENU_ITEMS,
  stripRemovedAdminModules,
} from '@/lib/sidebarMenus';

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
        className="w-[20px] h-[20px] flex-shrink-0 shrink-0 transition-transform duration-300 group-hover:scale-110"
        style={{ color: isActive ? '#14B8A6' : 'currentColor' }}
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

const Sidebar = () => {
  const { isOpen } = useAppSelector((state) => state.sidebar);
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { filterMenuItems } = usePermissions('platform_admin', user?.email);
  const visiblePlatformItems = stripRemovedAdminModules(
    filterMenuItems(PLATFORM_ADMIN_MENU_ITEMS)
  );
  const visibleAccountItems = stripRemovedAdminModules(
    filterMenuItems(PLATFORM_ADMIN_ACCOUNT_ITEMS)
  );
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);
  const isMobile = useIsMobile();

  const closeMobileSidebar = () => {
    if (isMobile) dispatch(setSidebarOpen(false));
  };

  const handleSignOut = () => {
    setIsSignOutModalOpen(false);
    dispatch(logout());
    router.push(getLoginPathForPortal('platform_admin'));
  };

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
      >
        <div className="sidebar-brand-wrap">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 sidebar-logo">
            <span className="text-white font-semibold text-sm">HRM</span>
          </div>
          {isOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-w-0">
              <p className="sidebar-brand leading-tight">HRM Admin</p>
              <p className="sidebar-subtitle">
                Platform Operations
              </p>
            </motion.div>
          )}
        </div>

        <nav className="sidebar-nav">
          {visiblePlatformItems.map((item) => (
            <NavItem
              key={item.path}
              item={item}
              isActive={pathname === item.path}
              isOpen={isOpen}
              onNavigate={closeMobileSidebar}
            />
          ))}
        </nav>

        <div className="sidebar-footer">
          {isOpen && user && (
            <div className="sidebar-profile-card">
              <div className="sidebar-profile-avatar">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="sidebar-profile-info">
                <p className="sidebar-profile-name">{user.name || 'User'}</p>
                <p className="sidebar-profile-role">{user.role || 'Admin'}</p>
              </div>
            </div>
          )}

          <div className="sidebar-divider" />

          {visibleAccountItems.map((item) => (
            <NavItem
              key={item.path}
              item={item}
              isActive={pathname === item.path}
              isOpen={isOpen}
              onNavigate={closeMobileSidebar}
            />
          ))}

          <div className="sidebar-divider" />

          <button
            type="button"
            onClick={() => dispatch(toggleSidebar())}
            className={cn(
              'sidebar-nav-item hidden md:flex',
              !isOpen && 'sidebar-nav-item-collapsed'
            )}
          >
            {isOpen ? <ChevronLeft className="w-[20px] h-[20px]" /> : <ChevronRight className="w-[20px] h-[20px]" />}
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
            <LogOut className="w-[20px] h-[20px]" />
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

export default Sidebar;
