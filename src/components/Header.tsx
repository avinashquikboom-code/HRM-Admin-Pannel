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
  Search, 
  ChevronDown,
  Settings,
  User,
  ArrowRight,
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

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // ... (keep search logic)

  const loginLocation = user?.profile?.security?.lastLoginLocation;

  const filteredCompanies: any[] = [];
  const filteredEmployees: any[] = [];

  const hasResults = filteredCompanies.length > 0 || filteredEmployees.length > 0;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
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

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('global-search') as HTMLInputElement;
        searchInput?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const closeSearch = () => {
    setIsSearchFocused(false);
    setIsMobileSearchOpen(false);
    setSearchQuery('');
  };

  const searchResultsContent = searchQuery ? (
    <div className="p-2">
      {hasResults ? (
        <>
          {filteredCompanies.length > 0 && (
            <div className="mb-2">
              <p className="px-4 py-2 text-label font-bold text-muted">Companies</p>
              {filteredCompanies.map((company) => (
                <button
                  key={company.id}
                  onClick={() => {
                    router.push(`${SUPER_ADMIN_PREFIX}/companies`);
                    closeSearch();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-variant rounded-2xl transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {company.logo}
                  </div>
                  <div className="text-left flex-grow min-w-0">
                    <p className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors truncate">
                      {company.name}
                    </p>
                    <p className="text-xs text-text-secondary truncate">
                      {company.plan} • {company.employees} Employees
                    </p>
                  </div>
                  <ArrowRight
                    size={14}
                    className="text-muted/30 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 shrink-0"
                  />
                </button>
              ))}
            </div>
          )}

          {filteredEmployees.length > 0 && (
            <div>
              <p className="px-4 py-2 text-label font-bold text-muted">Employees</p>
              {filteredEmployees.map((employee) => (
                <button
                  key={employee.id}
                  onClick={() => {
                    router.push('/employees');
                    closeSearch();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-variant rounded-2xl transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-bold">
                    {employee.avatar}
                  </div>
                  <div className="text-left flex-grow min-w-0">
                    <p className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors truncate">
                      {employee.name}
                    </p>
                    <p className="text-xs text-text-secondary truncate">
                      {employee.role} at {employee.company}
                    </p>
                  </div>
                  <ArrowRight
                    size={14}
                    className="text-muted/30 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 shrink-0"
                  />
                </button>
              ))}
            </div>
          )}

          <button
            onClick={() => {
              router.push('/analytics');
              closeSearch();
            }}
            className="w-full mt-2 p-3 text-center text-xs font-bold text-primary hover:bg-primary/5 rounded-2xl transition-colors border-t border-border"
          >
            View all results for "{searchQuery}"
          </button>
        </>
      ) : (
        <div className="px-6 py-8 text-center">
          <div className="w-12 h-12 bg-surface-variant rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Search size={20} className="text-muted" />
          </div>
          <p className="text-sm font-semibold text-text-primary">No results found</p>
          <p className="text-xs text-text-secondary mt-1">Try searching for a different name or company.</p>
        </div>
      )}
    </div>
  ) : null;

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between h-16 md:h-20 px-3 sm:px-6 bg-[var(--header-bg)] backdrop-blur-xl border-b border-border transition-colors text-[var(--header-text)]">
      <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
        {/* Mobile Menu Toggle */}
        <button 
          onClick={() => dispatch(toggleSidebar())}
          className="p-2.5 rounded-xl hover:bg-surface-variant text-text-secondary md:hidden transition-colors shrink-0"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Search Bar — hidden for employee self-service portal */}
        {!isEmployee && (
        <>
        <div ref={searchRef} className="relative hidden md:block flex-1 max-w-md lg:max-w-lg xl:max-w-xl">
        <div className="flex items-center gap-3 w-full bg-surface-variant px-6 py-1.5 rounded-2xl border border-transparent focus-within:border-primary/30 focus-within:bg-surface focus-within:shadow-lg focus-within:shadow-primary/5 transition-all group">
          <Search className="w-5 h-5 text-muted group-focus-within:text-primary transition-colors shrink-0" />
          <input 
            id="global-search"
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            placeholder="Search analytics, companies..." 
            className="bg-transparent border-none outline-none text-sm text-text-primary w-full min-w-0 placeholder:text-muted"
          />
          <div className="hidden lg:flex items-center gap-1 px-2 py-1 bg-surface border border-border rounded-lg shadow-sm shrink-0">
            <span className="text-micro font-bold text-muted">⌘</span>
            <span className="text-micro font-bold text-muted">K</span>
          </div>
        </div>
        <AnimatePresence>
          {isSearchFocused && searchResultsContent && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute top-full left-0 right-0 mt-3 bg-surface border border-border rounded-3xl shadow-2xl shadow-primary/10 overflow-hidden z-50 max-h-[60vh] overflow-y-auto"
            >
              {searchResultsContent}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <button
        type="button"
        onClick={() => setIsMobileSearchOpen(true)}
        className="p-2.5 rounded-xl hover:bg-surface-variant text-text-secondary md:hidden transition-colors shrink-0"
        aria-label="Search"
      >
        <Search className="w-5 h-5" />
      </button>
        </>
        )}
    </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        <NotificationBell />

        {/* Dark Mode Toggle */}
        <button
          onClick={() => dispatch(toggleDarkMode())}
          className="p-2.5 rounded-xl hover:bg-surface-variant text-text-secondary transition-colors"
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
                    className="w-10 h-10 rounded-full bg-surface object-cover border-2 border-surface shadow-sm"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success border-2 border-surface rounded-full shadow-sm"></div>
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
                className="absolute right-0 mt-3 w-[min(18rem,calc(100vw-2rem))] bg-surface/95 backdrop-blur-xl border border-border rounded-[28px] shadow-2xl shadow-primary/10 overflow-hidden z-50 p-2"
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
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary/5 rounded-2xl transition-all group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary group-hover:scale-110 transition-transform">
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
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary/5 rounded-2xl transition-all group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
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
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-error/5 rounded-2xl transition-all group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-error/10 flex items-center justify-center text-error group-hover:scale-110 transition-transform">
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

      {/* Mobile search overlay */}
      <AnimatePresence>
        {!isEmployee && isMobileSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-md md:hidden"
          >
            <div className="p-4 pt-[max(1rem,env(safe-area-inset-top))]">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted w-5 h-5" />
                  <input
                    autoFocus
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    placeholder="Search analytics, companies..."
                    className="w-full pl-12 pr-4 py-3.5 bg-surface-variant border border-border rounded-2xl outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileSearchOpen(false);
                    setIsSearchFocused(false);
                    setSearchQuery('');
                  }}
                  className="px-4 py-3.5 text-sm font-bold text-primary shrink-0"
                >
                  Cancel
                </button>
              </div>
              {searchQuery && (
                <div className="bg-surface border border-border rounded-3xl overflow-hidden max-h-[calc(100vh-8rem)] overflow-y-auto">
                  {searchResultsContent}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
