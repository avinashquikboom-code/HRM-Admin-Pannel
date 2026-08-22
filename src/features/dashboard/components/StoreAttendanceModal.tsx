'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { 
  Search, 
  FileSpreadsheet, 
  RefreshCw, 
  UserCheck, 
  UserX, 
  Clock, 
  Calendar,
  Building,
  Coffee,
  FileText
} from 'lucide-react';
import Modal from '@/components/Modal';
import { api } from '@/lib/api';
import { cn } from '@/utils/cn';
import { formatTime, calculateWorkingHours, formatBreakDuration } from '@/utils/timeFormatter';

export interface BreakSession {
  id?: number | string;
  startTime: string;
  endTime?: string | null;
  durationSeconds?: number | null;
  durationMinutes?: number | null;
  type?: string;
}

export interface StoreAttendanceEmployee {
  id: number;
  employeeName: string;
  employeeCode: string;
  designation: string;
  status: 'PRESENT' | 'ABSENT' | 'ON LEAVE' | 'LATE' | 'ON BREAK' | string;
  checkInTime: string;
  checkOutTime: string;
  workingHours: string;
  breakSessions?: BreakSession[];
  totalBreakSeconds?: number;
  totalBreakMinutes?: number;
  isCurrentlyOnBreak?: boolean;
  startBreak?: string;
  endBreak?: string;
  totalBreak?: string;
  breakDetails?: string;
  notes: string;
}

interface StoreAttendanceModalProps {
  storeId: number | null;
  storeName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function StoreAttendanceModal({
  storeId,
  storeName,
  isOpen,
  onClose
}: StoreAttendanceModalProps) {
  const [attendanceData, setAttendanceData] = useState<StoreAttendanceEmployee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchStoreAttendance = useCallback(async (id: number) => {
    setIsLoading(true);
    setError('');
    try {
      const response = await api.get<{
        success: boolean;
        storeId: number;
        storeName: string;
        data: StoreAttendanceEmployee[];
      }>(`/api/admin/attendance/store/${id}`);

      if (response.data.success) {
        setAttendanceData(response.data.data || []);
      } else {
        setError('Failed to load store attendance data.');
      }
    } catch (err: any) {
      console.error('Error fetching store attendance:', err);
      setError(err.response?.data?.message || 'Error connecting to server.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen && storeId) {
      fetchStoreAttendance(storeId);
      setSearchQuery('');
    } else {
      setAttendanceData([]);
    }
  }, [isOpen, storeId, fetchStoreAttendance]);

  const filteredEmployees = attendanceData.filter((emp) => {
    const term = searchQuery.toLowerCase().trim();
    if (!term) return true;
    return (
      emp.employeeName.toLowerCase().includes(term) ||
      emp.employeeCode.toLowerCase().includes(term) ||
      emp.designation.toLowerCase().includes(term) ||
      emp.status.toLowerCase().includes(term) ||
      emp.notes.toLowerCase().includes(term)
    );
  });

  const handleExportExcel = () => {
    if (filteredEmployees.length === 0) return;
    try {
      const dataToExport = filteredEmployees.map((emp) => {
        const startBreakStr = emp.breakSessions && emp.breakSessions.length > 0
          ? emp.breakSessions.map((s) => formatTime(s.startTime)).join(', ')
          : (emp.startBreak || '-');

        const endBreakStr = emp.breakSessions && emp.breakSessions.length > 0
          ? emp.breakSessions.map((s) => (s.endTime ? formatTime(s.endTime) : '-')).join(', ')
          : (emp.endBreak || '-');

        const totalBreakStr = emp.isCurrentlyOnBreak
          ? 'Running'
          : (emp.totalBreakSeconds !== undefined && emp.totalBreakSeconds > 0
            ? formatBreakDuration(emp.totalBreakSeconds)
            : (emp.totalBreakMinutes !== undefined && emp.totalBreakMinutes > 0
              ? formatBreakDuration(emp.totalBreakMinutes * 60)
              : (emp.totalBreak || '-')));

        return {
          'Employee Code': emp.employeeCode || '-',
          'Employee Name': emp.employeeName,
          'Designation': emp.designation,
          'Status': emp.isCurrentlyOnBreak ? 'ON BREAK' : emp.status,
          'Check-In Time': formatTime(emp.checkInTime),
          'Check-Out Time': formatTime(emp.checkOutTime),
          'Working Hours': emp.workingHours && emp.workingHours !== '-' ? emp.workingHours : calculateWorkingHours(emp.checkInTime, emp.checkOutTime),
          'Start Break': startBreakStr,
          'End Break': endBreakStr,
          'Total Break': totalBreakStr,
          'Notes': emp.notes || '-'
        };
      });

      const XLSX = require('xlsx');
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const cleanTitle = (storeName || 'Store').replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
      XLSX.utils.book_append_sheet(wb, ws, `${cleanTitle}_Attendance`);
      const dateStr = new Date().toISOString().split('T')[0];
      XLSX.writeFile(wb, `${cleanTitle}_Attendance_${dateStr}.xlsx`);
    } catch (err) {
      console.error('Error exporting Excel report:', err);
    }
  };

  const getStatusBadge = (emp: StoreAttendanceEmployee) => {
    const upperStatus = emp.status?.toUpperCase() || '';
    if (emp.isCurrentlyOnBreak || upperStatus === 'ON BREAK') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-sm text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 border border-amber-500/20">
          <Coffee size={12} className="animate-pulse" />
          On Break
        </span>
      );
    }
    if (upperStatus === 'PRESENT') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-sm text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
          <UserCheck size={12} />
          Present
        </span>
      );
    }
    if (upperStatus === 'ABSENT') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-sm text-[10px] font-black uppercase tracking-wider bg-red-500/10 text-red-600 border border-red-500/20">
          <UserX size={12} />
          Absent
        </span>
      );
    }
    if (upperStatus === 'LATE') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-sm text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 border border-amber-500/20">
          <Clock size={12} />
          Late
        </span>
      );
    }
    if (upperStatus === 'ON LEAVE' || upperStatus === 'LEAVE') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-sm text-[10px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-600 border border-blue-500/20">
          <Calendar size={12} />
          On Leave
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-sm text-[10px] font-black uppercase tracking-wider bg-surface-variant text-text-secondary border border-border">
        {emp.status}
      </span>
    );
  };

  const renderStartBreak = (emp: StoreAttendanceEmployee) => {
    if (emp.breakSessions && emp.breakSessions.length > 0) {
      return (
        <div className="space-y-0.5">
          {emp.breakSessions.map((s, idx) => (
            <div key={idx} className="whitespace-nowrap font-medium text-text-primary">
              {formatTime(s.startTime)}
            </div>
          ))}
        </div>
      );
    }
    return emp.startBreak || '-';
  };

  const renderEndBreak = (emp: StoreAttendanceEmployee) => {
    if (emp.breakSessions && emp.breakSessions.length > 0) {
      return (
        <div className="space-y-0.5">
          {emp.breakSessions.map((s, idx) => (
            <div key={idx} className="whitespace-nowrap font-medium text-text-primary">
              {s.endTime ? formatTime(s.endTime) : '-'}
            </div>
          ))}
        </div>
      );
    }
    return emp.endBreak || '-';
  };

  const renderTotalBreak = (emp: StoreAttendanceEmployee) => {
    if (emp.isCurrentlyOnBreak) {
      return (
        <span className="inline-flex items-center gap-1 text-amber-600 font-bold whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          Running
        </span>
      );
    }
    if (emp.totalBreakSeconds !== undefined && emp.totalBreakSeconds > 0) {
      return (
        <div>
          <span className="font-bold text-amber-600">{formatBreakDuration(emp.totalBreakSeconds)}</span>
          {emp.breakSessions && emp.breakSessions.length > 1 && (
            <div className="text-[10px] text-text-secondary font-normal whitespace-nowrap">
              {emp.breakSessions
                .map(s => s.durationSeconds !== null && s.durationSeconds !== undefined
                  ? formatBreakDuration(s.durationSeconds)
                  : (s.durationMinutes !== null && s.durationMinutes !== undefined ? formatBreakDuration(s.durationMinutes * 60) : '-'))
                .join(' + ')}
            </div>
          )}
        </div>
      );
    }
    if (emp.breakSessions && emp.breakSessions.length > 0) {
      const totalSec = emp.breakSessions.reduce(
        (acc, s) => acc + (s.durationSeconds ?? (s.durationMinutes ? s.durationMinutes * 60 : 0)),
        0
      );
      return totalSec > 0 ? formatBreakDuration(totalSec) : '-';
    }
    return emp.totalBreak || '-';
  };

  // Quick summary counts
  const presentCount = attendanceData.filter(e => e.status.toUpperCase() === 'PRESENT').length;
  const absentCount = attendanceData.filter(e => e.status.toUpperCase() === 'ABSENT').length;
  const lateCount = attendanceData.filter(e => e.status.toUpperCase() === 'LATE').length;
  const leaveCount = attendanceData.filter(e => e.status.toUpperCase().includes('LEAVE')).length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${storeName} — Live Store Attendance`}
      maxWidth="max-w-5xl"
    >
      <div className="space-y-5">
        {/* Quick Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-emerald-500/5 border border-emerald-500/15 rounded-sm">
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">Present</p>
            <p className="text-xl font-black text-emerald-600 mt-1">{presentCount}</p>
          </div>
          <div className="p-3 bg-amber-500/5 border border-amber-500/15 rounded-sm">
            <p className="text-[10px] font-black text-amber-600 uppercase tracking-wider">Late</p>
            <p className="text-xl font-black text-amber-600 mt-1">{lateCount}</p>
          </div>
          <div className="p-3 bg-blue-500/5 border border-blue-500/15 rounded-sm">
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-wider">On Leave</p>
            <p className="text-xl font-black text-blue-600 mt-1">{leaveCount}</p>
          </div>
          <div className="p-3 bg-red-500/5 border border-red-500/15 rounded-sm">
            <p className="text-[10px] font-black text-red-600 uppercase tracking-wider">Absent</p>
            <p className="text-xl font-black text-red-600 mt-1">{absentCount}</p>
          </div>
        </div>

        {/* Search & Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
            <input
              type="text"
              placeholder="Search employee by name, code, designation or status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-surface-variant rounded-sm outline-none focus:ring-2 focus:ring-primary/50 text-xs font-bold text-text-primary"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => storeId && fetchStoreAttendance(storeId)}
              disabled={isLoading}
              className="px-3.5 py-2.5 bg-surface hover:bg-surface-variant text-text-primary border border-border rounded-sm text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-50 shrink-0"
            >
              <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
              Refresh
            </button>
            <button
              onClick={handleExportExcel}
              disabled={filteredEmployees.length === 0}
              className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-sm text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-50 shrink-0"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Export Excel
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 text-xs font-bold rounded-sm">
            {error}
          </div>
        )}

        {/* Attendance Table */}
        <div className="border border-border rounded-sm max-h-[480px] overflow-y-auto overflow-x-auto">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <RefreshCw className="animate-spin text-primary" size={28} />
              <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">
                Fetching Store Attendance...
              </p>
            </div>
          ) : (
            <table className="w-full min-w-[850px] text-left border-collapse">
              <thead>
                <tr className="bg-surface-variant/40 border-b border-border sticky top-0 z-10">
                  <th className="px-4 py-3.5 text-[9px] font-black text-text-secondary uppercase tracking-widest">Employee</th>
                  <th className="px-4 py-3.5 text-[9px] font-black text-text-secondary uppercase tracking-widest">Status</th>
                  <th className="px-4 py-3.5 text-[9px] font-black text-text-secondary uppercase tracking-widest">Check-In</th>
                  <th className="px-4 py-3.5 text-[9px] font-black text-text-secondary uppercase tracking-widest">Check-Out</th>
                  <th className="px-4 py-3.5 text-[9px] font-black text-text-secondary uppercase tracking-widest">Working Hours</th>
                  <th className="px-4 py-3.5 text-[9px] font-black text-text-secondary uppercase tracking-widest">Start Break</th>
                  <th className="px-4 py-3.5 text-[9px] font-black text-text-secondary uppercase tracking-widest">End Break</th>
                  <th className="px-4 py-3.5 text-[9px] font-black text-text-secondary uppercase tracking-widest">Total Break</th>
                  <th className="px-4 py-3.5 text-[9px] font-black text-text-secondary uppercase tracking-widest">Notes</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map((emp) => (
                    <tr key={emp.id} className="border-b border-border/50 hover:bg-surface-variant/15 transition-colors">
                      <td className="px-4 py-3 text-xs font-black text-text-primary">
                        <div>{emp.employeeName}</div>
                        <div className="text-[10px] text-text-secondary font-semibold">{emp.designation}</div>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {getStatusBadge(emp)}
                      </td>
                      <td className="px-4 py-3 text-xs font-bold text-text-primary">
                        {formatTime(emp.checkInTime)}
                      </td>
                      <td className="px-4 py-3 text-xs font-bold text-text-primary">
                        {formatTime(emp.checkOutTime)}
                      </td>
                      <td className="px-4 py-3 text-xs font-semibold text-emerald-600">
                        {emp.workingHours && emp.workingHours !== '-' ? emp.workingHours : calculateWorkingHours(emp.checkInTime, emp.checkOutTime)}
                      </td>
                      <td className="px-4 py-3 text-xs font-semibold text-text-primary">
                        {renderStartBreak(emp)}
                      </td>
                      <td className="px-4 py-3 text-xs font-semibold text-text-primary">
                        {renderEndBreak(emp)}
                      </td>
                      <td className="px-4 py-3 text-xs font-bold text-amber-600">
                        {renderTotalBreak(emp)}
                      </td>
                      <td className="px-4 py-3 text-xs font-normal text-text-secondary max-w-[150px] truncate" title={emp.notes}>
                        {emp.notes || '-'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="px-4 py-10 text-center text-xs font-bold text-text-secondary uppercase tracking-widest">
                      {searchQuery ? 'No matching employee records found.' : 'No active employees in this store.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Modal>
  );
}

