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
        'relative flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200 group',
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
          'fixed md:relative flex flex-col bg-surface border-r border-border transition-colors duration-300 z-50 h-full',
          !isOpen && 'md:items-center overflow-hidden'
        )}
      >
        <div className="flex items-center gap-3 p-6 mb-2">
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

        <nav className="flex-grow px-4 space-y-1 overflow-y-auto no-scrollbar min-h-0">
          {superAdminMenuItems.map((item) => (
            <NavItem
              key={item.path}
              item={item}
              isActive={pathname === item.path}
              isOpen={isOpen}
            />
          ))}
        </nav>

        <div className="px-4 pb-2 space-y-1 border-t border-border pt-4 shrink-0">
          <Link
            href={`${SUPER_ADMIN_PREFIX}/profile`}
            className={cn(
              'relative flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200 group',
              pathname === `${SUPER_ADMIN_PREFIX}/profile`
                ? 'bg-secondary text-white shadow-lg shadow-secondary/20'
                : 'text-text-secondary hover:bg-surface-variant text-muted'
            )}
          >
            <User className="w-5 h-5 flex-shrink-0" />
            {isOpen && <span className="text-nav whitespace-nowrap">Profile</span>}
          </Link>
        </div>

        <div className="p-4 space-y-1 border-t border-border shrink-0">
          <button
            type="button"
            onClick={() => dispatch(toggleSidebar())}
            className="flex items-center gap-4 w-full px-4 py-3 text-text-secondary hover:bg-surface-variant rounded-2xl transition-all"
          >
            {isOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            {isOpen && <span className="text-nav text-text-primary">Collapse Menu</span>}
          </button>

          <button
            type="button"
            onClick={() => setIsSignOutModalOpen(true)}
            className="flex items-center gap-4 w-full px-4 py-3 text-error hover:bg-error/5 rounded-2xl transition-all"
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
