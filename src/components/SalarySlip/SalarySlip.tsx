import React from 'react';
import { Wallet, Printer, Download, Calendar, ArrowUpRight, ArrowDownRight, Award } from 'lucide-react';

export interface SalarySlipProps {
  selectedSlip: any;
  slipAttendance?: any;
  slipData?: any;
  monthLabel: string;
  monthShort: string;
  onPrint?: () => void;
}

export const SalarySlip: React.FC<SalarySlipProps> = ({
  selectedSlip,
  slipAttendance,
  slipData,
  monthLabel,
  monthShort,
  onPrint,
}) => {
  if (!selectedSlip) return null;

  // Extract or fallback earnings
  const earnings = selectedSlip.earnings || slipData?.earnings || {};
  const baseSalary = earnings.baseSalary ?? selectedSlip.baseSalary ?? 10000;
  const basicSalary = earnings.basicSalary ?? baseSalary;
  const hra = earnings.hra ?? 2000;
  const medical = earnings.medical ?? 500;
  const travel = earnings.travel ?? 1000;
  const special = earnings.special ?? 0;
  const bonus = earnings.bonus ?? 0;
  const incentive = earnings.incentive ?? 0;
  const commission = earnings.commission ?? selectedSlip.commissionEarned ?? selectedSlip.commission ?? 0;

  // Gross Earnings (excluding reimbursements)
  const grossTotal = earnings.grossSalary ?? (basicSalary + hra + medical + travel + special + bonus + incentive + commission);

  // Extract or fallback reimbursements / expenses
  const expenseReimbursement = selectedSlip.expenseReimbursement ?? selectedSlip.approvedExpenses ?? earnings.expenseReimbursement ?? slipData?.expenseReimbursement ?? 0;
  const expensesByCategory: Array<{ category: string; amount: number }> =
    selectedSlip.expenses ||
    selectedSlip.expensesByCategory ||
    earnings.expenses ||
    earnings.expensesByCategory ||
    slipData?.expenses ||
    slipData?.expensesByCategory ||
    (earnings.expenseCategories
      ? Object.entries(earnings.expenseCategories).map(([category, amount]) => ({ category, amount: Number(amount) }))
      : expenseReimbursement > 0
      ? [{ category: 'Approved Expenses', amount: expenseReimbursement }]
      : []);
  const totalReimbursements = expensesByCategory.reduce((sum, e) => sum + (Number(e.amount) || 0), 0) || expenseReimbursement;

  // Extract or fallback deductions
  const deductions = selectedSlip.deductions || slipData?.deductions || {};
  const pf = deductions.pf ?? selectedSlip.pf ?? 0;
  const esic = deductions.esic ?? selectedSlip.esic ?? 0;
  const halfDayDeduction = deductions.halfDayDeduction ?? selectedSlip.halfDayDeduction ?? 0;
  const leaveDeduction = deductions.leaveDeduction ?? selectedSlip.leaveDeduction ?? 0;
  const advanceDeduction = selectedSlip.advanceDeduction ?? deductions.advanceDeduction ?? selectedSlip.advanceSalary ?? slipData?.advanceDeduction ?? 0;
  const itemizedDeductions = pf + esic + halfDayDeduction + leaveDeduction + advanceDeduction;
  const rawTotal = typeof deductions === 'number' ? deductions : (selectedSlip.deductionsTotal ?? selectedSlip.deductions ?? deductions.totalDeductions);
  const otherDeductions = deductions.otherDeductions ?? (rawTotal !== undefined ? Math.max(0, rawTotal - itemizedDeductions) : 0);
  const totalDeductions = typeof deductions === 'number' ? deductions : (deductions.totalDeductions ?? selectedSlip.deductionsTotal ?? selectedSlip.deductions ?? (itemizedDeductions + otherDeductions));

  // Net salary and Take-Home pay calculation
  const netSalary = Math.max(0, grossTotal - totalDeductions);
  const totalTakeHomePay = Math.round((netSalary + totalReimbursements) * 100) / 100;

  // Extract or fallback attendance details
  const details = selectedSlip.details || slipData?.details || {};
  const presentDays = details.presentDays ?? slipAttendance?.present ?? selectedSlip.presentDays ?? 20;
  const halfDays = details.halfDays ?? slipAttendance?.halfDay ?? selectedSlip.halfDays ?? 0;
  const leaveDays = details.leaveDays ?? slipAttendance?.leave ?? selectedSlip.leaveDays ?? 0;
  const workingDays = details.workingDays ?? slipAttendance?.workingDays ?? selectedSlip.workingDays ?? 26;
  const commissionRate = details.commissionRate ?? selectedSlip.commissionPercentage ?? 1.0;
  const salaryAdvanceLimit = details.salaryAdvanceLimit ?? 25000;
  const salaryAdvanceUsed = details.salaryAdvanceUsed ?? selectedSlip.salaryAdvanceUsed ?? 0;

  // Metadata helpers
  const employeeName = selectedSlip.name || selectedSlip.employeeName;
  const employeeCode = selectedSlip.employeeCode;
  const designation = selectedSlip.designation || 'Staff';
  const departmentName = selectedSlip.departmentName || 'General';
  const officeName = selectedSlip.officeName || 'HQ';

  return (
    <div className="border border-white/10 rounded-2xl overflow-hidden bg-slate-950/80 shadow-2xl print-bg-white print-border font-sans">
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          .print-bg-white {
            background-color: #ffffff !important;
            background-image: none !important;
          }
          .print-text-dark {
            color: #0f172a !important;
          }
          .print-text-muted {
            color: #475569 !important;
          }
          .print-border {
            border-color: #e2e8f0 !important;
          }
          .print-divide > * + * {
            border-color: #cbd5e1 !important;
          }
          .print-hide {
            display: none !important;
          }
        }
      `}</style>

      {/* Action Bar (Download PDF / Print) */}
      <div className="bg-surface-variant/40 dark:bg-slate-900/80 px-8 py-4 border-b border-border/50 dark:border-white/10 flex items-center justify-between print-hide">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          <span className="text-xs font-black uppercase tracking-wider text-text-primary">
            {selectedSlip.name || selectedSlip.employeeName} — {monthLabel}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {onPrint && (
            <button
              type="button"
              onClick={onPrint}
              className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Download PDF / Print
            </button>
          )}
        </div>
      </div>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-primary/25 via-teal-500/15 to-emerald-500/10 border-b border-white/10 px-8 py-6 flex items-center justify-between print-bg-white print-border">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30">
            <Wallet size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight print-text-dark">
              {selectedSlip.name || selectedSlip.employeeName}
            </h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest print-text-muted mt-0.5">
              {selectedSlip.designation || 'Staff'} · Code: <span className="font-mono text-primary">{selectedSlip.employeeCode}</span>
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="px-3 py-1 bg-teal-500/20 text-teal-300 text-xs font-black rounded-full uppercase tracking-wider border border-teal-500/30">
            {monthLabel} Salary Slip
          </span>
          <p className="text-[11px] font-mono text-slate-400 mt-1.5 print-text-muted">
            DOC: QB-PAY-{selectedSlip.employeeCode}-{monthShort}
          </p>
        </div>
      </div>

      <div className="p-8 space-y-6">
        
        {/* EARNINGS & DEDUCTIONS Side by Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* EARNINGS Section */}
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl overflow-hidden print-border">
            <div className="bg-emerald-500/10 px-6 py-4 border-b border-emerald-500/20 flex items-center justify-between">
              <h4 className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                EARNINGS
              </h4>
              <span className="text-[10px] font-bold text-emerald-400/80 uppercase">Addition Breakdown</span>
            </div>
            <div className="p-6 space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center text-slate-300 print-text-dark">
                <span>Base Salary</span>
                <span className="font-bold text-white">₹{baseSalary.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center text-slate-300 print-text-dark">
                <span>HRA</span>
                <span className="font-bold text-white">₹{hra.toLocaleString('en-IN')}</span>
              </div>
              {medical > 0 && (
                <div className="flex justify-between items-center text-slate-300 print-text-dark">
                  <span>Medical Allowance</span>
                  <span className="font-bold text-white">₹{medical.toLocaleString('en-IN')}</span>
                </div>
              )}
              {travel > 0 && (
                <div className="flex justify-between items-center text-slate-300 print-text-dark">
                  <span>Travel Allowance</span>
                  <span className="font-bold text-white">₹{travel.toLocaleString('en-IN')}</span>
                </div>
              )}
              {special > 0 && (
                <div className="flex justify-between items-center text-slate-300 print-text-dark">
                  <span>Special Allowance</span>
                  <span className="font-bold text-white">₹{special.toLocaleString('en-IN')}</span>
                </div>
              )}
              {bonus > 0 && (
                <div className="flex justify-between items-center text-slate-300 print-text-dark">
                  <span>Bonus</span>
                  <span className="font-bold text-white">₹{bonus.toLocaleString('en-IN')}</span>
                </div>
              )}
              {commission > 0 && (
                <div className="flex justify-between items-center text-emerald-400 font-bold">
                  <span>Commission ({monthLabel} sales)</span>
                  <span>₹{commission.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="pt-3 border-t border-emerald-500/20 flex justify-between items-center text-sm font-black text-emerald-400">
                <span className="uppercase tracking-wider">GROSS EARNINGS</span>
                <span>₹{grossTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* DEDUCTIONS Section */}
          <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl overflow-hidden print-border">
            <div className="bg-rose-500/10 px-6 py-4 border-b border-rose-500/20 flex items-center justify-between">
              <h4 className="text-xs font-black text-rose-400 uppercase tracking-widest flex items-center gap-2">
                <ArrowDownRight className="w-4 h-4 text-rose-400" />
                DEDUCTIONS
              </h4>
              <span className="text-[10px] font-bold text-rose-400/80 uppercase">Subtractions</span>
            </div>
            <div className="p-6 space-y-3 font-mono text-xs">
              {pf > 0 && (
                <div className="flex justify-between items-center text-slate-300 print-text-dark">
                  <span>Provident Fund (PF)</span>
                  <span className="font-bold text-rose-400">₹({pf.toLocaleString('en-IN')})</span>
                </div>
              )}
              {esic > 0 && (
                <div className="flex justify-between items-center text-slate-300 print-text-dark">
                  <span>ESIC / Professional Tax</span>
                  <span className="font-bold text-rose-400">₹({esic.toLocaleString('en-IN')})</span>
                </div>
              )}
              {halfDayDeduction > 0 && (
                <div className="flex justify-between items-center text-slate-300 print-text-dark">
                  <span>Half-day ({halfDays} half days)</span>
                  <span className="font-bold text-rose-400">₹({halfDayDeduction.toLocaleString('en-IN')})</span>
                </div>
              )}
              {leaveDeduction > 0 && (
                <div className="flex justify-between items-center text-slate-300 print-text-dark">
                  <span>Leave ({leaveDays} unpaid leaves)</span>
                  <span className="font-bold text-rose-400">₹({leaveDeduction.toLocaleString('en-IN')})</span>
                </div>
              )}
              {advanceDeduction > 0 ? (
                <div className="flex justify-between items-center text-rose-300 font-bold print-text-dark">
                  <span>Advance Salary</span>
                  <span className="font-bold text-rose-400">₹({advanceDeduction.toLocaleString('en-IN')})</span>
                </div>
              ) : (
                <div className="flex justify-between items-center text-slate-400 print-text-muted">
                  <span>Advance Salary</span>
                  <span>₹0</span>
                </div>
              )}
              {otherDeductions > 0 && (
                <div className="flex justify-between items-center text-slate-300 print-text-dark">
                  <span>Other Deductions</span>
                  <span className="font-bold text-rose-400">₹({otherDeductions.toLocaleString('en-IN')})</span>
                </div>
              )}
              <div className="pt-3 border-t border-rose-500/20 flex justify-between items-center text-sm font-black text-rose-400">
                <span className="uppercase tracking-wider">TOTAL DEDUCTIONS</span>
                <span>₹({totalDeductions.toLocaleString('en-IN')})</span>
              </div>
            </div>
          </div>

        </div>

        {/* REIMBURSEMENTS / EXPENSES Section */}
        {totalReimbursements > 0 && (
          <div className="bg-teal-500/5 border border-teal-500/20 rounded-2xl overflow-hidden print-border">
            <div className="bg-teal-500/10 px-6 py-4 border-b border-teal-500/20 flex items-center justify-between">
              <h4 className="text-xs font-black text-teal-400 uppercase tracking-widest flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4 text-teal-400" />
                REIMBURSEMENTS / EXPENSES
              </h4>
              <span className="text-[10px] font-bold text-teal-400/80 uppercase">Eligible Claims</span>
            </div>
            <div className="p-6 space-y-3 font-mono text-xs">
              {expensesByCategory.length > 0 ? (
                expensesByCategory.map((exp, idx) => (
                  <div key={idx} className="flex justify-between items-center text-slate-300 print-text-dark">
                    <span>{exp.category} Expense</span>
                    <span className="font-bold text-white">₹{exp.amount.toLocaleString('en-IN')}</span>
                  </div>
                ))
              ) : (
                <div className="flex justify-between items-center text-slate-300 print-text-dark">
                  <span>Approved Expenses ({monthLabel})</span>
                  <span className="font-bold text-white">₹{totalReimbursements.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="pt-3 border-t border-teal-500/20 flex justify-between items-center text-sm font-black text-teal-400">
                <span className="uppercase tracking-wider">TOTAL REIMBURSEMENTS</span>
                <span>₹{totalReimbursements.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        )}

        {/* ATTENDANCE & DETAILS Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* ATTENDANCE Section */}
          <div className="bg-surface-variant/30 dark:bg-white/[0.03] border border-border/50 dark:border-white/10 rounded-2xl p-6">
            <h4 className="text-xs font-black text-slate-300 uppercase tracking-widest mb-4">
              ATTENDANCE SUMMARY
            </h4>
            <div className="grid grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-2.5 bg-surface-variant/60 dark:bg-white/[0.04] rounded-xl">
                <span className="text-[9px] text-slate-400 block font-sans uppercase">Present</span>
                <span className="text-sm font-black text-emerald-400">{selectedSlip.presentDays ?? presentDays}</span>
              </div>
              <div className="p-2.5 bg-surface-variant/60 dark:bg-white/[0.04] rounded-xl">
                <span className="text-[9px] text-slate-400 block font-sans uppercase">Half Days</span>
                <span className="text-sm font-black text-amber-400">{selectedSlip.halfDays ?? halfDays}</span>
              </div>
              <div className="p-2.5 bg-surface-variant/60 dark:bg-white/[0.04] rounded-xl">
                <span className="text-[9px] text-slate-400 block font-sans uppercase">Absent</span>
                <span className="text-sm font-black text-rose-400">{selectedSlip.absentDays ?? 0}</span>
              </div>
              <div className="p-2.5 bg-surface-variant/60 dark:bg-white/[0.04] rounded-xl">
                <span className="text-[9px] text-slate-400 block font-sans uppercase">Paid Leave</span>
                <span className="text-sm font-black text-blue-400">{selectedSlip.paidLeaveDays ?? 0}</span>
              </div>
              <div className="p-2.5 bg-surface-variant/60 dark:bg-white/[0.04] rounded-xl">
                <span className="text-[9px] text-slate-400 block font-sans uppercase">Unpaid Leave</span>
                <span className="text-sm font-black text-purple-400">{selectedSlip.unpaidLeaveDays ?? 0}</span>
              </div>
              <div className="p-2.5 bg-surface-variant/60 dark:bg-white/[0.04] rounded-xl">
                <span className="text-[9px] text-slate-400 block font-sans uppercase">Holidays</span>
                <span className="text-sm font-black text-teal-400">{selectedSlip.holidayCount ?? 0}</span>
              </div>
              <div className="p-2.5 bg-surface-variant/60 dark:bg-white/[0.04] rounded-xl">
                <span className="text-[9px] text-slate-400 block font-sans uppercase">Weekly Offs</span>
                <span className="text-sm font-black text-indigo-400">{selectedSlip.weeklyOffCount ?? 0}</span>
              </div>
              <div className="p-2.5 bg-surface-variant/60 dark:bg-white/[0.04] rounded-xl">
                <span className="text-[9px] text-slate-400 block font-sans uppercase">Holiday Wk.</span>
                <span className="text-sm font-black text-emerald-400">{selectedSlip.holidayWorkedCount ?? 0}</span>
              </div>
              <div className="p-2.5 bg-surface-variant/60 dark:bg-white/[0.04] rounded-xl">
                <span className="text-[9px] text-slate-400 block font-sans uppercase">Wk. Off Wk.</span>
                <span className="text-sm font-black text-emerald-400">{selectedSlip.weeklyOffWorkedCount ?? 0}</span>
              </div>
            </div>
          </div>

          {/* DETAILS Section */}
          <div className="bg-surface-variant/30 dark:bg-white/[0.03] border border-border/50 dark:border-white/10 rounded-2xl p-6">
            <h4 className="text-xs font-black text-slate-300 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              GOVERNANCE DETAILS
            </h4>
            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center text-slate-300">
                <span className="font-sans text-slate-400">Commission Rate:</span>
                <span className="font-bold text-amber-400">{commissionRate}%</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="font-sans text-slate-400">Salary Advance Used:</span>
                <span className="font-bold text-white">
                  ₹{salaryAdvanceUsed.toLocaleString('en-IN')} / ₹{salaryAdvanceLimit.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-300 pt-2">
                <span className="font-sans text-slate-400">Payment Status:</span>
                <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-black rounded-full uppercase border border-emerald-500/30">
                  Approved & Disbursed
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* NET SALARY & TAKE-HOME Banner */}
        <div className="p-6 bg-gradient-to-r from-primary/30 via-teal-500/20 to-emerald-500/20 border border-primary/40 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-primary block">
              FINAL TAKE-HOME PAY
            </span>
            <span className="text-xs text-slate-400 font-medium mt-0.5 block">
              Gross (₹{grossTotal.toLocaleString('en-IN')}) - Deductions (₹{totalDeductions.toLocaleString('en-IN')}) = Net (₹{netSalary.toLocaleString('en-IN')})
              {totalReimbursements > 0 && ` + Reimbursements (+₹${totalReimbursements.toLocaleString('en-IN')})`}
            </span>
          </div>
          <div className="text-right font-mono font-black text-3xl text-emerald-400">
            ₹{totalTakeHomePay.toLocaleString('en-IN')}
          </div>
        </div>

      </div>
    </div>
  );
};
