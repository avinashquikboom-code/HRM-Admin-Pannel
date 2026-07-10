"use client";

import { useState, useEffect } from 'react';
import { Clock, ShieldCheck, Wallet } from 'lucide-react';
import { useApi } from '@/hooks/useApi';

interface PayrollAttendanceModalProps {
  onClose: () => void;
  onBulkDisburse: () => void;
  isDisbursing: boolean;
}

const PayrollAttendanceModal: React.FC<PayrollAttendanceModalProps> = ({ 
  onClose, 
  onBulkDisburse, 
  isDisbursing 
}) => {
  const [autoMarkAbsent, setAutoMarkAbsent] = useState(false);
  const [enableGeofenceValidation, setEnableGeofenceValidation] = useState(false);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(false);
  const { api } = useApi();

  // Load attendance settings and today's attendance
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load attendance settings
        const settingsRes = await api.get('/api/attendance/settings');
        if (settingsRes.data.success) {
          setAutoMarkAbsent(settingsRes.data.settings.autoMarkAbsent);
          setEnableGeofenceValidation(settingsRes.data.settings.enableGeofenceValidation);
        }

        // Load today's attendance
        setIsLoadingAttendance(true);
        const attendanceRes = await api.get('/api/attendance/today');
        if (attendanceRes.data.success) {
          setAttendanceData(attendanceRes.data.attendance);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoadingAttendance(false);
      }
    };

    loadData();
  }, []);

  const handlePunchInOut = async (employeeId: number, type: 'punch_in' | 'punch_out') => {
    try {
      await api.post('/api/attendance/mark', { employeeId, type });
      
      // Refresh attendance data
      const attendanceRes = await api.get('/api/attendance/today');
      if (attendanceRes.data.success) {
        setAttendanceData(attendanceRes.data.attendance);
      }
    } catch (error) {
      console.error('Failed to mark attendance:', error);
    }
  };

  const updateSettings = async (settings: { autoMarkAbsent?: boolean; enableGeofenceValidation?: boolean }) => {
    try {
      await api.put('/api/attendance/settings', settings);
    } catch (error) {
      console.error('Failed to update settings:', error);
    }
  };

  return (
    <div className="space-y-8 p-2">
      {/* Attendance Settings */}
      <div className="space-y-4">
        <h4 className="text-sm font-black uppercase tracking-widest text-text-primary">Attendance Settings</h4>
        
        <div className="p-6 bg-surface-variant/30 rounded-sm border border-border/30 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-sm bg-warning/10 text-warning flex items-center justify-center">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-sm font-black text-text-primary">Auto Mark Absent</p>
                <p className="text-xs text-text-secondary">Automatically mark employees as absent if no punch-in recorded by cutoff time</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={autoMarkAbsent}
                onChange={(e) => {
                  setAutoMarkAbsent(e.target.checked);
                  updateSettings({ autoMarkAbsent: e.target.checked });
                }}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-sm bg-info/10 text-info flex items-center justify-center">
                <ShieldCheck size={20} />
              </div>
              <div>
                <p className="text-sm font-black text-text-primary">Enable Geofence Validation</p>
                <p className="text-xs text-text-secondary">Require employees to be within office premises to punch in/out</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={enableGeofenceValidation}
                onChange={(e) => {
                  setEnableGeofenceValidation(e.target.checked);
                  updateSettings({ enableGeofenceValidation: e.target.checked });
                }}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Today's Attendance */}
      <div className="space-y-4">
        <h4 className="text-sm font-black uppercase tracking-widest text-text-primary">Today's Attendance</h4>
        
        {isLoadingAttendance ? (
          <div className="p-8">
            <div className="animate-pulse space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 bg-surface-variant/50 rounded-sm"></div>
              ))}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-variant/50">
                  <th className="px-4 py-3 text-micro font-black uppercase tracking-[0.2em] text-text-secondary border-b border-border">Employee</th>
                  <th className="px-4 py-3 text-micro font-black uppercase tracking-[0.2em] text-text-secondary border-b border-border">Punch In</th>
                  <th className="px-4 py-3 text-micro font-black uppercase tracking-[0.2em] text-text-secondary border-b border-border">Punch Out</th>
                  <th className="px-4 py-3 text-micro font-black uppercase tracking-[0.2em] text-text-secondary border-b border-border">Status</th>
                  <th className="px-4 py-3 text-micro font-black uppercase tracking-[0.2em] text-text-secondary border-b border-border text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {attendanceData.map((record) => (
                  <tr key={record.id} className="hover:bg-surface-variant/30 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <span className="font-black text-text-primary text-sm">{record.employeeName}</span>
                        <span className="text-xs text-text-secondary block">{record.employeeCode}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono text-text-primary">
                        {record.punchIn ? new Date(record.punchIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '--'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono text-text-primary">
                        {record.punchOut ? new Date(record.punchOut).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '--'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 text-xs font-black rounded-full uppercase tracking-widest ${
                        record.status === 'Present' && !record.punchOut ? 'bg-warning/10 text-warning' :
                        record.status === 'Present' && record.punchOut ? 'bg-success/10 text-success' :
                        'bg-error/10 text-error'
                      }`}>
                        {record.status === 'Present' && !record.punchOut ? 'Present' :
                         record.status === 'Present' && record.punchOut ? 'Completed' :
                         record.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {record.status === 'Present' && !record.punchOut ? (
                        <button 
                          onClick={() => handlePunchInOut(record.employeeId, 'punch_out')}
                          className="px-3 py-1 bg-primary/20 text-primary border border-primary/20 hover:bg-primary hover:text-white rounded-sm text-xs font-black uppercase tracking-wider transition-all active:scale-95"
                        >
                          Punch Out
                        </button>
                      ) : record.status === 'Absent' ? (
                        <button 
                          onClick={() => handlePunchInOut(record.employeeId, 'punch_in')}
                          className="px-3 py-1 bg-warning/20 text-warning border border-warning/20 hover:bg-warning hover:text-white rounded-sm text-xs font-black uppercase tracking-wider transition-all active:scale-95"
                        >
                          Punch In
                        </button>
                      ) : (
                        <button className="px-3 py-1 bg-surface-variant text-text-secondary border border-border rounded-sm text-xs font-black uppercase tracking-wider" disabled>
                          Completed
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {attendanceData.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-text-secondary">
                      No attendance records found for today
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <button 
          onClick={onClose}
          className="px-6 py-3 bg-surface-variant hover:bg-surface-variant/80 border border-border text-text-primary rounded-sm text-xs font-black uppercase tracking-wider transition-all active:scale-95"
        >
          Close
        </button>
        <button 
          onClick={onBulkDisburse}
          disabled={isDisbursing}
          className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-sm text-xs font-black uppercase tracking-wider transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDisbursing ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Wallet size={16} />
              Execute Disbursement
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default PayrollAttendanceModal;
