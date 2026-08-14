'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { toggleSidebar, setSidebarOpen } from '../store/slices/sidebarSlice';
import { logout } from '../store/slices/authSlice';
import SignOutModal from './SignOutModal';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LogOut,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getLoginPathForPortal } from '@/lib/portals';
import { useIsMobile } from '@/hooks/useIsMobile';
import { usePermissions } from '@/hooks/usePermissions';
import {
  PLATFORM_ADMIN_ACCOUNT_ITEMS,
  PLATFORM_ADMIN_MENU_GROUPS,
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
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(item.path);
    if (onNavigate) onNavigate();
  };

  return (
    <Link
      href={item.path}
      onClick={handleClick}
      data-active={isActive ? 'true' : undefined}
      className={cn(
        'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-xs font-semibold select-none',
        isActive
          ? 'bg-teal-500/10 dark:bg-teal-500/15 text-teal-700 dark:text-teal-400 font-bold border-l-4 border-teal-500 shadow-sm shadow-teal-500/5'
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100',
        !isOpen && 'justify-center px-0 py-3'
      )}
    >
      <item.icon
        className={cn(
          'w-4 h-4 flex-shrink-0 transition-transform duration-200 group-hover:scale-110',
          isActive ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'
        )}
      />

      {isOpen && (
        <motion.span
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -6 }}
          className="truncate whitespace-nowrap"
        >
          {item.name}
        </motion.span>
      )}

      {!isOpen && (
        <div className="absolute left-full ml-3 px-3 py-1.5 text-xs font-medium bg-slate-900 text-white rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap shadow-xl border border-slate-800 z-[999]">
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
  const pathname = usePathname();
  const { filterMenuItems } = usePermissions('platform_admin', user?.email);

  const visibleGroups = PLATFORM_ADMIN_MENU_GROUPS.map((group) => {
    const items = stripRemovedAdminModules(filterMenuItems(group.items));
    return { ...group, items };
  }).filter((group) => group.items.length > 0);

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    PLATFORM_ADMIN_MENU_GROUPS.forEach((g) => {
      initial[g.title] = true;
    });
    return initial;
  });

  // Ensure category containing current active route is open
  useEffect(() => {
    visibleGroups.forEach((g) => {
      if (g.items.some((item) => item.path === pathname)) {
        setOpenGroups((prev) => ({ ...prev, [g.title]: true }));
      }
    });
  }, [pathname]);

  const toggleGroup = (title: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [title]: !(prev[title] ?? true),
    }));
  };

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
    console.log('🚪 [SIDEBAR] Sign out initiated for user:', user?.email);
    dispatch(logout());
    window.location.href = getLoginPathForPortal('platform_admin');
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden transition-all duration-300"
          onClick={() => dispatch(toggleSidebar())}
        />
      )}

      <motion.aside
        initial={false}
        animate={{
          width: isOpen ? 260 : isMobile ? 0 : 72,
          x: isMobile && !isOpen ? -260 : 0,
        }}
        className={cn(
          'sidebar-panel fixed md:relative h-screen bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800/80 z-50 flex flex-col justify-between select-none transition-all duration-300 shadow-sm'
        )}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 via-teal-600 to-emerald-700 flex items-center justify-center flex-shrink-0 shadow-lg shadow-teal-500/20 text-white">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="min-w-0 flex-1"
            >
              <h1 className="font-extrabold text-sm text-slate-900 dark:text-white tracking-tight leading-none">
                HOPKID <span className="text-teal-600 dark:text-teal-400">Admin</span>
              </h1>
              <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-wider">
                Platform Operations
              </p>
            </motion.div>
          )}
        </div>

        {/* Scrollable Navigation Items */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-4 custom-scrollbar">
          {visibleGroups.map((group) => {
            const isGroupOpen = openGroups[group.title] ?? true;
            return (
              <div key={group.title} className="space-y-1">
                {isOpen ? (
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.title)}
                    className="w-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 hover:text-teal-600 dark:hover:text-teal-400 flex items-center justify-between gap-1.5 transition-colors group/header text-left"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <group.icon className="w-3.5 h-3.5 text-teal-600/70 dark:text-teal-400/70 flex-shrink-0" />
                      <span className="truncate">{group.title}</span>
                    </div>
                    <motion.div
                      animate={{ rotate: isGroupOpen ? 0 : -90 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover/header:text-teal-600 dark:group-hover/header:text-teal-400" />
                    </motion.div>
                  </button>
                ) : (
                  <div className="my-2 border-t border-slate-200/60 dark:border-slate-800/80" />
                )}

                <AnimatePresence initial={false}>
                  {(isGroupOpen || !isOpen) && (
                    <motion.div
                      initial={isOpen ? { height: 0, opacity: 0 } : false}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={isOpen ? { height: 0, opacity: 0 } : undefined}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      className={cn('space-y-1', isOpen && 'pl-1')}
                    >
                      {group.items.map((item) => (
                        <NavItem
                          key={item.path}
                          item={item}
                          isActive={pathname === item.path}
                          isOpen={isOpen}
                          onNavigate={closeMobileSidebar}
                        />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Footer & User Profile Section */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
          {isOpen && user && (
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/60 shadow-sm">
              <div className="relative flex-shrink-0">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-teal-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xs shadow-md">
                  {user.name?.charAt(0).toUpperCase() || 'P'}
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-800" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                  {user.name || 'Priya Sharma'}
                </p>
                <p className="text-[10px] font-semibold text-teal-600 dark:text-teal-400 truncate">
                  {user.role || 'HR Admin'}
                </p>
              </div>
            </div>
          )}

          <div className="space-y-1 pt-1">
            {visibleAccountItems.map((item) => (
              <NavItem
                key={item.path}
                item={item}
                isActive={pathname === item.path}
                isOpen={isOpen}
                onNavigate={closeMobileSidebar}
              />
            ))}

            {/* Collapse Toggle */}
            <button
              type="button"
              onClick={() => dispatch(toggleSidebar())}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200 transition-colors',
                !isOpen && 'justify-center px-0'
              )}
            >
              {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              {isOpen && <span>Collapse Menu</span>}
            </button>

            {/* Sign Out Button */}
            <button
              type="button"
              onClick={() => setIsSignOutModalOpen(true)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-500/10 hover:text-rose-600 transition-colors',
                !isOpen && 'justify-center px-0'
              )}
            >
              <LogOut className="w-4 h-4" />
              {isOpen && <span>Sign Out</span>}
            </button>
          </div>
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
