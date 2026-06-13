import React from 'react';
import { Wallet } from 'lucide-react';

export interface SalarySlipProps {
  selectedSlip: any;
  slipAttendance: any;
  slipData: any;
  monthLabel: string;
  monthShort: string;
}

export const SalarySlip: React.FC<SalarySlipProps> = ({
  selectedSlip,
  slipAttendance,
  slipData,
  monthLabel,
  monthShort,
}) => {
  if (!selectedSlip || !slipData) return null;

  const {
    basic = 0,
    hra = 0,
    ta = 0,
    special = 0,
    grossEarnings = 0,
    pf = 0,
    pt = 0,
    tds = 0,
    totalDeductions = 0,
    netPay = 0,
    yr = 0,
    mo = 0,
    netInWords = ''
  } = slipData;

  return (
    <div className="border border-white/10 rounded-sm overflow-hidden bg-slate-950/60">
      {/* Company Header */}
      <div className="bg-gradient-to-r from-primary/25 via-teal-500/15 to-emerald-500/10 border-b border-white/10 px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-sm bg-primary flex items-center justify-center">
            <Wallet size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">HRM</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Human Resources · Payroll Division</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Salary Slip</p>
          <p className="text-sm font-black text-primary mt-0.5">{monthLabel}</p>
          <p className="text-[10px] font-mono text-slate-500 mt-1">
            DOC: QB-PAY-{selectedSlip.employeeCode}-{yr}{String(mo).padStart(2, '0')}
          </p>
        </div>
      </div>

      <div className="p-8 space-y-6">

        {/* Employee Info Grid */}
        <div className="grid grid-cols-2 gap-x-12 gap-y-4 border border-white/8 rounded-sm p-6">
          {([
            ['Employee Name',   selectedSlip.name],
            ['Employee Code',   selectedSlip.employeeCode],
            ['Designation',     selectedSlip.designation],
            ['Department',      selectedSlip.department],
            ['Office / Branch', selectedSlip.office],
            ['Pay Period',      monthLabel],
          ] as [string, string][]).map(([label, value]) => (
            <div key={label} className="flex flex-col gap-0.5">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
              <span className="text-sm font-bold text-white">{value}</span>
            </div>
          ))}
        </div>

        {/* Attendance Details Summary — always visible, ?? 0 fallback until data loads */}
        <div className="border border-white/10 rounded-sm overflow-hidden">
          <div className="grid grid-cols-6 divide-x divide-white/10">
            {[
              { label: 'Working Days', value: slipAttendance?.workingDays ?? 0, numColor: 'text-slate-100' },
              { label: 'Present',      value: slipAttendance?.present     ?? 0, numColor: 'text-emerald-400' },
              { label: 'Absent',       value: slipAttendance?.absent      ?? 0, numColor: 'text-rose-400' },
              { label: 'Half Day',     value: slipAttendance?.halfDay     ?? 0, numColor: 'text-blue-400' },
              { label: 'Late',         value: slipAttendance?.late        ?? 0, numColor: 'text-amber-400' },
              { label: 'Leave',        value: slipAttendance?.leave       ?? 0, numColor: 'text-purple-400' },
            ].map(({ label, value, numColor }) => (
              <div key={label} className="flex flex-col items-center justify-center py-5 px-3 bg-white/3 hover:bg-white/6 transition-colors">
                <span className={`text-2xl font-black font-mono leading-none ${numColor}`}>{value}</span>
                <span className="text-[10px] font-bold text-slate-400 mt-2 text-center tracking-wide">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Earnings & Deductions side-by-side */}
        <div className="grid grid-cols-2 gap-6">

          {/* Earnings */}
          <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-sm overflow-hidden">
            <div className="bg-emerald-500/10 px-5 py-3 border-b border-emerald-500/15">
              <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Earnings</h4>
            </div>
            <div className="divide-y divide-white/5">
              {([
                ['Basic Salary',              basic],
                ['House Rent Allowance (HRA)', hra],
                ['Transport Allowance (TA)',   ta],
                ['Special Allowance',          special],
              ] as [string, number][]).map(([label, amt]) => (
                <div key={label} className="flex justify-between items-center px-5 py-3">
                  <span className="text-xs font-medium text-slate-400">{label}</span>
                  <span className="text-xs font-black text-white font-mono">₹ {amt.toLocaleString('en-IN')}</span>
                </div>
              ))}
              <div className="flex justify-between items-center px-5 py-3 bg-emerald-500/10">
                <span className="text-xs font-black text-emerald-400 uppercase tracking-wider">Gross Earnings</span>
                <span className="text-sm font-black text-emerald-400 font-mono">₹ {grossEarnings.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Deductions */}
          <div className="bg-rose-500/5 border border-rose-500/15 rounded-sm overflow-hidden">
            <div className="bg-rose-500/10 px-5 py-3 border-b border-rose-500/15">
              <h4 className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Deductions</h4>
            </div>
            <div className="divide-y divide-white/5">
              {([
                ['Provident Fund (EPF 12%)', pf],
                ['Professional Tax (PT)',    pt],
                ['TDS / Income Tax',         tds],
              ] as [string, number][]).map(([label, amt]) => (
                <div key={label} className="flex justify-between items-center px-5 py-3">
                  <span className="text-xs font-medium text-slate-400">{label}</span>
                  <span className="text-xs font-black text-white font-mono">₹ {amt.toLocaleString('en-IN')}</span>
                </div>
              ))}
              <div className="flex justify-between items-center px-5 py-3 bg-rose-500/10">
                <span className="text-xs font-black text-rose-400 uppercase tracking-wider">Total Deductions</span>
                <span className="text-sm font-black text-rose-400 font-mono">₹ {totalDeductions.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Net Pay Banner */}
        <div className="bg-gradient-to-r from-primary/20 to-teal-500/10 border border-primary/25 rounded-sm px-7 py-5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Net Payable Amount</p>
            <p className="text-3xl font-black text-primary mt-1 font-mono">₹ {netPay.toLocaleString('en-IN')}</p>
            <p className="text-[10px] font-medium text-slate-400 mt-1 italic">{netInWords}</p>
          </div>
          <div className="text-right">
            <span className="px-3 py-1.5 bg-success/15 text-success text-[10px] font-black rounded-full uppercase border border-success/25">Approved</span>
            <p className="text-[10px] font-mono text-slate-500 mt-2">Paid via: Bank Transfer</p>
          </div>
        </div>

        {/* Signature lines */}
        <div className="grid grid-cols-2 gap-8 pt-4 border-t border-white/5">
          <div className="space-y-1">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Employee Acknowledgement</p>
            <div className="h-8 border-b border-dashed border-white/10" />
            <p className="text-[10px] text-slate-600">{selectedSlip.name} · {selectedSlip.employeeCode}</p>
          </div>
          <div className="space-y-1 text-right">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Authorised Signatory</p>
            <div className="h-8 border-b border-dashed border-white/10" />
            <p className="text-[10px] text-slate-600">HR Department · HRM</p>
          </div>
        </div>

        <p className="text-center text-[9px] text-slate-600 pt-2">
          This is a system-generated salary slip and does not require a physical signature.
        </p>
      </div>
    </div>
  );
};
