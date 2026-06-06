"use client";

import { useState, useEffect, useCallback } from 'react';
import { 
  CheckCircle2, 
  Settings, 
  MoreVertical,
  Trash2,
  Building2,
  Wallet,
  RefreshCw,
  Bell,
  X
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  type AdminNotification,
} from '@/services/notificationService';

const getIconForType = (type: string) => {
  switch (type) {
    case 'success': return CheckCircle2;
    case 'error': return Wallet;
    case 'warning': return Settings;
    default: return Bell;
  }
};

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) return `${diffMins} mins ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  return `${diffDays} days ago`;
};

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const loadNotifications = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetchNotifications();
      setNotifications(response.notifications);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
      showSuccessMessage('Notification marked as read');
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true }))
      );
      showSuccessMessage('All notifications marked as read');
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    if (selectedCategory === 'All') return true;
    return notif.type === selectedCategory.toLowerCase();
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="heading-1">System Notifications</h1>
          <p className="text-page-desc mt-1">Stay updated with platform activity and critical system alerts.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
            className={cn(
              "text-sm font-bold px-4 py-2 rounded-xl transition-colors",
              unreadCount > 0 
                ? "text-primary hover:bg-primary/5" 
                : "text-muted cursor-not-allowed"
            )}
          >
            Mark all as read
          </button>
          <button 
            onClick={loadNotifications}
            className="p-2.5 bg-surface-variant text-muted hover:text-primary rounded-xl transition-colors"
            title="Refresh notifications"
          >
            <RefreshCw size={20} className={cn(isLoading && 'animate-spin')} />
          </button>
        </div>
      </div>

      {/* Categories */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
        {['All', 'Success', 'Error', 'Warning', 'Info'].map((cat) => (
          <button 
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              "px-6 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all",
              selectedCategory === cat 
                ? "bg-primary text-white shadow-lg shadow-primary/20" 
                : "bg-surface border border-border text-text-secondary hover:border-primary/30 font-medium"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Success Message Display */}
      <AnimatePresence>
        {successMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-between p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm mb-4"
          >
            <div className="flex items-center gap-3">
              <CheckCircle2 size={18} className="text-emerald-400" />
              <span className="font-medium">{successMessage}</span>
            </div>
            <button 
              onClick={() => setSuccessMessage(null)}
              className="p-1 hover:bg-emerald-500/20 rounded-lg transition-colors"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error State */}
      {error && (
        <div className="glass-card p-6 text-center">
          <p className="text-error mb-4">{error}</p>
          <button 
            onClick={loadNotifications}
            className="text-primary font-bold hover:underline"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && !error && (
        <div className="glass-card p-12 text-center">
          <RefreshCw size={32} className="animate-spin mx-auto mb-4 text-muted" />
          <p className="text-muted">Loading notifications...</p>
        </div>
      )}

      {/* Notifications List */}
      {!isLoading && !error && (
        <div className="space-y-4">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notif, index) => {
              const Icon = getIconForType(notif.type);
              return (
                <motion.div 
                  key={notif.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "glass-card p-6 flex gap-6 relative transition-all group hover:border-primary/20 cursor-pointer",
                    !notif.isRead && "border-l-4 border-l-primary bg-primary/[0.02]"
                  )}
                  onClick={() => !notif.isRead && handleMarkAsRead(notif.id)}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                    notif.type === 'success' && "bg-emerald-500/10 text-emerald-500",
                    notif.type === 'error' && "bg-rose-500/10 text-rose-500",
                    notif.type === 'warning' && "bg-amber-500/10 text-amber-500",
                    notif.type === 'info' && "bg-blue-500/10 text-blue-500"
                  )}>
                    <Icon size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="font-bold text-text-primary group-hover:text-primary transition-colors">
                        {notif.title}
                      </h3>
                      <span className="text-xs text-muted whitespace-nowrap">
                        {formatTimeAgo(notif.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      {notif.message}
                    </p>
                    {notif.employee && (
                      <p className="text-xs text-muted mt-2">
                        Employee: {notif.employee.name} ({notif.employee.employeeCode})
                      </p>
                    )}
                  </div>
                  {!notif.isRead && (
                    <div className="absolute top-6 right-6 w-2 h-2 bg-primary rounded-full" />
                  )}
                </motion.div>
              );
            })
          ) : (
            <div className="glass-card p-12 text-center">
              <Bell size={48} className="mx-auto mb-4 text-muted" />
              <p className="text-text-primary font-medium text-lg">
                {selectedCategory === 'All' ? 'All caught up!' : `No ${selectedCategory.toLowerCase()} notifications`}
              </p>
              <p className="text-text-secondary text-sm mt-2">
                {selectedCategory === 'All' 
                  ? 'You have no new notifications at the moment.'
                  : `There are no ${selectedCategory.toLowerCase()} notifications to display.`
                }
              </p>
              {selectedCategory !== 'All' && (
                <button 
                  onClick={() => setSelectedCategory('All')}
                  className="mt-4 px-4 py-2 bg-primary text-white rounded-xl text-xs font-black hover:bg-primary/90 transition-colors"
                >
                  View All Notifications
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
