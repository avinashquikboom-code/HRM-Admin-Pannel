'use client';

import { useState, useEffect } from 'react';
import { MapPin, X, Download, Calendar, Clock, FileText, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import type { EmployeeLiveLocation } from '@/services/locationService';
import { fetchAttendanceHistory, type AttendanceRecord } from '@/services/attendanceService';
import { fetchEmployeeLeaves, type LeaveRequest } from '@/services/leaveService';

interface EmployeeDetailCardProps {
  employee: EmployeeLiveLocation | null;
  onClose: () => void;
  onForceBreach?: (employeeId: number) => void;
  onRecallToOffice?: (employeeId: number) => void;
}

type TabType = 'location' | 'attendance' | 'leave';

export default function EmployeeDetailCard({
  employee,
  onClose,
  onForceBreach,
  onRecallToOffice,
}: EmployeeDetailCardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('location');
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [leaveRecords, setLeaveRecords] = useState<LeaveRequest[]>([]);
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(false);
  const [isLoadingLeaves, setIsLoadingLeaves] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const showDevControls = false;

  useEffect(() => {
    if (employee && activeTab === 'attendance') {
      loadAttendanceData();
    }
  }, [employee, activeTab]);

  useEffect(() => {
    if (employee && activeTab === 'leave') {
      loadLeaveData();
    }
  }, [employee, activeTab]);

  const loadAttendanceData = async () => {
    if (!employee) return;
    setIsLoadingAttendance(true);
    try {
      const data = await fetchAttendanceHistory({ employeeId: employee.employeeId, limit: 10 });
      setAttendanceRecords(data);
    } catch (error) {
      console.error('Failed to load attendance:', error);
    } finally {
      setIsLoadingAttendance(false);
    }
  };

  const loadLeaveData = async () => {
    if (!employee) return;
    setIsLoadingLeaves(true);
    try {
      const data = await fetchEmployeeLeaves(employee.employeeId);
      setLeaveRecords(data);
    } catch (error) {
      console.error('Failed to load leaves:', error);
    } finally {
      setIsLoadingLeaves(false);
    }
  };

  const handleDownloadAttendance = async () => {
    if (!employee) return;
    setIsDownloading(true);
    try {
      const response = await fetch(`/api/admin/attendance/report/download?employeeId=${employee.employeeId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('super_hrm_token') || localStorage.getItem('admin_hrm_token') || localStorage.getItem('hrm_token')}`
        }
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendance-report-${employee.name.replace(/\s+/g, '-')}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Failed to download attendance report:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {employee ? (
        <motion.div
          key={employee.employeeId}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
className="bg-surface border border-border rounded-sm p-5 space-y-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-sm bg-primary/10 text-primary flex items-center justify-center font-black text-sm shrink-0">
                {employee.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-text-primary truncate">
                  {employee.name}
                </h4>
                <p className="text-xs text-text-secondary truncate">
                  {employee.role}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-surface-variant text-text-secondary"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 border-b border-border pb-3">
            <button
              type="button"
              onClick={() => setActiveTab('location')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors',
                activeTab === 'location'
                  ? 'bg-primary/10 text-primary'
                  : 'text-text-secondary hover:bg-surface-variant'
              )}
            >
              <MapPin size={14} />
              Location
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('attendance')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors',
                activeTab === 'attendance'
                  ? 'bg-primary/10 text-primary'
                  : 'text-text-secondary hover:bg-surface-variant'
              )}
            >
              <Calendar size={14} />
              Attendance
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('leave')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors',
                activeTab === 'leave'
                  ? 'bg-primary/10 text-primary'
                  : 'text-text-secondary hover:bg-surface-variant'
              )}
            >
              <FileText size={14} />
              Leave
            </button>
          </div>

          {/* Location Tab */}
          {activeTab === 'location' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div
                className={cn(
                  'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide',
                  employee.status === 'In Office' &&
                    'bg-success/10 text-success',
                  employee.status === 'Outside Geofence' &&
                    'bg-warning/10 text-warning',
                  employee.status === 'On Leave' && 'bg-muted/10 text-muted'
                )}
              >
                <span
                  className={cn(
                    'w-2 h-2 rounded-full',
                    employee.status === 'In Office' && 'bg-success',
                    employee.status === 'Outside Geofence' &&
                      'bg-warning animate-pulse',
                    employee.status === 'On Leave' && 'bg-muted'
                  )}
                />
                {employee.status === 'Outside Geofence'
                  ? 'Outside geofence'
                  : employee.status}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-sm bg-surface-variant/60 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
                    Coordinates
                  </p>
                  <p className="text-xs font-mono font-semibold text-text-primary mt-1">
                    {employee.status === 'On Leave'
                      ? '—'
                      : `${employee.lat.toFixed(5)}, ${employee.lng.toFixed(5)}`}
                  </p>
                </div>
                <div className="rounded-sm bg-surface-variant/60 p-3 col-span-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
                    Speed
                  </p>
                  <p className="text-xs font-semibold text-primary mt-1">
                    {employee.speed}
                  </p>
                </div>
              </div>

              {employee.status !== 'On Leave' && (
                <p className="text-xs text-text-secondary flex items-start gap-1.5">
                  <MapPin size={14} className="shrink-0 mt-0.5 text-primary" />
                  {employee.status === 'In Office'
                    ? 'Employee is within the configured office geofence.'
                    : 'Employee is outside the allowed punch radius.'}
                </p>
              )}

              {showDevControls && employee.status !== 'On Leave' && (
                <div className="pt-2 border-t border-border space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
                    Dev simulation
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => onForceBreach?.(employee.employeeId)}
                      disabled={employee.status === 'Outside Geofence'}
                      className="btn-danger py-2 text-xs rounded-sm disabled:opacity-40"
                    >
                      Simulate breach
                    </button>
                    <button
                      type="button"
                      onClick={() => onRecallToOffice?.(employee.employeeId)}
                      disabled={employee.status === 'In Office'}
                      className="btn-primary py-2 text-xs rounded-sm disabled:opacity-40"
                    >
                      Return to office
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Attendance Tab */}
          {activeTab === 'attendance' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-bold uppercase tracking-wider text-text-primary">
                  Recent Attendance
                </h5>
                <button
                  type="button"
                  onClick={handleDownloadAttendance}
                  disabled={isDownloading || attendanceRecords.length === 0}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors disabled:opacity-50"
                >
                  {isDownloading ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Download size={12} />
                  )}
                  Download Report
                </button>
              </div>

              {isLoadingAttendance ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 size={20} className="animate-spin text-primary" />
                </div>
              ) : attendanceRecords.length === 0 ? (
                <div className="text-center py-6 text-xs text-text-secondary">
                  No attendance records found.
                </div>
              ) : (
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {attendanceRecords.map((record) => (
                    <div
                      key={record.id}
                      className="rounded-lg bg-surface-variant/60 p-3"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-text-primary">
                          {record.date}
                        </p>
                        <span
                          className={cn(
                            'text-[10px] font-bold uppercase px-2 py-0.5 rounded',
                            record.status === 'PRESENT' && 'bg-success/10 text-success',
                            record.status === 'ABSENT' && 'bg-error/10 text-error',
                            record.status === 'LATE' && 'bg-warning/10 text-warning',
                            record.status === 'HALF_DAY' && 'bg-info/10 text-info'
                          )}
                        >
                          {record.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[10px] text-text-secondary">
                        <div className="flex items-center gap-1">
                          <Clock size={10} />
                          <span>Check-in: {record.checkIn ? new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={10} />
                          <span>Check-out: {record.checkOut ? new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Leave Tab */}
          {activeTab === 'leave' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-3"
            >
              <h5 className="text-xs font-bold uppercase tracking-wider text-text-primary">
                Leave History
              </h5>

              {isLoadingLeaves ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 size={20} className="animate-spin text-primary" />
                </div>
              ) : leaveRecords.length === 0 ? (
                <div className="text-center py-6 text-xs text-text-secondary">
                  No leave records found.
                </div>
              ) : (
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {leaveRecords.map((leave) => (
                    <div
                      key={leave.id}
                      className="rounded-lg bg-surface-variant/60 p-3"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-text-primary">
                          {leave.type}
                        </p>
                        <span
                          className={cn(
                            'text-[10px] font-bold uppercase px-2 py-0.5 rounded',
                            leave.status === 'Approved' && 'bg-success/10 text-success',
                            leave.status === 'Rejected' && 'bg-error/10 text-error',
                            leave.status === 'Pending' && 'bg-warning/10 text-warning'
                          )}
                        >
                          {leave.status}
                        </span>
                      </div>
                      <div className="text-[10px] text-text-secondary space-y-1">
                        <p className="flex items-center gap-1">
                          <Calendar size={10} />
                          <span>{leave.startDate} to {leave.endDate}</span>
                        </p>
                        {leave.reason && (
                          <p className="truncate">{leave.reason}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      ) : (
        <motion.div
          key="empty"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
className="bg-surface border border-border rounded-sm p-8 flex flex-col items-center justify-center text-center min-h-[200px]"
        >
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
            <MapPin size={22} />
          </div>
          <p className="font-semibold text-text-primary text-sm">
            No employee selected
          </p>
          <p className="text-xs text-text-secondary mt-1 max-w-[220px]">
            Select someone on the map or in the list below to view their location
            details.
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
