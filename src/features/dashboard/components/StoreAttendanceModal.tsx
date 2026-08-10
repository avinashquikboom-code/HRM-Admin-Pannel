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

export interface StoreAttendanceEmployee {
  id: number;
  employeeName: string;
  employeeCode: string;
  designation: string;
  status: 'PRESENT' | 'ABSENT' | 'ON LEAVE' | 'LATE' | string;
  checkInTime: string;
  checkOutTime: string;
  workingHours: string;
  breakDetails: string;
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
      const dataToExport = filteredEmployees.map((emp) => ({
        'Employee Code': emp.employeeCode || '-',
        'Employee Name': emp.employeeName,
        'Designation': emp.designation,
        'Status': emp.status,
        'Check-In Time': emp.checkInTime,
        'Check-Out Time': emp.checkOutTime,
        'Working Hours': emp.workingHours,
        'Break Details': emp.breakDetails,
        'Notes': emp.notes || '-'
      }));

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

  const getStatusBadge = (status: string) => {
    const upperStatus = status.toUpperCase();
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
        {status}
      </span>
    );
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
        <div className="border border-border rounded-sm max-h-[480px] overflow-y-auto">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <RefreshCw className="animate-spin text-primary" size={28} />
              <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">
                Fetching Store Attendance...
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-variant/40 border-b border-border sticky top-0 z-10">
                  <th className="px-4 py-3.5 text-[9px] font-black text-text-secondary uppercase tracking-widest">Employee</th>
                  <th className="px-4 py-3.5 text-[9px] font-black text-text-secondary uppercase tracking-widest">Code</th>
                  <th className="px-4 py-3.5 text-[9px] font-black text-text-secondary uppercase tracking-widest">Status</th>
                  <th className="px-4 py-3.5 text-[9px] font-black text-text-secondary uppercase tracking-widest">Check-In</th>
                  <th className="px-4 py-3.5 text-[9px] font-black text-text-secondary uppercase tracking-widest">Check-Out</th>
                  <th className="px-4 py-3.5 text-[9px] font-black text-text-secondary uppercase tracking-widest">Working Hours</th>
                  <th className="px-4 py-3.5 text-[9px] font-black text-text-secondary uppercase tracking-widest">Break Details</th>
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
                      <td className="px-4 py-3 text-xs font-semibold text-text-secondary font-mono">
                        {emp.employeeCode}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {getStatusBadge(emp.status)}
                      </td>
                      <td className="px-4 py-3 text-xs font-bold text-text-primary">
                        {emp.checkInTime}
                      </td>
                      <td className="px-4 py-3 text-xs font-bold text-text-primary">
                        {emp.checkOutTime}
                      </td>
                      <td className="px-4 py-3 text-xs font-semibold text-emerald-600">
                        {emp.workingHours}
                      </td>
                      <td className="px-4 py-3 text-xs font-medium text-text-secondary">
                        {emp.breakDetails}
                      </td>
                      <td className="px-4 py-3 text-xs font-normal text-text-secondary max-w-[150px] truncate" title={emp.notes}>
                        {emp.notes || '-'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-xs font-bold text-text-secondary uppercase tracking-widest">
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
