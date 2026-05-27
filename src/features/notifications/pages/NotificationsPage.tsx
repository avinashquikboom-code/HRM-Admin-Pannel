"use client";

import { 
  CheckCircle2, 
  Settings, 
  MoreVertical,
  Trash2,
  Building2,
  Wallet
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

const notifications = [
  { 
    id: 1, 
    title: 'New Company Registered', 
    description: 'TechVibe Inc. has successfully completed their enterprise onboarding.', 
    type: 'success', 
    icon: Building2,
    time: '2 mins ago', 
    unread: true 
  },
  { 
    id: 2, 
    title: 'Payroll Failure Alert', 
    description: 'Disbursement for EcoWare Solutions failed due to banking API timeout.', 
    type: 'error', 
    icon: Wallet,
    time: '45 mins ago', 
    unread: true 
  },
  { 
    id: 3, 
    title: 'System Maintenance', 
    description: 'Platform will be down for scheduled maintenance on Sunday, 12 AM.', 
    type: 'info', 
    icon: Settings,
    time: '2 hours ago', 
    unread: false 
  },
  { 
    id: 4, 
    title: 'Subscription Renewal', 
    description: 'Innovate Digital has renewed their Professional plan for another year.', 
    type: 'success', 
    icon: CheckCircle2,
    time: '5 hours ago', 
    unread: false 
  },
];

const NotificationsPage = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="heading-1">System Notifications</h1>
          <p className="text-page-desc mt-1">Stay updated with platform activity and critical system alerts.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-sm font-bold text-primary hover:bg-primary/5 px-4 py-2 rounded-xl transition-colors">
            Mark all as read
          </button>
          <button className="p-2.5 bg-surface-variant text-muted hover:text-error rounded-xl transition-colors">
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      {/* Categories */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
        {['All', 'Critical', 'Onboarding', 'Payroll', 'System'].map((cat, i) => (
          <button 
            key={cat}
            className={cn(
              "px-6 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all",
              i === 0 
                ? "bg-primary text-white shadow-lg shadow-primary/20" 
                : "bg-surface border border-border text-text-secondary hover:border-primary/30 font-medium"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.map((notif, index) => (
          <motion.div 
            key={notif.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
              "glass-card p-6 flex gap-6 relative transition-all group hover:border-primary/20",
              notif.unread && "border-l-4 border-l-primary bg-primary/[0.02]"
            )}
          >
            <div className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0",
              notif.type === 'success' ? 'bg-success/10 text-success' :
              notif.type === 'error' ? 'bg-error/10 text-error' : 'bg-primary/10 text-primary'
            )}>
              <notif.icon size={24} />
            </div>
            
            <div className="flex-grow space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-text-primary tracking-tight">{notif.title}</h4>
                <span className="text-xs text-text-secondary font-medium">{notif.time}</span>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed max-w-2xl font-medium">
                {notif.description}
              </p>
            </div>

            <button className="opacity-0 group-hover:opacity-100 p-2 hover:bg-surface-variant rounded-xl transition-all h-fit">
              <MoreVertical size={18} className="text-muted" />
            </button>
          </motion.div>
        ))}
      </div>

      <button className="w-full py-4 text-sm font-bold text-text-secondary hover:text-primary transition-colors">
        Load Older Notifications
      </button>
    </div>
  );
};

export default NotificationsPage;
