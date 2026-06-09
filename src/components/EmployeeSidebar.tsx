'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleSidebar, setSidebarOpen } from '@/store/slices/sidebarSlice';
import { logout } from '@/store/slices/authSlice';
import SignOutModal from './SignOutModal';
import {
  LayoutDashboard,
  CreditCard,
  Calendar,
  CheckSquare,
  User,
  ChevronLeft,
  ChevronRight,
  LogOut,
  type LucideIcon,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getLoginPathForPortal, EMPLOYEE_PREFIX } from '@/lib/portals';
import { useIsMobile } from '@/hooks/useIsMobile';
import { usePermissions } from '@/hooks/usePermissions';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface MenuItem {
  name: string;
  icon: LucideIcon;
  path: string;
  moduleId: string;
}

const employeeMenuItems: MenuItem[] = [
  { name: 'My Dashboard', icon: LayoutDashboard, path: EMPLOYEE_PREFIX, moduleId: 'em-dashboard' },
  { name: 'My Attendance', icon: CreditCard, path: `${EMPLOYEE_PREFIX}/attendance`, moduleId: 'em-attendance' },
  { name: 'My Leave', icon: Calendar, path: `${EMPLOYEE_PREFIX}/leave`, moduleId: 'em-leave' },
  { name: 'My Tasks', icon: CheckSquare, path: `${EMPLOYEE_PREFIX}/tasks`, moduleId: 'em-tasks' },
];

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
      className={cn(
        'sidebar-nav-item group',
        !isOpen && 'sidebar-nav-item-collapsed',
        isActive
          ? 'bg-primary/20 text-white border border-primary/40 shadow-sm'
          : 'text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-text'
      )}
    >
      <item.icon className={cn('w-[18px] h-[18px] flex-shrink-0', isActive ? 'text-primary' : 'text-sidebar-muted group-hover:text-sidebar-text')} />
      {isOpen && (
        <motion.span
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-[13px] font-medium whitespace-nowrap"
        >
          {item.name}
        </motion.span>
      )}
      {!isOpen && (
        <div className="absolute left-full ml-4 px-2.5 py-1.5 bg-sidebar-secondary text-sidebar-text text-xs rounded-lg border border-sidebar-hover opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[60] shadow-lg">
          {item.name}
        </div>
      )}
    </Link>
  );
}

const EmployeeSidebar = () => {
  const { isOpen } = useAppSelector((state) => state.sidebar);
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { filterMenuItems } = usePermissions('employee', user?.email);
  const visibleMenuItems = filterMenuItems(employeeMenuItems);
  const visibleProfileItems = filterMenuItems([
    {
      name: 'Profile',
      icon: User,
      path: `${EMPLOYEE_PREFIX}/profile`,
      moduleId: 'em-profile',
    },
  ]);
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);
  const isMobile = useIsMobile();

  const closeMobileSidebar = () => {
    if (isMobile) dispatch(setSidebarOpen(false));
  };

  const handleSignOut = () => {
    setIsSignOutModalOpen(false);
    dispatch(logout());
    router.push(getLoginPathForPortal('employee'));
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
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
          'sidebar-panel fixed md:relative border-r border-sidebar-border z-50',
          !isOpen && 'md:items-center overflow-hidden'
        )}
      >
        <div className="sidebar-brand-wrap">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center flex-shrink-0 shadow-lg shadow-accent/30">
            <User className="w-5 h-5 text-secondary" />
          </div>
          {isOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-w-0">
              <p className="sidebar-brand leading-tight">Employee Portal</p>
              <p className="text-micro font-medium text-accent uppercase tracking-wide mt-0.5">
                Self Service
              </p>
            </motion.div>
          )}
        </div>

        <nav className="sidebar-nav">
          {visibleMenuItems.map((item) => (
            <NavItem
              key={item.path}
              item={item}
              isActive={pathname === item.path}
              isOpen={isOpen}
              onNavigate={closeMobileSidebar}
            />
          ))}
        </nav>

        {visibleProfileItems.length > 0 && (
        <div className="sidebar-footer">
          <NavItem
            item={visibleProfileItems[0]}
            isActive={pathname === `${EMPLOYEE_PREFIX}/profile`}
            isOpen={isOpen}
            onNavigate={closeMobileSidebar}
          />
        </div>
        )}

        <div className="sidebar-footer">
          <button
            type="button"
            onClick={() => dispatch(toggleSidebar())}
            className={cn(
              'sidebar-nav-item text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-text hidden md:flex',
              !isOpen && 'sidebar-nav-item-collapsed'
            )}
          >
            {isOpen ? <ChevronLeft className="w-[18px] h-[18px]" /> : <ChevronRight className="w-[18px] h-[18px]" />}
            {isOpen && <span className="text-[13px] font-medium text-sidebar-muted">Collapse Menu</span>}
          </button>

          <button
            type="button"
            onClick={() => setIsSignOutModalOpen(true)}
            className={cn(
              'sidebar-nav-item text-error hover:bg-error/5',
              !isOpen && 'sidebar-nav-item-collapsed'
            )}
          >
            <LogOut className="w-5 h-5" />
            {isOpen && <span className="text-nav text-error">Sign Out</span>}
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

export default EmployeeSidebar;
