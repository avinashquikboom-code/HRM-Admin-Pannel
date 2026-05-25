'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { toggleDarkMode } from '../store/slices/themeSlice';
import { logout } from '../store/slices/authSlice';
import SignOutModal from './SignOutModal';
import { 
  Sun, 
  Moon, 
  Search, 
  Bell, 
  ChevronDown,
  User,
  ArrowRight,
  Menu,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockCompanies, mockEmployees } from '../data/mockData';
import { toggleSidebar } from '../store/slices/sidebarSlice';

const Header = () => {
  const { darkMode } = useAppSelector((state) => state.theme);
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // ... (keep search logic)

  const filteredCompanies = searchQuery 
    ? mockCompanies.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 3)
    : [];
  
  const filteredEmployees = searchQuery 
    ? mockEmployees.filter(e => e.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 3)
    : [];

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
    router.push('/login');
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

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between h-20 px-6 bg-surface/80 backdrop-blur-xl border-b border-border transition-colors">
      <div className="flex items-center gap-4">
        {/* Mobile Menu Toggle */}
        <button 
          onClick={() => dispatch(toggleSidebar())}
          className="p-2.5 rounded-xl hover:bg-surface-variant text-text-secondary md:hidden transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Search Bar */}
        <div ref={searchRef} className="relative hidden md:block">
        <div className="flex items-center gap-3 w-96 bg-surface-variant px-4 py-2.5 rounded-2xl border border-transparent focus-within:border-primary/30 focus-within:bg-surface focus-within:shadow-lg focus-within:shadow-primary/5 transition-all group">
          <Search className="w-5 h-5 text-muted group-focus-within:text-primary transition-colors" />
          <input 
            id="global-search"
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            placeholder="Search analytics, companies..." 
            className="bg-transparent border-none outline-none text-sm text-text-primary w-full placeholder:text-muted"
          />
          <div className="hidden lg:flex items-center gap-1 px-2 py-1 bg-surface border border-border rounded-lg shadow-sm">
            <span className="text-[10px] font-bold text-muted">⌘</span>
            <span className="text-[10px] font-bold text-muted">K</span>
          </div>
        </div>

        {/* Search Results Dropdown */}
        <AnimatePresence>
          {isSearchFocused && searchQuery && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute top-full left-0 right-0 mt-3 bg-surface border border-border rounded-3xl shadow-2xl shadow-primary/10 overflow-hidden z-50"
            >
              <div className="p-2">
                {hasResults ? (
                  <>
                    {filteredCompanies.length > 0 && (
                      <div className="mb-2">
                        <p className="px-4 py-2 text-[10px] font-bold text-muted uppercase tracking-widest">Companies</p>
                        {filteredCompanies.map(company => (
                          <button
                            key={company.id}
                            onClick={() => {
                              router.push('/companies');
                              setIsSearchFocused(false);
                              setSearchQuery('');
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-variant rounded-2xl transition-colors group"
                          >
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                              {company.logo}
                            </div>
                            <div className="text-left flex-grow">
                              <p className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors">{company.name}</p>
                              <p className="text-xs text-text-secondary">{company.plan} • {company.employees} Employees</p>
                            </div>
                            <ArrowRight size={14} className="text-muted/30 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                          </button>
                        ))}
                      </div>
                    )}

                    {filteredEmployees.length > 0 && (
                      <div>
                        <p className="px-4 py-2 text-[10px] font-bold text-muted uppercase tracking-widest">Employees</p>
                        {filteredEmployees.map(employee => (
                          <button
                            key={employee.id}
                            onClick={() => {
                              router.push('/employees');
                              setIsSearchFocused(false);
                              setSearchQuery('');
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-variant rounded-2xl transition-colors group"
                          >
                            <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-bold">
                              {employee.avatar}
                            </div>
                            <div className="text-left flex-grow">
                              <p className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors">{employee.name}</p>
                              <p className="text-xs text-text-secondary">{employee.role} at {employee.company}</p>
                            </div>
                            <ArrowRight size={14} className="text-muted/30 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                          </button>
                        ))}
                      </div>
                    )}
                    
                    <button 
                      onClick={() => {
                        router.push('/analytics');
                        setIsSearchFocused(false);
                        setSearchQuery('');
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        {/* Dark Mode Toggle */}
        <button
          onClick={() => dispatch(toggleDarkMode())}
          className="p-2.5 rounded-xl hover:bg-surface-variant text-text-secondary transition-colors"
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notifications */}
        <button 
          onClick={() => router.push('/notifications')}
          className="relative p-2.5 rounded-xl hover:bg-surface-variant text-text-secondary transition-colors"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-surface"></span>
        </button>

        {/* Divider */}
        <div className="h-8 w-px bg-border mx-2"></div>
        
        {/* User Profile */}
        <div ref={profileRef} className="relative">
          <div className="flex items-center gap-1">
            <div 
              onClick={() => router.push('/profile')}
              className="flex items-center gap-3 pl-2 cursor-pointer group"
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors leading-tight">{user?.name || 'Super Admin'}</p>
                <p className="text-[9px] font-black text-primary uppercase tracking-[0.15em] opacity-80">System Controller</p>
              </div>
              <div className="relative">
                <div className="p-0.5 rounded-full bg-gradient-to-tr from-primary to-secondary group-hover:scale-105 transition-transform duration-300">
                  <img 
                    src={user?.avatar || `/assets/admin-avatar.png`} 
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
                className="absolute right-0 mt-3 w-72 bg-surface/95 backdrop-blur-xl border border-border rounded-[28px] shadow-2xl shadow-primary/10 overflow-hidden z-50 p-2"
              >
                <div className="p-5 border-b border-border/50 mb-2 bg-surface-variant/30 rounded-t-[20px]">
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Authenticated As</p>
                  <p className="text-sm font-bold text-text-primary truncate">{user?.name || 'Super Admin'}</p>
                  <p className="text-xs text-text-secondary truncate mt-0.5 font-medium">{user?.email || 'admin@hrm.ai'}</p>
                </div>
                
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      router.push('/profile');
                      setIsProfileOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary/5 rounded-2xl transition-all group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <User size={18} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors">My Profile</p>
                      <p className="text-[10px] text-text-secondary">View and edit personal info</p>
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
                      <p className="text-[10px] text-error/60">Securely end your session</p>
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
