'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleSidebar } from '@/store/slices/sidebarSlice';
import { logout } from '@/store/slices/authSlice';
import SignOutModal from './SignOutModal';
import {
  LayoutDashboard,
  Building2,
  CreditCard,
  Settings,
  User,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getLoginPathForPortal, SUPER_ADMIN_PREFIX } from '@/lib/portals';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface MenuItem {
  name: string;
  icon: LucideIcon;
  path: string;
}

const superAdminMenuItems: MenuItem[] = [
  { name: 'Dashboard', icon: LayoutDashboard, path: SUPER_ADMIN_PREFIX },
  { name: 'Companies', icon: Building2, path: `${SUPER_ADMIN_PREFIX}/companies` },
  { name: 'Subscriptions', icon: CreditCard, path: `${SUPER_ADMIN_PREFIX}/subscriptions` },
  { name: 'Admin Rights', icon: ShieldCheck, path: `${SUPER_ADMIN_PREFIX}/user-rights` },
  { name: 'Settings', icon: Settings, path: `${SUPER_ADMIN_PREFIX}/settings` },
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
          ? 'bg-secondary text-white shadow-lg shadow-secondary/20'
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

const SuperAdminSidebar = () => {
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
    router.push(getLoginPathForPortal('super_admin'));
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
          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0 shadow-lg shadow-secondary/30">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          {isOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-w-0">
              <p className="sidebar-brand leading-tight">Super Admin</p>
              <p className="text-micro font-medium text-secondary uppercase tracking-wide mt-0.5">
                Ecosystem Control
              </p>
            </motion.div>
          )}
        </div>

        <nav className="sidebar-nav">
          {superAdminMenuItems.map((item) => (
            <NavItem
              key={item.path}
              item={item}
              isActive={pathname === item.path}
              isOpen={isOpen}
            />
          ))}
        </nav>

        <div className="sidebar-footer">
          <Link
            href={`${SUPER_ADMIN_PREFIX}/profile`}
            className={cn(
              'sidebar-nav-item group',
              !isOpen && 'sidebar-nav-item-collapsed',
              pathname === `${SUPER_ADMIN_PREFIX}/profile`
                ? 'bg-secondary text-white shadow-lg shadow-secondary/20'
                : 'text-text-secondary hover:bg-surface-variant text-muted'
            )}
          >
            <User className="w-5 h-5 flex-shrink-0" />
            {isOpen && <span className="text-nav whitespace-nowrap">Profile</span>}
          </Link>
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

export default SuperAdminSidebar;
