'use client';

import {
  AlertTriangle,
  CheckCircle2,
  MapPin,
  Trash2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import type { LocationLog } from '../types';

interface ActivityFeedProps {
  logs: LocationLog[];
  onClear: () => void;
}

export default function ActivityFeed({ logs, onClear }: ActivityFeedProps) {
  return (
    <div className="glass-card flex flex-col h-full min-h-[320px]">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-3">
        <div>
          <h3 className="heading-2">Recent activity</h3>
          <p className="text-xs text-text-secondary mt-0.5">
            Geofence entries and exits
          </p>
        </div>
        {logs.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-semibold text-error/80 hover:text-error flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-error/10"
          >
            <Trash2 size={12} />
            Clear
          </button>
        )}
      </div>

      <div className="p-4 flex-1 overflow-y-auto space-y-3 max-h-[420px]">
        <AnimatePresence mode="popLayout">
          {logs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center text-center py-12 px-4"
            >
              <CheckCircle2 size={36} className="text-success mb-3" />
              <p className="text-sm font-semibold text-text-primary">
                No recent alerts
              </p>
              <p className="text-xs text-text-secondary mt-1">
                Geofence breaches and office entries will appear here.
              </p>
            </motion.div>
          ) : (
            logs.map((log) => {
              const isBreach = log.event === 'Geofence Breach';
              return (
                <motion.div
                  key={log.id}
                  layout
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className={cn(
                    'p-3.5 rounded-xl border flex gap-3',
                    isBreach
                      ? 'bg-warning/5 border-warning/15'
                      : 'bg-success/5 border-success/15'
                  )}
                >
                  <div
                    className={cn(
                      'p-2 rounded-lg h-fit shrink-0',
                      isBreach
                        ? 'bg-warning/10 text-warning'
                        : 'bg-success/10 text-success'
                    )}
                  >
                    {isBreach ? (
                      <AlertTriangle size={14} />
                    ) : (
                      <CheckCircle2 size={14} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-text-primary truncate">
                        {log.employeeName}
                      </p>
                      <span className="text-[10px] text-muted shrink-0">
                        {log.timestamp.split(' ').slice(-2).join(' ')}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-text-primary">
                      {log.event}
                    </p>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      {log.description}
                    </p>
                    <p className="text-[10px] font-mono text-muted flex items-center gap-1 pt-0.5">
                      <MapPin size={10} />
                      {log.coordinates}
                    </p>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
