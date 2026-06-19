'use client';

import { useState } from 'react';
import { Clock, MapPin, Shield, Save } from 'lucide-react';
import { cn } from '@/utils/cn';

interface AttendancePolicyPanelProps {
  lateThreshold: number;
  halfDayThreshold: number;
  absentThreshold: number;
  autoMarkAbsent: boolean;
  workingHours: { start: string; end: string };
  workingDays: string[];
  onLateThresholdChange: (value: number) => void;
  onHalfDayThresholdChange: (value: number) => void;
  onAbsentThresholdChange: (value: number) => void;
  onAutoMarkAbsentChange: (value: boolean) => void;
  onWorkingHoursChange: (start: string, end: string) => void;
  onWorkingDaysChange: (days: string[]) => void;
}

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function AttendancePolicyPanel({
  lateThreshold,
  halfDayThreshold,
  absentThreshold,
  autoMarkAbsent,
  workingHours,
  workingDays,
  onLateThresholdChange,
  onHalfDayThresholdChange,
  onAbsentThresholdChange,
  onAutoMarkAbsentChange,
  onWorkingHoursChange,
  onWorkingDaysChange,
}: AttendancePolicyPanelProps) {
  const [localWorkingHours, setLocalWorkingHours] = useState(workingHours);
  const [localWorkingDays, setLocalWorkingDays] = useState(workingDays);

  const handleWorkingDayToggle = (day: string) => {
    const newDays = localWorkingDays.includes(day)
      ? localWorkingDays.filter(d => d !== day)
      : [...localWorkingDays, day];
    setLocalWorkingDays(newDays);
    onWorkingDaysChange(newDays);
  };

  const handleSaveWorkingHours = () => {
    onWorkingHoursChange(localWorkingHours.start, localWorkingHours.end);
  };

  return (
    <div className="space-y-6">
      {/* Working Hours */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-primary/10 text-primary rounded-sm">
            <Clock size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-text-primary">Working Hours</h3>
            <p className="text-sm text-text-secondary">Define standard working hours for the organization</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-black text-muted uppercase tracking-widest ml-1">
              Start Time
            </label>
            <input
              type="time"
              value={localWorkingHours.start}
              onChange={(e) => setLocalWorkingHours({ ...localWorkingHours, start: e.target.value })}
              className="w-full px-4 py-3 bg-surface-variant rounded-sm outline-none focus:ring-2 focus:ring-primary/50 text-text-primary font-medium"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-muted uppercase tracking-widest ml-1">
              End Time
            </label>
            <input
              type="time"
              value={localWorkingHours.end}
              onChange={(e) => setLocalWorkingHours({ ...localWorkingHours, end: e.target.value })}
              className="w-full px-4 py-3 bg-surface-variant rounded-sm outline-none focus:ring-2 focus:ring-primary/50 text-text-primary font-medium"
            />
          </div>
        </div>

        <button
          onClick={handleSaveWorkingHours}
          className="mt-4 btn-primary px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-2"
        >
          <Save size={14} />
          Save Working Hours
        </button>
      </div>

      {/* Working Days */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-primary/10 text-primary rounded-sm">
            <MapPin size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-text-primary">Working Days</h3>
            <p className="text-sm text-text-secondary">Select the days that are considered working days</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {daysOfWeek.map((day) => (
            <button
              key={day}
              type="button"
              onClick={() => handleWorkingDayToggle(day)}
              className={cn(
                'px-4 py-3 rounded-sm text-sm font-bold uppercase tracking-wider transition-all border',
                localWorkingDays.includes(day)
                  ? 'bg-primary text-white border-primary'
                  : 'bg-surface-variant text-text-secondary border-border hover:border-primary/30'
              )}
            >
              {day.slice(0, 3)}
            </button>
          ))}
        </div>
      </div>

      {/* Attendance Thresholds */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-primary/10 text-primary rounded-sm">
            <Shield size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-text-primary">Attendance Thresholds</h3>
            <p className="text-sm text-text-secondary">Configure rules for marking attendance status</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-muted uppercase tracking-widest ml-1">
              Late Threshold (minutes)
            </label>
            <input
              type="number"
              min={0}
              value={lateThreshold}
              onChange={(e) => onLateThresholdChange(parseInt(e.target.value, 10) || 0)}
              className="w-full px-4 py-3 bg-surface-variant rounded-sm outline-none focus:ring-2 focus:ring-primary/50 text-text-primary font-medium"
            />
            <p className="text-xs text-text-secondary mt-1">Employees arriving after this time will be marked as Late</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-muted uppercase tracking-widest ml-1">
              Half Day Threshold (minutes)
            </label>
            <input
              type="number"
              min={0}
              value={halfDayThreshold}
              onChange={(e) => onHalfDayThresholdChange(parseInt(e.target.value, 10) || 0)}
              className="w-full px-4 py-3 bg-surface-variant rounded-sm outline-none focus:ring-2 focus:ring-primary/50 text-text-primary font-medium"
            />
            <p className="text-xs text-text-secondary mt-1">Employees working less than this will be marked as Half Day</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-muted uppercase tracking-widest ml-1">
              Absent Threshold (minutes)
            </label>
            <input
              type="number"
              min={0}
              value={absentThreshold}
              onChange={(e) => onAbsentThresholdChange(parseInt(e.target.value, 10) || 0)}
              className="w-full px-4 py-3 bg-surface-variant rounded-sm outline-none focus:ring-2 focus:ring-primary/50 text-text-primary font-medium"
            />
            <p className="text-xs text-text-secondary mt-1">Employees working less than this will be marked as Absent</p>
          </div>

          <div className="flex items-center justify-between p-4 bg-surface-variant/50 rounded-sm border border-border">
            <div>
              <p className="text-sm font-bold text-text-primary">Auto-Mark Absent</p>
              <p className="text-xs text-text-secondary mt-1">Automatically mark absent if threshold not met</p>
            </div>
            <button
              type="button"
              onClick={() => onAutoMarkAbsentChange(!autoMarkAbsent)}
              className={cn(
                'w-12 h-6 rounded-sm transition-all relative',
                autoMarkAbsent ? 'bg-primary' : 'bg-surface-variant border border-border'
              )}
            >
              <span
                className={cn(
                  'absolute top-1 w-4 h-4 rounded-sm transition-all',
                  autoMarkAbsent ? 'left-7 bg-white' : 'left-1 bg-text-secondary'
                )}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
