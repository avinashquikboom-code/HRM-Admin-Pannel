'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { toggleDarkMode } from '../store/slices/themeSlice';
import { logout } from '../store/slices/authSlice';
import SignOutModal from './SignOutModal';
import { toggleSidebar } from '../store/slices/sidebarSlice';
import NotificationBell from './NotificationBell';
import { 
  Sun, 
  Moon, 
  ChevronDown,
  Settings,
  User,
  Menu,
  LogOut,
  MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PortalType, getLoginPathForPortal, SUPER_ADMIN_PREFIX, EMPLOYEE_PREFIX } from '@/lib/portals';
import { PORTAL_AUTH_KEYS } from '@/lib/authStorage';

interface HeaderProps {
  portal?: PortalType;
}

const Header = ({ portal = 'platform_admin' }: HeaderProps) => {
  const { darkMode } = useAppSelector((state) => state.theme);
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const isSuperAdmin = portal === 'super_admin';
  const isEmployee = portal === 'employee';
  const profilePath = isSuperAdmin
    ? `${SUPER_ADMIN_PREFIX}/profile`
    : isEmployee
      ? `${EMPLOYEE_PREFIX}/profile`
      : '/profile';
  const settingsPath = `${SUPER_ADMIN_PREFIX}/settings`;
  const roleLabel = PORTAL_AUTH_KEYS[portal].displayName;
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const loginLocation = user?.profile?.security?.lastLoginLocation;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = () => {
    setIsSignOutModalOpen(false);
    dispatch(logout());
    router.push(getLoginPathForPortal(portal));
  };



  return (
    <header className="sticky top-0 z-40 flex items-center justify-between h-28 md:h-36 px-3 sm:px-6 bg-[var(--header-bg)] backdrop-blur-xl border-b border-border transition-colors text-[var(--header-text)]">
      <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
        {/* Mobile Menu Toggle */}
        <button 
          onClick={() => dispatch(toggleSidebar())}
          className="p-2.5 rounded-sm hover:bg-surface-variant text-text-secondary md:hidden transition-colors shrink-0"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>


    </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        <NotificationBell />

        {/* Dark Mode Toggle */}
        <button
          onClick={() => dispatch(toggleDarkMode())}
          className="p-2.5 rounded-sm hover:bg-surface-variant text-text-secondary transition-colors"
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Divider */}
        <div className="h-8 w-px bg-border mx-1 sm:mx-2 hidden sm:block"></div>
        
        {/* User Profile */}
        <div ref={profileRef} className="relative">
          <div className="flex items-center gap-1">
            <div 
              onClick={() => router.push(profilePath)}
              className="flex items-center gap-3 pl-2 cursor-pointer group"
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors leading-tight">{user?.name || roleLabel}</p>
                <p className="text-micro font-black text-primary uppercase tracking-[0.15em] opacity-80">{roleLabel}</p>
              </div>
              <div className="relative">
                <div className="p-0.5 rounded-full bg-gradient-to-tr from-primary to-secondary group-hover:scale-105 transition-transform duration-300">
                  <img 
                    src={user?.avatar || '/favicon.svg'} 
                    alt="Avatar" 
                    className="w-10 h-10 rounded-full bg-surface object-cover border-2 border-surface"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success border-2 border-surface rounded-full"></div>
              </div>
            </div>
            
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="p-1 hover:bg-surface-variant rounded-lg transition-colors text-muted hover:text-primary"
            >
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <AnimatePresence>
            {isProfileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-3 w-[min(18rem,calc(100vw-2rem))] bg-surface/95 backdrop-blur-xl border border-border rounded-[28px] overflow-hidden z-50 p-2"
              >
                <div className="p-5 border-b border-border/50 mb-2 bg-surface-variant/30 rounded-t-[20px]">
                  <p className="text-label text-primary mb-1">Authenticated As</p>
                  <p className="text-sm font-bold text-text-primary truncate">{user?.name || 'Super Admin'}</p>
                  <p className="text-xs text-text-secondary truncate mt-0.5 font-medium">{user?.email || 'admin@hrm.ai'}</p>
                  {loginLocation && !isSuperAdmin && (
                    <p className="text-micro text-primary truncate mt-1 font-bold flex items-center gap-1">
                      <MapPin size={10} className="shrink-0" />
                      Logged in from {loginLocation}
                    </p>
                  )}
                </div>
                
                <div className="space-y-1">
                  {isSuperAdmin && (
                    <button
                      onClick={() => {
                        router.push(settingsPath);
                        setIsProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary/5 rounded-sm transition-all group"
                    >
                      <div className="w-9 h-9 rounded-sm bg-secondary/10 flex items-center justify-center text-secondary group-hover:scale-110 transition-transform">
                        <Settings size={18} />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors">Settings</p>
                        <p className="text-micro text-text-secondary">Super Admin configuration</p>
                      </div>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      router.push(profilePath);
                      setIsProfileOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary/5 rounded-sm transition-all group"
                  >
                    <div className="w-9 h-9 rounded-sm bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <User size={18} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors">My Profile</p>
                      <p className="text-micro text-text-secondary">View and edit personal info</p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setIsSignOutModalOpen(true);
                      setIsProfileOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-error/5 rounded-sm transition-all group"
                  >
                    <div className="w-9 h-9 rounded-sm bg-error/10 flex items-center justify-center text-error group-hover:scale-110 transition-transform">
                      <LogOut size={18} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-error">Sign Out</p>
                      <p className="text-micro text-error/60">Securely end your session</p>
                    </div>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <SignOutModal 
        isOpen={isSignOutModalOpen} 
        onClose={() => setIsSignOutModalOpen(false)} 
        onConfirm={handleSignOut} 
      />


    </header>
  );
};

export default Header;
