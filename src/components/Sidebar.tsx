'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { toggleSidebar } from '../store/slices/sidebarSlice';
import { logout } from '../store/slices/authSlice';
import SignOutModal from './SignOutModal';
import {
  Users,
  UserSquare2,
  CreditCard,
  Wallet,
  BarChart3,
  FileText,
  Bell,
  User,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Calendar,
  CheckSquare,
  MapPin,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getLoginPathForPortal } from '@/lib/portals';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface MenuItem {
  name: string;
  icon: LucideIcon;
  path: string;
}

const platformMenuItems: MenuItem[] = [
  { name: 'HR Management', icon: Users, path: '/hr-management' },
  { name: 'Employee Rights', icon: ShieldCheck, path: '/user-rights' },
  { name: 'Employees', icon: UserSquare2, path: '/employees' },
  { name: 'Leave Management', icon: Calendar, path: '/leave' },
  { name: 'Task Management', icon: CheckSquare, path: '/tasks' },
  { name: 'Live Location', icon: MapPin, path: '/location' },
  { name: 'Payroll', icon: Wallet, path: '/payroll' },
  { name: 'Attendance', icon: CreditCard, path: '/attendance' },
  { name: 'Analytics', icon: BarChart3, path: '/analytics' },
  { name: 'Reports', icon: FileText, path: '/reports' },
  { name: 'Notifications', icon: Bell, path: '/notifications' },
];

const accountMenuItems: MenuItem[] = [
  { name: 'Profile', icon: User, path: '/profile' },
];

function NavItem({
  item,
  isActive,
  isOpen,
}: {
  item: MenuItem;
  isActive: boolean;
  isOpen: boolean;
}) {
  return (
    <Link
      href={item.path}
      className={cn(
        'sidebar-nav-item group',
        !isOpen && 'sidebar-nav-item-collapsed',
        isActive
          ? 'bg-primary text-white shadow-lg shadow-primary/20'
          : 'text-text-secondary hover:bg-surface-variant text-muted'
      )}
    >
      <item.icon className="w-5 h-5 flex-shrink-0" />
      {isOpen && (
        <motion.span
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-nav whitespace-nowrap"
        >
          {item.name}
        </motion.span>
      )}
      {!isOpen && (
        <div className="absolute left-full ml-6 px-3 py-2 bg-text-primary text-surface text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[60]">
          {item.name}
        </div>
      )}
    </Link>
  );
}

const Sidebar = () => {
  const { isOpen } = useAppSelector((state) => state.sidebar);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSignOut = () => {
    setIsSignOutModalOpen(false);
    dispatch(logout());
    router.push(getLoginPathForPortal('platform_admin'));
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-secondary/50 backdrop-blur-sm z-40 md:hidden transition-all duration-300"
          onClick={() => dispatch(toggleSidebar())}
        />
      )}

      <motion.aside
        initial={false}
        animate={{
          width: isOpen ? 280 : isMobile ? 0 : 80,
          x: isMobile && !isOpen ? -280 : 0,
        }}
        className={cn(
          'sidebar-panel fixed md:relative bg-surface border-r border-border transition-colors duration-300 z-50',
          !isOpen && 'md:items-center overflow-hidden'
        )}
      >
        <div className="sidebar-brand-wrap">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/30">
            <span className="text-white font-semibold text-sm">HRM</span>
          </div>
          {isOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-w-0">
              <p className="sidebar-brand leading-tight">Admin Panel</p>
              <p className="text-micro font-medium text-primary uppercase tracking-wide mt-0.5">
                Platform Operations
              </p>
            </motion.div>
          )}
        </div>

        <nav className="sidebar-nav">
          {platformMenuItems.map((item) => (
            <NavItem
              key={item.path}
              item={item}
              isActive={pathname === item.path}
              isOpen={isOpen}
            />
          ))}
        </nav>

        <div className="sidebar-footer">
          {accountMenuItems.map((item) => (
            <NavItem
              key={item.path}
              item={item}
              isActive={pathname === item.path}
              isOpen={isOpen}
            />
          ))}
        </div>

        <div className="sidebar-footer">
          <button
            type="button"
            onClick={() => dispatch(toggleSidebar())}
            className={cn(
              'sidebar-nav-item text-text-secondary hover:bg-surface-variant',
              !isOpen && 'sidebar-nav-item-collapsed'
            )}
          >
            {isOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            {isOpen && <span className="text-nav text-text-primary">Collapse Menu</span>}
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

export default Sidebar;
