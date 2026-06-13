'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, Check, Circle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { api } from '@/lib/api';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    fetchNotifications();

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/admin/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications);
      }
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
      await api.put(`/api/admin/notifications/${id}/read`);
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      await api.put('/api/admin/notifications/read-all');
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-sm hover:bg-surface-variant text-text-secondary transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full animate-pulse" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-3 w-80 sm:w-96 bg-surface/95 backdrop-blur-xl border border-border rounded-[28px] shadow-2xl shadow-primary/10 overflow-hidden z-50 p-2"
          >
            <div className="flex items-center justify-between p-4 border-b border-border/50 bg-surface-variant/30 rounded-t-[20px]">
              <h3 className="font-bold text-text-primary">Notifications</h3>
              {unreadCount > 0 && (
                <button 
                  onClick={markAllAsRead}
                  className="text-xs font-semibold text-primary hover:text-primary/80"
                >
                  Mark all as read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto p-2 space-y-1">
              {loading && notifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-text-secondary">Loading...</div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-text-secondary">No notifications</div>
              ) : (
                notifications.map((notif) => (
                  <div 
                    key={notif.id}
                    onClick={() => !notif.isRead && markAsRead(notif.id)}
                    className={`p-3 rounded-sm cursor-pointer transition-colors ${notif.isRead ? 'hover:bg-surface-variant/50 opacity-70' : 'bg-primary/5 hover:bg-primary/10'}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-sm font-bold text-text-primary pr-2">{notif.title}</h4>
                      {!notif.isRead && <Circle className="w-2 h-2 text-primary fill-primary mt-1 shrink-0" />}
                    </div>
                    <p className="text-xs text-text-secondary line-clamp-2">{notif.message}</p>
                    <p className="text-micro text-muted mt-2">
                      {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
