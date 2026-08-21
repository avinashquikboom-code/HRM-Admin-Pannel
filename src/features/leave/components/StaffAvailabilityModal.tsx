"use client";

import { useState } from 'react';
import { 
  Check, 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar, 
  Users, 
  Briefcase, 
  CalendarOff, 
  PartyPopper,
  ShieldAlert,
  Loader2
} from 'lucide-react';
import Modal from '@/components/Modal';
import { StaffAvailabilityCheckResponse, StaffMemberItem } from '@/services/leaveService';
import { cn } from '@/utils/cn';

interface StaffAvailabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  availabilityData: StaffAvailabilityCheckResponse['data'] | null;
  isLoading: boolean;
  onApprove: (remarks: string) => Promise<void>;
  onReject: (remarks: string) => Promise<void>;
}

export default function StaffAvailabilityModal({
  isOpen,
  onClose,
  availabilityData,
  isLoading,
  onApprove,
  onReject,
}: StaffAvailabilityModalProps) {
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);

  // Metric card employee list modal state
  const [metricModal, setMetricModal] = useState<{
    isOpen: boolean;
    title: string;
    count: number;
    employees: StaffMemberItem[];
    emptyMessage?: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleAction = async (action: 'approve' | 'reject') => {
    try {
      setIsSubmitting(true);
      setActionType(action);
      if (action === 'approve') {
        await onApprove(remarks);
      } else {
        await onReject(remarks);
      }
      setRemarks('');
      onClose();
    } catch (err) {
      console.error('Error submitting leave decision:', err);
    } finally {
      setIsSubmitting(false);
      setActionType(null);
    }
  };

  const employee = availabilityData?.employee;
  const leave = availabilityData?.leave;
  const schedule = availabilityData?.scheduleContext;
  const availability = availabilityData?.availability;

  const isCritical = availability?.warningLevel === 'CRITICAL';
  const isModerate = availability?.warningLevel === 'MODERATE';

  const openMetricModal = (
    title: string,
    count: number,
    employees: StaffMemberItem[],
    emptyMessage: string
  ) => {
    setMetricModal({
      isOpen: true,
      title,
      count,
      employees,
      emptyMessage,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Staff Availability Review & Approval"
      maxWidth="max-w-4xl"
    >
      {isLoading || !availabilityData ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-9 h-9 text-primary animate-spin" />
          <p className="text-xs font-bold uppercase tracking-widest text-text-secondary animate-pulse">
            Analyzing store & department availability...
          </p>
        </div>
      ) : (
        <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
          {/* Top Warning Banner */}
          <div
            className={cn(
              "p-4 rounded-lg border flex items-start gap-3.5 transition-all",
              isCritical
                ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                : isModerate
                ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
            )}
          >
            {isCritical ? (
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            ) : isModerate ? (
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-black uppercase tracking-wider">
                  {isCritical
                    ? "Critical Staffing Warning"
                    : isModerate
                    ? "Moderate Staffing Alert"
                    : "Optimal Staffing Coverage"}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest bg-surface/50 border border-current/20">
                  {availability?.availabilityPercentage}% Available
                </span>
              </div>
              <p className="text-xs font-medium mt-1 leading-relaxed text-text-primary/90">
                {availability?.warningMessage}
              </p>
            </div>
          </div>

          {/* Section 1: Employee & Leave Profile Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Employee Details */}
            <div className="bg-surface-variant/40 border border-border/70 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 text-primary text-xs font-black uppercase tracking-wider">
                <Briefcase className="w-4 h-4" />
                <span>Employee Details</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-text-secondary block">Employee Name</span>
                  <span className="font-bold text-text-primary">{employee?.name}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-text-secondary block">Employee Code</span>
                  <span className="font-mono font-bold text-primary">{employee?.employeeCode}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-text-secondary block">Department</span>
                  <span className="font-semibold text-text-primary">{employee?.department}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-text-secondary block">Store / Branch</span>
                  <span className="font-semibold text-text-primary">{employee?.store}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-text-secondary block">Designation</span>
                  <span className="font-semibold text-text-primary">{employee?.designation}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-text-secondary block">Contact</span>
                  <span className="font-semibold text-text-primary">{employee?.phone || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Leave Details */}
            <div className="bg-surface-variant/40 border border-border/70 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 text-primary text-xs font-black uppercase tracking-wider">
                <Calendar className="w-4 h-4" />
                <span>Requested Leave Scope</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-text-secondary block">Leave Type</span>
                  <span className="font-bold text-text-primary">{leave?.type}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-text-secondary block">Current Status</span>
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {leave?.status}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-text-secondary block">Leave Duration</span>
                  <span className="font-bold text-text-primary">
                    {leave?.startDate} → {leave?.endDate}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-text-secondary block">Total Calendar Days</span>
                  <span className="font-mono font-bold text-primary">{leave?.totalDays} Day(s)</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] uppercase font-bold text-text-secondary block">Reason</span>
                  <p className="font-medium text-text-secondary bg-surface/50 p-2 rounded border border-border/40 text-[11px] italic">
                    "{leave?.reason || 'No reason specified'}"
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Store Staff Coverage Metrics */}
          <div className="bg-surface-variant/20 border border-border/60 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-text-primary">
                <Users className="w-4 h-4 text-primary" />
                <span>Store & Department Availability Metrics</span>
              </div>
              <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">
                Target: {employee?.store}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-surface/70 border border-border/60 p-3 rounded text-center">
                <span className="text-[9px] font-black uppercase tracking-wider text-text-secondary block">Total Store Staff</span>
                <button
                  type="button"
                  onClick={() => openMetricModal(
                    "Total Store Staff",
                    availability?.totalStoreStaff ?? 0,
                    availability?.storeStaffList ?? [],
                    "No staff members found for this store."
                  )}
                  className="text-xl font-black text-text-primary mt-1 block font-mono mx-auto cursor-pointer hover:underline hover:text-primary active:scale-95 transition-all"
                  title="Click to view Total Store Staff list"
                >
                  {availability?.totalStoreStaff}
                </button>
              </div>
              <div className="bg-surface/70 border border-border/60 p-3 rounded text-center">
                <span className="text-[9px] font-black uppercase tracking-wider text-text-secondary block">Dept Staff</span>
                <button
                  type="button"
                  onClick={() => openMetricModal(
                    "Department Staff",
                    availability?.totalDeptStaff ?? 0,
                    availability?.deptStaffList ?? [],
                    "No staff members found for this department."
                  )}
                  className="text-xl font-black text-text-primary mt-1 block font-mono mx-auto cursor-pointer hover:underline hover:text-primary active:scale-95 transition-all"
                  title="Click to view Department Staff list"
                >
                  {availability?.totalDeptStaff}
                </button>
              </div>
              <div className="bg-surface/70 border border-border/60 p-3 rounded text-center">
                <span className="text-[9px] font-black uppercase tracking-wider text-text-secondary block">Coworkers on Leave</span>
                <button
                  type="button"
                  onClick={() => openMetricModal(
                    "Coworkers on Leave",
                    availability?.onLeaveCount ?? 0,
                    (availability?.onLeaveStaffList && availability.onLeaveStaffList.length > 0)
                      ? availability.onLeaveStaffList
                      : (availability?.otherEmployeesOnLeave || []).map((e) => ({
                          id: e.id,
                          employeeId: e.employeeCode || `EMP-${e.employeeId}`,
                          employeeCode: e.employeeCode || `EMP-${e.employeeId}`,
                          employeeName: e.employeeName,
                          department: e.department,
                          designation: e.designation,
                          leaveType: e.leaveType,
                          startDate: e.startDate,
                          endDate: e.endDate,
                        })),
                    "No employees are currently on leave."
                  )}
                  className={cn("text-xl font-black mt-1 block font-mono mx-auto cursor-pointer hover:underline active:scale-95 transition-all", (availability?.onLeaveCount ?? 0) > 0 ? "text-amber-400" : "text-emerald-400")}
                  title="Click to view Coworkers on Leave list"
                >
                  {availability?.onLeaveCount}
                </button>
              </div>
              <div className="bg-surface/70 border border-border/60 p-3 rounded text-center">
                <span className="text-[9px] font-black uppercase tracking-wider text-text-secondary block">Remaining Available</span>
                <button
                  type="button"
                  onClick={() => openMetricModal(
                    "Remaining Available",
                    availability?.availableStaffCount ?? 0,
                    availability?.availableStaffList ?? [],
                    "No available employees found."
                  )}
                  className={cn("text-xl font-black mt-1 block font-mono mx-auto cursor-pointer hover:underline active:scale-95 transition-all", isCritical ? "text-rose-400" : isModerate ? "text-amber-400" : "text-emerald-400")}
                  title="Click to view Remaining Available Staff list"
                >
                  {availability?.availableStaffCount}
                </button>
              </div>
            </div>
          </div>

          {/* Section 3: Schedule Breakdown (Weekly Off & Holidays) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Weekly Off Days */}
            <div className="bg-surface-variant/20 border border-border/60 rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-text-secondary">
                <CalendarOff className="w-3.5 h-3.5 text-text-secondary" />
                <span className="uppercase tracking-wider text-[10px] font-black">Weekly Offs in Leave Window</span>
                <span className="ml-auto font-mono text-[10px] font-bold text-text-secondary">
                  ({schedule?.weeklyOffCount || 0})
                </span>
              </div>
              {schedule?.weeklyOffDays && schedule.weeklyOffDays.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {schedule.weeklyOffDays.map((wo, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-surface border border-border rounded text-[10px] font-mono text-text-secondary">
                      {wo.date} ({wo.dayName})
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-text-secondary/70 italic">No scheduled weekly off within selected dates.</p>
              )}
            </div>

            {/* Holidays */}
            <div className="bg-surface-variant/20 border border-border/60 rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-text-secondary">
                <PartyPopper className="w-3.5 h-3.5 text-amber-400" />
                <span className="uppercase tracking-wider text-[10px] font-black">Company / Public Holidays</span>
                <span className="ml-auto font-mono text-[10px] font-bold text-text-secondary">
                  ({schedule?.holidayCount || 0})
                </span>
              </div>
              {schedule?.holidays && schedule.holidays.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {schedule.holidays.map((h) => (
                    <span key={h.id} className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded text-[10px] font-semibold text-amber-300">
                      {h.name} ({h.date})
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-text-secondary/70 italic">No public holidays in this date range.</p>
              )}
            </div>
          </div>

          {/* Section 4: Other Employees on Approved Leave */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">
                Other Employees on Leave During Overlapping Window ({availability?.otherEmployeesOnLeave.length || 0})
              </span>
            </div>

            {availability?.otherEmployeesOnLeave && availability.otherEmployeesOnLeave.length > 0 ? (
              <div className="border border-border/60 rounded-lg overflow-hidden max-h-40 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-variant/80 text-[10px] font-black uppercase tracking-wider text-text-secondary border-b border-border/60">
                    <tr>
                      <th className="py-2.5 px-3">Employee</th>
                      <th className="py-2.5 px-3">Department</th>
                      <th className="py-2.5 px-3">Leave Type</th>
                      <th className="py-2.5 px-3">Dates</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40 font-medium text-text-primary">
                    {availability.otherEmployeesOnLeave.map((other) => (
                      <tr key={other.id} className="hover:bg-surface-variant/30 transition-colors">
                        <td className="py-2 px-3">
                          <div className="font-bold">{other.employeeName}</div>
                          <div className="text-[10px] font-mono text-text-secondary">{other.employeeCode}</div>
                        </td>
                        <td className="py-2 px-3 text-text-secondary">{other.department}</td>
                        <td className="py-2 px-3">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-surface border border-border text-text-primary">
                            {other.leaveType}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-mono text-[11px] text-text-secondary">
                          {other.startDate} → {other.endDate}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4 bg-surface-variant/10 border border-dashed border-border/60 rounded-lg text-center">
                <Check className="w-4 h-4 text-emerald-400 inline mr-1.5" />
                <span className="text-xs font-semibold text-text-secondary">
                  No other employees in this store/branch are on approved leave for these dates.
                </span>
              </div>
            )}
          </div>

          {/* Section 5: Reviewer Remarks */}
          <div className="space-y-1.5 pt-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">
              Approval Remarks / Staffing Justification Note (Optional)
            </label>
            <textarea
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Add optional notes for the employee or internal audit record..."
              className="w-full px-4 py-3 bg-surface-variant/50 border border-border focus:border-primary/40 rounded-sm outline-none text-xs text-text-primary placeholder:text-text-secondary/50 transition-all"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-3 border-t border-border/40">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="px-5 py-3 bg-surface-variant/60 border border-border rounded-sm text-xs font-bold uppercase tracking-wider text-text-secondary hover:bg-surface-variant transition-all cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleAction('reject')}
              className="flex-1 py-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500 hover:text-white rounded-sm text-xs font-black uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting && actionType === 'reject' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <X className="w-4 h-4" />
              )}
              Reject Leave
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleAction('approve')}
              className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-sm text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting && actionType === 'approve' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              Confirm & Approve Leave
            </button>
          </div>
        </div>
      )}

      {/* Metric Breakdown Employee List Modal */}
      {metricModal && (
        <Modal
          isOpen={metricModal.isOpen}
          onClose={() => setMetricModal(null)}
          title={`${metricModal.title} (${metricModal.count})`}
        >
          <div className="space-y-4 max-h-[65vh] flex flex-col">
            <div className="flex items-center justify-between text-xs text-text-secondary pb-2 border-b border-border">
              <span className="font-bold uppercase tracking-wider text-[10px]">
                Target: <strong className="text-text-primary font-mono">{employee?.store}</strong>
              </span>
              <span className="font-bold text-[10px] uppercase tracking-wider text-primary">
                {metricModal.count} {metricModal.count === 1 ? 'Employee' : 'Employees'}
              </span>
            </div>

            {metricModal.employees && metricModal.employees.length > 0 ? (
              <div className="overflow-y-auto border border-border rounded divide-y divide-border/50 max-h-80">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-surface-variant/50 sticky top-0 border-b border-border">
                    <tr>
                      <th className="py-2.5 px-3 text-[10px] font-black uppercase text-text-secondary">Employee Name</th>
                      <th className="py-2.5 px-3 text-[10px] font-black uppercase text-text-secondary">Employee Code</th>
                      <th className="py-2.5 px-3 text-[10px] font-black uppercase text-text-secondary">Department</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40 font-medium">
                    {metricModal.employees.map((emp, idx) => (
                      <tr key={emp.id || idx} className="hover:bg-surface-variant/20 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-text-primary">
                          {emp.employeeName}
                          {emp.designation && (
                            <span className="block text-[10px] font-normal text-text-secondary">
                              {emp.designation}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-primary text-xs">
                          {emp.employeeCode || emp.employeeId || '—'}
                        </td>
                        <td className="py-2.5 px-3 text-text-secondary text-xs">
                          {emp.department || '—'}
                          {emp.leaveType && (
                            <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              {emp.leaveType}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-xs font-semibold text-text-secondary bg-surface-variant/20 border border-dashed border-border rounded">
                {metricModal.emptyMessage || "No employees found."}
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setMetricModal(null)}
                className="px-4 py-2 bg-surface-variant text-text-secondary hover:text-text-primary rounded text-xs font-bold transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </Modal>
  );
}
