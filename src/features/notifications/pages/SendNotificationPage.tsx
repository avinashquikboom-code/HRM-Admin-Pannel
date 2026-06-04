"use client";

import { useState } from 'react';
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { sendNotificationToEmployee, broadcastAnnouncement } from '@/services/notificationService';
import { cn } from '@/utils/cn';

export default function SendNotificationPage() {
  const [type, setType] = useState<'individual' | 'broadcast'>('individual');
  const [employeeId, setEmployeeId] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState('info');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');

    try {
      if (type === 'individual') {
        if (!employeeId) throw new Error('Employee ID is required');
        await sendNotificationToEmployee({
          employeeId: parseInt(employeeId, 10),
          title,
          body,
          category,
        });
      } else {
        await broadcastAnnouncement({
          title,
          body,
          category,
        });
      }
      setSuccess('Notification sent successfully!');
      setTitle('');
      setBody('');
      if (type === 'individual') setEmployeeId('');
    } catch (err: any) {
      setError(err.message || 'Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="heading-1">Send Notification</h1>
        <p className="text-page-desc mt-1">Send targeted notifications or broadcast announcements to employees.</p>
      </div>

      <form onSubmit={handleSubmit} className="glass-card p-6 md:p-8 space-y-6">
        {/* Type Selection */}
        <div className="flex gap-4">
          <label className={cn(
            "flex-1 p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center gap-2",
            type === 'individual' 
              ? "border-primary bg-primary/5 text-primary" 
              : "border-border bg-surface text-text-secondary hover:border-primary/30"
          )}>
            <input 
              type="radio" 
              className="sr-only" 
              checked={type === 'individual'} 
              onChange={() => setType('individual')} 
            />
            <span className="font-bold">Individual</span>
          </label>
          <label className={cn(
            "flex-1 p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center gap-2",
            type === 'broadcast' 
              ? "border-primary bg-primary/5 text-primary" 
              : "border-border bg-surface text-text-secondary hover:border-primary/30"
          )}>
            <input 
              type="radio" 
              className="sr-only" 
              checked={type === 'broadcast'} 
              onChange={() => setType('broadcast')} 
            />
            <span className="font-bold">Broadcast</span>
          </label>
        </div>

        {type === 'individual' && (
          <div className="space-y-2">
            <label className="text-sm font-bold text-text-primary">Employee ID</label>
            <input
              type="number"
              required
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full px-4 py-3 bg-surface-variant border border-border rounded-xl focus:ring-2 focus:ring-primary/30 outline-none transition-all"
              placeholder="e.g. 1"
            />
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-bold text-text-primary">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-3 bg-surface-variant border border-border rounded-xl focus:ring-2 focus:ring-primary/30 outline-none transition-all"
          >
            <option value="info">Info</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-text-primary">Title</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 bg-surface-variant border border-border rounded-xl focus:ring-2 focus:ring-primary/30 outline-none transition-all"
            placeholder="Notification Title"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-text-primary">Message Body</label>
          <textarea
            required
            rows={4}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full px-4 py-3 bg-surface-variant border border-border rounded-xl focus:ring-2 focus:ring-primary/30 outline-none transition-all resize-none"
            placeholder="Enter the notification message..."
          />
        </div>

        {error && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-error/10 text-error rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </motion.div>
        )}

        {success && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">{success}</p>
          </motion.div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>Send Notification</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
